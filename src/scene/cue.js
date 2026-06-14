// src/cue.js
export function createCueStick(scene, cueBallMesh) {
  const cue = new THREE.Group();
  cue.name = "cueStick";

  const cueLength = 140;
  const buttRadius = 1.6;
  const tipRadius = 0.75;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(tipRadius, buttRadius, cueLength, 24),
    new THREE.MeshStandardMaterial({ color: 0xb07d43, roughness: 0.65, metalness: 0.05 })
  );
  body.castShadow = true;
  cue.add(body);

  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(tipRadius * 0.95, tipRadius * 0.95, 2.2, 18),
    new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.9, metalness: 0.0 })
  );
  tip.position.y = cueLength / 2 + 1.1;
  tip.castShadow = true;
  cue.add(tip);

  cue.rotation.x = Math.PI / 2;

  // placement will be updated in physics/update
  scene.add(cue);
  return cue;
}
