# Citation Formats — Format-Specific Rules

Load this file when the user selects a citation format in step 3c-i.

## Format: Sencillo — Verbatim Source Attribution

Keep the visible text verbatim as written in the draft. No transformation beyond removing the HTML comment.

```markdown
— Source: <filename>, section <section-name>
```

No parentheses, no author guessing, no numbering. Each citation stands alone.

## Format: APA 7th Edition — In-Text Citations

Convert each HTML comment + visible text pair to APA 7th edition in-text citation style.

Rules:
- Use (Author, Year) format in the sentence or at the end.
- For organizational sources (reports, evaluations), use the organization name as author: (Organization, Year).
- Include section when available: (Author, Year, section name).
- Guess the author from the filename context. If uncertain, use the filename stem.
- End-of-sentence citations go before the period.
- Remove the HTML comment and original `— Source:` visible text.

Example:
- Draft: `<!-- cite: src-001, section IOE.1 --> — Source: IF Narrative GV22BO-1, section IOE.1`
- APA: `The organization had 45 active members in 2023 (IF Narrative, 2024, section IOE.1).`

Generate a reference list at the end titled "References" with full entries per source.

## Format: MLA 9th Edition — Parenthetical Citations

Convert each citation to MLA 9th edition parenthetical style.

Rules:
- Use (Author Page) for print sources.
- For web/reports with no page numbers, use (Author, par. X) if section is available.
- Omit page number entirely if not available.
- Use the filename stem as author if the actual author is not identifiable.
- Remove the HTML comment and original `— Source:` visible text.
- End-of-sentence citations go before the period.

Generate a "Works Cited" list at the end with full entries.

## Format: Chicago — Notes-Bibliography or Author-Date

Choose the appropriate Chicago style based on context:
- For narrative documents with few citations: notes-bibliography (superscript number + footnote).
- For citation-dense documents: author-date (Author Year, Page).

Notes-bibliography rules:
- Insert a superscript number at the citation point.
- Add a footnote with: Author, "Title," Source, Date.
- Generate a "Bibliography" section at the end.

Author-date rules:
- Use (Author Year, Page) in text.
- Generate a "References" section at the end.

Remove the HTML comment and original `— Source:` visible text.

## Format: IEEE — Numbered References

Convert citations to IEEE numbered reference style.

Rules:
- Assign a sequential bracketed number [1], [2], etc. to each unique source.
- Insert `[N]` at the citation point in text.
- Append a "References" section at the end with:

  [N] A. Author, "Title," Source, Date.

- Reuse the same number when citing the same source.
- Remove the HTML comment and original `— Source:` visible text.

## Format: Vancouver — Numeric Citation Style

Convert citations to Vancouver numeric style.

Rules:
- Assign sequential numbers to each unique source.
- Use superscript or bracketed (1) numbers in text (agent chooses based on context).
- Append a "References" section at the end with:

  Author AB. Title. Source. Date;Vol:Pages.

- Reuse the same number for repeated citations of the same source.
- Remove the HTML comment and original `— Source:` visible text.

## Format: BibTeX — Export `.bib` File

Create a `.bib` file alongside the final document, with one entry per unique `src-NNN`.

Use this template for each entry. Fill placeholder fields from the source filename and frontmatter:

```bibtex
@techreport{src-NNN,
  author       = {Organization or Author Name},
  title        = {Full Source Title},
  year         = {YYYY},
  type         = {Report},
  howpublished = {\url{relative/path/to/source}}
}
```

Rules:
- One entry per unique `src-NNN` — reuse IDs, do not duplicate.
- Adapt entry type for non-report sources:
  - Interviews: `@misc{src-NNN, author={...}, title={...}, year={...}, howpublished={\url{...}}}`
  - Web pages: `@misc{src-NNN, author={...}, title={...}, year={...}, howpublished={\url{...}}}`
  - Articles: `@article{src-NNN, author={...}, title={...}, journal={...}, year={...}}`
- The citation key MUST match the `src-NNN` value (e.g., `src-001`).
- Save the output file as `[template-name]_V_x-y-z.bib` in the same `output/[template-name]/` folder.
- Do NOT include HTML comments or visible citations in the main document body — produce a clean document with parenthetical numbers pointing to the `.bib` entries.

Example entry for a report source:

```bibtex
@techreport{src-001,
  author       = {IF Narrative GV22BO-1},
  title        = {IF Narrative GV22BO-1},
  year         = {2024},
  type         = {Report},
  howpublished = {\url{raw/if-narrative-gv22bo-1.md}}
}
```
