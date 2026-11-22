import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import ts from 'typescript-eslint'

export default defineConfig(
  // The eval harness runs as a Claude Code workflow, with that runtime's own globals. .taste-skill/ holds design drafts, out of git.
  { ignores: ['dist/', 'evals/*.workflow.js', '.taste-skill/'] },
  js.configs.recommended,
  ts.configs.recommended,
  { languageOptions: { globals: globals.browser } },
  // French text needs no-break spaces before : ; ! ? % and inside « », including in multiline strings.
  { rules: { 'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true }] } },
)
