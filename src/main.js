// src/main.js
import { state } from "./core/state.js";
import { buildTable } from "./scene/table.js";
import { createBalls } from "./scene/balls.js";
import { createPockets } from "./scene/pockets.js";
import { createCueStick } from "./scene/cue.js";
import { setupKeyboard } from "./controls/input.js";
import { updateKeyboardCamera } from "./controls/cameraKeyboard.js";
import { updateLinearMotion } from "./physics/motion.js";

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

  state.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
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
  state.balls = createBalls(state.scene, state.TABLE, state.BALL);

  const cueBall = state.balls.find(b => b.name === "cue");
  window.addEventListener("keydown", e => {

  if (e.code === "Space") {

    cueBall.force.set(
  0,
  0,
  -20
);

  }

});

  state.cueStick = createCueStick(state.scene, cueBall.mesh);
}

function animate() {

  requestAnimationFrame(animate);

  const dt = Math.min(
    state.clock.getDelta(),
    0.033
  );

  // تحديث حركة جميع الكرات
  for (const ball of state.balls) {

    updateLinearMotion(
      ball,
      dt
    );

  }

  updateKeyboardCamera(
    state,
    dt
  );

  state.renderer.render(
    state.scene,
    state.camera
  );
}
