---
name: innv0-trannsform
description: "Bootstrap projects, scan raw documents, normalize them to Markdown, and apply template-based transformations. Includes a Node.js CLI tool for document ingestion, format conversion (txt, md, csv, json, docx, pdf, xlsx), and transformation orchestration. Uses the agent's own LLM for the actual content transformation. Triggers: trannsform, transform, normalize, scan documents, document ingestion, document transformation, document processing, markdown conversion, project bootstrap"
license: MIT
metadata:
  version: "1.1"
  source_type: "integrated"
  source: "https://github.com/innV0/iNNv0_skills/tree/main/skills/innv0-trannsform"
  installed_at: "2026-06-27"
---

# Skill: innv0-trannsform

This skill enables the agent to interactively guide the user through document ingestion, normalization, and transformation.

All file paths in this skill are relative to the skill's base directory (e.g., `~/.agents/skills/innv0-trannsform/`). The CLI tool lives at `scripts/index.js`. If dependencies are missing at first use, the agent detects the error and runs `npm install` in the skill directory automatically.

## Interaction Flow for Agent Execution

### 1. Project Initialization & Bootstrap

Ask the user:
1. **Source Folder**: Where are the raw files?
2. **Project Name & Destination**: Name for the project and where to save it (recommend `Documents/traNNsform/[project-name]`).

Then run:
```bash
node scripts/index.js --src "<source-folder>" --dest "<destination-parent-folder>" --name "<project-name>"
```

### 2. Capability Scan & Ingestion

> **Filosofía**: Cada agente/modelo tiene capacidades nativas distintas. Algunos leen PDFs directamente, otros no. En lugar de asumir, el skill presenta un **panel de diagnóstico** con las rutas disponibles y sus tradeoffs, y el usuario decide.

#### 2a. Detect formats in source folder

Formatos soportados: `txt`, `md`, `csv`, `json`, `docx`, `pdf`, `xlsx`

Read the `raw/` folder, group files by extension, and show the user:
```
Formatos detectados en la carpeta fuente:
  - txt:  3 archivos
  - docx: 2 archivos
  - pdf:  1 archivo
```

#### 2b. Capability Assessment — Present the decision matrix

**IMPORTANTE**: Antes de preguntar qué hacer, presentá este cuadro de diagnóstico para cada formato detectado. El objetivo es que el usuario VEa el panorama completo.

```
╔════════════╦══════════════════════╦══════════════════════════╗
║  Formato   ║ Nativo del agente    ║ Librería Node.js         ║
╠════════════╬══════════════════════╬══════════════════════════╣
║ txt        ║ ✅ Lectura directa   ║ —                        ║
║ md         ║ ✅ Lectura directa   ║ —                        ║
║ csv/json   ║ ✅ Lectura directa   ║ —                        ║
║ pdf        ║ ⚠️  Depende del modelo║ pdf-parse (npm)         ║
║ docx       ║ ❌ No disponible      ║ mammoth (npm)           ║
║ xlsx       ║ ❌ No disponible      ║ xlsx (npm)              ║
╚════════════╩══════════════════════╩══════════════════════════╝
```

Luego, para cada formato detectado **que NO sea texto plano**, presentar al usuario UNA pregunta unificada por formato:

```
Formato: PDF (1 archivo)
  [a] Nativo del agente — puede o no funcionar según el modelo, costo variable en tokens
  [b] Node.js (pdf-parse) — instalación única (~2MB), procesamiento local, sin consumo extra de tokens
  [c] Saltear este formato

¿Qué ruta preferís para PDF? (a/b/c)
```

**Reglas para el agente al presentar esto:**

1. **Marca visual clara**: Si el agente sabe (por su propia configuración o porque preguntó antes) que PUEDE leer PDF nativamente, mostrar `[a]` como `✅ RECOMENDADO` si no implica costo extra, o `⚠️ Nativo (costo en tokens)` si el costo es significativo.
2. **Si el agente NO SABE** si puede leer el formato nativamente, decirlo explícitamente: _"No puedo garantizar que mi modelo lea PDFs nativamente. La opción más confiable es [b]."_
3. **La opción `[a]` SIEMPRE debe aclarar el tradeoff de tokens** (o tiempo de procesamiento) cuando corresponda.

#### 2c. Verify Node.js availability

Para la opción `[b]`, verificar disponibilidad antes de preguntar. Si Node.js no está disponible, mostrar la opción como `❌ No disponible`:

```bash
node --version
```

Si el comando falla o no hay shell disponible, informar: _"No puedo verificar si Node.js está instalado en este entorno. Si sabés que lo tenés, decime y lo intentamos."_

#### 2d. Execute the chosen strategy

Según la decisión del usuario para cada formato:

