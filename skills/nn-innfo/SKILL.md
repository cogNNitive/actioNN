---
name: nn-innfo
version: "V_2-1-1"
last_updated: 2026-07-12
metadata:
  source_type: "original"
  mcp: "innfo-mcp"
license: MIT
description: |
  MANDATORY trigger: MUST activate this skill whenever the user is creating, editing, validating, or discussing any iNNfo model, template, specialization, sample, or specification file.
  This includes but is not limited to:
  - Creating or editing any file matching *_NN.md or *_FORMAT.md
  - Authoring or modifying business models, procedure models, or any model following an iNNfo template
  - Creating, editing, or modifying templates or specializations under docs/templates/
  - Discussing the iNNfo specification, concepts, markers, matrices, or naming conventions
  - Generating dashboard renderers for templates
  - Any conversation about how iNNfo works, how to use it, or how to structure iNNfo files
---

# iNNfo Skill

> **ACTIVATION = GREETING REQUIRED**: When this skill is loaded, the agent MUST greet the user. See Greeting Protocol below.

This skill guides LLMs and agents in authoring, editing, and validating **iNNfo-compliant files** (V_0-2-0+ with `_NN` structural markers).

**Resolution, validation, and mutation are delegated to the `innfo-mcp` server** â€” a deterministic engine wrapping `@cognnitive/innfo-core`. The agent does NOT hand-resolve spec chains or hand-validate models when the MCP is available. See Â§1 (MCP Operating Model) and Â§7 (Delegation Contract).

## Greeting Protocol (MANDATORY)

When this skill is activated, the agent MUST print exactly:

```
ðŸ”§ You're using skill: nn-innfo (ðŸ§ )
```

as its very first output â€” before any questions, analysis, or tool calls. Session-scoped: only once per conversation. After the greeting, proceed with the capabilities relevant to the current request.

---

## Core Concepts

### Specification Stack (defiNNe)

| Level | Role | File Pattern | Example |
|-------|------|-------------|---------|
| 0 | Meta-specification | `*_NN.md` | `defiNNe_V_0-1-1_NN.md` |
| 1 | Concrete specification | `*_NN.md` | `iNNfo_V_0-2-0_NN.md` |
| 2 | Template | `*_NN.md` | `business_V_0-1-1_NN.md` |
| 3 | Model | `*_NN.md` | `Ghostbusters_V_0-1-2_business_NN.md` |

### Templates vs Specializations

- **Template** (level 2): Declares concepts, markers, matrices. Published under the spec repo at `specs/.../level2/<name>/`.
- **Specialization** (level 2): Self-contained template derived from an official one. Fully autonomous.

### Naming Convention (defiNNe Â§6)

| Type | Pattern | Example |
|------|---------|---------|
| Official template | `<Template>_V_x-y-z_NN.md` | `business_V_0-1-1_NN.md` |
| Level 3 model | `<Model>_V_x-y-z_<Template>_NN.md` | `Ghostbusters_V_0-1-2_business_NN.md` |
| Workflow | `<Name>_V_x-y-z_workflow_NN.md` | `example_V_1-0-0_workflow_NN.md` |
| Source | `<Name>_source_NN.md` | `transcript_source_NN.md` |

> **Note:** Historical documents use `_FORMAT.md` (V_0-1-0) or `_F.md` (V_0-1-5 transitional). Current iNNfo V_0-2-0+ uses `_NN.md`.

### Structural Markers

iNNfo V_0-2-0 uses `_NN` as the structural marker prefix. Two forms are valid:

| Form | On `#` heading | On `*` list item |
|------|----------------|-----------------|
| **Visible** | `# _NN ConceptName` | `* _NN ConceptName: Element Name` |
| **Hidden** | `# <!-- _NN --> ConceptName` | `* <!-- _NN ConceptName: --> Element Name` |

The hidden form wraps the marker in an HTML comment so it is invisible when rendered.

---

## 1. MCP Operating Model

The `innfo-mcp` server exposes six tools. It is **publisher-agnostic**: it never stores spec/template URLs or template names internally. A spec/template is resolved ONLY from a URL you supply, or from a loaded model's `parent_spec.url` (the model is the source of truth).

