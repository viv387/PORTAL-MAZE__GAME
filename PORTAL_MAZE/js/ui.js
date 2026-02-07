import { setK, K, usedBreaks } from "./config.js";
import { togglePause } from "./game.js";

let currentDifficulty = "easy";
export function getCurrentDifficulty() {
    return currentDifficulty;
}

const WALL_K = { easy: 1, medium: 3, hard: 6 };

// ================= MODE =================
document.getElementById("normalMode").onclick = () => {
    setK(0);
};

document.getElementById("wallMode").onclick = () => {
    setK(WALL_K[currentDifficulty]);
};

// ================= DIFFICULTY =================
document.querySelectorAll("#difficultyOptions button").forEach(btn => {
    btn.onclick = () => {
        currentDifficulty = btn.value;
        setK(WALL_K[currentDifficulty] || 0);

        // 🔔 notify main.js that UI is ready
        window.dispatchEvent(new Event("readyToStartGame"));
    };
});

// ================= PAUSE =================
document.getElementById("pauseResumeBtn").onclick = togglePause;

// ================= PLAYER NAME =================
export function getPlayerName() {
    return localStorage.getItem("currentUsername") || "Anonymous";
}

// ================= BREAK COUNTER UI =================
export function updateBreaksUI() {
    const breaksStatus = document.getElementById("breaksStatus");
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

// ================= USERNAME OVERLAY =================
const usernameOverlay = document.getElementById("usernameOverlay");
const usernameInput   = document.getElementById("usernameInput");
const usernameError   = document.getElementById("usernameError");
const confirmBtn      = document.getElementById("confirmUsernameBtn");

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

        // 🔓 UNLOCK UI INTERACTION
        document.body.classList.add("game-active");
    });
}
