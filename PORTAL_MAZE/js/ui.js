import { setK, K, usedBreaks, exportMap } from "./config.js";
import { togglePause, resetPlayerToStart, getHint } from "./game.js";
import { getLeaderboard, getBestScore } from "./leaderboard.js";

let currentDifficulty = "easy";
export function getCurrentDifficulty() {
    return currentDifficulty;
}

const WALL_K = { easy: 1, medium: 3, hard: 6 };
const K_TO_DIFF = { 1: "easy", 3: "medium", 6: "hard" };

const pauseResumeBtn = document.getElementById("pauseResumeBtn");
const resetBtn = document.getElementById("resetGame");
const openEditorBtn = document.getElementById("openEditor");
const hintBtn = document.getElementById("showHint");

const modeStatus = document.getElementById("modeStatus");
const breaksStatus = document.getElementById("breaksStatus");
const stepCounter = document.getElementById("stepCounter");
const timeCounter = document.getElementById("timeCounter");
const hintBox = document.getElementById("hintBox");

const leaderboardList = document.getElementById("leaderboardList");
const bestScore = document.getElementById("bestScore");

function isWallMode() {
    return wallModeBtn?.classList.contains("active");
}

function dispatchReady() {
    window.dispatchEvent(new Event("readyToStartGame"));
}

function updateModeStatus() {
    if (!modeStatus) return;
    if (selectedMode === "wall") {
        modeStatus.textContent = `Mode: Wall Break (K=${K})`;
    } else {
        modeStatus.textContent = "Mode: Normal";
    }
}

function getCurrentMapId() {
    return localStorage.getItem("current_map_key") || "custom";
}

function getCurrentModeKey() {
    return K > 0 ? "BREAK" : "NO_BREAK";
}

function updateLeaderboardUI() {
    if (!leaderboardList || !bestScore) return;

    const mapId = getCurrentMapId();
    const modeKey = getCurrentModeKey();

    const list = getLeaderboard(mapId, modeKey);
    const best = getBestScore(mapId, modeKey);

    leaderboardList.innerHTML = "";

    if (!list.length) {
        const li = document.createElement("li");
        li.textContent = "No scores yet";
        leaderboardList.appendChild(li);
    } else {
        list.forEach((entry, index) => {
            const li = document.createElement("li");
            li.textContent = `${index + 1}. ${entry.name} - ${entry.steps} steps, ${entry.time}s`;
            leaderboardList.appendChild(li);
        });
    }

    if (best) {
        bestScore.textContent = `Best: ${best.name} - ${best.steps} steps, ${best.time}s`;
    } else {
        bestScore.textContent = "Best: --";
    }
}

// ================= PAUSE =================
if (pauseResumeBtn) {
    pauseResumeBtn.onclick = () => {
        const paused = togglePause();
        pauseResumeBtn.textContent = paused ? "▶ Resume" : "⏸ Pause";
    };
}

// ================= RESET =================
if (resetBtn) {
    resetBtn.onclick = () => {
        resetPlayerToStart();
        updateBreaksUI();
        if (pauseResumeBtn) pauseResumeBtn.textContent = "⏸ Pause";
        if (hintBox) hintBox.textContent = "Hint: --";
    };
}

// ================= MAP EDITOR =================
if (openEditorBtn) {
    openEditorBtn.onclick = () => {
        exportMap();
        window.location.href = "editor.html";
    };
}

// ================= LEADERBOARD BUTTON (DURING GAME) =================
const showLeaderboardBtn = document.getElementById("showLeaderboardBtn");
if (showLeaderboardBtn) {
    showLeaderboardBtn.onclick = showLeaderboardPopup;
}

// ================= HINT =================
if (hintBtn) {
    hintBtn.onclick = () => {
        const hint = getHint();
        if (hintBox) hintBox.textContent = `Hint: ${hint}`;
    };
}

// ================= PLAYER NAME =================
export function getPlayerName() {
    return localStorage.getItem("currentUsername") || "Anonymous";
}

