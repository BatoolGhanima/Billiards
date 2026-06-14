// src/physics/cuePhysics.js
// FIX SUMMARY:
// 1. updateCue: cue.position.z now uses (+) cos — places cue on PLAYER side of ball
// 2. updateCue: cue.rotation.y = PI - angle  — thin tip faces the ball
// 3. strikeCue: sets a "striking" flag instead of teleporting velocity instantly
// 4. updateStrikeAnimation: animates the cue forward each frame;
//    velocity is only applied the moment the tip reaches the ball
// 5. rotateCue: speed constant raised from 0.05 → 1.5 (was nearly imperceptible)

const PULL_SPEED   = 18;   // units/sec — pulling back
const STRIKE_SPEED = 500;  // units/sec — forward swing (fast snap)
const ROTATE_SPEED = 1.5;  // rad/sec   — left / right aim

// ---------------------------------------------------------------------------
// updateCue — called every frame to position & orient the cue
//
// Correct top-down layout (angle = 0):
//   [butt] ——— [body] ——— [tip]  ←gap→  (○ cue ball)  ——→  [▽ rack]
//
//   Shot direction = ( sin(a),  0, -cos(a) )   ← angle=0 sends ball toward –Z (rack)
//   Cue is BEHIND the ball (opposite of shot direction):
//     cue.x = ball.x  –  sin(a) * distance
//     cue.z = ball.z  +  cos(a) * distance   ← (+) puts cue on player side
//
//   rotation.y = PI – angle  makes the local +Z axis point in shot direction,
//   so the tip (at local +Z) faces the ball from the player's side.
// ---------------------------------------------------------------------------
export function updateCue(cue, cueBallMesh) {
  const angle    = cue.userData.angle;
  const pullBack = cue.userData.pullBack;

  // Distance from ball centre to cue-group centre
  // At pullBack = 0 the tip is flush with the ball surface
  const distance = 80 + pullBack;

  cue.position.set(
    cueBallMesh.position.x - Math.sin(angle) * distance,
    cueBallMesh.position.y,                              // level with ball centre
    cueBallMesh.position.z + Math.cos(angle) * distance  // FIX: + not –
  );

  // FIX: was –angle (tip pointed wrong way); PI–angle aligns thin tip → ball
  cue.rotation.y = Math.PI - angle;

  cue.visible = true;
}

// ---------------------------------------------------------------------------
// pullCue — hold P to draw the cue back
// ---------------------------------------------------------------------------
export function pullCue(cue, dt) {
  cue.userData.pullBack += PULL_SPEED * dt;
  cue.userData.pullBack  = Math.min(cue.userData.pullBack, cue.userData.maxPullBack);
}

// ---------------------------------------------------------------------------
// rotateCue — L key = aim left (+1), R key = aim right (–1)
// ---------------------------------------------------------------------------
export function rotateCue(cue, direction, dt) {
  // FIX: was 0.05 * dt — nearly imperceptible; raised to ROTATE_SPEED
  cue.userData.angle += direction * ROTATE_SPEED * dt;
}

// ---------------------------------------------------------------------------
// strikeCue — Space key: BEGIN the forward-swing animation.
//   Does NOT touch ball.velocity directly — that happens in updateStrikeAnimation
//   when the tip physically reaches the ball.
// ---------------------------------------------------------------------------
export function strikeCue(cue, ball) {
  if (cue.userData.pullBack <= 0)    return;  // nothing pulled back → no shot
  if (cue.userData.striking)         return;  // already mid-swing

  // Save power calculated from how far back we pulled
  cue.userData.strikePower  = cue.userData.pullBack * cue.userData.powerFactor;
  cue.userData.striking     = true;
  cue.userData.strikeTarget = ball;           // ball object (has .velocity)
}

// ---------------------------------------------------------------------------
// updateStrikeAnimation — call every frame from the main loop.
//   Slides the cue forward; fires the ball the instant pullBack hits 0.
// ---------------------------------------------------------------------------
export function updateStrikeAnimation(cue, dt) {
  if (!cue.userData.striking) return;

  // Advance cue toward ball
  cue.userData.pullBack -= STRIKE_SPEED * dt;

  if (cue.userData.pullBack <= 0) {
    cue.userData.pullBack = 0;

    // ── TIP CONTACTS BALL — transfer kinetic energy ──────────────────────
    const ball  = cue.userData.strikeTarget;
    const angle = cue.userData.angle;
    const power = cue.userData.strikePower;

    // FIX: direction uses –cos so angle=0 fires toward –Z (rack), not +Z
    const direction = new THREE.Vector3(
      Math.sin(angle),
      0,
      -Math.cos(angle)
    );
    ball.velocity.add(direction.multiplyScalar(power));
    // ─────────────────────────────────────────────────────────────────────

    // Reset strike state
    cue.userData.striking     = false;
    cue.userData.strikeTarget = null;
    cue.userData.strikePower  = 0;
  }
}
