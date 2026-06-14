// src/main.js
import { state } from "./core/state.js";
import { buildTable } from "./scene/table.js";
import { createBalls } from "./scene/balls.js";
import { createPockets } from "./scene/pockets.js";
import { createCueStick } from "./scene/cue.js";

import { setupKeyboard } from "./controls/input.js";
import { updateKeyboardCamera } from "./controls/cameraKeyboard.js";

import { updateLinearMotion } from "./physics/motion.js";
import {
  updateCue,
  pullCue,
  rotateCue,
  strikeCue,
  updateStrikeAnimation
} from "./physics/cuePhysics.js";
import { solveWallCollision } from "./physics/wall.js";
import { solveBallCollisions }  from "./physics/ballCollisions.js";  
import { detectPockets }        from "./physics/pocketPhysics.js";


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
  state.walls        = t.walls;

  state.pockets  = createPockets(state.scene, state.TABLE);
  state.balls    = createBalls(state.scene, state.TABLE, state.BALL);

  const cueBall  = state.balls.find(b => b.name === "cue");
  state.cueStick = createCueStick(state.scene, cueBall.mesh);

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      strikeCue(state.cueStick, cueBall);
    }
  });
}


function anyBallMoving() {
  return state.balls.some(b => !b.pocketed && b.velocity.length() > 0.4);
}


function animate() {
  requestAnimationFrame(animate);

  const dt      = Math.min(state.clock.getDelta(), 0.033);
  const cueBall = state.balls.find(b => b.name === "cue");
  if (!cueBall || !state.cueStick) return;

  // ── 1. حركة كل الكرات (احتكاك + مقاومة هواء + دوران) ───────────────────
  for (const ball of state.balls) {
    if (ball.pocketed) continue;
    updateLinearMotion(ball, dt);
    solveWallCollision(ball, state.TABLE);
  }

  // ── 2. حل تصادمات الكرات ببعضها (Impulse Iteration) ─────────────────────
  // يشمل: موجة الكسر، التوزيع التسلسلي، Dead Kiss، Split
  solveBallCollisions(state.balls);

  // ── 3. كشف الجيوب — تحقق من سقوط الكرات ────────────────────────────────
  detectPockets(state.balls, state.pockets, state.scene);

  // ── 4. العصا ─────────────────────────────────────────────────────────────
  const ballsMoving = anyBallMoving();
  const striking    = state.cueStick.userData.striking;

  if (ballsMoving && !striking) {
    state.cueStick.visible = false;
  } else {
    if (!ballsMoving && !striking && !cueBall.pocketed) {
      if (state.input.keys["KeyL"]) rotateCue(state.cueStick,  1, dt);
      if (state.input.keys["KeyR"]) rotateCue(state.cueStick, -1, dt);
      if (state.input.keys["KeyP"]) pullCue(state.cueStick, dt);
    }

    updateStrikeAnimation(state.cueStick, dt);

    if (!cueBall.pocketed) {
      updateCue(state.cueStick, cueBall.mesh);
    }
  }

  // ── 5. الكاميرا ──────────────────────────────────────────────────────────
  updateKeyboardCamera(state, dt);

  state.renderer.render(state.scene, state.camera);
}
