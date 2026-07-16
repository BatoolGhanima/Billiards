//هذا الملف ضافته اية لضرب العصل لغير البيضاء
import { state } from "../core/state.js";

export function selectNextBall() {

    if (state.balls.length === 0) return;

    state.selectedBallIndex++;

    if (state.selectedBallIndex >= state.balls.length) {
        state.selectedBallIndex = 0;
    }

    const ball = state.balls[state.selectedBallIndex];

    state.balls.forEach(b=>{

    b.mesh.scale.set(1,1,1);

});

ball.mesh.scale.set(1.15,1.15,1.15);

    console.log("Selected:", ball.name);

}