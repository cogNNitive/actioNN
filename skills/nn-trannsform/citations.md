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
- Draft: `<!-- cite: sources/markdown/if-narrative-gv22bo-1.md#L12-L18, section IOE.1 --> — Source: IF Narrative GV22BO-1, section IOE.1`
- APA: `The organization had 45 active members in 2023 (IF Narrative, 2024, section IOE.1).`

Generate a reference list at the end titled "References" with full entries per source.
