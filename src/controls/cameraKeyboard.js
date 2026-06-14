// src/controls/cameraKeyboard.js
// BUG FIX: Original file had "import * as THREE from cdn" at the top,
// which created a second copy of THREE separate from the global one loaded
// in index.html. Vectors/objects from different THREE instances don't
// mix correctly. Removed the import — the global THREE from the CDN
// script tag is used instead (same instance as scene/camera).

const MOVE_SPEED      = 120;
const FAST_MULTIPLIER = 2.2;
const ROT_SPEED       = 1.6;
const PITCH_LIMIT     = Math.PI / 2.2;

export function updateKeyboardCamera(state, dt) {
  const keys = state.input.keys;
  const cam  = state.camera;

  const fast  = keys["ShiftLeft"] || keys["ShiftRight"];
  const speed = MOVE_SPEED * (fast ? FAST_MULTIPLIER : 1);

  // Rotate camera with arrow keys
  if (keys["ArrowLeft"])  state.input.yaw   += ROT_SPEED * dt;
  if (keys["ArrowRight"]) state.input.yaw   -= ROT_SPEED * dt;
  if (keys["ArrowUp"])    state.input.pitch += ROT_SPEED * dt;
  if (keys["ArrowDown"])  state.input.pitch -= ROT_SPEED * dt;

  state.input.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, state.input.pitch));

  cam.rotation.y = state.input.yaw;
  cam.rotation.x = state.input.pitch;

  const forward = new THREE.Vector3(0, 0, -1).applyEuler(cam.rotation).setY(0).normalize();
  const right   = new THREE.Vector3(1, 0,  0).applyEuler(cam.rotation).setY(0).normalize();
  const up      = new THREE.Vector3(0, 1,  0);

  if (keys["KeyW"]) cam.position.addScaledVector(forward,  speed * dt);
  if (keys["KeyS"]) cam.position.addScaledVector(forward, -speed * dt);
  if (keys["KeyD"]) cam.position.addScaledVector(right,    speed * dt);
  if (keys["KeyA"]) cam.position.addScaledVector(right,   -speed * dt);
  if (keys["KeyE"]) cam.position.addScaledVector(up,       speed * 0.7 * dt);
  if (keys["KeyQ"]) cam.position.addScaledVector(up,      -speed * 0.7 * dt);

  if (cam.position.y < 15) cam.position.y = 15;

  const halfWidth  = state.TABLE.width  / 2 + 50;
  const halfLength = state.TABLE.length / 2 + 50;
  cam.position.x = Math.max(-halfWidth,  Math.min(halfWidth,  cam.position.x));
  cam.position.z = Math.max(-halfLength, Math.min(halfLength, cam.position.z));
}
