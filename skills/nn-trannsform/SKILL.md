---
name: nn-trannsform
description: "Bootstrap projects, scan raw documents, normalize them to Markdown, and apply template-based transformations. Includes a Node.js CLI tool for document ingestion, format conversion (txt, md, csv, json, docx, pdf, xlsx), and transformation orchestration. Uses the agent's own LLM for the actual content transformation. Triggers: trannsform, transform, normalize, scan documents, document ingestion, document transformation, document processing, markdown conversion, project bootstrap"
empty_sections_mode: "ask-per-section"
license: MIT
metadata:
  version: "1.5"
  source_type: "integrated"
  source: "https://github.com/cogNNitive/actioNN/tree/main/skills/nn-trannsform"
  installed_at: "2026-07-11"
  depends_on:
    skills: ["nn-innfo"]
    mcp_servers: ["innfo-mcp"]
    cli_tools: ["scripts/pipeline-gate.mjs"]
---

# Skill: nn-trannsform

## Greeting Protocol (MANDATORY)

When this skill is activated, the agent MUST print exactly:

```
🔧 You're using skill: nn-trannsform (🔄)
```

as its very first output — before any questions, analysis, or tool calls. Session-scoped: only once per conversation.

This skill enables the agent to interactively guide the user through document ingestion, normalization, and transformation.

All file paths in this skill are relative to the skill's base directory (e.g., `~/.agents/skills/nn-trannsform/`). The CLI tool lives at `scripts/index.js`. If dependencies are missing at first use, the agent detects the error and runs `npm install` in the skill directory automatically.

## Interaction Flow for Agent Execution

### 1. Project Initialization & Bootstrap

Ask the user:
1. **Source Folder**: Where are the raw files?
2. **Project Name & Destination**: Name for the project and where to save it (recommend `Documents/traNNsform/[project-name]`).

Then run:
```bash
node scripts/index.js --src "<source-folder>" --dest "<destination-parent-folder>" --name "<project-name>"
```

### 2. Capability Scan & Ingestion

> **Philosophy**: Each agent/model has different native capabilities. Some read PDFs directly, others don't. Instead of assuming, the skill presents a **diagnostic panel** with the available routes and their tradeoffs, and the user decides.

#### 2a-0. Prepare `raw/` directory — MANDATORY, DO NOT SKIP

**All files MUST go through `raw/` before the scanner. Never convert files directly.**

1. **Check if `raw/` exists** inside the project directory. If not, create it: `mkdir raw/`
2. **Locate source files** — they may be in `input/`, `Downloads/`, or a user-specified folder
3. **Copy files into `raw/`** (preserve originals, do not move):
   - If the user specified a source folder, copy everything from there
   - If files are scattered, copy each one into `raw/`
   - If the user ran the bootstrap CLI (`node scripts/index.js --src ...`), `raw/` is already populated
4. **Only once `raw/` is populated**, proceed to scan. The entire pipeline is:

   ```
   source files → raw/ → scanner → md/ (normalized + _all.md + frontmatter) + index.md (manifest)
   ```

> **⚠️ Why this matters**: The scanner generates YAML frontmatter with source traceability (sha256 hash, size, normalized_at timestamp) and consolidates everything into `md/_all.md`. Bypassing it means losing traceability and breaking downstream transformations that depend on `_all.md`.

#### 2a. Detect formats in `raw/`

Supported formats: `txt`, `md`, `csv`, `json`, `docx`, `pdf`, `xlsx`

Read the `raw/` folder (now populated), group files by extension, and show the user:
```
Formats detected in source folder:
  - txt:  3 files
  - docx: 2 files
  - pdf:  1 file
```

#### 2b. Capability Assessment — Present the decision matrix

**IMPORTANT**: Before asking what to do, present this diagnostic table for each detected format. The goal is for the user to SEE the complete picture.

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

Then, for each detected format **that is NOT plain text**, present the user ONE unified question per format:

