window.Pong = window.Pong || {};

window.Pong.config = {
    COURT_WIDTH: 800,
    COURT_HEIGHT: 500,
    PADDLE_WIDTH: 12,
    PADDLE_HEIGHT: 80,
    PADDLE_MARGIN: 24,
    PADDLE_SPEED: 6,
    BALL_RADIUS: 8,
    BALL_INITIAL_SPEED: 5,
    BALL_SPEED_INCREMENT: 0.35,
    BALL_MAX_SPEED: 13,
    WIN_SCORE: 7,

    AI_DIFFICULTIES: {
        easy:   { label: "Easy",   maxSpeed: 4, errorPx: 32, lag: 0.65 },
        normal: { label: "Normal", maxSpeed: 5, errorPx: 16, lag: 0.85 },
        hard:   { label: "Hard",   maxSpeed: 6, errorPx: 6,  lag: 1.00 },
    },

    MODES: {
        "1p": { label: "1 Player vs AI" },
        "2p": { label: "2 Players" },
    },

    MODE_KEY:  "pong.mode",
    AI_KEY:    "pong.aiDifficulty",
    SOUND_KEY: "pong.soundEnabled",
};
