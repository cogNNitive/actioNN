---
name: nn-router
description: Entry point for cogNNitive skills. Reads the generated skill registry and tells you which skill to use for what. Invoke with /nn-router.
disable-model-invocation: true
version: "2.0"
last_updated: 2026-07-22
license: MIT
compatibility: opencode, claude-code, cursor, any agent supporting skills
metadata:
  source_type: original
---

# nn Router

Single entry point for the cogNNitive skill ecosystem. This skill does **not**
maintain its own list of skills — that would drift. The canonical catalog is the
auto-generated registry.

---

## How to route

1. Read the generated registry: [`.cogNNitive/skill-registry.md`](../../.cogNNitive/skill-registry.md).
   It lists every installed skill with its **Invocation** type (user vs model),
   its trigger/description, and its path.
2. Match the user's need against the `Trigger / Description` column.
3. Route:
   - **user** invocation → tell the user to type `/skill-name`, or invoke it for them.
   - **model** invocation → the skill auto-activates on its trigger; just name it
     and let it fire, or load it directly when the context already matches.
4. If nothing matches cleanly, ask the user to describe their situation in one
   line and recommend the closest skill.

> If the registry looks stale or a skill is missing from it, regenerate it with
> `node scripts/build-registry.js`, then re-read it.

---

## Quick orientation

The ecosystem groups into three intents. Use the registry for the exact skill,
this map only for orientation:

- **Author & model** — create/edit iNNfo models, templates, and documents.
- **Transform & orchestrate** — turn raw documents into Markdown and chain
  multi-skill pipelines (workflows).
- **Environment & maintenance** — bootstrap the ecosystem, install/audit skills,
  run readiness checks, generate sites, pick the right model.

---

## If the user doesn't know where to start

Ask them to describe their current situation in one sentence, then recommend the
single best-fit skill from the registry — do not dump the whole list.