```
Format: PDF (1 file)
  [a] Agent-native — may or may not work depending on the model, variable token cost
  [b] Node.js (pdf-parse) — one-time install (~2MB), local processing, no extra token consumption
  [c] Skip this format

Which route do you prefer for PDF? (a/b/c)
```

**Rules for the agent when presenting this:**

1. **Clear visual indicator**: If the agent knows (from its own configuration or because it asked earlier) that it CAN read PDF natively, show `[a]` as `✅ RECOMMENDED` if it incurs no extra cost, or `⚠️ Native (token cost)` if the cost is significant.
2. **If the agent DOES NOT KNOW** if it can read the format natively, say so explicitly: _"I cannot guarantee that my model reads PDFs natively. The most reliable option is [b]."_
3. **Option `[a]` MUST ALWAYS clarify the token tradeoff** (or processing time) when applicable.

#### 2c. Verify Node.js availability

For option `[b]`, check availability before asking. If Node.js is not available, show the option as `❌ Not available`:

```bash
node --version
```

If the command fails or no shell is available, report: _"I cannot verify if Node.js is installed in this environment. If you know you have it, let me know and I'll try."_

#### 2d. Execute the chosen strategy

Depending on the user's decision for each format:

- **Option `[a]`**: Read the file directly using the agent's read capabilities (Read tool, native PDF, etc.). The agent transforms the content to Markdown manually.
- **Option `[b]`**: If the library is not installed, ask for confirmation and run `npm install <package>` in the skill folder (base directory). Then run the conversion script.
- **Option `[c]`**: Skip the format.

**Installation note**: If the user chooses to install a library and it fails (permissions, network, environment), report the exact error and offer to return to the options menu to choose another route.

#### 2e. Run the scan

```bash
node scripts/index.js --scan --src "<target-project-directory>"
```

Read the generated `index.md`. If there are files marked as `?` (docx, pdf) or `NO` (audio, images), inform the user.

### 3. Transformation — Using the Agent's LLM

The skill **does not depend on external APIs** (Gemini, OpenAI). The transformation is performed by the agent itself using its built-in language model. The CLI script `scripts/transformer.js` remains as an optional fallback.

**IMPORTANT**: Before transforming, read the content of `md/_all.md` and ask:

#### 3a. Check for local templates

Check if there are `*traNNsform.md` files in the project root. If there are, ask if they want to use a local one or explore other options.

#### 3b. Select or create a template

If there is no local template or the user prefers another option, ask: **"Do you want to apply an existing transformation or create a new one?"**

- **Apply existing**: Read templates in `traNNsformations/`, list them, let them choose.
- **Create new**: Guide step by step (name, purpose, instructions, structure, location).

#### 3c. Ask version type — BEFORE transforming

Before generating the document, ask:

**"Do you want to generate a draft with comments and source citations for review, or a clean final version?"**

- If they choose **draft**: Generated with all annotations, citations, and review markers (see point 4). File name: `[template-name]_V_x-y-z_draft.md` (e.g. `Lean_Business_Plan_V_0-1-0_draft.md`).

- If they choose **final version**: Generated clean, without annotations. Then ask:

  **"How do you want to handle citations in the final version?"**

  - **[A]** Include sources inline (Recommended) &mdash; prompts citation format selection (SS3c-i)
  - **[B]** Review draft first &mdash; shows the draft for editing, then prompts format selection after edits
  - **[C]** No sources &mdash; strips all HTML comments and visible citations from the output
  - **[X]** Cancel

  File name: `[template-name]_V_x-y-z.md` (e.g. `Lean_Business_Plan_V_0-1-0.md`, starting at 0.1.0).

- Once citations are settled (or skipped), proceed to handle incomplete template sections (§3c-ii).

#### 3c-i. Citation format selection

After the user selects option [A] (Include sources inline) or completes editing in option [B] (Review draft first), present the following format choices:

| Code | Format | Notes |
|------|--------|-------|
| [a] | Sencillo (Recommended) | Keeps `— Source: <filename>, section <section>` verbatim |
| [b] | APA | 7th edition in-text citations |
| [c] | MLA | 9th edition parenthetical |
| [d] | Chicago | Notes-bibliography or author-date |
| [e] | IEEE | Numbered references |
| [f] | Vancouver | Numeric citation style |
| [g] | BibTeX | Exports a `.bib` file |
| [x] | Back | Return to previous question |

