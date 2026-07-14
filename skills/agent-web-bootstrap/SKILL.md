---
name: agent-web-bootstrap
description: >
  Bootstrap the iNNv0 ecosystem from a manifest URL. Trigger when the user
  says "usar eNNvironment", "bootstrap", or provides a URL referencing an
  agent-bootstrap manifest (e.g., "Quiero usar eNNvironment <URL>").
  Installs declared skills from GitHub, downloads and registers MCP bundles,
  validates frontmatter with skill-origin-guard, and presents available
  workflows. Only needs to run once per environment.
version: "1.0"
last_updated: 2026-07-15
license: MIT
compatibility: opencode, claude-code, cursor, any agent supporting skills
metadata:
  source_type: original
---

# Agent Web Bootstrap

Bootstrap the iNNv0 ecosystem from a manifest URL. One-shot: installs skills, downloads MCP bundles, registers servers, and presents a workflow menu.

## Trigger

When the user says something like:
- "Quiero usar eNNvironment https://innv0.github.io/eNNvironment"
- "Usa eNNvironment <URL>"
- "/bootstrap <URL>"

The URL must point to a page with YAML frontmatter containing `agent-bootstrap:` as the root key.

## Flow

### Step 1: Fetch and parse the manifest

1. Use `webfetch` to retrieve the URL.
2. Extract the YAML frontmatter block between `---` delimiters.
3. Parse the `agent-bootstrap:` key:
   - `skills[]`: array of `{name, repo, path, description?, mcp[]?}`
   - `workflows[]`: array of `{id, label, description, skill}`

If YAML is malformed → error: "Failed to parse manifest: {detail} at line N"
If URL is unreachable → error: "Could not reach {URL}: HTTP {code}"
If no `skills[]` or `workflows[]` → error: "Manifest has no skills or workflows declared"

### Step 2: Provision skills

For each skill in `skills[]`:

```
1. Check if ~/.agents/skills/{name}/SKILL.md exists → skip, report "Already installed: {name}"
2. Clone {repo} to a temp directory (git clone --depth 1)
3. Copy {path} to ~/.agents/skills/{name}/
4. If skill-origin-guard is available, validate frontmatter
   - If validation fails → warn but continue
   - If skill-origin-guard not found → warn "frontmatter validation skipped" and continue
5. Update skill registry (~/.agents/skills is auto-discovered by most agents)
```

### Step 3: Provision MCP bundles

For each skill that declares `mcp[]`:

```
1. For each mcp entry: {name, url}
2. Create ~/.agents/mcp/ if it doesn't exist
3. Check if ~/.agents/mcp/{name}.bundle.js exists → skip, report "MCP already present: {name}"
4. Download {url} to ~/.agents/mcp/{name}.bundle.js
5. If download fails (HTTP error, timeout) → warn and mark skill as "MCP unavailable"
6. Register the MCP server in the current workspace's .opencode/opencode.json:
   {
     "mcp": {
       "{name}": {
         "type": "local",
         "command": ["node", "<absolute-path-to-bundle>"],
         "enabled": true
       }
     }
   }
```

The MCP path must be absolute (resolved from `~/.agents/mcp/{name}.bundle.js`) so it works from any workspace directory.

### Step 4: Present workflow menu

Render a numbered menu from `workflows[]`:

```markdown
[a] {workflow.label} — {workflow.description}
[b] ...  
[x] Salir
```

On selection:
- Route to the corresponding `{workflow.skill}` by invoking the skill
- For "cognnitive": load `innv0-innfo` skill and guide through model creation
- For "transform": load `innv0-trannsform` skill
- Invalid input → reprompt: "Invalid selection. Enter a valid option or 'x' to exit"
- If `workflows[]` is empty → "No workflows available. Skills installed — use /{name} to invoke each."

## Post-install summary

After all steps, report:

```
✅ Skills instalados:
  • {name} — {status}
  • {name} — {status}

✅ MCP bundles:
  • {name} — {status}

📋 Workflows disponibles:
  • {label}
  • {label}
```

## Edge cases

- **Repeated run**: skills already installed are skipped (idempotent). MCP bundles already present are skipped. Only new or missing items are processed.
- **Partial failure**: if one skill fails to clone, continue with the rest. Report failures at the end.
- **No MCP dir**: create `~/.agents/mcp/` on first MCP provision.
- **No git**: if `git` is unavailable, error "git is required to clone skill repositories".
- **GitHub rate limit**: if clone fails with rate limit, suggest waiting or using a token.

## Example conversation

```
User: Quiero usar eNNvironment https://innv0.github.io/eNNvironment
Agent: 🔧 Agent Web Bootstrap Skill activado.
       Leí la página de eNNvironment.
       Skills a instalar: innv0-innfo, innv0-trannsform, innv0-workflow-orchestrator
       MCP a descargar: innfo-mcp (~1.2MB)
       ¿Damos aprobación?
User: Sí
Agent: ✅ Todo instalado. Workflows disponibles: CogNNitive, traNNsform
```
