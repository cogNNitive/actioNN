# iNNv0 Web — Site Documentation

This folder contains the source files for the [iNNv0 skills website](https://skills.innv0.com), a static site generated using the [nn-design-presets](https://skills.innv0.com/nn-design-presets) AI agent skill.

## Links

- **Live site**: [https://skills.innv0.com](https://skills.innv0.com)
- **GitHub repo**: [https://github.com/cogNNitive/actioNN](https://github.com/cogNNitive/actioNN)
- **Web Design Guide skill**: `skills/nn-design-presets/SKILL.md`
- **Umami dashboard**: [https://cloud.umami.is](https://cloud.umami.is)

## How the Web Design Guide Skill Works

The `nn-design-presets` skill is an AI agent skill that defines a complete design system and generates a static website from it. When invoked, the skill:

1. Reads the design system tokens (palette, typography, spacing grid)
2. Generates HTML pages applying those tokens as inline styles or CSS variables
3. Produces Markdown twins of every page for AI-readability
4. Creates supporting files: `robots.txt`, `sitemap.xml`, `llms.txt`, `ai-index.yaml`, favicons
5. Injects analytics (Umami), attribution metadata, and structured data (schema.org)

The skill does NOT use a build tool or bundler — the output is plain HTML + CSS, deployable directly to GitHub Pages without any compilation step.

## Site Architecture

GitHub Pages publishes from the `docs/` folder, which becomes the web root:

```
docs/
├── index.html              ← Home page (/)
├── web/
│   ├── index.md            ← Markdown twin of home page
│   └── README.md           ← This file
├── documentation/
│   ├── index.html          ← Docsify SPA
│   ├── README.md           ← Documentation index
│   └── skills/             ← Skill reference pages
├── js/
│   └── analytics.js        ← Umami analytics loader
├── .well-known/
│   └── ai-catalog.json     ← Agentic resource discovery
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── favicon.svg
├── CNAME                   ← Custom domain: skills.innv0.com
├── robots.txt              ← AI crawler directives
├── sitemap.xml
├── llms.txt                ← LLM-friendly entry point
├── llms-full.txt           ← Full site content for LLMs
└── ai-index.yaml           ← Structured site manifest
```

## Analytics (Umami)

The site uses [Umami Cloud](https://cloud.umami.is) for privacy-focused analytics. No cookies, no GDPR consent needed.

### How It Works

A lightweight script at `docs/js/analytics.js` dynamically loads the Umami tracker on every page:

```js
(function() {
  var d = document, s = d.createElement('script');
  s.src = 'https://cloud.umami.is/script.js';
  s.setAttribute('data-website-id', '63f444a0-59f9-4d8d-a09d-641a402839ae');
  s.setAttribute('data-auto-track', 'true');
  s.async = true;
  d.head.appendChild(s);
})();
```

For the Docsify documentation section, a `doneEach` hook in `docs/documentation/index.html` sends route-change events to Umami so every pageview inside the SPA is tracked.

### Viewing Statistics

1. Go to [https://cloud.umami.is](https://cloud.umami.is) and log in
2. Select the `iNNv0` website from the dashboard
3. View metrics: pageviews, visitors, bounce rate, visit duration, top pages, referrers, devices, and locations
4. Use filters by date range, country, page, or referrer
5. Export data as CSV or JSON from Settings > Export Data

### Changing the Website ID

To point analytics to a different Umami project, get the new script tag from your Umami Cloud dashboard (Settings > Websites > your site > Tracking Code), extract the `data-website-id` value, and replace it in `docs/js/analytics.js`.

## Contact Section

Every page includes a contact section. The current site uses a **URL-based contact** pointing to `https://innv0.com/contact?ref=actioNN`.

### Option A: External URL (current)

The contact section renders as a styled button linking to an external page:

```html
<a href="https://innv0.com/contact?ref=actioNN" class="btn-primary">
  Contact Us
</a>
```

**To change the URL**: edit the `href` in `docs/index.html` and `docs/web/index.md`.

### Option B: Google Form Embed

Alternatively, embed a Google Form directly in the page:

1. Create the form at [https://forms.google.com](https://forms.google.com)
2. Extract the `FORM_ID` from the share URL: `https://docs.google.com/forms/d/e/{FORM_ID}/viewform`
3. Add the iframe embed to the contact section:

```html
<section id="contact">
  <div class="container">
    <h2>Contact Us</h2>
    <iframe
      src="https://docs.google.com/forms/d/e/{{FORM_ID}}/viewform?embedded=true"
      width="100%" height="900" frameborder="0" marginheight="0" marginwidth="0"
      loading="lazy" title="Contact form">
    </iframe>
  </div>
</section>
```

The embed wrapper uses `max-width: 720px`, centered, with the system's border and background tokens.

## AI-Readiness Features

The site is optimized for AI training pipelines and agent crawlers:

| File | Purpose |
|---|---|
| `robots.txt` | Allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, OAI-SearchBot |
| `llms.txt` | Index of all Markdown pages (per llmstxt.org proposal) |
| `llms-full.txt` | Concatenated full content for context-window-friendly consumption |
| `ai-index.yaml` | Structured YAML manifest listing all pages with metadata |
| `.well-known/ai-catalog.json` | Agentic Resource Discovery (ARD) catalog |
| `<meta name="generator">` | Identifies the tool that generated the site |
| Markdown twins | Every HTML page has a `.md` counterpart at the same URL path |

## How to Add a New Page

Every page follows the **Markdown twin pattern**: a `.md` source and an `.html` render, both at the same path under `docs/`.

### Steps

1. **Create the Markdown source** (`docs/path/to/page.md`):

```markdown
---
title: Page Title
description: Page description for SEO and AI crawlers
html_url: https://skills.innv0.com/path/to/page
generator: https://skills.innv0.com/nn-design-presets
---

# Page Title

Content here...
```

2. **Create the HTML render** (`docs/path/to/page.html`): use `docs/index.html` as a template — same `<head>`, same nav/footer, different `<main>` content.

3. **Register the page** in these discovery files:

- `docs/sitemap.xml` — add a `<url>` entry
- `docs/llms.txt` — add a line to the Pages section
- `docs/ai-index.yaml` — add a `pages:` entry

4. **Link to it** from the navigation (edit `docs/index.html` nav) or from other pages.

## Local Preview

Serve the `docs/` folder with any static HTTP server to preview changes before committing.

### Python (built-in)

```powershell
# Python 3
python -m http.server 8000 -d docs

# Python 2
python -m SimpleHTTPServer 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Node.js (if available)

```powershell
npx serve docs
```

Or install globally:

```powershell
npm install -g serve
serve docs
```

### VS Code

Install the **Live Server** extension, right-click `docs/index.html`, and select "Open with Live Server".

### Important

Always serve from the `docs/` directory — not the repo root — so relative paths (`/js/analytics.js`, `/favicon.ico`) resolve correctly as they will on GitHub Pages.

## Deployment

The site deploys automatically via GitHub Pages whenever changes are pushed to the `main` branch.

### Configuration

- **Settings > Pages > Source**: Deploy from branch `main`, folder `/docs`
- **Custom domain**: `skills.innv0.com` (set in `docs/CNAME` and DNS)

### How to Deploy

1. Preview locally (see above) and verify all changes work
2. Commit your changes:

```powershell
git add docs/
git commit -m "feat: update site content"
```

3. Push to GitHub:

```powershell
git push origin main
```

4. GitHub Actions builds and deploys automatically (usually 1-2 minutes)
5. Visit [https://skills.innv0.com](https://skills.innv0.com) to confirm

### Verifying the Deployment

- Check the **Environment** tab on the GitHub repo for deployment status
- Or run: `curl -s -o /dev/null -w "%{http_code}" https://skills.innv0.com` — should return `200`

## Design Tokens

The site uses these core values from the `nn-design-presets` skill:

| Token | Value | Usage |
|---|---|---|
| Brand primary | `#4D0E4E` — Morado Nazareno | Headers, CTAs, links |
| Canvas base | `#FFFFFF` | Page backgrounds |
| Canvas inert | `#FAFAFC` | Code blocks, card backgrounds |
| Ink primary | `#111112` | Body text |
| Ink muted | `#636366` | Labels, metadata |
| Border soft | `#F2F2F7` | Dividers, card borders |
| Sans UI | Plus Jakarta Sans | UI text, headings |
| Serif | Playfair Display (italic) | Editorial accents |
| Mono | JetBrains Mono | Code, paths |
| Spacing | 8px base grid | Padding, margins, gaps |
| Max width | 1280px | Content container |
