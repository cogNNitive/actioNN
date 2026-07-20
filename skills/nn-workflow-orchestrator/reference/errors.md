# Error Handling

| Situation | Message |
|-----------|---------|
| Skill not found | `Error: Skill [name] no encontrado. Verificá que el skill esté instalado. Workflow abortado.` |
| Stage no output | `Error: Stage [id] no generó output en [path]. Workflow abortado.` |
| Malformed workflow | `Error: Archivo workflow inválido: [reason].` |
| Stage failure | `Stage [id] falló: [details]. Workflow abortado.` → ask retry or abort |

**Fail-stop**: never skip a failed stage, never resume without consent, never modify previous outputs on failure.
