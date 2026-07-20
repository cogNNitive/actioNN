---
title: "Skills Manager — iNNv0 Skill"
description: "Meta-skill that manages the lifecycle of all repository skills"
html_url: https://skills.innv0.com/docs/#/skills/skills-manager
generator: https://skills.innv0.com/nn-design-presets
---

# Skills Manager

**Version**: 1.0 · **Installed**: 2026-06-27

## Purpose

Meta-skill that runs at the start of each session. Scans the repository, cross-references against system installation locations, and presents a panel to manage the lifecycle of all skills.

## Activation

Loaded **mandatorily at the start of each session** by order of the root `AGENTS.md`. No explicit user invocation required.

## Workflow

1. **Scans** the repo's `skills/` directory
2. **Cross-references** against `~/.config/opencode/skills/` and `~/.agents/skills/`
3. **Detects** the installation type: Junction (recommended), Symlink, or Copy
4. **Presents** a status table:

| Repo Skill | ~/.config/opencode/skills | ~/.agents/skills | Type | Status |
|---|---|---|---|---|
| nn-dev-opencode-model-router | ❌ | ✅ | Junction | Installed |
| nn-trannsform | ❌ | ✅ | Junction | Installed |
| nn-design-presets | ❌ | ✅ | Junction | Installed |

5. **Asks** if you want to install missing skills or change the link type
6. **Executes** the installation using the chosen method

## Installation Types

| Type | Command | Behavior |
|---|---|---|
| **Junction** (recommended) | `New-Item -ItemType Junction` | Reflects repo changes live |
| **Symlink** | `New-Item -ItemType SymbolicLink` | Similar, requires permissions |
| **Copy** | `Copy-Item` | Static copy, does not reflect changes |

## Files

```
skills/nn-skills-manager/
  SKILL.md
  README.md
```
