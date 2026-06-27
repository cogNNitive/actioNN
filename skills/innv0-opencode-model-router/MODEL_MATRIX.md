# Model Matrix — iNNv0 Model Router

> Last updated: 2026-06-27 | Skill version: 1.0.0
>
> When new models become available, run the model router update flow to refresh this matrix.

## Model Comparison

| Model | ID | Cost /M tok | Context | Best for | Avoid for |
|---|---|---|---|---|---|
| DeepSeek V4 Flash | `deepseek-v4-flash` | ~ $0.09 | Standard | Trivial tasks, one-liners, syntax, grep/search, quick questions, terminal commands | Multi-step logic, large refactors, full-repo work |
| MiMo 2.5 | `mimo-2.5` | ~ $0.20 | Standard | Features, multi-step logic, components, single-file refactors, debugging | Massive cross-cutting changes, full-repo audits |
| MiniMax M3 | `minimax-m3` | ~ $0.28 | 1M tokens | Full-repo refactors, architecture migration, dependency updates, multimodal UI debugging | Quick one-line changes (overpaying) |

## Decision Flow

```
User request
    │
    ▼
Classify scale ──────────────────────────────────┐
    │                                              │
    ├─ Trivial (button color, typo, syntax) ──────┤── Flash
    ├─ Bug Fix (debug, patch single file) ────────┤── Flash or MiMo
    ├─ Feature (new component, API endpoint) ─────┤── MiMo
    └─ Refactor (cross-cutting, full migration) ──┘── MiniMax M3
    │
    ▼
Compare against active model
    │
    ├── Match     → Confirm and proceed
    └── Mismatch  → Alert with suggestion
```

## When to Update This Matrix

- A new model tier becomes available in OpenCode
- Pricing changes significantly
- A model's capability improves (e.g., larger context window)
- You start using a different model stack

To update: tell the agent *"Update the model router's model table"*. The agent will search the web for current pricing, compare, and propose changes with sources for your approval.
