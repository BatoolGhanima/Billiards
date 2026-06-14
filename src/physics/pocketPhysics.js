// src/physics/pocketPhysics.js

const SINK_SPEED = 6;
const SINK_DEPTH = 12;

export function detectPockets(balls, pockets, scene) {
  for (const ball of balls) {
    if (ball.pocketed) {
      _animateSink(ball, scene);
      continue;
    }

    for (const pocket of pockets) {

      // FIX: نقرأ الموضع بأمان — ندعم كلا الشكلين:
      //   { position: { x, z } }  مثل THREE.Mesh
      //   { x, z }                مثل plain object
      const pocketX = pocket.position !== undefined
        ? pocket.position.x
        : pocket.x;
      const pocketZ = pocket.position !== undefined
        ? pocket.position.z
        : pocket.z;

      // FIX: نفس الأمر لنصف القطر — قد يكون pocket.radius أو pocket.userData.radius
      const pocketR = pocket.r
        ?? pocket.userData?.radius
        ?? 9;   // fallback معقول لطاولة بلياردو قياسية

      const dx   = ball.mesh.position.x - pocketX;
      const dz   = ball.mesh.position.z - pocketZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < pocketR * 0.85) {
        ball.pocketed  = true;
        ball.sinkDepth = 0;

        ball.velocity.set(0, 0, 0);
        ball.angularVelocity.set(0, 0, 0);

        ball.mesh.position.x = pocketX;
        ball.mesh.position.z = pocketZ;
        break;
      }
    }
  }
}

function _animateSink(ball, scene) {
  if (!ball.mesh.parent) return;

  ball.sinkDepth = (ball.sinkDepth || 0) + SINK_SPEED;

  const scale = Math.max(0, 1 - ball.sinkDepth / SINK_DEPTH);
  ball.mesh.scale.setScalar(scale);
  ball.mesh.position.y = ball.radius * scale - ball.radius;

  if (ball.sinkDepth >= SINK_DEPTH) {
    scene.remove(ball.mesh);
  }
}
