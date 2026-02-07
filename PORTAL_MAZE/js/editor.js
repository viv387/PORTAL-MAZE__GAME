// =======================================================
//            PORTALMAZE MAP EDITOR (FINAL – STABLE)
// =======================================================

import {
    map as gameMap,
    PORTAL_COLORS,
    setMap,
    setStart,
    setGoal,
    exportMap,
    startPos,
    goalPos,
    CELL,
    K,
    setK
} from "./config.js";

import { shortestPath } from "./solver.js";

// =======================================================
//               LOCAL EDITOR STATE (ISOLATED)
// =======================================================

const SIZE = 8; // 🔒 HARD LOCK
let editorMap = structuredClone(gameMap);

// =======================================================
//              CANVAS SETUP & DRAWING
// =======================================================

const canvas = document.getElementById("editorCanvas");
const ctx = canvas.getContext("2d");

function resizeEditorCanvas() {
    canvas.width = SIZE * CELL;
    canvas.height = SIZE * CELL;
}

function drawEditor() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const cell = editorMap[y][x];

            if (cell === 1) ctx.fillStyle = "#000";
            else if (x === startPos.x && y === startPos.y) ctx.fillStyle = "#00ff00";
            else if (x === goalPos.x && y === goalPos.y) ctx.fillStyle = "#ffe600";
            else if (typeof cell === "object" && cell.portal) ctx.fillStyle = cell.portal;
            else ctx.fillStyle = "#fff";

            ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
            ctx.strokeStyle = "#444";
            ctx.strokeRect(x * CELL, y * CELL, CELL, CELL);
        }
    }
}

// =======================================================
//                  EDITOR BOUNDS CHECK
// =======================================================

function editorInBounds(x, y) {
    return x >= 0 && y >= 0 && x < SIZE && y < SIZE;
}

// =======================================================
//                        TOOLS
// =======================================================

let activeTool = "empty";
let activePortalColor = null;

function activate(id) {
    document.querySelectorAll(".tool-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(id)?.classList.add("active");
}

toolEmpty.onclick = () => { activeTool = "empty"; activate("toolEmpty"); };
toolWall.onclick  = () => { activeTool = "wall";  activate("toolWall"); };
toolStart.onclick = () => { activeTool = "start"; activate("toolStart"); };
toolGoal.onclick  = () => { activeTool = "goal";  activate("toolGoal"); };

// =======================================================
//                 PORTAL BUTTONS
// =======================================================

const portalBox = document.getElementById("portalColorButtons");

PORTAL_COLORS.forEach(color => {
    const btn = document.createElement("button");
    btn.className = "tool-btn";
    btn.textContent = `Portal (${color})`;
    btn.style.borderLeft = `6px solid ${color}`;

    btn.onclick = () => {
        activeTool = "portal";
        activePortalColor = color;
        activate(btn.id);
    };

    portalBox.appendChild(btn);
});

// =======================================================
//                     HISTORY
// =======================================================

let history = [];
let redo = [];

function snapshot() {
    return JSON.stringify({
        map: structuredClone(editorMap),
        start: structuredClone(startPos),
        goal: structuredClone(goalPos),
        K
    });
}

function restore(state) {
    editorMap = structuredClone(state.map);
    setStart(state.start.x, state.start.y);
    setGoal(state.goal.x, state.goal.y);
    setK(state.K);
    drawEditor();
}

function saveHistory() {
    history.push(snapshot());
    redo = [];
}

// =======================================================
//                    MOUSE EDITING
// =======================================================

canvas.addEventListener("mousedown", e => {
    saveHistory();

    const r = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left) / CELL);
    const y = Math.floor((e.clientY - r.top) / CELL);

    if (!editorInBounds(x, y)) return;

    if (activeTool === "empty") editorMap[y][x] = 0;
    else if (activeTool === "wall") editorMap[y][x] = 1;
    else if (activeTool === "start") setStart(x, y);
    else if (activeTool === "goal") setGoal(x, y);
    else if (activeTool === "portal") {
        let portals = [];
        for (let yy = 0; yy < SIZE; yy++)
            for (let xx = 0; xx < SIZE; xx++)
                if (editorMap[yy][xx]?.portal === activePortalColor)
                    portals.push({ x: xx, y: yy });

        if (portals.length >= 2) {
            const old = portals[0];
            editorMap[old.y][old.x] = 0;
        }

        editorMap[y][x] = { portal: activePortalColor };
    }

    drawEditor();
});

// =======================================================
//                        K INPUT
// =======================================================

inputK.value = K;
inputK.onchange = () => {
    saveHistory();
    setK(Math.max(0, +inputK.value || 0));
};

// =======================================================
//                     UNDO / REDO
// =======================================================

btnUndo.onclick = () => {
    if (!history.length) return;
    redo.push(snapshot());
    restore(JSON.parse(history.pop()));
};

btnRedo.onclick = () => {
    if (!redo.length) return;
    history.push(snapshot());
    restore(JSON.parse(redo.pop()));
};

// =======================================================
//                     VALIDATION (EMOJI CLEAN)
// =======================================================

btnValidate.onclick = () => {
    const box = document.getElementById("validationBox");
    box.style.display = "block";

    let out = [];
    out.push("🧪 <b>Validation Results</b>");
    out.push("────────────────────");

    if (!startPos) {
        out.push("❌ <b>Start missing</b>");
        box.innerHTML = out.join("<br>");
        return;
    }

    if (!goalPos) {
        out.push("❌ <b>Goal missing</b>");
        box.innerHTML = out.join("<br>");
        return;
    }

    const noBreak = shortestPath(editorMap.map(r => r.slice()), startPos, goalPos, 0);
    const withBreak = shortestPath(editorMap.map(r => r.slice()), startPos, goalPos, K);

    out.push(noBreak !== null
        ? `🟢 No-Wall-Break: <b>${noBreak} steps</b>`
        : "🔴 No-Wall-Break: <b>No solution</b>");

    if (K > 0) {
        out.push(withBreak !== null
            ? `🟢 Wall-Break (K=${K}): <b>${withBreak} steps</b>`
            : `🔴 Wall-Break (K=${K}): <b>No solution</b>`);
    }

    out.push("────────────────────");
    out.push(noBreak === null && withBreak === null
        ? "❌ <b>MAP INVALID</b>"
        : "✅ <b>MAP VALID</b>");

    box.innerHTML = out.join("<br>");
};

// =======================================================
//                   RETURN TO GAME (COMMIT)
// =======================================================

btnReturnGame.onclick = () => {
    setMap(editorMap);   // 🔥 commit ONLY here
    exportMap();
    window.location.href = "index.html";
};

// =======================================================
//                    STARTUP
// =======================================================

resizeEditorCanvas();
drawEditor();
