---
title: "cogNNitive — Documentation"
description: "Technical documentation for the cogNNitive skills ecosystem"
html_url: https://actionn.cognnitive.com/documentation/
generator: https://actionn.cognnitive.com/nn-design-presets
---

# cogNNitive — Documentation

**cogNNitive** is a **skills** ecosystem for AI agents. Each skill is an autonomous module that teaches the agent to solve a specific type of task with domain knowledge.

## Included Skills

| Skill | Version | Purpose |
|---|---|---|
| [Model Router](skills/opencode-model-router.md) | 1.0.0 | Evaluates whether the AI model is suitable for each task |
| [Skills Manager](skills/skills-manager.md) | 1.0 | Manages the lifecycle of repository skills |
| [traNNsform](skills/trannsform.md) | 1.1 | Document ingestion and transformation pipeline |
| [Web Design Guide](skills/web-design-guide.md) | — | Light-mode design system with Morado Nazareno palette |

## Installation

```bash
git clone https://github.com/cogNNitive/actioNN.git
cd actioNN
```

Then launch your AI agent from the directory (`opencode .`, `claude .`, or equivalent).

The **Skills Manager** activates automatically at session start. It scans the `skills/` directory, detects available skills, and guides you through installation using **Windows NTFS junctions**, which reflect repo changes live.

## Sample ActioNNs

Ready-to-run transformation recipes that demonstrate the skills in action:

| Sample | What it does |
|--------|-------------|
| [Paper to YouTube Script](sample-actionns.md?id=paper-to-youtube-script) | Convert a scientific PDF into a YouTube video script |
| [Meeting Notes to Executive Summary](sample-actionns.md?id=meeting-notes-to-executive-summary) | Transform raw notes into a structured summary with decisions and action items |

Each sample includes concrete bash commands and agent prompts &mdash; drop in a file, run the prompt, get the result.

---

## Philosophy

- **CONCEPTS > CODE**: understand the foundation before writing a line
- **Atomic skills**: each skill solves one specific problem without coupling to others
- **Declarative skills**: each skill defines triggers and behavior in clear frontmatter
- **Bilingual**: frontmatter in English for the system, interaction in Rioplatense Spanish with the user

## Tech Stack

- **Runtime**: AI agent (OpenCode, Claude Code, Gemini, Cursor, or any compatible agent)
- **Persistent memory**: Engram
- **Primary OS**: Windows (NTFS junctions for installation)
- **Documentation**: Docsify + this site
