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

import { shortestPath, getFullPath } from "./solver.js";

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

const toolEmpty = document.getElementById("toolEmpty");
const toolWall = document.getElementById("toolWall");
const toolStart = document.getElementById("toolStart");
const toolGoal = document.getElementById("toolGoal");

const inputK = document.getElementById("inputK");
const btnUndo = document.getElementById("btnUndo");
const btnRedo = document.getElementById("btnRedo");
const btnExport = document.getElementById("btnExport");
const btnImport = document.getElementById("btnImport");
const importFile = document.getElementById("importFile");
const btnValidate = document.getElementById("btnValidate");
const btnShowPath = document.getElementById("btnShowPath");
const btnReturnGame = document.getElementById("btnReturnGame");

const toastContainer = document.getElementById("toastContainer");

function showToast(message, type = "info") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 2200);
}

let currentPath = null;

function resizeEditorCanvas() {
    canvas.width = SIZE * CELL;
    canvas.height = SIZE * CELL;
}

function drawEditor(highlightPath = false) {
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

    // Draw path if enabled
    if (highlightPath && currentPath && currentPath.length > 0) {
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "rgba(0, 255, 255, 0.6)";
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(
            currentPath[0].x * CELL + CELL / 2,
            currentPath[0].y * CELL + CELL / 2
        );

        for (let i = 1; i < currentPath.length; i++) {
            ctx.lineTo(
                currentPath[i].x * CELL + CELL / 2,
                currentPath[i].y * CELL + CELL / 2
            );
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw dots at each step
        ctx.fillStyle = "#00ffff";
        for (const point of currentPath) {
            ctx.beginPath();
            ctx.arc(
                point.x * CELL + CELL / 2,
                point.y * CELL + CELL / 2,
                6,
                0,
                Math.PI * 2
            );
            ctx.fill();
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
    btn.id = `portal-${color}`;
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

function buildExportData() {
    return JSON.stringify({
        map: structuredClone(editorMap),
        start: structuredClone(startPos),
        goal: structuredClone(goalPos),
        K
    }, null, 2);
}

function restore(state) {
    editorMap = structuredClone(state.map);
    setStart(state.start.x, state.start.y);
    setGoal(state.goal.x, state.goal.y);
    setK(state.K);
    inputK.value = K;
    
    // Reset path visualization
    pathVisible = false;
    currentPath = null;
    if (btnShowPath) {
        btnShowPath.style.display = "none";
        btnShowPath.textContent = "🔍 Show Path";
    }
    
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

    // Reset path visualization when map is edited
    pathVisible = false;
    currentPath = null;
    if (btnShowPath) {
        btnShowPath.style.display = "none";
        btnShowPath.textContent = "🔍 Show Path";
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
//                   EXPORT / IMPORT
// =======================================================

if (btnExport) {
    btnExport.onclick = () => {
        const data = buildExportData();
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "portalmaze-map.json";
        a.click();

        URL.revokeObjectURL(url);
        showToast("Map exported", "success");
    };
}

if (btnImport && importFile) {
    btnImport.onclick = () => {
        importFile.value = "";
        importFile.click();
    };

    importFile.onchange = async () => {
        const file = importFile.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.map || data.map.length !== SIZE || data.map.some(r => r.length !== SIZE)) {
                showToast("Import failed: map must be 8x8", "error");
                return;
            }

            editorMap = structuredClone(data.map);
            if (data.start) setStart(data.start.x, data.start.y);
            if (data.goal) setGoal(data.goal.x, data.goal.y);
            setK(Math.max(0, data.K ?? 0));

            inputK.value = K;
            
            // Reset path visualization
            pathVisible = false;
            currentPath = null;
            if (btnShowPath) {
                btnShowPath.style.display = "none";
                btnShowPath.textContent = "🔍 Show Path";
            }
            
            drawEditor();
            showToast("Map imported", "success");
        } catch (err) {
            console.error(err);
            showToast("Import failed: invalid file", "error");
        }
    };
}

// =======================================================
//                     VALIDATION (EMOJI CLEAN)
// =======================================================

btnValidate.onclick = () => {
    const box = document.getElementById("validationBox");
    box.style.display = "block";
    box.className = "validation-box"; // Reset classes

    let out = [];
    out.push("🧪 <b>Validation Results</b>");
    out.push("────────────────────");

    if (!startPos) {
        out.push("❌ <b>Start missing</b>");
        box.innerHTML = out.join("<br>");
        box.classList.add("error");
        return;
    }

    if (!goalPos) {
        out.push("❌ <b>Goal missing</b>");
        box.innerHTML = out.join("<br>");
        box.classList.add("error");
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
    
    const isValid = noBreak !== null || withBreak !== null;
    out.push(isValid ? "✅ <b>MAP VALID</b>" : "❌ <b>MAP INVALID</b>");
    
    box.innerHTML = out.join("<br>");
    box.classList.add(isValid ? "success" : "error");

    // Show/hide path button based on validity
    if (btnShowPath) {
        if (isValid) {
            btnShowPath.style.display = "inline-block";
            // Store the best path
            currentPath = K > 0 && withBreak !== null
                ? getFullPath(editorMap.map(r => r.slice()), startPos, goalPos, K)
                : getFullPath(editorMap.map(r => r.slice()), startPos, goalPos, 0);
        } else {
            btnShowPath.style.display = "none";
            currentPath = null;
        }
    }
};

// =======================================================
//                     SHOW PATH
// =======================================================

let pathVisible = false;

if (btnShowPath) {
    btnShowPath.onclick = () => {
        pathVisible = !pathVisible;
        btnShowPath.textContent = pathVisible ? "🔍 Hide Path" : "🔍 Show Path";
        drawEditor(pathVisible);
    };
}

// =======================================================
//                   RETURN TO GAME (COMMIT)
// =======================================================

btnReturnGame.onclick = () => {
    setMap(editorMap);   // 🔥 commit ONLY here
    exportMap();
    localStorage.setItem("current_map_key", "custom");
    window.location.href = "game.html";
};

// =======================================================
//                    STARTUP
// =======================================================

resizeEditorCanvas();
drawEditor();
