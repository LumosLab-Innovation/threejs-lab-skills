// Shared by a procedural mesh and a Blender GLB with the same named morph target.
// This illustrates deformation mechanics, not validated heart or muscle physiology.
export function createBehavior({ root }) {
  let tissue;
  root.traverse((object) => {
    if (object.isMesh && object.morphTargetDictionary?.contract !== undefined)
      tissue ||= object;
  });
  if (!tissue)
    throw new Error("Model needs an authored morph target named contract");
  const index = tissue.morphTargetDictionary.contract;
  const baseColor = tissue.material.color.clone();
  let rate = 60,
    amplitude = 0.65,
    pressed = false;
  return {
    parameters: [
      { id: "rate", label: "Nhịp/phút", min: 30, max: 150, step: 1, value: 60 },
      {
        id: "amplitude",
        label: "Độ co",
        min: 0,
        max: 1,
        step: 0.05,
        value: 0.65,
      },
    ],
    setParameter(id, value) {
      if (id === "rate") rate = value;
      else if (id === "amplitude") amplitude = value;
    },
    update(_delta, elapsed) {
      const phase = 0.5 - 0.5 * Math.cos((elapsed * Math.PI * 2 * rate) / 60);
      tissue.morphTargetInfluences[index] = pressed
        ? amplitude
        : amplitude * phase;
    },
    onPick(hit) {
      if (hit.object !== tissue) return;
      pressed = !pressed;
      tissue.material.color.copy(baseColor);
      if (pressed) tissue.material.color.offsetHSL(0.025, 0.1, 0.08);
      tissue.morphTargetInfluences[index] = pressed ? amplitude : 0;
    },
    reset() {
      pressed = false;
      tissue.material.color.copy(baseColor);
      tissue.morphTargetInfluences[index] = 0;
    },
  };
}
