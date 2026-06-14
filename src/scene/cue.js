// src/scene/cue.js
// ROOT FIX: The cue is now a flat mesh (not a Group with a pre-baked
// rotation.x). This way updateCue can freely set rotation.y (yaw around
// the table's up-axis) without fighting any parent-group transform.
// The cylinder is built horizontally (along Z) by rotating only the
// inner body mesh, keeping the Group's own rotation clean for yaw.

export function createCueStick(scene, cueBallMesh) {
  const cue = new THREE.Group();
  cue.name = "cueStick";

  const cueLength  = 140;
  const buttRadius = 1.6;
  const tipRadius  = 0.75;

  // Body — cylinder default is along Y; rotate it 90° on X so it lies
  // along Z (into the table). The Group itself stays un-rotated so that
  // setting cue.rotation.y later gives a clean horizontal yaw.
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(tipRadius, buttRadius, cueLength, 110),
    new THREE.MeshStandardMaterial({ color: 0xb07d43, roughness: 0.65, metalness: 0.05 })
  );
  body.rotation.x = Math.PI / 2;   // ← rotation on the MESH, not the Group
  body.castShadow = true;
  cue.add(body);

  // Tip (dark ferrule) — sits at the +Z end of the body
  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(tipRadius * 0.95, tipRadius * 0.95, 2.2, 18),
    new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.9 })
  );
  tip.rotation.x  = Math.PI / 2;
  tip.position.z  = cueLength / 2 + 1.1;  // tip at the +Z (forward) end
  tip.castShadow  = true;
  cue.add(tip);

  // userData drives all physics — Group starts with no rotation
  cue.userData = {
    angle:       0,
    pullBack:    0,
    maxPullBack: 25,
    powerFactor: 2.5
  };

  scene.add(cue);
  return cue;
}