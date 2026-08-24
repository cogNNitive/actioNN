# Document Citations Specification

## Purpose

Path-based, heading-anchored citation syntax for drafts and Level 3 models, and citation format selection for final documents. Applies whenever source documents (normalized under `sources/nn/`) contain attributed facts. There is no `src-NNN`/`source_id` sequential-ID system anywhere in this pipeline — citations always resolve directly to a `sources/nn/<path>.md#<heading-slug>` anchor.

## Requirements

### Requirement: Source Reference Syntax (`sources::`)

Every element in a Level 3 model MUST include explicit provenance via a `sources::` field pointing directly at one or more files in `sources/nn/`, anchored to a heading-slug. A single value MAY be written without brackets; multiple values MUST use iNNfo's generic list syntax.

#### Scenarios

- GIVEN an element cites one source
- WHEN writing its `sources::` field
- THEN it MUST read `sources:: sources/nn/interview_transcript.md#key-clients`

- GIVEN an element cites two sources
- WHEN writing its `sources::` field
- THEN it MUST read `sources:: [sources/nn/a.md#introduction, sources/nn/b.md#methodology]`

- GIVEN any citation anywhere in the pipeline
- THEN it MUST NOT use a `src-NNN` or other sequential `source_id`

### Requirement: Heading-Slug Anchor Derivation

