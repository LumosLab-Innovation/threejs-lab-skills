import assert from "node:assert/strict";

function computeForce(q1, q2, distance) {
  const safeDistance = Math.max(distance, 0.001);
  return ((9 * q1 * q2) / (safeDistance * safeDistance)) * 10;
}

assert.equal(Number(computeForce(-10, 10, 20).toFixed(2)), -22.5);
assert.equal(Number(computeForce(18, 14, 12).toFixed(2)), 157.5);

console.log("coulomb-force-lab self-check ok");
