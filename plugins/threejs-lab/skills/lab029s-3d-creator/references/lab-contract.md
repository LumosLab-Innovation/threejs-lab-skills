# Lab Contract

Before coding a new lab, produce or infer this contract:

```text
simulation_id:
lesson_goal:
target_age:
phenomenon:
objects_3d:
variables:
  - name:
    unit:
    min:
    max:
    default:
outputs:
  - name:
    unit:
interactions:
agent_events:
qa_commands:
known_simplifications:
```

Rules:

- One lab should teach one core phenomenon.
- Every slider/toggle must map to scene state and learning output.
- Every simplification needs a ceiling and an upgrade path.
- Store constants in one place; avoid magic numbers in scene code.
- Keep `state_snapshot` small but sufficient to reproduce what the learner did.
- Use local evaluator fallback only when the backend/agent path is optional for MVP.
