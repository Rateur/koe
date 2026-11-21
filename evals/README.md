# Does Koe help?

The only question that matters for Koe: does Claude give a better answer to a Koe prompt than to the voice note itself? Claude already understands rough dictation, so it isn't a given.

## How it was tested

[voice-notes.json](voice-notes.json) holds 12 voice notes, 8 in French and 4 in English: an email to answer, a React bug, a LinkedIn post, a trip, a meal plan, a letter to the CAF, a birthday toast, a product idea, an interview, a spreadsheet, a cover letter and a topic to learn. Each sounds spoken (fillers, a self-correction, misheard words such as "youz effet" for useEffect) and comes with the speaker's hidden intent.

For each note:

1. Claude, with the skill, turns the note into a prompt. When it asks questions, a stand-in for the speaker answers from the hidden intent.
2. A fresh Claude answers the note as it is, and another answers the Koe prompt.
3. A judge who doesn't know which is which scores both answers out of 10 against the intent. A second judge checks the prompt itself: details kept, nothing invented, the skill's rules followed.

## Results

### The fair rerun (November 2026)

The first test had a flaw: the raw note's answer was judged as it came, so a reply that asked questions lost by default, while Koe's questions got answered. In the rerun every side may ask once and gets the same stand-in answers, and each of the 12 notes runs 3 times. [fair-eval.workflow.js](fair-eval.workflow.js) is the harness, a Claude Code workflow.

| | Average out of 10 (95 % interval) | Against the raw note | Asked first | Details kept | Invented lines |
|---|---|---|---|---|---|
| Raw note | 7.14 (± 0.42) | | 0 of 36 | | |
| Koe v2, released | 7.61 (± 0.34) | 19 wins, 10 losses, 7 ties | 6 of 36 | 9.7 / 10 | 3 |
| Koe v3, in testing | 7.81 (± 0.27) | 21 wins, 11 losses, 4 ties | 17 of 36 | 9.9 / 10 | 10 |

Allowed to ask, the raw note never did. Both versions handled all 36 spoken corrections. Every time v2 asked its questions, its answer won (6 of 6). Where v3 asked, it beat the raw note 12 times out of 16; where it didn't, the two were close (9 wins, 7 losses).

None of the overall differences is statistically solid: a sign test gives p = 0.14 for v2 against the raw note and p = 0.11 for v3. What holds is the direction, and the gain when Koe asks. v3 doesn't ship until it stops inventing lines (it worked out a payment schedule the speaker never asked for, and read an "I don't mind" as permission) and passes the long-note test on real dictation.

### The first test

| | Koe wins | Note wins | Koe average | Note average | Questions asked | Details kept |
|---|---|---|---|---|---|---|
| Skill v1 | 5 | 7 | 7.67 | 7.75 | 1 of 12 | 9.3 / 10 |
| Skill v2 | 8 | 4 | 7.75 | 7.25 | 4 of 12 | 9.4 / 10 |

Version 1 didn't help: it added rules the speaker never gave (checks, length limits, "stop at the plan"), kept doubtful words as heard, and almost never asked anything. Version 2 adds nothing the speaker didn't ask for, writes its best guess next to what was heard (`Qonto [heard: "Conto"]`), and asks up to three questions when the result depends on something only the speaker knows.

## Known limits

- The notes were written by an agent, not dictated. Twelve notes run three times are enough to see a direction, not to measure a size.
- The judge, the stand-in speaker and the answers are all Claude. The judge sees the hidden intent; the others don't.
- Between v1 and v2, the judge was told that a placeholder such as `[Paste the email here]` is for the speaker to fill and isn't a flaw.
- The answering model was a current Claude. A weaker model, or an agent working for hours on a task, may gain more from a structured prompt; this wasn't measured.
