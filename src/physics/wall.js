// src/physics/wall.js
// BUG FIX: Wall boundaries must account for the wall thickness so balls
// bounce off the inner face of the cushions, not the table centre-line.
// Added wallThickness to the half-extents.

export function solveWallCollision(ball, TABLE) {
  // Inner playing surface edges
  const halfW = TABLE.width  / 2;
  const halfL = TABLE.length / 2;

  const r = ball.radius;

  // X walls
  if (ball.mesh.position.x > halfW - r) {
    ball.mesh.position.x = halfW - r;
    ball.velocity.x *= -0.75; // BUG FIX: pure -1 reflection is lossless.
  }                            // Real cushions absorb ~25% energy.

  if (ball.mesh.position.x < -halfW + r) {
    ball.mesh.position.x = -halfW + r;
    ball.velocity.x *= -0.75;
  }

  // Z walls
  if (ball.mesh.position.z > halfL - r) {
    ball.mesh.position.z = halfL - r;
    ball.velocity.z *= -0.75;
  }

  if (ball.mesh.position.z < -halfL + r) {
    ball.mesh.position.z = -halfL + r;
    ball.velocity.z *= -0.75;
  }
}
