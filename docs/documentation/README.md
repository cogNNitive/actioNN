---
title: "iNNv0 — Documentation"
description: "Technical documentation for the iNNv0 skills ecosystem"
html_url: https://actionn.cognitive.com/documentation/
generator: https://actionn.cognitive.com/nn-design-presets
---

# iNNv0 — Documentation

**iNNv0** is a **skills** ecosystem for AI agents. Each skill is an autonomous module that teaches the agent to solve a specific type of task with domain knowledge.

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
