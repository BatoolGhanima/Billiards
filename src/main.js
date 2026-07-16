

// src/main.js

import { state } from "./core/state.js";

import { buildTable } from "./scene/table.js";
import { createBalls } from "./scene/balls.js";
import { createPockets } from "./scene/pockets.js";
import { createCueStick } from "./scene/cue.js";

import { setupKeyboard } from "./controls/input.js";

import {
    updateKeyboardCamera,
    updateCueCamera
} from "./controls/cameraKeyboard.js";

import {
    updateLinearMotion
} from "./physics/motion.js";

import {

    updateCue,

    pullCue,

    rotateCue,

    elevateCue,

    moveImpactX,

    moveImpactY,

    strikeCue,

    updateStrikeAnimation

} from "./physics/cuePhysics.js";

import {
    solveWallCollision
} from "./physics/wall.js";

import {
    solveBallCollisions
} from "./physics/ballCollisions.js";

import {
    detectPockets
} from "./physics/pocketPhysics.js";

import {
    selectNextBall
} from "./controls/ballSelector.js";

import {
    createSettingsPanel
} from "./settingsPanel.js";



// منع تشغيل اللعبة مرتين


let animationStarted = false;



// تحميل الصفحة


window.addEventListener("load", () => {

    document
        .getElementById("backBtn")
        .addEventListener("click", () => {

            location.reload();

        });

    document
        .getElementById("settingsBtn")
        .addEventListener(
            "click",
            openSettings
        );

    document
        .getElementById("playBtn")
        .addEventListener(
            "click",
            startWithSettings
        );

});



// شاشة الإعدادات


function openSettings() {

    document.getElementById(
        "startScreen"
    ).style.display = "none";

    document.getElementById(
        "settingsScreen"
    ).style.display = "grid";

}



// قراءة الإعدادات


function startWithSettings() {

    
    // خصائص الكرة
    

   state.BALL.cueRadius = parseFloat(document.getElementById("cueRadius").value);
state.BALL.cueMass = parseFloat(document.getElementById("cueMass").value);
state.BALL.objectRadius = parseFloat(document.getElementById("objectRadius").value);
state.BALL.objectMass = parseFloat(document.getElementById("objectMass").value);

    
    // خصائص الفيزياء
    

    state.physics.gravity =
        parseFloat(
            document.getElementById("gravity").value
        );

    state.physics.airDensity =
        parseFloat(
            document.getElementById("airDensity").value
        );

    state.physics.slideFriction =
        parseFloat(
            document.getElementById("slideFriction").value
        );

    state.physics.rollFriction =
        parseFloat(
            document.getElementById("rollFriction").value
        );

    
    // قوة العصا
    

    state.cue.powerFactor =
        parseFloat(
            document.getElementById("cuePower").value
        );

    
    // إغلاق نافذة الإعدادات
    

    document.getElementById(
        "settingsScreen"
    ).style.display = "none";

    startGame();

}




// بدء اللعبة


function startGame() {

    if (animationStarted)
        return;

    animationStarted = true;

    console.log("================================");

    console.log("Cue Ball Radius",
        state.BALL.cueRadius);

    console.log("Cue Ball Mass",
        state.BALL.cueMass);

    console.log("Object Radius",
        state.BALL.objectRadius);

    console.log("Object Mass",
        state.BALL.objectMass);

    console.log("Gravity",
        state.physics.gravity);

    console.log("Air Density",
        state.physics.airDensity);

    console.log("Slide Friction",
        state.physics.slideFriction);

    console.log("Roll Friction",
        state.physics.rollFriction);

    console.log("Cue Power",
        state.cue.powerFactor);

    console.log("================================");


    document.getElementById(
        "backBtn"
    ).style.display = "block";


    initThree();

    setupKeyboard(state);

    buildWorld();

    animate();

}



// إنشاء مشهد Three.js


