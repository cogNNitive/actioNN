---
name: nn-trannsform
description: "Bootstrap projects, scan raw documents, normalize them to Markdown with mandatory provenance frontmatter, apply V_0-3-0 template-based transformations, and execute multi-step transformation procedures compliant with procedures_V_0-3-0_NN.md. Includes document ingestion, format conversion (txt, md, csv, json, docx, pdf, xlsx), procedure orchestration, and export generation. Triggers: trannsform, transform, workflow, pipeline, procedure, normalize, scan documents, document ingestion, document transformation, document processing, markdown conversion, project bootstrap"
empty_sections_mode: "ask-per-section"
license: MIT
metadata:
  version: "2.0"
  source_type: "integrated"
  source: "https://github.com/cogNNitive/actioNN/tree/main/skills/nn-trannsform"
  installed_at: "2026-08-02"
  depends_on:
    skills: ["nn-innfo"]
    mcp_servers: ["innfo-mcp"]
    cli_tools: ["scripts/index.js"]
---

# Skill: nn-trannsform

## Greeting Protocol (MANDATORY)

When this skill is activated, the agent MUST print exactly:

```
🔧 You're using skill: nn-trannsform (🔄)
```

as its very first output — before any questions, analysis, or tool calls. Session-scoped: only once per conversation.

## System & UX Governance (MANDATORY)

1. **Zero Unilateral Mutation (Consent First)**:
   - NEVER move, rename, or delete user files (e.g. moving PDFs into `sources/original/` or changing folder structure) without prior explicit confirmation from the user.
2. **Recommended Option First**:
   - In all decision menus, option `[a]` or `[1]` MUST carry the `(Recomendado)` or `(Recomendada)` prefix.
3. **Multi-Selection Clarification**:
   - When choices are non-exclusive, include the notice: *"Podés seleccionar una opción o una combinación (ej. A y B)"*.

## Preflight Gate (MANDATORY — run before any transformation)

Before any other action:
1. Load `nn-preflight` via `skill("nn-preflight")`
2. Tell it: "Run Tier 1 with dependencies nn-innfo. Workspace is [CWD]."
3. If the task involves iNNfo model output (business, procedure, catalog, etc.), also request: "Also run Tier 2."
4. Read the report. If any blocker exists, ask the user before continuing. If all checks pass (or user overrides), continue.

This skill enables the agent to interactively guide the user through document ingestion, normalization, and transformation.

---

## Interaction Flow for Agent Execution

### 1. Project Initialization & Bootstrap

Ask the user for confirmation before creating directories:
1. **Source Folder**: Where are the raw files?
2. **Project Name & Destination**: Name for the project and where to save it (recommend `%USERPROFILE%\Documents\_NN\[project-name]`).

#### Standard Workspace Directory Layout

Every project workspace MUST adhere to the following structure:

```
[project-name]/
├── raw/                 # Original user files (PDFs, Word, CSV, TXT, Excel...)
├── sources/
│   └── markdown/        # Normalized Markdown files with mandatory provenance frontmatter
├── models/              # Structured semantic iNNfo Level 3 models (*_NN.md)
├── procedures/          # Reusable transformation procedure specs (*_procedures_V_0-3-0_NN.md)
├── artifacts/           # Derivative deliverables and generated output products
│   ├── exports/         # Final deliverables (clean Markdown, HTML, PDF)
│   └── reports/         # Validation reports and audit trails
└── index.md             # Semantic workspace index (# NN index)
```

Then run:
```bash
node scripts/index.js --src "<source-folder>" --dest "<destination-parent-folder>" --name "<project-name>"
```

---

### 2. Capability Scan & Provenance Ingestion Protocol (MANDATORY)

#### 2a-0. Prepare `raw/` and Ingest to `sources/markdown/`

**All files MUST pass through `raw/` before scanner normalization.**

1. **Check if `raw/` exists** inside the project directory. If not, ask the user and create it: `mkdir raw/`
2. **Copy files into `raw/`** (preserve originals in-place; DO NOT move or delete user files without consent).
3. **Scanner Normalization with Provenance Frontmatter**:
   Every normalized file generated under `sources/markdown/` (or `md/`) MUST include the mandatory scanner traceability frontmatter:

```yaml
---
source_file: "raw/interview_transcript.pdf"
sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
size_bytes: 1048576
normalized_at: "2026-08-02T13:30:00Z"
source_id: "src-001"
---
```

> **⚠️ Traceability Requirement**: Downstream Level 3 models MUST reference `source_id` via `source_ref:: src-NNN (path#lines)`. Skipping scanner frontmatter invalidates traceability.

#### 2b. Capability Assessment — Decision Matrix

Present the diagnostic panel:

