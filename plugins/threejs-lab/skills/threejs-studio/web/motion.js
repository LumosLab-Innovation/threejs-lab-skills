// The same simulation clock and controls drive procedural and Blender-authored models.
export function createPlayback(controller = {}, mixer) {
  for (const name of ["update", "reset", "setParameter", "onPick", "dispose"]) {
    if (
      controller[name] !== undefined &&
      typeof controller[name] !== "function"
    )
      throw new Error(`${name} must be a function`);
  }
  const parameters = controller.parameters || [];
  if (!Array.isArray(parameters) || parameters.length > 8)
    throw new Error("Use at most eight model parameters");
  const ids = new Set();
  for (const p of parameters) {
    if (
      !p ||
      typeof p.id !== "string" ||
      !p.id ||
      ids.has(p.id) ||
      typeof p.label !== "string" ||
      !p.label ||
      p.label.length > 80 ||
      ![p.min, p.max, p.step, p.value].every(Number.isFinite) ||
      p.min >= p.max ||
      p.step <= 0 ||
      p.value < p.min ||
      p.value > p.max ||
      !controller.setParameter
    ) {
      throw new Error("Invalid model parameter contract");
    }
    ids.add(p.id);
  }
  const defaults = parameters.map((p) => ({ ...p }));
  let elapsed = 0,
    playing = true;
  return {
    parameters: defaults,
    get elapsed() {
      return elapsed;
    },
    get playing() {
      return playing;
    },
    get active() {
      return Boolean(mixer || controller.update);
    },
    toggle() {
      playing = !playing;
      return playing;
    },
    step(delta) {
      if (!playing) return;
      const dt = Number.isFinite(delta)
        ? Math.min(Math.max(delta, 0), 0.05)
        : 0;
      elapsed += dt;
      mixer?.update(dt);
      controller.update?.(dt, elapsed);
    },
    setParameter(id, value) {
      const p = defaults.find((p) => p.id === id);
      if (!p || !Number.isFinite(value) || value < p.min || value > p.max)
        throw new Error("Model parameter out of range");
      controller.setParameter(id, value);
      controller.update?.(0, elapsed);
    },
    reset() {
      elapsed = 0;
      mixer?.setTime(0);
      controller.reset?.();
      for (const p of defaults) controller.setParameter(p.id, p.value);
      controller.update?.(0, 0);
    },
  };
}
