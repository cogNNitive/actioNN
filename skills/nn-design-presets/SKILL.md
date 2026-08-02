---
name: nn-design-presets
description: Reference for cogNNitive visual design presets — palettes, typography, spacing, and branding tokens. MUST be activated whenever generating visual components, web apps, HTML dashboard artifacts, or styled site pages.
license: MIT
compatibility: ">=1.0.0"
version: "V_1-1-0"
last_updated: 2026-08-02
metadata:
  source_type: original
---

# cogNNitive Design Presets

> **MANDATORY ACTIVATION**: This skill MUST be activated whenever creating or styling any visual component, web app, HTML dashboard artifact, or web document in the cogNNitive ecosystem.

Reference material — load on demand when generating visual artifacts or web files. Each preset in `presets/` defines a complete visual identity: palette, typography stack, spacing grid, and layout rules.

---

## Visual Style Selection Protocol

When generating a visual component or artifact, prompt the user for their preferred visual style before writing code:

```markdown
🎨 Visual Artifact Style Selection:

Which visual design style would you like to apply to this artifact/component?

  [a] (Recomendado) morado-nazareno — Brand primary #4D0E4E, strict light mode, 8px grid, Plus Jakarta Sans + Playfair Display
  [b] Sleek Dark Mode — High-contrast dark theme (#0F172A), vibrant cyan/violet accents, Inter font
  [c] Minimalist Glassmorphism — Translucent glass panels, subtle borders, backdrop-filter blur
  [d] Custom preset — Specify custom colors, typography, or branding tokens

*(Nota: Podés seleccionar una opción o una combinación)*
```

---

## Available Presets

- [`morado-nazareno`](presets/morado-nazareno.md) — Brand primary `#4D0E4E`, strict light mode, 8px grid, Plus Jakarta Sans + Playfair Display

Browse the `presets/` directory for the full list. When a user or workflow creates a visual artifact, read the relevant preset and apply its tokens.
