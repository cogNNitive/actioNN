---
name: nn-innfo
version: "V_0-3-0"
last_updated: 2026-08-07
metadata:
  source_type: "original"
  mcp: "innfo-mcp"
license: MIT
description: |
  MANDATORY trigger: MUST activate this skill whenever the user types "NN", "nn", or is creating, editing, validating, scaffolding, or discussing any iNNfo model, template, specialization, sample, or specification file. Includes the conversational Model Creation Wizard and Architecture Coach.
  This includes but is not limited to:
  - Creating a new model step-by-step using templates (Business, Procedures, Organization, Blank)
  - Creating or editing any file matching *_NN.md
  - Authoring or modifying business models, procedure models, or any model following an iNNfo template
  - Creating, editing, or modifying templates or specializations under docs/templates/
  - Discussing the iNNfo V_0-3-0 specification, meta-templates, primitives, matrices, or naming conventions
  - Any conversation about how iNNfo works, how to use it, or how to structure iNNfo files
---

# iNNfo Skill

> **ACTIVATION = GREETING REQUIRED**: When this skill is loaded, the agent MUST greet the user. See Greeting Protocol below.

This skill guides LLMs and agents in authoring, creating from scratch (wizard), editing, auditing, and validating **iNNfo-compliant files** (V_0-3-0 Meta-template specification with unified `NN` syntax: `# NN`, `## NN`, and `key:: value`).

**Resolution, validation, and mutation are delegated to the `innfo-mcp` server** — a deterministic engine wrapping `@cognnitive/innfo-core`. The agent does NOT hand-resolve spec chains, hand-validate models, or guess syntax when the MCP is available. See §1 (MCP Operating Model) and §7 (Delegation Contract).

---

## 0. Entry Menu & Conversational Model Creation Wizard

### 0a. Entry Menu (initial options)

When the skill is activated or the user is undecided about what to do, present the entry menu:

- **[a] (Recomendado)** Create a new model (Wizard conversacional)
- **[b]** Edit / extend an existing model
- **[c]** Validate a model with MCP
- **[d] Analizar coherencia y solidez (Coach de Arquitectura)** — audit the model across formal, logical, semantic, and solidity layers (§8c)
- **[x]** Cancel / help

*Nota: Podés seleccionar una opción o una combinación si aplica.*

---

### 0b. Descubrimiento Proactivo (Opción A)

If the user wants to create a model but is unsure which template fits best:

1. Ask 2-3 brief diagnostic questions:
   - ¿El objetivo es estructurar un modelo de negocio/propuesta de valor, un proceso operativo paso a paso, o una estructura organizacional/equipo?
   - ¿Contás con documentos fuente en `sources/markdown/` para extraer información o partimos desde cero?
2. Recommend the optimal template with a 1-sentence technical justification and mark option `[a]` with `(Recomendado)`.

---

### 0c. Model Creation Wizard & Co-creación Incremental (Opción B)

When the user asks to "create a new model", "start a model from scratch", or selects option [a]:

1. **Template Selection**: Present available Level 2 templates:
   - **[a] (Recomendado)** Business Model 🏢
   - **[b]** Procedures Model 📋
   - **[c]** Organization Model 👥
   - **[d]** Blank Model ⬜
   - **[x]** Cancel
   *(Nota: Podés seleccionar una opción o una combinación si aplica)*.

2. **Modalidad de Co-creación (Incremental vs Batch)**:
   Ofrecer la modalidad de generación antes de redactar el código:
   - **[a] (Recomendado) Co-creación Paso a Paso:** Definimos primero los conceptos clave e interactuamos concepto por concepto.
   - **[b] Generación Completa:** El agente DEBE solicitar al usuario que describa textualmente el procedimiento, proceso o entidad que desea modelar. Una vez recibida la descripción, se genera el borrador completo en un solo archivo para posterior auditoría.

3. **Model Naming & Scaffolding**:
   Prompt for `{ModelName}` and create `{ModelName}_V_0-1-0_{Template}_NN.md` with workspace structure (`models/`, `sources/markdown/`, `procedures/`, `artifacts/`, `index.md`).

4. **Validation & Visual Checklist**:
   Validate via `innfo-mcp_validate_model` and output the Visual Expectation Checklist (§12).

---

## Greeting Protocol (MANDATORY)

When this skill is activated, the agent MUST print exactly:

```
🔧 You're using skill: nn-innfo (🧠)
```

