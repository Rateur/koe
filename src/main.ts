import './style.css'
import skill from '../plugins/koe/skills/koe/SKILL.md?raw'
import { facts, fill, pageLang, words, type Key, type Lang } from './lib/i18n'
import { PROMPT_COLS, parts, say, stripsHtml, type Part } from './lib/page'
import { claudeLink, escapeHtml, handoff, skillBody, wrapPrompt, type PromptLine } from './lib/prompt'
import type { createWorld } from './scene/world.js'

// The page is the truth (the words, the links, the prompt you can copy); the 3D tape is drawn behind it
// and lands on the page's own positions. Native scroll drives everything.

type World = Awaited<ReturnType<typeof createWorld>>

const $ = <T extends HTMLElement>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector)!
const all = <T extends HTMLElement>(selector: string, root: ParentNode = document) => [...root.querySelectorAll<T>(selector)]
const html = document.documentElement

// shortcut: the choice lives in the link (?lang=); remember it across visits if people ask for it.
const params = new URLSearchParams(location.search)
let lang: Lang = (params.get('lang') as Lang | null) ?? pageLang(navigator.languages)
if (!(lang in words)) lang = 'en'
const t = words[lang]
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)')
let reduced = reducedQuery.matches
const phone = matchMedia('(max-width: 760px)').matches

// Words: the build wrote the French (vite.config.ts); this writes the same places in English.
if (lang !== 'fr') {
  html.lang = lang
  const text = (key: string | undefined) => say(lang, key as Key)
  for (const el of all('[data-i18n]')) el.textContent = text(el.dataset.i18n)
  // Our own strings only, never anything a visitor typed.
  for (const el of all('[data-i18n-html]')) el.innerHTML = text(el.dataset.i18nHtml)
  for (const el of all('[data-i18n-content]')) el.setAttribute('content', text(el.dataset.i18nContent))
  for (const el of all('[data-i18n-label]')) el.setAttribute('aria-label', text(el.dataset.i18nLabel))
  for (const el of all<HTMLTextAreaElement>('[data-i18n-placeholder]')) el.placeholder = text(el.dataset.i18nPlaceholder)
  const built = parts(lang)
  for (const el of all('[data-part]')) el.innerHTML = built[el.dataset.part as Part]
}
const otherLang: Lang = lang === 'fr' ? 'en' : 'fr'
for (const link of all<HTMLAnchorElement>('.lang')) {
  link.href = `?lang=${otherLang}`
  link.hreflang = otherLang
}

// The prompt, as strips of tape: as many characters a line as the screen has room for.

const sheet = $('.sheet')
const strips = $('.strips')
const css = getComputedStyle(html)
let promptLines: PromptLine[] = []

function renderStrips() {
  const font = parseFloat(css.getPropertyValue('--strip-font')) || 12.4
  const ch = font * 0.6
  const box = sheet.parentElement!.getBoundingClientRect()
  const room = phone ? innerWidth - 32 - 22 : Math.min(innerWidth * 0.52, innerWidth - box.left - 120)
  const cols = Math.max(28, Math.min(phone ? 60 : PROMPT_COLS, Math.floor(room / ch) - 2))
  promptLines = wrapPrompt(t.prompt, cols)
  strips.innerHTML = stripsHtml(promptLines)
}
// The build's lines are as long as a computer screen allows. Until they fit this screen, the styles for pages
// without JavaScript keep them inside it; let them out earlier and they widen a phone's page, and the room measured with it.
renderStrips()
html.classList.add('js')

// Copying

// shortcut: execCommand is deprecated, but in-app browsers (TikTok, Instagram) often block the Clipboard API; drop it once they allow it.
function copyBySelection(text: string): boolean {
  const area = document.createElement('textarea')
  area.value = text
  area.readOnly = true
  area.style.cssText = 'position: fixed; top: 0; opacity: 0'
  document.body.append(area)
  area.select()
  area.setSelectionRange(0, text.length)
  const copied = document.execCommand('copy')
  area.remove()
  return copied
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return copyBySelection(text)
  }
}

