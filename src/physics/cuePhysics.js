// src/physics/cuePhysics.js

import { state } from "../core/state.js";
import { showFoul } from "../ui/foul.js";

const THREE = window.THREE;


// ثوابت الحركة

const PULL_SPEED      = 18;
const STRIKE_SPEED    = 520;
const ROTATE_SPEED    = 1.8;
const OFFSET_SPEED    = 1.2;
const ELEVATION_SPEED = 2.0;


// متجهات يعاد استخدامها

const _shotDir     = new THREE.Vector3();  //اتجاه الضربة
const _rightDir    = new THREE.Vector3();  //الاتجاه العمودي على اتجاخه الضربة
const _impactPoint = new THREE.Vector3();  // نقطة ضرب العصا على الكرة 
const _strikeDir   = new THREE.Vector3();  // لااتجاه النهائي الذي ستتحرك فيه الكرة


// تدوير العصا

//قانون الحركة الدورانية
//θ= θ + ωΔt
export function rotateCue(cue, dir, dt) {
    cue.userData.angle += dir * ROTATE_SPEED * dt;
}


// سحب العصا

export function pullCue(cue, dt) {

    //تطبيق قانون الحركة المنتظمة x=x+vt
    cue.userData.pullBack += PULL_SPEED * dt;

    //تفيد السحب بحيث يكون بين الصفر و pullmax
    cue.userData.pullBack = THREE.MathUtils.clamp(
        cue.userData.pullBack,
        0,
        cue.userData.maxPullBack
    );
}


// رفع العصا

export function elevateCue(cue, dir, dt) {
    cue.userData.elevation += dir * ELEVATION_SPEED * dt;
    cue.userData.elevation = THREE.MathUtils.clamp(
        cue.userData.elevation,
        0,
        cue.userData.maxElevation
    );
}


// تحريك نقطة الضرب أفقياً

export function moveImpactX(cue, dir, dt) {
    cue.userData.offsetX += dir * OFFSET_SPEED * dt;
    cue.userData.offsetX = THREE.MathUtils.clamp(
        cue.userData.offsetX,
        -cue.userData.maxOffset,
        cue.userData.maxOffset
    );
}


// تحريك نقطة الضرب عمودياً
export function moveImpactY(cue, dir, dt) {
    cue.userData.offsetY += dir * OFFSET_SPEED * dt;
    cue.userData.offsetY = THREE.MathUtils.clamp(
        cue.userData.offsetY,
        -cue.userData.maxOffset,
        cue.userData.maxOffset
    );
}


// تحديث موقع العصا 

export function updateCue(cue, cueBallMesh) {
    const angle     = cue.userData.angle ?? 0;
    const pullBack  = cue.userData.pullBack ?? 0;
    const elevation = cue.userData.elevation ?? 0;
    const offsetX   = cue.userData.offsetX ?? 0;
    const offsetY   = cue.userData.offsetY ?? 0;

    const r         = state.BALL?.cueRadius ?? 3.2;
    const cueLength = cue.userData.length ?? 145;

    // ── اتجاه الضربة 
    //تحويل الزاوية إلى متجه
    _shotDir.set(Math.sin(angle), 0, -Math.cos(angle)).normalize();

    // ── الاتجاه الجانبي 
    _rightDir.set(Math.cos(angle), 0, Math.sin(angle)).normalize();

    // ── نقطة التلامس على سطح الكرة 
    _impactPoint.copy(cueBallMesh.position)
        .addScaledVector(_rightDir, offsetX * r)
        .setY(cueBallMesh.position.y + offsetY * r);

    // ── المسافة من نقطة التلامس إلى مركز العصا ──────────────────────────
    const tipOffset = 3.5;
    const gap       = 0.8;
    const armLength = cueLength / 10 + tipOffset + gap + pullBack;

    // ── موقع مركز العصا 
    cue.position.copy(_impactPoint) // تبدأ من نقطة الاصطدام
        .addScaledVector(_shotDir, -armLength); //ثم ترجع العصا للخلف

    // ── رفع العصا من الجذع 
    const baseLift = 10.0;
    if (elevation > 0.01) {
        const halfLength = cueLength / 2;
        const liftAmount = Math.sin(elevation) * halfLength * 0.5;
        cue.position.y = _impactPoint.y + liftAmount + baseLift;
        cue.rotation.x = -elevation;
    } else {
        cue.position.y = _impactPoint.y + baseLift;
        cue.rotation.x = -0.05;
    }

    // ── منع العصا من الغوص في الطاولة 
    cue.position.y = Math.max(cue.position.y, r + 2.0);

    // ── منع اختراق الجدران 
    const margin = 8;
    const halfW  = state.TABLE.width  / 2 - margin;
    const halfL  = state.TABLE.length / 2 - margin;
    cue.position.x = THREE.MathUtils.clamp(cue.position.x, -halfW, halfW);
    cue.position.z = THREE.MathUtils.clamp(cue.position.z, -halfL, halfL);

    // ── تدوير العصا أفقياً 
    cue.rotation.y = Math.PI - angle;

    cue.visible = true;
}


// //==================================================
// // وميض الكرة عند الخطأ
// //==================================================
function _flashBall(ball) {
    if (!ball || !ball.mesh) return;
    const oldColor = ball.mesh.material.color.getHex();
    ball.mesh.material.color.set(0xff0000);
    setTimeout(() => {
        ball.mesh.material.color.set(oldColor);
    }, 500);}




