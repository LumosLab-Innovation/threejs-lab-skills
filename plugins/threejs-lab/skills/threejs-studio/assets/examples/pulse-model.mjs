import { createBehavior } from "./pulse-behavior.mjs";

// Geometry fixture for the shared motion contract; replace its form with the approved subject.
export function createModel({ THREE }) {
  const root = new THREE.Group();
  const geometry = new THREE.SphereGeometry(1, 48, 32);
  geometry.scale(1, 1.3, 0.85);
  const basis = geometry.attributes.position;
  const contract = basis.clone();
  contract.name = "contract";
  for (let i = 0; i < basis.count; i++) {
    const y = basis.getY(i);
    const weight = Math.max(0, 1 - (y / 1.3) ** 2);
    contract.setXYZ(
      i,
      basis.getX(i) * (1 - 0.22 * weight),
      y * (1 + 0.12 * weight),
      basis.getZ(i) * (1 - 0.22 * weight),
    );
  }
  geometry.morphAttributes.position = [contract];
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0xc77564,
      roughness: 0.42,
      metalness: 0.05,
    }),
  );
  mesh.name = "tissue";
  root.add(mesh);
  return { root, ...createBehavior({ root }) };
}
