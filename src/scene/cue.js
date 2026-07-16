// src/scene/cue.js

import { state } from "../core/state.js";

export function createCueStick(scene, cueBallMesh) {


    //إنشاء مجموعة أجسا العصا
    const cue = new THREE.Group();
    cue.name = "cueStick";

    // أبعاد العصا

    const cueLength  = 140;
    const buttRadius = 1.6; // نصف قطر الطرف الخلفي 
    const tipRadius  = 0.75;

          --
    // Pivot
    // سيكون رأس العصا هو نقطة الارتكاز
          --

    const pivot = new THREE.Group();
    cue.add(pivot);

    // جسم العصا

    const body = new THREE.Mesh(
 
        //شكل هندسي أسطوانة لرسم الكرة 
        new THREE.CylinderGeometry(
            tipRadius,
            buttRadius,
            cueLength,
            80
        ),

        new THREE.MeshStandardMaterial({

            color:0xb07d43, //لون خشبي
            roughness:0.65, //خشونة الخشب جسم الكرة
            metalness:0.05 // العصا ليست معدنية لذلك تأثير المعدن قيمته صغيرة

        })

    );
 //تدوير العصا لأنها افتراضيا على محور Y لذللك ندورها
    body.rotation.x = Math.PI/2;

    // نحرك الجسم للخلف بحيث تصبح نقطة الصفر عند الرأس
    body.position.z = -cueLength/2;

    body.castShadow = true;

    pivot.add(body);

    // رأس العصا

    const tip = new THREE.Mesh(

        new THREE.CylinderGeometry(

            tipRadius*0.95,
            tipRadius*0.95,
            5,
            18

        ),

        new THREE.MeshStandardMaterial({

            color:0xffffff,
            roughness:0.9

        })

    );

    tip.rotation.x = Math.PI/2;

    tip.position.z = 2.5;

    tip.castShadow = true;

    pivot.add(tip); // إضافة الرأس لنقطة الدوران

    // مرجع الرأس
    

    //تخزين معلومات العصا
    cue.userData.tip = tip;

    cue.userData.pivot = pivot;

    // بيانات العصا

    cue.userData.length = cueLength;

    cue.userData.angle = 0;

    cue.userData.pullBack = 0;

    cue.userData.maxPullBack = 35;

    cue.userData.powerFactor = 120;

    // الإمالة

    cue.userData.elevation = 0;

    cue.userData.maxElevation =

        THREE.MathUtils.degToRad(30);

    // مكان الضرب
    cue.userData.offsetX = 0; //إذا كان صفر يعني ضرب مركز الكرة

    cue.userData.offsetY = 0;

    cue.userData.maxOffset = 0.85;

    
    // أثناء الضربة
    

    cue.userData.striking = false;

    cue.userData.strikeTarget = null;

    cue.userData.strikePower = 0;

    
    // Spin
    

    cue.userData.spinOffset =
//متجه ثنائي الأبعاد لتحديد مكان الضربة أعلى أسفل يمين يسار
        new THREE.Vector2();

    
//متتغيرات خاصة بالضربة    

    cue.userData.hitElevation = 0;

    cue.userData.hitOffsetX = 0;

    cue.userData.hitOffsetY = 0;

          --

    scene.add(cue);

    return cue;

}