Every `sources/nn/<path>.md#<heading-slug>` anchor MUST use the GitHub-compatible slug computed from the target heading's text by the pipeline's shared slugging algorithm: strip leading `#` markers and markdown emphasis characters (`*`, `_`, `` ` ``), trim and lowercase, collapse whitespace runs to a single `-`, remove any character outside `[a-z0-9-]`, collapse repeated `-`, and trim leading/trailing `-`. Duplicate slugs within the same document MUST be disambiguated top-to-bottom by appending `-1`, `-2`, etc. to later occurrences, matching GitHub's own disambiguation. Every normalized file is guaranteed to have at least one heading — a synthetic top-level heading is auto-inserted during normalization when the source has none — so an anchor without a `#` fragment (a bare path) is always invalid; there is no line-number fallback.

#### Scenarios

- GIVEN a heading `## Market Overview!!`
- WHEN its slug is computed
- THEN it MUST equal `market-overview`

- GIVEN a document with two headings that both slugify to `overview`
- WHEN slugs are assigned top-to-bottom
- THEN the first occurrence MUST keep `overview` and the second MUST become `overview-1`

- GIVEN a citation with no `#` fragment (e.g. `sources/nn/report.md`)
- THEN it MUST be treated as invalid — a heading-slug anchor is mandatory

### Requirement: Citation Anchor Validation

A `sources/nn/<path>.md#<heading-slug>` citation anchor MUST be validated by resolving `<path>` relative to the project root, confirming the target file exists, computing all of that file's heading slugs with the same slugging algorithm used at normalization time, and confirming the cited slug is among them.

#### Scenarios

- GIVEN a citation anchor whose `<path>` does not exist under the project
- THEN validation MUST fail with a reason identifying the missing file

- GIVEN a citation anchor whose file exists but whose `#slug` matches no heading in that file
- THEN validation MUST fail and MUST list the file's available slugs in the failure reason

- GIVEN a citation anchor whose file exists and whose `#slug` matches one of its headings
- THEN validation MUST succeed

### Requirement: Claim-Level Citation Comment in Drafts

Draft deliverables (`_draft.md`) MUST pair every cited claim with a machine-readable HTML comment and human-readable visible text.

- HTML comment: `<!-- cite: sources/nn/<path>.md#<heading-slug> -->` — the slug already names the section, so no separate free-text section label is carried inside the comment.
- Visible text: `— Source: <filename>, section <section-name>`

#### Scenarios

- GIVEN the agent cites a fact from `sources/nn/if-narrative-gv22bo-1.md`, heading "IOE.1"
- WHEN writing the draft
- THEN output MUST contain `<!-- cite: sources/nn/if-narrative-gv22bo-1.md#ioe1 -->` followed by `— Source: IF Narrative GV22BO-1, section IOE.1`

- GIVEN a draft document
- THEN its header MUST read `# DRAFT FOR REVIEW — NOT FINAL VERSION`

### Requirement: Draft vs Final Citation Treatment

The system MUST apply different citation treatment depending on whether the agent is producing a draft or a final version, per the choice presented in the transform flow (`[a] Final version` / `[b] Draft for review` / `[x] Cancel`).

#### Scenarios

- GIVEN the agent is generating a draft
- THEN every cited claim SHALL include both the `<!-- cite: ... -->` HTML comment and the visible `— Source: ...` text

- GIVEN the agent is generating a final version
- THEN the `<!-- cite: ... -->` HTML comments SHALL be removed and the visible citations SHALL be reformatted per the citation format selected (see Citation Format Selection)

### Requirement: Citation Format Selection

When producing a final version, the system MUST support converting each `<!-- cite: sources/nn/<path>.md#<heading-slug> -->` + `— Source: ...` pair into one of the following citation formats, per format-specific rules loaded from the skill's `citations.md`:

| Format | Behavior |
|---|---|
| Sencillo | Keep the visible `— Source: <filename>, section <section-name>` text verbatim; only remove the HTML comment |
| APA 7th Edition | In-text `(Author, Year[, section name])`, organization name as author for organizational sources, filename stem as author fallback, end-of-sentence citations before the period, trailing "References" list |
| MLA 9th Edition | Parenthetical `(Author Page)` or `(Author, par. X)`, filename stem as author fallback, trailing "Works Cited" list |
| Chicago | Notes-bibliography (superscript + footnote) for narrative documents, or author-date `(Author Year, Page)` for citation-dense documents, trailing "Bibliography"/"References" |
| IEEE | Sequential bracketed numbers `[N]` reused per unique source, trailing "References" list |
| Vancouver | Sequential numeric citations (superscript or bracketed) reused per unique source, trailing "References" list |
| BibTeX | No inline HTML comments or visible citations in the document body; one `.bib` entry per unique `sources/nn/` path, saved as `[template-name]_V_x-y-z.bib` alongside the final document |

For every format except BibTeX, the HTML comment and the original `— Source:` visible text MUST be removed from the final document once the citation is converted.

#### Scenarios

- GIVEN the user selects Sencillo
- THEN the HTML comment is removed and the visible text is kept verbatim, unchanged

- GIVEN the user selects APA and cites `sources/nn/if-narrative-gv22bo-1.md#ioe1` with visible text `— Source: IF Narrative GV22BO-1, section IOE.1`
- THEN the final text renders as an in-text `(Author, Year, section name)` citation (e.g. `(IF Narrative, 2024, section IOE.1)`) and a "References" section is appended

- GIVEN the user selects BibTeX
- THEN the final document body carries no HTML comments and no `— Source:` text, and a `.bib` file is generated with one entry per unique `sources/nn/` source path, keyed by the slugified source path (e.g. `sources/nn/if-narrative-gv22bo-1.md` → `sources-nn-if-narrative-gv22bo-1-md`)

- GIVEN the same source is cited multiple times under IEEE or Vancouver
- THEN the same reference number MUST be reused for every citation of that source

### Requirement: Procedure Lineage Auto-Capture

Every scriptable, reproducible pipeline operation that produces or consumes a citable source or artifact (`--import-url`, `--scan`, template-apply) MUST auto-record a `# NN Procedures` entry in the project's cogNNitive provenance model, DataLad-style: the exact command/flags invoked, a timestamp, and the operation's Source/Artifact inputs and outputs. Re-running the same command MUST NOT duplicate the entry. This auto-capture is distinct from the user-authored orchestration specs saved under `procedures/`; manual `## NN Procedures:` entries remain reserved for non-scripted research/analysis steps the agent performs itself, and are preserved across refreshes.

#### Scenarios

- GIVEN the same `--scan` command with the same arguments is run twice
- WHEN the provenance model is refreshed the second time
- THEN no duplicate `# NN Procedures` entry is created for that command

- GIVEN the agent performs a non-scripted analysis step not covered by `--import-url`, `--scan`, or template-apply
- THEN it MAY add a manual `## NN Procedures:` entry, which MUST be preserved across subsequent refreshes