function initThree() {


// ── عنصر عرض الطاقة 
const energyDiv = document.createElement('div');
energyDiv.style.position = 'fixed';
energyDiv.style.bottom = '20px';
energyDiv.style.left = '20px';
energyDiv.style.color = '#00ff00';
energyDiv.style.fontFamily = 'monospace';
energyDiv.style.fontSize = '13px';
energyDiv.style.zIndex = '1000';
energyDiv.style.background = 'rgba(0,0,0,0.7)';
energyDiv.style.padding = '10px';
energyDiv.style.borderRadius = '8px';
energyDiv.textContent = 'Energy: 0.00';
document.body.appendChild(energyDiv);
state.energyDisplay = energyDiv;





    state.scene = new THREE.Scene();
    state.scene.background =
        new THREE.Color(0x111218);

    
    // الكاميرا
    

    state.camera =
        new THREE.PerspectiveCamera(

            60,

            window.innerWidth /
            window.innerHeight,

            0.1,

            2000

        );

    state.camera.position.set(

        0,

        110,

        220

    );

    state.camera.lookAt(

        0,

        15,

        -40

    );

    state.camera.rotation.order = "YXZ";

    
    // الحفظ عند تبديل كاميرا العصا
    

    state.savedCamera = {

        position:
            new THREE.Vector3(),

        yaw: 0,

        pitch: 0

    };

    state.cameraMode = "free";

    
    // Renderer
    

    state.renderer =
        new THREE.WebGLRenderer({

            antialias: true

        });

    state.renderer.setSize(

        window.innerWidth,

        window.innerHeight

    );

    state.renderer.shadowMap.enabled = true;

    document.body.appendChild(

        state.renderer.domElement

    );

          
    // الإضاءة
          

    state.scene.add(

        new THREE.AmbientLight(

            0xffffff,

            0.35

        )

    );

    const light =
        new THREE.DirectionalLight(

            0xffffff,

            0.9

        );

    light.position.set(

        0,

        220,

        80

    );

    light.castShadow = true;

    state.scene.add(light);

          
    // Clock
          

    state.clock =
        new THREE.Clock();

          
    // Resize
          

    window.addEventListener(

        "resize",

        () => {

            state.camera.aspect =

                window.innerWidth /
                window.innerHeight;

            state.camera.updateProjectionMatrix();

            state.renderer.setSize(

                window.innerWidth,

                window.innerHeight

            );

        }

    );

}




// بناء العالم


function buildWorld() {


          
    // الطاولة
          

    const table =

        buildTable(

            state.scene,

            state.TABLE

        );

    state.tableSurface =
        table.tableSurface;

    state.walls =
        table.walls;

          
    // الجيوب
          

    state.pockets =

        createPockets(

            state.scene,

            state.TABLE

        );

          
    // الكرات
          

    state.balls =

        createBalls(

            state.scene,

            state.TABLE,

            state.BALL

        );

          
    // الكرة البيضاء
          

    const cueBall =

        state.balls.find(

            b => b.name === "cue"

        );

          
    // العصا
          

    state.cueStick =

        createCueStick(

            state.scene,

            cueBall.mesh

        );

          
    // الكرة المختارة
          

    state.selectedBallIndex =

        state.balls.findIndex(

            b => b.name === "cue"

        );



                  
    // Space = تنفيذ الضربة
          

    window.addEventListener("keydown", (e) => {

        if (e.code !== "Space")
            return;

        if (state.cueStick.userData.striking)
            return;

        const cueBall =
            state.balls.find(
                b => b.name === "cue"
            );

        strikeCue(

            state.cueStick,

            cueBall

        );

    });

          
    // تبديل الكاميرا
          

    window.addEventListener("keydown", (e) => {

        if (e.code !== "KeyC")
            return;

        if (state.cameraMode === "free") {

            state.savedCamera.position.copy(

                state.camera.position

            );

            state.savedCamera.yaw =
                state.input.yaw;

            state.savedCamera.pitch =
                state.input.pitch;

            state.cameraMode = "cue";

        }

        else {

            state.cameraMode = "free";

            state.camera.position.copy(

                state.savedCamera.position

            );

            state.input.yaw =
                state.savedCamera.yaw;

            state.input.pitch =
                state.savedCamera.pitch;

        }

    });

          
    // اختيار الكرة التالية
          

    window.addEventListener("keydown", (e) => {

        if (e.code !== "Tab")
            return;

        e.preventDefault();

        selectNextBall();

    });

}




        
// هل توجد كرة تتحرك؟ (معدلة لوضع القمر والأرض تلقائياً)
        
function anyBallMoving() {
    // إذا كانت الجاذبية منخفضة (وضع القمر)، نرفع الحساسية جداً إلى 0.01 لأن الكرات تبطئ بصعوبة
    const threshold = state.physics.gravity < 0.3 ? 0.01 : 0.15;
    
    return state.balls.some(b => !b.pocketed && b.velocity.length() > threshold);
}




        
// الحلقة الرئيسية
        