Apply the format according to the rules in [`citations.md`](citations.md). HTML comments MUST be removed from the final output. Only visible citations remain, formatted per the chosen style.

For option [C] (No sources), skip this sub-section entirely — no format selection is needed.

#### 3c-ii. Handle incomplete template sections

**This step runs only for final versions.** Draft versions skip directly to §3d.

**Step 1: Scan sections against source material.** Compare the selected template's sections against the available source content in `md/_all.md`. For each section, determine whether sufficient source paragraphs exist to populate it. Flag sections as **incomplete** when no source paragraph maps to them. Use your own LLM judgement for the mapping — there is no static tool for this.

**Step 2: Present summary table.** If one or more sections are flagged, display a table with section name and reason for each:

```
The following template sections lack sufficient source material:

  # │ Section          │ Reason
  ───┼─────────────────┼──────────────────────────────────
  1  │ IOE.1           │ No source paragraphs match this section
  2  │ Recommendations │ Only indirect mentions; no dedicated content
  3  │ Annex C         │ Source document missing for this appendix
```

If **no sections are flagged**, skip the rest of §3c-ii and proceed directly to §3d.

**Step 3: Ask the user which mode to use.** Present the six modes as labeled options. Pre-select the option matching `empty_sections_mode` in the frontmatter (default: `ask-per-section`). The user MAY override at runtime; the runtime choice takes precedence.

```
[empty_sections_mode is set to "{frontmatter_value}"]

How do you want to handle the flagged sections?

  [a] Insert comment    — Place HTML comment: "<!-- No hay información suficiente para completar esta sección -->"
  [b] Omit section      — Remove heading + body from output
  [c] Generate content  — Synthesize from project context (no marker)
  [d] Generate (tagged) — Synthesize, prepend "[Generated — verify]"
  [e] Ask per section   — Prompt me for each flagged section individually (Recommended)
  [f] Keep placeholder  — Keep template's original text (e.g. "[Pending]")
  [x] Cancel transformation
```

| Mode | Behavior | Application |
|------|----------|-------------|
| `[a]` comment | Insert `<!-- No hay información suficiente para completar esta sección -->` in place of the section body. Heading remains. | Global (same for all flagged sections) |
| `[b]` omit | Remove heading + body from output. Surrounding sections close without blank gaps. | Global |
| `[c]` generate | Synthesize plausible content from project context (source files, prior sections, document purpose). No marker. | Global |
| `[d]` generate-tagged | Same as `[c]` but prepend `[Generated — verify]` at the start of the section body. | Global |
| `[e]` ask-per-section | Iterate flagged sections one by one. For each, show name + reason and prompt: `comment`, `omit`, `generate`, `generate-tagged`, or `template-default`. | Per-section (different modes per section) |
| `[f]` template-default | Keep the template's original placeholder text verbatim (e.g. `[Pending]`). For an empty body, keep heading + empty body. | Global |

**Step 4: Apply the mode.** For modes `[a]–[d]` and `[f]`: apply the chosen behavior to every flagged section. For mode `[e]`: iterate flagged sections, prompt individually, and apply per-section.

**Step 5: Proceed to generation.** Once modes are resolved, proceed to §3d.

**Frontmatter reference:**

```yaml
# Default: "ask-per-section"
# Valid values: comment, omit, generate, generate-tagged, ask-per-section, template-default
empty_sections_mode: "ask-per-section"
```

If `empty_sections_mode` contains an unrecognized value, warn the user and fall back to `ask-per-section`.

#### 3d. Perform the transformation (agent does it, not external API)