as its very first output — before any questions, analysis, or tool calls. Session-scoped: only once per conversation. After the greeting, proceed with the capabilities relevant to the current request.

---

## Core Concepts & Single Source of Truth

> [!NOTE]
> **El servidor MCP (`innfo-mcp`) y las especificaciones canónicas son la ÚNICA fuente de verdad (SSOT) para la sintaxis y tipos de datos.** El agente NO duplica reglas gramaticales de memoria; las consulta dinámicamente vía MCP (`innfo-mcp_get_spec` / `innfo-mcp_get_template`).

### Resumen de Niveles iNNfo (V_0-3-0)

| Nivel | Rol | Sintaxis y Estructura |
|---|---|---|
| **0** | Meta-especificación (`defiNNe`) | Define las meta-reglas de especificación. |
| **1** | Especificación Concreta (`iNNfo`) | Metaplantilla Nivel 1. Define las 4 primitivas raíz (`Concept Definition`, `Field Definition`, `Matrix Definition`, `Marker Definition`). |
| **2** | Plantilla (Template / Especialización) | Documento iNNfo con frontmatter ligero (`level: 2`). El cuerpo instancia las 4 primitivas raíz como elementos Markdown. **PROHIBIDO poner `concepts: []` o `fields: []` en el YAML frontmatter.** |
| **3** | Modelo de Datos | Instancia los conceptos y campos definidos por su plantilla madre (`parent_spec`). |

---

## 1. MCP Operating Model

El servidor `innfo-mcp` expone 8 herramientas deterministas basadas en `@cognnitive/innfo-core`.

| Herramienta | Propósito |
|---|---|
| `list_models` | Escanea el directorio buscando modelos iNNfo válidos. |
| `read_model` | Parsea un modelo a AST / JSON estructurado. |
| `get_spec` | Resuelve dinámicamente la especificación Nivel 1. |
| `get_template` | Resuelve dinámicamente la plantilla Nivel 2 y sus primitivas. |
| `validate_model` | Ejecuta la validación sintáctica y de esquema determinista (con diagnostico `(searched: ...)` cuando la cadena de padres no resuelve). |
| `validate_model_url` | Valida un modelo desde una URL sin escribirlo en disco. |
| `validate_template` | Valida una plantilla Nivel 2 contra su especificación Nivel 1 madre. |
| `apply_change` | Ejecuta mutaciones deterministas (agregar campo, renombrar, `bump_version`, etc.). |

**Regla de Oro:** La URL de la especificación/plantilla siempre proviene de `parent_spec.url` o del usuario. Nunca hardcodear ni inventar URLs.

---

## 2. Indicación Canónica de Especificaciones

URLs estables `latest` de referencia:
- **iNNfo (Nivel 1):** `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level1/iNNfo_NN.md`
- **Business (Nivel 2):** `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/business/business_NN.md`
- **Procedures (Nivel 2):** `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/procedures/procedures_NN.md`
- **Organization (Nivel 2):** `https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/organization/organization_NN.md`

### Regla de `parent_spec.url` en Modelos Nivel 3

1. `parent_spec.url` de un modelo Nivel 3 debe ser una URL **ESTABLE (http/https)** que apunte a la plantilla Nivel 2, o un **path relativo al workspace** (ej. `specs/MiPlantilla_V_0-1-0_spec_NN.md`).
2. **PROHIBIDO usar paths absolutos de Windows** (ej. `C:/Users/.../MiPlantilla_spec_NN.md`): rompen la resolución en el Modeler (fetch sobre ruta local) y en el MCP. El resolver local busca la plantilla en `specs/`, `.specs/` y `.spec-cache/` del workspace; la forma canónica es la URL http estable.
3. Después de fijar `parent_spec.url`, verificar SIEMPRE la resolución (ver §5, pre-chequeo de cadena de padres) antes de dar por listo el modelo.
4. **Los paths relativos se resuelven contra la raíz del servidor MCP** (la variable de entorno `INNFO_MODELS_DIR` o el cwd del proceso al iniciar el server), NO contra la carpeta del archivo del modelo. Por lo tanto, para validar un workspace con paths relativos, la raíz del MCP DEBE ser la raíz del workspace; los overrides `root:` solo aplican donde la herramienta los acepta (`validate_model` con `root`, `get_spec`/`get_template` con `url`).
5. **El resolver AUTO-CACHEA cada padre resuelto** (local o remoto) en `<workspace>/.spec-cache/`. NO copiar plantillas manualmente a esa carpeta: si una resolución falla, la corrección es arreglar la raíz del MCP o la URL, no copiar archivos. `.spec-cache` es un cache derivado que el resolver regenera solo.

