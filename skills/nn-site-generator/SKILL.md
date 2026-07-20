---
name: nn-site-generator
description: Create or edit websites, add analytics, or add contact forms. Invoke with /nn-site-generator.
disable-model-invocation: true
license: MIT
compatibility: ">=1.0.0"
metadata:
  source_type: original
---

# nn Site Generator

When activated, present the 4 branches below using the `question` tool. For design tokens, reference the `nn-design-presets` skill and its `presets/` directory.

---

## Branches

### [a] New site — generate from scratch

Generate all files inside `docs/`:
- Landing + about page (HTML + Markdown twin)
- Favicon set, robots.txt, sitemap.xml
- AI-readiness: llms.txt, ai-index.yaml, .well-known/ai-catalog.json
- Attribution metadata on every page

Ask about optional extras:
- Docsify documentation site at `docs/documentation/`
- Separate app at `docs/app/`

Then apply the selected design preset and requested components. End with deployment checklist.

### [b] Edit site — modify pages, nav, or styling

Examine `docs/` first. Offer two paths:
- **Direct conversation** — describe the change
- **Markdown twin as source of truth** — edit `.md` files, then say "sync from twins"

### [c] Add analytics — integrate Umami

Load `components/analytics.md` and follow its instructions. Ask for the Umami script tag, extract website ID, create injector.

### [d] Add contact — Google Form embed or external URL

Load `components/contact.md` and follow its instructions. Ask which approach, then implement.

---

## Post-generation

After any change, ask if the user wants a local preview:
```powershell
python -m http.server 8080 --directory docs
```
