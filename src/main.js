// src/main.js
import { state } from "./core/state.js";
import { buildTable } from "./scene/table.js";
import { createBalls } from "./scene/balls.js";
import { createPockets } from "./scene/pockets.js";
import { createCueStick } from "./scene/cue.js";

import { setupKeyboard } from "./controls/input.js";
import { updateKeyboardCamera } from "./controls/cameraKeyboard.js";

import { updateLinearMotion } from "./physics/motion.js";
// FIX: added updateStrikeAnimation to the import list
import {
  updateCue,
  pullCue,
  rotateCue,
  strikeCue,
  updateStrikeAnimation   // ← NEW
} from "./physics/cuePhysics.js";
import { solveWallCollision } from "./physics/wall.js";


window.addEventListener("load", () => {
  document.getElementById("startBtn").addEventListener("click", () => {
    document.getElementById("startScreen").style.display = "none";
    startGame();
  });
});


function startGame() {
  initThree();
  setupKeyboard(state);
  buildWorld();
  animate();
}


function initThree() {
  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0x111218);

  state.camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 2000
  );
  state.camera.position.set(0, 180, 160);
  state.camera.lookAt(0, 0, 0);
  state.camera.rotation.order = "YXZ";

  state.renderer = new THREE.WebGLRenderer({ antialias: true });
  state.renderer.setSize(window.innerWidth, window.innerHeight);
  state.renderer.shadowMap.enabled = true;
  document.body.appendChild(state.renderer.domElement);

  state.scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
  mainLight.position.set(0, 220, 80);
  mainLight.castShadow = true;
  state.scene.add(mainLight);

  state.clock = new THREE.Clock();

  window.addEventListener("resize", () => {
    state.camera.aspect = window.innerWidth / window.innerHeight;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}


function buildWorld() {
  const t = buildTable(state.scene, state.TABLE);
  state.tableSurface = t.tableSurface;
  state.walls = t.walls;

  state.pockets = createPockets(state.scene, state.TABLE);
  state.balls   = createBalls(state.scene, state.TABLE, state.BALL);

  const cueBall = state.balls.find(b => b.name === "cue");
  state.cueStick = createCueStick(state.scene, cueBall.mesh);

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      // FIX: only START the animation — ball doesn't move until tip reaches it
      strikeCue(state.cueStick, cueBall);
    }
  });
}


// Helper: are ANY balls still moving?
function anyBallMoving() {
  return state.balls.some(b => b.velocity.length() > 0.05);
}


function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(state.clock.getDelta(), 0.033);
  const cueBall = state.balls.find(b => b.name === "cue");
  if (!cueBall || !state.cueStick) return;

  // ── Physics: move all balls ──────────────────────────────────────────────
  for (const ball of state.balls) {
    updateLinearMotion(ball, dt);
    solveWallCollision(ball, state.TABLE);
  }

  // ── Cue stick ────────────────────────────────────────────────────────────
  const ballsMoving = anyBallMoving();
  const striking    = state.cueStick.userData.striking;

  // FIX: hide cue only when balls are rolling AND no swing is in progress
  if (ballsMoving && !striking) {
    state.cueStick.visible = false;
  } else {
    // Allow aiming / pulling only when everything is still and not swinging
    if (!ballsMoving && !striking) {
      if (state.input.keys["KeyL"]) rotateCue(state.cueStick,  1, dt);  // aim left
      if (state.input.keys["KeyR"]) rotateCue(state.cueStick, -1, dt);  // aim right
      if (state.input.keys["KeyP"]) pullCue(state.cueStick, dt);        // pull back
    }

    // FIX: advance the strike animation every frame (moves cue → ball contact)
    updateStrikeAnimation(state.cueStick, dt);

    // Keep cue aligned with ball position
    updateCue(state.cueStick, cueBall.mesh);
  }

  // ── Camera ───────────────────────────────────────────────────────────────
  updateKeyboardCamera(state, dt);

  state.renderer.render(state.scene, state.camera);
}
