// src/table.js
export function buildTable(scene, TABLE) {
  // ======================
  // Surface (felt)
  // ======================
  const surfaceGeometry = new THREE.BoxGeometry(TABLE.width, TABLE.thickness, TABLE.length);
  const surfaceMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d6a4f,
    roughness: 0.95,
    metalness: 0.0
  });

  const tableSurface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
  tableSurface.receiveShadow = true;
  tableSurface.position.y = -TABLE.thickness / 2; // top is at y=0
  scene.add(tableSurface);

  // ======================
  // Walls (cushions)
  // ======================
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b4332,
    roughness: 0.85,
    metalness: 0.05
  });

  const wallsData = [
    // Z+
    [TABLE.width + TABLE.wallThickness * 2, TABLE.wallHeight, TABLE.wallThickness,
      0, TABLE.wallHeight / 2, TABLE.length / 2 + TABLE.wallThickness / 2],

    // Z-
    [TABLE.width + TABLE.wallThickness * 2, TABLE.wallHeight, TABLE.wallThickness,
      0, TABLE.wallHeight / 2, -(TABLE.length / 2 + TABLE.wallThickness / 2)],

    // X+
    [TABLE.wallThickness, TABLE.wallHeight, TABLE.length,
      TABLE.width / 2 + TABLE.wallThickness / 2, TABLE.wallHeight / 2, 0],

    // X-
    [TABLE.wallThickness, TABLE.wallHeight, TABLE.length,
      -(TABLE.width / 2 + TABLE.wallThickness / 2), TABLE.wallHeight / 2, 0],
  ];

  const walls = [];
  wallsData.forEach(d => {
    const g = new THREE.BoxGeometry(d[0], d[1], d[2]);
    const w = new THREE.Mesh(g, wallMaterial);
    w.position.set(d[3], d[4], d[5]);
    w.castShadow = true;
    w.receiveShadow = true;
    scene.add(w);
    walls.push(w);
  });

  // ======================
  // Wood Frame (outer border) - VISUAL
  // ======================
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3d11, // wood brown
    roughness: 0.75,
    metalness: 0.1
  });

  const frameHeight = TABLE.wallHeight + 2;
  const frameThickness = TABLE.wallThickness;

  const frameData = [
    // front (Z+)
    [TABLE.width + frameThickness * 4, frameHeight, frameThickness,
      0, frameHeight / 2, TABLE.length / 2 + frameThickness * 1.5],

    // back (Z-)
    [TABLE.width + frameThickness * 4, frameHeight, frameThickness,
      0, frameHeight / 2, -(TABLE.length / 2 + frameThickness * 1.5)],

    // right (X+)
    [frameThickness, frameHeight, TABLE.length + frameThickness * 2,
      TABLE.width / 2 + frameThickness * 1.5, frameHeight / 2, 0],

    // left (X-)
    [frameThickness, frameHeight, TABLE.length + frameThickness * 2,
      -(TABLE.width / 2 + frameThickness * 1.5), frameHeight / 2, 0],
  ];

  frameData.forEach(d => {
    const g = new THREE.BoxGeometry(d[0], d[1], d[2]);
    const piece = new THREE.Mesh(g, frameMaterial);
    piece.position.set(d[3], d[4], d[5]);
    piece.castShadow = true;
    piece.receiveShadow = true;
    scene.add(piece);
  });

  // ======================
  // Legs - VISUAL
  // ======================
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.65,
    metalness: 0.2
  });

  const legOffset = 4;
  const legY = -TABLE.legHeight / 2 - TABLE.thickness;

  const legPositions = [
    [ TABLE.width / 2 + legOffset, legY,  TABLE.length / 2 + legOffset],
    [-TABLE.width / 2 - legOffset, legY,  TABLE.length / 2 + legOffset],
    [ TABLE.width / 2 + legOffset, legY, -TABLE.length / 2 - legOffset],
    [-TABLE.width / 2 - legOffset, legY, -TABLE.length / 2 - legOffset],
  ];

  legPositions.forEach(([x, y, z]) => {
    const g = new THREE.BoxGeometry(TABLE.legSize, TABLE.legHeight, TABLE.legSize);
    const leg = new THREE.Mesh(g, legMaterial);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    leg.receiveShadow = true;
    scene.add(leg);
  });

  return { tableSurface, walls };
}
