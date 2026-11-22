# Changelog

What changes in each version of Koe, written for the people who use it. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- The site is one scroll along a strip of paper tape printed with a dictated note: Koe cuts out the fillers, corrects the misheard name, asks its questions, and the tape lands as the prompt Claude gets, ready to copy. If you ask your device for less motion, the tape holds still at each step; without WebGL, the steps read as text.
- The blind test is one figure: each of the 36 runs is a hole punched in the tape, next to both average scores and their 95 % intervals.

### Fixed

- On the site, a French question mark no longer sticks to the word before it.

### Removed

- The site's pictures of a rakugo storyteller and of old shorthand machines.

## [0.1.1] - 2026-11-21

### Changed

- The site's test figures come from a fairer rerun, where the raw note could ask questions too and every note ran three times: Koe's prompt won 19 times, lost 10 and tied 7 out of 36. Every time Koe asked its questions, its answer won. The method and its limits are in [evals/](https://github.com/Rateur/koe/tree/main/evals).

### Known limits

- The test notes were written for the test, not dictated, and none of the overall differences is statistically solid yet.
- From about 580 words, a note no longer fits in the link that opens Claude from the site, so Claude opens empty. The site copies your note first: paste it.
- Installing from the Claude phone app hasn't been checked. Install from a computer, and Koe then works on your phone.

## [0.1.0] - 2026-11-21

The first version.

### Added

- Say "koe" or "transforme ça en prompt", then dictate. Koe turns your note into an XML prompt for Claude, in your language: the context first, then your material, the task, your requirements and the format you want.
- Every detail and reason you gave stays. The fillers go, and your corrections win: "20 %, non pardon 10 %" becomes 10 %.
- When the result depends on something only you know, Koe first asks up to three short questions you can answer out loud.
- A word the dictation may have misheard keeps a best guess and what was heard, and is listed above the prompt.
- What Claude won't have, such as the email you're answering, gets a placeholder for you to fill.
- Nothing runs until you say so: Koe offers to run the prompt there, or to copy it into a new chat or another AI.
- Install it in the Claude app from `Rateur/koe` on a paid plan, as `koe.zip` on the free plan, in Claude Code with `/plugin install koe --marketplace Rateur/koe`, or in other agents with `npx skills add Rateur/koe`.
- [koe.rateur.fr](https://koe.rateur.fr) lets you try Koe without installing it, in French and English.

### Known limits

- Koe was tested on 12 voice notes written for the test, not dictated, and each ran once. In that test the raw note wasn't allowed to ask questions; a fairer one is running.
- From about 580 words, a note no longer fits in the link that opens Claude from the site, so Claude opens empty. The site copies your note first: paste it.
- Installing from the Claude phone app hasn't been checked. Install from a computer, and Koe then works on your phone.

[Unreleased]: https://github.com/Rateur/koe/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/Rateur/koe/releases/tag/v0.1.1
[0.1.0]: https://github.com/Rateur/koe/releases/tag/v0.1.0
