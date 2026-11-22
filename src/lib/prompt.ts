// What the page does with the skill: the text to paste into any chat, and the link that opens Claude.

// The skill's instructions without the frontmatter, and without the pointer to files only an installed skill has.
export function skillBody(skill: string): string {
  return skill
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .split('\n')
    .filter((line) => !line.includes('](references/'))
    .join('\n')
    .trim()
}

// Koe for a chat that doesn't have the skill: its instructions, then the voice note.
export function handoff(body: string, note: string): string {
  return [
    'Follow the instructions in <koe> to turn my voice note in <voice_note> into a prompt.',
    `<koe>\n${body}\n</koe>`,
    `<voice_note>\n${note.trim()}\n</voice_note>`,
  ].join('\n\n')
}

const CLAUDE = 'https://claude.ai/new'
// Longer links get cut by browsers and servers; the text is on the clipboard by then.
const MAX_LINK = 14_000

export function claudeLink(text: string): string {
  const link = `${CLAUDE}?q=${encodeURIComponent(text)}`
  return link.length <= MAX_LINK ? link : CLAUDE
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char])
}

// Colours the tags of a prompt. Everything is escaped first, so a prompt can never inject markup.
export function highlight(prompt: string): string {
  return escapeHtml(prompt).replace(/&lt;\/?[a-z][\w-]*(?:\s.*?)?&gt;/gi, (tag) => `<span class="tag">${tag}</span>`)
}

export interface PromptLine {
  text: string
  segs: { text: string; tag: boolean }[]
}

// A prompt cut at spaces into lines of at most `cols` characters, one per strip of tape; a list item's next lines are indented.
// Each line keeps its tags apart, so the 3D tape can print them in graphite.
export function wrapPrompt(prompt: string, cols: number): PromptLine[] {
  const lines: string[] = []
  for (const source of prompt.split('\n')) {
    if (source.length <= cols) {
      lines.push(source)
      continue
    }
    const indent = source.startsWith('- ') ? '  ' : ''
    let line = ''
    for (const word of source.split(' ')) {
      const next = line ? `${line} ${word}` : word
      if (next.length > cols && line) {
        lines.push(line)
        line = indent + word
      } else line = next
    }
    if (line) lines.push(line)
  }
  const tag = /^<\/?[a-z_]+>$/
  return lines.map((text) => ({ text, segs: text.split(/(<\/?[a-z_]+>)/).filter(Boolean).map((part) => ({ text: part, tag: tag.test(part) })) }))
}

// The site's example monologue: ~~struck~~ and ??doubtful?? words, either marked or as they were dictated.
export function spoken(text: string, marked: boolean): string {
  return escapeHtml(text)
    .replace(/~~(.+?)~~/g, marked ? '<s>$1</s>' : '$1')
    .replace(/\?\?(.+?)\?\?/g, marked ? '<mark>$1</mark>' : '$1')
}
