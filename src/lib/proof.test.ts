import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { rerun } from './proof'

// The page must show what evals/README.md reports for the fair rerun, row for row.
const readme = readFileSync(new URL('../../evals/README.md', import.meta.url), 'utf8')
const section = readme.split('### The fair rerun')[1].split('\n### ')[0]
const row = (name: string) =>
  section
    .split('\n')
    .find((line) => line.startsWith(`| ${name} |`))
    ?.split('|')
    .map((cell) => cell.trim()) ?? []

describe('the blind test on the page', () => {
  const r = rerun

  it('counts the runs the evals made', () => {
    expect(section).toContain(`each of the ${r.notes} notes runs ${r.passes} times`)
    expect(r.runs).toBe(r.notes * r.passes)
    expect(r.koe + r.ties + r.raw).toBe(r.runs)
  })

  it('matches the table', () => {
    const raw = row('Raw note')
    const koe = row('Koe v2, released')
    expect(raw[2]).toBe(`${r.rawMean} (± ${r.rawCi})`)
    expect(koe[2]).toBe(`${r.koeMean} (± ${r.koeCi})`)
    expect(koe[3]).toBe(`${r.koe} wins, ${r.raw} losses, ${r.ties} ties`)
    expect(raw[4]).toBe(`${r.rawAsked} of ${r.runs}`)
    expect(koe[4]).toBe(`${r.koeAsked} of ${r.runs}`)
    expect(koe[5]).toBe(`${r.details} / 10`)
  })

  it('matches what the text says about questions, corrections and significance', () => {
    expect(section).toContain(`(${r.koeAsked} of ${r.koeAsked})`)
    expect(section).toContain(`all ${r.corrections} spoken corrections`)
    expect(section).toContain(`p = ${r.p} for v2`)
  })
})
