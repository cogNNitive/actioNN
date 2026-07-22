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

The **canonical entry point** is a single phrase:

- **"I want to use https://cognnitive.com/use"**

Also accept these equivalent forms:
- "Quiero usar eNNvironment https://cognnitive.com/use"
- "Usa eNNvironment <URL>"
- "/bootstrap <URL>"
- Any message containing "bootstrap" + a URL

`https://cognnitive.com/use` is the always-on entry point for both first-time setup and returning use. The page exposes an `agent-bootstrap:` manifest (YAML frontmatter or discoverable via fallbacks) **and** plain-language self-bootstrap instructions in its body, so even an agent that does not yet have this skill installed can follow it.

## Flow

### Environment Rule (MANDATORY)

All resource resolution MUST use web fetches to canonical URLs only:
- `https://cognnitive.com/use` — canonical entry point (manifest + self-bootstrap instructions)
- `https://cognnitive.com` — eNNvironment gateway
- `https://raw.githubusercontent.com/cogNNitive/...` — raw files from GitHub repos
- `https://codeload.github.com/cogNNitive/...` — repo tarballs (HTTPS skill download, no git)

Do NOT read files from the local filesystem (no `Read` tool, no `Glob` tool, no `Bash` with file paths). The user may not have the repository cloned. If you already have context about local files from your session, ignore it — always fetch from the canonical URL.

Exception: if the user explicitly says they are in a development environment with repos cloned, you MAY use local files for efficiency.

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

### Step 1c — Manifest summary and confirmation

After successfully parsing the manifest, use the `question` tool to present the parsed result and wait for user confirmation:

Do you want to proceed with installation?
- **[a]** Yes, install everything (Recommended)
- **[b]** Install only specific skills (user will list them)
- **[x]** Cancel

If [a]: proceed with all skills.
If [b]: ask which skills to include, install only those listed.
If [x]: stop. Report "Bootstrap cancelled by user."

Show what was found before asking:

```
Found bootstrap manifest at {url}.

Skills to install:
  - {name} — {description or "already installed"}
  ...

MCP bundles to download:
  - {name} ({url})

Workflows available:
  - {id}: {label}
```

This confirmation is MANDATORY. Do not skip it.

### Step 2: Provision skills

For each skill in `skills[]`:

```
1. Check if ~/.agents/skills/{name}/SKILL.md exists: skip, report "Already installed: {name}"
2. Download the repo tarball over HTTPS (no git required). `{repo}` is the `org/repo`
   from the manifest: https://codeload.github.com/{repo}/tar.gz/refs/heads/main
   (if that 404s, retry with the `master` branch). Extract to a temp directory.
3. Copy {path} from the extracted tree to ~/.agents/skills/{name}/
4. If skill-origin-guard is available, validate frontmatter
   - If validation fails: warn but continue
   - If skill-origin-guard not found: warn "frontmatter validation skipped" and continue
5. Update skill registry (~/.agents/skills is auto-discovered by most agents)
```

After provisioning ALL skills, report the per-skill status:

`{name}` — ✅ Installed (or ⏭️ Already present)

This intermediate report is MANDATORY. Show it even if all skills were already present.

### Step 3: Provision MCP bundles

For each skill that declares `mcp[]`:

```
1. For each mcp entry: {name, url}
2. Create ~/.agents/mcp/ if it doesn't exist
3. Check if ~/.agents/mcp/{name}.bundle.js exists: skip, report "MCP already present: {name}"
4. Download {url} to ~/.agents/mcp/{name}.bundle.js
5. If download fails (HTTP error, timeout):
   - Report the error immediately:
     ⚠️ Error HTTP {code} downloading MCP bundle for {name}
     URL: {failed_url}
   - Try the actioNN fallback URL:
     `https://raw.githubusercontent.com/cogNNitive/actioNN/main/scripts/bin/{name}.bundle.js`
   - If fallback succeeds: report "✅ MCP bundle downloaded from fallback URL"
   - If fallback also fails: mark skill as "MCP unavailable" and warn the user
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

### Step 3b — Verify MCP connectivity

After registering all MCP servers, verify they respond:

1. Call `innfo-mcp_list_models` with the workspace root.
2. If it returns a result (even empty list):
   "✅ MCP connected — `innfo-mcp` is responding."
3. If the tool is not available (MCP not yet loaded by the session):
   - Read `.opencode/opencode.json` and verify the `innfo-mcp` entry was written correctly
   - Tell the user:
     > ⚠️ MCP server registered but not yet loaded. OpenCode will pick it up on next startup.
     > To use it now: restart OpenCode (close and reopen).
4. If the tool is available but returns errors:
   - Report the error
   - Suggest fixes: wrong bundle path, missing Node.js dependencies, corrupted download

This verification is MANDATORY. Do not skip it.

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

## Post-install summary (MANDATORY)

After ALL steps complete (including verification), render this summary. Do NOT skip it.

```
✅ Bootstrap complete — {manifest_url}

Skills:
  {name}	{status}	{version or "—"}
  ...

MCP:
  {name}	{status}	{connected ⚡ / disconnected ⚠️}

Workflows available:
  [{workflow.id}] {workflow.label}

Next step: Run a workflow with [{workflow.id}] or type the workflow name.
```

## Edge cases

- **Repeated run**: skills already installed are skipped (idempotent). MCP bundles already present are skipped. Only new or missing items are processed.
- **Partial failure**: if one skill fails to clone, continue with the rest. Report failures at the end.
- **No MCP dir**: create `~/.agents/mcp/` on first MCP provision.
- **No git required**: skills are fetched over HTTPS as `.tar.gz` tarballs, so `git` does NOT need to be installed. Never fall back to `git clone`.
- **GitHub rate limit**: if a tarball download fails with a rate limit, suggest waiting or using a token.

## Example conversation

```
User: I want to use https://cognnitive.com/use
Agent: Fetching https://cognnitive.com/use...
       HTML page detected, looking for markdown twin...
       Found index.md, parsing frontmatter...
       Found agent-bootstrap manifest.
       Skills to install: nn-innfo, nn-trannsform, nn-workflow-orchestrator
       MCP to download: innfo-mcp
       Shall I proceed?
User: Yes
Agent: All installed. Workflows available: CogNNitive, traNNsform
```
