// src/physics/motion.js

import { state } from "../core/state.js";

const STOP_V = 1;  
const STOP_W =1;

export function updateLinearMotion(ball, dt) {
  const v = ball.velocity.length();
  const w = ball.angularVelocity.length();

  // ── توقف كامل عند سرعات صغيرة جداً 
  if (v < STOP_V && w < STOP_W) {
    ball.velocity.set(0, 0, 0);
    ball.angularVelocity.set(0, 0, 0);
    return;
  }

  const m = ball.mass;
  const r = ball.radius;
  const g = state.physics.gravity;
  const N = m * g; //القوة العمودية
  const A = Math.PI * r * r; //مساحة المقطع العرضي الذي يواجه الهواء , كلما كبر كانت مقاومة الهواء أكببر
  const I = ball.type === "hollow" // عزم القصور الذاتي يتغير حسب تجويف الكرات
    ? (2 / 3) * m * r * r
    : (2 / 5) * m * r * r;

  const mu_slide = state.physics.slideFriction;
  const mu_roll = state.physics.rollFriction;
  const rho = state.physics.airDensity;
  const Cd = state.physics.dragCoefficient;

  // ── حساب الطاقة الحركية قبل الحركة 
  const Ek_before = 0.5 * m * v * v;

  // ── سرعة الانزلاق 
  //مشتقة من العلاقة بين السرعة الخطية  و السرعة الدورانية
  const vSlipX = ball.velocity.x - ball.angularVelocity.z * r;
  const vSlipZ = ball.velocity.z + ball.angularVelocity.x * r;
  const vSlip = Math.hypot(vSlipX, vSlipZ);
  const isSliding = vSlip > 0.5; //الكرة ما تزال تنزلق

  // ── تأثير Spin
  //  على اتجاه الكرة 
  if (ball.spin) {
    ball.velocity.x += ball.spin.z * 0.15 * dt;
    ball.velocity.z -= ball.spin.x * 0.15 * dt;
  }

  // ── مقاومة الهواء 
  let Fd = 0;
  if (v > 0.1) {
    Fd = 0.5 * rho * v * v * Cd * A;
  }

  // ── قوة الاحتكاك 
  const mu = isSliding ? mu_slide : mu_roll;
  const f = mu * N;
  const decelForce = f + Fd;
  const decel = decelForce / m; // التسارع الناتج عن الاحتمام

  // ── تحديث السرعة الخطية 
 if (v > STOP_V) {

    const frictionDecel = decel * dt *0.25;

    const newSpeed = Math.max(0, v - frictionDecel);

    const ratio = newSpeed / v;

    ball.velocity.x *= ratio;
    ball.velocity.z *= ratio;
}

  // ── تحديث السرعة الزاوية 
  if (w > STOP_W) {
    if (isSliding && vSlip > 0.5) {

      //العلاقة بين السرعة الزاوية و التسارع الزاوي
      const dw = (f * r / I) * dt; //  تاطؤ الدوران ، يجعل الكرة تتوقف عند الدوارن تدريجيا
      const wLen = ball.angularVelocity.length(); //مقدار الدوران الحالي
      ball.angularVelocity.multiplyScalar(Math.max(0, 1 - dw / wLen)); //يحسب نسبة النقصان
    } else {  // إذا لم تعد تنزلق و أصبحت تتدحرج
      const dw_roll = (mu_roll * N * r / I) * dt; //يتم حساب احتكاك التدحرج بدل احتكاك الانزلاق
      const wLen = ball.angularVelocity.length();
      ball.angularVelocity.multiplyScalar(Math.max(0, 1 - dw_roll / Math.max(wLen, 1e-6)));
    }

    //تصفير السرعة الزاوية للكرة إذا وصلت لسرعات صغيرة
    if (ball.angularVelocity.length() < STOP_W) {
      ball.angularVelocity.set(0, 0, 0);
    }
  }

  // ── تحريك الكرة 
  ball.mesh.position.x += ball.velocity.x * dt;
  ball.mesh.position.z += ball.velocity.z * dt;

  // ── الحركة العمودية والجاذبية 
  ball.mesh.position.y += ball.velocity.y * dt; 
  const gravityStrength = g * 30;
  ball.velocity.y -= gravityStrength * dt; //الجاذبية تنقص السرعة العمودية باستمرار

  const ground = ball.radius;
  if (ball.mesh.position.y <= ground) { // إذا لامست الأرض
    ball.mesh.position.y = ground;
    if (Math.abs(ball.velocity.y) > 3) {
      ball.velocity.y *= -0.3; //ترتد الكرة ولكن بسرعة أقل
    } else {
      ball.velocity.y = 0; //توقف
    }
  }

  // ── حساب الطاقة بعد الحركة 
  const v_after = ball.velocity.length();
  const Ek_after = 0.5 * m * v_after * v_after;
  const height = ball.mesh.position.y - ball.radius;
  const Ep = m * g * height * 35; //كلما ارتفع الكرة زادت طاقته الكامنة
  const E_lost = Ek_before - Ek_after; // الطاقة المفقودة 

  // ── تخزين الطاقة في الكرة 
  if (!ball.energy) ball.energy = {};
  ball.energy.kinetic = Ek_after; //الطاقة الحركية
  ball.energy.potential = Math.max(0, Ep); //الطاقة لكامنة
  ball.energy.total = Ek_after + Math.max(0, Ep); // الطاقة الكلية
  ball.energy.lost = (ball.energy.lost || 0) + Math.max(0, E_lost); // الطاقة المفقودة

  // ── دوران الكرة المرئي ───────────────────────────────────────────────
  // if (v > STOP_V) {
  //   const rollAngle = (v * dt) / r;
  //   const axisX = ball.velocity.z / v;
  //   const axisZ = -ball.velocity.x / v;
  //   ball.mesh.rotateOnWorldAxis(new THREE.Vector3(axisX, 0, axisZ), rollAngle);
  // }
}
