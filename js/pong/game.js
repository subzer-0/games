window.Pong = window.Pong || {};

window.Pong.Game = class Game {
    constructor(renderer, sound, ui) {
        const cfg = window.Pong.config;
        this.cfg = cfg;
        this.renderer = renderer;
        this.sound = sound;
        this.ui = ui;

        this.mode = ui.mode;
        this.aiDifficulty = ui.aiDifficulty;

        this.isRunning = false;
        this.isPaused = false;
        this.rafId = null;
        this.lastTime = 0;
        this.keys = {};

        this.resetMatch();
    }

    setMode(m) { this.mode = m; }
    setAiDifficulty(d) { this.aiDifficulty = d; }

    resetMatch() {
        const { COURT_WIDTH: W, COURT_HEIGHT: H, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN, BALL_RADIUS } = this.cfg;
        this.paddleL = {
            x: PADDLE_MARGIN,
            y: H / 2 - PADDLE_HEIGHT / 2,
            w: PADDLE_WIDTH,
            h: PADDLE_HEIGHT,
        };
        this.paddleR = {
            x: W - PADDLE_MARGIN - PADDLE_WIDTH,
            y: H / 2 - PADDLE_HEIGHT / 2,
            w: PADDLE_WIDTH,
            h: PADDLE_HEIGHT,
        };
        this.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0, r: BALL_RADIUS };
        this.scoreL = 0;
        this.scoreR = 0;
        this.serveBall();
    }

    serveBall(towardLeft = null) {
        const { COURT_WIDTH: W, COURT_HEIGHT: H, BALL_INITIAL_SPEED } = this.cfg;
        this.ball.x = W / 2;
        this.ball.y = H / 2;
        const angle = (Math.random() - 0.5) * (Math.PI / 3);
        const dir = towardLeft === null
            ? (Math.random() < 0.5 ? -1 : 1)
            : (towardLeft ? -1 : 1);
        this.ball.vx = BALL_INITIAL_SPEED * Math.cos(angle) * dir;
        this.ball.vy = BALL_INITIAL_SPEED * Math.sin(angle);
    }

    start() {
        cancelAnimationFrame(this.rafId);
        this.resetMatch();
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
            this.update(dt);
        }
        this.renderer.draw(this);
        this.rafId = requestAnimationFrame(() => this.loop());
    }

    update(dt) {
        const { COURT_HEIGHT: H, PADDLE_SPEED, BALL_SPEED_INCREMENT, BALL_MAX_SPEED, WIN_SCORE, COURT_WIDTH: W } = this.cfg;

        if (this.keys["KeyW"]) this.paddleL.y -= PADDLE_SPEED * dt;
        if (this.keys["KeyS"]) this.paddleL.y += PADDLE_SPEED * dt;

        if (this.mode === "2p") {
            if (this.keys["ArrowUp"])   this.paddleR.y -= PADDLE_SPEED * dt;
            if (this.keys["ArrowDown"]) this.paddleR.y += PADDLE_SPEED * dt;
        } else {
            this.updateAI(dt);
        }

        this.paddleL.y = Math.max(0, Math.min(H - this.paddleL.h, this.paddleL.y));
        this.paddleR.y = Math.max(0, Math.min(H - this.paddleR.h, this.paddleR.y));

        this.ball.x += this.ball.vx * dt;
        this.ball.y += this.ball.vy * dt;

        if (this.ball.y - this.ball.r <= 0) {
            this.ball.y = this.ball.r;
            this.ball.vy = Math.abs(this.ball.vy);
            this.sound.wallHit();
        } else if (this.ball.y + this.ball.r >= H) {
            this.ball.y = H - this.ball.r;
            this.ball.vy = -Math.abs(this.ball.vy);
            this.sound.wallHit();
        }

        this.collidePaddle(this.paddleL, +1);
        this.collidePaddle(this.paddleR, -1);

        if (this.ball.x + this.ball.r < 0) {
            this.scoreR++;
            this.sound.score();
            if (this.scoreR >= WIN_SCORE) return this.endMatch("right");
            this.serveBall(false);
        } else if (this.ball.x - this.ball.r > W) {
            this.scoreL++;
            this.sound.score();
            if (this.scoreL >= WIN_SCORE) return this.endMatch("left");
            this.serveBall(true);
        }
    }

    collidePaddle(paddle, normalX) {
        if (normalX === +1 && this.ball.vx >= 0) return;
        if (normalX === -1 && this.ball.vx <= 0) return;

        const left   = this.ball.x - this.ball.r;
        const right  = this.ball.x + this.ball.r;
        const top    = this.ball.y - this.ball.r;
        const bottom = this.ball.y + this.ball.r;

        if (right >= paddle.x && left <= paddle.x + paddle.w &&
            bottom >= paddle.y && top <= paddle.y + paddle.h) {

            this.ball.vx = -this.ball.vx;
            const hitPos = (this.ball.y - (paddle.y + paddle.h / 2)) / (paddle.h / 2);
            this.ball.vy += hitPos * 2.5;

            const speed = Math.hypot(this.ball.vx, this.ball.vy) || 1;
            const newSpeed = Math.min(speed + this.cfg.BALL_SPEED_INCREMENT, this.cfg.BALL_MAX_SPEED);
            const factor = newSpeed / speed;
            this.ball.vx *= factor;
            this.ball.vy *= factor;

            if (normalX === +1) this.ball.x = paddle.x + paddle.w + this.ball.r;
            else                this.ball.x = paddle.x - this.ball.r;

            this.sound.paddleHit();
        }
    }

    updateAI(dt) {
        const ai = this.cfg.AI_DIFFICULTIES[this.aiDifficulty] || this.cfg.AI_DIFFICULTIES.normal;
        if (!this._aiOffset || Math.random() < 0.02) {
            this._aiOffset = (Math.random() - 0.5) * 2 * ai.errorPx;
        }
        const target = this.ball.y + this._aiOffset;
        const center = this.paddleR.y + this.paddleR.h / 2;
        const diff = target - center;
        const move = Math.max(-ai.maxSpeed, Math.min(ai.maxSpeed, diff)) * ai.lag;
        this.paddleR.y += move * dt;
    }

    endMatch(winner) {
        this.isRunning = false;
        cancelAnimationFrame(this.rafId);
        this.sound.win();
        this.ui.showMatchOver(winner, this.scoreL, this.scoreR);
    }

    togglePause() {
        if (!this.isRunning) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.ui.showPaused();
        } else {
            this.ui.hide();
            this.lastTime = performance.now();
        }
    }

    spaceAction() {
        if (!this.isRunning) this.start();
        else this.togglePause();
    }
};
