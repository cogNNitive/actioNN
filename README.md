# actioNN Skills

**Modular AI Agent skills ecosystem for [OpenCode Desktop](https://opencode.ai).**

actioNN is a collection of self-contained, domain-specialized skills that teach your AI agent to solve specific types of tasks — from model evaluation and document transformation to web design and skills lifecycle management. Each skill is an autonomous module with its own triggers, instructions, and behavior rules.

[View site](https://actionn.cognnitive.com) · [Documentation](https://actionn.cognnitive.com/documentation/) · [Report issue](https://github.com/cogNNitive/actioNN/issues)

---

## Skills

<!-- skills:start -->

| Skill | Invocation | Description |
|---|---|---|
| **[agent-web-bootstrap](./skills/agent-web-bootstrap/)** | Automatic | Bootstrap the cogNNitive ecosystem from a manifest URL. Trigger when the user says "usar eNNvironment", "bootstrap", or provides a URL referencing an agent-bootstrap manifest (e.g., "Quiero usar eNNvironment <URL>"). Installs declared skills from GitHub, downloads and registers MCP bundles, validates frontmatter with skill-origin-guard, and presents available workflows. Only needs to run once per environment. |
| **[nn-design-presets](./skills/nn-design-presets/)** | Automatic | Reference for cogNNitive visual design presets — palettes, typography, spacing, and branding tokens. Use when building or styling web pages, documentation sites, or marketing pages. |
| **[nn-dev-opencode-model-router](./skills/nn-dev-opencode-model-router/)** | `/nn-dev-opencode-model-router` | Route any task to the right OpenCode model — trivial, bug, feature, or refactor. Invoke with /nn-dev-opencode-model-router. |
| **[nn-innfo](./skills/nn-innfo/)** | Automatic | MANDATORY trigger: MUST activate this skill whenever the user is creating, editing, validating, or discussing any iNNfo model, template, specialization, sample, or specification file. |
| **[nn-onboarding-wizard](./skills/nn-onboarding-wizard/)** | Automatic | Conversational wizard for creating an iNNfo model from scratch. Walks the user through template selection, model naming, and workspace scaffolding. Trigger after bootstrap (CogNNitive flow) or when the user wants to create a new model step by step. |
| **[nn-preflight](./skills/nn-preflight/)** | `/nn-preflight` | Preflight checks for actioNN skills. Verifies Node.js, data structure, dependency skills, npm deps, MCP bundle, and MCP server health. Post-check discovers iNNfo models and provides workspace loading instructions. Invoked by other skills before execution. Two tiers: Basic (always) and iNNfo (when MCP needed). |
| **[nn-router](./skills/nn-router/)** | `/nn-router` | Entry point for cogNNitive skills. Reads the generated skill registry and tells you which skill to use for what. Invoke with /nn-router. |
| **[nn-site-generator](./skills/nn-site-generator/)** | `/nn-site-generator` | Create or edit websites, add analytics, or add contact forms. Invoke with /nn-site-generator. |
| **[nn-skills-lifecycle](./skills/nn-skills-lifecycle/)** | `/nn-skills-lifecycle` | Install, create, audit, and maintain cogNNitive skills. Entry point for the skill ecosystem. Invoke with /nn-skills-lifecycle. |
| **[nn-trannsform](./skills/nn-trannsform/)** | Automatic | Bootstrap projects, scan raw documents, normalize them to Markdown, and apply template-based transformations. Includes a Node.js CLI tool for document ingestion, format conversion (txt, md, csv, json, docx, pdf, xlsx), and transformation orchestration. Uses the agent's own LLM for the actual content transformation. Triggers: trannsform, transform, normalize, scan documents, document ingestion, document transformation, document processing, markdown conversion, project bootstrap |
| **[nn-workflow-orchestrator](./skills/nn-workflow-orchestrator/)** | `/nn-workflow-orchestrator` | Run, create, or discover multi-skill workflows. Entry point for document transformation pipelines. Invoke with /nn-workflow-orchestrator. |

<!-- skills:end -->

> This table is auto-generated from each skill's frontmatter by `scripts/build-registry.js`. Do not edit it by hand — run the script after adding or changing a skill.

## Getting Started

No Git or terminal needed. Tell your AI agent:

```
I want to use https://cognnitive.com
```

OpenCode fetches the bootstrap manifest, downloads all skills from GitHub, registers the MCP server, and presents a workflow menu — all automatic.

### Requirements

- [OpenCode Desktop](https://opencode.ai) — conversational AI agent desktop application and runtime
- **Windows** (recommended) — NTFS junctions for live-change reflection
- **Node.js 18+** — required by the traNNsform skill CLI tool

## How It Works

1. **Automatic scan** — At session start, the Skills Manager detects all available skills and reports their installation status.
2. **On-demand loading** — When a task matches a skill's triggers, the agent loads that skill's instructions and executes the specialized workflow.
3. **Modular by design** — Each skill is self-contained. Skills can be installed, updated, and removed independently without affecting others.

## Project Structure

```
actioNN/
├── skills/                        # Skill modules (one per directory)
│   ├── nn-innfo/               #   iNNfo semantic modeling
│   ├── nn-dev-opencode-model-router/  #   Model adequacy evaluator
│   ├── nn-workflow-orchestrator/  #   Multi-skill workflow orchestration
│   ├── nn-skills-lifecycle/    #   Skills lifecycle management
│   ├── nn-preflight/           #   Readiness gate (env checks) for other skills
│   ├── nn-router/              #   Entry-point index over the skill registry
│   ├── nn-trannsform/          #   Document ingestion pipeline
│   └── nn-design-presets/    #   Design system & brand guidelines
├── docs/                          # Public site (Docsify + static HTML)
│   ├── index.html                 #   Landing page
│   ├── documentation/             #   Full skill documentation
│   └── ...                        #   Favicons, sitemap, analytics
├── scripts/                       # Repository-level automation scripts
├── AGENTS.md                      # Agent configuration & conventions
├── .gitignore
└── README.md                      # You are here
```

## Skill Versioning

All skills follow semantic versioning in their frontmatter:

```yaml
---
name: <skill-name>
version: "V_x-y-z"
last_updated: YYYY-MM-DD
metadata:
  source_type: "original" | "mirrored" | "integrated"
  source: "https://github.com/cogNNitive/actioNN"
license: MIT
---
```

- **original** — authored here, this repo is the source of truth
- **mirrored** — copied from another repo via sync script
- **integrated** — bundled tool lives in the skill directory

## Contributing

1. Skills live in `skills/<skill-name>/` with a `SKILL.md` as the primary agent-facing instruction file.
2. All user-facing content must be in **English** per repo convention.
3. Every skill must include valid YAML frontmatter with name, version, last_updated, and metadata fields.
4. Scripts and tooling go under `scripts/` or within the skill's own directory.

## License

[MIT](./LICENSE) — all skills in this repository are open source under the MIT license.

---

Built with [cogNNitive Web Design Guide](https://actionn.cognnitive.com/nn-design-presets).
