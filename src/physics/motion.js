// src/physics/motion.js
// محدَّث بقوانين الدراسة الفيزيائية المعمقة:
//   - احتكاك انزلاقي:  f = μ_k * N
//   - احتكاك تدحرجي:  f_r = μ_r * N
//   - مقاومة الهواء:  F_d = 0.5 * ρ * v² * C_d * A
//   - I = (2/5) * m * r²  لنقل الدوران إلى حركة انتقالية
//   - انتقال من الانزلاق إلى التدحرج عندما v_slip → 0

// ── ثوابت فيزيائية (الوحدات: سم، جرام، ثانية) ───────────────────────────
const g          = 0.5;     // cm/s² — تسارع الجاذبية
const rho        = 0.0;   // g/cm³ — كثافة الهواء
const Cd         = 0.47;      // معامل السحب للكرة الكروية الملساء
const mu_slide   = 0.15;      // معامل الاحتكاك الانزلاقي على اللباد
const mu_roll    = 0.012;     // معامل الاحتكاك التدحرجي على اللباد
const STOP_V     = 0.4;       // حد التوقف الخطي (cm/s)
const STOP_W     = 0.5;       // حد التوقف الزاوي (rad/s)

export function updateLinearMotion(ball, dt) {
  const v  = ball.velocity.length();
  const w  = ball.angularVelocity.length();

  // ── توقف كامل عند سرعات صغيرة جداً ────────────────────────────────────
  if (v < STOP_V && w < STOP_W) {
    ball.velocity.set(0, 0, 0);
    ball.angularVelocity.set(0, 0, 0);
    return;
  }

  const m  = ball.mass;
  const r  = ball.radius;
  const N  = m * g;                     // القوة العمودية: N = m * g
  const A  = Math.PI * r * r;           // المقطع العرضي: A = π r²
  const I  = (2 / 5) * m * r * r;      // عزم القصور: I = (2/5) m r²

  // ── سرعة الانزلاق (الفرق بين الحركة الانتقالية والدوران) ───────────────
  // v_slip = v - ω × r  (على سطح الطاولة)
  const vSlipX = ball.velocity.x - ball.angularVelocity.z * r;
  const vSlipZ = ball.velocity.z + ball.angularVelocity.x * r;
  const vSlip  = Math.sqrt(vSlipX * vSlipX + vSlipZ * vSlipZ);

  const isSliding = vSlip > 0.5;

  // ── مقاومة الهواء: F_d = 0.5 * ρ * v² * C_d * A ────────────────────────
  let Fd = 0;
  if (v > 0.1) {
    Fd = 0.5 * rho * v * v * Cd * A;
  }

  // ── قوة الاحتكاك الكلية ─────────────────────────────────────────────────
  const mu  = isSliding ? mu_slide : mu_roll;
  const f   = mu * N;                   // f = μ * N

  // المقدار الكلي للتباطؤ (الاحتكاك + مقاومة الهواء)
  const decelForce = f + Fd;
  const decel      = decelForce / m;

  // ── تحديث السرعة الخطية ─────────────────────────────────────────────────
  if (v > STOP_V) {
    // طبّق قوة الاحتكاك عكس اتجاه الحركة
    const dvx = -(ball.velocity.x / v) * decel * dt;
    const dvz = -(ball.velocity.z / v) * decel * dt;

    ball.velocity.x += dvx;
    ball.velocity.z += dvz;

    // لا تدع الاحتكاك يعكس اتجاه الحركة
    if (ball.velocity.length() < STOP_V) {
      ball.velocity.set(0, 0, 0);
    }
  }

  // ── تحديث السرعة الزاوية ────────────────────────────────────────────────
  // في مرحلة الانزلاق: الاحتكاك يسرّع الدوران نحو حالة التدحرج النقي
  // في مرحلة التدحرج: الاحتكاك التدحرجي يبطئ الدوران ببطء
  if (w > STOP_W) {
    if (isSliding && vSlip > 0.5) {
      // عزم الاحتكاك يغير السرعة الزاوية: τ = r × f → Δω = τ/I * dt
      const dw  = (f * r / I) * dt;
      const wLen = ball.angularVelocity.length();
      ball.angularVelocity.multiplyScalar(Math.max(0, 1 - dw / wLen));
    } else {
      // تدحرج نقي — تخميد بطيء بالاحتكاك التدحرجي
      const dw_roll = (mu_roll * N * r / I) * dt;
      const wLen    = ball.angularVelocity.length();
      ball.angularVelocity.multiplyScalar(Math.max(0, 1 - dw_roll / Math.max(wLen, 1e-6)));
    }

    if (ball.angularVelocity.length() < STOP_W) {
      ball.angularVelocity.set(0, 0, 0);
    }
  }

  // ── تحريك الكرة ─────────────────────────────────────────────────────────
  ball.mesh.position.addScaledVector(ball.velocity, dt);

  // ── دوران الكرة المرئي بناءً على السرعة الخطية ──────────────────────────
  // θ = v * dt / r  حول المحور العمودي على اتجاه الحركة
  if (v > STOP_V) {
    const rollAngle = (v * dt) / r;
    // محور الدوران: عمودي على اتجاه الحركة في المستوى الأفقي
    const axisX =  ball.velocity.z / v;
    const axisZ = -ball.velocity.x / v;
    ball.mesh.rotateOnWorldAxis(new THREE.Vector3(axisX, 0, axisZ), rollAngle);
  }
}
