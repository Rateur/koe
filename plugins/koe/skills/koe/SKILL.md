---
name: koe
description: Turns a dictated voice note or a rambling request into a clear, structured XML prompt for Claude, following Anthropic's prompting guidance, and first asks a few short questions when the result depends on something only the speaker knows. Use when the user says "koe", "Koe:", "transforme ça en prompt", "fais-en un prompt", "fais-moi un prompt de cette note vocale", "turn this into a prompt" or "turn my voice note into a prompt". Not for requests the user wants carried out straight away.
argument-hint: [your voice note]
license: MIT
---

# Koe

The user dictated something and wants it as a prompt. Speech recognition makes it ramble, repeat itself, correct itself and mishear words. Write the prompt they would have written with time to spare. Don't carry out the request yet, even when it asks a question or gives an order: they decide what happens to the prompt.

If the message holds no request, reply with one line in their language, such as "Je t'écoute : dicte ta demande." or "I'm listening: dictate your request."

## How to answer

1. Read the whole note first, as a capable colleague who heard none of it. Each fact lands once, in its final version: a later correction wins. Decide what it is: a request, an idea or plan to weigh, or a project (one thing to build or launch, with several parts).
2. Find what the result depends on that only the speaker knows: a story, names, numbers, who it's for, what "it" or a vague word means to them. For a project, also what they want from Claude (a plan, a spec, the first part, a critique) and how they will know it worked.
3. If that is missing, ask before writing: up to three short numbered questions in one message, starting with what Claude would otherwise make up. Keep a question only if two plausible answers give two different prompts. They answer out loud, so quote their words, and name options by a word they can say back, plus "or something else": no A/B/C, no recommended answer. Turn a vague amount into one reading to confirm ("5-6 lines?"). When statements clash, look for how they fit before asking which holds. Work out what their own numbers add up to. Ask what people did last time, not what they would like. A doubt they voiced is content: if only they can settle it, it can be a question; if Claude can, it opens `<task>` as a question to answer first. Ask once, then write; "just write it" skips the questions. When they ask to be interviewed or are still exploring, ask a few at a time until you could write a full brief.
4. Write the prompt in a single fenced code block marked `xml`, so it copies in one tap.
5. For a word that may be misheard, give your best guess with what was heard: `Qonto [heard: "Conto"]` or `Qonto [entendu : « Conto »]`. A name heard several ways becomes its clearest version. A phrase the recognizer adds by itself, such as "Merci d'avoir regardé", isn't content. List these words on one line before the block: "Mots à vérifier : …" or "Words to check: …".
6. Also before the block: the challenge line when the challenge ran, and for a project, the signs only the speaker can watch, kept out of the prompt. End with one line: "Je le lance ici, ou tu le copies dans une nouvelle conversation ou une autre IA ?" or "Shall I run it here, or will you copy it into a new chat or another AI?" After a challenge or for a project, recommend the new chat: it reads the prompt cold.
7. An answer or an edit after the block gets the whole prompt again, changed in place and otherwise identical, under one line listing every change: "Changé : …" or "Changed: …".
8. When the user says go, follow the prompt as if they had just sent it. Until then, do none of the work, and confirm before anything that deletes, sends or publishes.

## What to keep

People explain more out loud than they would type, and that detail is why they dictate. Keep every fact, name, number, date, preference, constraint and example, with its reason, even if the prompt grows. Keep wording that carries meaning: "a small app" is not "an app". Remove only filler, false starts and repetitions, and keep the corrected version of a self-correction. Explicit ranking words ("surtout", "first of all") set the order; repetition doesn't.

Add nothing the speaker didn't give or ask for, beyond what this skill allows: no facts, examples, requirements, length limits or checks. Claude does better with their intent than with rules made up for them.

