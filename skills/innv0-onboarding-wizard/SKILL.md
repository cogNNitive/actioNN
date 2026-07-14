---
name: innv0-onboarding-wizard
description: >
  Conversational wizard for creating an iNNfo model from scratch. Walks the
  user through template selection, model naming, and workspace scaffolding.
  Trigger after bootstrap (CogNNitive flow) or when the user wants to create
  a new model step by step.
version: "1.0"
last_updated: 2026-07-15
license: MIT
compatibility: opencode, claude-code, cursor, any agent supporting skills
metadata:
  source_type: original
---

# iNNv0 Onboarding Wizard

Conversational wizard that guides the user through creating an iNNfo model from scratch. Designed to be invoked after bootstrap (as the CogNNitive workflow) or standalone.

## When to use

- User selected "CogNNitive" from the bootstrap workflow menu
- User says "crear un modelo", "nuevo modelo", "empezar un modelo"
- User wants to scaffold a new iNNfo model workspace

## Flow

### Step 1: Explain what templates are

Before presenting options, briefly explain:

> Los templates son la estructura base de un modelo iNNfo. Definen qué conceptos podés modelar, qué campos tiene cada uno, y cómo se relacionan entre sí. Son como un schema o plantilla que le da forma a tu modelo sin que tengas que inventar todo desde cero.
>
> Más info: https://github.com/innV0/cogNNitive/blob/main/specs/latest/level2/README.md

### Step 2: Template selection

Present a numbered menu. Do not recommend one — let the user choose.

```
[a] Business 🏢 — Mercado, equipo, finanzas, ops, estrategia
[b] Procedures 📋 — Workflows paso a paso, roles, artefactos
[c] Organization 👥 — Posiciones, roles, miembros, reporting
[d] Blank ⬜ — Concepto único "Topic", arrancás de cero
[x] Cancelar
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
✓ Nombre: {ModelName}
📄 Archivo: {ModelName}_V_1-0-0_{Template}_NN.md
```

### Step 4: Workspace scaffolding

Create the directory structure:

```
eNNvironment/CogNNitive/{ModelName}/
├── README.md              — Entrada del workspace
├── index.md               — Índice con wikilinks
├── AGENTS.md              — Instrucciones para AI agents
├── {Model}_V_1-0-0_{Template}_NN.md  — El modelo (bare)
├── inputs/                — Para workflow de importación
├── .specs/                — Caché de especificaciones
└── traNNsform/            — Pipeline de transformación
```

The `_NN.md` model file must have:
```yaml
---
spec_version: "V_0-2-0"
spec_url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/latest/level1/iNNfo_NN.md"
level: 3
parent_spec:
  name: "{Template}_V_x-y-z"
  url: "https://raw.githubusercontent.com/innV0/cogNNitive/main/specs/latest/level2/{template}/{template}_NN.md"
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
✅ Modelo creado: {ModelName}
✅ Workspace en eNNvironment/CogNNitive/{ModelName}/
✅ Modelo validado

¿Qué querés hacer ahora?

[a] Wizard guiado — Te hago preguntas para construir el modelo paso a paso
[b] Partir de información existente — Poné archivos en inputs/ y disparo importación
[c] Agregar elementos manualmente
[d] Abrir en cogNNitive editor
[x] Listo por ahora
```

#### Option A: Wizard guiado

For each concept in the template, ask one question at a time:
1. Start with the first concept (e.g., "Procedure" for Procedures template)
2. Ask "¿Cuál es el primer {concept} de {ModelName}?"
3. After user answers, ask for fields one by one
4. Move to the next concept
5. At any point, user can say "suficiente" to stop

Ask one question at a time. Wait for the answer before proceeding.

#### Option B: Import from inputs/

1. Check if `inputs/` has files
2. If yes: "Encontré {N} archivos en inputs/. ¿Querés que los procese?"
3. If no: "No hay archivos en inputs/. Poné los documentos que quieras procesar en eNNvironment/CogNNitive/{ModelName}/inputs/ y volvé."
4. When files are present, trigger the innv0-trannsform skill with the import workflow

## Edge cases

- **Cancel at any step**: no files created, clean exit
- **Invalid model name**: reject with clear message, reprompt
- **Template with no MCP available**: warn user that validation requires innfo-mcp
- **Workspace already exists**: check before creating; if exists, ask "El directorio ya existe. ¿Querés actualizar los archivos existentes o crear con otro nombre?"
