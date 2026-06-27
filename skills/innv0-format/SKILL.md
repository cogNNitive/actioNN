---
name: innv0-format
version: "V_0-1-0"
last_updated: 2026-06-27
metadata:
  source_type: "mirrored"
  source: "https://github.com/innV0/FORMAT"
license: MIT
description: |
  MANDATORY trigger: MUST activate this skill whenever the user is creating, editing, validating, or discussing any FORMAT model, template, specialization, sample, or specification file.
  This includes but is not limited to:
  - Creating or editing any file matching *_FORMAT.md
  - Authoring or modifying business models, procedure models, or any model following a FORMAT template
  - Creating, editing, or modifying templates or specializations under docs/templates/
  - Discussing the FORMAT specification, concepts, markers, matrices, or naming conventions
  - Generating dashboard renderers for templates
  - Ingesting source documents into FORMAT models
  - Any conversation about how FORMAT works, how to use it, or how to structure FORMAT files

  Coordinates with the `traNNsform` skill to normalize any raw, unstructured file (PDF, DOCX, ODT, spreadsheet, image, audio, video, chat export, web page, scan, archive, etc.) into structured sources before authoring a model.
---

# FORMAT Skill

> **⚠️ ACTIVATION = GREETING REQUIRED**: When this skill is loaded, the agent MUST introduce itself to the user before doing anything else. See §Greeting Protocol below.

This skill guides LLMs and agents in authoring, editing, and validating FORMAT-compliant files and working within the FORMAT codebase.

## Core Concepts

### Templates vs Specializations

- **Template**: The official schema defining structure (concepts, markers, matrices). Stored in `docs/templates/<name>/V_x-y-z/`.
- **Specialization**: A self-contained template derived from an official one. Fully autonomous — no runtime inheritance.

### Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Official template | `<template>_V_x-y-z_FORMAT.md` | `business_V_0-1-0_FORMAT.md` |
| Specialization | `<spec>_<template>_V_x-y-z_FORMAT.md` | `healthcare_business_V_0-1-0_FORMAT.md` |

### File Location

```
docs/templates/
├── business/
│   └── V_0-1-0/
│       ├── business_V_0-1-0_FORMAT.md           # Official template
│       ├── documentation.md                      # Template docs
│       └── samples/                              # Sample models
│           └── Ghostbusters_V_0-1-0_business_FORMAT.md
└── procedures/
    └── V_0-1-0/
        ├── procedures_V_0-1-0_FORMAT.md          # Official template
        ├── documentation.md
        └── samples/
            └── Comprehensive_Test_Procedure_V_1-0-0_procedures_FORMAT.md
```

### Provenance Traceability

Specializations document their origin in the `description` field of frontmatter. Include the parent template name and canonical URL for traceability:

```yaml
---
description: |
  Specialization of business_V_0-1-0 template.
  Parent: https://raw.githubusercontent.com/innV0/FORMAT/main/docs/templates/business/V_0-1-0/business_V_0-1-0_FORMAT.md
  Adapted for healthcare sector compliance.
template:
  name: "healthcare_business"
  version: "V_0-1-0"
  concepts: [...]  # Complete, self-contained
---
```

> [!IMPORTANT]
> Specializations are self-contained. They MUST define their own complete schema. The `description` field is purely informational for human traceability.

## Canonical Specification Index

The current specification is the single source of truth. Historical versions have been collapsed; this is the unified V_0-1-0 baseline:

