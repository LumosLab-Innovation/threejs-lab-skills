import assert from "node:assert/strict";

const MATERIALS = { wood: 0.8, aluminum: 2.7, iron: 7.8 };

function solveDensity(materialKey, volumeCm3, liquidDensity) {
  const density = MATERIALS[materialKey];
  const massG = density * volumeCm3;
  const floats = density <= liquidDensity;
  const submergedFraction = floats ? density / liquidDensity : 1;
  const displacedCm3 = volumeCm3 * submergedFraction;
  const buoyantN = liquidDensity * displacedCm3 * 0.00980665;
  return { massG: Number(massG.toFixed(1)), floats, displacedCm3: Number(displacedCm3.toFixed(1)), buoyantN: Number(buoyantN.toFixed(2)) };
}

assert.deepEqual(solveDensity("wood", 18, 1), { massG: 14.4, floats: true, displacedCm3: 14.4, buoyantN: 0.14 });
assert.deepEqual(solveDensity("iron", 10, 1), { massG: 78, floats: false, displacedCm3: 10, buoyantN: 0.1 });

console.log("density-buoyancy-lab self-check ok");
