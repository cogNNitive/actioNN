---
spec_version: V_1-0-0
spec_level: 2
type: specification
id: workspace_spec_NN
name: Workspace Specification Template
---

# NN concept: Workspace
* type:: text
* description:: Root workspace metadata and configuration.

# NN concept: ModelRef
* type:: model
* description:: Submodel referenced within the workspace hierarchy.
* field: path | type:: string
* field: template | type:: reference
* field: status | type:: select | options:: draft, active, archived

# NN concept: Folder
* type:: category
* description:: Virtual or filesystem directory grouping for models.

# NN concept: Asset
* type:: list
* description:: External resources or attachments associated with the workspace.
