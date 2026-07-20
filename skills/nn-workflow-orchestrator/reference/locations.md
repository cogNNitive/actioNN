# Location Selection

## Default

Canonical workspace: `Documents\_NN\` in the user's home directory. Always offer this.

## Options UI

```
[1] Indicar una ubicación nueva
[2] D:\Users\lucas\Documents\_NN          ← default
[3] <most-recent-1>
[4] <most-recent-2>
... (up to 10)
```

## Persistence

Store in `~/.config/opencode/skills/nn-workflow-orchestrator/recent-locations.json`:

```json
{
  "recent_locations": ["D:\\Users\\lucas\\Documents\\_NN"]
}
```

- Read at start, update after each execution
- Deduplicated, most recent first, max 10
- Also persist `recent-workflows.json` with same pattern: `name`, `path`, `last_used`