// ================= BREAK COUNTER UI =================
export function updateBreaksUI() {
    if (!breaksStatus) return;
    breaksStatus.textContent = `Breaks: ${usedBreaks} / ${K}`;
}

// ================= SCORE OVERLAY =================
export function showScoreOverlay({ steps, time, optimal }) {
    const scoreBox = document.getElementById("scoreBox");
    const scoreText = document.getElementById("scoreText");

    let rating = "";
    if (optimal == null) {
        rating = "❌ No valid solution exists!";
    } else {
        const ratio = steps / optimal;
        if (ratio <= 1.2) rating = "🔥 Near optimal!";
        else if (ratio <= 1.6) rating = "👍 Good run!";
        else rating = "🙂 Keep improving!";
    }

    scoreText.innerHTML = `
        🧑 <b>Player:</b> ${getPlayerName()}<br><br>
        👣 <b>Steps:</b> ${steps}<br>
        ⏱️ <b>Time:</b> ${time}s<br>
        🧠 <b>Optimal:</b> ${optimal ?? "N/A"}<br><br>
        ${rating}
    `;

    scoreBox.style.display = "flex";
}

function showLeaderboardPopup() {
    const mapId = getCurrentMapId();
    const modeKey = getCurrentModeKey();
    const list = getLeaderboard(mapId, modeKey);
    const leaderboardPopup = document.getElementById("leaderboardPopup");
    const leaderboardPopupList = document.getElementById("leaderboardPopupList");

    leaderboardPopupList.innerHTML = "";

    if (!list.length) {
        const li = document.createElement("li");
        li.textContent = "No scores yet";
        leaderboardPopupList.appendChild(li);
    } else {
        list.forEach((entry, index) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>#${index + 1}</strong> ${entry.name} - <strong>${entry.steps}</strong> steps, <strong>${entry.time}</strong>s`;
            leaderboardPopupList.appendChild(li);
        });
    }

    leaderboardPopup.style.display = "flex";
}

function hideLeaderboardPopup() {
    const leaderboardPopup = document.getElementById("leaderboardPopup");
    leaderboardPopup.style.display = "none";
}

function restartGame() {
    const scoreBox = document.getElementById("scoreBox");
    const leaderboardPopup = document.getElementById("leaderboardPopup");
    const optionsOverlay = document.getElementById("optionsOverlay");
    const startOverlay = document.getElementById("startOverlay");

    scoreBox.style.display = "none";
    leaderboardPopup.style.display = "none";
    startOverlay.style.display = "none";
    
    // Unlock game layout first, then show options on top
    document.body.classList.remove("game-active");
    optionsOverlay.style.display = "flex";
}

// ================= USERNAME OVERLAY =================
const usernameOverlay = document.getElementById("usernameOverlay");
const usernameInput = document.getElementById("usernameInput");
const usernameError = document.getElementById("usernameError");
const confirmBtn = document.getElementById("confirmUsernameBtn");

const optionsOverlay = document.getElementById("optionsOverlay");
const optNormalMode = document.getElementById("optNormalMode");
const optWallMode = document.getElementById("optWallMode");
const optEasy = document.getElementById("optEasy");
const optMedium = document.getElementById("optMedium");
const optHard = document.getElementById("optHard");
const optEditorBtn = document.getElementById("optEditorBtn");
const optStartBtn = document.getElementById("optStartBtn");

const scoreLeaderboardBtn = document.getElementById("scoreLeaderboardBtn");
const scoreRestartBtn = document.getElementById("scoreRestartBtn");
const leaderboardCloseBtn = document.getElementById("leaderboardCloseBtn");

let selectedMode = "normal"; // "normal" or "wall"
let selectedDifficulty = "easy";

export function getSelectedMode() {
    return selectedMode;
}

export function getSelectedDifficulty() {
    return selectedDifficulty;
}

