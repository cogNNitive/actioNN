---
name: nn-trannsform
description: "Bootstrap projects, scan raw documents, normalize them to Markdown with mandatory provenance frontmatter, apply V_0-3-0 template-based transformations, and execute multi-step transformation procedures compliant with procedures_V_0-3-0_NN.md. Includes document ingestion, format conversion (txt, md, csv, json, docx, pdf), procedure orchestration, and export generation. Triggers: trannsform, transform, workflow, pipeline, procedure, normalize, scan documents, document ingestion, document transformation, document processing, markdown conversion, project bootstrap"
version: "2.0"
license: MIT
metadata:
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
1. **Source Folder**: Where are the original files?
2. **Project Name & Destination**: Name for the project and where to save it (recommend `%USERPROFILE%\Documents\_NN\[project-name]`).

#### Standard Workspace Directory Layout

Every project workspace MUST adhere to the following structure:

```
[project-name]/
├── sources/
│   ├── original/         # User's dropbox — untouched by the tool. NEVER move/rename/delete.
│   │                      # The user may organize subfolders however they like.
│   └── markdown/          # Normalized Markdown, mirroring the same subfolder structure
│                          # as sources/original/ (e.g. sources/original/clientA/report.docx
│                          # → sources/markdown/clientA/report.md). Never flattened.
├── models/               # Structured semantic iNNfo Level 3 models (*_NN.md)
├── procedures/           # Reusable transformation procedure specs (*_procedures_V_0-3-0_NN.md)
├── artifacts/            # Derivative deliverables and generated output products
│   ├── exports/          # Final deliverables (clean Markdown, HTML, PDF)
│   └── reports/          # Validation reports and audit trails
└── index.md              # Semantic workspace index (# NN index)
```

There is no `sources/raw/` — the scanner reads directly from `sources/original/` and writes directly to `sources/markdown/`. Change detection uses the sha256 of the original file's content (recorded in the normalized frontmatter); git, which already versions the workspace, is the history/versioning mechanism — no separate snapshot folder is needed.

Then run:
```bash
node scripts/index.js --src "<source-folder>" --dest "<destination-parent-folder>" --name "<project-name>"
```

---

### 2. Capability Scan & Provenance Ingestion Protocol (MANDATORY)

#### 2a-0. Ingest `sources/original/` to `sources/markdown/`

**All files live in `sources/original/` — the user's dropbox. The tool never moves, renames, or deletes anything there; it only reads.**

1. **Check if `sources/original/` exists** inside the project directory. If not, ask the user and create it: `mkdir sources/original`
2. **Copy files into `sources/original/`** (preserve originals in-place; DO NOT move or delete user files without consent). The user may organize subfolders freely — the scanner mirrors that structure into `sources/markdown/`.
3. **Scanner Normalization with Provenance Frontmatter**:
   Every normalized file generated under `sources/markdown/` MUST include the mandatory, flat scanner traceability frontmatter — this schema is exact and must match the iNNfo editor:

```yaml
---
source_file: "sources/original/interview_transcript.pdf"
sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
size_bytes: 1048576
normalized_at: "2026-08-02T13:30:00Z"
normalized_by: "traNNsform v2.0"
---
```

When the source was imported from the web (see §2c below), also include `source_url` and `downloaded_at`, and — best-effort — `title`, `description`, `author` when discovered.

> **⚠️ Traceability Requirement**: There is no `source_id`/`src-NNN` system. Downstream Level 3 models reference sources directly by path via `sources:: sources/markdown/<path>.md#L<start>-L<end>` (multiple values use list syntax: `sources:: [sources/markdown/a.md#L1-L10, sources/markdown/b.md#L20]`). Skipping scanner frontmatter invalidates traceability.

#### 2c. Importing from the Web (URL / online PDF)

When the user pastes a URL in chat and wants it ingested:

1. Confirm the URL and target project with the user (Zero Unilateral Mutation still applies).
2. Run the download step, which saves the resource directly into `sources/original/` (same dropbox as manually-dropped files — no separate branch in the pipeline):
   ```bash
   node scripts/index.js --import-url "<url>" --scan --src "<project-dir>"
   ```
   `--import-url` downloads the resource (content type decides the extension, from the response's `Content-Type` header or the URL as fallback), saves it under `sources/original/`, and — chained with `--scan` — immediately normalizes it into `sources/markdown/` with `source_url`/`downloaded_at` (and, for HTML pages, best-effort `title`/`description`/`author` scraped from `<title>`, Open Graph tags, meta tags, and JSON-LD) merged into its frontmatter.
3. Confirm to the user that the file landed in `sources/original/`, then continue with the normal scan/normalize flow.
4. Downloaded PDFs go through the same existing `.pdf` handling as a manually dropped PDF (pdf-parse, on-demand install); if pdf-parse's own `info.Title`/`info.Author` are available, they populate the same optional frontmatter keys.

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
║ xlsx       ║ 🚫 Unsupported       ║ —                        ║
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
- Every element MUST include explicit provenance pointers via `sources::`, which points directly at the file(s) in `sources/markdown/` and accepts iNNfo's generic list syntax for multiple values:

```markdown
# NN Stakeholders

## NN Stakeholders: Enterprise Clients
sources:: [sources/markdown/interview_transcript.md#L45-L60, sources/markdown/notes.md#L3-L8]
relationship_model:: B2B Long-term
```

The value of `sources::` MUST ALWAYS be written as a list enclosed in brackets `[...]` (e.g. `sources:: [sources/markdown/interview_transcript.md#L45-L60]`), even when referencing a single source file. Scalar syntax and aliases are forbidden. There is no `src-NNN`/`source_id` system anywhere in this pipeline.

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
   - HTML comment (machine-readable): `<!-- cite: sources/markdown/<path>.md#L<start>-L<end>, section <section-name> -->`
   - Visible text (human-readable): `— Source: <filename>, section <section-name>`

---

### 5. Output Directory Conventions

| Entity Type | Target Directory | Example File Path | Notes |
|------|------|---------|-------|
| **Normalized Markdown** | `sources/markdown/` | `sources/markdown/clientA/doc1.md` | Ingested source with scanner frontmatter, mirrors `sources/original/` subfolders |
| **Model** (`*_NN.md`) | `models/` | `models/Business_Plan_V_1-0-0_NN.md` | iNNfo Level 3 V_0-3-0 semantic models with `sources::` |
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

1. **Zero Unilateral Mutation**: NEVER move, rename, or delete files in `sources/original/` (or any user file) without prior explicit confirmation.
2. **Recommended Option First**: Always prefix option `[a]` with `(Recomendado)` or `(Recomendada)`.
3. **Multi-Selection Notice**: Add *"Podés seleccionar una opción o una combinación"* when applicable.
4. **Mandatory Scanner Provenance**: Normalized Markdown in `sources/markdown/` MUST include the flat scanner frontmatter (`source_file`, `sha256`, `size_bytes`, `normalized_at`, `normalized_by`, plus `source_url`/`downloaded_at`/`title`/`description`/`author` when applicable). No `source_id`/`src-NNN`.
5. **Mandatory Model Provenance**: Level 3 elements MUST include `sources:: <path.md#L..-L..>` (or a list `sources:: [a, b]`) pointing directly at `sources/markdown/` — no `src-NNN` IDs.
6. **V_0-3-0 Compliance**: Target iNNfo V_0-3-0 meta-template specification and unified NN syntax (`# NN`, `## NN`, `key:: value`).