1. Read the template and `md/_all.md`.
2. Using your own LLM as agent, generate the transformed document following the template instructions and version rules (draft or final), with the empty sections mode applied (§3c-ii).
   - If **draft**: include HTML comments + visible citations per SS4 draft rules.
   - If **final with [A] or [B]**: first apply empty sections handling (§3c-ii), THEN apply the chosen citation format (SS3c-i). HTML comments MUST be removed; visible citations formatted per the selected style.
   - If **final with [C]**: apply empty sections handling (§3c-ii), then strip ALL `<!-- cite: ... -->` HTML comments AND `— Source: ...` visible citations from the output.
3. Write the file in `output/[template-name]/` with the corresponding name.
4. Present the result to the user.

If for any reason you cannot generate the content (context too large, etc.), inform the user and offer the CLI transformer.js as fallback:
```bash
node scripts/index.js --apply "<template-name>" --src "<target-project-directory>"
```

### 4. Draft content with source traceability

When the user chooses **draft**, the `_V_x-y-z_draft.md` file must include:

Every citation in a draft MUST include two components: a machine-readable HTML comment immediately before the visible attribution text, and the visible text itself. The HTML comment serves as a structured pointer for final document processing.

#### Mandatory header

The document must begin with:

```markdown
# DRAFT FOR REVIEW — NOT FINAL VERSION
```

#### Source citations per claim

Each fact, figure, or conclusion must include a reference to the source document from which it was extracted. Use sequential `src-NNN` pointers (e.g. `src-001`, `src-002`) to identify each unique source. Reuse the same `src-NNN` when citing the same source in multiple sections.

Every citation MUST include TWO elements:

1. **HTML comment** (machine-readable): `<!-- cite: src-NNN, section <section-name> -->`
2. **Visible text** (human-readable): `— Source: <filename>, section <section-name>`

The HTML comment MUST appear immediately before the visible text.

Source IDs (`src-NNN`) map to relative file paths from the workspace root. Before drafting, scan `md/` files for `source.file` in their YAML frontmatter and build a mapping — e.g., `src-001` &rarr; `raw/if-narrative-gv22bo-1.md`.

```markdown
<!-- cite: src-001, section IOE.1 -->
— Source: IF Narrative GV22BO-1, section IOE.1
```

```markdown
<!-- cite: src-002, interview Etelvina -->
— Source: Transcripts T11, interview Etelvina
```

#### Review annotations in Markdown format

Use GitHub Flavored Markdown note blocks:

```markdown
> [!NOTE] Revisar: este dato proviene de una fuente parcial. Contrastar con otras fuentes.
```

```markdown
> [!WARNING] No confirmado en otras fuentes. Verificar con la MML original.
```

```markdown
> [!TIP] Esta conclusión surge del cruce de tres fuentes independientes.
```

#### Uncertainty markers

When a fact is unclear or the source is ambiguous:

```markdown
[unconfirmed data — review]
```

```markdown
[own estimate — cross-check with official sources]
```

```markdown
[approximate date — verify]
```

### Citation Formats

When the user selects a citation format (from SS3c-i), load [`citations.md`](citations.md) and follow the rules for the selected format. HTML comments MUST always be removed from final output unless stated otherwise.

### 4b. Post-Generation Validation (iNNfo models only)

When the transformation target is an iNNfo template (business, procedures, catalog, etc.), the generated model MUST pass through the pipeline validation gate before delivery:

```bash
node scripts/pipeline-gate.mjs validate "<output-path>"
```

If validation fails, report the errors to the user and DO NOT proceed. After validation passes, run the integration gate:

```bash
node scripts/pipeline-gate.mjs integrate "<output-path>" [--target-dir <workspace-root>]
```

This increments the patch version, moves the file to the workspace root, and updates index.md.

### 5. Output Convention

Each transformation creates a subfolder inside `output/` named after the template. All artifacts for that transformation (drafts, finals, bib files) live in that subfolder.

| Type | Path | Example |
|------|------|---------|
| Draft | `output/[template-name]/V_x-y-z_draft.md` | `output/Summary_Bands/V_0-1-0_draft.md` |
| Final | `output/[template-name]/V_x-y-z.md` | `output/Summary_Bands/V_0-1-0.md` |
| Final (next version) | `output/[template-name]/V_x-y-z.md` | `output/Summary_Bands/V_0-2-0.md` |
