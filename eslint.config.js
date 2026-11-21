import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import ts from 'typescript-eslint'

export default defineConfig(
  { ignores: ['dist/'] },
  js.configs.recommended,
  ts.configs.recommended,
  { languageOptions: { globals: globals.browser } },
  // French text needs no-break spaces before : ; ! ? % and inside « », including in multiline strings.
  { rules: { 'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true }] } },
)
