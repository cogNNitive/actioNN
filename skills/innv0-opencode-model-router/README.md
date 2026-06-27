# iNNv0 OpenCode Model Router

A self-contained skill that evaluates the scale of your request at session start and confirms whether the active model is cost-effective for the job. If not, it suggests a better tier.

## What it does

At the first message of every session, the agent classifies your request into one of four tiers (Trivial, Bug Fix, Feature, Refactor) and compares the active model against the recommended model for that tier. You get a confirmation or a suggestion to switch — once per session, no noise.

## Installation

Copy this folder to your agent's skills directory:

```bash
# OpenCode, Claude, Gemini, Cursor, or any agent that scans ~/.agents/skills/
cp -r innv0-opencode-model-router ~/.agents/skills/

# Or for OpenCode specifically:
cp -r innv0-opencode-model-router ~/.config/opencode/skills/
```

The skill is auto-discovered by its name and triggers. No further setup is needed for basic use.

## Optional: load at every session start

By default, the agent loads this skill when it detects a matching task (coding, development, fix, build, etc.). If you want it to **always** run at the start of every session regardless of the task, give your agent this prompt:

> Install the `innv0-opencode-model-router` skill and add the following instruction to my agent configuration (AGENTS.md, CLAUDE.md, or equivalent):
>
> ```
> At the start of every session (first user message), load the innv0-opencode-model-router skill and follow its Rules of Engagement. This check runs once per session. Do not re-evaluate unless I ask.
> ```
>
> **Implications:** The agent will briefly evaluate the task tier and announce the model status at the start of every conversation. For most sessions this adds a single-line confirmation ("You're on model X, that's the right tier"). It only suggests switching when the model is clearly mismatched for the request scale. If you prefer zero overhead, skip this — the skill still activates on its triggers when relevant.

## Model table updates

Models change over time. To refresh the model list with current pricing and availability, tell your agent:

> *"Update the model router's model table — search OpenCode and OpenRouter for current model info."*

The agent will search the web, compare against the current table, show sources, and propose changes with a disclaimer. Review and approve before applying.

## Files

| File | Purpose |
|---|---|
| `SKILL.md` | Skill instructions (the agent reads this) |
| `MODEL_MATRIX.md` | Human-readable model comparison matrix |
| `README.md` | You are here |
