<!-- gentle-ai:innv0-skills-manager -->
## innv0-skills-manager — Mandatory Load

At the **start of every session** (first user message), you MUST:

1. Load the skill `innv0-skills-manager` by calling `skill(name: "innv0-skills-manager")`.
2. Follow its `Activation Contract` and `Instructions` to scan skills, present the table, and interact with the user.

This runs before any other skill processing. Do not skip this.
<!-- /gentle-ai:innv0-skills-manager -->