---

## 4. Protocolo de Proveniencia (`sources::`)

1. **Carácter Opcional:** `sources::` es una propiedad de trazabilidad **OPCIONAL**. No invalida sintácticamente un modelo de Nivel 3 si no está presente.
2. **Fuentes de Origen:** Las fuentes ingeridas se almacenan en la carpeta `sources/markdown/` (mismas subcarpetas que `sources/original/`, sin aplanar). No existe carpeta `raw/` ni sistema de IDs `src-xxx`.
3. **Gramática exacta:**
   ```
   sources:: <ref>
   sources:: [<ref>, <ref>, ...]

   <ref>  ::= sources/markdown/<ruta-relativa>.md( #<ancla> )?
   <ancla> ::= L<n> | L<n>-L<m>
   ```
   - `<ref>` es SIEMPRE una ruta que empieza con `sources/markdown/` y termina en `.md` — es la misma ruta que el archivo normalizado, nunca una ruta a `sources/original/` ni al documento fuente sin normalizar.
   - El ancla de línea es opcional. `L<n>` es una línea puntual, `L<n>-L<m>` un rango inclusive (ambos extremos incluidos), 1-indexado sobre el archivo `.md` citado — la misma numeración que ve un humano abriendo el archivo en un editor.
   - Sin ancla, la cita apunta al archivo completo. **Preferí citar el archivo completo antes que inventar un rango de líneas que no verificaste** — nunca adivines números de línea.
4. **Un solo valor va sin corchetes.** Los corchetes `[...]` se usan ÚNICAMENTE cuando hay 2 o más referencias — no envuelvas un valor único en `[...]`, es ruido visual innecesario:
   ```markdown
   ## NN Stakeholders: Cliente Enterprise
   sources:: [sources/markdown/entrevista_cliente.md#L15-L30, sources/markdown/notas.md#L4]
   relationship_model:: B2B Long-term

   ## NN Stakeholders: Cliente Piloto
   sources:: sources/markdown/notas.md#L20-L25
   relationship_model:: Trial
   ```
5. **Granularidad: a nivel de elemento, no de afirmación individual.** `sources::` cubre el conjunto de fuentes que respaldan TODO el elemento (todos sus campos en conjunto) — no hay mecanismo de cita por campo o por frase dentro de un modelo de dominio. Si distintos campos de un mismo elemento vienen de fuentes distintas, listá la unión de todas en el único `sources::` del elemento. La cita a nivel de afirmación individual (`<!-- cite: sources/markdown/<path>.md#L<n>-L<m>, section <nombre> -->`) es un mecanismo aparte, usado solo dentro de artefactos/drafts generados a partir del modelo (ver `nn-trannsform/SKILL.md` §4) — nunca dentro de un `*_NN.md`.
6. **Sin duplicados ni referencias vacías.** No repitas la misma `<ref>` dos veces en la misma lista. Si no hay ninguna fuente real que citar, omití el campo entero — no escribas `sources:: []` ni un valor placeholder.
7. **Instrucción Conversacional:** Si el proyecto cuenta con archivos en `sources/markdown/`, el agente debe sugerir incluir `sources::`. Si es un modelo greenfield/creativo desde cero, el agente NO solicita ni exige proveniencia. En ambos casos aplica la regla general del skill: nunca inventés ni un `<ref>` ni un contenido que no esté verificablemente presente en el archivo citado.

---

## 5. Instrucciones de Operación y Flujo MCP

1. Obtener la plantilla con `innfo-mcp_get_template({ url })`.
2. Presentar los conceptos al usuario usando el formato con `[a] (Recomendado)`.
3. Redactar el cuerpo usando la sintaxis unificada `# NN <Concept>`, `## NN <Concept>: <Element>`, `key:: value`.
4. Validar el modelo con `innfo-mcp_validate_model({ content })`.
5. **Pre-chequeo de cadena de padres (OBLIGATORIO antes de reportar listo):** resolver la cadena de padres con `innfo-mcp_get_template({ model_id })` (o `{ url }`) ANTES de declarar el modelo como listo. Si la plantilla NO se resuelve (`Template could not be resolved` / `PARENT_RESOLUTION_FAILED`):
   - NO reportar el modelo como listo.
   - Avisar que el template quedó sin resolver, mostrando el `parent_spec.url` problemático.
   - Leer el nuevo diagnóstico accionable `(searched: ...)` que devuelven `validate_model` / `get_template`: lista los directorios donde el resolver buscó el padre. Si los directorios buscados se ven mal (por ej. no apuntan a la raíz del workspace), el problema es la **raíz del MCP** (`INNFO_MODELS_DIR` o cwd del server), no el modelo: corregir la raíz/URL y revalidar (ver §2, regla 4).
   - Ofrecer corregirlo: URL estable http/https o path relativo al workspace (nunca path absoluto de Windows — ver §2).
