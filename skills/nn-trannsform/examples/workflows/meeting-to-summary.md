# Sample ActioNN: Meeting Notes to Executive Summary

Use the **nn-trannsform** skill to turn raw meeting notes into a stakeholder-ready executive summary.

## How to run

1. Place your notes or transcript in `input/`
2. Activate the nn-trannsform skill
3. Say:

> Run the sample workflow meeting-to-summary. Read the file in `input/`, extract decisions, action items, and blockers, and produce an executive summary in `output/`. Name the file `<MeetingTopic>_executive_summary.md`.

## Example

```bash
cp ~/notes/sprint-review.md input/

# Then tell your agent:
# "Run meeting-to-summary on input/sprint-review.md"
```

## Output

A structured Markdown file:

```markdown
# Sprint Review - Executive Summary
**Date**: 2026-07-15 | **Attendees**: @alice, @bob

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
