---
name: innv0-router
description: Entry point for iNNv0 skills. Tells you which skill to use for what. Invoke with /innv0-router.
version: "1.0"
last_updated: 2026-07-12
license: MIT
compatibility: opencode
metadata:
  source_type: original
---

# iNNv0 Router

Pick what you need below.

---

## User-invoked (you type `/name`)

| Skill | When to use |
|---|---|
| `/innv0-dev-opencode-model-router` | No estás seguro de que el modelo actual sea el correcto para la tarea |
| `/innv0-skills-lifecycle` | Instalar, crear, auditar o mantener skills del ecosistema |
| `/innv0-trannsform` | Procesar documentos crudos (PDF, DOCX, XLSX, etc.) a Markdown |
| `/innv0-site-generator` | Crear o editar sitios web, agregar analytics o formularios de contacto |
| `/agent-web-bootstrap` | Arrancar el ecosistema iNNv0 desde una URL manifest (eNNvironment) |
| `/innv0-onboarding-wizard` | Wizard conversacional para crear un modelo iNNfo paso a paso |
| `/innv0-workflow-orchestrator` | Ejecutar o crear pipelines multi-skill con stages secuenciales |

## Model-invoked (se activan solos)

| Skill | Se activa cuando… |
|---|---|
| `innv0-innfo` | Trabajás con archivos iNNfo (`*_NN.md`, `*_FORMAT.md`) |
| `innv0-design-presets` | Trabajás con archivos web o de diseño |
| `agent-web-bootstrap` | El usuario escribe "usar eNNvironment", "bootstrap" o pasa una URL de manifest |
| `innv0-onboarding-wizard` | El usuario dice "crear un modelo", "nuevo modelo", "empezar un modelo" |
| `innv0-router` | El usuario escribe "innfo" en su prompt (dispara todo el ecosistema iNNfo) |

---

## Si no sabés por dónde empezar

Describime tu situación actual y te recomiendo el skill adecuado.
