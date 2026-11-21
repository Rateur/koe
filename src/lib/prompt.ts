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

// The first lines of a prompt, for a fragment that only shows its top: `lines` is like "1-7".
export function excerpt(text: string, lines?: string): string {
  if (!lines) return text
  const [from, to] = lines.split('-').map(Number)
  return text.split('\n').slice(from - 1, to).join('\n')
}

// The site's example monologue: ~~struck~~ and ??doubtful?? words, either marked or as they were dictated.
export function spoken(text: string, marked: boolean): string {
  return escapeHtml(text)
    .replace(/~~(.+?)~~/g, marked ? '<s>$1</s>' : '$1')
    .replace(/\?\?(.+?)\?\?/g, marked ? '<mark>$1</mark>' : '$1')
}