| Tool | Purpose | Key arguments |
|------|---------|---------------|
| `list_models` | Scan a directory for iNNfo models | `root?` |
| `read_model` | Parse a model into structured JSON | `id` |
| `get_spec` | Resolve the level-1 iNNfo spec | `url?` **or** `model_id?` |
| `get_template` | Resolve a level-2 template | `url?` **or** `model_id?` (optional `name`) |
| `validate_model` | Validate against the resolved template | `id?` / `content?` (+ optional `template_url`) |
| `apply_change` | Mutate a model and re-validate | `id`, `op`, `args` |

**Golden rule:** the URL always comes from the user or from the model. Never invent or hardcode a spec/template URL when calling the MCP.

### `apply_change` operations

`op` âˆˆ `add_concept | add_field | set_marker | add_element | remove_element`. Semantics: parse â†’ mutate â†’ serialize â†’ **validate â†’ reject-without-writing on failure**. Renaming is NOT an `apply_change` operation â€” use the Rename Safety procedure (Â§5) then `validate_model`.

---

## 2. Canonical Specification Index (stable URLs)

Use these **stable `latest` URLs** for human reference and authoring guidance. They always point to the current published version:

- **defiNNe** (level 0): `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level0/defiNNe_NN.md`
- **iNNfo** (level 1): `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level1/iNNfo_NN.md`
- **Business** (level 2): `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/business/business_NN.md`
- **Procedures** (level 2): `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/procedures/procedures_NN.md`
- **Catalog** (level 2): `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/catalog/catalog_NN.md`

> **Stable vs immutable:** `latest/` URLs are convenience aliases that move with each release â€” use them for authoring guidance. A level-3 model's own `parent_spec.url` MUST pin an **immutable** versioned URL (e.g. `.../specs/v0.1.0/level2/business/business_V_0-1-1_NN.md`) so validation is reproducible. The MCP resolves whatever URL the model declares.

---

## 3. Frontmatter by Level

**Level 0 (defiNNe):**
```yaml
---
specification_version: "V_0-1-1"
specification_url: "<immutable-url>"
level: 0
title: "..."
status: "Draft | Stable | Deprecated"
---
```

**Level 1 (iNNfo):**
```yaml
---
spec_version: "V_0-2-0"
spec_url: "<immutable-url>"
level: 1
parent_spec: { name: "defiNNe_V_0-1-1", url: "<immutable-url>" }
title: "..."
---
```

**Level 2 (Template):**
```yaml
---
spec_version: "V_0-2-0"
spec_url: "<immutable-url>"
level: 2
parent_spec: { name: "iNNfo_V_0-2-0", url: "<immutable-url>" }
title: "..."
concepts: [...]
markers: [...]
matrices: [...]
relationship_declarations: {...}
---
```

**Level 3 (Model â€” lightweight, NO template inline):**
```yaml
---
spec_version: "V_0-2-0"
spec_url: "<immutable-url>"
level: 3
parent_spec: { name: "<template>_V_x-y-z", url: "<immutable-url>" }
model_version: "V_x-y-z"
title: "..."
asset_mode: "centralized"    # optional, default "centralized"
---
```

### Body rules

- **Document Notice (Required)** â€” the first body content MUST be:
  ```markdown
  > [!NOTE]
  > This is a **iNNfo document** â€” a plain-text Markdown file that carries its own schema in the YAML frontmatter.
  ```
- **Index Block** â€” `# _NN index` followed by nested Markdown lists (WikiLinks `[[...]]`, Markdown links, or `_NN index:` syntax).
- **Concept Blocks** â€” `# _NN <ConceptName>` (visible) or `# <!-- _NN --> <ConceptName>` (hidden).
- **Element Lines** â€” `* _NN <ConceptName>: <Element Name>` with optional indented YAML fields.
- **Matrices** â€” `# _NN matrices: <matrix-name>` followed by a Markdown table.

### Concept Types

