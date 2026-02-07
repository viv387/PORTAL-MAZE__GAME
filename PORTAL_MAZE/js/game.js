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
  teleportReadyGlow,
  wallBreakAnimation,
  renderAnimations
} from "./animation.js";

import {
  updateBreaksUI,
  showScoreOverlay,
  getPlayerName
} from "./ui.js";

import { shortestPath, nextStepHint } from "./solver.js";
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
let pendingPortal = null;
let enterHeld = false;
let lastDir = { dx: 0, dy: 1 };

let stepCount = 0;
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;

function startTimerLoop() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!gameStarted || paused || !startTime) return;

    elapsedTime = (performance.now() - startTime) / 1000;

    window.dispatchEvent(
      new CustomEvent("timeUpdate", {
        detail: { time: elapsedTime.toFixed(1) }
      })
    );
  }, 100);
}

// ======================================================
//             OPTIMAL PATH CACHE
// ======================================================

let optimalNoBreak = null;
let optimalWithBreak = null;

function findPortalExit(color, fromX, fromY) {
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const cell = map[y][x];
      if (typeof cell === "object" && cell.portal === color) {
        if (x !== fromX || y !== fromY) {
          return { x, y };
        }
      }
    }
  }
  return null;
}

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
        // Draw larger portal as a circle
        const centerX = x * CELL + CELL / 2;
        const centerY = y * CELL + CELL / 2;
        const radius = CELL * 0.35;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
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

  // Player (draw on top with slight transparency to see portal underneath)
  ctx.fillStyle = "#00ffff";
  ctx.globalAlpha = 0.85;
  ctx.fillRect(player.x * CELL, player.y * CELL, CELL, CELL);
  ctx.globalAlpha = 1.0;

  if (pendingPortal?.color) {
    teleportReadyGlow(ctx, player.x * CELL, player.y * CELL, CELL, pendingPortal.color);
  }

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
  updateBreaksUI();
  drawMaze();

  startTimerLoop();
}

// ======================================================
//              PAUSE / RESUME
// ======================================================

export function togglePause() {
  paused = !paused;
  return paused;
}

// ======================================================
//                     HINTS
// ======================================================

export function getHint() {
  const remaining = Math.max(0, K - usedBreaks);
  const action = nextStepHint(map, player, goalPos, remaining);
  if (!action) return "No hint available";

  if (action.type === "teleport") {
    return `Teleport via ${action.color} portal`;
  }

  const dir = action.dx === 1 ? "Right"
    : action.dx === -1 ? "Left"
    : action.dy === 1 ? "Down"
    : "Up";

  if (action.breakWall) {
    return `Break wall and move ${dir}`;
  }

  return `Move ${dir}`;
}

// ======================================================
//                    MOVEMENT
// ======================================================

function move(dx, dy, breakWall = false) {
  if (!gameStarted || paused) return;

  if (!startTime) {
    startTime = performance.now();
    if (!timerInterval) startTimerLoop();
  }

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
  pendingPortal = null;

  window.dispatchEvent(
    new CustomEvent("stepUpdate", {
      detail: { steps: stepCount }
    })
  );

  // Track portal for manual teleport (press Enter)
  const actualCell = map[ny][nx];
  if (actualCell && typeof actualCell === "object" && actualCell.portal) {
    pendingPortal = { color: actualCell.portal };
  } else {
    pendingPortal = null;
  }

  if (checkGoalAndEnd()) return;

  drawMaze();
}

function checkGoalAndEnd() {
  if (player.x !== goalPos.x || player.y !== goalPos.y) return false;

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

  window.dispatchEvent(new Event("leaderboardUpdate"));

  showScoreOverlay({
    steps: stepCount,
    time: timeTaken,
    optimal: best
  });
  return true;
}

function attemptTeleport() {
  if (!pendingPortal) return;

  const exit = findPortalExit(pendingPortal.color, player.x, player.y);
  if (!exit) return;

  player.x = exit.x;
  player.y = exit.y;
  stepCount++;

  const exitCell = map[exit.y][exit.x];
  pendingPortal = exitCell && typeof exitCell === "object" && exitCell.portal
    ? { color: exitCell.portal }
    : null;

  window.dispatchEvent(
    new CustomEvent("stepUpdate", {
      detail: { steps: stepCount }
    })
  );

  if (checkGoalAndEnd()) return;
  drawMaze();
}

// ======================================================
//                    INPUT
// ======================================================

document.addEventListener("keydown", e => {
  if (!gameStarted || paused) return;

  const k = e.key.toLowerCase();
  if (k === "enter") {
    enterHeld = true;
    if (pendingPortal) {
      attemptTeleport();
      return;
    }
    attemptBreakAhead();
    return;
  }

  const breakWall = enterHeld || e.shiftKey;

  if (k === "w" || k === "arrowup") { lastDir = { dx: 0, dy: -1 }; move(0, -1, breakWall); }
  if (k === "s" || k === "arrowdown") { lastDir = { dx: 0, dy: 1 }; move(0, 1, breakWall); }
  if (k === "a" || k === "arrowleft") { lastDir = { dx: -1, dy: 0 }; move(-1, 0, breakWall); }
  if (k === "d" || k === "arrowright") { lastDir = { dx: 1, dy: 0 }; move(1, 0, breakWall); }
});

document.addEventListener("keyup", e => {
  const k = e.key.toLowerCase();
  if (k === "enter") enterHeld = false;
});

function attemptBreakAhead() {
  if (!lastDir) return;
  move(lastDir.dx, lastDir.dy, true);
}

// ======================================================
//               RESET PLAYER
// ======================================================

export function resetPlayerToStart() {
  resetBreaks();
  paused = false;
  // Keep gameStarted = true so player can continue moving
  // Only set to false when a goal is reached

  stepCount = 0;
  elapsedTime = 0;
  startTime = 0;

  clearInterval(timerInterval);
  timerInterval = null;

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
  updateBreaksUI();
  drawMaze();
}
