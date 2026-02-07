// =======================================================
//                 ANIMATION ENGINE
// =======================================================

let animations = [];

// Add any animation to the queue
export function addAnimation(anim) {
    animations.push(anim);
}

// -------------------------------------------------------
// WALL BREAK ANIMATION
// -------------------------------------------------------
export function wallBreakAnimation(ctx, px, py, cellSize = 40) {

    const start = performance.now();

    const anim = {
        type: "wallBreak",
        px,
        py,
        cellSize,
        start,
        duration: 350,

        render(now) {
            const t = (now - start) / this.duration;
            if (t >= 1) return false;

            const alpha = 1 - t;
            const radius = this.cellSize * (0.4 + t * 0.8);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = "#8888";

            ctx.beginPath();
            ctx.arc(
                this.px + this.cellSize / 2,
                this.py + this.cellSize / 2,
                radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.restore();

            return true;
        }
    };

    addAnimation(anim);
}

// -------------------------------------------------------
// PORTAL GLOW EFFECT
// -------------------------------------------------------
export function portalGlow(ctx, px, py, cellSize = 40, color = "#ffffff") {

    const t = (performance.now() % 1000) / 1000;
    const alpha = 0.3 + Math.sin(t * Math.PI * 2) * 0.2;

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.rect(px + 3, py + 3, cellSize - 6, cellSize - 6);
    ctx.stroke();

    ctx.restore();
}

// -------------------------------------------------------
// TELEPORT READY GLOW
// -------------------------------------------------------
export function teleportReadyGlow(ctx, px, py, cellSize = 40, color = "#00ffff") {

    const t = (performance.now() % 1200) / 1200;
    const pulse = 0.4 + Math.sin(t * Math.PI * 2) * 0.25;

    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.arc(
        px + cellSize / 2,
        py + cellSize / 2,
        cellSize * 0.45,
        0,
        Math.PI * 2
    );
    ctx.stroke();
    ctx.restore();
}

// -------------------------------------------------------
// MAIN RENDER LOOP
// -------------------------------------------------------
export function renderAnimations(ctx) {
    const now = performance.now();

    animations = animations.filter(anim => anim.render(now));
}

// Clear animations (switching maps)
export function clearAnimations() {
    animations = [];
}