| Type | Syntax | Description |
|------|--------|-------------|
| `text` | Free-form Markdown | Single block of content |
| `weight` / `list` | Bullet list with `_NN` markers | Multi-instance with optional YAML |
| `category` | No content block | Taxonomy-only |
| `steps` / `sequence` | Ordered bullet list | Ordered sequence |

---

## 4. Operational Instructions (MCP-first)

### Generate a model
1. Obtain the template: `get_template({ url })` with the user-provided template URL (or `{ model_id }` if extending an existing model). If none is given, offer the templates from Â§2.

2. **Show and confirm concepts** — use the `question` tool to present the template's concepts:

   ```markdown
   Template `{name}` defines these concepts:
     - {ConceptName} ({type}) — {description}
     ...

   Do you want to include all of them?
   - **[a]** Include all (Recommended)
   - **[b]** Select specific concepts
   - **[x]** Cancel
   ```

   If [b], ask which concepts to include and only use those.
   If [x], stop and report "Model creation cancelled by user."

3. **For each confirmed concept, present its fields and ask for approval** — use the `question` tool:

   ```markdown
   Concept `{name}` ({type})
   Fields:
     {field_name} ({type}) — {rationale}
     ...

   Do you approve these fields?
   - **[a]** Approve and continue (Recommended)
   - **[b]** Modify field configuration
   ```

   Do NOT proceed until the user confirms. If [b], follow Â§8 (Field Creation Protocol) to let the user customize.

4. Author the model body with `_NN` markers using only the confirmed concepts and fields.

5. Set the model's `parent_spec.url` to the **immutable** template URL.

6. Validate before finishing: `validate_model({ content })` (inline) or `validate_model({ id })` (on disk).

7. **Preview link** — provide a link to view the model:

   > ð Preview in iNNfo Modeler: https://innfo.cognnitive.com/app/
   > To preview, open the iNNfo Modeler in your browser and load the model's folder.

### Validate a model
- Call `validate_model({ id })` or `validate_model({ content })`. The template is resolved from the model's `parent_spec.url`.
- If the model has no resolvable `parent_spec.url`, either pass `template_url` explicitly or accept the structural-only result â€” which carries a `warning`: *"No template resolved; structural validation only."* Surface that warning to the user; do not present structural-only validation as full compliance.
- Report `valid`, `errors[]`, and `warnings[]` faithfully. Do NOT declare a model valid if `valid` is false.

### Edit a model
- For supported mutations use `apply_change({ id, op, args })`. It re-validates and refuses to write an invalid result.
- For renaming, follow Â§5 (Rename Safety), then `validate_model`.

### Inspect
- `list_models({ root })` to enumerate; `read_model({ id })` to get structured JSON (concepts, elements, matrices, taxonomy).

---

## 5. Rename Safety & Referential Integrity (MANDATORY)

Every concept and element name in an iNNfo document is a globally unique identifier. `apply_change` does not rename â€” do this manually, then validate.

**If renaming a CONCEPT** update: template `concepts[].name`; template `matrices[].source/target`; concept H1 `# _NN <Name>`; element lines `* _NN <Name>:`; matrix table headers/rows; index block `[[<Name>]]`; all narrative WikiLinks; matrix section names `# _NN matrices: <name>-...`.

**If renaming an ELEMENT** update: the element line label; matrix row/column headers; item-markers matrix first column; all WikiLinks `[[<Old Name>]]`.

**Procedure:** (1) search the ENTIRE document for the old name; (2) classify each occurrence (skip YAML keys, data values, generic prose); (3) update all references preserving `_NN` marker syntax; (4) run `validate_model` and confirm no `[[Old Name]]` remains and every `_NN` marker maps to an existing concept.

---

## 6. Dashboard Renderer (Template Companion Artifact)

A dashboard renderer is an HTML fragment companion to a template, versioned with it at `docs/templates/<templateName>/V_x-y-z/dashboard.html`.

