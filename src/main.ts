import './style.css'
import skill from '../skills/koe/SKILL.md?raw'
import { pageLang, words, type Key, type Lang } from './lib/i18n'
import { claudeLink, excerpt, handoff, highlight, skillBody, spoken } from './lib/prompt'

const body = skillBody(skill)
const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!
const all = <T extends HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)]
const still = matchMedia('(prefers-reduced-motion: reduce)')

// shortcut: the choice lives in this tab only; remember it across visits if people ask for it.
let lang: Lang = (new URLSearchParams(location.search).get('lang') as Lang | null) ?? pageLang(navigator.languages)
if (!(lang in words)) lang = 'en'

// The build fills the page in French (vite.config.ts); this fills the same places in whichever language is chosen.
function render() {
  const t = words[lang]
  document.documentElement.lang = lang
  for (const el of all('[data-i18n]')) el.textContent = t[el.dataset.i18n as Key]
  // Our own strings only, never anything a visitor typed.
  for (const el of all('[data-i18n-html]')) el.innerHTML = t[el.dataset.i18nHtml as Key]
  for (const el of all('[data-i18n-content]')) el.setAttribute('content', t[el.dataset.i18nContent as Key])
  for (const el of all('[data-i18n-label]')) el.setAttribute('aria-label', t[el.dataset.i18nLabel as Key])
  for (const el of all<HTMLTextAreaElement>('[data-i18n-placeholder]')) el.placeholder = t[el.dataset.i18nPlaceholder as Key]
  for (const el of all('[data-monologue]')) el.innerHTML = spoken(t.monologue, el.dataset.monologue === 'staged')
  for (const el of all('[data-prompt]')) el.innerHTML = highlight(excerpt(t[el.dataset.prompt as Key], el.dataset.lines))
  for (const status of all('[role="status"]')) status.textContent = ''
  showCaption()
  showStage()
}

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

// Try it: the note goes to Claude, or to the clipboard, wrapped in Koe's instructions.

const note = $<HTMLTextAreaElement>('#voice-note')
const tryStatus = $('#try-status')

function voiceNote(): string | null {
  const text = note.value.trim()
  if (!text) {
    tryStatus.textContent = words[lang].empty
    note.focus()
  }
  return text || null
}

async function copyNote(text: string, done: string) {
  tryStatus.textContent = (await copy(handoff(body, text))) ? done : words[lang].copyFailed
}

// A plain link rather than window.open, so no popup blocker gets in the way; its target follows the note.
const open = $<HTMLAnchorElement>('#open')
note.addEventListener('input', () => {
  open.href = claudeLink(handoff(body, note.value))
})

open.addEventListener('click', (event) => {
  const text = voiceNote()
  if (!text) return event.preventDefault()
  // Started during the click, while the page still has focus; Claude opens next to it.
  copyNote(text, words[lang].copiedOpen)
})

$('#copy').addEventListener('click', () => {
  const text = voiceNote()
  if (text) copyNote(text, words[lang].copied)
})

$('#sample').addEventListener('click', () => {
  note.value = words[lang].sample
  note.dispatchEvent(new Event('input'))
  tryStatus.textContent = ''
  note.focus()
})

for (const button of all<HTMLButtonElement>('[data-copy]')) {
  button.addEventListener('click', async () => {
    if (!(await copy(button.dataset.copy!))) return
    button.textContent = words[lang].copiedShort
    setTimeout(() => (button.textContent = words[lang].copy), 1600)
  })
}

// The row of fragments: the one in the middle is lit, and the caption beside it names it.

const row = $('.row')
const slots = all('.slot')
let lit = 0

function showCaption() {
  const t = words[lang]
  const n = lit + 1
  $('#show-name .name').textContent = t[`show${n}Name` as Key]
  $('#show-name .text').textContent = t[`show${n}Text` as Key]
}

function light() {
  const middle = row.getBoundingClientRect().left + row.clientWidth / 2
  const distance = (slot: HTMLElement) => Math.abs(slot.getBoundingClientRect().left + slot.offsetWidth / 2 - middle)
  const nearest = slots.reduce((best, slot, i) => (distance(slot) < distance(slots[best]) ? i : best), 0)
  if (nearest === lit && slots[lit].classList.contains('lit')) return
  lit = nearest
  slots.forEach((slot, i) => {
    slot.classList.toggle('lit', i === lit)
    slot.inert = i !== lit
  })
  showCaption()
}

row.addEventListener('scroll', () => requestAnimationFrame(light), { passive: true })
// Clicking a dim fragment brings it to the middle.
for (const slot of slots) slot.addEventListener('pointerdown', () => slot.classList.contains('lit') || slot.scrollIntoView({ behavior: still.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' }))
row.addEventListener('keydown', (event) => {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
  if (!step) return
  event.preventDefault()
  slots[Math.max(0, Math.min(slots.length - 1, lit + step))].scrollIntoView({ behavior: still.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' })
})

// The four stages, driven by one slider: what you say, what Koe strikes, what it asks, what Claude gets.

const stage = $<HTMLInputElement>('#stage')
const stops = all('.stops li')

function showStage() {
  const n = Number(stage.value)
  $('#stage-title').textContent = words[lang][`stage${n}Title` as Key]
  $('.note').dataset.stage = String(n)
  $('.track').style.setProperty('--passed', `${((n - 1) / 3) * 100}%`)
  stage.setAttribute('aria-valuetext', words[lang][`stage${n}Name` as Key])
  stops.forEach((stop, i) => stop.classList.toggle('current', i === n - 1))
}

stage.addEventListener('input', showStage)
stops.forEach((stop, i) =>
  stop.addEventListener('click', () => {
    stage.value = String(i + 1)
    showStage()
  }),
)

// Install: each tab shows its steps and the matching piece of Claude next to them.

const tabs = all<HTMLButtonElement>('[role="tab"]')

function select(tab: HTMLButtonElement) {
  for (const other of tabs) {
    const selected = other === tab
    const panel = other.getAttribute('aria-controls')!
    other.setAttribute('aria-selected', String(selected))
    other.tabIndex = selected ? 0 : -1
    $(`#${panel}`).hidden = !selected
    $(`[data-for="${panel}"]`).hidden = !selected
  }
}

for (const tab of tabs) {
  tab.addEventListener('click', () => select(tab))
  // Arrow keys move between tabs, as screen readers expect.
  tab.addEventListener('keydown', (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (!step) return
    const next = tabs[(tabs.indexOf(tab) + step + tabs.length) % tabs.length]
    select(next)
    next.focus()
  })
}

// The old machines that turned speech into writing, one after the other.

const pictures = all('.fade img')
let shown = 0
setInterval(() => {
  if (still.matches || document.hidden) return
  pictures[shown].classList.remove('on')
  shown = (shown + 1) % pictures.length
  pictures[shown].classList.add('on')
}, 5600)

// Each section's parts come in once, as it reaches the screen.

const seen = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('in')
      seen.unobserve(entry.target)
    }
  },
  { rootMargin: '0px 0px -12% 0px' },
)
for (const section of all('main > section, .foot')) {
  section.classList.add('enter')
  seen.observe(section)
}

$('.lang').addEventListener('click', () => {
  lang = lang === 'fr' ? 'en' : 'fr'
  history.replaceState(null, '', `?lang=${lang}${location.hash}`)
  render()
})

if (lang === 'fr') {
  showStage()
  light()
} else {
  render()
  light()
}
