# iNNv0 — Documentación

**iNNv0** es un ecosistema de **skills** para agentes de IA en [OpenCode](https://opencode.ai). Cada skill es un módulo autónomo que le enseña al agente a resolver un tipo específico de tarea con conocimiento de dominio.

## Skills incluidos

| Skill | Versión | Propósito |
|---|---|---|
| [Model Router](skills/opencode-model-router.md) | 1.0.0 | Evalúa si el modelo de IA es adecuado para cada tarea |
| [Skills Manager](skills/skills-manager.md) | 1.0 | Administra el ciclo de vida de los skills del repositorio |
| [traNNsform](skills/trannsform.md) | 1.1 | Pipeline de ingestión y transformación de documentos |
| [Web Design Guide](skills/web-design-guide.md) | — | Sistema de diseño light-mode con paleta Morado Nazareno |

## Instalación

```bash
git clone https://github.com/lucasventurini/iNNv0_skills.git
cd iNNv0_skills
opencode .
```

El **Skills Manager** se activa automáticamente al iniciar sesión. Escanea el directorio `skills/`, detecta los skills disponibles y te guía en la instalación usando **junctions de Windows NTFS**, que reflejan cambios del repo en vivo.

## Filosofía

- **CONCEPTOS > CÓDIGO**: entender el fundamento antes de escribir una línea
- **Skills atómicos**: cada skill resuelve un problema específico sin acoplarse a otros
- **Persistencia con Engram**: las decisiones y descubrimientos sobreviven entre sesiones
- **Bilingüe**: frontmatter en inglés para el sistema, interacción en español rioplatense con el usuario

## Stack técnico

- **Runtime**: OpenCode (agente de IA conversacional)
- **Memoria persistente**: Engram
- **SO primario**: Windows (junctions NTFS para instalación)
- **Documentación**: Docsify + este sitio
