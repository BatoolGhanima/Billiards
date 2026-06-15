import { state } from "../src/core/state.js";

export function createSettingsPanel() {

  const panel = document.createElement("div");

  panel.style.position = "fixed";
  panel.style.top = "10px";
  panel.style.left = "10px";

  panel.style.background = "rgba(0,0,0,0.8)";
  panel.style.color = "white";

  panel.style.padding = "15px";

  panel.style.borderRadius = "10px";

  panel.style.zIndex = "999";

  panel.style.width = "250px";

  panel.innerHTML = 
  document.body.appendChild(panel);

  document.getElementById("ballRadius").value =
    state.BALL.r;

  document.getElementById("ballMass").value =
    state.BALL.m;

  document.getElementById("gravity").value =
    state.physics.gravity;

  document.getElementById("airDensity").value =
    state.physics.airDensity;

  document.getElementById("slideFriction").value =
    state.physics.slideFriction;

  document.getElementById("rollFriction").value =
    state.physics.rollFriction;

  document.getElementById("cuePower").value =
    state.physics.cuePowerFactor;

  document.getElementById("ballRadius")
    .oninput = e =>
      state.BALL.r = Number(e.target.value);

  document.getElementById("ballMass")
    .oninput = e =>
      state.BALL.m = Number(e.target.value);

  document.getElementById("gravity")
    .oninput = e =>
      state.physics.gravity = Number(e.target.value);

  document.getElementById("airDensity")
    .oninput = e =>
      state.physics.airDensity = Number(e.target.value);

  document.getElementById("slideFriction")
    .oninput = e =>
      state.physics.slideFriction = Number(e.target.value);

  document.getElementById("rollFriction")
    .oninput = e =>
      state.physics.rollFriction = Number(e.target.value);

  document.getElementById("cuePower")
    .oninput = e =>
      state.physics.cuePowerFactor = Number(e.target.value);
}