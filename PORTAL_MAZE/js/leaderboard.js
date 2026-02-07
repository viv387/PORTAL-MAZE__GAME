// ======================================================
//                 LEADERBOARD MODULE
// ======================================================
//
// Rules:
// 1️⃣ Fewer steps = better
// 2️⃣ If steps tie → less time wins
// 3️⃣ If fully tied → older entry wins
// 4️⃣ Stored per (mapId + mode)
// 5️⃣ Persistent via localStorage
//
// ======================================================

const STORAGE_KEY = "portalmaze_leaderboards";

// ======================================================
//               INTERNAL HELPERS
// ======================================================

function loadAllLeaderboards() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
}

function saveAllLeaderboards(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function makeKey(mapId, mode) {
    return `${mapId}|${mode}`;
}

// ======================================================
//               PUBLIC API
// ======================================================

/**
 * Add a score entry
 * @param {string} mapId   - unique map identifier
 * @param {string} mode    - "NO_BREAK" | "BREAK"
 * @param {string} name    - player name
 * @param {number} steps   - unique cells visited
 * @param {number} time    - time in seconds
 */
export function addScore(mapId, mode, name, steps, time) {
    const boards = loadAllLeaderboards();
    const key = makeKey(mapId, mode);

    if (!boards[key]) {
        boards[key] = [];
    }

    boards[key].push({
        name,
        steps,
        time,
        date: Date.now()
    });

    // 🔥 SORT RULES
    boards[key].sort((a, b) => {
        if (a.steps !== b.steps) return a.steps - b.steps;
        if (a.time !== b.time) return a.time - b.time;
        return a.date - b.date; // older wins if fully tied
    });

    // Keep only top 10 scores
    boards[key] = boards[key].slice(0, 10);

    saveAllLeaderboards(boards);
}

/**
 * Get leaderboard for a map + mode
 * @param {string} mapId
 * @param {string} mode
 * @returns {Array}
 */
export function getLeaderboard(mapId, mode) {
    const boards = loadAllLeaderboards();
    const key = makeKey(mapId, mode);
    return boards[key] || [];
}

/**
 * Get best (top) score for a map + mode
 * @param {string} mapId
 * @param {string} mode
 * @returns {Object|null}
 */
export function getBestScore(mapId, mode) {
    const list = getLeaderboard(mapId, mode);
    return list.length ? list[0] : null;
}

/**
 * Clear leaderboard for a specific map + mode
 */
export function clearLeaderboard(mapId, mode) {
    const boards = loadAllLeaderboards();
    const key = makeKey(mapId, mode);
    delete boards[key];
    saveAllLeaderboards(boards);
}

/**
 * Clear everything (debug / dev only)
 */
export function clearAllLeaderboards() {
    localStorage.removeItem(STORAGE_KEY);
}
