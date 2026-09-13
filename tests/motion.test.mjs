import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../plugins/threejs-lab/skills/threejs-studio/node_modules/three/build/three.module.js";
import { createPlayback } from "../plugins/threejs-lab/skills/threejs-studio/web/motion.js";
import { createModel } from "../plugins/threejs-lab/skills/threejs-studio/assets/examples/pulse-model.mjs";
import { createBehavior } from "../plugins/threejs-lab/skills/threejs-studio/assets/examples/pulse-behavior.mjs";

test("shared clock, contraction, picking and parameter reset work with either factory", () => {
  const procedural = createModel({ THREE });
  const assetRoot = procedural.root.clone(true);
  assetRoot.traverse((object) => {
    if (object.isMesh) {
      object.geometry = object.geometry.clone();
      object.material = object.material.clone();
    }
  });
  for (const [root, controller] of [
    [procedural.root, procedural],
    [assetRoot, createBehavior({ root: assetRoot })],
  ]) {
    const tissue = root.getObjectByName("tissue");
    const index = tissue.morphTargetDictionary.contract;
    const color = tissue.material.color.getHex();
    const basis = tissue.geometry.attributes.position.array.slice();
    const player = createPlayback(controller);
    player.reset();
    assert.equal(tissue.morphTargetInfluences[index], 0);
    player.step(10);
    assert.equal(player.elapsed, 0.05); // Background stall cannot jump ten seconds.
    for (let i = 0; i < 9; i++) player.step(0.05);
    assert.ok(Math.abs(tissue.morphTargetInfluences[index] - 0.65) < 1e-8);
    player.toggle();
    const paused = player.elapsed;
    player.step(0.04);
    assert.equal(player.elapsed, paused);
    player.setParameter("amplitude", 0);
    assert.equal(tissue.morphTargetInfluences[index], 0);
    player.setParameter("amplitude", 1);
    controller.onPick({ object: tissue });
    assert.equal(tissue.morphTargetInfluences[index], 1);
    assert.notEqual(tissue.material.color.getHex(), color);
    player.reset();
    assert.equal(player.elapsed, 0);
    assert.equal(player.playing, false);
    assert.equal(tissue.material.color.getHex(), color);
    assert.equal(tissue.morphTargetInfluences[index], 0);
    player.toggle();
    for (let i = 0; i < 10; i++) player.step(0.05);
    assert.ok(Math.abs(tissue.morphTargetInfluences[index] - 0.65) < 1e-8);
    assert.deepEqual(tissue.geometry.attributes.position.array, basis); // No accumulating geometry damage.
    assert.throws(() => player.setParameter("amplitude", NaN), /out of range/);
    assert.throws(() => player.setParameter("rate", 151), /out of range/);
    assert.throws(() => player.setParameter("unknown", 1), /out of range/);
    tissue.geometry.dispose();
    tissue.material.dispose();
  }
  assert.throws(
    () => createBehavior({ root: new THREE.Group() }),
    /morph target/,
  );
  assert.throws(() => createPlayback({ update: true }), /function/);
  assert.throws(
    () => createPlayback({ parameters: [{}] }),
    /parameter contract/,
  );
  assert.throws(
    () =>
      createPlayback({
        parameters: [procedural.parameters[0], procedural.parameters[0]],
        setParameter() {},
      }),
    /parameter contract/,
  );
  assert.equal(createPlayback().active, false);
});