// بدء الضربة (حفظ القيمة الابتدائية للسحب لضبط سرعة ووصول الأنيميشن)

export function strikeCue(cue, ball) {
    if (ball.name !== "cue") {
        showFoul();
        return;
    }

    if (cue.userData.striking) return;
    if (cue.userData.pullBack <= 0) return;

    cue.userData.striking     = true;
    cue.userData.strikeTarget = ball;
    cue.userData.strikePower  = cue.userData.pullBack * (state.cue?.powerFactor ?? 120);

    // حفظ معلومات نقطة الضرب
    cue.userData.hitElevation = cue.userData.elevation ?? 0;
    cue.userData.hitOffsetX   = cue.userData.offsetX ?? 0;
    cue.userData.hitOffsetY   = cue.userData.offsetY ?? 0;

    // : حفظ المسافة الكلية التي يجب أن تقطعها العصا لتصل وتلمس الكرة تماماً
    const cueLength = cue.userData.length ?? 145;
    const tipOffset = 3.5;
    const gap       = 0.8;
    // المسافة الثابتة المتبقية حتى التلامس الصفر الصريح
    const baseArmLength = cueLength / 10 + tipOffset + gap; 
    
    // الأنيميشن سيبدأ من (baseArmLength + pullBack) وينتهي عند الصفر الحقيقي للتلامس
    cue.userData.strikeProgress = cue.userData.pullBack;
}


// تنفيذ حركة الضربة حتى التلامس 100%

export function updateStrikeAnimation(cue, dt) {
    if (!cue.userData.striking) return;

    // تحريك العصا للأمام بسرعة عالية عبر تقليص المسافة المتبقية
    cue.userData.pullBack -= STRIKE_SPEED * dt;

    // الطول الفعلي المتبقي في الفضاء للوصول للمس الصريح للكرة
    const cueLength = cue.userData.length ?? 145;
    const tipOffset = 3.5;
    const gap       = 0.8;
    const baseArmLength = cueLength / 10 + tipOffset + gap;

    const minPullBackAllowed = -baseArmLength;

    if (cue.userData.pullBack < minPullBackAllowed) {
        cue.userData.pullBack = minPullBackAllowed;
    }

    // تحديث موقع العصا المرئي أثناء اندفاعها للأمام
    if (cue.userData.strikeTarget) {
        updateCue(cue, cue.userData.strikeTarget.mesh);
    }

    // الشرط الحاسم: لا تطلق الكرة حتى يستهلك الأنيميشن كل المسافة الفاصلة وتلمس الكرة 100%
    if (cue.userData.pullBack > minPullBackAllowed) return;

    // ── لحظة التصادم الفعلي مية بالمية 
    const ball = cue.userData.strikeTarget;
    if (!ball) return;

    const power     = cue.userData.strikePower;
    const angle     = cue.userData.angle ?? 0;
    const elevation = cue.userData.hitElevation ?? 0;
    const offsetX   = cue.userData.hitOffsetX ?? 0;
    const offsetY   = cue.userData.hitOffsetY ?? 0;

    // حساب سرعة انطلاق الكرة بناءً على القوة المحفوظة
    const energy = Math.max(power, 100);
    const velocity = Math.sqrt((2 * energy) / Math.max(ball.mass, 0.001));

    // اتجاه الضربة
    _strikeDir.set(Math.sin(angle), 0, -Math.cos(angle)).normalize();

    // تعيين السرعة للكرة في نفس لحظة الملامسة البصرية والفيزيائية
    //السرعة = الاتجاه * السرعة
    ball.velocity.copy(_strikeDir).multiplyScalar(velocity);

    // إخفاء العصا فوراً بعد اللمس
    cue.visible = false;

    // ضربة القفز إذا كانت العصا مرتفعة
    if (elevation > 0.2) {
        ball.velocity.y += Math.sin(elevation) * velocity * 0.5;
    }

    // حساب وتخزين الطاقة في الكرة البيضاء
    if (!ball.energy) ball.energy = {};
    ball.energy.kinetic = 0.5 * ball.mass * ball.velocity.length() ** 2; //قانون الطاقة الحركية
    ball.energy.potential = ball.mass * state.physics.gravity * (ball.mesh.position.y - ball.radius) * 35; // الطاقة الكامنة E
    ball.energy.total = ball.energy.kinetic + ball.energy.potential;

    // تدوير الكرة (Spin) بناءً على نقطة الضرب
    //الضربة خارج مركز الكرة تولد عزم دوران
    if (!ball.angularVelocity) ball.angularVelocity = new THREE.Vector3();
    const spinFactor = 0.42;
    ball.angularVelocity.x += offsetY * velocity * spinFactor; //بتولد دوران حول محور إكس إذا كانت الضربة أعلى و أسفل
    ball.angularVelocity.z -= offsetX * velocity * spinFactor; // يتولد دوران حول محور زيد إذا كانت الضربة يمين أو يسار 

    if (!ball.spin) ball.spin = new THREE.Vector3();
    ball.spin.set(offsetX, 0, offsetY);

    // إعادة تعيين متغيرات العصا للاستعداد للضربة التالية وتصفير السحب
    cue.userData.striking     = false;
    cue.userData.strikeTarget = null;
    cue.userData.strikePower  = 0;
    cue.userData.pullBack     = 0; 
}