window.Pong = window.Pong || {};

window.Pong.SoundManager = class SoundManager {
    constructor(enabled = true) {
        this.enabled = enabled;
        this.ctx = null;
    }

    setEnabled(v) { this.enabled = v; }

    ensureCtx() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) this.ctx = new AC();
        }
        if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
        return this.ctx;
    }

    tone(freq, duration = 0.08, type = "square", gain = 0.12, startOffset = 0) {
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

    paddleHit() { this.tone(520, 0.05, "square", 0.14); }
    wallHit()   { this.tone(330, 0.05, "square", 0.10); }
    score() {
        this.tone(880, 0.10, "triangle", 0.14, 0);
        this.tone(440, 0.16, "triangle", 0.14, 0.10);
    }
    win() {
        this.tone(523, 0.10, "square", 0.12, 0);
        this.tone(659, 0.10, "square", 0.12, 0.10);
        this.tone(784, 0.18, "square", 0.12, 0.20);
    }
};
