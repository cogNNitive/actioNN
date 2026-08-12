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

1. **Zero Unilateral Mutation:** never move, rename, or delete user files without prior explicit confirmation.
2. **Recommended Option First:** prefix option `[a]`/`[1]` with `(Recomendado)`/`(Recomendada)`.
3. **Multi-Selection Clarification:** when options aren't mutually exclusive, add *"Podés seleccionar una opción o una combinación (ej. A y B)"*.

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
│   ├── processed/        # Intermediate optimized files (compressed images, extracted text/transcripts)
│   └── nn/               # Normalized Markdown, mirroring the same subfolder structure
│                          # as sources/original/ (e.g. sources/original/clientA/report.docx
│                          # → sources/nn/clientA/report.md). Never flattened.
├── models/               # Structured semantic iNNfo Level 3 models (*_NN.md)
├── procedures/           # Reusable transformation procedure specs (*_procedures_V_0-3-0_NN.md)
├── artifacts/            # Derivative deliverables and generated output products
│   ├── exports/          # Final deliverables (clean Markdown, HTML, PDF)
│   └── reports/          # Validation reports and audit trails
└── index.md              # Semantic workspace index (# NN index)
```

There is no `sources/raw/` — the scanner reads from `sources/original/`, optimizes into `sources/processed/` and writes directly to `sources/nn/`. Change detection uses the sha256_original of the original file's content (recorded in the normalized frontmatter); git, which already versions the workspace, is the history/versioning mechanism — no separate snapshot folder is needed.

Then run:
```bash
node scripts/index.js --src "<source-folder>" --dest "<destination-parent-folder>" --name "<project-name>"
```

---

### 2. Capability Scan & Provenance Ingestion Protocol (MANDATORY)

#### 2a-0. Ingest `sources/original/` to `sources/nn/`

**All files live in `sources/original/` — the user's dropbox. The tool never moves, renames, or deletes anything there; it only reads.**

1. **Check if `sources/original/` exists** inside the project directory. If not, ask the user and create it: `mkdir sources/original`
2. **Copy/Process files into `sources/processed/` and `sources/nn/`** (preserve originals in-place; DO NOT move or delete user files without consent). The user may organize subfolders freely — the scanner mirrors that structure.
3. **Scanner Normalization with Provenance Frontmatter**:
   Every normalized file generated under `sources/nn/` MUST include the mandatory, flat scanner traceability frontmatter:

```yaml
---
source_file: "sources/original/interview_transcript.pdf"
processed_file: "sources/processed/interview_transcript.txt"
sha256_original: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
sha256_processed: "f2ca6729228a1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b856"
size_bytes: 1048576
normalized_at: "2026-08-02T13:30:00Z"
normalized_by: "traNNsform v2.0"
---
```

When the source was imported from the web (see §2c below), also include `source_url` and `downloaded_at`, and — best-effort — `title`, `description`, `author` when discovered.

> **⚠️ Traceability Requirement**: There is no `source_id`/`src-NNN` system. Downstream Level 3 models reference sources directly by path via `sources:: sources/nn/<path>.md#L<start>-L<end>` (multiple values use list syntax: `sources:: [sources/nn/a.md#L1-L10, sources/nn/b.md#L20]`). Skipping scanner frontmatter invalidates traceability.

#### 2c. Importing from the Web (URL / online PDF)

When the user pastes a URL in chat and wants it ingested:

1. Confirm the URL and target project with the user (Zero Unilateral Mutation still applies).
2. Run the download step, which saves the resource directly into `sources/original/` (same dropbox as manually-dropped files — no separate branch in the pipeline):
   ```bash
   node scripts/index.js --import-url "<url>" --scan --src "<project-dir>"
   ```
   `--import-url` downloads the resource (content type decides the extension, from the response's `Content-Type` header or the URL as fallback), saves it under `sources/original/`, and — chained with `--scan` — immediately normalizes it into `sources/nn/` with `source_url`/`downloaded_at` (and, for HTML pages, best-effort `title`/`description`/`author` scraped from `<title>`, Open Graph tags, meta tags, and JSON-LD) merged into its frontmatter.
3. Confirm to the user that the file landed in `sources/original/`, then continue with the normal scan/normalize flow.
4. Downloaded PDFs go through the same existing `.pdf` handling as a manually dropped PDF (pdf-parse, on-demand install); if pdf-parse's own `info.Title`/`info.Author` are available, they populate the same optional frontmatter keys.

#### 2b. Capability Assessment — Decision Matrix

Present the diagnostic panel:

```
╔════════════╦══════════════════════╦══════════════════════════╗
║  Format    ║ Agent-native         ║ Node.js Library          ║
╠════════════╬══════════════════════╬══════════════════════════╣
║ txt/md     ║ ✅ Direct read       ║ —                        ║
║ csv/json   ║ ✅ Direct read       ║ —                        ║
║ png/jpg    ║ ✅ Multimodal vision ║ sharp (npm local resize) ║
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

#### Quick text extraction (no ingestion)

When the agent model cannot read a binary directly (pdf/docx/xlsx) and a full ingestion is not needed, extract the text without running a scan:

```
node C:\Users\lucas\.agents\skills\nn-trannsform\scripts\extract.js "<file>"
```

Prints only the extracted plain text to stdout (no frontmatter, no heading noise). The format is detected from the file extension (or forced with `--format pdf|docx|xlsx|txt|md|csv|json|html`). The script lives inside the skill folder, so `pdf-parse`/`mammoth`/`xlsx` resolve against the skill's own `node_modules` — no `NODE_PATH` needed.

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
- Every element MUST include explicit provenance pointers via `sources::`, which points directly at the file(s) in `sources/nn/` and accepts iNNfo's generic list syntax for multiple values:

```markdown
# NN Stakeholders

## NN Stakeholders: Enterprise Clients
sources:: [sources/nn/interview_transcript.md#L45-L60, sources/nn/notes.md#L3-L8]
relationship_model:: B2B Long-term
```

A single value may be written without brackets: `sources:: sources/nn/interview_transcript.md#L45-L60`. There is no `src-NNN`/`source_id` system anywhere in this pipeline.

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
   - HTML comment (machine-readable): `<!-- cite: sources/nn/<path>.md#L<start>-L<end>, section <section-name> -->`
   - Visible text (human-readable): `— Source: <filename>, section <section-name>`

---

### 5. Output Directory Conventions

| Entity Type | Target Directory | Example File Path | Notes |
|------|------|---------|-------|
| **Original Ingestion** | `sources/original/` | `sources/original/photos/room.jpg` | Raw unmodified documents or media |
| **Processed Ingestion** | `sources/processed/` | `sources/processed/photos/room.jpg` | Compressed images or text extracts |
| **NN Normalized Model** | `sources/nn/` | `sources/nn/photos/room.md` | Ingested source with standard frontmatter |
| **Model** (`*_NN.md`) | `models/` | `models/Business_Plan_V_1-0-0_NN.md` | iNNfo Level 3 V_0-3-0 semantic models with `sources::` |
| **Export Deliverable** | `artifacts/exports/` | `artifacts/exports/Executive_Summary_V_1-0-0.md` | Clean final deliverable |
| **Draft Deliverable** | `artifacts/exports/` | `artifacts/exports/Executive_Summary_V_1-0-0_draft.md` | Annotated draft |
| **Procedure Spec** | `procedures/` | `procedures/Document_Ingest_V_1-0-0_procedures_NN.md` | Procedure spec compliant with `procedures_V_0-3-0_NN.md` |

---

### 6. Execution of Saved Procedures (Orchestration)

When the user selects to execute a saved procedure from the `procedures/` directory:
1. **Load Procedure Spec**: Read the selected `*_procedures_NN.md` file.
2. **Build Execution Flow (FSM)**:
   - Scan all `Work` elements in the file.
   - Find the start step (a `Work` element that is not targeted by any other step's `next::` field).
   - Trace the sequence by following the `next::` pointers to build the ordered task list.
3. **Iterative Step Execution**:
   - For each step, present the step name, the required tool, input/output artifacts, and description.
   - **Autocompletion check**: Verify if the target output artifact already exists. If it does, inform the user and offer to mark the step as completed automatically.
   - Prompt the user to proceed with executing the task.
   - Upon completion, transition to the next step declared in `next::`.
   - Provide options to pause, override status, or restart the flow.
   - **Procedure adaptation**: If during execution the user changes tools, order, input/output artifacts, or adds/modifies tasks, the agent MUST capture these deviations as potential improvements to the procedure spec.

---

### 7. Post-Transformation Closing Protocol

At the end of transformation:
1. Summarize adjustments made.
2. Present options menu with `[a] (Recomendado)` prefix.
3. Offer to save the procedure of the session if a new sequence was executed.
4. **Procedure updates**: If an existing procedure was executed and adaptations or improvements were introduced during the conversation, the agent MUST ask the user if they want to modify and update the original procedure file to incorporate these changes.
5. Print **Visual Expectation Checklist** (§12 of `nn-innfo`) when iNNfo models were created/edited.

---

## Core Rules

1. **Zero Unilateral Mutation**: NEVER move, rename, or delete files in `sources/original/` (or any user file) without prior explicit confirmation.
2. **Recommended Option First**: Always prefix option `[a]` with `(Recomendado)` or `(Recomendada)`.
3. **Multi-Selection Notice**: Add *"Podés seleccionar una opción o una combinación"* when applicable.
4. **Mandatory Scanner Provenance**: Normalized Markdown in `sources/nn/` MUST include the flat scanner frontmatter (`source_file`, `processed_file`, `sha256_original`, `sha256_processed`, `size_bytes`, `normalized_at`, `normalized_by`, plus `source_url`/`downloaded_at`/`title`/`description`/`author` when applicable). No `source_id`/`src-NNN`.
5. **Mandatory Model Provenance**: Level 3 elements MUST include `sources:: <path.md#L..-L..>` (or a list `sources:: [a, b]`) pointing directly at `sources/nn/` — no `src-NNN` IDs.
6. **V_0-3-0 Compliance**: Target iNNfo V_0-3-0 meta-template specification and unified NN syntax (`# NN`, `## NN`, `key:: value`).
7. **Saved Procedure Proactive Check**: When starting `nn-trannsform` or `nn-router`, check for existing procedures in `procedures/` and offer them as runnable options to the user before starting standard ingestion.
