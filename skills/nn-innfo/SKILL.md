---
name: nn-innfo
version: "V_0-3-0"
last_updated: 2026-08-02
metadata:
  source_type: "original"
  mcp: "innfo-mcp"
license: MIT
description: |
  MANDATORY trigger: MUST activate this skill whenever the user is creating, editing, validating, scaffolding, or discussing any iNNfo model, template, specialization, sample, or specification file. Includes the conversational Model Creation Wizard.
  This includes but is not limited to:
  - Creating a new model step-by-step using templates (Business, Procedures, Organization, Blank)
  - Creating or editing any file matching *_NN.md
  - Authoring or modifying business models, procedure models, or any model following an iNNfo template
  - Creating, editing, or modifying templates or specializations under docs/templates/
  - Discussing the iNNfo V_0-3-0 specification, meta-templates, primitives, matrices, or naming conventions
  - Any conversation about how iNNfo works, how to use it, or how to structure iNNfo files
---

# iNNfo Skill

> **ACTIVATION = GREETING REQUIRED**: When this skill is loaded, the agent MUST greet the user. See Greeting Protocol below.

This skill guides LLMs and agents in authoring, creating from scratch (wizard), editing, and validating **iNNfo-compliant files** (V_0-3-0 Meta-template specification with unified `NN` syntax: `# NN`, `## NN`, and `key:: value`).

**Resolution, validation, and mutation are delegated to the `innfo-mcp` server** — a deterministic engine wrapping `@cognnitive/innfo-core`. The agent does NOT hand-resolve spec chains or hand-validate models when the MCP is available. See §1 (MCP Operating Model) and §7 (Delegation Contract).

## 0. Conversational Model Creation Wizard

When the user asks to "create a new model", "start a model from scratch", or selects model creation from a menu:

1. **Explain Templates**: Briefly explain that Level 2 templates instantiate root primitives (`# NN Concept Definition`, `# NN Field Definition`, `# NN Matrix Definition`, `# NN Marker Definition`). Available templates: Business 🏢, Procedures 📋, Organization 👥, Blank ⬜.
2. **Template Selection**: Present the selection menu. Always prefix option `[a]` with `(Recomendado)`:
   - **[a] (Recomendado)** Business Model
   - **[b]** Procedures Model
   - **[c]** Organization Model
   - **[d]** Blank Model
   - **[x]** Cancel
   *(Nota: Podés seleccionar una opción o una combinación si aplica)*.
3. **Model Naming**: Prompt for `{ModelName}` and generate `{ModelName}_V_1-0-0_{Template}_NN.md`.
4. **Scaffolding**: Create the workspace directory structure (`models/`, `raw/`, `procedures/`, `artifacts/`, `index.md`).
5. **Validation**: Validate the generated model via `innfo-mcp_validate_model` (or fallback).
6. **Visual Checklist**: Output the mandatory Visual Expectation Checklist (§12).

## Greeting Protocol (MANDATORY)

When this skill is activated, the agent MUST print exactly:

```
🔧 You're using skill: nn-innfo (🧠)
```

as its very first output — before any questions, analysis, or tool calls. Session-scoped: only once per conversation. After the greeting, proceed with the capabilities relevant to the current request.

---

## Core Concepts

### Specification Stack (defiNNe / iNNfo V_0-3-0)

| Level | Role | File Pattern | Frontmatter / Structure | Example |
|-------|------|-------------|-------------------------|---------|
| 0 | Meta-specification | `*_NN.md` | `level: 0`, `specification_version: "V_0-2-0"` | `defiNNe_V_0-2-0_NN.md` |
| 1 | Concrete specification (Meta-template) | `*_NN.md` | `level: 1`, `spec_version: "V_0-3-0"`, defines 4 root primitives | `iNNfo_V_0-3-0_NN.md` |
| 2 | Template | `*_NN.md` | `level: 2`, `spec_version: "V_0-3-0"`, lightweight frontmatter, body instantiates root primitives | `business_V_0-3-0_NN.md` |
| 3 | Model | `*_NN.md` | `level: 3`, `spec_version: "V_0-3-0"`, lightweight frontmatter, elements carry data + `source_ref` | `Ghostbusters_V_1-0-0_business_NN.md` |

### Templates vs Specializations (V_0-3-0 Meta-template)

- **Template** (level 2): Declares concepts, fields, markers, and matrices as body elements instantiating the 4 root primitives. Light frontmatter ONLY (`spec_version: "V_0-3-0"`, `level: 2`, `parent_spec`). **PROHIBITED in Level 2 frontmatter**: `concepts: [...]`, `fields: [...]`, `markers: [...]`, `matrices: [...]`.
- **Specialization** (level 2): Self-contained template derived from an official template by instantiating additional root primitives in its Markdown body.

