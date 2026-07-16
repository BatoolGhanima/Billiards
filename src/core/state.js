// src/core/state.js

export const state = {
  started: false,
  scene: null,
  camera: null,
  
  // كاميرا العصا
  cameraMode: "free",
  savedCamera: {
    position: new THREE.Vector3(),
    yaw: 0,
    pitch: 0
  },
  
  renderer: null,
  clock: null,


  //الطاولة
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

  // معلومات الكرات
  BALL: {
    cueRadius: 3.2,    
    cueMass: 0.17,        
    objectRadius: 3.2,    
    objectMass: 0.17,      
       
    configuration: "allSolid",
    material: "plastic"
  },

  // الخصائص الفيزيائية
  physics: {
    gravity: 0.98,
    airDensity: 0.00126,

    //معامل السحب
    dragCoefficient: 0.47,

    //احتكاك الازنلاق ميو
    slideFriction: 0.15,

    //التدحرج
    rollFriction: 0.012,

    clothType: "normal"
  },

  // معلومات العصا
  cue: {
    powerFactor: 120,
    maxPullBack: 35,    
    angle: 0,

    //بُعد العصا عن الكرةة
    distance: 60,

    //السحب اللحظي
    pullBack: 0,

    pullSpeed: 40,
    tilt: 0,

    //زاوية رفع العصا
    elevation: 0.3,      
    maxElevation: 0.9,    
    offsetX: 0,           //  نقطة الضرب أفقياً
    offsetY: 0,           // نقطة الضرب عمودياً
    maxOffset: 0.85,      //  أقصى إزاحة
    length: 145,          //  طول العصا

    //نقطة تأثر الضربة على العصا
    spinOffset: new THREE.Vector2(0, 0), 
    //هل الكرة تُضرب
    striking: false,      
    strikeTarget: null,  // الكرة المستهدفة
    strikePower: 0,       //  لحظة الضرب قوة الضربة
    hitElevation: 0,      
    hitOffsetX: 0,      
    hitOffsetY: 0,        
    visible: true          
  },



  //عناصر عالم اللعبة
  tableSurface: null,
  walls: [],
  pockets: [],
  balls: [],
  cueStick: null,
  
  selectedBallIndex: 0,

  input: {
    keys: Object.create(null),
    yaw: 0,
    pitch: -0.7
  },

  energyDisplay: null  // لعرض الطاقة
};
