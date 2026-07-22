# Canonical Skill Locations & Detection

Single source of truth for **where cogNNitive skills live** and **how to detect
whether a skill is installed**. Any skill that needs to check or resolve an
installed skill MUST use this convention instead of hardcoding its own paths.

Owned by `nn-preflight`. Consumed by `nn-preflight` (detection) and
`nn-skills-lifecycle` (installation). `agent-web-bootstrap` intentionally does
NOT depend on this file: it runs before any skill is installed and resolves
everything from canonical web URLs.

---

## Locations (in priority order)

| # | Location | Meaning |
|---|----------|---------|
| 1 | `<available_skills>` block in the system prompt | Skill is loaded and active in this session |
| 2 | `~/.agents/skills/<name>/SKILL.md` | Installed for all skill-aware agents (junction/symlink target) |
| 3 | `~/.config/opencode/skills/<name>/SKILL.md` | Installed for OpenCode specifically |

A skill is considered **installed** if it is found at any of the three.

---

## Detection

For a skill `<name>`:

1. Look for a matching `name` field in the `<available_skills>` block. If present → **installed (active)**.
2. Else `Test-Path "~/.agents/skills/<name>/SKILL.md"`. If true → **installed**.
3. Else `Test-Path "~/.config/opencode/skills/<name>/SKILL.md"`. If true → **installed**.
4. None of the above → **missing**. Offer to install via `nn-skills-lifecycle`.

## Installation (nn-skills-lifecycle owns this)

Detection is read-only. Creating the links is `nn-skills-lifecycle`'s job. The
canonical install targets location #2 above:

```powershell
New-Item -ItemType Junction -Path "~/.agents/skills/<name>" -Target "<abs-path>\skills\<name>"
```

Detect an existing link type with:

```powershell
Get-Item -Path "~/.agents/skills/<name>" | Select-Object LinkType, Target
```
