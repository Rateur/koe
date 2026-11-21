# Notes for coding agents

Koe's rules are in [CONTRIBUTING](.github/CONTRIBUTING.md): start with [How the repository is laid out](.github/CONTRIBUTING.md#how-the-repository-is-laid-out).

Pull requests target `dev`, from a `type/what` branch such as `fix/trigger-in-french`, with a [Conventional Commit](https://www.conventionalcommits.org) title. Before you finish, run what CI runs:

```bash
npm run lint && npm run check && npm test
claude plugin validate . && claude plugin validate plugins/koe --profile directory
```

A release does more: follow [docs/releasing.md](docs/releasing.md).

Never:

- Keep a second copy of the skill's rules. `plugins/koe/skills/koe/SKILL.md` is the only one.
- Rename the skill or its folder `plugins/koe/skills/koe/`: installs and the release zip depend on the folder name matching `name: koe`.
- Put anything in `plugins/koe/` that users don't need. Every install copies that folder, and a `package.json` there makes Claude Code run npm for each user.
- Add a dependency, a network request or tracking without agreeing on it first.
- Push to `main`.