6. Al finalizar, mostrar el **Checklist de Expectativa Visual (§12)** y la sección de **Atajos de Navegación Contextual (§13)**.

#### Version bump atómico

Para subir la versión de un modelo Nivel 3, usar la operación `bump_version` del MCP — NO editar el frontmatter a mano:

```
innfo-mcp_apply_change({
  id: "<model_id>",
  op: "bump_version",
  args: { version: "V_0-5-0" } | { bump: "patch" | "minor" | "major" }
})
```

- Actualiza `model_version` en el frontmatter y **renombra el archivo del modelo atómicamente** (validate-before-write: si el resultado no valida, no escribe).
- `bump_version` SOLO toca el archivo del modelo y su frontmatter — NO toca la plantilla ni el `index.md`.
- **Checklist manual restante después del bump:** (1) renombrar la plantilla Nivel 2 si su versión también subió, (2) sincronizar `.spec-cache/` si el resolver cachea el padre por nombre/versión (dejar que el resolver lo regenerue — no copiar a mano, ver §2 regla 5), (3) actualizar el enlace en el `index.md` del workspace si cambió el nombre físico del archivo (ver §10).

---

## 6. Seguridad en Renombrados e Integridad Referencial

Cuando se requiere renombrar un Concepto o Elemento:
* **Delegación al MCP:** El agente NO realiza reemplazos manuales por búsqueda y sustitución a ciegas. Utiliza la herramienta `innfo-mcp_apply_change` con la operación de renombrado correspondiente (`rename_concept` o `rename_element`) para garantizar la actualización determinista de WikiLinks `[[Concepto]]`, matrices y referencias cruzadas.

---

## 7. Contrato de Delegación y Fallback

* **Con MCP disponible:** NUNCA resolver especificaciones a mano ni validar manualmente. Delegar en `innfo-mcp_get_spec`, `innfo-mcp_validate_model` y `innfo-mcp_apply_change`.
* **Modo Fallback (Sin MCP):** Inspeccionar archivos locales en disco y validar que se cumpla la sintaxis `# NN`, `## NN`, `key:: value` y el frontmatter YAML ligero de Nivel 3.

---

## 8. Protocolo de Creación de Campos y Preview de Cambios (Opción D)

Todo campo debe declarar un `type` explícito (`string`, `select`, `reference`, `markdown_inline`, `number`, `date`, `file`, `image`, `video`, `audio`).

### Preview de Cambios con Diff (Opción D)
Antes de ejecutar cualquier cambio o mutación en el modelo, el agente DEBE presentar un breve resumen en lenguaje natural del cambio propuesto:

```markdown
📋 Preview del Cambio Propuesto:
- Concepto objetivo: Stakeholders
- Campo nuevo: presupuesto (tipo: number)
- Rationale: Almacenar el presupuesto asignado anualmente

¿Procedemos a aplicar esta modificación?
- [a] (Recomendado) Confirmar y aplicar cambio
- [b] Modificar tipo de dato o configuración
- [x] Cancelar
```

Al confirmar el usuario, ejecutar la mutación vía `innfo-mcp_apply_change` y re-validar con `innfo-mcp_validate_model`.

---

## 8b. Protocolo de Campos de Activos e Imágenes

* **Tipo Explícito:** Usar siempre `type:: image` para rutas o URLs de imágenes (nunca `string`).
* **Reglas de Especificación:** La regla de resolución de imagen principal (Rule 1) y la gramática del campo companion libre `<campo>_metadata` con citaciones CSL-JSON en una sola línea están normadas oficialmente en la Especificación Nivel 1 (`iNNfo_NN.md`).
* **Interacción del Agente:** Si el usuario incluye imágenes o activos con información de atribución, el agente sugiere incluir el campo `<campo>_metadata` con la cita CSL-JSON correspondiente.

---

## 8c. Análisis de Coherencia y Solidez — Modo "Coach de Arquitectura" (Opción C)

