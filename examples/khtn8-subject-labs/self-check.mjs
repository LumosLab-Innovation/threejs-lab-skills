import assert from "node:assert/strict";
import { SOLVERS } from "./solvers.mjs";

assert.deepEqual(SOLVERS["chem-reaction-gas"]({ acidM: 1.2, metalG: 0.48, tempC: 28 }), {
  gasMl: 479,
  gasMoles: 0.0198,
  limiting: "metal",
  rate: 1.56,
});

assert.equal(SOLVERS["chem-acid-base"]({ acidMl: 25, baseMl: 25, indicator: 1 }).type, "neutral");
assert.equal(SOLVERS["chem-catalyst-rate"]({ tempC: 25, catalyst: 1, surface: 1 }).completionSec, 28.6);
assert.equal(SOLVERS["phys-pressure"]({ depthM: 1, density: 1000, areaCm2: 10 }).pressureKPa, 9.81);
assert.equal(SOLVERS["phys-lever"]({ loadN: 20, loadArmM: 0.5, effortN: 25, effortArmM: 0.4 }).state, "balanced");
assert.equal(SOLVERS["phys-circuit"]({ voltage: 6, resistance: 12, switchOn: 1 }).currentA, 0.5);
assert.equal(SOLVERS["bio-circulation"]({ heartRate: 60, strokeMl: 70, vesselTone: 1 }).cardiacOutputLMin, 4.2);
assert.equal(SOLVERS["bio-respiration"]({ breathRate: 12, tidalMl: 500, efficiency: 70 }).minuteVentilationLMin, 6);
assert.equal(SOLVERS["bio-ecosystem"]({ producers: 80, herbivores: 45, predators: 12, pollution: 5 }).risk, "stable");

console.log("khtn8-subject-labs self-check ok");
