# Sample ActioNN: Paper to YouTube Script

Use the **nn-trannsform** skill to turn a scientific paper into a YouTube video script.

## How to run

1. Place the PDF in `input/`
2. Activate the nn-trannsform skill
3. Say:

> Run the sample workflow paper-to-youtube. Read the PDF in `input/`, extract its core narrative, and produce a YouTube video script in `output/`. Include: hook, context for a general audience, key findings with analogies, limitations, and a call to action. Name the file `<PaperName>_youtube_script.md`.

## Example

```bash
# Download the paper
curl -o input/munz2009a.pdf \
  https://pdodds.w3.uvm.edu/files/papers/others/2009/munz2009a.pdf

# Then tell your agent:
# "Run paper-to-youtube on input/munz2009a.pdf"
```

## Output

A Markdown script with timestamps and visual cues:

```markdown
# YouTube Script: What makes a video go viral?
## Hook (0:00-0:15) - [Visual: viral video montage]
## Intro (0:15-0:45) - [Visual: paper screenshot]
## Finding 1: Emotional contagion (0:45-1:45)
## Finding 2: Network structure (1:45-2:45)
## Limitations (5:00-5:30)
## CTA (5:30-6:00)
```
