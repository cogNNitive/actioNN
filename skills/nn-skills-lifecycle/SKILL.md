---
name: nn-skills-lifecycle
description: Install, create, audit, and maintain iNNv0 skills. Entry point for the skill ecosystem. Invoke with /nn-skills-lifecycle.
disable-model-invocation: true
version: "1.0"
last_updated: 2026-07-12
metadata:
  source: actioNN
  audience: maintainer
  workflow: skills
license: MIT
compatibility: opencode
---

# nn Skills Lifecycle

Single entry point for the skill ecosystem. Classify the request into one branch below.

---

## Branches

### Steward — scan, install, junction

Check what skills exist in `skills/`, cross-reference against `~/.config/opencode/skills/` and `~/.agents/skills/`, present a status table, and offer to install missing ones via Junction (recommended) or Symlink.

Use PowerShell to detect LinkType:
```
Get-Item -Path "~/.agents/skills/<name>" | Select-Object LinkType, Target
```

For installation:
```
New-Item -ItemType Junction -Path "~/.agents/skills/<name>" -Target "<abs-path>\skills\<name>"
```

After any operation, re-render the table.

---

### Create — new skill

Delegate to the appropriate sub-skill:
- With evaluation → `skill-creator`
- Simple scaffold → `write-a-skill` (mattpocock/skills)

Do NOT load these sub-skills in the same context. Choose one and delegate.

---

### Audit — review and improve

Delegate to:
- Quality audit → `skill-improver`
- Structure / layout → `nnskills-organizer`
- Origin metadata → `skill-origin-guard`

Pass exact SKILL.md paths.

---

### Maintenance — full review

1. Read `.atl/skill-registry.md`
2. Identify orphaned or unused skills
3. Check frontmatter compliance across all skills
4. Verify registry is up to date
5. Delegate fixes to the appropriate sub-skills
6. Run `skill-registry` to regenerate `.atl/skill-registry.md`
7. Report summary: what was done, new count, remaining items

---

## Hard Rules

- Never load alongside `skill-creator`, `skill-improver`, `nnskills-organizer`, or `skill-registry` in the same context
- Always update the registry after any create, move, rename, or delete
- Never modify a `SKILL.md` directly — delegate to the specialist