### Naming Convention (defiNNe §6)

| Type | Pattern | Example |
|------|---------|---------|
| Official template | `<Template>_V_x-y-z_NN.md` | `business_V_0-3-0_NN.md` |
| Level 3 model | `<Model>_V_x-y-z_<Template>_NN.md` | `Ghostbusters_V_1-0-0_business_NN.md` |
| Procedure spec | `<Name>_V_x-y-z_procedures_NN.md` | `DocumentIngestion_V_1-0-0_procedures_NN.md` |
| Source | `<Name>_source_NN.md` | `transcript_source_NN.md` |

### Unified NN Syntax (V_0-3-0 Specification)

iNNfo V_0-3-0 uses the **unified NN syntax**. All legacy markers (`# _NN`, `* _NN`, ```yaml blocks) are removed and replaced by:

| Construct | Syntax | Example |
|---|---|---|
| Concept Section (H1) | `# NN <Concept>` | `# NN Stakeholders` |
| Element Heading (H2) | `## NN <Concept>: <Element>` | `## NN Stakeholders: Customer` |
| Property Line | `key:: value` (immediately after element heading) | `importance:: high` |
| Provenance Pointer | `source_ref:: src-NNN (path#lines)` | `source_ref:: src-001 (raw/interview.pdf#L12-L45)` |

---

## 1. MCP Operating Model

The `innfo-mcp` server exposes six tools wrapping `@cognnitive/innfo-core`. It is **publisher-agnostic**: it resolves specs and templates from URLs supplied by the user or from a model's `parent_spec.url`.

| Tool | Purpose | Key arguments |
|------|---------|---------------|
| `list_models` | Scan a directory for iNNfo models | `root?` |
| `read_model` | Parse a model into structured JSON | `id` |
| `get_spec` | Resolve the level-1 iNNfo spec | `url?` **or** `model_id?` |
| `get_template` | Resolve a level-2 template | `url?` **or** `model_id?` (optional `name`) |
| `validate_model` | Validate against the resolved template | `id?` / `content?` (+ optional `template_url`) |
| `apply_change` | Mutate a model and re-validate | `id`, `op`, `args` |

**Golden rule:** The URL always comes from the user or from the model. Never invent or hardcode a spec/template URL when calling the MCP.

---

## 2. Canonical Specification Index (stable URLs)

Use these **stable `latest` URLs** for human reference and authoring guidance:

- **defiNNe** (level 0): `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level0/defiNNe_NN.md`
- **iNNfo** (level 1): `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level1/iNNfo_NN.md`
- **Business** (level 2): `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/business/business_NN.md`
- **Procedures** (level 2): `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/procedures/procedures_NN.md`
- **Organization** (level 2): `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/organization/organization_NN.md`

---

## 3. Frontmatter and Primitives by Level (Strict V_0-3-0 Meta-template)

### Level 1 Specification (iNNfo_V_0-3-0_NN.md)
```yaml
---
specification_version: "V_0-3-0"
specification_url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level1/iNNfo_NN.md"
level: 1
parent_spec:
  name: "defiNNe_V_0-2-0"
  url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/v0.2.0/level0/defiNNe_V_0-2-0_NN.md"
title: "iNNfo Meta-template Specification"
---
```

Defines the 4 root primitives:
1. `# NN Concept Definition`
2. `# NN Field Definition`
3. `# NN Matrix Definition`
4. `# NN Marker Definition`

### Level 2 Template (Metaplantilla V_0-3-0)

**STRICT RULE:** Level 2 templates MUST have lightweight frontmatter. Do **NOT** write `concepts: [...]`, `fields: [...]`, `markers: [...]`, or `matrices: [...]` in the YAML frontmatter.

```yaml
---
specification_version: "V_0-3-0"
specification_url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/business/business_NN.md"
level: 2
parent_spec:
  name: "iNNfo_V_0-3-0"
  url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level1/iNNfo_NN.md"
title: "Business Model Template"
---
```

**Body instantiates root primitives:**

```markdown
> [!NOTE]
> This is an **iNNfo document** — a plain-text Markdown file. Open it with any text editor or view and edit it with [cogNNitive](https://innfo.cognnitive.com/app/innfo-doc).

# NN index
* [[Concept Definition]]
* [[Field Definition]]
* [[Matrix Definition]]

# NN Concept Definition

## NN Concept Definition: Stakeholders
type:: weight
icon:: users
color:: blue
weight:: 80

# NN Field Definition

## NN Field Definition: relationship_model
concept:: Stakeholders
type:: string
description:: Nature of the relationship with stakeholders

# NN Matrix Definition

## NN Matrix Definition: stakeholders-offerings matrix
source:: Stakeholders
target:: Offerings
widget:: set
values:: [High, Medium, Low]
```

### Level 3 Model (Lightweight)

```yaml
---
specification_version: "V_0-3-0"
specification_url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/v0.3.0/level3/sample.md"
level: 3
parent_spec:
  name: "business_V_0-3-0"
  url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/business/business_NN.md"
model_version: "V_1-0-0"
title: "Acme Corp Business Model"
---
```

**Body instantiates elements and properties:**

```markdown
> [!NOTE]
> This is an **iNNfo document** — a plain-text Markdown file. Open it with any text editor or view and edit it with [cogNNitive](https://innfo.cognnitive.com/app/innfo-doc).

# NN index
* [[Stakeholders]]

# NN Stakeholders

## NN Stakeholders: Enterprise Clients
relationship_model:: B2B Long-term
source_ref:: src-001 (raw/market_analysis.pdf#L45-L60)
Enterprise clients interested in scalable cloud solutions.
```

---

## 4. Mandatory Provenance Protocol (Bloque 2)

**No Level 3 model is valid unless its elements include explicit provenance pointers to source documents.**

1. **In Ingestion / Scanning**: Raw documents ingested in `raw/` generate normalized Markdown files with scanner frontmatter (`source_file`, `sha256`, `size_bytes`, `normalized_at`, `source_id: src-NNN`).
2. **In Level 3 Elements**: Every element heading `## NN <Concept>: <Element>` MUST include a `source_ref::` property:
   ```markdown
   ## NN Concept: Element Name
   source_ref:: src-001 (raw/interview_transcript.pdf#L15-L30)
   field_name:: field_value
   ```
3. **Audit**: During model validation, verify that `source_ref` pointers are present. Models without provenance pointers MUST NOT be declared fully compliant.

---

## 5. Operational Instructions & MCP Workflow

### Generate a model

1. Obtain template: `get_template({ url })`.
2. Present concepts with option `[a] (Recomendado)`:
   ```markdown
   Template `{name}` defines these concepts:
     - {ConceptName} ({type}) — {description}

   Do you want to include all of them?
   - **[a] (Recomendado)** Include all
   - **[b]** Select specific concepts
   - **[x]** Cancel
   *(Nota: Podés seleccionar una opción o una combinación)*
   ```
3. Author body using unified syntax `# NN <Concept>`, `## NN <Concept>: <Element>`, `key:: value` and `source_ref:: src-NNN (...)`.
4. Validate with `validate_model({ content })`.
5. Upon completion, output the **Visual Expectation Checklist (§12)**.

---

## 6. Rename Safety & Referential Integrity

Every concept and element name in an iNNfo document is a globally unique identifier.

**If renaming a CONCEPT**: Update Concept Definition in template, concept H1 `# NN <Concept>`, element H2 headings `## NN <Concept>: <Element>`, matrix source/target definitions, matrix section headers `# NN matrices: ...`, index block WikiLinks `[[<Concept>]]`.

**If renaming an ELEMENT**: Update `## NN <Concept>: <Element>` heading, matrix row/column headers, reference fields, and WikiLinks `[[<Element>]]`.

---

## 7. Delegation Contract & Fallback

When MCP is available:
1. Never hand-roll spec resolution; use `get_spec` / `get_template`.
2. Never hand-validate; call `validate_model` and report verbatim.
3. Use `apply_change` for deterministic mutations.

Fallback mode (MCP unavailable):
1. Resolve local relative template paths directly from disk.
2. Validate V_0-3-0 compliance manually (verify `# NN`, `## NN`, `key:: value`, lightweight frontmatter, and `source_ref`).
3. Ensure workspace `index.md` has `# NN index` block.

---

## 8. Field Creation Protocol

When adding fields to a concept:
1. **Analyze**: Determine data type (`string`, `select`, `reference`, `markdown_inline`, `number`, `date`, `file`).
2. **Propose**: Present table with Field Name, Proposed Type, Rationale, and Config. Always mark option `[a]` with `(Recomendado)`.
3. **Confirm**: Wait for user confirmation before executing.
4. **Execute**: Use `apply_change({ id, op: "add_field", args })` or write `## NN Field Definition` primitive.
5. **Validate**: Run `validate_model()`.

---

## 9. Specialization Strategy

When a model needs custom concepts or fields beyond base template:
1. **NEVER modify** published specs in `specs/`.
2. Create a specialization template file `<Model>_<Template>_V_x-y-z_spec_NN.md`.
3. Set `level: 2`, `parent_spec` to base template.
4. Instantiate custom concept/field definitions in the body.
5. Point model's `parent_spec.url` to the specialization file.

---

## 10. Post-Edit Validation & Versioning

After any model/spec edit:
1. Run `validate_model()`.
2. Present validation result (`valid: true/false`).
3. Prompt for version bump:
   - **[a] (Recomendado)** Increment patch (`V_x-y-z+1`)
   - **[b]** Keep current version (`V_x-y-z`)
   - **[c]** Increment minor (`V_x-y+1-0`)
   - **[x]** Cancel
4. Update `index.md` links and physical filename if version bumped.
5. Print Visual Expectation Checklist (§12).

---

## 11. Architecture Scaling Decision Protocol (1 to N Models) (Bloque 4)

When a project grows from 1 single model to multiple models (1 to N elements/subsystems), **the agent MUST NOT decide the file/workspace structure unilaterally**.

The agent MUST present the **4 Structural Alternatives** indicating exact disk paths and iNNfo code:

```markdown
💡 Architecture Scaling Decision (1 to N Models):

How should we organize the multi-model architecture for this project?

  [a] (Recomendado) Opción 4: Híbrido Maestro Agregador con referencias `file_ref::`
      - Disk path: `models/Master_V_1-0-0_NN.md` and `models/subsystems/`
      - iNNfo code: Main model references submodels via `file_ref:: ./subsystems/auth_V_1-0-0_NN.md`

  [b] Opción 1: Modelo Monolítico Único
      - Disk path: `models/System_V_1-0-0_NN.md`
      - iNNfo code: Single single-file document containing all concepts and elements.

  [c] Opción 2: Modelos Independientes en la misma carpeta
      - Disk path: `models/DomainA_V_1-0-0_NN.md`, `models/DomainB_V_1-0-0_NN.md`
      - iNNfo code: Independent Level 3 models, each listed under `index.md`.

  [d] Opción 3: Híbrido Multi-Carpeta por Proyecto
      - Disk path: `projects/domainA/models/index.md`, `projects/domainB/models/index.md`
      - iNNfo code: Sub-workspaces each with their own `index.md` root.

  [x] Cancel

*(Nota: Podés seleccionar una opción o una combinación si aplica)*
```

---

## 12. Visual Expectation Checklist Protocol (App Verification) (Bloque 5)

At the conclusion of creating or modifying any iNNfo model or artifact, **the agent MUST print the Visual Expectation Checklist** before closing the interaction.

This checklist provides the user with an exact verification guide for the iNNfo Modeler web application (`https://innfo.cognnitive.com/app/`):

```markdown
📋 Checklist de Expectativa Visual en iNNfo Modeler (https://innfo.cognnitive.com/app/):

Al abrir la carpeta del proyecto en el Modeler, vas a visualizar:

- [ ] 🌳 **Árbol Lateral de Navegación**:
      Estructura jerárquica basada en `# NN index` con navegación fluida por conceptos y elementos.
- [ ] 📋 **Paneles de Campos por Concepto**:
      Vista detallada renderizada para cada `key:: value` (propiedades, tipos y `source_ref`).
- [ ] 🎴 **Tarjetas de Elementos**:
      Tarjetas interactivas por cada bloque `## NN <Concept>: <Element>` mostrando metadatos y descripciones.
- [ ] 📊 **Tablas de Matrices Comparativas**:
      Tablas N-a-M de relaciones e `item-markers matrix` renderizadas con celdas interactivas (`X` / `-`).
```

---

## Core Rules

1. **Strict V_0-3-0 Meta-template**: Level 2 templates define concepts/fields/matrices in body primitives (`# NN Concept Definition`). NEVER put `concepts: [...]` or `fields: [...]` in Level 2 YAML frontmatter.
2. **Unified NN Syntax Only**: Use `# NN <Concept>`, `## NN <Concept>: <Element>`, `key:: value`. No legacy `_NN` bullets or fenced ```yaml blocks.
3. **Mandatory Provenance**: Every Level 3 element MUST include `source_ref:: src-NNN (path#lines)`.
4. **Zero Unilateral Mutation**: Never move or rename user files without explicit confirmation.
5. **Recommended Option First**: Prefix option `[a]` with `(Recomendado)`.
6. **Multi-Selection Notice**: Add *"Podés seleccionar una opción o una combinación"* when applicable.
7. **Scaling Architecture Choice**: Present the 4 structural options when scaling from 1 to N models (§11).
8. **Visual Expectation Checklist**: Always print the visual checklist before closing (§12).
