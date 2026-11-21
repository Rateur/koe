import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// What claude.ai and the other agents check when they load a skill: https://agentskills.io/specification
const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')
const skill = read('plugins/koe/skills/koe/SKILL.md')
const [, frontmatter = '', body = ''] = skill.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/) ?? []
const field = (name: string) => frontmatter.match(new RegExp(`^${name}: (.*)$`, 'm'))?.[1] ?? ''

describe('the koe skill', () => {
  it('has a name that matches its folder and that agents accept', () => {
    expect(field('name')).toBe('koe')
    expect(field('name')).toMatch(/^[a-z0-9-]{1,64}$/)
  })

  it('has a description short enough for every agent', () => {
    expect(field('description').length).toBeGreaterThan(0)
    expect(field('description').length).toBeLessThanOrEqual(1024)
  })

  it('stays short enough to load in full', () => {
    expect(body.split('\n').length).toBeLessThan(500)
  })

  it('points only to files that exist', () => {
    for (const [, path] of body.matchAll(/\]\(([^)]+)\)/g)) {
      if (!path.startsWith('http')) expect(existsSync(new URL(`../../plugins/koe/skills/koe/${path}`, import.meta.url)), path).toBe(true)
    }
  })

  it('ships as a plugin with the same version as the site', () => {
    const plugin = JSON.parse(read('plugins/koe/.claude-plugin/plugin.json'))
    const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'))
    const pkg = JSON.parse(read('package.json'))
    expect(plugin.name).toBe('koe')
    expect(plugin.version).toBe(pkg.version)
    expect(marketplace.plugins.map((p: { name: string }) => p.name)).toEqual(['koe'])
  })

  // Claude Code copies the plugin folder into every install, and runs npm there when it finds a package.json.
  it('installs from a folder that holds only the plugin', () => {
    const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'))
    expect(marketplace.plugins[0].source).toBe('./plugins/koe')
    expect(existsSync(new URL('../../plugins/koe/package.json', import.meta.url))).toBe(false)
  })
})
