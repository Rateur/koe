import { describe, expect, it } from 'vitest'
import skill from '../../plugins/koe/skills/koe/SKILL.md?raw'
import { claudeLink, excerpt, handoff, highlight, skillBody, spoken } from './prompt'

describe('skillBody', () => {
  it('drops the frontmatter and the pointer to the references', () => {
    const body = skillBody('---\nname: koe\n---\n\n# Koe\n\nRule.\n\nFor examples, read [references/examples.md](references/examples.md).\n')
    expect(body).toBe('# Koe\n\nRule.')
  })

  it('reads the real skill', () => {
    const body = skillBody(skill)
    expect(body.startsWith('# Koe')).toBe(true)
    expect(body).not.toContain('name: koe')
    expect(body).not.toContain('references/')
  })

  it('leaves out what only happens in a live chat, and keeps what follows it', () => {
    const body = skillBody('# Koe\n\n## A\n\nKept.\n\n## When the note comes in parts, and in Claude Code\n\n- Dropped.\n\n## B\n\nAlso kept.')
    expect(body).toBe('# Koe\n\n## A\n\nKept.\n\n## B\n\nAlso kept.')
    expect(skillBody(skill)).not.toContain('je continue')
  })

  // The one-tap link holds about 14,000 characters: the skill must leave room for a two-minute note.
  it('leaves room in the link for a 200-word French note', () => {
    const note = 'bon alors mon projet c’est une appli pour le club de foot de mon fils, '.repeat(14)
    expect(note.split(' ').length).toBeGreaterThan(200)
    expect(claudeLink(handoff(skillBody(skill), note))).not.toBe('https://claude.ai/new')
  })
})

describe('handoff', () => {
  it('puts the instructions before the voice note', () => {
    const text = handoff('# Koe', '  résume ce rapport ')
    expect(text).toBe(
      'Follow the instructions in <koe> to turn my voice note in <voice_note> into a prompt.\n\n<koe>\n# Koe\n</koe>\n\n<voice_note>\nrésume ce rapport\n</voice_note>',
    )
  })
})

describe('claudeLink', () => {
  it('fills the text into a new Claude chat', () => {
    expect(claudeLink('<task>été</task>')).toBe('https://claude.ai/new?q=%3Ctask%3E%C3%A9t%C3%A9%3C%2Ftask%3E')
  })

  it('opens an empty chat when the text is too long for a link', () => {
    expect(claudeLink('a'.repeat(20_000))).toBe('https://claude.ai/new')
  })
})

describe('highlight', () => {
  it('wraps tags, attributes included, in a span', () => {
    expect(highlight('<example index="1">hi</example>')).toBe(
      '<span class="tag">&lt;example index=&quot;1&quot;&gt;</span>hi<span class="tag">&lt;/example&gt;</span>',
    )
  })

  it('escapes markup inside the prompt', () => {
    expect(highlight('<task><img src=x onerror=alert(1)></task>')).not.toContain('<img')
    expect(highlight('a & b < c')).toBe('a &amp; b &lt; c')
  })
})

describe('excerpt', () => {
  it('keeps the lines asked for, or everything', () => {
    expect(excerpt('a\nb\nc\nd', '2-3')).toBe('b\nc')
    expect(excerpt('a\nb')).toBe('a\nb')
  })
})

describe('spoken', () => {
  it('marks what Koe strikes and what it asks to check, or shows the note as dictated', () => {
    const note = '~~euh~~ le club de ??l’usine ivre?? <b>'
    expect(spoken(note, true)).toBe('<s>euh</s> le club de <mark>l’usine ivre</mark> &lt;b&gt;')
    expect(spoken(note, false)).toBe('euh le club de l’usine ivre &lt;b&gt;')
  })
})
