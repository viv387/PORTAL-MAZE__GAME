import { loadPresetMap, resetGameState } from "./config.js";
import { drawMaze, resetPlayerToStart, startGame } from "./game.js";
import { getCurrentDifficulty } from "./ui.js";

const DEFAULT_PRESET = "normal-easy";

function loadPreset(name) {
    loadPresetMap(name);
    setTimeout(() => {
        resetGameState();
        resetPlayerToStart();
        drawMaze();
    }, 0);
}

window.addEventListener("DOMContentLoaded", () => {
    loadPreset(DEFAULT_PRESET);

    const startBtn = document.getElementById("startGameBtn");
    const startOverlay = document.getElementById("startOverlay");

    window.addEventListener("readyToStartGame", () => {
        const diff = getCurrentDifficulty();
        const wall = document.getElementById("wallMode").classList.contains("active");
        loadPreset(`${wall ? "wall" : "normal"}-${diff}`);
        startOverlay.style.display = "flex";
    });

    startBtn.addEventListener("click", () => {
        startOverlay.style.display = "none";
        startGame();
    });
});
