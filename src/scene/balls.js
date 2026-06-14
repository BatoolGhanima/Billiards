// src/balls.js
export function createBalls(scene, TABLE, BALL) {
  const balls = [];
  const ballGeo = new THREE.SphereGeometry(BALL.r, 32, 32);

  function mat(color) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.05 });
  }

  function addBall(name, color, x, z) {
    const mesh = new THREE.Mesh(ballGeo, mat(color));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(x, BALL.r, z);

const obj = {

    name,

    mesh,

    radius: BALL.r,

    mass: BALL.m,

    velocity: new THREE.Vector3(),

    angularVelocity: new THREE.Vector3(),

    force: new THREE.Vector3(),

    torque: new THREE.Vector3()

};

    scene.add(mesh);
    balls.push(obj);
    return obj;
  }

  // cue ball
  addBall("cue", 0xffffff, 0, TABLE.length * 0.25);

  // rack
  const rackApexZ = -TABLE.length * 0.25;
  const dx = 2 * BALL.r;
  const dz = Math.sqrt(3) * BALL.r;

  const colors = [
    0xf94144, 0xf3722c, 0xf9c74f, 0x90be6d, 0x43aa8b,
    0x577590, 0x277da1, 0x9b5de5, 0x00bbf9, 0x00f5d4,
    0xff006e, 0xfb5607, 0xffbe0b, 0x8338ec, 0x3a86ff
  ];

  let idx = 0, id = 1;
  for (let row = 0; row < 5; row++) {
    const count = row + 1;
    const z = rackApexZ - row * dz;
    const startX = -((count - 1) * dx) / 2;

    for (let col = 0; col < count; col++) {
      addBall(`ball_${id++}`, colors[idx++ % colors.length], startX + col * dx, z);
    }
  }

  return balls;
}
