# Document Citations Specification

## Purpose

Structured citation syntax for drafts and citation format selection for final documents. Applies whenever source documents contain attributed facts.

## Requirements

### Requirement: Structured Citation Syntax

Every cited claim in a draft MUST include an HTML comment AND visible attribution.

- HTML comment: `<!-- cite: src-NNN, section <section-name> -->`
- Visible text: `— Source: <filename>, section <section-name>`

#### Scenarios

- GIVEN the agent cites a fact from "IF Narrative GV22BO-1", section IOE.1
- WHEN writing the draft
- THEN output MUST contain `<!-- cite: src-001, section IOE.1 -->` followed by `— Source: IF Narrative GV22BO-1, section IOE.1`

- GIVEN the fact comes from "Transcripts T11", interview Etelvina
- THEN citation MUST read `<!-- cite: src-002, section interview Etelvina -->` and `— Source: Transcripts T11, interview Etelvina`

### Requirement: Source Pointer Resolution

`src-NNN` MUST map to a relative file path from workspace root. Sequential IDs SHALL be assigned per unique source and reused across sections.

#### Scenarios

- GIVEN one source cited in multiple draft sections
- WHEN each citation is written
- THEN all citations from that source MUST use the same `src-NNN`

- GIVEN a source at `raw/if-narrative-gv22bo-1.md` cited as `src-001`
- THEN `src-001` SHALL resolve to `raw/if-narrative-gv22bo-1.md`

### Requirement: Final Document Citation Decision

When the user requests a final version from a draft, the system MUST present 3 options.

| Code | Option | Behavior |
|------|--------|----------|
| [a] | Include sources inline (Recommended) | Proceed to format selection |
| [b] | Review draft first | Show draft; after edits offer format selection |
| [c] | No sources | Strip ALL citations; skip format selection |
| [x] | Cancel | Abort final document generation |

#### Scenarios

- GIVEN user selects [a] → THEN proceed to format selection
- GIVEN user selects [b] → THEN show draft for editing, THEN offer format selection
- GIVEN user selects [c] → THEN strip `<!-- cite: ... -->` AND `— Source: ...` from output; no `.bib` generated

### Requirement: Citation Format Selection

After [a] or [b], the system MUST present 7 choices.

| Code | Format | Notes |
|------|--------|-------|
| [a] | Sencillo (Recommended) | Keeps `— Source: filename, section` verbatim |
| [b] | APA | 7th edition in-text |
| [c] | MLA | 9th edition parenthetical |
| [d] | Chicago | Notes-bibliography or author-date |
| [e] | IEEE | Numbered references |
| [f] | Vancouver | Numeric citation style |
| [g] | BibTeX | Exports `.bib` with one `@` entry per `src-NNN` |
| [x] | Back | Return to previous question |

#### Scenarios

- GIVEN user selects [a] Sencillo → THEN citations render as `— Source: <filename>, section <section-name>`
- GIVEN user selects [b] APA → THEN citations follow APA 7th style adapted per source type (report, interview, webpage) by agent LLM
- GIVEN user selects [g] BibTeX → THEN a `.bib` file SHALL be created alongside the final document

### Requirement: Draft vs Final Behavior

The system MUST apply different citation treatment per mode.

- GIVEN generating a draft → THEN every citation SHALL include HTML comment AND visible text
- GIVEN generating final with [a] or [b] → THEN HTML comments SHALL be removed; visible text formatted per chosen style
- GIVEN generating final with [c] → THEN BOTH HTML comments AND visible citation text SHALL be absent
