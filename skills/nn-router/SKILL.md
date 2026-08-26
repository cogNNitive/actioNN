---
name: nn-router
description: Central system governance, setup, environment readiness gate (Preflight), and skill router for cogNNitive. Triggers: NN, nn, /nn, /nn-router, router, bootstrap, setup, preflight, "I want to use https://cognnitive.com/use".
disable-model-invocation: true
version: "3.2"
last_updated: 2026-08-02
license: MIT
compatibility: opencode, claude-code, cursor, any agent supporting skills
metadata:
  source_type: original
---

# nn System & Router

Single entry point for system governance, setup, readiness checks, and routing in the cogNNitive ecosystem.

---

## 1. Environment Readiness (Preflight Gate)

Before launching any specialized workflow, `nn-router` verifies the environment:
1. **Node.js**: Checks `node --version` (>= 18 required).
2. **MCP Server**: Verifies `innfo-mcp` responsiveness via `innfo-mcp_list_models` (or resolves bundle at `~/.agents/mcp/innfo-mcp.bundle.js`).
3. **Workspace Layout**: Ensures workspace contains standard folders (`raw/`, `models/`, `procedures/`, `artifacts/`, `index.md`).

---

## 2. System Governance & UX Protocol (MANDATORY)

Every agent interaction across the cogNNitive ecosystem MUST follow these strict UX and governance rules:

1. **Zero Unilateral Mutation (Consent First)**:
   - Prohibit moving, renaming, or deleting user files (e.g. moving raw PDFs to `sources/original/` or restructuring user directories) without prior explicit confirmation from the user.
   - Always ask for confirmation before executing file movements or workspace restructures.

2. **Recommended Option First**:
   - In all decision menus or option lists presented to the user, option `[1]` or `[a]` MUST be labeled with the `(Recomendado)` or `(Recomendada)` prefix.

3. **Multi-Selection Clarification**:
   - Whenever options are not mutually exclusive, the agent MUST add the explicit notice:
     *"Podés seleccionar una opción o una combinación (ej. A y B)"*.

4. **Visual Component & Artifact Style Selection (`nn-design-presets` Activation)**:
   - Whenever generating any visual component, web interface, HTML dashboard companion, site page, or styled deliverable artifact, the agent MUST ask the user which visual design style / preset to apply before generation.
   - This prompt MUST load and activate the **`nn-design-presets`** skill to retrieve branding tokens (e.g. `morado-nazareno`).

---

## 3. Canonical Skill Catalog (5 Core Skills)

The cogNNitive ecosystem is streamlined into 5 specialized skills:

| Skill | Role & Scope | Invocation |
|:---|:---|:---|
| **`nn-router`** | System governance, setup, preflight readiness gate & routing | User / `/nn-router` |
| **`nn-trannsform`** | Document ingestion (PDF/DOCX/XLSX), template transformation & procedures orchestration (`procedures_V_0-3-0_NN.md`) | User / Model |
| **`nn-innfo`** | iNNfo model authoring, editing, schema validation & step-by-step Model Creation Wizard (Meta-template V_0-3-0) | User / Model |
| **`nn-site-generator`** | Website generation & hydration | User / Model |
| **`nn-design-presets`** | Visual design system tokens (Morado Nazareno, 8px grid) — activated for visual artifacts | Model (Auto/User) |

---

## 4. How to Route

1. Read the generated registry: [`.cogNNitive/skill-registry.md`](../../.cogNNitive/skill-registry.md).
2. Match the user's request against the 5 core skills above.
3. For model authoring/wizard → Load **`nn-innfo`**.
4. For documents, transformations or multi-step procedures → Load **`nn-trannsform`**.
5. For web design or site generation → Load **`nn-site-generator`** / **`nn-design-presets`**.

---

## If the user doesn't know where to start

Ask them to describe their current situation in one sentence, then recommend the
single best-fit skill from the registry — do not dump the whole list. Always format the recommendation with `(Recomendado)` as option `[a]`.
