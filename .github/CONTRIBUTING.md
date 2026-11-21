# Contributing

Koe is open source, but it isn't open to contributions: pull requests can only be opened by the maintainer, and issues are off. The code is MIT, so fork it and make it yours.

The rest of this page is how the maintainer, and the coding agents working for him, change Koe.

## Branches

`main` is what users get: the skill that installs from GitHub and the site at [koe.rateur.fr](https://koe.rateur.fr). It only changes when `dev` is merged for a release.

`dev` is where work lands. Each change goes through a pull request against `dev`, from a branch named after what it does: `feat/interview-mode`, `fix/trigger-in-french`, `docs/install-steps`, `chore/release-0.2.0`.

Pull requests into `dev` are squash-merged, so the PR title becomes the commit message. Write it as a [Conventional Commit](https://www.conventionalcommits.org): `feat: ask before writing when the voice note is vague`, `fix(site): keep the copy button working in in-app browsers`.

## How the repository is laid out

- `skills/koe/SKILL.md` is the skill, and the single source of its rules. `skills/koe/references/examples.md` holds the before and after examples the skill reads when it needs them.
- `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` make the repository a plugin marketplace, so Claude and Claude Code can install Koe from its GitHub link. `.claude-plugin/icon.png` is its icon.
- `index.html`, `src/main.ts` and `src/style.css` are the site. It imports `SKILL.md` at build time, so the text it copies for other chats is always the skill's.
- `src/lib/prompt.ts` builds that text and the link that opens Claude. `src/lib/i18n.ts` holds the site's words in French and English. `src/lib/skill.test.ts` checks the skill the way agents load it.
- `.github/workflows/`: `ci.yml` checks every pull request, `site.yml` publishes the site from `main`, and `release.yml` drafts a release with `koe.zip` from a version tag.

## Before you push

Run what CI runs:

```bash
npm run lint && npm run check && npm test && npm run build
```

When the skill or the plugin files change, also validate them with Claude Code:

```bash
claude plugin validate .
```

TypeScript has no formatter here: match the surrounding style (single quotes, no semicolons, 2 spaces).

## What a change must cover

- One change per pull request.
- A change to `SKILL.md` keeps the rules short and in plain words, and says why when the reason isn't obvious. The skill's examples change with it.
- A change users can see updates the README in English and French, and the site's words in both languages.
- No dependency, network request or tracking, unless it's agreed first. The site has no server and collects nothing.
- Known limits get a `// shortcut: <the limit>, <when to upgrade>` comment, not a `TODO`.

Releases follow [docs/releasing.md](../docs/releasing.md).
