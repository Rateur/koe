# Does Koe help?

The only question that matters for Koe: does Claude give a better answer to a Koe prompt than to the voice note itself? Claude already understands rough dictation, so it isn't a given.

## How it was tested

[voice-notes.json](voice-notes.json) holds 12 voice notes, 8 in French and 4 in English: an email to answer, a React bug, a LinkedIn post, a trip, a meal plan, a letter to the CAF, a birthday toast, a product idea, an interview, a spreadsheet, a cover letter and a topic to learn. Each sounds spoken (fillers, a self-correction, misheard words such as "youz effet" for useEffect) and comes with the speaker's hidden intent.

For each note:

1. Claude, with the skill, turns the note into a prompt. When it asks questions, a stand-in for the speaker answers from the hidden intent.
2. A fresh Claude answers the note as it is, and another answers the Koe prompt.
3. A judge who doesn't know which is which scores both answers out of 10 against the intent. A second judge checks the prompt itself: details kept, nothing invented, the skill's rules followed.

## Results

| | Koe wins | Note wins | Koe average | Note average | Questions asked | Details kept |
|---|---|---|---|---|---|---|
| Skill v1 | 5 | 7 | 7.67 | 7.75 | 1 of 12 | 9.3 / 10 |
| Skill v2 | 8 | 4 | 7.75 | 7.25 | 4 of 12 | 9.4 / 10 |

Version 1 didn't help: it added rules the speaker never gave (checks, length limits, "stop at the plan"), kept doubtful words as heard, and almost never asked anything. Version 2 adds nothing the speaker didn't ask for, writes its best guess next to what was heard (`Qonto [heard: "Conto"]`), and asks up to three questions when the result depends on something only the speaker knows. All four notes where it asked were wins.

Every self-correction ("20 %, non pardon 10 %") was handled right in both versions.

## Known limits

- The notes were written by an agent, not dictated, and each was run once. Twelve notes are enough to see a direction, not to measure a size.
- Between v1 and v2, the judge was told that a placeholder such as `[Paste the email here]` is for the speaker to fill and isn't a flaw.
- The answering model was a current Claude. A weaker model, or an agent working for hours on a task, may gain more from a structured prompt; this wasn't measured.