for (const button of all<HTMLButtonElement>('[data-copy]')) {
  button.addEventListener('click', async () => {
    if (!(await copy(button.dataset.copy!))) return
    button.textContent = t.copiedShort
    setTimeout(() => (button.textContent = t.copy), 1600)
  })
}

const copyPrompt = $<HTMLButtonElement>('.copy-prompt')
copyPrompt.addEventListener('click', async () => {
  const copied = await copy(t.prompt)
  $('.copy-state').textContent = copied ? t.copiedPrompt : t.copyFailed
  if (!copied) return
  copyPrompt.textContent = t.copiedShort
  setTimeout(() => (copyPrompt.textContent = t.copyPrompt), 1600)
})

// Try it: the note goes to Claude, or to the clipboard, wrapped in Koe's instructions.

const body = skillBody(skill)
const note = $<HTMLTextAreaElement>('#note')
const tryStatus = $('#try-status')

// A plain link rather than window.open, so no popup blocker gets in the way; its target follows the note.
const open = $<HTMLAnchorElement>('#open')
const followNote = () => (open.href = claudeLink(handoff(body, note.value)))
note.addEventListener('input', () => {
  followNote()
  kick()
})
followNote()

function voiceNote(): string | null {
  const text = note.value.trim()
  if (!text) {
    tryStatus.textContent = t.empty
    note.focus()
  }
  return text || null
}

open.addEventListener('click', async (event) => {
  const text = voiceNote()
  if (!text) return event.preventDefault()
  // Started during the click, while the page still has focus; Claude opens next to it.
  tryStatus.textContent = (await copy(handoff(body, text))) ? t.copiedOpen : t.copyFailed
})

$('#copy-note').addEventListener('click', async () => {
  const text = voiceNote()
  if (text) tryStatus.textContent = (await copy(handoff(body, text))) ? t.copied : t.copyFailed
})

$('#sample').addEventListener('click', () => {
  note.value = t.sample
  note.dispatchEvent(new Event('input'))
  tryStatus.textContent = ''
  note.focus()
})

// Install: one tab per way in. Without JavaScript the three show one after the other.

const tabs = all<HTMLButtonElement>('[role="tab"]')
$('.tabs').hidden = false

function select(tab: HTMLButtonElement, focus = false) {
  for (const other of tabs) {
    const selected = other === tab
    other.setAttribute('aria-selected', String(selected))
    other.tabIndex = selected ? 0 : -1
    $(`#${other.getAttribute('aria-controls')}`).hidden = !selected
  }
  if (focus) tab.focus()
}

select(tabs[0])
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => select(tab))
  // Arrow keys, Home and End move between tabs, as screen readers expect.
  tab.addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (event.key === 'Home') select(tabs[0], true)
    else if (event.key === 'End') select(tabs[tabs.length - 1], true)
    else if (step) select(tabs[(i + step + tabs.length) % tabs.length], true)
    else return
    event.preventDefault()
  })
})

// The story: you talk, Koe strikes, Koe asks, Claude gets the frame.

const steps = all('.step')
const stage = $('.stage')
const flag = $('#flag')
const hudStep = $('[data-hud="step"]')
const hudStruck = $('[data-hud="struck"]')
const questions = all('.qs li')
const answer = $('.answer')
const callouts = $('.callouts')

// Labels drawn from points of the 3D tape: a hairline and a few words.
function callout(className: string, label: string) {
  const el = document.createElement('span')
  el.className = className
  el.innerHTML = `<i></i><span>${label}</span>`
  callouts.append(el)
  return el
}
const factEls = facts[lang].map(([, label], i) => callout('co up', `<b>${String(i + 1).padStart(2, '0')}</b>${escapeHtml(label)}`))
const checkEl = callout('co down check', escapeHtml(t.toCheck))
// The prompt's frame, drawn while the tape flies into it.
const ghost = document.createElement('div')
ghost.className = 'ghost'
ghost.style.cssText = 'position:absolute;left:0;top:0;border:1px solid var(--hair);opacity:0;transition:opacity .3s'
callouts.append(ghost)
const markCalls = all('.mark-call')

