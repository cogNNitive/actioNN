# actioNN Skills

<p align="center">
  <img src="logo.svg" alt="actioNN Logo" width="360">
</p>

**Modular AI Agent skills ecosystem for [OpenCode Desktop](https://opencode.ai).**

actioNN is a collection of self-contained, domain-specialized skills that teach your AI agent to solve specific types of tasks — from model evaluation and document transformation to web design and skills lifecycle management. Each skill is an autonomous module with its own triggers, instructions, and behavior rules.

[View site](https://actionn.cognnitive.com) · [Documentation](https://actionn.cognnitive.com/documentation/) · [Report issue](https://github.com/cogNNitive/actioNN/issues)

---

## Skills

<!-- skills:start -->

| Skill | Invocation | Description |
|---|---|---|
| **[nn-design-presets](./skills/nn-design-presets/)** | Automatic | Reference for cogNNitive visual design presets — palettes, typography, spacing, and branding tokens. Use when building or styling web pages, documentation sites, or marketing pages. |
| **[nn-innfo](./skills/nn-innfo/)** | Automatic | MANDATORY trigger: MUST activate this skill whenever the user is creating, editing, validating, scaffolding, or discussing any iNNfo model, template, specialization, sample, or specification file. Includes the conversational Model Creation Wizard. |
| **[nn-router](./skills/nn-router/)** | `/nn-router` | Central system governance, setup, environment readiness gate (Preflight), and skill router for cogNNitive. Triggers: /nn-router, router, bootstrap, setup, preflight, "I want to use https://cognnitive.com/use". |
| **[nn-site-generator](./skills/nn-site-generator/)** | `/nn-site-generator` | Create or edit websites, add analytics, or add contact forms. Invoke with /nn-site-generator. |
| **[nn-skills-lifecycle](./skills/nn-skills-lifecycle/)** | `/nn-skills-lifecycle` | Install, create, audit, and maintain cogNNitive skills. Entry point for the skill ecosystem. Invoke with /nn-skills-lifecycle. |
| **[nn-trannsform](./skills/nn-trannsform/)** | Automatic | Bootstrap projects, scan raw documents, normalize them to Markdown, apply template-based transformations, and execute multi-step transformation procedures compliant with procedures_V_0-2-0_NN.md. Includes document ingestion, format conversion (txt, md, csv, json, docx, pdf, xlsx), procedure orchestration, and export generation. Triggers: trannsform, transform, workflow, pipeline, procedure, normalize, scan documents, document ingestion, document transformation, document processing, markdown conversion, project bootstrap |

<!-- skills:end -->
