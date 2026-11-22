import { describe, expect, it } from 'vitest'
import { words, type Key } from './i18n'
import { PROMPT_COLS, parts, say, wordCount } from './page'
import { rerun } from './proof'

describe('say', () => {
  it('fills every figure, in each language’s numbers', () => {
    for (const lang of ['fr', 'en'] as const) {
      // The step and the cut count are filled as the story plays.
      for (const key of Object.keys(words[lang]) as Key[]) if (!/^(stepCount|struckCount)$/.test(key)) expect(say(lang, key), key).not.toMatch(/\{\w+\}/)
    }
    expect(say('fr', 'meansNote')).toContain('p = 0,14')
    expect(say('en', 'meansNote')).toContain('p = 0.14')
  })

  it('counts the example note as dictated', () => {
    expect(wordCount('~~euh~~ le club de ??l’usine ivre??, voilà.')).toBe(7)
  })
})

describe('parts', () => {
  it('punches one hole a run', () => {
    const { duels } = parts('fr')
    expect(duels.match(/class="h win"/g)).toHaveLength(rerun.koe)
    expect(duels.match(/class="h tie"/g)).toHaveLength(rerun.ties)
    expect(duels.match(/class="h loss"/g)).toHaveLength(rerun.raw)
  })

  it('prints the prompt in strips that fit the build’s line length', () => {
    const lines = [...parts('en').strips.matchAll(/<span class="ln">(.*?)<\/span>(?=<span class="ln|$)/g)].map(([, line]) => line.replace(/<[^>]+>/g, ''))
    expect(lines.length).toBeGreaterThan(0)
    for (const line of lines) expect(line.replace(/&\w+;/g, '_').length).toBeLessThanOrEqual(PROMPT_COLS)
  })

  it('names the misheard word for screen readers', () => {
    expect(parts('fr').saidMarked).toContain('<mark>l’usine ivre</mark> <span class="sr">(US Ivry)</span>')
  })
})
