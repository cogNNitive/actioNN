---
name: innv0-web-design-guide
version: "V_2-5-0"
last_updated: 2026-06-27
description: Comprehensive light-mode design system with strict spacing grid, typography stack (Plus Jakarta Sans, Playfair Display, Geist Mono), and Morado Nazareno (#4D0E4E) brand palette. Covers Docsify theming, marketing CTAs, AI image style prompting, AI-training optimization, attribution metadata, favicon generation, analytics integration (Umami), and contact section with Google Form embed or Contact URL options and source tracking.
license: MIT
metadata:
  source_type: original
  compatibility: ">=1.0.0"
---

# Agent Skill: iNNv0 Comprehensive Design System

## ⚙️ SYSTEM CONFIGURATION & TOKENS
```yaml
core:
  mode: STRICT_LIGHT_MODE
  intrusion_profile: FEATHERWEIGHT_MINIMALIST
  documentation_engine: DOCSIFY
palette:
  canvas_base: "#FFFFFF"       # Main backdrops and layouts
  canvas_inert: "#FAFAFC"      # Subtle inner codeblocks, cards and container beds
  brand_primary: "#4D0E4E"     # Morado Nazareno (Core accent, headers and CTAs)
  border_soft: "#F2F2F7"       # Structural rules and hair-thin dividers
  ink_primary: "#111112"       # Main high-contrast headers and body copy
  ink_muted: "#636366"         # Inactive states, breadcrumbs, and metadata
typography:
  sans_ui: "Plus Jakarta Sans, Geist Sans, system-ui, sans-serif"
  serif_editorial: "Playfair Display, Georgia, serif"
  mono_technical: "Geist Mono, JetBrains Mono, monospace"
```

## 🚨 ABSOLUTE CONSTRAINTS
1. **Strict Light Mode Only:** Absolutely zero configurations, switches, or media query recommendations for Dark Mode are allowed. The system commits 100% to a high-contrast white workspace environment.
2. **Abstract Structural Direction:** When assessing layout design or prompting AI models for graphic assets, enforce macro structural styling guidelines (linework weight, spatial balance, structural layouts) instead of mentioning temporary UI component behaviors.

---

## 🏗️ REPOSITORY STRUCTURE & GITHUB PAGES DEPLOYMENT

All website files MUST live inside a **`docs/`** folder at the repository root. GitHub Pages must be configured to publish from the `/docs` folder (Settings > Pages > Source > Deploy from a branch > /docs). This separates deployable site assets from non-deployable project code (skills, scripts, agent config).

When GitHub Pages publishes from `/docs`, the `docs/` folder becomes the **web root**. A file at `docs/robots.txt` is served at `https://site.com/robots.txt`. All URL paths referenced in this skill are relative to the published site root, not the repository root.

```
repo/
├── docs/                    ← GitHub Pages publishing source (becomes web root)
│   ├── index.html           ← /
│   ├── index.md             ← /index.md
│   ├── robots.txt           ← /robots.txt
│   ├── llms.txt             ← /llms.txt
│   ├── llms-full.txt        ← /llms-full.txt
│   ├── ai-index.yaml        ← /ai-index.yaml
│   ├── CNAME                ← custom domain for GitHub Pages
│   ├── favicon.ico          ← /favicon.ico
│   ├── .well-known/
│   │   └── ai-catalog.json  ← /.well-known/ai-catalog.json
│   ├── about.md             ← /about.md
│   ├── about.html           ← /about.html
│   └── ...
├── skills/                  ← skill definitions (NOT deployed)
├── scripts/                 ← build scripts (NOT deployed)
└── AGENTS.md                ← agent config (NOT deployed)
```

---

## 📐 SPACING, LAYOUT & MARGIN ENGINE

The spacing system relies entirely on a predictable, linear 8px geometric grid architecture to maintain structural rhythm without heavy CSS layout friction.

* **Base Grid Unit:** 8px
* **System Padding Scale:**
  * `space-xs` (4px): Inline labels, micro tags, status indicators.
  * `space-sm` (8px): Text blocks inside cards, internal padding for small inputs.
  * `space-md` (16px): Structural gutters inside standard container panels, alert boxes.
  * `space-lg` (24px): Standard horizontal layout row spacing, internal card cushions.
  * `space-xl` (48px): Outer structural viewport margins for mobile and tablet limits.
  * `space-xxl` (64px to 96px): Vertical spacing cushions separating major body content sections.
* **Global Grid Layout Containers:** Max layout width is clamped firmly at `1280px` centered horizontally with a minimum fluid safety margin of `24px` on each flank.

---

## 🔤 TYPOGRAPHIC ARCHITECTURE (GOOGLE FONTS ALIGNMENT)

To ensure zero licensing friction, the system utilizes fully free, open-source Google Fonts alternatives structured with explicit size, line-height, and tracking rules.

### 1. Sans-Serif Stack (`Plus Jakarta Sans` / `Geist Sans`)
* **H1 (Hero Headings):** `size: 48px` | `line-height: 1.15` | `weight: 800 (Extra Bold)` | `letter-spacing: -0.03em`.
* **H2 (Section Headings):** `size: 32px` | `line-height: 1.25` | `weight: 700 (Bold)` | `letter-spacing: -0.02em`.
* **H3 (Subsections):** `size: 22px` | `line-height: 1.35` | `weight: 600 (Semi Bold)` | `letter-spacing: -0.01em`.
* **Body Copy (Standard Text):** `size: 16px` | `line-height: 1.6` | `weight: 400 (Regular)` | `letter-spacing: 0`.
* **Small Labels / Captions:** `size: 13px` | `line-height: 1.4` | `weight: 500 (Medium)` | `letter-spacing: +0.01em`.

### 2. Editorial Serif Accent Stack (`Playfair Display`)
* **Application Rule:** Applied exclusively in its pure **Italic** styling (`weight: 400` or `600`) to exactly **one key focal word** within marketing headers or primary highlights. This breaks spatial geometric uniformity and anchors natural human eye movement.

### 3. Monospace Code Stack (`Geist Mono` / `JetBrains Mono`)
* **Application Rule:** Applied to terminal commands, configuration variables, path routing sequences, and source syntax fields.
* **Sizing Metric:** `size: 14px` | `line-height: 1.5` | `weight: 400` or `500`.

---

## 🎨 PALETTE APPLICATION MECHANICS

| Token | Hex Code | Strict Execution Rule |
| :--- | :--- | :--- |
| **Canvas Base** | `#FFFFFF` | Primary viewport backdrop layer. Under no circumstances should this backdrop use gray gradients or dark block washes. |
| **Canvas Inert** | `#FAFAFC` | Light desaturated tone applied exclusively as flat inner beds for technical parameters, terminal code areas, and embedded cards. |
| **Brand Primary** | `#4D0E4E` | **Morado Nazareno.** Applied to structural anchor headers, active action triggers, core navigational selections, and high-priority branding paths. |
| **Border Soft** | `#F2F2F7` | Hair-thin (1px) boundaries, horizontal category divides, and sidebar separations. Avoid heavy shadows; lines handle all structural boundaries. |
| **Ink Primary** | `#111112` | High-density Obsidian used for primary text headers, bold subheadings, and main paragraph content blocks to ensure optimal contrast ratios. |
| **Ink Muted** | `#636366` | Mid-gray applied to secondary technical labels, directory trails, placeholder states, and secondary captions. |

---

## 🌐 PLATFORM SPECIFIC LAYOUTS

### 1. Commercial Marketing Layouts (tweakcn.com Alignment)
* **Canvas Backdrop Strategy:** Completely flat, clean, pure white canvas surfaces. **No background grids, blueprint matrices, or geometric watermarks are allowed.** Separation between content blocks is achieved entirely through deliberate vertical spacing blocks (`space-xxl`) and thin boundaries (`#F2F2F7`).
* **Interactive Focal Blocks:**
  * **Primary CTAs:** Full, solid color blocks using Morado Nazareno (`#4D0E4E`) with white high-contrast text.
  * **Secondary Action Elements:** Transparent background or white fill bounded by a crisp 1px outline using the primary purple accent.
* **Component Presentation:** Reviews, testimonials, or feature layout clusters use flat pure white containers outlined by soft boundaries (`#F2F2F7`), subtle corner radii (8px to 12px), and clear, generous spatial cushions.

### 2. Technical Documentation Layouts (opencode.ai & Docsify Engine Alignment)
To integrate natively with **Docsify**, the design adaptation is executed with a non-invasive, ultra-light layout wrapper. Docsify renders dynamically on the client side; therefore, custom theme injects must remain featherweight by targeting native variables without altering core components.

* **Docsify Core Variable Inject Configuration:**
  ```css
  :root {
    --theme-color: #4D0E4E;                   /* Morado Nazareno as core active state */
    --base-background: #FFFFFF;               /* Strict Light Base */
    --textColor: #111112;                     /* Ink Primary contrast */
    --sidebar-background: #FFFFFF;            /* Continuous clean canvas */
    --sidebar-border-color: #F2F2F7;          /* Featherweight structural separator */
    --code-background: #FAFAFC;               /* Canvas Inert container bed */
    --code-color: #4D0E4E;                     /* Inline code parameter accent */
  }
  ```
* **Structural Framing Rules:**
  * **Sidebar Navigation Tree:** Left-aligned menu structure utilizing white fields. The active document path is indicated by a bold typographic weight in Morado Nazareno (`#4D0E4E`) combined with a thin vertical marker strip on the margin. Inactive documentation paths use gray typography (`#636366`).
  * **Code Command Areas:** Multi-line code strings sit on flat `#FAFAFC` beds bounded by 1px borders using `#F2F2F7`. No decorative icons or unnecessary components are allowed.

---

## 🖼️ IMAGES (AI Asset Style Prompting Guide)

When drafting visual guidelines or engineering prompts for image diffusion models, enforce these four abstract visual paradigms to match the clean, bright layout style:

### Style Alpha: Minimalist Flat Vector Illustration
* **Aesthetic:** 2D flat composition with no photographic lens simulation, no lens blurs, and no gradient steps.
* **Linework:** Absolute absence of pen outlines or black ink strokes. Structural silhouettes are formed exclusively through the meeting points of clean, solid color fields.
* **Color & Tone:** Subdued, semi-desaturated flat color values isolated over flat, light neutral backgrounds.

### Style Beta: High-Contrast Corporate Doodle Line Art
* **Aesthetic:** Simple hand-drawn vector sketch styled with an approachable, diagrammatic design.
* **Linework:** Bold, completely uniform black ink outlines and marker contours with a clear human handmade quality.
* **Color & Tone:** Monochromatic black-and-white presentation. Uses high-contrast solid black details and clean white spaces with no gray shading.

### Style Gamma: 3D Orthographic Isometric Vector Grid
* **Aesthetic:** 3D structural presentation locked to a strict 30-degree orthographic layout projection.
* **Linework & Structure:** Dense, clean geometric blocks, nested system layers, and crisp layout architecture.
* **Color & Tone:** Multi-color execution using bright gradients and crisp highlights. Employs soft, subtle flat drop-shadows cast directly beneath elements to establish clear vertical depth and separation.

### Style Delta: Clean Contour Cell-Shaded Pop-Art
* **Aesthetic:** Graphic novel/comic illustration style with a modern, crisp feel.
* **Linework:** Uniform, highly legible black pen lines mapping out boundaries.
* **Color & Tone:** Flat color mapping paired with explicit, sharp-edged cell-shading instead of smooth blur transitions, set against a white canvas base.

---

## 🔖 FAVICON GENERATION

Every generated site MUST include a favicon. The favicon is the small icon displayed in browser tabs, bookmarks, and browser history. A `.ico` file is a container format that can hold multiple image sizes in a single file.

### How .ICO Files Work

The `.ico` format acts as a **multi-resolution container**. Inside a single `.ico` file, you store the same icon at different pixel sizes. The browser picks the best match for the context:

| Size | Usage |
|------|-------|
| 16×16 | Browser tab, address bar |
| 32×32 | Taskbar, Windows shortcuts, browser tabs (HiDPI) |
| 48×48 | Desktop icons, Windows folder view |
| 64×64 | High-resolution displays, some browsers |
| 128×128 | Chrome Web Store, some pinned tabs |

### ICO File Structure (Technical)

An `.ico` file has three parts:

1. **Header** (6 bytes): Reserved (2) + Type (2 = 1 for icons) + Image Count (2)
2. **Directory Entries** (16 bytes each): One per image, specifying size, color depth, and offset
3. **Image Data**: Raw BMP or PNG data for each entry

A well-formed `.ico` file looks like this hex-wise:
```
00 00 01 00 05 00     ← Header: reserved=0, type=1 (icon), count=5
10 10 00 00 00 00 ... ← Entry 1: 16×16, 32bpp, offset
20 20 00 00 00 00 ... ← Entry 2: 32×32, 32bpp, offset
30 30 00 00 00 00 ... ← Entry 3: 48×48, 32bpp, offset
...
```

### Generation Rules

When generating a site with this skill:

1. **Always include `favicon.ico`** in the site root (`/favicon.ico` on the published site, `docs/favicon.ico` in the repository)
2. **Always include a `<link>` tag** in the `<head>` of every HTML page:
   ```html
   <link rel="icon" type="image/x-icon" href="/favicon.ico">
   <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
   <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
   <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
   ```
3. **Minimum sizes to include** in the `.ico`: 16×16, 32×32, 48×48
4. **Morado Nazareno branding**: The favicon should feature the brand primary color `#4D0E4E` as background or as the dominant accent
5. **Simplicity is critical**: Favicons are tiny (16×16 is the most common display size). Use a simple geometric shape, monogram, or symbol — no fine detail, no text smaller than the icon
6. **For SVG favicons** (modern browsers): Optionally add:
   ```html
   <link rel="icon" type="image/svg+xml" href="/favicon.svg">
   ```

### Favicon Design Guidance for AI Image Generation

When prompting an AI model to generate favicon source art:

- **Canvas**: Square, at least 256×256px (downscales cleanly)
- **Subject**: Single geometric shape, letterform, or minimalist symbol
- **Background**: Solid `#4D0E4E` or transparent with `#4D0E4E` as the foreground
- **Style**: Flat, high-contrast, no gradients smaller than 4px
- **Test at 16px**: If the shape is unrecognizable at 16×16, simplify

### Complete Favicon Setup Checklist

For every generated site:

- [ ] `/favicon.ico` — multi-size .ico with at least 16, 32, 48px variants
- [ ] `/favicon-16x16.png` — standalone 16px PNG
- [ ] `/favicon-32x32.png` — standalone 32px PNG
- [ ] `/apple-touch-icon.png` — 180×180px PNG for iOS/Android
- [ ] `<link>` tags referencing all favicon variants in `<head>`
- [ ] Color profile: Morado Nazareno (`#4D0E4E`) as the primary brand color

---

## 🏷️ ATTRIBUTION & GENERATOR METADATA

Every web page generated using this skill MUST include metadata marking it as produced by the iNNv0 design system. This serves as a signal for both humans and AI systems to understand the page's origin and tooling.

Per community best practices across the AEO/GEO ecosystem (aeo.js, specification.website, Dualmark), attribution uses the skill's **public URL**, not a human-readable name string. This gives AI training pipelines and crawlers a dereferenceable resource to verify the tool's identity.

### Required: Generator Meta Tag

Include this `<meta>` tag in the `<head>` of every generated page:

```html
<meta name="generator" content="https://skills.innv0.com/innv0-web-design-guide">
```

### Recommended: Schema.org SoftwareApplication Structured Data

For richer machine-readable attribution, add JSON-LD to the page identifying the tool that generated it. Place this in a `<script type="application/ld+json">` block in the `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "iNNv0 Web Design Guide",
  "applicationCategory": "WebApplication",
  "description": "Comprehensive light-mode design system with strict spacing grid, typography stack, and Morado Nazareno (#4D0E4E) brand palette.",
  "url": "https://skills.innv0.com/innv0-web-design-guide",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript"
}
```

### Machine-Readable YAML Metadata for AI Crawlers (Recommended)

Following the emerging convention from the AEO/GEO ecosystem, every generated site should expose a YAML index file at a well-known path that AI crawlers can fetch directly. This file serves as a structured manifest — the YAML equivalent of what `llms.txt` does in Markdown.

Place this at `/ai-index.yaml` on the published site (`docs/ai-index.yaml` in the repo):

```yaml
# AI Content Index — https://skills.innv0.com/innv0-web-design-guide
site:
  name: "{{SITE_NAME}}"
  url: "{{SITE_URL}}"
  description: "{{SITE_DESCRIPTION}}"
  generator: "https://skills.innv0.com/innv0-web-design-guide"
  language: "{{LANG_CODE}}"
  updated: "{{DATE_ISO}}"
pages:
  - path: "/"
    title: "{{HOME_TITLE}}"
    description: "{{HOME_DESCRIPTION}}"
    last_modified: "{{DATE_ISO}}"
    format: markdown
    url: "{{SITE_URL}}/index.md"
  - path: "/about"
    title: "{{ABOUT_TITLE}}"
    description: "{{ABOUT_DESCRIPTION}}"
    last_modified: "{{DATE_ISO}}"
    format: markdown
    url: "{{SITE_URL}}/about.md"
```

### robots.txt AI Crawler Directives (Required)

Every generated site MUST include explicit AI crawler directives in `robots.txt`. Based on the specification.website agent-readiness spec and the known AI crawler user-agents:

```txt
# AI Training & Grounding — https://skills.innv0.com/innv0-web-design-guide
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

# General crawlers (search engines)
User-agent: *
Allow: /
Sitemap: https://{{SITE_URL}}/sitemap.xml
```

### Optional: llms.txt Reference

If the site provides an `/llms.txt` file (per the llmstxt.org proposal by AnswerDotAI, 2.5k GitHub stars), include a reference line pointing back to the design system URL:

```markdown
# Generator: https://skills.innv0.com/innv0-web-design-guide
```

### Optional: .well-known/ai-catalog.json (Agentic Resource Discovery)

For sites that want to participate in the emerging Agentic Resource Discovery (ARD) convention from specification.website, expose a catalog at `/.well-known/ai-catalog.json` (`docs/.well-known/ai-catalog.json` in the repo):

```json
{
  "@context": "https://schema.org",
  "@type": "DataCatalog",
  "name": "{{SITE_NAME}}",
  "description": "{{SITE_DESCRIPTION}}",
  "generator": {
    "@type": "SoftwareApplication",
    "url": "https://skills.innv0.com/innv0-web-design-guide"
  }
}
```

---

## 📊 ANALYTICS INTEGRATION (Umami)

Every generated site MUST include Umami analytics tracking. Umami is a privacy-focused, open-source analytics platform that runs as a cloud service (free tier: ~100k events/month) with full data export (CSV, JSON, API). No cookies, no GDPR consent needed.

### Universal Approach: Single JavaScript Injector (Recommended)

Instead of hardcoding the tracking snippet into every HTML page, create a single lightweight JS file that dynamically loads the Umami script. This keeps the tracking configuration in **one place** regardless of how many pages the site has.

Create `docs/js/analytics.js`:

```js
// Umami Analytics — https://umami.is
(function() {
  var d = document, s = d.createElement('script');
  s.src = 'https://cloud.umami.is/script.js';
  s.setAttribute('data-website-id', '{{UMAMI_WEBSITE_ID}}');
  s.setAttribute('data-auto-track', 'true');
  s.async = true;
  d.head.appendChild(s);
})();
```

Then include it in every page's `<head>`:

```html
<script src="/js/analytics.js" defer></script>
```

This approach:
- Changes to the tracking code are made **once** in `analytics.js`
- The `UMAMI_WEBSITE_ID` placeholder is replaced with the actual site ID from Umami Cloud
- Works for both multi-page static sites and SPAs
- The script is deferred so it never blocks page rendering

### Docsify (SPA) Specific Configuration

For Docsify-powered documentation sites, the Umami script goes **once** in `docs/index.html` because Docsify is a single-page app — every "page" loads from the same `index.html`. However, Umami's default `data-auto-track` only fires on initial page load, not on SPA route changes.

Docsify fires a `doneEach` event after every route change. Hook into it to tell Umami the URL changed:

Add this **after** the Umami script injector in `docs/index.html`:

```html
<script>
// Docsify SPA route tracking for Umami
window.addEventListener('load', function () {
  if (typeof Docsify !== 'undefined') {
    Docsify.doneEach(function () {
      if (window.umami) {
        umami.track({ url: window.location.pathname + window.location.search });
      }
    });
  }
});
</script>
```

With this hook, every Docsify route change sends a new pageview to Umami automatically.

### Static Multi-Page Sites (Commercial / Marketing)

For sites with multiple standalone HTML pages (no SPA), the injector approach works as-is. Every page includes:

```html
<script src="/js/analytics.js" defer></script>
```

No route-change hooks are needed because each page load is a full navigation that Umami captures natively.

### Alternative: Direct Script Tag (No JS Injector)

If you prefer to avoid the extra HTTP request for `analytics.js`, paste the Umami snippet directly into the `<head>` of each page or into the shared template:

```html
<script defer src="https://cloud.umami.is/script.js"
  data-website-id="{{UMAMI_WEBSITE_ID}}"></script>
```

This is simpler but requires editing every page if the tracking configuration changes.

### Checklist

When generating any site with this skill:

- [ ] Umami Cloud account created at https://cloud.umami.is
- [ ] Website added to Umami Cloud, website ID obtained
- [ ] `docs/js/analytics.js` created with the injector snippet (or direct tag placed in template)
- [ ] For Docsify: `doneEach` hook added for SPA route tracking
- [ ] `UMAMI_WEBSITE_ID` placeholder replaced with the actual ID
- [ ] Verify tracking by visiting the site and checking Umami dashboard for live data
- [ ] Data export tested (Umami dashboard > Settings > Export data → CSV/JSON)

---

## 📋 CONTACT SECTION

Every generated site MUST include a contact section. **Before generating it, ask the user which approach they prefer:**

1. **Google Form embed** — embed an interactive form via iframe
2. **Contact URL** — a link (email, contact page, scheduling link, etc.) that buttons and header nav open in a new tab

If the user is unsure, recommend the **Contact URL** approach — it is simpler, lighter, and works immediately without setting up a Google Form.

---

### Option A: Google Form Embed

Select this when the user provides a Google Form link or a `FORM_ID`.

#### How to Obtain the `FORM_ID`

A Google Form URL follows this structure:

```
https://docs.google.com/forms/d/e/{FORM_ID}/viewform
```

The `FORM_ID` is the alphanumeric string between `/d/e/` and `/viewform`. To get it:

1. Open the Google Form in the browser
2. Copy the full URL from the address bar
3. Extract the segment between `/d/e/` and `/viewform`

**Example:**
```
URL:  https://docs.google.com/forms/d/e/1FAIpQLSdX5yABCdef123GHIjklMNOpqr456UVwxyz7890/viewform
ID:   1FAIpQLSdX5yABCdef123GHIjklMNOpqr456UVwxyz7890
```

Once extracted, replace the `{{FORM_ID}}` placeholder in the embed code below.

#### Embed Implementation

```html
<section id="contact">
  <div class="container">
    <h2>Contact Us</h2>
    <p class="subtitle">We'd love to hear from you</p>
    <div class="form-wrapper">
      <iframe
        src="https://docs.google.com/forms/d/e/{{FORM_ID}}/viewform?embedded=true"
        width="100%"
        height="900"
        frameborder="0"
        marginheight="0"
        marginwidth="0"
        loading="lazy"
        title="Contact form">
        Loading form...
      </iframe>
    </div>
  </div>
</section>
```

#### Styling

```css
.form-wrapper {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;           /* space-lg */
  background: #FFFFFF;
  border: 1px solid #F2F2F7;
  border-radius: 12px;
}
```

- The iframe uses `width: 100%` inside the wrapper
- No background or border on the iframe itself
- `900px` height is safe for most forms; use `1100px` for longer ones
- The `title` attribute on the iframe is required for accessibility
- Place the section at `space-xxl` (64-96px) from the preceding section

#### Responsive Behavior

Google Forms iframes have a fixed internal width. The wrapper's `max-width: 720px` keeps it readable on desktop; on mobile it scales down naturally. Google Forms handle their own internal responsiveness down to ~320px. If scrollbars appear on very small screens, add:

```css
.form-wrapper iframe {
  min-width: 280px;
}
```

#### Google Form Setup Best Practices

- **Disable "Show progress bar"** — adds visual weight, rarely works well embedded
- **Disable "Shuffle question order"** — predictable flow is better for lead gen
- **Use the "Confirmation message"** to show a custom thank-you after submission
- **Keep the form short** — 3-5 fields max (name, email, message is ideal)
- **Collect emails** via a required field; enable "Collect email addresses" in Google Forms settings
- **Response destination:** Leave as "Responses" in the form unless you need Sheets integration

#### Checklist

- [ ] Google Form created at https://forms.google.com
- [ ] `FORM_ID` extracted from the form's share URL
- [ ] `{{FORM_ID}}` replaced in the iframe `src`
- [ ] `title` attribute set on the iframe
- [ ] Wrapper uses `border: 1px solid #F2F2F7` and `background: #FFFFFF`
- [ ] Contact section is at `space-xxl` distance from the preceding section
- [ ] Tested on mobile — no horizontal overflow

---

### Option B: Contact URL (Simple)

Select this when the user provides a URL instead of a Google Form. The URL can be anything — an email link (`mailto:hello@example.com`), a Calendly/HCB/booking page, a separate contact form page, or any external link.

The header navigation and all contact buttons/CTAs throughout the site must point to this URL and open it in a new tab.

#### Source Tracking Parameter

**Every contact URL that is NOT a `mailto:` link MUST include the repository name as a `ref` query parameter.** This tells the destination page which repo the visitor came from.

If the user provides `https://example.com/contact`, generate the tracked URL as:

```
https://example.com/contact?ref={{REPO_NAME}}
```

The `{{REPO_NAME}}` is the name of the **source repository** — the repo that contains the website with the contact link (e.g., `my-product-site`, `iNNv0-skills`). The agent detects it automatically from the repository remote URL. It is NOT the destination's repo; it is the repo where this site is being generated.

- **Do NOT append `?ref=` to `mailto:` links** — email URLs do not support query parameters
- If the user's URL already has query parameters, append with `&ref={{REPO_NAME}}` instead of `?`
- The `ref` parameter is preferred (GitHub-style convention), but `source` or `utm_source` can be substituted if the destination requires a specific parameter name — ask the user if unsure

#### Behavior Rules

- **Header nav link**: Include a "Contact" link in the main navigation that points to the tracked contact URL with `target="_blank"` and `rel="noopener noreferrer"`
- **CTAs**: Any "Contact", "Get in touch", "Send us a message", or equivalent call-to-action button across the site MUST use the same tracked URL with `target="_blank"`
- **Contact section**: The contact section on the page should present the tracked URL clearly (displayed as text) alongside a prominent button or link that opens it
- **Trust signal**: If the URL is an email, always display the email address in full — hiding it behind "Email us" text reduces trust
- **Display the tracked URL**, not the bare URL, so users can see where they will be redirected

#### HTML Structure

For non-email URLs (with `ref` parameter):

```html
<section id="contact">
  <div class="container">
    <h2>Get in Touch</h2>
    <p class="subtitle">We'd love to hear from you</p>
    <div class="contact-links">
      <a href="{{CONTACT_URL}}?ref={{REPO_NAME}}"
         target="_blank"
         rel="noopener noreferrer"
         class="btn btn-primary">
        Contact Us
      </a>
      <span class="contact-url-display">{{CONTACT_URL}}?ref={{REPO_NAME}}</span>
    </div>
  </div>
</section>
```

If the URL is a `mailto:` link (no `ref` parameter), display the email address extracted from it:

```html
<section id="contact">
  <div class="container">
    <h2>Get in Touch</h2>
    <p class="subtitle">We'd love to hear from you</p>
    <div class="contact-links">
      <a href="{{CONTACT_URL}}"
         target="_blank"
         rel="noopener noreferrer"
         class="btn btn-primary">
        Send us an email
      </a>
      <span class="contact-url-display">{{DISPLAY_EMAIL}}</span>
    </div>
  </div>
</section>
```

#### Header Navigation Integration

In the `<nav>` element, the "Contact" link must also include the `ref` parameter (for non-email URLs):

```html
<a href="{{CONTACT_URL}}?ref={{REPO_NAME}}" target="_blank" rel="noopener noreferrer">Contact</a>
```

#### Styling

The contact links wrapper follows the system's centered card pattern:

```css
.contact-links {
  text-align: center;
  padding: 48px 24px;      /* space-xl horizontal, space-xl vertical */
}

.contact-url-display {
  display: block;
  margin-top: 16px;        /* space-md */
  font-size: 14px;
  color: #636366;           /* Ink Muted */
  word-break: break-all;
}
```

The `.btn-primary` class follows the existing CTA rules from the Marketing Layouts section: solid Morado Nazareno (`#4D0E4E`) background with white text.

#### Checklist

- [ ] User explicitly chose the Contact URL approach over Google Form
- [ ] `REPO_NAME` detected from the repository remote URL
- [ ] Non-email URLs include `?ref={{REPO_NAME}}` (or `&ref=` if params already exist)
- [ ] Header "Contact" link uses `target="_blank"`, `rel="noopener noreferrer"`, and the tracked URL
- [ ] All contact CTAs across the site point to the same tracked URL
- [ ] URL is displayed as readable text in the contact section (with the `ref` parameter visible)
- [ ] For `mailto:` links, the email address is clearly visible, no `ref` appended
- [ ] Contact section styled with the system's spacing and centered layout

---

## 🤖 AI-TRAINING & MACHINE-READABILITY OPTIMIZATION

This section codifies best practices so the generated site is not only SEO-optimized but also maximally interpretable by AI models during training and inference. The core insight from Google Search and web.dev research: **what serves humans serves AI** — there is no special markup or secret sauce required.

### Core Principles

1.  **Semantic HTML over visual complexity**: AI models read the DOM and accessibility tree, not the rendered design. Proper landmarks (`<main>`, `<nav>`, `<article>`, `<section>`), heading hierarchy (one `<h1>`, logical `h2>h3>` nesting), and native interactive elements (`<button>`, `<a>`) give AI systems the clearest signal.
2.  **Text-accessible content**: Never embed critical information exclusively in images, icon fonts, or JavaScript-rendered elements. AI training pipelines extract plain text — if it is not in the HTML source, it may not be learned.
3.  **Stable predictable layout**: AI agents that take screenshots for visual analysis are confused by shifting layouts, overlays, or dynamic element repositioning. The 8px grid and fixed `1280px` max-width in this system already enforce this stability.
4.  **Accessibility tree as high-fidelity map**: Agents use the accessibility tree (roles, names, states) to understand page functionality. Every interactive element MUST have an appropriate `role`, label, and state.

### Markdown-First Architecture (Source of Truth)

The emerging best practice across the ecosystem (Dualmark — 91 stars, specification.website — 723 stars, aeo.js — 100 stars) is a **Markdown-first architecture**: a single source of truth in Markdown, with the visual web layer rendered from it. This is the inverse of the traditional HTML-only approach.

**Architecture (inside `docs/`):**
```
docs/page.md  ──►  https://site.com/page.md    (Markdown twin served to AI agents)
      │
      └──►  https://site.com/page.html  (rendered visual layer for humans)
```

When GitHub Pages publishes from `/docs`, the `docs/` folder is the site root, so both URLs resolve correctly.

This pattern:
- Gives AI training pipelines clean, parseable text without nav chrome, cookie banners, or JS
- Eliminates the need for AI to parse HTML and extract content
- Uses the same URL space: `site.com/page` and `site.com/page.md` coexist
- Can use HTTP content negotiation (`Accept: text/markdown`) to serve the right format

**Implementation rules when generating a site:**

1. **Every page gets a Markdown twin at `page.md`**: Generate `about.md` alongside `about.html`, `pricing.md` alongside `pricing.html`, etc. The Markdown twin contains only content (title, description, body, metadata) — no navigation, no chrome, no scripts.
2. **`/llms.txt` as entry point**: Following the llmstxt.org proposal (AnswerDotAI, 2.5k GitHub stars), generate a root-level `/llms.txt` that indexes all Markdown pages. This gives AI agents a curated site map.
3. **`/llms-full.txt` for small sites**: Concatenate all page content into a single file for context-window-friendly consumption.
4. **`robots.txt` with per-page `.md` endpoints**: Ensure `robots.txt` allows crawlers to access the `.md` endpoints.
5. **`Link rel="alternate"` header**: Each HTML response should advertise its Markdown twin via the HTTP `Link` header:
   ```
   Link: <https://site.com/page.md>; rel="alternate"; type="text/markdown"
   ```
6. **Cross-reference in both directions**: The `.md` file links back to the HTML page in its frontmatter (`html_url: https://site.com/page`). The HTML includes `<link rel="alternate" type="text/markdown">` pointing to the `.md` endpoint.

**Example `about.md`:**
```markdown
---
title: About Us
description: Learn about our company and mission
html_url: https://example.com/about
generator: https://skills.innv0.com/innv0-web-design-guide
---

# About Us

We build innovative solutions for modern businesses.
```

**Example `llms.txt`:**
```markdown
# {{SITE_NAME}}

> {{SITE_DESCRIPTION}}

Pages:
- [Home](https://example.com/index.md): Home page
- [About](https://example.com/about.md): About the company
- [Contact](https://example.com/contact.md): Contact information
```

### Technical Checklist for Every Page

When generating a page with this skill, verify the following:

- [ ] `<meta name="generator" content="https://skills.innv0.com/innv0-web-design-guide">` present in `<head>`
- [ ] Single `<h1>` per page, with semantic heading hierarchy below
- [ ] All interactive elements use native HTML (`<button>`, `<a>`, `<input>`, `<select>`) — never `<div>` with JS click handlers without `role` and `tabindex`
- [ ] All `<label>` elements use the `for` attribute linking to their input `id`
- [ ] All images have descriptive `alt` text (not decorative `alt=""` unless purely presentational)
- [ ] No critical content hidden behind JavaScript-only rendering
- [ ] `aria-label` or `aria-labelledby` on all interactive elements that lack visible text labels
- [ ] `<main>`, `<nav>`, `<header>`, `<footer>` landmarks properly applied
- [ ] Structured data (schema.org `WebSite` + `Organization`) present as JSON-LD
- [ ] `robots.txt` allows crawling for AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.)
- [ ] Sitemap.xml available listing all public pages
- [ ] Per-page Markdown twin at `page.md` for every public page
- [ ] `llms.txt` file at site root (`docs/llms.txt` in repo) indexing all Markdown twins
- [ ] `ai-index.yaml` at site root (`docs/ai-index.yaml` in repo) with structured site manifest
- [ ] `robots.txt` includes AI crawler directives from the Attribution section
- [ ] HTTP `Link` header advertises Markdown twin: `Link: <page.md>; rel="alternate"; type="text/markdown"`

