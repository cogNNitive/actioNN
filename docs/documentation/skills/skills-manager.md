---
title: "Skills Manager — cogNNitive Skill"
description: "Skill that manages the install/update/audit lifecycle of cogNNitive skills"
html_url: https://actionn.cognnitive.com/docs/#/skills/skills-manager
generator: https://actionn.cognnitive.com/nn-design-presets
---

# Skills Manager

**Skill name**: `nn-skills-lifecycle` · **Version**: 1.2 · **Updated**: 2026-08-26

## Purpose

Entry point for the skill ecosystem. Installs and updates the skills pinned in
the bootstrap manifest, delegates skill creation and quality audits to
specialist sub-skills, and keeps the local skill registry current. Invoke with
`/nn-skills-lifecycle`.

## Activation

Not auto-loaded. Invoke explicitly with `/nn-skills-lifecycle`, or when a
request matches installing, creating, auditing, or maintaining cogNNitive
skills.

## Workflow — Install / Update / Sync

The manifest at `eNNvironment/docs/use/manifest.md` is the source of truth for
desired pins: per skill, a `repo`, a full-length `commit` SHA (the integrity
anchor), a `version` string, a `path`, and optional `requires`. The local
state file `~/.agents/skills-state.json` records what is actually installed on
this machine (commit, version, `updated_at`) — it is never authoritative for
what *should* be installed.

1. **Scans** installed skills against the manifest via
   `node scripts/skills-manager.js status`, printing a table of
   `up-to-date` / `outdated` / `missing` / `untracked` / `dir-missing`, with a
   diff-file-count preview for anything outdated.
2. **Installs** missing skills with `node scripts/skills-manager.js install` —
   downloads a tarball from `https://codeload.github.com/{repo}/tar.gz/{commit}`
   and atomically copies the pinned `path` into `~/.agents/skills/{name}/`.
3. **Updates** outdated skills with `node scripts/skills-manager.js update
   [skill ...]`, same tarball mechanism, with an outdated `requires` pulled in
   automatically.
4. **Syncs** skill files between this repo's `skills/` and a target
   `--skills-dir` (default `~/.agents/skills`) with
   `node scripts/skills-manager.js sync [--direction local-to-global|global-to-local]`
   — a plain recursive copy, independent of the manifest/state file.

Every mutating command requires consent: pass `--yes` to skip the prompt;
without a TTY and without `--yes`, the script prints `needs decision: ...` and
exits `2` without applying anything.

No install method links, junctions, or symlinks a skill directory back to its
source — install, update, and sync all copy files. (A separate, manual-only
Junction/SymbolicLink reference exists in
`skills/nn-preflight/reference/skill-locations.md` for maintainers who want a
repo-local skill folder to live-link into `~/.agents/skills/`; it is not part
of this skill's automated flow.)

## Other Branches

- **Create a new skill** → delegates to `skill-creator` (with evaluation) or
  `write-a-skill` (simple scaffold).
- **Audit** → delegates to `skill-improver` (quality), `nnskills-organizer`
  (structure), or `skill-origin-guard` (origin metadata).
- **Maintenance** → reviews `.cogNNitive/skill-registry.md`, checks frontmatter
  compliance, delegates fixes, and regenerates the registry with
  `node scripts/build-registry.js`.

## Files

```
skills/nn-skills-lifecycle/
  SKILL.md
```
