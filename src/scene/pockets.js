// src/pockets.js
export function createPockets(scene, TABLE) {
  const pockets = [];
  const inset = TABLE.wallThickness * 0.9;
  const rCorner = TABLE.pocketRadius * 1.05;
  const rSide = TABLE.pocketRadius * 0.95;

  const holeDepth = 18;
  const mouthDepth = 2.5;

  const holeMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.7 });

  const centers = [
    [ TABLE.width/2 - inset,  TABLE.length/2 - inset, rCorner],
    [-TABLE.width/2 + inset,  TABLE.length/2 - inset, rCorner],
    [ TABLE.width/2 - inset, -TABLE.length/2 + inset, rCorner],
    [-TABLE.width/2 + inset, -TABLE.length/2 + inset, rCorner],
    [ TABLE.width/2 - inset,  0, rSide],
    [-TABLE.width/2 + inset,  0, rSide],
  ];

  centers.forEach(([x, z, r]) => {
    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.92, r * 0.92, holeDepth, 40),
      holeMat
    );
    hole.position.set(x, -holeDepth / 2 - 0.5, z);
    hole.receiveShadow = true;
    scene.add(hole);

    const mouth = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 1.05, r * 0.95, mouthDepth, 40),
      holeMat
    );
    mouth.position.set(x, -mouthDepth / 2 + 0.2, z);
    mouth.receiveShadow = true;
    scene.add(mouth);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r * 1.05, 1.0, 12, 48),
      ringMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, 0.25, z);
    ring.castShadow = true;
    scene.add(ring);

    pockets.push({ x, z, r });
  });

  return pockets;
}
