---
name: innv0-web-design-guide
description: Comprehensive light-mode design system with strict spacing grid, typography stack (Plus Jakarta Sans, Playfair Display, Geist Mono), and Morado Nazareno (#4D0E4E) brand palette. Covers Docsify theming, marketing CTAs, and AI image style prompting.
license: MIT
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

## 🖼️ IMÁGENES (AI Asset Style Prompting Guide)

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
