# Sample ActioNNs

Ready-to-run transformation recipes that demonstrate how to use the **traNNsform** skill to convert real-world documents from one format to another.

Each Sample ActioNN is a self-contained workflow: drop your source file in the right place, tell your agent which sample to run, and get the transformed output.

---

## Paper to YouTube Script

**Source** &rarr; **Result**: Scientific PDF &rarr; YouTube video script

Extracts the core narrative from a research paper and structures it into a ready-to-record YouTube script with hook, context, key findings, limitations, and call to action.

### How to run

```bash
# 1. Download a paper into the input directory
curl -o input/munz2009a.pdf \
  https://pdodds.w3.uvm.edu/files/papers/others/2009/munz2009a.pdf

# 2. In your AI agent, say:
# "Run the sample workflow paper-to-youtube on input/munz2009a.pdf"
```

**What happens**: The agent reads the PDF, identifies the central question and key findings, and produces a timestamped script with visual cues. Output saved as `output/<PaperName>_youtube_script.md`.

### Example output structure

```
# YouTube Script: What makes a video go viral?
## Hook (0:00–0:15)
## Intro (0:15–0:45)
## Finding 1: Emotional contagion (0:45–1:45)
## Finding 2: Network structure (1:45–2:45)
## Limitations (5:00–5:30)
## CTA (5:30–6:00)
```

> **Try it with any paper**: The workflow adapts to whatever PDF you provide.

---

## Meeting Notes to Executive Summary

**Source** &rarr; **Result**: Raw meeting notes &rarr; Structured executive summary

Transforms messy notes or transcripts into a clean, stakeholder-ready summary with decisions, action items, blockers, and next-meeting agenda.

### How to run

```bash
# 1. Place your meeting notes in the input directory
cp ~/notes/sprint-review.md input/

# 2. In your AI agent, say:
# "Run the sample workflow meeting-to-summary on input/sprint-review.md"
```

**What happens**: The agent scans the notes for signals (decisions, action items, blockers), separates them from discussion noise, and writes a structured Markdown summary. Output saved as `output/<MeetingTopic>_executive_summary.md`.

### Example output structure

```markdown
# Sprint Review — Executive Summary
**Date**: 2026-07-15 | **Attendees**: @alice, @bob, @carol

## Executive Brief
The team reviewed sprint 14 results...

## Decisions
- Ship v2.1 without the reporting module

## Action Items
| Owner | Task | Deadline |
|-------|------|----------|
| @alice | Migration plan | 2026-08-01 |

## Blockers
- Reporting API dependency (waiting on platform team)

## Next Meeting
- Review migration plan
```

---

## How Sample ActioNNs work

1. **Place your source** in `traNNsform/input/` (or `input/` if using the skill standalone)
2. **Invoke the agent** with the sample's prompt
3. **The agent follows the workflow stages** &mdash; ingest, analyze, transform, save
4. **Get your result** in `traNNsform/output/`

All Sample ActioNNs follow the same pattern: declarative stages in a workflow file that the agent executes sequentially. The agent never invents data &mdash; everything traces back to the source.

> **Tip**: These samples ship as workflow files in `traNNsform/workflows/samples/`. You can read the full stage-by-stage pipeline there.