Cuando el usuario elige la opción `[d]` (Analizar coherencia), el agente asume el rol de **Coach de Arquitectura**:

1. Carga el modelo (`read_model`) y su plantilla (`get_template`).
2. Evalúa las 4 capas: **Corrección Formal**, **Coherencia Lógica**, **Coherencia Semántica** y **Solidez/Robustez**.
3. **Presentación con Impacto Funcional (Coach Mode):**
   No solo lista errores técnicos; explica el **riesgo de negocio/funcional** y ofrece la **solución en 1 clic**:

```markdown
🧠 Diagnóstico del Coach de Arquitectura:

1. ⚠️ [Coherencia Lógica] Referencia Rota
   - Hallazgo: El elemento `Cliente Enterprise` referencia a `DirectorComercial` que no existe.
   - Impacto Funcional: Romperá los enlaces del árbol de navegación en iNNfo Modeler.
   - Solución sugerida: Crear el elemento `DirectorComercial` o corregir el nombre.

¿Deseás que aplique la corrección recomendada automáticamente?
- [a] (Recomendado) Aplicar corrección sugerida
- [b] Ver detalle de otros hallazgos
- [x] Ignorar por ahora
```

---

## 8d. Protocolo de Relaciones y Sintaxis WikiLink en Campos Referenciales

Existen **4 formas formales de relación** en iNNfo (`hierarchy`, `evaluable_matrix`, `graph_edge`, `sequence`) y dos mecanismos de vinculación cruzada (campos `reference` y menciones contextuales):

1. **Jerarquía Taxonómica (`hierarchy`)**: Se declara **únicamente** mediante el anidamiento de listas con WikiLinks en el `# NN index` (`* [[Padre]]` -> `  * [[Hijo]]`).
2. **Campos Referenciales (`reference`)**: Cuando un campo tiene `type:: reference` en su definición de plantilla, su valor en el modelo Nivel 3 **DEBE encerrarse obligatoriamente entre corchetes WikiLink `[[...]]`** (ej. `location:: [[Salón-Comedor]]`). NUNCA escribir el valor como texto plano (`location:: Salón-Comedor`), ya que impide la detección del enlace entrante (*incoming reference*) en el editor.
3. **Relaciones N-a-M Evaluables (`evaluable_matrix`)**: Se expresan en bloques `# NN matrices:` para relaciones complejas o puntuadas entre conceptos.
4. **Menciones Contextuales**: Se escriben como WikiLinks `[[Elemento]]` dentro de la descripción en prosa Markdown.

**Instrucción al Wizard / Co-creación**: Durante la creación o edición de un modelo, el agente DEBE orientar o consultar al usuario según cómo desee estructurar las relaciones (jerarquía en `# NN index`, campo referencial `[[...]]` o matriz N-a-M).

---

## 9. Estrategia de Especializaciones

Cuando un modelo requiere conceptos o campos personalizados fuera de la plantilla base:
1. **NUNCA modificar** especificaciones publicadas en `specs/`.
2. Crear un archivo de plantilla de especialización `<Modelo>_<Plantilla>_V_x-y-z_spec_NN.md` con `level: 2`.
3. Apuntar la propiedad `parent_spec.url` del modelo Nivel 3 hacia el archivo de especialización.
4. **El `index.md` del workspace lista SOLO modelos Nivel 3.** Un archivo `_spec_NN.md` (plantilla Nivel 2 / especialización) NO debe listarse como modelo en `index.md`: se resuelve como plantilla vía `parent_spec.url` y se renderiza como nodo `spec:`, nunca como modelo del árbol de navegación.

---

## 10. Validación y Versionado Post-Edición

Tras editar un modelo:
1. Ejecutar `innfo-mcp_validate_model()`.
2. Presentar resultado y menú de versión:
   - **[a] (Recomendado)** Incrementar Patch (`V_x-y-z+1`)
   - **[b]** Mantener versión actual (`V_x-y-z`)
   - **[c]** Incrementar Minor (`V_x-y+1-0`)
   - **[x]** Cancelar
3. Actualizar enlaces en `index.md` si cambia el nombre físico del archivo.

---

## 11. Decisión de Escalado de Arquitectura (1 a N Modelos)

Cuando el proyecto escala a múltiples sub-modelos, presentar las **4 Alternativas Estructurales**:

