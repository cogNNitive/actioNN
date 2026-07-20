# Supported Skills Registry

| Skill | Input | Output | Template |
|-------|-------|--------|----------|
| `nn-trannsform` | Raw files (PDF, DOCX, XLSX, MD, TXT) | Normalized Markdown | Optional: nn-source |
| `nn-innfo` | Normalized Markdown | iNNfo model (`*_NN.md`) | Required |
| `gate:validate` | Model file | Pass/fail | N/A |
| `gate:integrate` | Model file | Updated model + index | N/A |

To add a new skill: add a row here, then run `node scripts/build-registry.js`.
