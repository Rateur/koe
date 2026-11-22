import { describe, expect, it } from 'vitest'
import { facts, fill, pageLang, words } from './i18n'

describe('pageLang', () => {
  it('speaks French to French browsers and English to everyone else', () => {
    expect(pageLang(['fr-CA', 'en'])).toBe('fr')
    expect(pageLang(['de-DE', 'fr'])).toBe('en')
    expect(pageLang([])).toBe('en')
  })
})

describe('words', () => {
  it('has every string in both languages', () => {
    expect(Object.keys(words.en).sort()).toEqual(Object.keys(words.fr).sort())
    expect(facts.en.length).toBe(facts.fr.length)
  })

  it('keeps French spacing: no plain space before : ; ! ? % » or after «', () => {
    // Markup and the example's ??doubtful?? marker aren't French text.
    const french = [...Object.values(words.fr), ...facts.fr.map(([, label]) => label)].join('\n').replace(/<[^>]+>|\?\?[^?]+\?\?/g, '')
    expect(french).not.toMatch(/ [:;!?%»]|« /)
  })

  it('strikes out every hesitation in both monologues', () => {
    for (const lang of ['fr', 'en'] as const) {
      const kept = words[lang].monologue.replace(/~~[^~]*~~/g, '')
      expect(kept).not.toMatch(/\b(euh|um)\b/i)
    }
  })

  // The tape points at each fact where the monologue says it; one it can't find gets no label.
  it('points only at words the monologue says', () => {
    for (const lang of ['fr', 'en'] as const) {
      const said = words[lang].monologue.replace(/~~|\?\?/g, '')
      for (const [find] of facts[lang]) expect(said, find).toContain(find)
    }
  })
})

describe('fill', () => {
  it('fills the placeholders it has a value for', () => {
    expect(fill('{koe} sur {runs}, {n}', { koe: 19, runs: '36' })).toBe('19 sur 36, {n}')
  })
})
