---
name: agent-web-bootstrap
description: >
  Bootstrap the cogNNitive ecosystem from a manifest URL. Trigger when the user
  says "usar eNNvironment", "bootstrap", or provides a URL referencing an
  agent-bootstrap manifest (e.g., "Quiero usar eNNvironment <URL>").
  Installs declared skills from GitHub, downloads and registers MCP bundles,
  validates frontmatter with skill-origin-guard, and presents available
  workflows. Only needs to run once per environment.
version: "1.1"
last_updated: 2026-07-21
license: MIT
compatibility: opencode, claude-code, cursor, any agent supporting skills
metadata:
  source_type: original
---

# Agent Web Bootstrap

Bootstrap the cogNNitive ecosystem from a manifest URL. One-shot: installs skills, downloads MCP bundles, registers servers, and presents a workflow menu.

## Trigger

When the user says something like:
- "I want to use https://cognnitive.com"
- "Quiero usar eNNvironment https://cogNNitive.github.io/eNNvironment"
- "Usa eNNvironment <URL>"
- "/bootstrap <URL>"
- Any message containing "bootstrap" + a URL

The URL should point to a page containing an `agent-bootstrap:` manifest (either as YAML frontmatter or discoverable via fallbacks).

## Flow

### Step 1: Fetch and parse the manifest

1. Use `webfetch` to retrieve the URL (markdown format).
2. Extract the YAML frontmatter block between `---` delimiters.
3. Parse the `agent-bootstrap:` key:
   - `skills[]`: array of `{name, repo, path, description?, mcp[]?}`
   - `workflows[]`: array of `{id, label, description, skill}`

If YAML is malformed: error "Failed to parse manifest: {detail} at line N"
If URL is unreachable: error "Could not reach {URL}: HTTP {code}"

#### Step 1b: Fallback — no frontmatter found

If the fetched content has NO YAML frontmatter with `agent-bootstrap:` (common when the URL is an HTML page), try these fallbacks **in order** until one succeeds:

1. **Markdown twin**: Re-fetch in HTML format (`webfetch(url, format="html")`). Search for `<link rel="alternate" type="text/markdown" href="...">`. If found, fetch the referenced URL and re-parse.

2. **README at root**: Try fetching `{origin}/README.md` (strip any path/filename from the URL). If it resolves and has valid `agent-bootstrap:` frontmatter, use it.

3. **GitHub raw README**: If the page links to a GitHub repo (nav, footer, or `<meta name="generator">`), extract `org/repo` and try `https://raw.githubusercontent.com/{org}/{repo}/main/README.md`. If valid, use it.

4. **llms.txt hints**: Fetch `{origin}/llms.txt`. If it contains "Manifest file:" followed by a path, fetch that path and re-parse.

If ALL fallbacks fail: error "Could not find a bootstrap manifest at {URL} or any alternates. The page must expose agent-bootstrap YAML frontmatter."

If frontmatter found but has no `skills[]` or `workflows[]`: error "Manifest has no skills or workflows declared"

### Step 2: Provision skills

For each skill in `skills[]`:

```
1. Check if ~/.agents/skills/{name}/SKILL.md exists: skip, report "Already installed: {name}"
2. Clone {repo} to a temp directory (git clone --depth 1)
3. Copy {path} to ~/.agents/skills/{name}/
4. If skill-origin-guard is available, validate frontmatter
   - If validation fails: warn but continue
   - If skill-origin-guard not found: warn "frontmatter validation skipped" and continue
5. Update skill registry (~/.agents/skills is auto-discovered by most agents)
```

### Step 3: Provision MCP bundles

For each skill that declares `mcp[]`:

```
1. For each mcp entry: {name, url}
2. Create ~/.agents/mcp/ if it doesn't exist
3. Check if ~/.agents/mcp/{name}.bundle.js exists: skip, report "MCP already present: {name}"
4. Download {url} to ~/.agents/mcp/{name}.bundle.js
5. If download fails (HTTP error, timeout): warn and mark skill as "MCP unavailable"
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
- For "cognnitive": load `nn-innfo` skill and guide through model creation
- For "transform": load `nn-trannsform` skill
- Invalid input: reprompt "Invalid selection. Enter a valid option or 'x' to exit"
- If `workflows[]` is empty: "No workflows available. Skills installed — use /{name} to invoke each."

## Post-install summary

After all steps, report:

```
Skills installed:
  - {name} — {status}
  - {name} — {status}

MCP bundles:
  - {name} — {status}

Workflows disponibles:
  - {label}
  - {label}
```

## Edge cases

- **Repeated run**: skills already installed are skipped (idempotent). MCP bundles already present are skipped. Only new or missing items are processed.
- **Partial failure**: if one skill fails to clone, continue with the rest. Report failures at the end.
- **No MCP dir**: create `~/.agents/mcp/` on first MCP provision.
- **No git**: if `git` is unavailable, error "git is required to clone skill repositories".
- **GitHub rate limit**: if clone fails with rate limit, suggest waiting or using a token.

## Example conversation

```
User: I want to use https://cognnitive.com
Agent: Fetching https://cognnitive.com...
       HTML page detected, looking for markdown twin...
       Found index.md, parsing frontmatter...
       Found agent-bootstrap manifest.
       Skills to install: nn-innfo, nn-trannsform, nn-workflow-orchestrator
       MCP to download: innfo-mcp
       Shall I proceed?
User: Yes
Agent: All installed. Workflows available: CogNNitive, traNNsform
```
