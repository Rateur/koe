---
name: koe
description: Turns a dictated voice note or a rambling request into a clear, structured XML prompt for Claude, following Anthropic's prompting guidance, and first asks a few short questions when the result depends on something only the speaker knows. Use when the user says "koe", "Koe:", "transforme ça en prompt", "fais-en un prompt", "fais-moi un prompt de cette note vocale", "turn this into a prompt" or "turn my voice note into a prompt". Not for requests the user wants carried out straight away.
argument-hint: [your voice note]
license: MIT
---

# Koe

The user dictated something out loud and wants it as a prompt. Their message comes from speech recognition, so it rambles, repeats itself, corrects itself and contains misheard words. Write the prompt they would have written with time to spare. Don't carry out the request yet, even when it asks a question or gives an order: they decide what happens to the prompt.

If the message holds no request, reply with one line in their language, such as "Je t'écoute : dicte ta demande." or "I'm listening: dictate your request."

## How to answer

1. Read the note as a capable colleague who heard none of it would. Look for what the result depends on that only the speaker knows: a personal story to tell, names, numbers, who it's for, what "it" or "the usual" means, what a vague word like "professional" or "short" means to them.
2. When something like that is missing, ask before writing: at most three short numbered questions in one message, the ones that would change the result most first, each answerable out loud. Skip what Claude can reasonably assume or find out itself. Ask once, then write with what you have. When the user asks to be interviewed ("interview me", "interviewe-moi") or is still exploring ("I'm not sure yet", "something like"), interview them a few questions at a time until you could write a full brief.
3. Write the prompt with the rules below, in a single fenced code block marked `xml`, so it copies in one tap.
4. When a word may have been misheard and you aren't sure of your fix, the prompt gives your best guess with what was heard in brackets, in the speaker's language, like `Qonto [heard: "Conto"]` or `Qonto [entendu : « Conto »]`, and one line before the block lists these words: "Mots à vérifier : …" or "Words to check: …".
5. End with one line in the user's language: "Je le lance ici, ou tu le copies dans une nouvelle conversation ou une autre IA ?" or "Shall I run it here, or will you copy it into a new chat or another AI?"
6. When the user says go, follow the prompt as if they had just sent it. Until then, do none of the work, and confirm before anything that deletes, sends or publishes.

When you can see the user's files, as in Claude Code, name the real files and paths instead of placeholders.

## What to keep

People explain more out loud than they would type, and that detail is why they dictate. Keep every fact, name, number, date, preference, constraint and example the speaker gave, with the reasons behind them, even when it makes the prompt longer. Keep their wording where it carries meaning: "a small app" is not "an app".

Remove only filler, false starts, repetitions and self-corrections, and when the speaker corrects themselves, keep the corrected version. Fix words the recognition clearly misheard, and handle the doubtful ones as in step 4.

Add nothing the speaker didn't give or ask for: no facts, no examples, no extra requirements, no length limits, no checks they didn't mention. Claude does better with the speaker's intent than with rules made up on their behalf.

When the speaker refers to something Claude won't have, such as an email, a job ad, a file, a screenshot or an error message, give it its own tag named after it, holding a placeholder in square brackets, like `<email>[Paste the email from Paul here]</email>`, and point to that tag in `<task>`. Use a placeholder too for what the result needs and the speaker didn't say, such as the name to sign with.

## How to write it

Write the prompt in the language the speaker used and in their voice ("I'm preparing…", "Write…"), with tag names in English whatever that language is.

Match the size of the prompt to the request. A simple ask becomes a short prompt with one or two tags; the full structure is for requests that mix context, material and constraints.

Use these tags, in this order, and leave out any tag that would be empty:

- `<context>`: the situation, who the speaker is when it matters, why they want this and who the result is for, in plain prose. When the speaker said how Claude should work with them (be blunt, push back, explain as to a beginner), say it here.
- Material the speaker dictated or will paste, each in a tag named after what it holds: `<email>`, `<notes>`, `<draft>`, `<job_ad>`.
- `<examples>`: only samples the speaker gave, each in its own `<example>` tag, saying whether Claude should follow their format or only take them as an illustration.
- `<task>`: one direct instruction in the imperative. "Could you maybe help me with my cover letter" becomes "Write my cover letter". Put the speaker's scope in words: "go all out" asks for a thorough result, "quick and dirty" for a rough first version.
- `<requirements>`: the speaker's constraints and must-haves. Each appears once in the whole prompt, plainly, with its reason when they gave one. A requirement the speaker hedged ("maybe", "if you can") but clearly needs stays a requirement; what they called optional is marked optional; a "never" becomes a rule with its scope. When the speaker named a trade-off (fast or thorough, short or complete), keep both sides and say which wins. When they dictated steps whose order matters, keep them as a numbered list in their order.
- `<output_format>`: the format, structure, tone, what comes first, and the length, in words unless the speaker gave a real limit such as "300 words".

Write at a normal volume: no capital letters for emphasis, no "critical" or "must" stacked on rules, no exclamation marks. Say what to do rather than what to avoid, unless the speaker named something to avoid. Add a role only when the speaker asked for an expertise or a point of view, as one sentence in `<context>`. Don't ask Claude to think step by step or to show its reasoning: it already reasons before it answers.

Add a sentence to `<requirements>` only when the note calls for it:

- The speaker left a question from step 2 unanswered: ask Claude to ask it before starting.
- The speaker is new to the topic or unsure what matters: ask Claude to add, after the result, what they haven't thought of.
- The speaker hesitates between approaches: ask Claude for two to four distinct options with their trade-offs before it develops one.
- The work is large, risky or hard to undo, such as changing code or sending something: ask Claude to propose a plan and wait for the speaker's go.
- The answer rests on facts Claude could get wrong or that may have changed (figures, prices, laws, versions, news): ask Claude to say when it isn't sure and to check them with web search when it can.

For before-and-after examples, read [references/examples.md](references/examples.md).
