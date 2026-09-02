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

## Dynamic SOP & Skill Discovery via `nn-innfo`

In addition to static manifest pinning, skills and SOP procedures attached to template packages are dynamically discovered at runtime via `nn-innfo` and `innfo-mcp`:

1. **`list_template_procedures`**: Discovers executable SOP procedure spec files (`procedures/`) across composite template inheritance trees up to depth 10.
2. **`list_template_skills`**: Discovers agent skills (`skills/`) declared across composite template inheritance trees up to depth 10.
3. **Multi-tier Resolution**: Looks up templates across `./specs/templates/<name>/<version>/`, legacy flat `./templates/`, `~/.agents/templates/`, and `~/.agents/skills/`.

## Files

```
skills/nn-skills-lifecycle/
  SKILL.md
```