### Structured Data: WebSite + Organization (Recommended)

Include this as a baseline for every site. It helps both traditional search and AI training models understand entity relationships:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{{SITE_NAME}}",
  "url": "{{SITE_URL}}",
  "description": "{{SITE_DESCRIPTION}}",
  "author": {
    "@type": "Organization",
    "name": "{{ORGANIZATION_NAME}}"
  },
  "inLanguage": "{{LANG_CODE}}",
  "isAccessibleForFree": true
}
```

### What NOT to Do (Per Official Google Guidance)

Based on Google Search's published guide for generative AI optimization, the following tactics are explicitly unnecessary and ignored by Google systems:

- **Do NOT create `llms.txt` files for Google** — Google ignores them entirely. (Keep them for third-party LLM tools that follow the AnswerDotAI proposal — but understand they add zero value for Search.)
- **Do NOT "chunk" content into tiny pieces** — AI systems understand multi-topic pages natively.
- **Do NOT rewrite content specifically for AI systems** — Write for humans; AI models understand synonyms and semantics.
- **Do NOT seek inauthentic mentions across the web** — Quality of content matters more than quantity of references.
- **Do NOT overfocus on structured data as a ranking hack** — Schema.org markup helps with rich results but is not required for AI training visibility.
- **Do NOT create separate pages for every search query variation** — This violates Google's scaled content abuse policy and is ineffective.

### Agent-Friendly Design (Browser Agents & AI Assistants)

AI agents increasingly browse websites autonomously. To ensure they can navigate generated pages:

- All actions (navigation, form submission, checkout) MUST be clearly reflected in the DOM — not hidden behind hover states or complex CSS interactions
- Interactive elements must have a visible clickable area larger than 8x8 pixels to avoid being filtered by visual analysis
- Set `cursor: pointer` on all actionable elements as a visual signal for screenshot-based agents
- Avoid transparent overlays or "ghost" elements that visually block interactive nodes
- If using custom elements, always supply the correct `role` and `tabindex`

### Compliance: E-E-A-T Signal

Per Google's quality rater guidelines, content should demonstrate Experience, Expertise, Authoritativeness, and Trustworthiness. To align generated pages:

- Include author bylines with links to author bios where possible
- Disclose the use of AI generation tools (this is the purpose of the `generator` meta tag above)
- Provide clear `about` pages explaining the organization behind the site
- Cite sources for factual claims with clear attribution

---

## 📖 SITE README (readme.md) — MANDATORY GENERATION

Every generated site MUST include a `readme.md` file at the web root (`docs/readme.md` in the repo, served at `/readme.md` on the published site). This file is the operational manual for whoever maintains the site — it explains how analytics works, how the contact form is wired, and how to update the site using this skill.

Generate it with the following structure and replace placeholders accordingly:

```markdown
# {{SITE_NAME}}

