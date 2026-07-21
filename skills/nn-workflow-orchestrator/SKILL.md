---
name: nn-workflow-orchestrator
description: Run, create, or discover multi-skill workflows. Entry point for document transformation pipelines. Invoke with /nn-workflow-orchestrator.
disable-model-invocation: true
version: "V_2-0-0"
last_updated: 2026-07-12
license: MIT
compatibility: ">=1.0.0"
metadata:
  source_type: "original"
---

# nn Workflow Orchestrator

Entry point for multi-skill workflows. Pick a branch below.

---

## Branches

### [a] Run — execute an existing workflow

1. Ask for the workspace directory (see [`reference/locations.md`](reference/locations.md))
2. **Run preflight gate:**
   - Load `nn-preflight` via `skill("nn-preflight")`
   - Tell it: "Run Tier 1 with dependencies nn-innfo, nn-trannsform. Workspace is [workspace-dir]."
   - If any stage involves iNNfo templates, also request Tier 2
   - If any blocker exists, ask the user before continuing
3. List available workflows (recent + scanned from `workflows/`)
4. User picks one → load and parse it (see [`reference/workflow-format.md`](reference/workflow-format.md))
5. **For each stage:**
   - Report: `Ejecutando stage [id] con skill [skill]...`
   - Load the skill via `skill(name: "[skill-name]")`
   - Communicate parameters conversationally: _"Use [input] as source, write output to [output]"_
   - For `nn-trannsform` stages: normalize raw files first using the nn-source template
   - Verify output path exists after completion
   - Pass output as input to next stage
6. **Fail-stop**: if a stage fails, stop and ask: retry or abort?
7. Show completion report (success: checkmark per stage / abort: error details)

See [`reference/stages.md`](reference/stages.md) for stage types, [`reference/errors.md`](reference/errors.md) for error messages.

### [b] Create — design a new workflow

Guide the user through:
1. **Workflow name** — short identifier
2. **Description** — one-line purpose
3. **Stages** — one by one: ID, description, skill to execute, template, input/output paths
4. Generate the workflow file with iNNfo `_NN` markers
5. Save as `workflows/<name>_V_1-0-0_workflow_NN.md`

For templates, scan `_templates/` in the workspace. For paths, offer `raw/` and `sources/` as defaults.

See [`reference/workflow-format.md`](reference/workflow-format.md) for the file format.

### [c] Discover — explore available workflows

1. Ask for the workspace directory
2. Scan `workflows/` for `*_workflow_NN.md`, `*_workflow_FORMAT.md`, `*_workflow_F.md`, `*.workflow.md`
3. Read recent workflows from persistence
4. Present combined list: recent first, then scanned (deduplicated)
5. Offer: run one, or go back

### [d] Maintain — update the skills registry

Add a new skill to the orchestration catalog. Update `reference/skills-registry.md` with:
- Skill name, entry point, input/output expectations, template availability
- Run `node scripts/build-registry.js` to sync

### [e] Direct Execute — run a workflow non-interactively

1. The caller provides a workflow file path
2. **Run preflight gate (non-interactive):**
   - Load `nn-preflight` via `skill("nn-preflight")`
   - Tell it: "Run Tier 1 with dependencies nn-innfo, nn-trannsform. Workspace is [CWD]."
   - If any blocker exists, report and stop — do not proceed
3. Load and parse the workflow file (see [`reference/workflow-format.md`](reference/workflow-format.md))
4. **For each stage sequentially:**
   - Load the required skill via `skill(name: "[skill-name]")`
   - Execute the stage with the provided input/output
   - Pass the output to the next stage
5. **Fail-stop**: if a stage fails, stop and report error (do NOT ask retry — non-interactive)
6. Return completion report with per-stage results

---

## Post-execution

After any branch completes, update recent locations and recent workflows persistence files (see [`reference/locations.md`](reference/locations.md)).
