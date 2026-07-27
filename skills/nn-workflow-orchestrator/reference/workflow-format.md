# Transformation Procedure Specification Format (`procedures_V_0-2-0_NN.md`)

> ⚠️ **Deprecación del spec ad-hoc `workflow_V_1-0-0`**:
> Las especificaciones de workflows previamente ad-hoc han sido consolidadas en el estándar oficial de iNNfo: **`procedures_V_0-2-0_NN.md`**.
> Todas las transformaciones se definen ahora como procedimientos guardados en la carpeta `procedures/` (ej: `procedures/[Nombre]_V_1-0-0_procedures_NN.md`).

## Canonical Spec Format (`procedures_V_0-2-0_NN.md`)

```yaml
---
specification_version: "V_0-2-0"
specification_url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/v0.2.0/level2/procedures/procedures_V_0-2-0_NN.md"
level: 3
parent_spec:
  name: "procedures_V_0-2-0"
  url: "./procedures_V_0-2-0_NN.md"
title: "<procedure-name>"
model_version: "V_1-0-0"
---

> [!NOTE]
> This is an **iNNfo document** — a plain-text Markdown file.

# <procedure-name>

## # _NN Work
* _NN Work: <step-id>
  ```yaml
  step_type: "task" # task, decision, event
  parent: null
  next: "<next-step-id>"
  input: "raw/<file>"
  output: "artifacts/exports/<file>"
  tool: "nn-trannsform"
  ```

## # _NN Artifact
* _NN Artifact: <artifact-name>
  ```yaml
  type: "export" # model, export, report
  path: "artifacts/exports/<file>"
  ```

## # _NN Tools
* _NN Tools: <tool-name>
  ```yaml
  type: "skill" # skill, script, mcp
  source: "skills/nn-trannsform/SKILL.md"
  ```

## # _NN Roles
* _NN Roles: <role-name>
  ```yaml
  scope: "internal"
  ```

## # _NN matrices: work-tools matrix
| Work \ Tools | <tool-name> |
| :--- | :---: |
| <step-id> | Uses |

## # _NN matrices: work-artifacts matrix
| Work \ Artifact | <artifact-name> |
| :--- | :---: |
| <step-id> | Creates |

## # _NN matrices: work-roles matrix (RACI)
| Work \ Roles | Agente | Usuario |
| :--- | :---: | :---: |
| <step-id> | Responsible | Accountable |
```

## Body with `_NN` markers

```markdown
# _NN Workflow
Workflow description.

# _NN Stage
* _NN Stage: <stage-id>
  ```yaml
  skill: "<skill-name>"
  template: "<template-name>"
  input: "<input-path>"
  output: "<output-path>"
  ```

# _NN SkillRef
* _NN SkillRef: <skill-name>
  ```yaml
  source: "skills/<skill-name>/SKILL.md"
  version: "latest"
  ```

# _NN ArtifactType
* _NN ArtifactType: <artifact-type>
  ```yaml
  description: "<description>"
  ```

# _NN matrices: stage-skill matrix
| Stage \ Skill | <skill-name> |
| :--- | :---: |
| <stage-id> | X |

# _NN matrices: stage-artifact matrix
| Stage \ Artifact | <artifact-type> |
| :--- | :---: |
| <stage-id> | <output-status> |
```

## Parsing

1. Read YAML frontmatter between `---`
2. Find sections by `_NN` markers: `Stage`, `SkillRef`, `ArtifactType`
3. Parse list items: `* _NN Stage: <label>` → YAML from fenced code block
4. Parse matrix tables under `# _NN matrices:`