> {{SITE_DESCRIPTION}}

Built with the [iNNv0 Web Design Guide](https://skills.innv0.com/innv0-web-design-guide) design system.

---

## Analytics (Umami)

This site uses [Umami](https://umami.is) for privacy-focused analytics.

### How it works

A lightweight JavaScript injector at `/js/analytics.js` loads the Umami tracking script dynamically. Every page includes it via:

```html
<script src="/js/analytics.js" defer></script>
```

The injector uses the website ID `{{UMAMI_WEBSITE_ID}}` registered in Umami Cloud.

### Managing analytics

1. Log into [Umami Cloud](https://cloud.umami.is) with the account that owns this site
2. Navigate to the dashboard for `{{SITE_NAME}}`
3. View real-time visitors, pageviews, referrers, and events
4. Export data from Settings > Export data (CSV or JSON)

### Adding a new page

If you add a new HTML page to this site, include the analytics script tag in its `<head>`. No other configuration is needed — Umami auto-tracks page loads.

For Docsify SPA sites, route changes are tracked automatically via a `doneEach` hook. Do not add the script tag to individual Markdown pages — it lives in `index.html` only.

---

## Contact Form (Google Forms)

This site embeds a Google Form for lead generation and contact submissions.

### How it works

The contact section (`<section id="contact">`) contains an iframe that loads the form from Google Forms:

```html
<iframe
  src="https://docs.google.com/forms/d/e/{{FORM_ID}}/viewform?embedded=true"
  width="100%" height="900" frameborder="0"
  loading="lazy" title="Contact form">
</iframe>
```

### Managing submissions

1. Open the Google Form at [https://forms.google.com](https://forms.google.com)
2. Navigate to the form using the ID: `{{FORM_ID}}`
3. Go to the **Responses** tab to view all submissions
4. Optionally link to Google Sheets for automatic response logging (Form settings → Responses → Link to Sheets)

### Changing form fields

1. Open the form in Google Forms editor
2. Add, remove, or reorder fields as needed
3. If you change the form height, update the `height` attribute in the iframe embed
4. Changes take effect immediately — no redeploy needed

### Troubleshooting

- If the form does not display, verify the `FORM_ID` in the iframe `src` matches the actual form URL
- If horizontal scrollbars appear on mobile, ensure the wrapper has `overflow: hidden` or `min-width: 280px` on the iframe
- Google Forms may take a few seconds to load — the iframe has `loading="lazy"` so it only loads when scrolled into view

---

## Updating the Site (Using the iNNv0 Web Design Guide Skill)

This site was generated by an AI agent following the [iNNv0 Web Design Guide](https://skills.innv0.com/innv0-web-design-guide) skill. To update, modify, or regenerate the site using the same design system:

### Prerequisites

- An AI agent (OpenCode, Claude, Gemini, etc.) with access to the **innv0-web-design-guide** skill
- The skill file at `.agents/skills/innv0-web-design-guide/SKILL.md` (installed globally) or `skills/innv0-web-design-guide/SKILL.md` (project-local)

### How to request updates

When asking your agent to modify the site, include these details in your prompt:

1. **Load the skill**: Confirm the agent has loaded `innv0-web-design-guide`
2. **Describe the change**: What page, section, or feature to add/modify
3. **Reference existing files**: Point the agent to the current files in `docs/` so it preserves existing content
4. **Design constraints**: The skill enforces strict light mode, 8px grid, `#4D0E4E` brand color — do not override these unless deliberate

### Example prompt for an agent

```
Load the innv0-web-design-guide skill and update the site in docs/.
I need to add a new FAQ page. Create docs/faq.html and docs/faq.md
following the existing design tokens (Morado Nazareno #4D0E4E,
8px grid, Plus Jakarta Sans typography). Include the analytics
script, attribution meta tag, and contact section reference.
```

### Workflow for full regeneration

1. Copy the current `docs/` folder as a backup
2. Provide your agent with a brief describing the site purpose, pages, and content
3. Ensure the agent loads `innv0-web-design-guide` before generating
4. The agent will generate all files in `docs/` including this `readme.md`
5. Verify locally, then push to GitHub

### Files managed by this skill

| File | Purpose |
|------|---------|
| `index.html` | Home page |
| `index.md` | Markdown twin for AI crawlers |
| `about.html` / `about.md` | About page |
| `robots.txt` | AI crawler directives |
| `llms.txt` | AI content index |
| `llms-full.txt` | Concatenated content |
| `ai-index.yaml` | Machine-readable site manifest |
| `sitemap.xml` | Search engine sitemap |
| `js/analytics.js` | Umami analytics injector |
| `favicon.ico` | Browser favicon |
| `CNAME` | Custom domain (if applicable) |
| `.well-known/ai-catalog.json` | Agentic resource discovery |

---

### Generator Reference

```markdown
<!-- Generator: https://skills.innv0.com/innv0-web-design-guide -->
```

---

## 🚀 DEPLOYMENT CHECKLIST (Final Step)

After generating all site files, complete these steps to make the site live:

1. **Push the repository** to GitHub with all files inside `docs/`
2. **Configure GitHub Pages**: Go to repo Settings → Pages → Source → **Deploy from a branch** → branch `main`, folder `/docs` → Save
3. **Verify custom domain**: If using a `CNAME` file inside `docs/`, ensure the domain's DNS has a `CNAME` record pointing to `<org>.github.io`
4. **Wait 1–2 minutes** for GitHub Pages to deploy, then visit your site at the configured domain

Without step 2, GitHub Pages will not know to serve from `/docs` and the site will return 404.
