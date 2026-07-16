// src/physics/pocketPhysics.js

import { state } from "../core/state.js";

// العمق الذي ستختفي عنده الكرة داخل الجيب
const POCKET_DEPTH = 18;

// متغير لتخزين عدد النقاط الحالية
let currentScore = 0;

// دالة لتحديث النقاط في واجهة اللعبة
function _updateScoreUI(amount) {

    // نضيف أو نطرح النقاط
    currentScore += amount;

    // حتى لا تصبح النقاط سالبة
    if (currentScore < 0)
        currentScore = 0;

    // الحصول على عنصر عرض النقاط
    const score = document.getElementById("scoreText");

    // إذا كان العنصر موجوداً نحدث القيمة
    if (score)
        score.innerText = currentScore;
}

// دالة فحص دخول الكرات إلى الجيوب
export function detectPockets(balls, pockets, scene) {

    // المرور على جميع الكرات الموجودة في اللعبة
    for (const ball of balls) {

        // إذا كانت الكرة دخلت الجيب سابقاً نتابع حركة سقوطها
        if (ball.pocketed) {
            _animateSink(ball, scene);
            continue;
        }

        // المرور على جميع الجيوب
        for (const pocket of pockets) {

            // الحصول على إحداثيات الجيب
            const pocketX =
                pocket.position ? pocket.position.x : pocket.x;

            const pocketZ =
                pocket.position ? pocket.position.z : pocket.z;

            // نصف قطر الجيب
            const pocketR =
                pocket.r ?? pocket.userData?.radius ?? 9;

            // الفرق بين مركز الكرة ومركز الجيب
            const dx = ball.mesh.position.x - pocketX;
            const dz = ball.mesh.position.z - pocketZ;

            // حساب المسافة بينهما
            const dist = Math.hypot(dx, dz);

            // إذا أصبحت الكرة قريبة بما يكفي نعتبر أنها دخلت الجيب
            if (dist < pocketR + ball.radius) {

                // إذا كانت الكرة البيضاء
                if (ball.name === "cue") {

                    // نوقف جميع حركاتها
                    ball.velocity.set(0,0,0);
                    ball.angularVelocity.set(0,0,0);

                    // نعيدها إلى منتصف الطاولة
                    ball.mesh.position.set(
                        0,
                        ball.radius,
                        0
                    );

                    // خصم نقطة بسبب الخطأ
                    _updateScoreUI(-1);
                }

                // إذا كانت أي كرة أخرى
                else {

                    // نعتبر أنها دخلت الجيب
                    ball.pocketed = true;

                    // ننقلها إلى مركز الجيب
                    ball.mesh.position.x = pocketX;
                    ball.mesh.position.z = pocketZ;

                    // نوقف حركتها الأفقية والدورانية
                    ball.velocity.set(0,0,0);
                    ball.angularVelocity.set(0,0,0);

                    // تبدأ بالسقوط من السكون
                    ball.velocity.y = 0;

                    // إذا كانت الكرة السوداء تنتهي اللعبة
                    if(ball.name==="ball_5"){

                        const gameOver =
                            document.getElementById("gameOverScreen");

                        if(gameOver)
                            gameOver.style.display="grid";
                    }

                    // باقي الكرات تزيد نقطة
                    else{

                        _updateScoreUI(1);
                    }
                }

                // نتوقف عن فحص بقية الجيوب لهذه الكرة
                break;
            }
        }
    }
}
// دالة تحاكي سقوط الكرة داخل الجيب
function _animateSink(ball, scene){

    // إذا كانت الكرة محذوفة من المشهد لا نكمل
    if(!ball.mesh.parent)
        return;

    // الزمن بين كل إطار والذي يعتمد عليه تحديث الحركة
    const dt = 1 / 60;

    // قيمة تسارع الجاذبية المستخدمة في اللعبة
    const g = state.physics.gravity * 30;

    // تطبيق قانون الجاذبية
    // الجاذبية تنقص السرعة العمودية مع مرور الزمن
    // v = v - g × dt
    ball.velocity.y -= g * dt;

    // تحديث ارتفاع الكرة حسب سرعتها الحالية
    // y = y + v × dt
    ball.mesh.position.y += ball.velocity.y * dt;

    // نحسب مقدار العمق الذي وصلت إليه الكرة داخل الجيب
    const depth = Math.max(
        0,
        POCKET_DEPTH + ball.mesh.position.y
    );

    // كلما زاد العمق نصغر حجم الكرة تدريجياً
    const scale = Math.max(
        0,
        depth / POCKET_DEPTH
    );

    // تصغير الكرة ليظهر أنها تبتعد داخل الجيب
    ball.mesh.scale.setScalar(scale);

    // عندما تصل الكرة إلى قاع الجيب نحذفها من المشهد
    if(ball.mesh.position.y < -POCKET_DEPTH){

        scene.remove(ball.mesh);
    }
}