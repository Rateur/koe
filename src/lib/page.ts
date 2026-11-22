// The page's words with their figures filled in, and the parts of the page built from them.
// The build writes them in French (vite.config.ts), so the page reads without JavaScript; main.ts writes them in English.
import { fill, words, type Key, type Lang } from './i18n'
import { escapeHtml, highlight, spoken, wrapPrompt, type PromptLine } from './prompt'
import { axis, rerun } from './proof'

export function number(lang: Lang, x: number, digits = 2): string {
  return x.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

// The example note's length, as dictated.
export function wordCount(monologue: string): number {
  return monologue
    .replace(/~~|\?\?/g, '')
    .split(/\s+/)
    .filter((word) => /[\p{L}\d]/u.test(word)).length
}

function figures(lang: Lang): Record<string, string | number> {
  const n = (x: number, digits?: number) => number(lang, x, digits)
  const { rawMean, rawCi, koeMean, koeCi, p, details, ...counts } = rerun
  return {
    ...counts,
    rawMean: n(rawMean),
    rawCi: n(rawCi),
    koeMean: n(koeMean),
    koeCi: n(koeCi),
    p: n(p),
    details: n(details, 1),
    words: wordCount(words[lang].monologue),
  }
}

export function say(lang: Lang, key: Key): string {
  return fill(words[lang][key], figures(lang))
}

// How the build lays out the prompt; main.ts lays it out again for the screen.
export const PROMPT_COLS = 76

export function stripsHtml(lines: PromptLine[]): string {
  return lines.map((line) => (line.text.trim() ? `<span class="ln">${highlight(line.text)}</span>` : '<span class="ln empty"> </span>')).join('')
}

export type Part = 'saidPlain' | 'saidMarked' | 'questions' | 'strips' | 'duels' | 'means' | 'more'

export function parts(lang: Lang): Record<Part, string> {
  const t = words[lang]
  const s = (key: Key) => say(lang, key)
  const r = rerun

  // The 36 blind runs, punched in a strip of tape: a hole for a win, a dash for a tie, a ring for a loss.
  const holes = (kind: string, count: number) => `<i class="h ${kind}"></i>`.repeat(count)
  const duels = `<div class="tape" role="img" aria-label="${escapeHtml(s('duelsLabel'))}" style="--all:${r.koe + r.ties + r.raw};--most:${Math.max(r.koe, r.ties, r.raw)}">
    <div class="seg" style="--n:${r.koe}"><p class="ask" style="--k:${r.koeAsked}"><span>${escapeHtml(s('koeAskedWon'))}</span></p><div class="holes">${holes('win', r.koe)}</div><p class="seg-name">${s('koeWinsHtml')}</p></div>
    <div class="seg" style="--n:${r.ties}"><div class="holes">${holes('tie', r.ties)}</div><p class="seg-name">${s('tiesHtml')}</p></div>
    <div class="seg" style="--n:${r.raw}"><div class="holes">${holes('loss', r.raw)}</div><p class="seg-name">${s('rawWinsHtml')}</p></div></div>`

  // The two averages as a forest plot: names and values on the left, one shared scale on the right.
  const [lo, hi] = axis
  const x = (v: number) => `${(((v - lo) / (hi - lo)) * 100).toFixed(3)}%`
  const ticks: number[] = []
  for (let v = lo; v <= hi + 1e-9; v += 0.5) ticks.push(v)
  const estimate = (row: number, kind: string, name: Key, mean: number, ci: number) => `
    <p class="est-name" style="grid-row:${row}">${escapeHtml(t[name])}<span class="est-val">${number(lang, mean)} ± ${number(lang, ci)}</span></p>
    <div class="est-track ${kind}" style="grid-row:${row}"><i class="ci" style="--lo:${x(mean - ci)};--hi:${x(mean + ci)}"></i><i class="m" style="--x:${x(mean)}"></i></div>`
  const means =
    `<div class="grid">${ticks.map((v) => `<i class="gl" style="--x:${x(v)}"></i>`).join('')}</div>` +
    estimate(1, 'raw', 'rawName', r.rawMean, r.rawCi) +
    estimate(2, 'koe', 'koeName', r.koeMean, r.koeCi) +
    `<p class="axis">${ticks.map((v) => `<span style="--x:${x(v)}">${number(lang, v, v % 1 ? 1 : 0)}</span>`).join('')}</p>`

  const rows: [Key, Key][] = [
    ['askedName', 'askedValue'],
    ['correctionsName', 'correctionsValue'],
    ['detailsName', 'detailsValue'],
  ]
  const more = rows.map(([name, value]) => `<div><dt>${escapeHtml(s(name))}</dt><dd>${escapeHtml(s(value))}</dd></div>`).join('')

  return {
    saidPlain: spoken(t.monologue, false),
    // The misheard name is marked; a screen reader also hears what it should be.
    saidMarked: spoken(t.monologue, true).replace('</mark>', `</mark> <span class="sr">(${escapeHtml(t.fixed)})</span>`),
    questions: [...t.questionsHtml.matchAll(/<li>(.*?)<\/li>/g)].map(([item]) => item).join(''),
    strips: stripsHtml(wrapPrompt(t.prompt, PROMPT_COLS)),
    duels,
    means,
    more,
  }
}
