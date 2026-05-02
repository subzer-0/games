window.Snake = window.Snake || {};

window.Snake.SoundManager = class SoundManager {
    constructor(enabled = true) {
        this.enabled = enabled;
        this.ctx = null;
    }

    setEnabled(v) {
        this.enabled = v;
    }

    ensureCtx() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) this.ctx = new AC();
        }
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
        return this.ctx;
    }

    tone(freq, duration = 0.08, type = "square", gain = 0.1, startOffset = 0) {
        if (!this.enabled) return;
        const ctx = this.ensureCtx();
        if (!ctx) return;
        const t0 = ctx.currentTime + startOffset;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(gain, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
        osc.connect(g).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + duration);
    }

    eat() {
        this.tone(660, 0.08, "square", 0.12);
    }

    bonus() {
        this.tone(880, 0.07, "triangle", 0.14, 0);
        this.tone(1320, 0.10, "triangle", 0.14, 0.07);
    }

    gameOver() {
        this.tone(440, 0.14, "sawtooth", 0.14, 0);
        this.tone(220, 0.24, "sawtooth", 0.14, 0.13);
    }

    start() {
        this.tone(523, 0.06, "square", 0.10, 0);
        this.tone(784, 0.10, "square", 0.10, 0.06);
    }
};
