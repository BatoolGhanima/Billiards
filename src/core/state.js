// src/core/state.js
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


  //معلومات الكرة : نصف القطر، الكتلة
  BALL: { r: 3.2, m: 0.17 },

//االخصائص الفيزيائية يدخلها  المستخدم وتتغير حسب نوع المحاكة
  physics: {

    gravity: 0.98,

    airDensity: 0.00126,

    dragCoefficient: 0.47,

    slideFriction: 0.15,

    rollFriction: 0.012

  },


//معلومات العصا
cue: {

  powerFactor: 2.5,

  maxPullBack: 35

},


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
