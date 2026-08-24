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
| `~/.agents/mcp/{name}.bundle.js` | Generic MCP bundle location documented for skills that declare `mcp: [...]` in frontmatter (per `AGENTS.md`'s bootstrap rule). **Not currently implemented**: `scripts/skills-manager.js` only installs skill directories from the manifest's `agent-bootstrap.skills` list — it has no code path that downloads or resolves an MCP bundle. |

> **`innfo-mcp` is a special case, not an instance of the row above.** The `innfo-mcp`
> bundle that `nn-trannsform`, `nn-preflight`, and `nn-router` depend on is downloaded
> and resolved by the dedicated `scripts/update-mcp.js` bridge, **not** by
> `scripts/skills-manager.js`, and lives at `.cogNNitive/mcp-bundle.js` (repo-relative),
> **not** `~/.agents/mcp/innfo-mcp.bundle.js`. This is a deliberate, separately specced
> path — see `openspec/specs/mcp-bridge/spec.md`, whose "Skill-Level Fallback Path
> Consistency" requirement explicitly forbids skills from referencing
> `~/.agents/mcp/innfo-mcp.bundle.js`, since the updater never populates it there.
> The two systems are independent by design: `scripts/update-mcp.js` is the
> actioNN↔iNNfo MCP bridge for this one server; the `~/.agents/mcp/{name}.bundle.js`
> row above is a separate, still-unimplemented generic mechanism intended for other
> skills' arbitrary MCP dependencies. Do not unify them or read one as a fallback
> path for the other.

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
