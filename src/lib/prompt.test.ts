import { describe, expect, it } from 'vitest'
import skill from '../../plugins/koe/skills/koe/SKILL.md?raw'
import { claudeLink, handoff, highlight, skillBody, spoken, wrapPrompt } from './prompt'

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

describe('wrapPrompt', () => {
  it('cuts long lines at spaces and indents a list item under its text', () => {
    const lines = wrapPrompt('<task>\n- one two three four\n</task>', 10)
    expect(lines.map((line) => line.text)).toEqual(['<task>', '- one two', '  three', '  four', '</task>'])
  })

  it('keeps the tags apart from the text', () => {
    expect(wrapPrompt('<task>Plan</task>', 80)[0].segs).toEqual([
      { text: '<task>', tag: true },
      { text: 'Plan', tag: false },
      { text: '</task>', tag: true },
    ])
  })
})

describe('spoken', () => {
  it('marks what Koe strikes and what it asks to check, or shows the note as dictated', () => {
    const note = '~~euh~~ le club de ??l’usine ivre?? <b>'
    expect(spoken(note, true)).toBe('<s>euh</s> le club de <mark>l’usine ivre</mark> &lt;b&gt;')
    expect(spoken(note, false)).toBe('euh le club de l’usine ivre &lt;b&gt;')
  })
})
