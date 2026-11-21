import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import { words, type Key } from './src/lib/i18n'
import { escapeHtml, excerpt, highlight, spoken } from './src/lib/prompt'

const fr = words.fr
const text = (key: string) => escapeHtml(fr[key as Key])
const lockup = readFileSync('.github/assets/lockup-light.svg', 'utf8').replace(/fill="#\w+"/g, 'fill="currentColor"')

// The page ships in French, filled in here, so link previews and visitors without JavaScript get the real words.
// main.ts fills the same attributes when someone switches to English.
function frenchPage(): Plugin {
  return {
    name: 'koe-french-page',
    transformIndexHtml: (html) =>
      html
        .replace(/(data-i18n="(\w+)"[^>]*>)(?=<\/)/g, (_, open, key) => open + text(key))
        .replace(/(data-i18n-html="(\w+)"[^>]*>)(?=<\/)/g, (_, open, key) => open + fr[key as Key])
        .replace(/data-i18n-(content|placeholder|label)="(\w+)"/g, (all, attr, key) => `${all} ${attr === 'label' ? 'aria-label' : attr}="${text(key)}"`)
        .replace(/(data-monologue="(\w+)"[^>]*>)(?=<\/)/g, (_, open, mode) => open + spoken(fr.monologue, mode === 'staged'))
        .replace(/(data-prompt="(\w+)"(?: data-lines="([\d-]+)")?[^>]*>)(?=<\/)/g, (_, open, key, lines) => open + highlight(excerpt(fr[key as Key], lines)))
        .replace('<!--LOCKUP-->', lockup),
  }
}

export default defineConfig({ plugins: [frenchPage()] })
