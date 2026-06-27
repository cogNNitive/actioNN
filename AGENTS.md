<!-- gentle-ai:innv0-skills-manager -->
## innv0-skills-manager — Mandatory Load

At the **start of every session** (first user message), you MUST:

1. Load the skill `innv0-skills-manager` by calling `skill(name: "innv0-skills-manager")`.
2. Follow its `Activation Contract` and `Instructions` to scan skills, present the table, and interact with the user.

This runs before any other skill processing. Do not skip this.
<!-- /gentle-ai:innv0-skills-manager -->

<!-- gentle-ai:lang-enforce -->
## Language: English Only

All content in this repository — user-facing text, documentation, code comments, commit messages, PR descriptions, issues, interaction text in SKILL.md files, and any other written content — MUST be in **English**.

Exceptions:
- Code identifiers, variable names, and string literals in source code follow the project's existing conventions.
- The `html lang` attribute may remain unchanged.
- Frontmatter in SKILL.md files determines the agent's interaction language; the skill content itself must be in English.

This rule applies to all files in all directories, including `skills/`, `docs/`, and any future additions.
<!-- /gentle-ai:lang-enforce -->
