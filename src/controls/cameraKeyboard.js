const MOVE_SPEED = 120;
const FAST_MULTIPLIER = 2.2;
const ROT_SPEED = 1.6;
const PITCH_LIMIT = Math.PI / 2.2;

export function updateKeyboardCamera(state, dt) {
  const keys = state.input.keys;
  const cam = state.camera;

  const fast = keys["ShiftLeft"] || keys["ShiftRight"];
  const speed = MOVE_SPEED * (fast ? FAST_MULTIPLIER : 1);

  // دوران الكاميرا بالأسهم
  if (keys["ArrowLeft"])  state.input.yaw += ROT_SPEED * dt;
  if (keys["ArrowRight"]) state.input.yaw -= ROT_SPEED * dt;
  if (keys["ArrowUp"])    state.input.pitch += ROT_SPEED * dt;
  if (keys["ArrowDown"])  state.input.pitch -= ROT_SPEED * dt;

  // تحديد الميلان
  state.input.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, state.input.pitch));

  // تطبيق الدوران
  cam.rotation.y = state.input.yaw;
  cam.rotation.x = state.input.pitch;

  // متجهات الحركة
  const forward = new THREE.Vector3(0, 0, -1).applyEuler(cam.rotation).setY(0).normalize();
  const right   = new THREE.Vector3(1, 0, 0).applyEuler(cam.rotation).setY(0).normalize();
  const up      = new THREE.Vector3(0, 1, 0);

  // WASD للحركة
  if (keys["KeyW"]) cam.position.addScaledVector(forward, speed * dt);
  if (keys["KeyS"]) cam.position.addScaledVector(forward, -speed * dt);
  if (keys["KeyD"]) cam.position.addScaledVector(right, speed * dt);
  if (keys["KeyA"]) cam.position.addScaledVector(right, -speed * dt);

  // Q/E للصعود والنزول
  if (keys["KeyE"]) cam.position.addScaledVector(up, speed * 0.7 * dt);
  if (keys["KeyQ"]) cam.position.addScaledVector(up, -speed * 0.7 * dt);

  // منع الكاميرا من النزول تحت الطاولة
  if (cam.position.y < 15) cam.position.y = 15;

  // ✅ منع الكاميرا من الخروج عن حدود الطاولة
  const halfWidth = state.TABLE.width / 2 + 50;   // هامش 50 وحدة
  const halfLength = state.TABLE.length / 2 + 50;

  cam.position.x = Math.max(-halfWidth, Math.min(halfWidth, cam.position.x));
  cam.position.z = Math.max(-halfLength, Math.min(halfLength, cam.position.z));
}
