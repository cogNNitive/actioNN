# Stage Types

| Type | Description | Behavior |
|------|-------------|----------|
| `Skill` | Execute a skill | Loads SKILL.md, runs its workflow, passes output |
| `Gate` | Deterministic check | Calls pipeline-gate CLI; fail-stop on failure |

## Gate: validate

```bash
node scripts/pipeline-gate.mjs validate <input-file> [--skip-mcp]
```

Fails on: wrong naming, missing frontmatter/notice, MCP validation errors.

## Gate: integrate

```bash
node scripts/pipeline-gate.mjs integrate <input-file> [--target-dir <path>] [--dry-run]
```

Increments patch version, moves file, updates index.md.

## Gate stage in workflow

```yaml
# _NN Stage: validate-output
#   type: "gate"
#   gate: "validate"
#   input: "output/business/"
#   output: null
```