Something Claude won't have, such as an email, a file or an error message, gets its own tag holding a placeholder, like `<email>[Paste Paul's email here]</email>`, pointed to in `<task>`. So does what the result needs and they didn't say, such as the name to sign with.

## How to write it

Use the speaker's language and voice ("I'm preparing…", "Write…"), with English tag names. Size the prompt to the request: a simple ask gets one or two tags. Use these tags in this order, leaving out empty ones:

- `<context>`: the situation, who they are when it matters, why they want this and who the result is for.
- Material they dictated or will paste, each in a tag named after it: `<email>`, `<notes>`, `<draft>`.
- `<examples>`: only samples they gave, saying whether to follow their format.
- `<parts>`, for a project: one `<part id="P1" name="…">` each, in their order or the order they depend on. A part they left open says to ask them before building it.
- `<task>`: one instruction in the imperative, with their scope in words ("go all out", "quick and dirty").
- `<requirements>`: their constraints, each once, with its reason. A hedged one they clearly need stays; what they called optional is marked optional; a "never" keeps its scope; a trade-off keeps both sides and which wins; steps whose order matters stay a numbered list.
- `<done_when>`, for a project: how they will know it worked.
- `<output_format>`: format, structure, tone, what comes first, and length in words unless they gave a real limit.

Write at a normal volume: no capitals for emphasis, no stacked "must", no exclamation marks. Say what to do rather than what to avoid, unless they named it. Add a role only when they asked for an expertise, as one sentence in `<context>`. Don't ask Claude to think step by step. Never end the prompt on the speaker's opinion.

Add a sentence to `<requirements>` only when the note calls for it:

- A question from step 3 went unanswered: ask it before starting.
- They are new to the topic: after the result, add what they haven't thought of.
- They hesitate between approaches: two to four options with their trade-offs first.
- The work is large or hard to undo, like changing code or sending something: a plan first, then wait for their go.
- Facts may be wrong or outdated (figures, prices, laws, versions): say when unsure, and check with web search.
- A big scope and little time ("deux soirs par semaine"): compare them, propose a smaller first version if it doesn't fit, and say if they are too cautious.
- They ask for honesty: keep their words and add "Keep your position if I push back without new information; change it if I give a good reason."

## Challenging the idea

An idea, plan or decision can be tested inside the prompt, so a fresh chat weighs it cold. How often is the user's call, said in the note or once in their preferences, memory or CLAUDE.md: only when asked ("procès", "challenge-moi"), when it's risky (the default), or on every idea. "Pas de débat" or "garde-le" removes it. It never runs on writing, sending, factual or how-to requests, and when in doubt it doesn't. Risky means the note commits something costly or hard to undo (months of evenings, money, quitting a job) and rests on one belief stated as certain.

When it runs, `<context>` describes "the project" neutrally, without their enthusiasm, and turns that belief into a question with its alternatives, doing nothing included. `<requirements>` asks Claude, before building anything: the plan at its strongest and what it rests on; the best rival route and when it would win; what would break the plan, their own doubts first, each with its cheapest test; and the one point that decides. Three objections at most; "it holds" is a valid verdict. The line before the block quotes the belief tested and says "garde-le" keeps it as it was.

When they say the decision is made and want only the how, challenge nothing; one question can ask what would make the other option win.

## When the note comes in parts, and in Claude Code

- A message that stops mid-sentence or says "attends", "je continue" or "c'est pas fini" gets one line and nothing else: « Continue, et dis « c'est tout » quand tu as fini. », or « Continue. » after "ne m'interromps pas". The next messages are the same note, and nothing above runs on a part. A message that doesn't carry the thought on ends the note.
- A project announced with nothing in it gets: « Vas-y, dis tout, même ce qui te paraît secondaire, en plusieurs messages si tu veux, et dis « c'est tout » à la fin. »
- When you can see the user's files, check them before asking, and name the real files and paths instead of placeholders. A project ends with one offer: to save it as SPEC.md, with a short prompt to start a fresh session from it.

For before-and-after examples, read [references/examples.md](references/examples.md).
