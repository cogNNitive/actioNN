---
name: nn-workflow-orchestrator
description: (DEPRECATED - Integrated into nn-trannsform) Multi-step transformation procedure orchestrator. Delegates directly to nn-trannsform using procedures_V_0-2-0_NN.md. Invoke with /nn-trannsform.
disable-model-invocation: true
version: "V_2-1-0"
last_updated: 2026-07-27
license: MIT
compatibility: ">=1.0.0"
metadata:
  source_type: "integrated"
---

# nn Workflow Orchestrator (Integrated into `nn-trannsform`)

> ⚠️ **Notice**: Workflow and transformation pipeline orchestration has been unified under **`nn-trannsform`**.
> All workflow specifications have been standardized onto the official iNNfo procedure template spec: **`procedures_V_0-2-0_NN.md`**.

## Redirection Protocol

When this skill is invoked via `/nn-workflow-orchestrator`, automatically load and delegate execution to **`nn-trannsform`**:

```markdown
1. Load skill("nn-trannsform")
2. Follow procedures_V_0-2-0_NN.md spec rules for Work, Artifacts, Tools, and Roles.
```

---

## Standardized Procedure Format (`procedures_V_0-2-0_NN.md`)

All multi-step transformation procedures are stored in `procedures/` as `*_procedures_V_x-y-z_NN.md` files:

- **Work**: Transformation steps (`step_type: task|decision|event`, `input`, `output`, `tool`)
- **Artifact**: Produced/consumed deliverables (in `artifacts/exports/`)
- **Tools**: Executing skills and scripts (`nn-trannsform`, Node scripts, MCP)
- **Roles**: Executants (`Agent`, `User`, `System`)
- **Matrices**: `work-tools`, `work-artifacts`, `work-roles` (RACI)

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
