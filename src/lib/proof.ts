// The blind test the page shows. Every figure comes from evals/README.md, "The fair rerun (November 2026)":
// Koe v2, the released version, against the raw note, with both sides allowed to ask first. proof.test.ts checks them there.
export const rerun = {
  notes: 12,
  passes: 3,
  runs: 36,
  koe: 19,
  ties: 7,
  raw: 10,
  koeAsked: 6, // every one of them a win
  rawAsked: 0,
  rawMean: 7.14, // out of 10, give or take the 95 % interval
  rawCi: 0.42,
  koeMean: 7.61,
  koeCi: 0.34,
  p: 0.14, // sign test, v2 against the raw note
  corrections: 36, // all 36 spoken corrections kept
  details: 9.7, // details kept, out of 10, scored by the second judge
}

// The scale of the averages' plot, out of 10.
export const axis = [6.5, 8.5] as const
