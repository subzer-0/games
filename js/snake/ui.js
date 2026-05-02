window.Snake = window.Snake || {};

window.Snake.UI = class UI {
    constructor(elements, sound, callbacks) {
        const cfg = window.Snake.config;
        this.elements = elements;
        this.sound = sound;
        this.callbacks = callbacks;

        this.difficulty = localStorage.getItem(cfg.DIFFICULTY_KEY) || "normal";
        if (!cfg.DIFFICULTIES[this.difficulty]) this.difficulty = "normal";
        this.soundEnabled = localStorage.getItem(cfg.SOUND_KEY) !== "0";
        sound.setEnabled(this.soundEnabled);

        this.populateDifficulties();
        this.bind();
        this.refresh();
    }

    populateDifficulties() {
        const { DIFFICULTIES } = window.Snake.config;
        const sel = this.elements.diffSelect;
        sel.innerHTML = "";
        for (const [key, val] of Object.entries(DIFFICULTIES)) {
            const opt = document.createElement("option");
            opt.value = key;
            opt.textContent = val.label;
            sel.appendChild(opt);
        }
    }

    bind() {
        const cfg = window.Snake.config;

        this.elements.startBtn.addEventListener("click", () => {
            this.callbacks.onStartOrResume();
        });

        this.elements.diffSelect.addEventListener("change", (e) => {
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
        this.elements.diffSelect.value = this.difficulty;
        this.elements.soundToggle.textContent = "Sound: " + (this.soundEnabled ? "On" : "Off");
        this.elements.soundToggle.setAttribute("aria-pressed", String(this.soundEnabled));
    }

    showStart() {
        this.elements.overlayTitle.textContent = "Snake";
        this.elements.overlaySubtitle.textContent = "Eat food to grow. Don't hit yourself.";
        this.elements.startBtn.textContent = "Start";
        this.elements.overlay.classList.remove("hidden");
        this.elements.diffSelect.disabled = false;
    }

    showPaused() {
        this.elements.overlayTitle.textContent = "Paused";
        this.elements.overlaySubtitle.textContent = "Press P or Esc to resume";
        this.elements.startBtn.textContent = "Resume";
        this.elements.overlay.classList.remove("hidden");
        this.elements.diffSelect.disabled = true;
    }

    showGameOver(score, highScore) {
        this.elements.overlayTitle.textContent = "Game Over";
        this.elements.overlaySubtitle.textContent = `Score: ${score}  ·  Best: ${highScore}`;
        this.elements.startBtn.textContent = "Play Again";
        this.elements.overlay.classList.remove("hidden");
        this.elements.diffSelect.disabled = false;
    }

    hide() {
        this.elements.overlay.classList.add("hidden");
        this.elements.diffSelect.disabled = true;
    }

    updateScore(score, highScore) {
        this.elements.score.textContent = `Score: ${score}`;
        this.elements.highScore.textContent = `Best: ${highScore}`;
    }
};
