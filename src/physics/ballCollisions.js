// src/physics/ballCollision.js
// ─────────────────────────────────────────────────────────────────────────────
// يحل التصادمات بين جميع الكرات (كرة العصا ↔ كرات المثلث ↔ بعضها)
// ─────────────────────────────────────────────────────────────────────────────
// ما لا يُلمس هنا أبداً:
//   • ball.mesh.scale   ← تصادم الكرات لا يغيّر حجمها
//   • ball.mesh.position.y  ← الحركة على محور Y تتولاها motion.js فقط
//   • cue / animation   ← تتولاها cuePhysics.js
// ─────────────────────────────────────────────────────────────────────────────

import {state} from "../core/state.js"

const RESTITUTION   = 1;   // معامل الارتداد
const ITERATIONS    = 8;      // تكرارات لحل التصادمات المتعددة (موجة صدمة)

/**
 * solveBallCollisions — استدعاءها كل إطار بعد updateLinearMotion
 * @param {Array} balls  — كل الكرات في المشهد (بما فيها المنجيبة تُتجاهل)
 */
export function solveBallCollisions(balls) {
  // نصفّي فقط الكرات النشطة (غير منجيبة وموجودة في المشهد)
  const active = balls.filter(b => !b.pocketed && b.mesh.parent);

  if (active.length < 2) return;

  // تكرارات متعددة → تنتج تلقائياً تأثير الموجة التسلسلية عبر المثلث
  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        _resolveCollision(active[i], active[j]);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// الدالة الداخلية — تحل تصادم كرتين
// ─────────────────────────────────────────────────────────────────────────────
function _resolveCollision(a, b) {
  const pa = a.mesh.position;
  const pb = b.mesh.position;

  const dx   = pb.x - pa.x;
  const dz   = pb.z - pa.z;
  // نتجاهل Y: الكرات على نفس الارتفاع — التصادم ثنائي الأبعاد (XZ)
  const dist = Math.hypot(dx, dz);

  const ra      = a.radius ?? state.BALL.r;
  const rb      = b.radius ?? state.BALL.r;
  const minDist = ra + rb;

  // لا تصادم
  if (dist >= minDist || dist < 1e-6) return;

  // ── 1. اتجاه التصادم (a → b) ──────────────────────────────────────────
  const nx = dx / dist;
  const nz = dz / dist;

  // ── 2. تصحيح التداخل — الكرات تُدفع للخارج دون تغيير scale ──────────
  const overlap = (minDist - dist) * 0.5;
  pa.x -= nx * overlap;
  pa.z -= nz * overlap;
  pb.x += nx * overlap;
  pb.z += nz * overlap;

  // ── 3. السرعة النسبية على محور التصادم ───────────────────────────────
  const dvx = b.velocity.x - a.velocity.x;
  const dvz = b.velocity.z - a.velocity.z;
  const velAlongNormal = dvx * nx + dvz * nz;

  // الكرتان تتباعدان أصلاً — لا نحتاج impulse
  if (velAlongNormal > 0) return;

  // ── 4. حساب النبضة (Impulse) ──────────────────────────────────────────
  const ma = a.mass ?? 1;
  const mb = b.mass ?? 1;

  const impulse = -(1 + RESTITUTION) * velAlongNormal / (1 / ma + 1 / mb);

  // ── 5. تطبيق النبضة على سرعة كل كرة ─────────────────────────────────
  a.velocity.x -= (impulse / ma) * nx;
  a.velocity.z -= (impulse / ma) * nz;

  b.velocity.x += (impulse / mb) * nx;
  b.velocity.z += (impulse / mb) * nz;

  // ملاحظة: لا نمس a.velocity.y / b.velocity.y لأن الكرات ثابتة رأسياً
}
