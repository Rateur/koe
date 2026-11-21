# Releasing

A release goes from `dev` to `main`, then a tag on `main` drafts the GitHub release with `koe.zip`.

1. **Prepare, on a branch from `dev`.** Bump the version in both places:

   ```bash
   npm version 0.2.0 --no-git-tag-version
   ```

   Set the same version in `plugins/koe/.claude-plugin/plugin.json` (a test fails until they match). Add a section to `CHANGELOG.md`, written for users, not developers, and bring the README up to date in English and French. Open a pull request into `dev` titled `chore: release 0.2.0`.

2. **Ship to `main`.** Open a pull request from `dev` to `main` and merge it with **Create a merge commit**. Merging publishes the site through the Site workflow, and plugin installs that follow `main` see the new version.

3. **Tag `main`.**

   ```bash
   git fetch origin
   git tag -s v0.2.0 origin/main -m "Koe v0.2.0"
   git push origin v0.2.0
   ```

4. **Publish.** The tag starts the Release workflow. It checks that the tag matches the version, zips `plugins/koe/skills/koe` as `koe.zip` and opens a draft release with the notes from `CHANGELOG.md`. Upload `koe.zip` to a claude.ai account once to check it loads, then click **Publish release** with **Set as the latest release** checked. The site's download link points to `releases/latest/download/koe.zip`.
