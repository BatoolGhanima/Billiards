// src/settingsPanel.js

import { state } from "./core/state.js";

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

  panel.innerHTML = "<h3>Physics Panel</h3>";

  document.body.appendChild(panel);

  // ── ربط القيم من state إلى الـ inputs ─────────────────────────────────
  
  document.getElementById("cueRadius").value =
    state.BALL.cueRadius;

  document.getElementById("cueMass").value =
    state.BALL.cueMass;

  document.getElementById("objectRadius").value =
    state.BALL.objectRadius;

  document.getElementById("objectMass").value =
    state.BALL.objectMass;

  document.getElementById("ballMaterial").value =
    state.BALL.material;

  document.getElementById("ballConfiguration").value =
    state.BALL.configuration;

  document.getElementById("gravity").value =
    state.physics.gravity;

  document.getElementById("airDensity").value =
    state.physics.airDensity;

  document.getElementById("slideFriction").value =
    state.physics.slideFriction;

  document.getElementById("rollFriction").value =
    state.physics.rollFriction;

  document.getElementById("clothType").value =
    state.physics.clothType;

  document.getElementById("cuePower").value =
    state.cue.powerFactor;

  // ── ربط التغييرات من الـ inputs إلى state ────────────────────────────

  document.getElementById("cueRadius")
    .oninput = e =>
      state.BALL.cueRadius = Number(e.target.value);

  document.getElementById("cueMass")
    .oninput = e =>
      state.BALL.cueMass = Number(e.target.value);

  document.getElementById("objectRadius")
    .oninput = e =>
      state.BALL.objectRadius = Number(e.target.value);

  document.getElementById("objectMass")
    .oninput = e =>
      state.BALL.objectMass = Number(e.target.value);

  document.getElementById("ballMaterial")
    .onchange = e =>
      state.BALL.material = e.target.value;

  document.getElementById("ballConfiguration")
    .onchange = e =>
      state.BALL.configuration = e.target.value;

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

  document.getElementById("clothType")
    .onchange = e =>
      state.physics.clothType = e.target.value;

  document.getElementById("cuePower")
    .oninput = e =>
      state.cue.powerFactor = Number(e.target.value);
}
