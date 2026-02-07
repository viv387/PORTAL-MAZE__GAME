// ======================================================
//                 GAME MODULE (FINAL — SOUND FREE)
// ======================================================

import {
  map, mapWidth, mapHeight, CELL,
  player, inBounds, startPos, goalPos,
  K,
  usedBreaks,
  incrementBreaks,
  resetBreaks
} from "./config.js";

import {
  portalGlow,
  wallBreakAnimation,
  renderAnimations
} from "./animation.js";

import {
  updateBreaksUI,
  showScoreOverlay,
  getPlayerName
} from "./ui.js";

import { shortestPath } from "./solver.js";
import { addScore } from "./leaderboard.js";

// ======================================================
//                 CANVAS SETUP
// ======================================================

const canvas = document.getElementById("mazeCanvas");
const ctx = canvas?.getContext("2d");

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = mapWidth * CELL;
  canvas.height = mapHeight * CELL;
}

// ======================================================
//                 GAME STATE
// ======================================================

let gameStarted = false;
let paused = false;

let stepCount = 0;
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;

// ======================================================
//             OPTIMAL PATH CACHE
// ======================================================

let optimalNoBreak = null;
let optimalWithBreak = null;

export function recomputeOptimalPaths() {
  const snapshot = map.map(r => r.slice());
  optimalNoBreak = shortestPath(snapshot, startPos, goalPos, 0);
  optimalWithBreak = shortestPath(snapshot, startPos, goalPos, K);
}

// ======================================================
//                    DRAW MAZE
// ======================================================

export function drawMaze() {
  if (!ctx) return;

  resizeCanvas();

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const cell = map[y][x];

      ctx.fillStyle = cell === 1 ? "#000" : "#ddd";
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      ctx.strokeStyle = "#444";
      ctx.strokeRect(x * CELL, y * CELL, CELL, CELL);

      if (typeof cell === "object" && cell.portal) {
        ctx.fillStyle = cell.portal;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        portalGlow(ctx, x * CELL, y * CELL, CELL, cell.portal);
      }
    }
  }

  // Start
  ctx.strokeStyle = "rgba(0,255,0,0.7)";
  ctx.lineWidth = 3;
  ctx.strokeRect(startPos.x * CELL, startPos.y * CELL, CELL, CELL);

  // Goal
  ctx.fillStyle = "#ffe600";
  ctx.fillRect(goalPos.x * CELL, goalPos.y * CELL, CELL, CELL);

  // Player
  ctx.fillStyle = "#00ffff";
  ctx.fillRect(player.x * CELL, player.y * CELL, CELL, CELL);

  renderAnimations(ctx);
}

// ======================================================
//                    START GAME
// ======================================================

export function startGame() {
  // 🔓 PERMANENT UI UNLOCK
  document.body.classList.add("game-active");

  gameStarted = true;
  paused = false;

  stepCount = 0;
  elapsedTime = 0;
  startTime = performance.now();

  recomputeOptimalPaths();
  drawMaze();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!gameStarted || paused) return;

    elapsedTime = (performance.now() - startTime) / 1000;

    window.dispatchEvent(
      new CustomEvent("timeUpdate", {
        detail: { time: elapsedTime.toFixed(1) }
      })
    );
  }, 100);
}

// ======================================================
//              PAUSE / RESUME
// ======================================================

export function togglePause() {
  paused = !paused;
  return paused;
}

// ======================================================
//                    MOVEMENT
// ======================================================

function move(dx, dy, breakWall = false) {
  if (!gameStarted || paused) return;

  const nx = player.x + dx;
  const ny = player.y + dy;
  if (!inBounds(nx, ny)) return;

  const cell = map[ny][nx];

  if (cell === 1) {
    if (!breakWall || usedBreaks >= K) return;

    incrementBreaks();
    map[ny][nx] = 0;
    wallBreakAnimation(ctx, nx * CELL, ny * CELL, CELL);
    updateBreaksUI();
  }

  player.x = nx;
  player.y = ny;
  stepCount++;

  window.dispatchEvent(
    new CustomEvent("stepUpdate", {
      detail: { steps: stepCount }
    })
  );

  if (player.x === goalPos.x && player.y === goalPos.y) {
    gameStarted = false;
    clearInterval(timerInterval);

    const timeTaken = Math.round(elapsedTime);
    const best = K > 0 ? optimalWithBreak : optimalNoBreak;

    addScore(
      localStorage.getItem("current_map_key") || "custom",
      K > 0 ? "BREAK" : "NO_BREAK",
      getPlayerName(),
      stepCount,
      timeTaken
    );

    showScoreOverlay({
      steps: stepCount,
      time: timeTaken,
      optimal: best
    });
    return;
  }

  drawMaze();
}

// ======================================================
//                    INPUT
// ======================================================

document.addEventListener("keydown", e => {
  if (!gameStarted || paused) return;

  const k = e.key.toLowerCase();
  const shift = e.shiftKey;

  if (k === "w" || k === "arrowup") move(0, -1, shift);
  if (k === "s" || k === "arrowdown") move(0, 1, shift);
  if (k === "a" || k === "arrowleft") move(-1, 0, shift);
  if (k === "d" || k === "arrowright") move(1, 0, shift);
});

// ======================================================
//               RESET PLAYER
// ======================================================

export function resetPlayerToStart() {
  resetBreaks();
  gameStarted = false;
  paused = false;

  stepCount = 0;
  elapsedTime = 0;
  startTime = 0;

  clearInterval(timerInterval);

  player.x = startPos.x;
  player.y = startPos.y;

  window.dispatchEvent(
    new CustomEvent("stepUpdate", {
      detail: { steps: 0 }
    })
  );

  window.dispatchEvent(
    new CustomEvent("timeUpdate", {
      detail: { time: "0.0" }
    })
  );

  recomputeOptimalPaths();
  drawMaze();
}
