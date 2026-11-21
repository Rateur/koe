import { describe, expect, it } from 'vitest'
import { pageLang, words } from './i18n'

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
  })

  it('keeps French spacing: no plain space before : ; ! ? % » or after «', () => {
    // Markup and the example's ??doubtful?? marker aren't French text.
    const french = Object.values(words.fr).join('\n').replace(/<[^>]+>|\?\?[^?]+\?\?/g, '')
    expect(french).not.toMatch(/ [:;!?%»]|« /)
  })

  it('strikes out every hesitation in both monologues', () => {
    for (const lang of ['fr', 'en'] as const) {
      const kept = words[lang].monologue.replace(/~~[^~]*~~/g, '')
      expect(kept).not.toMatch(/\b(euh|um)\b/i)
    }
  })
})