let lastStep = -1
function showStep(n: number) {
  if (n === lastStep) return
  lastStep = n
  steps.forEach((step, i) => step.classList.toggle('on', i + 1 === n))
  hudStep.textContent = n ? fill(t.stepCount, { n }) : ''
}

function storyDom(T: number) {
  stage.classList.toggle('done', T > 4.3)
  showStep(T < 0.55 ? 0 : T < 2 ? 1 : T < 3 ? 2 : T < 4 ? 3 : 4)
  stage.style.setProperty('--casl', (1 - Math.min(1, Math.max(0, (T - 1) / 3.4))).toFixed(3))
  questions.forEach((li, i) => {
    li.classList.toggle('typed', reduced ? T >= 3 : T >= 3.2 + i * 0.09)
    li.classList.toggle('past', !reduced && T >= 3.55)
  })
  answer.classList.toggle('typed', reduced ? T >= 3 : T >= 3.55)
}

// Scroll -> story

interface Slot {
  left: number
  docTop: number
  w: number
  h: number
}

const promptSection = $('#prompt')
const trySlot = $('.tape-slot')
const markSlot = $('.mark-slot')
const geom = {
  vw: 0,
  vh: 0,
  flagTop: 0,
  flagLen: 1,
  sheet: { left: 0, docTop: 0, width: 0, height: 0 },
  // where the sheet stops, from the top of the screen
  F: 40,
  lines: [] as (PromptLine & { rect: { x: number; y: number; w: number; h: number } })[],
  trySlot: { left: 0, docTop: 0, w: 0, h: 0 } as Slot,
  markSlot: { left: 0, docTop: 0, w: 0, h: 0 } as Slot,
  stripPx: 20,
  stripFont: 12.4,
}

function slot(el: HTMLElement, y: number): Slot {
  const r = el.getBoundingClientRect()
  return { left: r.left, docTop: r.top + y, w: r.width, h: r.height }
}

function measure() {
  const y = scrollY
  geom.vh = innerHeight
  geom.vw = innerWidth
  geom.flagTop = flag.offsetTop
  geom.flagLen = Math.max(1, flag.offsetHeight - geom.vh)
  const r = sheet.getBoundingClientRect()
  geom.sheet = { left: r.left, docTop: r.top + y, width: r.width, height: r.height }
  // The sheet reaches its place exactly when the pinned stage lets go.
  geom.F = Math.max(40, geom.sheet.docTop - (geom.flagTop + geom.flagLen))
  geom.lines = all('.ln', strips).map((el, i) => {
    const q = el.getBoundingClientRect()
    return { ...promptLines[i], rect: { x: q.left - r.left, y: q.top - r.top, w: q.width, h: q.height } }
  })
  geom.trySlot = slot(trySlot, y)
  geom.markSlot = slot(markSlot, y)
  geom.stripPx = parseFloat(css.getPropertyValue('--strip-h')) || 20
  geom.stripFont = parseFloat(css.getPropertyValue('--strip-font')) || 12.4
}

// The story value T: 0 at the top, then 1 to 5 through the pinned section's four stages.
const STAGES = [0, 0.27, 0.57, 0.76, 1]
function storyT(y: number): number {
  if (y < geom.flagTop) return y / Math.max(1, geom.flagTop)
  const f = Math.min(1, (y - geom.flagTop) / geom.flagLen)
  for (let i = 0; i < 4; i++) if (f <= STAGES[i + 1]) return 1 + i + (f - STAGES[i]) / (STAGES[i + 1] - STAGES[i])
  return 5
}

// Under reduced motion the tape shows one composed still per stage.
const STILLS = [0, 1.42, 2.8, 3.95, 5]
function stillT(T: number): number {
  if (T < 0.92) return 0
  if (T < 2) return STILLS[1]
  if (T < 3) return STILLS[2]
  if (T < 4) return STILLS[3]
  return 5
}

let world: World | null = null
const canvas = $<HTMLCanvasElement>('.world')
const state = { T: 0, Texact: 0, feed: 0, scrollY: 0, pointer: { x: 0, y: 0 }, tryK: 0, footK: 0, tryText: '' }
let smoothT = 0
let tryK = 0
let footK = 0
let scrolled = scrollY > 2
let lastTime = 0
let raf = 0
let dirty = true
const idleSince = performance.now()
let slowFrames = 0
let lowered = false
let revealed = false
let lastStruck = 0

