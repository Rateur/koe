# Koe

Dictate a request the way it comes to you, hesitations and corrections included. Koe turns it into a structured XML prompt for Claude: the context first, then your material, the task, the requirements with their reasons and the format you want. When the result depends on something only you know, it first asks up to three short questions you can answer out loud. It never carries out the request until you say so.

## Install

In Claude Code:

```
/plugin install koe --marketplace Rateur/koe
```

In the Claude app: Customize, Plugins, Add marketplace, then `Rateur/koe`.

## Use

Start with "koe", or say "turn this into a prompt" ("transforme ça en prompt" in French), then dictate. For example:

- "koe: I have a phone interview with Decathlon on Thursday, help me get ready"
- "turn this into a prompt: write back to Mrs Garnier about her late invoice, polite but firm"
- "koe: checkout broke after the Next.js upgrade, Stripe throws an error, I want a plan before any change"
- "koe, interview me: I'd like to organise a team offsite but nothing is decided yet"

## Privacy

Koe is instructions only. It runs no script, makes no network request and collects nothing.

Site: https://koe.rateur.fr. Source and license (MIT): https://github.com/Rateur/koe.
