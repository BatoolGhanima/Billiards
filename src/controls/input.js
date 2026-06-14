// src/controls/input.js
export function setupKeyboard(state) {
  window.addEventListener("keydown", (e) => { state.input.keys[e.code] = true; });
  window.addEventListener("keyup",   (e) => { state.input.keys[e.code] = false; });
}
