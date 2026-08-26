# Skill Locations — Canonical Reference

Single source of truth for where cogNNitive skills and MCP bundles live, and for how
to detect and create the links that connect them. `nn-skills-lifecycle` MUST reference
this file and MUST NOT hardcode paths.

## Canonical Install Locations

| Location | Purpose |
|---|---|
| `~/.agents/skills/{name}/` | Installed skills (user-level, managed by `scripts/skills-manager.js`) |
| `~/.config/opencode/skills/{name}/` | opencode user skills (global) |
| `.opencode/skills/` | opencode project skills (repo-scoped) |
| `~/.agents/mcp/{name}.bundle.js` | MCP server bundles (e.g. `innfo-mcp.bundle.js`) |

## Detection — LinkType

To detect whether a path is a Junction, a SymbolicLink, or a regular directory, use
`Get-Item` and inspect `.LinkType`:

```powershell
$item = Get-Item -LiteralPath <path>
if ($null -eq $item.LinkType) { "Regular directory" }
elseif ($item.LinkType -eq "Junction") { "Junction" }
elseif ($item.LinkType -eq "SymbolicLink") { "SymbolicLink -> $($item.Target)" }
else { "Link type: $($item.LinkType)" }
```

`LinkType` is `Junction`, `SymbolicLink`, or empty (`$null`) for a regular directory.

## Creation — Junction

```powershell
New-Item -ItemType Junction -Path <link> -Target <target>
```

Junctions work for directories and require no administrator privileges on Windows.

## Creation — SymbolicLink

```powershell
New-Item -ItemType SymbolicLink -Path <link> -Target <target>
```

Symbolic links to directories require an elevated (administrator) shell on Windows,
or Developer Mode enabled. On macOS/Linux they work without elevation. Prefer
Junctions for directory links on Windows.

## Usage Note

`nn-skills-lifecycle` reads this file for the Steward branch (scan, install, junction).
It MUST use the commands above as-is and MUST NOT hardcode locations in its own body —
any path change is made here once.
