window.Asteroids = window.Asteroids || {};

window.Asteroids.Game = class Game {
    constructor(renderer, sound, ui) {
        const cfg = window.Asteroids.config;
        this.cfg = cfg;
        this.renderer = renderer;
        this.sound = sound;
        this.ui = ui;

        this.difficulty = ui.difficulty;

        this.isRunning = false;
        this.isPaused = false;
        this.rafId = null;
        this.lastTime = 0;
        this.keys = {};

        this.highScore = parseInt(localStorage.getItem(cfg.HIGH_SCORE_KEY) || "0", 10) || 0;
        this.resetGame();
    }

    setDifficulty(d) { this.difficulty = d; }

    resetGame() {
        this.score = 0;
        this.lives = this.cfg.STARTING_LIVES;
        this.wave = 1;
        this.nextExtraLife = this.cfg.EXTRA_LIFE_EVERY;
        this.bullets = [];
        this.particles = [];
        this.asteroids = [];
        this.bulletCooldown = 0;
        this.respawnTimer = 0;
        this.waveTimer = 0;
        this.thrusting = false;
        this.spawnShip(true);
        this.spawnWave();
    }

    spawnShip(invuln = false) {
        this.ship = {
            x: this.cfg.FIELD_WIDTH / 2,
            y: this.cfg.FIELD_HEIGHT / 2,
            vx: 0,
            vy: 0,
            angle: -Math.PI / 2,
            invuln: invuln ? this.cfg.SHIP_INVULN_FRAMES : 0,
            alive: true,
        };
    }

    spawnWave() {
        const diff = this.cfg.DIFFICULTIES[this.difficulty] || this.cfg.DIFFICULTIES.normal;
        const baseCount = diff.asteroidStart + (this.wave - 1) * this.cfg.WAVE_COUNT_INCREMENT;
        const count = Math.min(this.cfg.WAVE_MAX_COUNT, baseCount);
        for (let i = 0; i < count; i++) {
            this.asteroids.push(this.makeAsteroid("large"));
        }
    }

    makeAsteroid(size, x, y) {
        const cfg = this.cfg;
        const sizeData = cfg.ASTEROID_SIZES[size];
        const diff = cfg.DIFFICULTIES[this.difficulty] || cfg.DIFFICULTIES.normal;

        if (x === undefined || y === undefined) {
            do {
                x = Math.random() * cfg.FIELD_WIDTH;
                y = Math.random() * cfg.FIELD_HEIGHT;
            } while (this.ship && Math.hypot(x - this.ship.x, y - this.ship.y) < cfg.ASTEROID_SAFE_RADIUS + sizeData.radius);
        }

        const speed = (cfg.ASTEROID_MIN_SPEED + Math.random() * (cfg.ASTEROID_MAX_SPEED - cfg.ASTEROID_MIN_SPEED)) * diff.speedMul;
        const angle = Math.random() * Math.PI * 2;

        const verts = cfg.ASTEROID_VERTICES;
        const shape = [];
        for (let i = 0; i < verts; i++) {
            const a = (i / verts) * Math.PI * 2;
            const r = sizeData.radius * (1 - cfg.ASTEROID_JAGGEDNESS + Math.random() * cfg.ASTEROID_JAGGEDNESS * 2);
            shape.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }

        return {
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            angle: 0,
            spin: (Math.random() - 0.5) * 0.04,
            size,
            radius: sizeData.radius,
            shape,
        };
    }

    start() {
        cancelAnimationFrame(this.rafId);
        this.resetGame();
        this.isRunning = true;
        this.isPaused = false;
        this.ui.hide();
        this.lastTime = performance.now();
        this.loop();
    }

    loop() {
        if (!this.isRunning) return;
        if (!this.isPaused) {
            const now = performance.now();
            const dt = Math.min((now - this.lastTime) / 16.6667, 2.5);
            this.lastTime = now;
            if (window.Asteroids.pollGamepad) window.Asteroids.pollGamepad(this);
            this.update(dt);
        }
        this.renderer.draw(this);
        this.rafId = requestAnimationFrame(() => this.loop());
    }

    update(dt) {
        const cfg = this.cfg;

        if (this.respawnTimer > 0) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                if (this.lives > 0) {
                    this.spawnShip(true);
                } else {
                    return this.endGame();
                }
            }
        }

        if (this.waveTimer > 0) {
            this.waveTimer -= dt;
            if (this.waveTimer <= 0) {
                this.wave++;
                this.spawnWave();
            }
        }

        this.updateShip(dt);
        this.updateBullets(dt);
        this.updateAsteroids(dt);
        this.updateParticles(dt);
        this.checkCollisions();

        if (this.bulletCooldown > 0) this.bulletCooldown -= dt;

        if (this.asteroids.length === 0 && this.waveTimer <= 0) {
            this.waveTimer = cfg.WAVE_DELAY;
        }
    }

    updateShip(dt) {
        if (!this.ship.alive) { this.thrusting = false; this.sound.stopThrust(); return; }
        const cfg = this.cfg;
        const tk = this.touchKeys || { left: false, right: false, thrust: false };
        const pad = this.padInput || { rotate: 0, thrust: false };

        const left  = this.keys["ArrowLeft"]  || this.keys["KeyA"] || tk.left  || pad.rotate < 0;
        const right = this.keys["ArrowRight"] || this.keys["KeyD"] || tk.right || pad.rotate > 0;
        if (left)  this.ship.angle -= cfg.SHIP_TURN_SPEED * dt;
        if (right) this.ship.angle += cfg.SHIP_TURN_SPEED * dt;

        const wantThrust = this.keys["ArrowUp"] || this.keys["KeyW"] || tk.thrust || pad.thrust;
        if (wantThrust) {
            this.ship.vx += Math.cos(this.ship.angle) * cfg.SHIP_THRUST * dt;
            this.ship.vy += Math.sin(this.ship.angle) * cfg.SHIP_THRUST * dt;
            const speed = Math.hypot(this.ship.vx, this.ship.vy);
            if (speed > cfg.SHIP_MAX_SPEED) {
                const f = cfg.SHIP_MAX_SPEED / speed;
                this.ship.vx *= f;
                this.ship.vy *= f;
            }
            if (!this.thrusting) { this.thrusting = true; this.sound.startThrust(); }
        } else {
            if (this.thrusting) { this.thrusting = false; this.sound.stopThrust(); }
        }

        const drag = Math.pow(cfg.SHIP_DRAG, dt);
        this.ship.vx *= drag;
        this.ship.vy *= drag;

        this.ship.x += this.ship.vx * dt;
        this.ship.y += this.ship.vy * dt;
        this.wrap(this.ship);

        if (this.ship.invuln > 0) this.ship.invuln -= dt;
    }

    fireAction() {
        if (!this.isRunning || this.isPaused || !this.ship.alive) return;
        if (this.bulletCooldown > 0) return;
        if (this.bullets.length >= this.cfg.BULLET_MAX) return;

        const cos = Math.cos(this.ship.angle);
        const sin = Math.sin(this.ship.angle);
        this.bullets.push({
            x: this.ship.x + cos * 16,
            y: this.ship.y + sin * 16,
            vx: cos * this.cfg.BULLET_SPEED + this.ship.vx * 0.5,
            vy: sin * this.cfg.BULLET_SPEED + this.ship.vy * 0.5,
            life: this.cfg.BULLET_LIFETIME,
        });
        this.bulletCooldown = this.cfg.BULLET_COOLDOWN;
        this.sound.fire();
    }

    updateBullets(dt) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.life -= dt;
            this.wrap(b);
            if (b.life <= 0) this.bullets.splice(i, 1);
        }
    }

    updateAsteroids(dt) {
        for (const a of this.asteroids) {
            a.x += a.vx * dt;
            a.y += a.vy * dt;
            a.angle += a.spin * dt;
            this.wrap(a);
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    wrap(obj) {
        const W = this.cfg.FIELD_WIDTH;
        const H = this.cfg.FIELD_HEIGHT;
        if (obj.x < 0) obj.x += W;
        else if (obj.x > W) obj.x -= W;
        if (obj.y < 0) obj.y += H;
        else if (obj.y > H) obj.y -= H;
    }

    checkCollisions() {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const a = this.asteroids[i];

            for (let j = this.bullets.length - 1; j >= 0; j--) {
                const b = this.bullets[j];
                if (Math.hypot(a.x - b.x, a.y - b.y) < a.radius) {
                    this.bullets.splice(j, 1);
                    this.destroyAsteroid(i, a);
                    break;
                }
            }

            if (this.ship.alive && this.ship.invuln <= 0 &&
                Math.hypot(a.x - this.ship.x, a.y - this.ship.y) < a.radius + this.cfg.SHIP_RADIUS) {
                this.destroyAsteroid(i, a);
                this.killShip();
            }
        }
    }

    destroyAsteroid(index, a) {
        const cfg = this.cfg;
        const sizeData = cfg.ASTEROID_SIZES[a.size];

        this.score += sizeData.points;
        if (a.size === "large") this.sound.bangLarge();
        else if (a.size === "medium") this.sound.bangMedium();
        else this.sound.bangSmall();

        for (let i = 0; i < cfg.PARTICLE_COUNT_HIT; i++) {
            this.spawnParticle(a.x, a.y, 203, 213, 225);
        }

        this.asteroids.splice(index, 1);

        if (sizeData.next) {
            for (let i = 0; i < sizeData.count; i++) {
                const child = this.makeAsteroid(sizeData.next, a.x, a.y);
                child.vx = (a.vx + (Math.random() - 0.5) * 2) * cfg.ASTEROID_SPLIT_SPEED_BOOST;
                child.vy = (a.vy + (Math.random() - 0.5) * 2) * cfg.ASTEROID_SPLIT_SPEED_BOOST;
                this.asteroids.push(child);
            }
        }

        if (this.score >= this.nextExtraLife) {
            this.lives++;
            this.nextExtraLife += cfg.EXTRA_LIFE_EVERY;
            this.sound.extraLife();
        }
    }

    killShip() {
        this.sound.shipExplode();
        this.sound.stopThrust();
        for (let i = 0; i < this.cfg.PARTICLE_COUNT_SHIP; i++) {
            this.spawnParticle(this.ship.x, this.ship.y, 92, 255, 225);
        }
        this.ship.alive = false;
        this.lives--;
        this.respawnTimer = this.cfg.SHIP_RESPAWN_DELAY;
    }

    spawnParticle(x, y, r, g, b) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * this.cfg.PARTICLE_SPEED;
        this.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: this.cfg.PARTICLE_LIFETIME * (0.5 + Math.random() * 0.5),
            r, g, b,
        });
    }

    endGame() {
        this.isRunning = false;
        cancelAnimationFrame(this.rafId);
        this.sound.stopThrust();
        const isNewBest = this.score > this.highScore;
        if (isNewBest) {
            this.highScore = this.score;
            localStorage.setItem(this.cfg.HIGH_SCORE_KEY, String(this.highScore));
        }
        this.ui.showGameOver(this.score, this.highScore, isNewBest);
    }

    togglePause() {
        if (!this.isRunning) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.sound.stopThrust();
            this.ui.showPaused();
        } else {
            this.ui.hide();
            this.lastTime = performance.now();
        }
    }

    enterAction() {
        if (!this.isRunning) this.start();
    }
};
