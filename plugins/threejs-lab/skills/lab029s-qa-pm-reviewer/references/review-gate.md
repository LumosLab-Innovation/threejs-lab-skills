# Review Gate

## PM Rubric

Block if any answer is weak:

- What does the learner understand after 60 seconds?
- What is the main manipulated variable?
- What measured value changes?
- What mistake can the learner make, and how does the lab respond?
- Can the learner reset and try again?
- Does the report/quiz/chatbot path fit the scene state?

## QA Rubric

Require evidence:

- command output for build/lint/typecheck
- route or URL inspected
- desktop and mobile viewport screenshots or stated reason skipped
- console/network status
- asset loading status
- changed 3D files checked by static script

## 3D Rubric

- Camera frames the primary object without user adjustment.
- Lighting/materials reveal shape and contact.
- Labels are readable and do not occlude critical geometry.
- Pointer/drag/orbit controls do not fight each other.
- Rendering does not resize layout unexpectedly.
- Scene cleanup is complete.

## Physics Rubric

- Constants are named and units are visible.
- Solver is appropriate: formula, fixed-step, or engine.
- Edge cases are clamped.
- Reset restores physical state.
- Calibration/approximation is documented.
- At least one deterministic check exists for non-trivial simulation logic.

## Output Format

```text
Verdict: PASS | PASS_WITH_NOTES | BLOCKED

Blocking findings
- [severity] file:line or screen: issue, impact, smallest fix

PM notes
- ...

QA evidence
- commands:
- browser:
- screenshots:
- skipped:

Smallest fix set
1. ...
```
