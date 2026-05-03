window.Asteroids = window.Asteroids || {};

window.Asteroids.SoundManager = class SoundManager {
    constructor(enabled = true) {
        this.enabled = enabled;
        this.ctx = null;
        this.thrustNode = null;
        this.thrustGain = null;
    }

    setEnabled(v) {
        this.enabled = v;
        if (!v) this.stopThrust();
    }

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

    noiseBurst(duration = 0.25, gain = 0.18, lowpass = 800) {
        if (!this.enabled) return;
        const ctx = this.ensureCtx();
        if (!ctx) return;
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = lowpass;
        const g = ctx.createGain();
        g.gain.value = gain;
        src.connect(filter).connect(g).connect(ctx.destination);
        src.start();
    }

    fire()        { this.tone(880, 0.08, "triangle", 0.10); }
    bangLarge()   { this.noiseBurst(0.45, 0.22, 500); }
    bangMedium()  { this.noiseBurst(0.30, 0.18, 700); }
    bangSmall()   { this.noiseBurst(0.18, 0.14, 1100); }
    extraLife() {
        this.tone(523, 0.10, "square", 0.12, 0);
        this.tone(659, 0.10, "square", 0.12, 0.10);
        this.tone(784, 0.18, "square", 0.12, 0.20);
    }
    shipExplode() {
        this.noiseBurst(0.6, 0.28, 350);
        this.tone(120, 0.4, "sawtooth", 0.14, 0.05);
    }

    startThrust() {
        if (!this.enabled || this.thrustNode) return;
        const ctx = this.ensureCtx();
        if (!ctx) return;
        const bufferSize = ctx.sampleRate * 1.0;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 600;
        const g = ctx.createGain();
        g.gain.value = 0.05;
        src.connect(filter).connect(g).connect(ctx.destination);
        src.start();
        this.thrustNode = src;
        this.thrustGain = g;
    }

    stopThrust() {
        if (!this.thrustNode) return;
        try { this.thrustNode.stop(); } catch (_) {}
        this.thrustNode = null;
        this.thrustGain = null;
    }
};
