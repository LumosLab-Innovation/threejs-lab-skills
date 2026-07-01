import assert from "node:assert/strict";

function computeMetrics(strength, flow, turbulence) {
  return {
    flux: Math.round((strength / 2.8) * 100),
    energy: Number((strength * flow * (2.1 + turbulence)).toFixed(1)),
  };
}

assert.deepEqual(computeMetrics(1.45, 1.1, 0.42), { flux: 52, energy: 4.0 });
assert.deepEqual(computeMetrics(2.8, 2.4, 1), { flux: 100, energy: 20.8 });

console.log("fancy-field-lab self-check ok");
