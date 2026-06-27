# innv0-trannsform — Manual Test Guide

Seguí estos pasos en orden en un proyecto nuevo con OpenCode. Cada paso verifica una parte del skill. Marcá ✅ cuando pase.

---

## Setup

```bash
# Creá una carpeta limpia para la prueba
mkdir ~/Documents/trannsform-test
cd ~/Documents/trannsform-test
```

Creá algunos archivos de prueba adentro:

**`informe.txt`**
```
La organización tenía 45 miembros activos en 2023.
La cobertura alcanzó el 78% de la población objetivo.
```

**`datos.csv`**
```
nombre,edad,rol
Ana,34,Coordinadora
Luis,28,Técnico
```

**`presentacion.docx`** (optional — solo si querés probar docx)

---

## Test 1: Instalación del skill

**Instrucción para OpenCode:**

> Instalá el skill `innv0-trannsform` en mi sesión. Buscalo en `~/.agents/skills/innv0-trannsform/SKILL.md` o en el repositorio `iNNv0_skills/skills/innv0-trannsform/`.

**Resultado esperado:** OpenCode carga el skill exitosamente.

---

## Test 2: Bootstrap de proyecto

**Instrucción para OpenCode:**

> Usando el skill innv0-trannsform, bootstrap un proyecto con los archivos de la carpeta actual como fuente. Nombre del proyecto: "test-docs".

**Resultado esperado:**
- ✅ OpenCode crea la estructura `test-docs/raw/`, `test-docs/md/`, `test-docs/traNNsformations/`, `test-docs/output/`
- ✅ Los archivos se copian a `test-docs/raw/`
- ✅ OpenCode no reporta errores

---

## Test 3: Scan y detección de formatos

**Instrucción para OpenCode:**

> Ejecutá el scan en el proyecto `test-docs` usando el CLI del skill.

**Resultado esperado:**
- ✅ OpenCode ejecuta `node scripts/index.js --scan --src test-docs`
- ✅ Aparece el resumen: "Discovered: X, Processed: Y, Skipped: Z"
- ✅ Se crea `test-docs/_index.md`
- ✅ Se crea `test-docs/md/informe.md` con el contenido del txt
- ✅ Se crea `test-docs/md/datos.md` con el contenido del csv
- ✅ Se crea `test-docs/md/_all.md` con ambos documentos consolidados

---

## Test 4: Transformación por el agente (LLM) — Draft

**Instrucción para OpenCode:**

> Ahora quiero generar un resumen en borrador de los documentos del proyecto. Usá el skill para hacer una transformación tipo "resumen" en formato draft.

**Resultado esperado:**
- ✅ OpenCode te pregunta qué tipo de transformación querés
- ✅ Elegís "Crear nueva" (o "Resumen" si lo oferta)
- ✅ OpenCode te pregunta si querés draft o versión definitiva
- ✅ Elegís "Borrador draft"
- ✅ OpenCode genera un archivo `output/[nombre]_draft.md`
- ✅ El draft incluye el encabezado `# BORRADOR PARA REVISIÓN — NO ES VERSIÓN FINAL`
- ✅ El draft incluye citas de fuente (ej: `— Fuente: informe.txt`)
- ✅ Si no está seguro de algún dato, incluye marcas como `[dato no confirmado — revisar]`

---

## Test 5: Transformación — Versión definitiva

**Instrucción para OpenCode:**

> Ahora generá una versión definitiva limpia del mismo resumen.

**Resultado esperado:**
- ✅ OpenCode te pregunta si querés incluir referencias a las fuentes
- ✅ Respondés que sí (o no)
- ✅ OpenCode genera `output/[nombre]_v_0-1-0.md`
- ✅ El archivo NO tiene marcas de draft ni anotaciones
- ✅ (Opcional) Incluye referencias a fuentes si dijiste que sí

---

## Test 6: Verificación de trazabilidad (solo si hay docx/pdf)

Si tenés un archivo docx o pdf en la carpeta fuente, al hacer el scan:

- ❓ ¿Aparece el panel de diagnóstico de formatos?
- ❓ ¿OpenCode te pregunta si querés procesarlo con Node.js o saltearlo?
- ❓ Si elegís Node.js, ¿instala la dependencia automáticamente?

---

## Test 7: Fallback del CLI transformer

**Instrucción para OpenCode:**

> Ejecutá el transformer de fallback del CLI con `node scripts/index.js --apply Generic_Normalizer --src test-docs`. Usá el template que está en examples/ o copialo a traNNsformations/ primero.

**Resultado esperado:**
- ✅ OpenCode copia `examples/traNNsformations/Generic_Normalizer.md` a `test-docs/traNNsformations/`
- ✅ OpenCode ejecuta el comando
- ✅ Se genera `output/Generic_Normalizer_[timestamp].md`

---

## Resumen de resultados

| Test | Descripción | Resultado |
|------|-------------|-----------|
| 1 | Instalación del skill | — |
| 2 | Bootstrap de proyecto | — |
| 3 | Scan y detección | — |
| 4 | Transformación Draft | — |
| 5 | Transformación Definitiva | — |
| 6 | Trazabilidad (si aplica) | — |
| 7 | Fallback CLI | — |
