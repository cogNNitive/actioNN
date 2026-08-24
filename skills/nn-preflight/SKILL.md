---
name: nn-preflight
description: Environment readiness gate for cogNNitive workflows. Runs Tier 1 checks (Node.js >= 18, innfo-mcp availability, workspace layout) and optional Tier 2 checks (iNNfo output workspace structure), then reports blockers/warnings/ok. Also provides the canonical skill-location reference used by nn-skills-lifecycle. Triggers: preflight, readiness, environment check, "run Tier 1".
version: "V_0-1-0"
last_updated: 2026-08-03
metadata:
  source_type: original
license: MIT
compatibility: opencode, claude-code, cursor, any agent supporting skills
---

# nn-preflight

## Activation Contract (MANDATORY)

When loaded, the agent MUST print exactly:

```
🔧 You're using skill: nn-preflight (🛡️)
```

as its very first output — before any questions, analysis, or tool calls. Session-scoped: only once per conversation.

## Role

Environment readiness gate for cogNNitive workflows. Runs deterministic checks and reports blockers, warnings, and confirmations. Never fabricates a pass for a check that was not run.

---

## Tier 1 Checks (always run)

1. **Node.js**: run `node --version`; require >= 18. Report the detected version.
2. **innfo-mcp availability**: call `innfo-mcp_list_models`; if the MCP tool is unavailable, fall back to checking that the bundle exists at `.cogNNitive/mcp-bundle.js` (relative to the actioNN repo root).
3. **Workspace layout**: verify the expected directories exist — `sources/`, `models/`, `procedures/`, `artifacts/`, `index.md` (as appropriate for the workflow; `nn-trannsform` projects use `sources/original/` and `sources/nn/`).

## Tier 2 Checks (optional — only for iNNfo output workflows)

4. **iNNfo output workspace structure**: for Level 3 model workflows, verify `models/` holds `*_NN.md` files and that `index.md` exists with `# NN index` as the entry point.

---

## Report Format

Present exactly three sections, each a bullet list:

```markdown
## Blockers
- <blocker, if any>

## Warnings
- <warning, if any>

## OK
- <check that passed>
```

- A check that was not run MUST NOT be listed as OK.
- If a blocker exists, the invoking skill asks the user before continuing.

---

## Reference

`reference/skill-locations.md` — canonical locations of installed skills, MCP bundles, and the exact PowerShell for Junction/Symlink detection and creation. `nn-skills-lifecycle` reads this file and MUST NOT hardcode paths.

---

## Core Rules

1. **Never fabricate a pass**: a check that was not executed is reported as a warning, never as OK.
2. **Consent first**: never mutate the environment during a preflight; it only inspects and reports.
3. **Canonical reference**: path and link conventions live in `reference/skill-locations.md` — update them there, not in consuming skills.
