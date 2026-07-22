---
name: nn-preflight
description: "Preflight checks for actioNN skills. Verifies Node.js, data structure, dependency skills, npm deps, MCP bundle, and MCP server health. Post-check discovers iNNfo models and provides workspace loading instructions. Invoked by other skills before execution. Two tiers: Basic (always) and iNNfo (when MCP needed)."
disable-model-invocation: true
version: "1.1"
last_updated: 2026-07-22
license: MIT
compatibility: opencode, claude-code, cursor, any agent supporting skills
metadata:
  source_type: original
---

# nn-preflight — Readiness Gate

Preflight checks that other skills invoke before execution. Two tiers:

| Tier | Trigger | Checks |
|------|---------|--------|
| Basic | Always | Node.js, data structure, dependency skills, npm |
| iNNfo | When MCP is needed | MCP bundle, MCP server alive |

---

## Invocation (for calling skills)

Other skills instruct the agent to run preflight like this:

```
Load nn-preflight and run Tier 1 with dependencies [skill-a, skill-b].
```

Or for iNNfo work:

```
Load nn-preflight and run Tier 1 and Tier 2 with dependencies [skill-a, skill-b].
```

The agent extracts:
- **Tier**: from "Tier 1", "Tier 2", "Basic", "iNNfo"
- **Dependencies**: from "dependencies [list]" or "deps [list]"
- **Workspace**: from "workspace [path]" or defaults to agent's CWD

---

## Checks — Tier 1 (Basic)

Run ALL checks below. Show the report at the end.

### 1.1 Node.js

```powershell
node --version
```

- **Pass**: version >= 18.x
- **Fail**: `⛔ Node.js not found. Install from https://nodejs.org (v18+ required).`
- **Severity**: blocker

### 1.2 Data structure

Verify these directories exist under the workspace (CWD unless overridden):

| Directory | Purpose |
|-----------|---------|
| `input/` | Place source files |
| `raw/`   | Pre-scan staging |
| `output/`| Transformation results |

- **Pass**: all three exist
- **Partial**: offer to create missing ones. Ask user: "`input/` and `output/` are missing. Create them?"
- **Fail**: user declines → mark as warning, not blocker

### 1.3 Dependency skills

For each skill in the dependency list, run the canonical detection defined in
[`reference/skill-locations.md`](reference/skill-locations.md) (available_skills →
`~/.agents/skills` → `~/.config/opencode/skills`).

- **Pass**: all found
- **Fail**: list each missing one. Offer: "Run nn-skills-lifecycle to install missing skills?"
- **Severity**: blocker

### 1.4 npm dependencies (only if nn-trannsform is in the dependency list)

Check that `node_modules` is installed in the nn-trannsform skill directory.

```powershell
# Find nn-trannsform base dir
$base = (Get-Item "~/.agents/skills/nn-trannsform").Target 2>$null
if (-not $base) { $base = "~/.agents/skills/nn-trannsform" }
Test-Path "$base/node_modules"
```

- **Pass**: node_modules exists
- **Fail**: offer `cd <base>; npm install`
- **Severity**: blocker

---

## Checks — Tier 2 (iNNfo)

Run ONLY when the calling skill requests Tier 2 / iNNfo.

### 2.1 MCP bundle exists

The `innfo-mcp` bundle must be present. Search in order:

1. `~/.agents/skills/nn-trannsform/scripts/bin/innfo-mcp.bundle.js`
2. `~/.agents/skills/actioNN/scripts/bin/innfo-mcp.bundle.js`
3. `<calling-skill-base>/scripts/bin/innfo-mcp.bundle.js`

- **Pass**: file found at any location
- **Fail**: `⛔ MCP bundle not found. Run \`node scripts/update-mcp.js\` in the actioNN directory.`
- **Severity**: blocker

### 2.2 `.opencode/opencode.json` exists

Check if the MCP server is configured for this workspace:

1. Check if `.opencode/opencode.json` exists in the workspace directory (CWD)
2. If it exists, verify it contains `mcp.innfo-mcp` with the correct `command` path
3. If the path in the config points to a non-existent file, note that the bundle is missing

- **Pass**: config exists with valid bundle path
- **Fail (no config)**: Offer to generate it:
  ```
  .opencode/opencode.json is missing. Create it with the innfo-mcp config?
  ```
  If user agrees, resolve the bundle path (same search order as §2.1) and write:
  ```json
  {
    "$schema": "https://opencode.ai/config.json",
    "mcp": {
      "innfo-mcp": {
        "type": "local",
        "command": ["node", "<resolved-absolute-bundle-path>"],
        "enabled": true
      }
    }
  }
  ```
  Then inform: "Created. Restart your agent in this folder to enable the MCP."
- **Fail (wrong path)**: Note the mismatch and offer to update the path
- **Severity**: warning (the server can't start without this config)

### 2.3 MCP server alive

Verify the MCP server actually responds (only if §2.2 passed):

1. Call `list_mcp_resources` or `list_mcp_resource_templates` targeting `innfo-mcp`
2. If the server is listed, call `innfo-mcp_list_models` with a short timeout (5s)
3. Any non-error response counts as alive

- **Pass**: server responds
- **Fail**: `⛔ MCP server innfo-mcp not responding. If you just created .opencode/opencode.json, restart your agent.`
- **Severity**: warning (the server may start lazily on first real call)

---

## Report format

After all checks, produce a structured report:

```
## Preflight Results — Tier X

  ✅ Node.js v18.17.0
  ✅ Data structure — input/, raw/, output/
  ✅ Dependency skills: nn-innfo, nn-workflow-orchestrator
  ⛔ npm dependencies — nn-trannsform node_modules missing

---

  → 1 blocker, 0 warnings

Shall I resolve the blocker(s) before proceeding? (yes / skip / cancel)
```

Severity icons:
- `✅` — passed
- `⛔` — blocker (must resolve before proceeding)
- `⚠️` — warning (advisory, non-blocking)

After showing the report, ask the user before taking any remediation action. Do not auto-fix without consent.

---

## Post-Check: iNNfo Model Discovery

After the report is shown (and any blockers resolved), run this discovery scan regardless of tier:

### 3.1 Scan for iNNfo models

Search for iNNfo model files under the workspace directory:

```powershell
Get-ChildItem -Recurse -Filter "*_NN.md" | Select-Object FullName
```

- **Models found**: Print a bullet list of all discovered `*_NN.md` files.
- **No models**: Print `ℹ️ No iNNfo models found — skip workspace instructions.`

### 3.2 Workspace loading instructions

If at least one model was found, print these instructions **verbatim**:

```
📂 iNNfo models detected in this workspace.

To load them in the iNNfo Modeler:

  1. Open https://innfo.cognnitive.com/app/ in Chrome, Edge, or Opera
     (requires File System Access API).
  2. Click "Open Folder" and select the workspace root directory.
  3. The app will parse all *_NN.md models and display them.

The iNNfo Modeler lets you browse, edit, and export models visually.
```

---

## Integration guide (for skill authors)

To add preflight to your skill, place this block near the top of your SKILL.md:

```markdown
## Preflight Gate (MANDATORY)

Before any other action:
1. Load `nn-preflight` via `skill("nn-preflight")`
2. Tell it: "Run Tier 1 with dependencies [other-skills-here]"
3. If the task involves iNNfo models, also request Tier 2
4. If any blocker is reported, ask the user before proceeding
5. If all checks pass (or user overrides), continue with the task
```
