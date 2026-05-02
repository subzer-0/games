window.Snake = window.Snake || {};

window.Snake.config = {
    GRID_SIZE: 40,
    HIGH_SCORE_KEY: "snake.highScore",
    DIFFICULTY_KEY: "snake.difficulty",
    SOUND_KEY: "snake.soundEnabled",
    BONUS_SPAWN_CHANCE: 0.18,
    BONUS_LIFETIME_TICKS: 60,
    DIFFICULTIES: {
        easy:   { label: "Easy",   baseTickMs: 160, minTickMs: 90 },
        normal: { label: "Normal", baseTickMs: 120, minTickMs: 55 },
        hard:   { label: "Hard",   baseTickMs:  85, minTickMs: 40 },
    },
    opposite: { up: "down", down: "up", left: "right", right: "left" },
};
