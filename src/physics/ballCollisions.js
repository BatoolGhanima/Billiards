// src/physics/ballCollision.js

import { state } from "../core/state.js";

const RESTITUTION = 0.95; // تصادم شبه مرن معامل الارتداد
const ITERATIONS = 8; //عدد المرات التي تعيج فيها الخوارزمية حساب التصادم ضمن كل فريم

// متغير للاحتفاظ بالصوت وتجنب حظر المتصفح
let hitSound = null; 

// دالة لتهيئة الصوت بأمان بعد تفاعل المستخدم
function _initSound() {
  if (!hitSound) {
    hitSound = new Audio("ball_hit.mp3");
    hitSound.preload = "auto"; 
  }
}

function playCollisionSound(relativeVelocity) {
  _initSound();

  if (!hitSound) return;

  // استنساخ الصوت للسماح بتداخل الأصوات
  const soundClone = hitSound.cloneNode();
  
  // ضبط مستوى الصوت بناءً على السرعة النسبية للتصادم
  let volume = Math.min(relativeVelocity / 150, 1);
  
  // تجاهل الأصوات الضعيفة الناتجة عن الاحتكاك البسيط
  if (volume > 0.05) {
    soundClone.volume = volume;
    soundClone.play().catch(() => {
      // تجنب أخطاء المتصفح إذا لم يتفاعل المستخدم بعد
    });
  }
}

//دالة حساب التصادم تستدعى كل فريم
export function solveBallCollisions(balls) {

  // فحص آمن لمنع الانهيار والتأكد من وجود الكرات داخل المشهد
  const active = balls.filter(b => b && !b.pocketed && b.mesh && b.mesh.parent);
  if (active.length < 2) return; // إذا كان في أقل من كرتين لا تعمل تصادم


  //الحلقة الأولى تعيد الحل 8 مرات
  for (let iter = 0; iter < ITERATIONS; iter++) {
    // تمر على الكرة الأولى
    for (let i = 0; i < active.length; i++) {

     // تمر على بقية الكرات
      for (let j = i + 1; j < active.length; j++) {
        _resolveCollision(active[i], active[j]); // هذه تح لالتصادم
      }
    }
  }
}


//دالة حل التصادم
function _resolveCollision(a, b) {
  const pa = a.mesh.position; //موقع الكرة الأولى
  const pb = b.mesh.position; //موقع الثانية

  //حساب الفرق لحسا بالمسافة
  const dx = pb.x - pa.x;
  const dz = pb.z - pa.z;

  //حساب المسافة بين نقطتين
  const dist = Math.hypot(dx, dz); // هذه الدالة تربع الأول و تربع الثاني وتعيد المجموع

  const ra = a.radius ?? state.BALL.cueRadius;
  const rb = b.radius ?? state.BALL.objectRadius;

  const minDist = ra + rb;

  //إذا كانت المسافة أكبر من مجموعي نصفي القطرين لا يوجد تصادم
  if (dist >= minDist || dist < 1e-6) return;

  // ── حساب الطاقة قبل التصادم ──────────────────────────────────────────
  const ma = a.mass ?? 1;
  const mb = b.mass ?? 1;
  const Ek_before = 0.5 * ma * a.velocity.length() ** 2 + 
                    0.5 * mb * b.velocity.length() ** 2;

  // ── اتجاه التصادم ────────────────────────────────────────────────────
  const nx = dx / dist;  //تقسيم متجه المسافة على طوله لينتج متجه وحدة طوله دائما 1
  const nz = dz / dist;

  // ── تصحيح التداخل ────────────────────────────────────────────────────
  const overlap = (minDist - dist) * 0.5;
  pa.x -= nx * overlap; //يرجع الأولى للخلف
  pa.z -= nz * overlap;
  pb.x += nx * overlap; //يدفع الثانية للأمام
  pb.z += nz * overlap;

  // ── السرعة النسبية ──────────────────────────────────────────────────
  const dvx = b.velocity.x - a.velocity.x;
  const dvz = b.velocity.z - a.velocity.z;
  const velAlongNormal = dvx * nx + dvz * nz; //إسقط السرعة على اتجاه التصادم

  if (velAlongNormal > 0) return; //

  // ── التعديل الجديد: تشغيل الصوت فقط إذا كانت أحد الكرتين المتصادمتين هي الكرة البيضاء ──
  if (a.name === "cue" || b.name === "cue") {
    const hitIntensity = Math.abs(velAlongNormal);
    playCollisionSound(hitIntensity);
  }

  // ── حساب النبضة 
  //كمية الحركة المنقولة أثناء التصادم
  const impulse = -(1 + RESTITUTION) * velAlongNormal / (1 / ma + 1 / mb);

  // ── تطبيق النبضة 

  //كل كرة تأخذ جزءا من كمية الحركة حسب كتلتها
  a.velocity.x -= (impulse / ma) * nx; //تقل سرعة الأولى
  a.velocity.z -= (impulse / ma) * nz;
  b.velocity.x += (impulse / mb) * nx; // تزداد سرعة الثانية
  b.velocity.z += (impulse / mb) * nz;
  
  //إذا كانت الجاذبية صغيرة مثل القمر
  //والسرعة كبيرة
  //تقفز الكرات
if (state.physics.gravity < 0.3) { 
  const collisionSpeed = Math.abs(velAlongNormal);
  
  // إذا كان التصادم قوياً بما يكفي، تندفع الكرات للأعلى قليلاً
  if (collisionSpeed > 20) { 
    const liftFactor = 0.02; // معامل الرفع على المحور العمودي
    
    // إعطاء سرعة عمودية صغيرة للكرتين بناءً على قوة الاصطدام
    a.velocity.y += collisionSpeed * liftFactor;
    b.velocity.y += collisionSpeed * liftFactor;
  }
}
  // ── حساب الطاقة بعد التصادم 
  const Ek_after = 0.5 * ma * a.velocity.length() ** 2 + 
                   0.5 * mb * b.velocity.length() ** 2;
  const E_collisionLost = Math.max(0, Ek_before - Ek_after);

  // ── تخزين الطاقة المفقودة في الكرات 
  if (!a.energy) a.energy = {};
  if (!b.energy) b.energy = {};
  a.energy.collisionLost = (a.energy.collisionLost || 0) + E_collisionLost * 0.5;
  b.energy.collisionLost = (b.energy.collisionLost || 0) + E_collisionLost * 0.5;
}