function kick() {
  dirty = true
  if (!raf && !document.hidden) raf = requestAnimationFrame(tick)
}

function targets() {
  const y = scrollY
  const vh = geom.vh
  const ts = geom.trySlot.docTop - y
  const tryVisible = !phone && ts < vh * 1.02 && ts > -vh * 0.25
  const tryTarget = tryVisible ? Math.min(1, Math.max(0, (vh * 0.95 - ts) / (vh * 0.42))) : 0
  const ms = geom.markSlot.docTop - y
  const footVisible = ms < vh * 1.05 && ms + geom.markSlot.h > -40
  const footTarget = footVisible ? Math.min(1, Math.max(0, (vh * 0.82 - ms) / (vh * 0.5))) : 0
  return { y, Texact: storyT(y), tryVisible, tryTarget, footVisible, footTarget }
}

function tick(now: number) {
  raf = 0
  const dt = lastTime ? Math.min(0.25, (now - lastTime) / 1000) : 1 / 60
  lastTime = now
  const g = targets()
  if (g.y > 2) scrolled = true
  // The voice keeps talking while the page rests at the top.
  let feeding = false
  if (!scrolled && !reduced && world && now - idleSince < 45000) {
    state.feed += dt * 0.9
    feeding = true
  }
  const a = 1 - Math.exp(-6.5 * dt)
  const goal = reduced ? stillT(g.Texact) : g.Texact
  const prevT = smoothT
  smoothT = reduced ? goal : smoothT + (goal - smoothT) * a
  if (Math.abs(smoothT - goal) < 0.0004) smoothT = goal
  const prevTry = tryK
  const prevFoot = footK
  tryK = reduced ? g.tryTarget : tryK + (g.tryTarget - tryK) * a
  footK = reduced ? g.footTarget : footK + (g.footTarget - footK) * a
  if (Math.abs(tryK - g.tryTarget) < 0.0005) tryK = g.tryTarget
  if (Math.abs(footK - g.footTarget) < 0.0005) footK = g.footTarget

  storyDom(smoothT)

  // The canvas shows for the story until the prompt docks, then for the try strip and the footer mark.
  const sheetTop = geom.sheet.docTop - g.y
  const docked = sheetTop <= geom.F + 0.5
  const waiting = !docked && html.classList.contains('has3d')
  sheet.classList.toggle('wait', waiting)
  promptSection.classList.toggle('wait', waiting)
  const fade = docked ? Math.min(1, (geom.F - sheetTop) / (geom.vh * 0.18)) : 0
  const alpha = Math.max(1 - fade, g.tryVisible ? 1 : 0, g.footVisible ? 1 : 0)
  if (world) {
    canvas.style.opacity = revealed ? String(alpha) : '0'
    ghost.style.opacity = smoothT > 4.3 && !docked ? '1' : '0'
  }

  const moving = smoothT !== prevT || tryK !== prevTry || footK !== prevFoot || feeding
  if (world && (dirty || moving) && alpha > 0.001) {
    state.T = smoothT
    state.Texact = g.Texact
    state.scrollY = g.y
    state.tryK = tryK
    state.footK = footK
    state.tryText = note.value
    const start = performance.now()
    const out = world.frame(state)
    world.render()
    governor(performance.now() - start)
    placeCallouts(out)
    ghostFrame(out.dockTop)
    for (const el of markCalls) el.classList.toggle('on', !!out.markOn)
    if (out.again) feeding = true
  }
  hudStruck.textContent = smoothT >= 2 && smoothT < 3.05 ? fill(t.struckCount, { n: lastStruck }) : ''
  dirty = false
  if (moving || feeding) raf = requestAnimationFrame(tick)
}

interface Point {
  x: number
  y: number
  on: number
}

