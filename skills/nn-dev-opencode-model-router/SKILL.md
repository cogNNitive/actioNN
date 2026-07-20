---
name: nn-dev-opencode-model-router
description: Route any task to the right OpenCode model — trivial, bug, feature, or refactor. Invoke with /nn-dev-opencode-model-router.
disable-model-invocation: true
version: 1.0.0
last_updated: 2026-07-12
update_url: https://opencode.ai/docs/models
license: MIT
compatibility: ">=1.0.0"
---

# nn Dev Model Router

Classify the user's task into one branch below, compare against the active model, and output a verdict. Do **not** re-check in the same session unless asked again.

See [`MODEL_MATRIX.md`](MODEL_MATRIX.md) for full model specs: context windows, strengths, tradeoffs.

---

## Branches

### Atomic — one-line edits, syntax, grep, typo
→ Flash (`deepseek-v4-flash`, ~$0.09/M)

### Surgical — debug a function, patch a single file, fix logic
→ Flash or MiMo (`mimo-2.5`, $0.09–$0.20/M)

### Build — new component, API endpoint, multi-step feature
→ MiMo (`mimo-2.5`, ~$0.20/M)

### Scaffold — cross-cutting refactor, full-repo migration, architecture redesign
→ MiniMax M3 (`minimax-m3`, ~$0.28/M, 1M context)

---

## Verdict

**Match.** Output exactly:
```
Model: <active-model-id>
Tier: <Flash|MiMo|MiniMax M3>
Task: <atomic|surgical|build|scaffold>
Verdict: MATCH
```

**Mismatch.** Output exactly:
```
Model: <active-model-id>
Tier: <Flash|MiMo|MiniMax M3>
Task: <atomic|surgical|build|scaffold>
Verdict: MISMATCH — <overpaying|underpowered>
Recommend: <model-id> (~$<cost>/M)
Reason: <one sentence>
```

No commentary before or after the block.

---

## Update the model table

On request, search current pricing at `opencode.ai/docs/models`, compare against `MODEL_MATRIX.md`, propose changes with sources, get approval, then update both files. Show a disclaimer before applying.
