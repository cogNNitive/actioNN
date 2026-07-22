---
name: nn-onboarding-wizard
description: >
  Conversational wizard for creating an iNNfo model from scratch. Walks the
  user through template selection, model naming, and workspace scaffolding.
  Trigger after bootstrap (CogNNitive flow) or when the user wants to create
  a new model step by step.
version: "1.1"
last_updated: 2026-07-22
license: MIT
compatibility: opencode, claude-code, cursor, any agent supporting skills
metadata:
  source_type: original
---

# cogNNitive Onboarding Wizard

Conversational wizard that guides the user through creating an iNNfo model from scratch. Designed to be invoked after bootstrap (as the CogNNitive workflow) or standalone.

## When to use

- User selected "CogNNitive" from the bootstrap workflow menu
- User says "create a model", "new model", "start a model"
- User wants to scaffold a new iNNfo model workspace

## Flow

### Step 1: Explain what templates are

Before presenting options, briefly explain:

> Templates are the base structure of an iNNfo model. They define which concepts you can model, what fields each one has, and how they relate to each other. They are like a schema or blueprint that gives your model shape without you having to invent everything from scratch.
>
> More info: https://github.com/cogNNitive/iNNfo/blob/main/specs/latest/level2/README.md

### Step 2: Template selection

Present a numbered menu. Do not recommend one — let the user choose.

```
[a] Business 🏢 — Market, team, finances, ops, strategy
[b] Procedures 📋 — Step-by-step workflows, roles, artifacts
[c] Organization 👥 — Positions, roles, members, reporting
[d] Blank ⬜ — Single "Topic" concept, start from scratch
[x] Cancel
```

If cancelled → exit cleanly, no files created.

### Step 3: Model naming

Ask for the model name. Validate:
- No filesystem-incompatible characters: `<>:"/\|?*`
- If invalid → "Model name contains invalid characters. Use letters, numbers, hyphens, or underscores."

Generate the filename: `{ModelName}_V_1-0-0_{Template}_NN.md`

Show a preview before creating:

```
✓ Template: {Template}
✓ Name: {ModelName}
📄 File: {ModelName}_V_1-0-0_{Template}_NN.md
```

### Step 4: Workspace scaffolding

Create the directory structure:

```
eNNvironment/CogNNitive/{ModelName}/
├── README.md              — Workspace entry point
├── index.md               — Index with wikilinks
├── AGENTS.md              — Instructions for AI agents
├── {Model}_V_1-0-0_{Template}_NN.md  — The model (bare)
├── inputs/                — For the import workflow
├── .specs/                — Specification cache
└── traNNsform/            — Transformation pipeline
```

The `_NN.md` model file must have:
```yaml
---
spec_version: "V_0-2-0"
spec_url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level1/iNNfo_NN.md"
level: 3
parent_spec:
  name: "{Template}_V_x-y-z"
  url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/{template}/{template}_NN.md"
model_version: "V_1-0-0"
title: "{ModelName}"
---
```

### Step 5: Validate

Run `validate_model({ id })` via innfo-mcp if available. Report result:
- Valid → proceed
- Invalid → show errors, offer to fix or retry

### Step 6: Post-creation menu

After successful creation:

```
✅ Model created: {ModelName}
✅ Workspace at eNNvironment/CogNNitive/{ModelName}/
✅ Model validated

What do you want to do now?

[a] Guided wizard — I ask you questions to build the model step by step
[b] Start from existing information — Drop files in inputs/ and I trigger the import
[c] Add elements manually
[d] Open in the cogNNitive editor
[x] Done for now
```

#### Option A: Guided wizard

For each concept in the template, ask one question at a time:
1. Start with the first concept (e.g., "Procedure" for Procedures template)
2. Ask "What is the first {concept} of {ModelName}?"
3. After user answers, ask for fields one by one
4. Move to the next concept
5. At any point, user can say "enough" to stop

Ask one question at a time. Wait for the answer before proceeding.

#### Option B: Import from inputs/

1. Check if `inputs/` has files
2. If yes: "I found {N} files in inputs/. Do you want me to process them?"
3. If no: "There are no files in inputs/. Drop the documents you want to process into eNNvironment/CogNNitive/{ModelName}/inputs/ and come back."
4. When files are present, trigger the nn-trannsform skill with the import workflow

## Edge cases

- **Cancel at any step**: no files created, clean exit
- **Invalid model name**: reject with clear message, reprompt
- **Template with no MCP available**: warn user that validation requires innfo-mcp
- **Workspace already exists**: check before creating; if exists, ask "The directory already exists. Do you want to update the existing files or create one with a different name?"