- **Opción `[a]`**: Leer el archivo directamente usando las capacidades de lectura del agente (Read tool, PDF nativo, etc.). El agente transforma el contenido a Markdown manualmente.
- **Opción `[b]`**: Si la librería no está instalada, preguntar confirmación y correr `npm install <package>` en la carpeta del skill (directorio base). Luego ejecutar el script de conversión.
- **Opción `[c]`**: Saltear el formato.

**Nota sobre instalación**: Si el usuario elige instalar una librería y falla (permisos, red, entorno), informar el error exacto y ofrecer volver al menú de opciones para elegir otra ruta.

#### 2e. Run the scan

```bash
node scripts/index.js --scan --src "<target-project-directory>"
```

Leer el `_index.md` generado. Si hay archivos marcados como `?` (docx, pdf) o `NO` (audio, imágenes), informar al usuario.

### 3. Transformation — Using the Agent's LLM

El skill **no depende de APIs externas** (Gemini, OpenAI). La transformación la realiza el propio agente usando su modelo de lenguaje incorporado. El CLI script `scripts/transformer.js` queda como fallback opcional.

**IMPORTANTE**: Antes de transformar, leé el contenido de `md/_all.md` y preguntá:

#### 3a. Check for local templates

Checkeá si hay archivos `*traNNsform.md` en la raíz del proyecto. Si hay, preguntá si quiere usar uno local o explorar otras opciones.

#### 3b. Select or create a template

Si no hay template local o el usuario prefiere otra opción, preguntar: **"¿Querés aplicar una transformación existente o crear una nueva?"**

- **Aplicar existente**: Leer templates en `traNNsformations/`, listarlos, dejar elegir.
- **Crear nueva**: Guiar paso a paso (nombre, propósito, instrucciones, estructura, ubicación).

#### 3c. Ask version type — BEFORE transforming

Antes de generar el documento, preguntar:

**"¿Querés generar un borrador con comentarios y citas de fuentes para revisión, o una versión definitiva limpia?"**

- Si elige **borrador draft**: Se genera con todas las anotaciones, citas y marcas de revisión (ver punto 4). Nombre del archivo: `[template-name]_draft.md`.
- Si elige **versión definitiva**: Se genera limpio, sin anotaciones. Preguntar además: **"¿Querés incluir referencias a las fuentes en la versión definitiva?"** Nombre del archivo: `[template-name]_v_0-1-0.md` (semver, empezando en 0.1.0).

#### 3d. Perform the transformation (agent does it, not external API)

1. Leer el template y `md/_all.md`.
2. Usando tu propio LLM como agente, generar el documento transformado siguiendo las instrucciones del template y las reglas de versión (draft o definitiva).
3. Escribir el archivo en `output/` con el nombre correspondiente.
4. Presentar el resultado al usuario.

Si por alguna razón no podés generar el contenido (contexto demasiado grande, etc.), informá al usuario y ofrecé como fallback ejecutar el transformer.js del CLI:
```bash
node scripts/index.js --apply "<template-name>" --src "<target-project-directory>"
```

### 4. Contenido del borrador _draft con trazabilidad de fuentes

Cuando el usuario elige **borrador draft**, el archivo `_draft.md` debe incluir:

#### Encabezado obligatorio

El documento debe comenzar con:

```markdown
# BORRADOR PARA REVISIÓN — NO ES VERSIÓN FINAL
```

#### Citas de fuente por afirmación

Cada dato, cifra o conclusión debe llevar la referencia al documento fuente del que se extrajo. Usar el nombre del archivo fuente (sin ruta) como identificador:

```markdown
La organización tenía 45 miembros activos en 2023.
— Fuente: IF Narrativo GV22BO-1, sección IOE.1
```

```markdown
La cobertura alcanzó el 78% de la población objetivo.
— Fuente: Transcripciones T11, entrevista Etelvina
```

#### Anotaciones de revisión en formato Markdown

Usar bloques de nota de GitHub Flavored Markdown:

```markdown
> [!NOTE] Revisar: este dato proviene de una fuente parcial. Contrastar con otras fuentes.
```

```markdown
> [!WARNING] No confirmado en otras fuentes. Verificar con la MML original.
```

```markdown
> [!TIP] Esta conclusión surge del cruce de tres fuentes independientes.
```

#### Marcas de incertidumbre

Cuando un dato no esté claro o la fuente sea ambigua:

```markdown
[dato no confirmado — revisar]
```

```markdown
[estimación propia — contrastar con fuentes oficiales]
```

```markdown
[fecha aproximada — verificar]
```

### 5. Naming Convention Summary

| Tipo | Sufijo | Ejemplo |
|------|--------|---------|
| Draft | `_draft.md` | `Resumen_Bandas_draft.md` |
| Definitiva | `_v_0-1-0.md` | `Resumen_Bandas_v_0-1-0.md` |
| Definitiva (siguiente versión) | `_v_0-2-0.md` | `Resumen_Bandas_v_0-2-0.md` |
