---
name: nn-skills-lifecycle
description: Install, create, audit, and maintain cogNNitive skills. Entry point for the skill ecosystem. Invoke with /nn-skills-lifecycle.
disable-model-invocation: true
version: "1.1"
last_updated: 2026-07-22
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

Check what skills exist in `skills/`, cross-reference against the canonical
install locations, present a status table, and offer to install missing ones via
Junction (recommended) or Symlink.

Locations, detection, and the exact PowerShell for LinkType detection and
Junction creation are defined once in the canonical convention:
[`nn-preflight/reference/skill-locations.md`](../nn-preflight/reference/skill-locations.md).
Use it — do not hardcode paths here.

After any operation, re-render the table.

---

### Create — new skill

Delegate to `skill-creator`.

---

### Audit — review and improve

Delegate to `skill-improver` for a quality audit. Pass exact SKILL.md paths.

---

### Maintenance — full review

1. Read `.cogNNitive/skill-registry.md`
2. Identify orphaned or unused skills
3. Check frontmatter compliance across all skills
4. Verify registry is up to date
5. Delegate fixes to the appropriate sub-skills
6. Run `skill-registry` to regenerate `.cogNNitive/skill-registry.md`
7. Report summary: what was done, new count, remaining items

---

## Hard Rules

- Never load alongside `skill-creator`, `skill-improver`, or `skill-registry` in the same context
- Always update the registry after any create, move, rename, or delete
- Never modify a `SKILL.md` directly — delegate to the specialist
