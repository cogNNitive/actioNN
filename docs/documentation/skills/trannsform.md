---
title: "traNNsform — iNNv0 Skill"
description: "Document ingestion and transformation pipeline from PDF/DOCX to unified Markdown"
html_url: https://skills.innv0.com/docs/#/skills/trannsform
generator: https://skills.innv0.com/nn-design-presets
---

# traNNsform

**Version**: 1.1 · **Installed**: 2026-06-27

## Purpose

Complete document ingestion and transformation pipeline. Takes files in multiple formats and converts them to unified Markdown using the agent's own LLM as the transformation engine.

## Supported Formats

| Format | Native Reading | Node.js Library |
|---|---|---|
| `txt` | ✅ | — |
| `md` | ✅ | — |
| `csv` / `json` | ✅ | — |
| `pdf` | ⚠️ Model-dependent | `pdf-parse` |
| `docx` | ❌ | `mammoth` |
| `xlsx` | ❌ | `xlsx` |

## Workflow

1. **Bootstrap**: creates `raw/`, `md/`, `traNNsformations/`, `output/` structure
2. **Scan & normalization**: reads files and unifies to Markdown
3. **Diagnosis**: the agent presents a panel with detected formats
4. **Transformation**: the agent's own LLM transforms the consolidated content guided by templates
5. **Output**: generates two versions:
   - **Draft** (`_draft.md`): with source citations, review notes, uncertainty markers
   - **Final** (`_v_0-1-0.md`): clean version with semver

## Included CLI

The skill includes functional Node.js scripts:

| Script | Lines | Function |
|---|---|---|
| `scripts/index.js` | 579 | Main CLI |
| `scripts/scanner.js` | 340 | Scanning and format detection |
| `scripts/transformer.js` | 168 | Fallback transformation (when the agent cannot process the entire context) |
| `scripts/config.js` | 44 | Centralized configuration |

> The main path is ALWAYS the agent's LLM. The CLI is fallback for very large contexts.

## Files

```
skills/nn-trannsform/
  SKILL.md
  README.md
  TESTING.md
  package.json
  scripts/
    index.js
    scanner.js
    transformer.js
    config.js
  examples/
```