### Syntax â€” Mustache
Logic-less [Mustache](https://github.com/janl/mustache.js): `{{model.title}}` (escaped interpolation), `{{#concepts}}...{{/concepts}}` (sections), `{{^matrices}}...{{/matrices}}` (inverted). **Prohibited**: triple-mustache `{{{`, partials `{{>`, delimiter change `{{=`.

### Data Exposed
```
model: { title, version, specificationVersion }
template: { name, version, title }
concepts: [{ name, instances: [{ label, fields }] }]
hierarchyConcepts: [{ name, parent? }]
taxonomyEdges: [{ source, target, label? }]
matrices: [{ name, headers[], rows[][] }]
```

### Security Constraints
HTML fragment only. No `<!DOCTYPE>`, `<html>`, `<head>`, `<body>`, `<script>`, `<iframe>`, `<object>`, `<embed>`, `<link>`, `<meta>`, no `on*` attributes, no `javascript:` URIs. All CSS inlined. Images via `data:` URIs only. Max 256 KB.

### Generation Prompt (INVARIANT)
> Genera un archivo HTML sin encabezados ni nada, solo cÃ³digo HTML que represente de la mejor forma posible a nivel visual el modelo cargado, usando los placeholders Mustache definidos en el skill de iNNfo.

---

## 7. Delegation Contract & Fallback

### When the MCP is available (default)
1. **Never hand-roll resolution.** Use `get_spec` / `get_template`.
2. **Never hand-validate.** Use `validate_model` and report its result verbatim.
3. **Prefer `apply_change`** for supported mutations (deterministic, reject-on-invalid).
4. Pass URLs from the user or the model â€” never a constant.

## MCP Activation Protocol (run BEFORE any operation)

### Step 1 â€” Check availability (AUTHORITATIVE)

Check your OWN available tool list for tools matching the `innfo-mcp_*` prefix:
- `innfo-mcp_list_models`, `innfo-mcp_read_model`, `innfo-mcp_get_spec`
- `innfo-mcp_get_template`, `innfo-mcp_validate_model`, `innfo-mcp_apply_change`

Do NOT check config files first â€” check the actual session tools. **This is the only authoritative check.**

If the tools are listed â†’ proceed. The MCP Operating Model (Â§1) applies. Stop here.

### Step 2 â€” If NOT available, diagnose

Tools not found â†’ they may be registered but not yet loaded. Check:

1. **Global OpenCode config**: `~/.config/opencode/opencode.json` â€” look for `innfo-mcp` under `mcp`
2. **Local repo config**: `.opencode/opencode.json` â€” look for `innfo-mcp` under `mcp`
3. **Other configs**: `.agents/mcp_config.json`, `.claude/settings.json`
4. **Server binary**: Does `packages/innfo-mcp/dist/server.js` exist? If not, build (`npm run build` from that package)

If found in any config â†’ ask the user to reload/restart OpenCode so the session picks up the MCP registration.

### Step 3 â€” Not configured anywhere

Check `docs/mcp-setup.md` in the workspace. If absent, research how OpenCode registers external MCP servers (docs at https://opencode.ai/docs/mcp). Guide the user to create the config entry, then reload.

### Step 4 â€” If MCP is still unavailable after activation

Degrade gracefully (fallback):
1. Fetch the relevant spec/template on demand from the URL declared in the model's `parent_spec.url`, or from the stable URLs in Â§2.
2. Resolve the parent chain manually up to level 0, caching under a local `specs/` directory.
3. Validate by hand against the resolved template: frontmatter by level, `_NN` markers, concept headers, element syntax, matrix headers, and the parent chain.
4. Tell the user you are in fallback mode and that validation is not engine-backed.

---

## Validation Contract (for Pipeline Gates)

The `innfo-mcp` exposes the following validation contract that pipeline gates consume:

| Tool | Input | Output | Used By |
|------|-------|--------|---------|
| `validate_model` | `id` (disk) or `content` (inline) + optional `template_url` | `{ valid, errors[], warnings[] }` | Validate gate (content mode) |
| `validate_model_url` | `model_url` + optional `template_url` | `{ valid, errors[], warnings[] }` | Validate gate (URL mode) |

**Naming convention** (defiNNe Â§6): Model files MUST follow `<Name>_V_x-y-z_<Template>_NN.md`. Draft status goes in frontmatter (`status: "Draft"`), never in filename (`_NN_draft.md` is INVALID).

**Frontmatter requirements** (level 3): MUST include `spec_version`, `spec_url`, `level: 3`, `parent_spec { name, url }`, `model_version`, `title`. Body MUST start with `> [!NOTE] This is a **iNNfo document**...`.

These rules are enforced by `packages/pipeline-gates/src/validate.ts` and the corresponding CLI `scripts/pipeline-gate.mjs validate`.

---

## 8. Field Creation Protocol (MANDATORY)

When a user requests adding new fields to a concept, OR when you determine that fields are needed based on source data, you MUST follow this protocol step by step. Do NOT skip to execution.

### Step 1 â€” Analyze

Examine the source data to determine:
- What values will each field hold? (free text, enumerated list, markdown bullets, numeric score, date, cross-reference)
- Is the value single or multi-instance?
- How will cogNNitive render it? (table column, detail panel, card)

### Step 2 â€” Propose

Present a proposal table to the user with EXACTLY this structure:

```
Field Name | Proposed Type | Rationale | Config / Values
```

Use this type-selection guide:

| iNNfo Type | When to Use | Renders in cogNNitive Table As |
|---|---|---|
| `string` | Short text, names, identifiers, single-line values | Raw text, truncated if long |
| `markdown_inline` | Bullet lists, multi-line formatted text, rich descriptions | Rendered Markdown (bullet lists, emphasis) |
| `number` | Prices, scores, percentages, quantities | Right-aligned, numeric formatting |
| `enum` | Fixed set of 3â€“10 predefined values | Colored badge / dropdown filter |
| `reference` | Cross-link to another concept element | Clickable chip / link |
| `date` | Dates, timestamps, deadlines | Locale-formatted date |

**Mandatory for every proposal:** State WHY you chose each type. For example:
> "`markdown_inline` for `strengths` because source values contain multi-line bullet lists â€” `string` would render raw `["item1", "item2"]` JSON in the table."

### Step 3 â€” Wait for Confirmation

Do NOT execute any change until the user explicitly confirms the proposal. If the user modifies the proposal, update the proposal and re-present.

### Step 4 â€” Execute with `apply_change`

Once confirmed, use `apply_change({ id, op: "add_field", args })` for each field. Do NOT hand-edit the YAML â€” the MCP validates and rejects invalid changes.

### Step 5 â€” Validate

Run `validate_model({ id })` and report the result. If validation fails, revert the changes and explain the errors to the user.

### Step 6 â€” Versioning

After successful validation, ask the user:
> "The model validates successfully. Do you want to:
> - **[a]** Save under the current version (`V_x-y-z`)
> - **[b]** Increment the **patch** version (`V_x-y-z+1`)
> - **[c]** Increment the **minor** version (`V_x-y+1-0`)
> - **[x]** Cancel all changes"

Update `model_version` in the model's frontmatter accordingly.

---

## 9. Specialization Strategy (MANDATORY)

When a model needs custom fields, concepts, or markers that are not in the base template, you MUST NOT modify the base template. Follow the specialization strategy instead.

### Hard Rules

1. **NEVER modify** a published template spec in `specs/` â€” they are immutable.
2. **NEVER modify** a `.specs/` local copy that cogNNitive downloaded from a URL â€” it is a cache, not a workspace file.
3. **NEVER modify** the original template's `concepts[]`, `markers[]`, or `matrices[]` in place.

### Specialization Procedure

**Step 1 â€” Identify the template to extend**

The model's `parent_spec.name` tells you which template it uses.

**Step 2 â€” Fetch the template content**

Use `get_template({ model_id })` to resolve the template structure.

**Step 3 â€” Create the specialization file**

Naming: `<ModelName>_<Template>_V_x-y-z_spec_NN.md`

Examples:
- `GG_business_V_1-0-0_spec_NN.md` â€” specialization of business template for the GG model
- `Ghostbusters_business_V_0-1-2_spec_NN.md` â€” specialization for Ghostbusters

Place it at the project root or in a `specs/` directory alongside the model.

**Step 4 â€” Specialization frontmatter**

```yaml
---
spec_version: "V_0-2-0"
spec_url: "<immutable-url>"
level: 2
parent_spec:
  name: "<original template name>"
  url: "<original template URL>"
title: "<ModelName> â€” <Template> Specialization"
extends: "<Template>_V_x-y-z"
custom_fields:
  - concept: "<ConceptName>"
    fields:
      - name: "<field1>"
        type: "<type>"
      - name: "<field2>"
        type: "<type>"
---
```

The body MUST contain the full `concepts[]`, `markers[]`, `matrices[]` from the base template, merged with any additions. This makes the specialization self-contained and resolvable.

**Step 5 â€” Update the model**

Change the model's `parent_spec` to point to the specialization:
```yaml
parent_spec:
  name: "<ModelName>_<Template>_V_x-y-z_spec"
  url: "<local or repo path to the specialization file>"
```

**Step 6 â€” Validate**

Run `validate_model({ id })` â€” the MCP resolves the specialization as a level-2 template.

**Step 7 â€” Version control**

Commit the specialization file alongside the model. It is a first-class artifact.

---

## 10. Post-Edit Validation & Versioning (MANDATORY)

This protocol applies AFTER every model or spec edit â€” whether from Â§8, Â§9, Â§5 (Rename), or any other modification.

### Step 1 â€” Validate

Run `validate_model({ id })` immediately after the edit. The MCP MUST be available. If it is not, tell the user and refuse to declare the edit complete.

### Step 2 â€” Report

Present the validation result faithfully:
- `valid: true` â†’ proceed
- `valid: false` â†’ list `errors[]` and `warnings[]`. Do NOT present the model as valid. Offer to fix or revert.

### Step 3 â€” Version Bump Decision

After successful validation, ask the user:
> "The model validates successfully. Do you want to:
> - **[a]** Keep the current version (`V_x-y-z`)
> - **[b]** Increment **patch** (`V_x-y-z+1`) â€” bug fixes, minor edits
> - **[c]** Increment **minor** (`V_x-y+1-0`) â€” new fields or concepts added
> - **[x]** Cancel all changes
> 
> (Recommended: [b] for field additions, [c] for new concepts)"

If the user chooses [b] or [c], update `model_version` in the model's frontmatter. If [x], revert the changes.
### Step 4 - Confirm

Print the final state and a preview link:
```
{Model} v{new_version} - valid, saved to {path}
Preview in iNNfo Modeler: https://innfo.cognnitive.com/app/
    Open the iNNfo Modeler and load the model's folder to view it.
```

## Core Rules

1. **Spec Immutability**: Published specs are frozen. Never edit historical spec files. Change only via new versions.
2. **Spec over Tolerant Code**: Reject invalid models â€” never silently tolerate non-compliance.
3. **No Backward Compatibility**: Target the CURRENT spec version only.
4. **Template Inline Restriction**: Level 3 models MUST NOT inline `concepts`, `markers`, or `matrices`. They rely on `parent_spec.url` + the resolver.
5. **Language Domain Contract**: Generated artifacts default to English. Conversation follows the user's language.
6. **Referential Integrity on Rename**: Every concept/element name is a globally unique identifier. Update ALL references before renaming (Â§5).
7. **Engine over Prose**: When the MCP is available, delegate resolution/validation/mutation to it (Â§7).
8. **Pipeline Validation**: When this skill is loaded in the context of a model-generation workflow, the calling orchestrator SHOULD run the validate gate before the model is delivered to the user. The integration gate MUST increment the patch version on successful validate.
9. **Field Creation Protocol**: When creating fields, follow Â§8 â€” propose before executing, get user confirmation, validate after.
10. **Specialization over Mutation**: When a model needs custom fields beyond the base template, follow Â§9 â€” create a specialization rather than modifying the original template.
11. **Post-Edit Validation**: After any model/spec edit, run `validate_model()` and ask about version bump (Â§10). Never declare completion without validation.
