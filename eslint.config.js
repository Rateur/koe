import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import ts from 'typescript-eslint'

export default defineConfig(
  { ignores: ['dist/'] },
  js.configs.recommended,
  ts.configs.recommended,
  { languageOptions: { globals: globals.browser } },
)