```
╔════════════╦══════════════════════╦══════════════════════════╗
║  Format    ║ Agent-native         ║ Node.js Library          ║
╠════════════╬══════════════════════╬══════════════════════════╣
║ txt        ║ ✅ Direct read       ║ —                        ║
║ md         ║ ✅ Direct read       ║ —                        ║
║ csv/json   ║ ✅ Direct read       ║ —                        ║
║ pdf        ║ ⚠️  Model-dependent  ║ pdf-parse (npm)          ║
║ docx       ║ ❌ Not available     ║ mammoth (npm)            ║
║ xlsx       ║ ❌ Not available     ║ xlsx (npm)               ║
╚════════════╩══════════════════════╩══════════════════════════╝
```

Option selection format:

```
Format: PDF (1 file)
  [a] (Recomendado) Node.js (pdf-parse) — local processing, reproducible, no extra token cost
  [b] Agent-native — depends on model, variable token cost
  [c] Skip this format

Which route do you prefer for PDF?
(Nota: Podés seleccionar una opción o una combinación)
```

---

### 3. Transformation & Level 3 Modeling (V_0-3-0 Unified Syntax)

#### 3a. Template Type: Markdown vs iNNfo V_0-3-0

When creating a new transformation, ask the user:

**"What kind of template do you want to create?"**

- **[a] (Recomendado)** iNNfo V_0-3-0 template — structured model with typed concepts, fields, markers, and matrices
- **[b]** Generic Markdown template — free-form document with narrative sections
- **[x]** Cancel

*(Nota: Podés seleccionar una opción o una combinación si aplica)*

#### 3b. Mandatory Provenance in Level 3 Models (Bloque 2)

When transforming normalized Markdown into an iNNfo Level 3 Model:
- Frontmatter MUST use lightweight V_0-3-0 format (`level: 3`, `spec_version: "V_0-3-0"`, `parent_spec: { name, url }`).
- Body MUST use unified NN syntax: `# NN <Concept>`, `## NN <Concept>: <Element>`, `key:: value`.
- Every element MUST include explicit provenance pointers `source_ref:: src-NNN (path#lines)`:

```markdown
# NN Stakeholders

## NN Stakeholders: Enterprise Clients
source_ref:: sources/markdown/interview_transcript.md#L45-L60
relationship_model:: B2B Long-term
```

#### 3c. Version & Citation Selection

Before generating the document, prompt the user:

```
Do you want to generate a draft with comments and citations, or a final version?

  [a] (Recomendado) Final version — clean deliverable with formatted inline citations
  [b] Draft for review — annotated with source pointers and review blocks
  [x] Cancel
```

---

### 4. Draft & Traceability Content Protocol

Draft deliverables (`_draft.md`) MUST include:
1. Header: `# DRAFT FOR REVIEW — NOT FINAL VERSION`
2. Dual-mode citation pointers per claim:
   - HTML comment (machine-readable): `<!-- cite: src-NNN, section <section-name> -->`
   - Visible text (human-readable): `— Source: <filename>, section <section-name>`

---

### 5. Output Directory Conventions

| Entity Type | Target Directory | Example File Path | Notes |
|------|------|---------|-------|
| **Normalized Markdown** | `sources/markdown/` | `sources/markdown/doc1_src-001.md` | Ingested source with scanner frontmatter |
| **Model** (`*_NN.md`) | `models/` | `models/Business_Plan_V_1-0-0_NN.md` | iNNfo Level 3 V_0-3-0 semantic models with `source_ref` |
| **Export Deliverable** | `artifacts/exports/` | `artifacts/exports/Executive_Summary_V_1-0-0.md` | Clean final deliverable |
| **Draft Deliverable** | `artifacts/exports/` | `artifacts/exports/Executive_Summary_V_1-0-0_draft.md` | Annotated draft |
| **Procedure Spec** | `procedures/` | `procedures/Document_Ingest_V_1-0-0_procedures_NN.md` | Procedure spec compliant with `procedures_V_0-3-0_NN.md` |

---

### 6. Post-Transformation Closing Protocol

At the end of transformation:
1. Summarize adjustments made.
2. Present options menu with `[a] (Recomendado)` prefix.
3. Print **Visual Expectation Checklist** (§12 of `nn-innfo`) when iNNfo models were created/edited.

---

## Core Rules

1. **Zero Unilateral Mutation**: NEVER move or rename user files without prior explicit confirmation.
2. **Recommended Option First**: Always prefix option `[a]` with `(Recomendado)` or `(Recomendada)`.
3. **Multi-Selection Notice**: Add *"Podés seleccionar una opción o una combinación"* when applicable.
4. **Mandatory Scanner Provenance**: Normalized Markdown in `sources/markdown/` MUST include scanner frontmatter (`source_file`, `sha256`, `size_bytes`, `normalized_at`, `source_id: src-NNN`).
5. **Mandatory Model Provenance**: Level 3 elements MUST include `source_ref:: src-NNN (path#lines)`.
6. **V_0-3-0 Compliance**: Target iNNfo V_0-3-0 meta-template specification and unified NN syntax (`# NN`, `## NN`, `key:: value`).
