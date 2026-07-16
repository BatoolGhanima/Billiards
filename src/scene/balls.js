// src/scene/balls.js

import { state } from "../core/state.js"


//إنشاء الكرات 
//Scene
//مشهد سنضيف إليه الكرات
//TABLe
//أبعاد الطاولة نستخدمه لتحديد مواقع الكرات
export function createBalls(scene, TABLE, BALL) {
  const balls = [];


  //هذه الدالة تستقبل لون الكرة و ترجع مادة ثلاثية الأبعاد  بنفس اللون
  //roughness خشونة السطح
  //metalness تأثير المعدن
  function mat(color) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.05 });
  }


  //دالة إضافة كرة .. تأخذ خصاصئص الكرة و تعيد كرة ثلاثية الأبعاد
  function addBall(name, color, x, z, radius, mass) {

    //إنشاء الشكل الهندسي 
    const geo = new THREE.SphereGeometry(radius, 32, 32);

    //هذا يعني الشكل و المظهر 
    const mesh = new THREE.Mesh(geo, mat(color));
    mesh.castShadow = true;
    //تستقبل ظل أشياء أخرى
    mesh.receiveShadow = true;
    //مكان الكرة
    mesh.position.set(x, radius, z);

    // تحديد نوع الكرة (مصمتة أم مفرغة)
    let ballType = "solid";
    let ballMass = mass;


    //تغيير نوع الكرات حسب اختيار المستخدم 
    switch (state.BALL.configuration) {
      case "allHollow":
        ballType = "hollow";
        ballMass = mass * 0.60;
        break;

      case "cueHollow":
        if (name === "cue") {
          ballType = "hollow";
          ballMass = mass * 0.60;
        }
        break;

      case "cueSolid":
        if (name !== "cue") {
          ballType = "hollow";
          ballMass = mass * 0.60;
        }
        break;
    }

    const obj = {
      name,
      mesh,
      radius: radius,
      mass: ballMass,
      type: ballType,


      //إنشاء متجه سرعة
      velocity: new THREE.Vector3(),

      //سرعة ززاوية
      angularVelocity: new THREE.Vector3(),

      //الدوران الناتج عن الضربة
      spin: new THREE.Vector3(),
      //القوى المؤثرة
      force: new THREE.Vector3(),
      
      torque: new THREE.Vector3() // العزم
    };

    scene.add(mesh); //إضافة الكرة للمشهد
    balls.push(obj);  //تخزين الكرة بمصفوفة الكرات
    return obj; //إرجاع كائن كرة
  }

  // ── الكرة البيضاء ────────────────────────────────────────────────────
  addBall(
    "cue",
    0xffffff,
    0,
    TABLE.length * 0.25,
    state.BALL.cueRadius,
    state.BALL.cueMass
  );

  // ── المثلث (15 كرة) ──────────────────────────────────────────────────
  const rackApexZ = -TABLE.length * 0.18;
  const dx = 2 * state.BALL.objectRadius + 0.2; //المسافة بين الكراات
  const dz = Math.sqrt(3) * state.BALL.objectRadius + 0.1;

  const colors = [
    0xf94144, 0xf3722c, 0xf9c74f, 0x90be6d, 0x000000,
    0x577590, 0x277da1, 0x9b5de5, 0x00bbf9, 0x00f5d4,
    0xff006e, 0xfb5607, 0xffbe0b, 0x8338ec, 0x3a86ff
  ];

  let idx = 0, id = 1;
  //حلقة رسم المثلث 
  for (let row = 0; row < 5; row++) {
    const count = row + 1; //عدد  الكرات في الصف 
    const z = rackApexZ - row * dz; //وضع الصف، كل صف يرجع شوي لورا
    const startX = -((count - 1) * dx) / 2; //بداية الصف
 
//حلقة رسم الكرات داخل المثلق
    for (let col = 0; col < count; col++) {
      addBall(
        `ball_${id++}`,
        colors[idx++ % colors.length],
        startX + col * dx,
        z,
        state.BALL.objectRadius,
        state.BALL.objectMass
      );
    }
  }

  return balls;
}
