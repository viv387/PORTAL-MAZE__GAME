// =======================================================
//                 GLOBAL CONFIG & STATE (LOCKED)
// =======================================================

// ---- CELL SIZE ----
export const CELL = 60;

// =======================================================
//               PORTAL COLOR PALETTE
// =======================================================

export const PORTAL_COLORS = [
    "red", "blue", "green", "yellow", "purple", "cyan", "orange"
];

// =======================================================
//           ACTIVE MAP (GAMEPLAY ALWAYS 8×8)
// =======================================================

// 🔒 HARD-LOCKED DIMENSIONS
export const mapWidth = 8;
export const mapHeight = 8;

// 0 = path, 1 = wall, { portal }
export let map = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => 0)
);

// Start & Goal
export let startPos = { x: 0, y: 0 };
export let goalPos  = { x: 7, y: 7 };

// =======================================================
//               GAMEPLAY STATE
// =======================================================

export let player = { x: 0, y: 0 };

export let K = 0;
export let usedBreaks = 0;

export function resetBreaks() {
    usedBreaks = 0;
}

export function incrementBreaks() {
    usedBreaks++;
}

// =======================================================
//                     UTILITIES
// =======================================================

export function inBounds(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}

export function setMap(newMap) {
    // 🔒 SAFETY CHECK
    if (
        !Array.isArray(newMap) ||
        newMap.length !== 8 ||
        newMap.some(row => row.length !== 8)
    ) {
        console.error("Rejected map: gameplay map must be 8×8");
        return;
    }

    map = structuredClone(newMap);
}

export function resetGameState() {
    usedBreaks = 0;
    player.x = startPos.x;
    player.y = startPos.y;
}

export function setStart(x, y) {
    startPos = { x, y };
    player.x = x;
    player.y = y;
}

export function setGoal(x, y) {
    goalPos = { x, y };
}

// =======================================================
//               SAVE / LOAD (NO RESIZE EVER)
// =======================================================

export function exportMap() {
    const data = JSON.stringify({
        map,
        start: startPos,
        goal: goalPos,
        K
    }, null, 2);

    localStorage.setItem("portalmaze_autosave", data);
    return data;
}

export function importMap(json) {
    const data = JSON.parse(json);

    if (
        !data.map ||
        data.map.length !== 8 ||
        data.map.some(r => r.length !== 8)
    ) {
        console.error("Invalid map import — must be 8×8");
        return;
    }

    map = structuredClone(data.map);
    startPos = data.start;
    goalPos = data.goal;
    K = data.K ?? 0;

    player.x = startPos.x;
    player.y = startPos.y;
}

// =======================================================
//                PRESET LOADER
// =======================================================

export async function loadPresetMap(type) {
    const module = await import("./presets.js");
    const preset = module.PRESETS[type];
    if (!preset) {
        console.error("Unknown preset:", type);
        return false;
    }

    setMap(preset.map);
    startPos = { ...preset.start };
    goalPos  = { ...preset.goal };
    K = preset.K;

    resetGameState();
    return true;
}

// =======================================================
//      AUTOLOAD CUSTOM MAP
// =======================================================

const saved = localStorage.getItem("portalmaze_autosave");
if (saved) {
    try { importMap(saved); }
    catch { console.warn("Autosave corrupted — skipped"); }
}

// Manual override
export function setK(value) {
    K = Math.max(0, value | 0);
}