function placeCallouts(out: { callouts: (Point & { i: number })[]; check: Point | null; struck: number }) {
  const shown = new Set<HTMLElement>()
  for (const c of out.callouts) {
    const el = factEls[c.i]
    if (!el) continue
    shown.add(el)
    el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`
    el.style.setProperty('--h', phone ? '34px' : '46px')
    el.classList.toggle('on', c.on > 0.5)
  }
  for (const el of factEls) if (!shown.has(el)) el.classList.remove('on')
  if (out.check && out.check.on > 0.01) {
    checkEl.style.transform = `translate(${out.check.x.toFixed(1)}px, ${out.check.y.toFixed(1)}px)`
    checkEl.style.setProperty('--h', '30px')
    checkEl.classList.toggle('on', out.check.on > 0.5)
  } else checkEl.classList.remove('on')
  if (out.struck >= 0) lastStruck = out.struck
}

function ghostFrame(top: number | undefined) {
  if (top === undefined) return
  ghost.style.transform = `translate(${geom.sheet.left}px, ${top}px)`
  ghost.style.width = `${geom.sheet.width}px`
  ghost.style.height = `${geom.sheet.height}px`
}

// Lower the pixel ratio once if frames stay slow.
function governor(ms: number) {
  if (lowered || !world) return
  slowFrames = ms > 20 ? slowFrames + 1 : Math.max(0, slowFrames - 1)
  if (slowFrames > 30) {
    lowered = true
    world.setDpr(1)
  }
}

addEventListener('scroll', kick, { passive: true })
addEventListener(
  'pointermove',
  (event) => {
    if (phone || scrolled) return
    state.pointer.x = (event.clientX / innerWidth - 0.5) * 2
    state.pointer.y = (event.clientY / innerHeight - 0.5) * 2
    kick()
  },
  { passive: true },
)
let lastWidth = innerWidth
addEventListener('resize', () => {
  if (innerWidth !== lastWidth) renderStrips()
  lastWidth = innerWidth
  measure()
  world?.layout(worldLayout())
  kick()
})
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(raf)
    raf = 0
    lastTime = 0
  } else kick()
})
reducedQuery.addEventListener('change', (event) => {
  reduced = event.matches
  kick()
})

function worldLayout() {
  const { vw, vh, stripPx, stripFont, lines } = geom
  return { vw, vh, stripPx, stripFont, sheet: geom.sheet, lines, trySlot: geom.trySlot, markSlot: geom.markSlot, frameTop: geom.F }
}

// The 3D tape, when the device can take it.

function webglOk(): boolean {
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return false
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

// Without WebGL, the hero shows a still of the tape instead.
function fallback() {
  html.classList.remove('has3d')
  html.classList.add('no3d')
  world = null
  canvas.remove()
  const still = $('.hero-still')
  const img = $<HTMLImageElement>('img', still)
  img.addEventListener('load', () => (still.hidden = false), { once: true })
  img.addEventListener('error', () => still.remove(), { once: true })
  for (const source of all<HTMLSourceElement>('source', still)) source.srcset = source.dataset.srcset!
  img.src = img.dataset.src!
  measure()
}

measure()
storyDom(storyT(scrollY))
if (webglOk()) {
  html.classList.add('has3d')
  const start = async () => {
    try {
      const [{ createWorld }, { loadCanvasFonts }] = await Promise.all([import('./scene/world.js'), import('./scene/text.js')])
      await loadCanvasFonts()
      await document.fonts.ready
      renderStrips()
      measure()
      const copy = { monologue: t.monologue, questionsHtml: t.questionsHtml, facts: facts[lang], answer: t.answer, fixed: t.fixed }
      world = await createWorld({ canvas, copy, phone, reduced })
      world.layout(worldLayout())
      canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault()
        fallback()
      })
      smoothT = reduced ? stillT(storyT(scrollY)) : storyT(scrollY)
      dirty = true
      tick(performance.now())
      await world.warm()
      canvas.style.transition = 'opacity .6s ease'
      revealed = true
      kick()
      setTimeout(() => (canvas.style.transition = ''), 700)
    } catch (error) {
      console.error(error)
      fallback()
    }
  }
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 400 })
  else setTimeout(start, 60)
} else fallback()
