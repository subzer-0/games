window.Snake = window.Snake || {};

window.Snake.Game = class Game {
    constructor(renderer, sound, ui) {
        const cfg = window.Snake.config;
        this.cfg = cfg;
        this.renderer = renderer;
        this.sound = sound;
        this.ui = ui;

        this.snake = [];
        this.direction = null;
        this.nextDirection = null;
        this.food = null;
        this.bonus = null;
        this.bonusTicks = 0;
        this.gameTimer = null;
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.highScore = Number(localStorage.getItem(cfg.HIGH_SCORE_KEY)) || 0;
        this.difficulty = ui.difficulty;
    }

    setDifficulty(d) {
        this.difficulty = d;
    }

    diffSettings() {
        return this.cfg.DIFFICULTIES[this.difficulty] || this.cfg.DIFFICULTIES.normal;
    }

    randomEmptyCell() {
        const N = this.cfg.GRID_SIZE;
        const occupied = new Set(this.snake.map(s => s.x + "," + s.y));
        if (this.food)  occupied.add(this.food.x + "," + this.food.y);
        if (this.bonus) occupied.add(this.bonus.x + "," + this.bonus.y);
        const empty = [];
        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                if (!occupied.has(x + "," + y)) empty.push({ x, y });
            }
        }
        return empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
    }

    generateFood() {
        this.food = this.randomEmptyCell();
    }

    maybeSpawnBonus() {
        if (this.bonus) return;
        if (Math.random() < this.cfg.BONUS_SPAWN_CHANCE) {
            this.bonus = this.randomEmptyCell();
            this.bonusTicks = this.cfg.BONUS_LIFETIME_TICKS;
        }
    }

    tickInterval() {
        const d = this.diffSettings();
        const speedFactor = Math.min((this.snake.length - 1) / 40, 1);
        return d.baseTickMs - (d.baseTickMs - d.minTickMs) * speedFactor;
    }

    scheduleTick() {
        clearTimeout(this.gameTimer);
        this.gameTimer = setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.move();
                if (this.isRunning && !this.isPaused) this.scheduleTick();
            }
        }, this.tickInterval());
    }

    move() {
        const opp = this.cfg.opposite;
        if (this.nextDirection && this.nextDirection !== opp[this.direction]) {
            this.direction = this.nextDirection;
        }
        if (!this.direction) return;

        const head = { ...this.snake[0] };
        if      (this.direction === "up")    head.y--;
        else if (this.direction === "down")  head.y++;
        else if (this.direction === "left")  head.x--;
        else if (this.direction === "right") head.x++;

        const N = this.cfg.GRID_SIZE;
        const hitWall = head.x < 0 || head.x >= N || head.y < 0 || head.y >= N;
        const hitSelf = this.snake.some((s, i) =>
            i !== this.snake.length - 1 && s.x === head.x && s.y === head.y
        );
        if (hitWall || hitSelf) {
            this.endGame();
            return;
        }

        let grew = false;
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            grew = true;
            this.score += 10;
            this.generateFood();
            this.maybeSpawnBonus();
            this.sound.eat();
        } else if (this.bonus && head.x === this.bonus.x && head.y === this.bonus.y) {
            grew = true;
            this.score += 50;
            this.bonus = null;
            this.bonusTicks = 0;
            this.sound.bonus();
        }

        this.snake.unshift(head);
        if (!grew) this.snake.pop();

        if (this.bonus) {
            this.bonusTicks--;
            if (this.bonusTicks <= 0) this.bonus = null;
        }

        this.ui.updateScore(this.score, this.highScore);
        this.renderer.draw(this);
    }

    start() {
        clearTimeout(this.gameTimer);
        const N = this.cfg.GRID_SIZE;
        this.snake = [{ x: Math.floor(N / 2), y: Math.floor(N / 2) }];
        const dirs = ["up", "down", "left", "right"];
        this.direction = dirs[Math.floor(Math.random() * 4)];
        this.nextDirection = this.direction;
        this.score = 0;
        this.bonus = null;
        this.bonusTicks = 0;
        this.generateFood();
        this.ui.updateScore(this.score, this.highScore);
        this.isRunning = true;
        this.isPaused = false;
        this.ui.hide();
        this.renderer.draw(this);
        this.sound.start();
        this.scheduleTick();
    }

    endGame() {
        this.isRunning = false;
        clearTimeout(this.gameTimer);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(this.cfg.HIGH_SCORE_KEY, String(this.highScore));
        }
        this.ui.updateScore(this.score, this.highScore);
        this.ui.showGameOver(this.score, this.highScore);
        this.sound.gameOver();
    }

    togglePause() {
        if (!this.isRunning) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.ui.showPaused();
        } else {
            this.ui.hide();
            this.scheduleTick();
        }
    }

    spaceAction() {
        if (!this.isRunning) this.start();
        else this.togglePause();
    }

    setDirection(dir) {
        if (!this.isRunning || this.isPaused) return;
        if (this.direction && dir === this.cfg.opposite[this.direction]) return;
        this.nextDirection = dir;
    }
};