```markdown
💡 Selección de Arquitectura de Escalado (1 a N Modelos):

  [a] (Recomendado) Opción 4: Híbrido Maestro Agregador con referencias `file_ref::`
      - Archivos: `models/Master_V_0-1-0_NN.md` y `models/subsystems/`
      - Código iNNfo: El modelo principal referencia subsistemas mediante `file_ref:: ./subsystems/auth_V_0-1-0_NN.md`

  [b] Opción 1: Modelo Monolítico Único
      - Archivo: `models/System_V_0-1-0_NN.md`

  [c] Opción 2: Modelos Independientes en la misma carpeta
      - Archivos: `models/DomainA_V_0-1-0_NN.md`, `models/DomainB_V_0-1-0_NN.md`

  [d] Opción 3: Híbrido Multi-Carpeta por Proyecto
      - Archivos: `projects/domainA/models/index.md`, `projects/domainB/models/index.md`

  [x] Cancelar

*(Nota: Podés seleccionar una opción o una combinación si aplica)*
```

---

## 12. Checklist de Expectativa Visual (App Verification)

Al finalizar la creación o modificación de un modelo, el agente DEBE imprimir el Checklist Visual:

```markdown
📋 Checklist de Expectativa Visual en iNNfo Modeler (https://innfo.cognnitive.com/app/):

Al abrir la carpeta del proyecto en el Modeler, vas a visualizar:

- [ ] 🌳 **Árbol Lateral de Navegación**:
      Estructura jerárquica basada en `# NN index` con navegación fluida por conceptos y elementos.
- [ ] 📋 **Paneles de Campos por Concepto**:
      Vista detallada renderizada para cada `key:: value` (propiedades, tipos y referencias).
- [ ] 🎴 **Tarjetas de Elementos**:
      Tarjetas interactivas por cada bloque `## NN <Concept>: <Element>` mostrando metadatos y descripciones.
- [ ] 📊 **Tablas de Matrices Comparativas**:
      Tablas N-a-M de relaciones e `item-markers matrix` renderizadas con celdas interactivas (`X` / `-`).
```

---

## 13. Atajos de Navegación Contextual / Quick Actions (Opción E)

Al concluir la generación o edición de un modelo, el agente DEBE incluir atajos lógicos según el contexto actual. Al finalizar la creación de un nuevo modelo, la primera opción DEBE ser la revisión guiada:

```markdown
📌 Siguientes pasos sugeridos:
- [a] (Recomendado) Revisión guiada de conceptos y elementos generados
- [b] Ejecutar auditoría del Coach de Arquitectura ([d])
- [c] Editar o agregar un nuevo concepto/elemento
```

---

## Core Rules

1. **Meta-plantilla Estricta V_0-3-0:** Las plantillas Nivel 2 definen primitivas en el cuerpo (`# NN Concept Definition`). NUNCA colocar `concepts: [...]` o `fields: [...]` en el YAML frontmatter de Nivel 2.
2. **Sintaxis Unificada NN:** Usar `# NN <Concept>`, `## NN <Concept>: <Element>`, `key:: value`. No usar viñetas obsoletas `_NN` ni bloques de código ````yaml`.
3. **Proveniencia Opcional y Actualizada:** `sources::` es opcional y apunta a archivos en `sources/markdown/` (admite lista `[a, b]` para múltiples valores; sin IDs `src-xxx` ni carpeta `raw/`).
4. **Cero Mutación Unilateral:** Nunca renombrar ni mover archivos sin confirmación explícita.
5. **Opción Recomendada Primero:** Prefijar la opción `[a]` con `(Recomendado)`.
6. **Notación de Selección Múltiple:** Incluir *"Podés seleccionar una opción o una combinación"* cuando aplique.
7. **Preview de Cambios con Diff:** Mostrar resumen en lenguaje natural antes de aplicar cualquier mutación con el MCP.
8. **Modo Coach de Arquitectura:** En la auditoría `[d]`, explicar riesgos de negocio/funcionales y ofrecer soluciones en 1 clic.
9. **Atajos Contextuales:** Finalizar cada respuesta ofreciendo 2-3 acciones siguientes sugeridas (Quick Actions).
10. **Delegación Total al MCP:** Consultar tipos, esquemas y validación al servidor `innfo-mcp`; no adivinar ni duplicar la gramática.
11. **Sintaxis WikiLink Obligatoria en Referencias:** En todo campo referencial (`type:: reference`), el valor DEBE ser formateado usando la sintaxis WikiLink (`key:: [[Elemento]]`). Queda prohibido usar texto plano sin corchetes WikiLink.

