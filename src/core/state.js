// src/state.js
export const state = {
  started: false,
  scene: null,
  camera: null,
  renderer: null,
  clock: null,

  TABLE: {
    width: 160,
    length: 320,
    thickness: 6,
    wallHeight: 8,
    wallThickness: 6,
    legHeight: 45,
    legSize: 8,
    pocketRadius: 9
  },

  BALL: { r: 3.2, m: 0.17 },

  tableSurface: null,
  walls: [],
  pockets: [],
  balls: [],
  cueStick: null,

  input: {
    keys: Object.create(null),
    yaw: 0,
    pitch: -0.7
  },

  cue: {
    angle: 0,
    distance: 60,
    pullBack: 0,
    maxPullBack: 28,
    pullSpeed: 40
  }
};
