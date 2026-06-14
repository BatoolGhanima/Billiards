export function updateLinearMotion(ball, dt) {

  // حساب التسارع
  const acceleration =
    ball.force.clone().divideScalar(ball.mass);

  // تحديث السرعة
  ball.velocity.add(
    acceleration.multiplyScalar(dt)
  );

  // تحديث الموضع
  ball.mesh.position.add(
    ball.velocity.clone().multiplyScalar(dt)
  );

}