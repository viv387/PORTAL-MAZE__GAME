import { loadPresetMap, resetGameState } from "./config.js";
import { drawMaze, resetPlayerToStart, startGame } from "./game.js";
import { getSelectedMode, getSelectedDifficulty } from "./ui.js";

const DEFAULT_PRESET = "normal-easy";

async function loadPreset(name) {
    const ok = await loadPresetMap(name);
    if (!ok) return;

    localStorage.setItem("current_map_key", name);
    resetGameState();
    resetPlayerToStart();
    drawMaze();
    window.dispatchEvent(new Event("uiSync"));
}

window.addEventListener("DOMContentLoaded", async () => {
    const autosave = localStorage.getItem("portalmaze_autosave");
    if (autosave) {
        localStorage.setItem("current_map_key", "custom");
        resetGameState();
        resetPlayerToStart();
        drawMaze();
        window.dispatchEvent(new Event("uiSync"));
    } else {
        await loadPreset(DEFAULT_PRESET);
    }

    const startBtn = document.getElementById("startGameBtn");
    const startOverlay = document.getElementById("startOverlay");

    window.addEventListener("readyToStartGame", async () => {
        const mode = getSelectedMode();
        const diff = getSelectedDifficulty();
        await loadPreset(`${mode}-${diff}`);
        startOverlay.style.display = "flex";
    });

    startBtn.addEventListener("click", () => {
        startOverlay.style.display = "none";
        startGame();
    });
});
