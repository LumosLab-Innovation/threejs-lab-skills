export const INITIAL_STATES = {
  "chem-reaction-gas": { acidM: 1.2, metalG: 0.48, tempC: 28 },
  "chem-acid-base": { acidMl: 25, baseMl: 14, indicator: 1 },
  "chem-catalyst-rate": { tempC: 32, catalyst: 1, surface: 1.4 },
  "phys-pressure": { depthM: 0.72, density: 1000, areaCm2: 18 },
  "phys-lever": { loadN: 34, loadArmM: 0.42, effortN: 24, effortArmM: 0.62 },
  "phys-circuit": { voltage: 6, resistance: 12, switchOn: 1 },
  "bio-circulation": { heartRate: 78, strokeMl: 68, vesselTone: 1 },
  "bio-respiration": { breathRate: 16, tidalMl: 470, efficiency: 72 },
  "bio-ecosystem": { producers: 72, herbivores: 44, predators: 18, pollution: 12 },
};

export const LAB_META = {
  "chem-reaction-gas": { subject: "Chemistry", title: "Reaction Gas Lab", topic: "chemical reaction, gas amount" },
  "chem-acid-base": { subject: "Chemistry", title: "Acid Base pH Lab", topic: "acid, base, pH scale" },
  "chem-catalyst-rate": { subject: "Chemistry", title: "Catalyst Rate Lab", topic: "reaction rate and catalyst" },
  "phys-pressure": { subject: "Physics", title: "Fluid Pressure Lab", topic: "pressure in liquid" },
  "phys-lever": { subject: "Physics", title: "Lever Moment Lab", topic: "moment of force" },
  "phys-circuit": { subject: "Physics", title: "Electric Circuit Lab", topic: "current, voltage, resistance" },
  "bio-circulation": { subject: "Biology", title: "Circulation Lab", topic: "human blood circulation" },
  "bio-respiration": { subject: "Biology", title: "Respiration Lab", topic: "human breathing and gas exchange" },
  "bio-ecosystem": { subject: "Biology", title: "Ecosystem Balance Lab", topic: "population and ecosystem balance" },
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function solveReactionGas(state) {
  const acidMoles = state.acidM * 0.05;
  const metalMoles = state.metalG / 24.3;
  const gasMoles = Math.min(metalMoles, acidMoles / 2);
  const gasMl = gasMoles * 24000 * ((state.tempC + 273.15) / 298.15);
  const rate = state.acidM * (1 + (state.tempC - 25) * 0.035) * (0.7 + state.metalG);
  return {
    gasMl: Number(gasMl.toFixed(0)),
    gasMoles: Number(gasMoles.toFixed(4)),
    limiting: metalMoles <= acidMoles / 2 ? "metal" : "acid",
    rate: Number(rate.toFixed(2)),
  };
}

export function solveAcidBase(state) {
  const acid = state.acidMl * 0.1 / 1000;
  const base = state.baseMl * 0.1 / 1000;
  const volumeL = Math.max((state.acidMl + state.baseMl) / 1000, 0.001);
  let pH = 7;
  if (acid > base) pH = -Math.log10((acid - base) / volumeL);
  if (base > acid) pH = 14 + Math.log10((base - acid) / volumeL);
  const neutralized = Math.min(acid, base) / Math.max(acid, base, 0.000001) * 100;
  return {
    pH: Number(clamp(pH, 0, 14).toFixed(2)),
    neutralizedPct: Number(neutralized.toFixed(0)),
    type: pH < 6.6 ? "acidic" : pH > 7.4 ? "basic" : "neutral",
  };
}

export function solveCatalystRate(state) {
  const tempFactor = Math.pow(2, (state.tempC - 25) / 10);
  const catalystFactor = state.catalyst ? 2.8 : 1;
  const rate = tempFactor * catalystFactor * state.surface;
  return {
    rate: Number(rate.toFixed(2)),
    completionSec: Number((80 / rate).toFixed(1)),
    collisionIndex: Number((rate * 18).toFixed(0)),
  };
}

export function solvePressure(state) {
  const pressurePa = state.density * 9.81 * state.depthM;
  const areaM2 = state.areaCm2 / 10000;
  return {
    pressureKPa: Number((pressurePa / 1000).toFixed(2)),
    forceN: Number((pressurePa * areaM2).toFixed(2)),
    manometerCm: Number((pressurePa / (1000 * 9.81) * 100).toFixed(0)),
  };
}

export function solveLever(state) {
  const loadMoment = state.loadN * state.loadArmM;
  const effortMoment = state.effortN * state.effortArmM;
  const netMoment = effortMoment - loadMoment;
  return {
    loadMoment: Number(loadMoment.toFixed(2)),
    effortMoment: Number(effortMoment.toFixed(2)),
    netMoment: Number(netMoment.toFixed(2)),
    state: Math.abs(netMoment) < 0.8 ? "balanced" : netMoment > 0 ? "effort side down" : "load side down",
  };
}

export function solveCircuit(state) {
  const currentA = state.switchOn ? state.voltage / state.resistance : 0;
  return {
    currentA: Number(currentA.toFixed(2)),
    powerW: Number((state.voltage * currentA).toFixed(2)),
    brightnessPct: Number(clamp((currentA / 0.8) * 100, 0, 100).toFixed(0)),
  };
}

export function solveCirculation(state) {
  const toneFactor = clamp(state.vesselTone, 0.65, 1.35);
  const cardiacOutput = state.heartRate * state.strokeMl / 1000;
  const flowIndex = cardiacOutput / toneFactor;
  return {
    cardiacOutputLMin: Number(cardiacOutput.toFixed(2)),
    flowIndex: Number(flowIndex.toFixed(2)),
    pulseMs: Number((60000 / state.heartRate).toFixed(0)),
  };
}

export function solveRespiration(state) {
  const alveolarMl = Math.max(state.tidalMl - 150, 0);
  const minuteVentilation = state.breathRate * state.tidalMl / 1000;
  const oxygenUptake = state.breathRate * alveolarMl * (state.efficiency / 100) * 0.21 / 1000;
  return {
    minuteVentilationLMin: Number(minuteVentilation.toFixed(2)),
    alveolarVentilationLMin: Number((state.breathRate * alveolarMl / 1000).toFixed(2)),
    oxygenUptakeLMin: Number(oxygenUptake.toFixed(2)),
  };
}

export function solveEcosystem(state) {
  const producerScore = state.producers * (1 - state.pollution / 140);
  const herbivoreNeed = state.herbivores * 1.2;
  const predatorNeed = state.predators * 2.1;
  const foodBalance = 100 - Math.abs(producerScore - herbivoreNeed) * 0.45 - Math.abs(state.herbivores - predatorNeed) * 0.55;
  const stability = clamp(foodBalance - state.pollution * 0.35, 0, 100);
  return {
    stabilityPct: Number(stability.toFixed(0)),
    producerScore: Number(producerScore.toFixed(0)),
    risk: stability > 72 ? "stable" : stability > 42 ? "stressed" : "collapse risk",
  };
}

export const SOLVERS = {
  "chem-reaction-gas": solveReactionGas,
  "chem-acid-base": solveAcidBase,
  "chem-catalyst-rate": solveCatalystRate,
  "phys-pressure": solvePressure,
  "phys-lever": solveLever,
  "phys-circuit": solveCircuit,
  "bio-circulation": solveCirculation,
  "bio-respiration": solveRespiration,
  "bio-ecosystem": solveEcosystem,
};
