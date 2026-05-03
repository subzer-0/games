window.Pong = window.Pong || {};

window.Pong.UI = class UI {
    constructor(elements, sound, callbacks) {
        const cfg = window.Pong.config;
        this.elements = elements;
        this.sound = sound;
        this.callbacks = callbacks;

        this.mode = localStorage.getItem(cfg.MODE_KEY) || "1p";
        if (!cfg.MODES[this.mode]) this.mode = "1p";

        this.aiDifficulty = localStorage.getItem(cfg.AI_KEY) || "normal";
        if (!cfg.AI_DIFFICULTIES[this.aiDifficulty]) this.aiDifficulty = "normal";

        this.soundEnabled = localStorage.getItem(cfg.SOUND_KEY) !== "0";
        sound.setEnabled(this.soundEnabled);

        this.populateOptions();
        this.bind();
        this.refresh();
    }

    populateOptions() {
        const { MODES, AI_DIFFICULTIES } = window.Pong.config;

        this.elements.modeSelect.innerHTML = "";
        for (const [key, val] of Object.entries(MODES)) {
            const opt = document.createElement("option");
            opt.value = key;
            opt.textContent = val.label;
            this.elements.modeSelect.appendChild(opt);
        }

        this.elements.aiSelect.innerHTML = "";
        for (const [key, val] of Object.entries(AI_DIFFICULTIES)) {
            const opt = document.createElement("option");
            opt.value = key;
            opt.textContent = val.label;
            this.elements.aiSelect.appendChild(opt);
        }
    }

    bind() {
        const cfg = window.Pong.config;

        this.elements.startBtn.addEventListener("click", () => {
            this.callbacks.onStartOrResume();
        });

        this.elements.modeSelect.addEventListener("change", (e) => {
            this.mode = e.target.value;
            localStorage.setItem(cfg.MODE_KEY, this.mode);
            this.callbacks.onModeChange(this.mode);
            this.refresh();
        });

        this.elements.aiSelect.addEventListener("change", (e) => {
            this.aiDifficulty = e.target.value;
            localStorage.setItem(cfg.AI_KEY, this.aiDifficulty);
            this.callbacks.onAiDifficultyChange(this.aiDifficulty);
        });

        this.elements.soundToggle.addEventListener("click", () => {
            this.soundEnabled = !this.soundEnabled;
            this.sound.setEnabled(this.soundEnabled);
            localStorage.setItem(cfg.SOUND_KEY, this.soundEnabled ? "1" : "0");
            this.refresh();
        });
    }

    refresh() {
        this.elements.modeSelect.value = this.mode;
        this.elements.aiSelect.value = this.aiDifficulty;
        this.elements.aiSelect.disabled = this.mode !== "1p";
        this.elements.aiWrapper.style.opacity = this.mode === "1p" ? "1" : "0.4";
        this.elements.soundToggle.textContent = "Sound: " + (this.soundEnabled ? "On" : "Off");
        this.elements.soundToggle.setAttribute("aria-pressed", String(this.soundEnabled));

        const isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
        const p2Hint = this.mode === "2p"
            ? (isTouch ? "Touch left half · right half" : "Left: W / S  ·  Right: ↑ / ↓")
            : (isTouch ? "Drag the left side to move" : "W / S to move  ·  AI controls right paddle");
        const tail = isTouch ? "  ·  Tap canvas to start" : "  ·  Space to start  ·  P or Esc to pause";
        this.elements.hint.textContent = p2Hint + tail;
    }

    setControlsDisabled(disabled) {
        this.elements.modeSelect.disabled = disabled;
        this.elements.aiSelect.disabled = disabled || this.mode !== "1p";
    }

    showStart() {
        this.elements.overlayTitle.textContent = "Pong";
        this.elements.overlaySubtitle.textContent = `First to ${window.Pong.config.WIN_SCORE} wins.`;
        this.elements.startBtn.textContent = "Start";
        this.elements.overlay.classList.remove("hidden");
        this.setControlsDisabled(false);
    }

    showPaused() {
        this.elements.overlayTitle.textContent = "Paused";
        this.elements.overlaySubtitle.textContent = "Press P or Esc to resume";
        this.elements.startBtn.textContent = "Resume";
        this.elements.overlay.classList.remove("hidden");
        this.setControlsDisabled(true);
    }

    showMatchOver(winner, scoreL, scoreR) {
        const label = winner === "left"
            ? (this.mode === "2p" ? "Left Player Wins" : "You Win")
            : (this.mode === "2p" ? "Right Player Wins" : "AI Wins");
        this.elements.overlayTitle.textContent = label;
        this.elements.overlaySubtitle.textContent = `${scoreL} : ${scoreR}`;
        this.elements.startBtn.textContent = "Play Again";
        this.elements.overlay.classList.remove("hidden");
        this.setControlsDisabled(false);
    }

    hide() {
        this.elements.overlay.classList.add("hidden");
        this.setControlsDisabled(true);
    }
};
