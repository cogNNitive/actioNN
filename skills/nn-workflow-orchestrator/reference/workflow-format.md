# Workflow File Format

## Frontmatter

```yaml
spec_version: "V_0-2-0"
spec_url: "https://raw.githubusercontent.com/cogNNitive/iNNfo/v0.1.5/specs/iNNfo_V_0-2-0_NN.md"
level: 3
parent_spec:
  name: "workflow_V_1-0-0"
  url: ""
type: "nn-workflow"
model_version: "V_1-0-0"
title: "<workflow-name>"
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