if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
        const name = usernameInput.value.trim();

        if (name.length < 3) {
            usernameError.textContent = "At least 3 characters required";
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(name)) {
            usernameError.textContent = "Only letters, numbers, _ allowed";
            return;
        }

        localStorage.setItem("currentUsername", name);

        usernameError.textContent = "";
        usernameOverlay.style.display = "none";

        // Show options overlay instead of unlocking game
        optionsOverlay.style.display = "flex";

        updateLeaderboardUI();
    });
}

// ================= OPTIONS SELECTION =================
if (optNormalMode) {
    optNormalMode.onclick = () => {
        selectedMode = "normal";
        optNormalMode.classList.add("active");
        optWallMode.classList.remove("active");
        setK(0);
        updateBreaksUI();
    };
}

if (optWallMode) {
    optWallMode.onclick = () => {
        selectedMode = "wall";
        optWallMode.classList.add("active");
        optNormalMode.classList.remove("active");
        setK(WALL_K[selectedDifficulty] || 0);
        updateBreaksUI();
    };
}

function setActiveDifficultyOption(value) {
    optEasy.classList.toggle("active", value === "easy");
    optMedium.classList.toggle("active", value === "medium");
    optHard.classList.toggle("active", value === "hard");
}

if (optEasy) {
    optEasy.onclick = () => {
        selectedDifficulty = "easy";
        currentDifficulty = "easy";
        setActiveDifficultyOption("easy");
        if (selectedMode === "wall") setK(WALL_K["easy"]);
    };
}

if (optMedium) {
    optMedium.onclick = () => {
        selectedDifficulty = "medium";
        currentDifficulty = "medium";
        setActiveDifficultyOption("medium");
        if (selectedMode === "wall") setK(WALL_K["medium"]);
    };
}

if (optHard) {
    optHard.onclick = () => {
        selectedDifficulty = "hard";
        currentDifficulty = "hard";
        setActiveDifficultyOption("hard");
        if (selectedMode === "wall") setK(WALL_K["hard"]);
    };
}

if (optEditorBtn) {
    optEditorBtn.onclick = () => {
        exportMap();
        window.location.href = "editor.html";
    };
}

if (optStartBtn) {
    optStartBtn.onclick = () => {
        // Unlock game layout and show start overlay
        document.body.classList.add("game-active");
        optionsOverlay.style.display = "none";
        
        // Dispatch ready event to trigger preset load
        dispatchReady();
    };
}

// ================= SCORE OVERLAY BUTTONS =================
if (scoreLeaderboardBtn) {
    scoreLeaderboardBtn.onclick = showLeaderboardPopup;
}

if (scoreRestartBtn) {
    scoreRestartBtn.onclick = restartGame;
}

if (leaderboardCloseBtn) {
    leaderboardCloseBtn.onclick = hideLeaderboardPopup;
}

// ================= STATUS UPDATES =================
window.addEventListener("timeUpdate", event => {
    if (!timeCounter) return;
    timeCounter.textContent = `Time: ${event.detail.time}s`;
});

window.addEventListener("stepUpdate", event => {
    if (!stepCounter) return;
    stepCounter.textContent = `Steps: ${event.detail.steps}`;
});

window.addEventListener("leaderboardUpdate", updateLeaderboardUI);
window.addEventListener("readyToStartGame", updateLeaderboardUI);

function syncUIState() {
    updateBreaksUI();
    updateModeStatus();
    updateLeaderboardUI();

    if (stepCounter && !stepCounter.textContent) {
        stepCounter.textContent = "Steps: 0";
    }
    if (timeCounter && !timeCounter.textContent) {
        timeCounter.textContent = "Time: 0.0s";
    }
    if (hintBox && !hintBox.textContent) {
        hintBox.textContent = "Hint: --";
    }
}

function initUI() {
    syncUIState();
    
    // Check if username already exists (e.g., returning from editor)
    const existingUsername = localStorage.getItem("currentUsername");
    if (existingUsername && usernameOverlay && optionsOverlay) {
        usernameOverlay.style.display = "none";
        optionsOverlay.style.display = "flex";
    }
}

if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initUI);
} else {
    initUI();
}

window.addEventListener("uiSync", syncUIState);
