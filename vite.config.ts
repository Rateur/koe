import { defineConfig, type Plugin } from 'vite'
import { type Key } from './src/lib/i18n'
import { parts, say, type Part } from './src/lib/page'
import { escapeHtml } from './src/lib/prompt'

const text = (key: string) => escapeHtml(say('fr', key as Key))
const built = parts('fr')

// The page ships in French, filled in here, so link previews and visitors without JavaScript get the real words.
// main.ts fills the same places when the page is read in English.
function frenchPage(): Plugin {
  return {
    name: 'koe-french-page',
    transformIndexHtml: (html) =>
      html
        .replace(/(data-i18n="(\w+)"[^>]*>)(?=<\/)/g, (_, open, key) => open + text(key))
        .replace(/(data-i18n-html="(\w+)"[^>]*>)(?=<\/)/g, (_, open, key) => open + say('fr', key))
        .replace(/data-i18n-(content|placeholder|label)="(\w+)"/g, (all, attr, key) => `${all} ${attr === 'label' ? 'aria-label' : attr}="${text(key)}"`)
        .replace(/(data-part="(\w+)"[^>]*>)(?=<\/)/g, (_, open, part) => open + built[part as Part]),
  }
}

export default defineConfig({ plugins: [frenchPage()] })
