window.Asteroids = window.Asteroids || {};

window.Asteroids.Renderer = class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    draw(state) {
        const { FIELD_WIDTH: W, FIELD_HEIGHT: H } = window.Asteroids.config;
        const ctx = this.ctx;

        ctx.fillStyle = "#050208";
        ctx.fillRect(0, 0, W, H);

        for (const a of state.asteroids) this.drawAsteroid(a);
        for (const b of state.bullets) this.drawBullet(b);
        for (const p of state.particles) this.drawParticle(p);
        if (state.ship && state.ship.alive) this.drawShip(state.ship, state.thrusting);

        this.drawHUD(state);
    }

    drawShip(ship, thrusting) {
        const ctx = this.ctx;
        if (ship.invuln > 0 && Math.floor(ship.invuln / 6) % 2 === 0) return;

        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);
        ctx.strokeStyle = "#5cffe1";
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(92, 255, 225, 0.7)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(-10, 9);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-10, -9);
        ctx.closePath();
        ctx.stroke();

        if (thrusting && Math.random() < 0.7) {
            ctx.strokeStyle = "#fb923c";
            ctx.shadowColor = "rgba(251, 146, 60, 0.8)";
            ctx.beginPath();
            ctx.moveTo(-6, 5);
            ctx.lineTo(-14 - Math.random() * 4, 0);
            ctx.lineTo(-6, -5);
            ctx.stroke();
        }
        ctx.restore();
        ctx.shadowBlur = 0;
    }

    drawAsteroid(a) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(203, 213, 225, 0.4)";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        for (let i = 0; i < a.shape.length; i++) {
            const v = a.shape[i];
            if (i === 0) ctx.moveTo(v.x, v.y);
            else ctx.lineTo(v.x, v.y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        ctx.shadowBlur = 0;
    }

    drawBullet(b) {
        const ctx = this.ctx;
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, window.Asteroids.config.BULLET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    drawParticle(p) {
        const ctx = this.ctx;
        const alpha = Math.max(0, p.life / window.Asteroids.config.PARTICLE_LIFETIME);
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }

    drawHUD(state) {
        const ctx = this.ctx;
        ctx.fillStyle = "#fff";
        ctx.font = "bold 22px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(String(state.score).padStart(6, "0"), 16, 14);

        ctx.font = "13px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.fillText("BEST " + String(state.highScore).padStart(6, "0"), 16, 40);

        ctx.textAlign = "right";
        ctx.font = "13px monospace";
        ctx.fillText("WAVE " + state.wave, window.Asteroids.config.FIELD_WIDTH - 16, 40);

        for (let i = 0; i < state.lives; i++) {
            ctx.save();
            ctx.translate(window.Asteroids.config.FIELD_WIDTH - 24 - i * 22, 24);
            ctx.rotate(-Math.PI / 2);
            ctx.strokeStyle = "#5cffe1";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-7, 6);
            ctx.lineTo(-4, 0);
            ctx.lineTo(-7, -6);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
    }
};
