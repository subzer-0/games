window.Asteroids = window.Asteroids || {};

window.Asteroids.UI = class UI {
    constructor(elements, sound, callbacks) {
        const cfg = window.Asteroids.config;
        this.elements = elements;
        this.sound = sound;
        this.callbacks = callbacks;

        this.difficulty = localStorage.getItem(cfg.DIFFICULTY_KEY) || "normal";
        if (!cfg.DIFFICULTIES[this.difficulty]) this.difficulty = "normal";

        this.soundEnabled = localStorage.getItem(cfg.SOUND_KEY) !== "0";
        sound.setEnabled(this.soundEnabled);

        this.populateOptions();
        this.bind();
        this.refresh();
    }

    populateOptions() {
        const { DIFFICULTIES } = window.Asteroids.config;
        this.elements.difficultySelect.innerHTML = "";
        for (const [key, val] of Object.entries(DIFFICULTIES)) {
            const opt = document.createElement("option");
            opt.value = key;
            opt.textContent = val.label;
            this.elements.difficultySelect.appendChild(opt);
        }
    }

    bind() {
        const cfg = window.Asteroids.config;

        this.elements.startBtn.addEventListener("click", () => {
            this.callbacks.onStartOrResume();
        });

        this.elements.difficultySelect.addEventListener("change", (e) => {
            this.difficulty = e.target.value;
            localStorage.setItem(cfg.DIFFICULTY_KEY, this.difficulty);
            this.callbacks.onDifficultyChange(this.difficulty);
        });

        this.elements.soundToggle.addEventListener("click", () => {
            this.soundEnabled = !this.soundEnabled;
            this.sound.setEnabled(this.soundEnabled);
            localStorage.setItem(cfg.SOUND_KEY, this.soundEnabled ? "1" : "0");
            this.refresh();
        });
    }

    refresh() {
        this.elements.difficultySelect.value = this.difficulty;
        this.elements.soundToggle.textContent = "Sound: " + (this.soundEnabled ? "On" : "Off");
        this.elements.soundToggle.setAttribute("aria-pressed", String(this.soundEnabled));
    }

    setControlsDisabled(disabled) {
        this.elements.difficultySelect.disabled = disabled;
    }

    showStart() {
        this.elements.overlayTitle.textContent = "Asteroids";
        this.elements.overlaySubtitle.textContent = "Survive the field. Don't get hit.";
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

    showGameOver(score, highScore, isNewBest) {
        this.elements.overlayTitle.textContent = isNewBest ? "New Best!" : "Game Over";
        this.elements.overlaySubtitle.textContent = `Score ${score}  ·  Best ${highScore}`;
        this.elements.startBtn.textContent = "Play Again";
        this.elements.overlay.classList.remove("hidden");
        this.setControlsDisabled(false);
    }

    hide() {
        this.elements.overlay.classList.add("hidden");
        this.setControlsDisabled(true);
    }
};
