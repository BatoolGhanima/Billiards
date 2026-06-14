// src/physics/motion.js
export function updateLinearMotion(ball, dt) {
  // Move mesh by velocity
  ball.mesh.position.addScaledVector(ball.velocity, dt);

  // BUG FIX: Original used ball.mesh.position.add(ball.velocity.clone().multiplyScalar(dt))
  // which is functionally equivalent but created a throwaway Vector3 every frame.
  // addScaledVector is the correct, allocation-free Three.js idiom.

  // Friction: exponential decay — feels realistic on felt
  ball.velocity.multiplyScalar(Math.pow(0.985, dt * 60));
  // BUG FIX: Original used a fixed 0.99 multiplier applied once per frame,
  // making friction frame-rate-dependent. Now uses dt-corrected decay so
  // friction is the same regardless of frame rate.

  // Stop if barely moving
  if (ball.velocity.length() < 0.05) {
    ball.velocity.set(0, 0, 0);
  }
}