function animate() {


// ── حساب وعرض الطاقة الكلية 
let totalEk = 0;
let totalEp = 0;
let totalLost = 0;

for (const ball of state.balls) {
    if (ball.pocketed) continue;
    if (ball.energy) {
        totalEk += ball.energy.kinetic || 0;
        totalEp += ball.energy.potential || 0;
        totalLost += ball.energy.lost || 0;
        totalLost += ball.energy.collisionLost || 0;
    }
}

if (state.energyDisplay) {
    state.energyDisplay.innerHTML = 
        `Kinetic: ${totalEk.toFixed(2)} | ` +
        `Potential: ${totalEp.toFixed(2)} | ` +
        `Lost: ${totalLost.toFixed(2)} | ` +
        `Total: ${(totalEk + totalEp + totalLost).toFixed(2)}`;
}


    requestAnimationFrame(animate);

          
    // الزمن بين الإطارات
          

    const dt = Math.min(

        state.clock.getDelta(),

        0.033

    );

          
    // الكرة البيضاء
          

    const cueBall =

        state.balls.find(

            ball => ball.name === "cue"

        );

    if (!cueBall || !state.cueStick)
        return;

          
    // تحديث حركة جميع الكرات
          

    for (const ball of state.balls) {

        if (ball.pocketed)
            continue;

        updateLinearMotion(

            ball,

            dt

        );

        solveWallCollision(

            ball,

            state.TABLE

        );

    }

          
    // تصادم الكرات
          

    solveBallCollisions(

        state.balls

    );

          
    // كشف الجيوب
          

    detectPockets(

        state.balls,

        state.pockets,

        state.scene

    );

          
    // هل توجد كرة تتحرك؟
          

    const ballsMoving =

        anyBallMoving();

          
    // هل العصا تضرب؟
          

    const striking =

        state.cueStick.userData.striking;


        
         
// العصا
      

// ── التحكم بظهور العصا 
// العصا تختفي عندما:
// 1. الكرات تتحرك (بما فيها البيضاء)
// 2. العصا في حالة ضربة (striking)
// 3. الكرة البيضاء في الجيب
if (ballsMoving || striking || cueBall.pocketed) {
    state.cueStick.visible = false;
} else {
    state.cueStick.visible = true;
}

      
// التحكم بالعصا فقط إذا لم تكن الكرات تتحرك
      

if (!ballsMoving &&
    !striking &&
    !cueBall.pocketed) {

    
    // تدوير العصا
    

    if (state.input.keys["KeyQ"])
        rotateCue(
            state.cueStick,
            1,
            dt
        );

    if (state.input.keys["KeyE"])
        rotateCue(
            state.cueStick,
            -1,
            dt
        );

    
    // سحب العصا
    

    if (state.input.keys["KeyP"])
        pullCue(
            state.cueStick,
            dt
        );

    if (state.input.keys["KeyB"])
        pullCue(
            state.cueStick,
            -dt
        );

    
    // رفع العصا
    

    if (state.input.keys["KeyO"])
        elevateCue(
            state.cueStick,
            1,
            dt
        );

    if (state.input.keys["KeyL"])
        elevateCue(
            state.cueStick,
            -1,
            dt
        );

    
    // نقطة الضرب يمين ويسار
    

    if (state.input.keys["KeyI"])
        moveImpactX(
            state.cueStick,
            1,
            dt
        );

    if (state.input.keys["KeyK"])
        moveImpactX(
            state.cueStick,
            -1,
            dt
        );

    
    // نقطة الضرب أعلى وأسفل
    

    if (state.input.keys["KeyU"])
        moveImpactY(
            state.cueStick,
            1,
            dt
        );

    if (state.input.keys["KeyJ"])
        moveImpactY(
            state.cueStick,
            -1,
            dt
        );

}

      
// تحديث موقع العصا (فقط إذا كانت مرئية)
      

if (state.cueStick.visible) {
    updateCue(
        state.cueStick,
        cueBall.mesh
    );
}

      
// تنفيذ حركة الضربة
      

updateStrikeAnimation(
    state.cueStick,
    dt
);



              
    // الكاميرا
          

    if (

        state.cameraMode === "free" ||

        !state.cameraMode

    ) {

        updateKeyboardCamera(

            state,

            dt

        );

    }

    else {

        updateCueCamera(

            state,

            dt

        );

    }

          
    // الرسم
          

    state.renderer.render(

        state.scene,

        state.camera

    );

}