- **V_0-1-0** (Current): [_format.md (v0.1.0)](https://raw.githubusercontent.com/innV0/FORMAT/main/docs/spec/V_0-1-0/_format.md)

## Reference Directory

The canonical specification source is listed above and in Section 1. No local spec files are maintained in this skill directory.

## Greeting Protocol (MANDATORY — DO NOT SKIP)

**CRITICAL RULE:** When this skill is activated (loaded via the `skill` tool), the agent's VERY FIRST response to the user MUST begin with the self-introduction below. This is NOT optional. Do NOT skip it, do NOT go straight to work, do NOT start coding without presenting first.

The greeting is **session-scoped**: only once per conversation, not on every reply. If the agent was already introduced in the current session (e.g. after a compaction), skip the greeting.

> **Template:** "Estás hablando con el skill de FORMAT. Puedo ayudarte a [capabilities relevant to the current request]."

Adapt the `[capabilities]` list dynamically based on what the user is asking. Keep it to 1-2 sentences. No walls of text.

---

## Core Rules

1. **Spec Immutability**:
   - Published specifications (e.g., inside `docs/spec/V_0-1-0/` or `docs/spec/V_0-1-1/`) are completely frozen.
   - Do NOT edit, "fix", or migrate files within historical spec directories. Apply changes only to the current/active spec directory.

2. **Spec over Tolerant Code**:
   - Prefer specifications to be clear, simple, and solid.
   - Do NOT write code that silently tolerates or works around invalid models. If a model fails to comply with the current specification, reject it or surface the error clearly to the user.

3. **No Backward Compatibility**:
   - The codebase targets the CURRENT specification version only.
   - Do NOT maintain parsers, loaders, or branches supporting older versions or obsolete keys (such as `category_id`).

4. **Format Terminology**:
   - Always use the key `template` instead of `metamodel` in frontmatter declarations, master data models, and serialization output.

5. **Language Domain Contract**:
   - Generated technical artifacts (code, documentation, specs, issues, commits) default to English.
   - Keep direct conversation with the user in the user's active language, but respect English as the default for all code-level and documentation artifacts.

6. **Referential Integrity on Rename (MANDATORY)**:
   - Every concept and element name in a FORMAT document is a **globally unique identifier** referenced from multiple locations (wikilinks, matrices, block comments, taxonomy tree, frontmatter).
   - When renaming ANY named entity (concept or element), the agent MUST locate and update EVERY reference to the old name before writing the change. A rename that leaves stale references is a **broken document**.
   - The agent MUST NOT apply a rename as a single find-and-replace without verifying each reference's context (e.g., a matrix cell value might be a data value, not a name reference — context matters).
   - Use the checklist in §7 (Rename Safety) before finalizing any rename operation.

---

# FORMAT Model Authoring and Validation Guidelines

This skill allows the agent to read, write, and validate documents conforming to the **_FORMAT** specification. 

All FORMAT-compliant files use the `.md` extension and follow a specific naming convention:
- **Model Document:** `<ModelName>_V_x-y-z_<TemplateName>_FORMAT.md` (e.g., `Ghostbusters_V_0-3-2_business_FORMAT.md`)
- **Template/Specification:** `<TemplateOrSpecName>_V_x-y-z_FORMAT.md` (e.g., `business_V_1-0-0_FORMAT.md`)

## 1. Reference Locations (On-Demand Loading)
To keep this skill lightweight and maintain a single source of truth, do not duplicate specification files locally in the skill. Instead, when validation or generation is requested, use your web-reading tools (e.g., `read_url_content`) to load the following canonical sources on-demand:

* **Official _FORMAT Specification (V_0-1-0):**
  `https://raw.githubusercontent.com/innV0/FORMAT/main/docs/spec/V_0-1-0/_format.md`
* **Business Template (V_0-1-0):**
  `https://raw.githubusercontent.com/innV0/FORMAT/main/docs/templates/business/V_0-1-0/business_V_0-1-0_FORMAT.md`
* **Procedures Template (V_0-1-0):**
  `https://raw.githubusercontent.com/innV0/FORMAT/main/docs/templates/procedures/V_0-1-0/procedures_V_0-1-0_FORMAT.md`

## 2. Supported Templates
There are currently two official templates:
1. **Business:** Used for modeling business components, stakeholders, value propositions, market segmentation, etc.
2. **Procedures:** Used for modeling procedural workflows, roles involved, steps, complexity, and sequences.

## 3. Formatting and Grammar Rules

### 3.1 YAML Frontmatter
Every compliant file must start with a YAML block containing:
```yaml
---
specification_version: "V_0-1-0"
specification_url: "https://raw.githubusercontent.com/innV0/FORMAT/main/docs/spec/V_0-1-0/_format.md"
title: "Document Title"
model_version: "V_x-y-z"
documentation_location: "docs/spec/V_0-1-0/"
template:
  name: "business" # or "procedures"
  version: "V_0-1-0"
  title: "Template Title"
  concepts: [...]
  markers: [...]
  matrices: [...]
---
```

### 3.2 Markdown Body
- **Concept Dividers:** Each concept section in the body starts with an H1 heading prefixed by the block comment:
  `# <!-- block: concepts --> concept name` (concept name must be in lowercase).
- **Element/Instance Lists:** Instantiable concepts use list items prefixed by:
  `* <!-- block: concept name --> Element Name`
- **Matrices Section:** Appears under `<!-- block: matrices -->` containing Markdown tables representing relationships or item-markers.

### 3.3 Element Fields (V_0-1-0)

Element fields are expressed as fenced YAML blocks (` ```yaml `) immediately after the element line. This replaces the old dash-list syntax.

```markdown
* <!-- block: roles --> Alice
  ```yaml
  scope: internal
  ```
```

## 4. Operational Instructions for the Agent
* **When Asked to Generate a Model:** Fetch the correct template raw file using the URLs in Section 1, parse the concepts, and prompt the user step-by-step or auto-generate the file content adhering strictly to the naming and layout conventions.
* **When Asked to Validate a Model:** Compare the local file contents against the template schema and the core FORMAT specification rules (H1 headers, block comments, correct lowercase concept names, correct list formatting, matrix headers match element names).
* **When Asked to Rename a Concept or Element:** Follow the Rename Safety procedure in §7 before writing any change. Do NOT apply a rename until all references have been identified and updated.

---

## 5. Rename Safety & Referential Integrity (MANDATORY)

### 5.1 Why This Exists

In a FORMAT document, every concept and element name is a **globally unique identifier** (§5.2 of the spec). Renaming one without updating all its references breaks:
- Wikilinks (`[[Old Name]]`) — they become dead links
- Matrix source/target bindings — matrices lose their mapping
- Block comment markers (`<!-- block: old_name -->`) — parsers cannot find the concept
- The taxonomy tree (`index` block) — hierarchy edges become orphans

This section defines a mandatory procedure that agents MUST follow when renaming any named entity.

### 5.2 Reference Map

#### If renaming a **CONCEPT** (e.g., `Problems` → `Issues`):

| # | Location in the document | What to update |
|---|--------------------------|----------------|
| 1 | Frontmatter `template.concepts[].name` | The concept's `name` field |
| 2 | Frontmatter `matrices[].source` / `matrices[].target` | Any matrix whose source or target is this concept |
| 3 | Concept H1 header: `# <!-- block: concepts --> Problems` | The name after the block comment |
| 4 | Every element line: `* <!-- block: Problems --> Element Name` | The `<!-- block: Problems -->` part |
| 5 | Matrix tables in body (headers and rows) | Column/row headers or data cells referencing this concept or its elements |
| 6 | `index` block (taxonomy tree): `* [[Problems]]` | Any wikilink whose target is this concept |
| 7 | Wikilinks `[[Problems]]` in ANY narrative text across all concept blocks | Every `[[Problems]]` reference |
| 8 | Matrix names in frontmatter and body headers that embed the concept name | e.g. `Problems-Value propositions Matrix` → `Issues-Value propositions Matrix` |

#### If renaming an **ELEMENT** (instance) (e.g., `Alice the Librarian` → `Alice`):

| # | Location in the document | What to update |
|---|--------------------------|----------------|
| 1 | The element line: `* <!-- block: persona --> Alice the Librarian` | The label after the block comment |
| 2 | Matrix tables: row headers or cell values that match the element name | Every occurrence as a row/column header |
| 3 | `item-markers matrix`: the row header for this element | The first column value |
| 4 | Wikilinks `[[Alice the Librarian]]` in ANY narrative text | Every `[[Alice the Librarian]]` reference |

### 5.3 Mandatory Procedure

Before writing ANY rename, the agent MUST execute this checklist in order:

**Step 1 — Identify all references.** Search the ENTIRE document for every occurrence of the old name, including:
- Plain text occurrences (not just wikilinks — narrative text may reference the entity by name)
- Wikilinks: `[[Old Name]]`
- Block comments: `<!-- block: old name -->`
- Frontmatter YAML values (concept names, matrix source/target, matrix names)
- Matrix headers and row/column labels
- The `index` block taxonomy tree

**Step 2 — Classify each occurrence.** Not every match is a reference. Skip:
- YAML keys or structural syntax (e.g., `name: "Problems"` in a different concept's field definition)
- Matrix cell VALUES that happen to contain the same substring but are data, not references
- Mentions in the Document Notice or explanatory text that are NOT wikilinks and do NOT identify the entity

**Step 3 — Update all references.** Apply the new name to every classified reference. For wikilinks, update only the target: `[[New Name]]`. For block comments, preserve the lowercase slug convention: `<!-- block: new name -->`.

**Step 4 — Verify integrity.** After applying the rename, re-read the document and confirm:
- Every `[[New Name]]` points to an entity that actually exists in the document
- No `[[Old Name]]` remains anywhere
- Every `<!-- block:` comment matches an existing concept name
- Every matrix `source` and `target` in frontmatter maps to a concept that exists
- All matrix row/column headers reference elements or concepts that exist

### 5.4 What NOT to Update

Do NOT touch:
- The `specification_version`, `model_version`, or `last_saved` frontmatter fields (these are version data, not references)
- The Document Notice: `> [!NOTE] ...` (generic text, no entity references)
- Matrix cell VALUES that are purely data (e.g., scale values like `Max`, `Neutral`, `-`) unless they are also element/concept name headers
- External URLs or file paths that happen to contain the name

### 5.5 Example

Renaming concept `Problems` → `Issues` in a business model:

| Before | After | Why |
|--------|-------|-----|
| `name: "Problems"` in frontmatter concepts[] | `name: "Issues"` | Concept definition |
| `source: "Problems"` in frontmatter matrices[] | `source: "Issues"` | Matrix binding |
| `# <!-- block: concepts --> Problems` | `# <!-- block: concepts --> Issues` | Concept header |
| `* <!-- block: Problems --> Uncontained Paranormal Activity` | `* <!-- block: Issues --> Uncontained Paranormal Activity` | Element block |
| `* [[Problems]]` in `index` block | `* [[Issues]]` | Taxonomy tree |
| `\| Problems \ Competition \|` matrix header | `\| Issues \ Competition \|` | Matrix column header |
| `see [[Problems]] for details` in narrative | `see [[Issues]] for details` | Wikilink in text |

---

## 5. Dashboard Renderer (Template Companion Artifact)

### 5.1 Purpose

A dashboard renderer is a companion artifact of a FORMAT template. It is an HTML
fragment that visually represents any model authored against that template. The
renderer is filled at runtime by the application with the normalized data of
the loaded model (concepts, instances, hierarchy, taxonomy edges, matrices).

A renderer is NEVER generated per model. It lives at the template level and is
versioned together with the template, so it never goes stale when a model is
patched.

A template is valid with or without a renderer. If the renderer is missing, the
application detects it and shows the user the copyable instructions defined in
§5.8.

### 5.2 Location and Naming (FIXED)

A renderer MUST be located alongside the template it renders:

```
docs/templates/<templateName>/V_x-y-z/dashboard.html
```

Examples:

```
docs/templates/business/V_0-1-0/dashboard.html
docs/templates/procedures/V_0-1-0/dashboard.html
docs/templates/healthcare_business/V_0-1-0/dashboard.html
```

The file name is ALWAYS `dashboard.html`. No model name, no version suffix —
the directory already encodes template name and version.

### 5.3 When to Generate

The renderer is generated when a template (or a new version of one) is authored
or updated, as part of the template delivery alongside the template file and
`documentation.md`. Generation is optional: a template without a renderer is
still valid. Generation can also be requested on demand for an existing
template that does not yet ship a renderer.

### 5.4 Renderer Syntax — Mustache

The renderer uses [Mustache](https://github.com/janl/mustache.js) (logic-less
template system). Mustache is a well-known standard with a proven, dependency-
free JavaScript implementation (`mustache.js`, ~19 KB minified) that the
application can reuse across other features. The engine does NOT use `eval` or
`new Function`; it parses to tokens and renders by string concatenation, so it
is safe by design.

Supported constructs:

```
Value interpolation (HTML-escaped automatically):
    {{model.title}}
    {{template.name}}
    {{concept.name}}

Section (iteration when the value is an array, conditional when truthy):
    {{#concepts}}
        <section>
            <h2>{{name}}</h2>
            {{#instances}}
                <li>{{label}}</li>
            {{/instances}}
        </section>
    {{/concepts}}

Inverted section (renders when the value is falsy / empty array):
    {{^matrices}}<p>No matrices.</p>{{/matrices}}
```

Rules:
- Only plain key access is allowed: `{{a.b.c}}`. No expressions, no function calls, no computed keys.
- Unknown keys are silent: they render nothing and do not raise errors.
- Interpolated values are HTML-escaped by Mustache by default.
- The renderer MUST be a well-formed HTML fragment after placeholders are filled.
- Max nesting depth for sections: 2 (sufficient for concept → instances, matrix → rows).

#### 5.4.1 Prohibited Mustache Features (MANDATORY)

Two Mustache features MUST NOT appear in any renderer. They are rejected by the
validator (§5.8) and by the application at load time:

1. **Triple-mustache `{{{value}}}`** — interpolates WITHOUT HTML-escaping,
   enabling XSS from model content. All interpolation MUST use double-mustache
   `{{value}}`, which escapes HTML.
2. **Partials `{{>partial}}`** — includes external templates, introducing
   references to files outside the renderer. Partials are prohibited.
3. **Delimiter change `{{=delim delim=}}`** — changes the tag delimiters and
   can be used to obfuscate validation. Prohibited.

Any renderer containing `{{{`, `{{>`, or `{{=` is invalid and MUST be rejected.

### 5.5 Data Exposed to the Renderer

The application fills the renderer with this normalized, template-agnostic data
(derived from the model frontmatter and body, never from hardcoded concept
names):

```
model:
  title                — string
  version               — string (e.g. "V_1-0-0")
  specificationVersion  — string (e.g. "V_0-1-4")

template:
  name                  — string
  version               — string
  title                 — string

concepts: array of
  name                  — concept name (string)
  instances             — array of { label: string, fields: array of { key: string, value: string } }

hierarchyConcepts: array of { name: string, parent?: string }

taxonomyEdges: array of { source: string, target: string, label?: string }

matrices: array of
  name                  — string
  headers               — string[]
  rows                  — string[][]
```

The renderer MUST use only these keys and MUST NOT hardcode concept names
specific to any template (e.g. "Stakeholders", "Segments"). This keeps the
renderer template-agnostic, as required by the project rules.

### 5.6 Security Constraints (MANDATORY)

The renderer is LLM-generated content and therefore untrusted. The following
constraints are mandatory and MUST be enforced by both the generating agent and
the consuming application:

1. The renderer MUST be an HTML FRAGMENT. It MUST NOT contain:
   - `<!DOCTYPE>`, `<html>`, `<head>`, `<body>` tags
   - `<script>` tags (any kind, including module, type, src)
   - `<iframe>`, `<object>`, `<embed>`, `<link>`, `<meta>` tags
   - Any attribute starting with `on` (`onclick`, `onload`, `onerror`, ...)
   - Any URI using the `javascript:` scheme
   - Any external resource (CSS file, font, remote image, CDN)
2. All CSS MUST be inlined in `<style>` blocks within the fragment.
3. Images, if any, MUST use the `data:` URI scheme only.
4. The renderer MUST NOT reference external URLs in any form.
5. The renderer MUST be valid HTML after placeholders are filled.
6. The renderer file size MUST NOT exceed 256 KB.

The application enforces these at runtime via a sandboxed iframe
(`sandbox="allow-same-origin"`, no `allow-scripts`), an inline
Content-Security-Policy (`default-src 'none'; style-src 'unsafe-inline'; img-src data:`),
a sanitizer that strips prohibited tags/attributes, HTML-escaping of all
interpolated values, and a size cap.

### 5.7 Generation Prompt (INVARIANT)

When generating or updating a dashboard renderer, the agent MUST use the
following prompt verbatim. It is the single source of truth for what the
renderer is and how it must be built:

> Genera un archivo HTML sin encabezados ni nada, solo código HTML que represente de la mejor forma posible a nivel visual el modelo cargado, usando los placeholders Mustache definidos en el skill de FORMAT.

The agent then applies the constraints in §5.6 (fragment, no scripts, inline
CSS, template-agnostic placeholders, etc.) and writes the result to
`docs/templates/<templateName>/V_x-y-z/dashboard.html`.

This instruction is agent-agnostic: it works in opencode, Claude Code,
Anti-gravity, or any other agent that supports the FORMAT skill. It does not
reference any tool-specific name.

### 5.8 Validation

Before saving the renderer, the agent MUST:
1. Verify the fragment parses cleanly with Mustache (balanced sections, valid tag syntax).
2. Verify the renderer does NOT contain any prohibited Mustache feature (§5.4.1): `{{{`, `{{>`, or `{{=`.
3. Verify all placeholders reference only documented data keys (§5.5).
4. Verify none of the prohibited tags/attributes (§5.6) are present.
5. Verify the file size is under 256 KB.
6. Verify the file is saved at the canonical location (§5.2).

If any check fails, the agent MUST report the error and NOT save the file.

### 5.9 Copyable Instructions for End Users

When the application loads a model whose template has no `dashboard.html`, it
shows the user the following copyable block:

```
The template <templateName> <version> does not include a dashboard
renderer. To generate one, ask your AI agent (opencode, Claude Code,
Anti-gravity, or any other) using the FORMAT skill:

    Genera un archivo HTML sin encabezados ni nada, solo código HTML que
    represente de la mejor forma posible a nivel visual el modelo cargado,
    usando los placeholders Mustache definidos en el skill de FORMAT.

The renderer MUST be saved at:
    docs/templates/<templateName>/<version>/dashboard.html

Constraints: HTML fragment only, no scripts, no external resources,
inline CSS, Mustache placeholders only (no triple-mustache, no partials,
no delimiter changes), template-agnostic keys. See the FORMAT skill for
the full specification.
```

---

## 6. Source Ingestion Pipeline (traNNsform Coordination)

### 6.1 Purpose

The FORMAT skill is the final stage of a pipeline that turns raw,
unstructured knowledge into a self-contained FORMAT model:

```
raw/  ──►  traNNsform  ──►  sources/  ──►  _FORMAT  ──►  model_V_x-y-z_TEMPLATE_FORMAT.md
```

| Stage | Tool / Folder         | Role                                                                                  |
|------:|-----------------------|---------------------------------------------------------------------------------------|
| 1     | `raw/`                | User deposits original files (any format — text, PDF, DOCX, audio, video, chats…).    |
| 2     | `traNNsform`          | Reads every file in `raw/` and normalizes it into structured Markdown + CSV.          |
| 3     | `sources/`            | Contains the normalized, machine-readable output ready for incorporation.             |
| 4     | `_FORMAT`             | Reads `sources/`, applies the template, produces the final FORMAT-compliant model.    |

`traNNsform` (https://github.com/innV0/traNNsform) is a sibling skill that
owns Stage 2. The FORMAT skill owns Stages 3–4 (via the
`_FORMAT-source-incorporator` sub-skill) and DOES NOT reimplement Stage 2.

### 6.2 When to Suggest Installing traNNsform

The trigger is **format-agnostic**: any file the agent cannot ingest as
plain text qualifies. The FORMAT skill MUST offer to install `traNNsform`
when the user wants to build a model from **any unstructured or binary
content**, including but not limited to:

- **Any attached file or folder of files** — PDF, DOCX, ODT, RTF,
  spreadsheet (XLSX, CSV that is not already a `.sources/` file), image
  (PNG, JPG, scanned PDF), audio (MP3, WAV, M4A), video (MP4, MOV), chat
  export (JSON, TXT, HTML), web page (HTML, MHTML), email archive (mbox,
  EML), source code archive (ZIP), or any other binary / non-Markdown file.
- A **`raw/`** folder (or any folder of unstructured files) and asks the
  agent to turn it into a FORMAT model.
- A **heterogeneous mix** of web content, transcripts, screenshots, or
  downloaded files as the source for a new model.
- An **explicit ask** to "analyze", "extract", "process", "ingest",
  "summarize", "convert", or "build a model from" attached files.

The key signal is: **the user is asking the agent to derive facts from files
that are not already FORMAT-compliant Markdown.** That is the boundary
between needing `traNNsform` and not needing it. PDFs are one example among
many, not a special case.

### 6.3 Installation Prompt (MANDATORY)

When any §6.2 trigger is met AND `traNNsform` is NOT already installed, the
agent MUST ask before proceeding. Use this exact prompt template:

> **I can analyze the attached file(s) to build a FORMAT model. To extract
> structured content from raw files (PDF, DOCX, audio, video, chats, web,
> etc.), I recommend installing the `traNNsform` skill
> (https://github.com/innV0/traNNsform). Shall I install it and proceed?**

Rules for the prompt:
- Present it as a **yes/no question**, not an open-ended menu.
- Wait for explicit user confirmation before installing.
- If the user declines, fall back to manual ingestion (see §6.6) — DO NOT
  silently attempt to parse raw files yourself.

### 6.4 Coordination Protocol (Sub-Agent Pattern)

Once `traNNsform` is installed and the user agrees, the FORMAT skill
coordinates it as a sub-agent:

1. **Locate the input.** Ask the user for the absolute path of the `raw/`
   folder (or the folder where the attached files were saved by the UI).
2. **Delegate normalization.** Invoke the `traNNsform` skill, passing the
   `raw/` path. `traNNsform` writes its normalized Markdown + CSV output
   into a `sources/` folder (typically `[ModelDirectory]/.sources/`).
3. **Wait for completion.** Do not proceed to authoring until `traNNsform`
   reports completion. Surface any errors from `traNNsform` to the user
   verbatim.
4. **Hand off to source-incorporator.** Once `sources/` is populated, invoke
   the `_FORMAT-source-incorporator` skill to ingest the files into a draft
   FORMAT model. The incorporation step MUST:
   - Copy original files to `[ModelDirectory]/.sources/` with their exact
     filenames.
   - Tag every AI-written element with `#AI`.
   - Reference each source via `(Source: [filename.ext](.sources/filename.ext))`.
   - Refuse to invent facts not present in the sources (no hallucination).
5. **Author the final model.** Apply the standard FORMAT authoring workflow
   (Section 4) to produce the final `<Model>_V_x-y-z_<Template>_FORMAT.md`
   file.

### 6.5 Provenance Chain

Every element authored via this pipeline MUST carry a complete provenance
chain, even when intermediate steps are not run by the current agent:

```
#AI  (Source: [filename.ext](.sources/filename.ext))  — normalized by traNNsform from [raw/filename.ext]
```

The `traNNsform` step is recorded only when it actually ran. For elements
authored without `traNNsform` (e.g., direct user input), omit the
`normalized by traNNsform from ...` suffix.

### 6.6 When NOT to Install or Invoke traNNsform

Skip the installation prompt and invoke `_FORMAT-source-incorporator` directly
when:

- The user provides content inline in the chat (no files attached).
- The user already has a populated `sources/` folder and only wants the
  model built.
- The user is editing an existing FORMAT model (not creating from sources).
- `traNNsform` is already installed in the current agent.
- The user explicitly opts out of `traNNsform` (e.g., wants to do extraction
  manually).

### 6.7 Fallback: Manual Ingestion

If the user declines `traNNsform` but still wants to build a model from raw
files, the FORMAT skill:

1. Asks the user to manually copy the relevant excerpts (or to point to a
   `sources/` folder they will populate themselves).
2. Once a `sources/` folder exists, invokes `_FORMAT-source-incorporator`
   as normal.

The agent MUST NOT attempt to read PDF, audio, video, or any other binary
file directly to extract facts. `traNNsform` (or manual copy/paste by the
user) is the only sanctioned path.
