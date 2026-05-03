window.Asteroids = window.Asteroids || {};

window.Asteroids.config = {
    FIELD_WIDTH: 800,
    FIELD_HEIGHT: 600,

    SHIP_RADIUS: 12,
    SHIP_TURN_SPEED: 0.09,
    SHIP_THRUST: 0.18,
    SHIP_DRAG: 0.992,
    SHIP_MAX_SPEED: 8,
    SHIP_INVULN_FRAMES: 120,
    SHIP_RESPAWN_DELAY: 60,

    BULLET_SPEED: 9,
    BULLET_LIFETIME: 50,
    BULLET_COOLDOWN: 8,
    BULLET_MAX: 4,
    BULLET_RADIUS: 2,

    ASTEROID_SIZES: {
        large:  { radius: 42, points: 20, next: "medium", count: 2 },
        medium: { radius: 24, points: 50, next: "small",  count: 2 },
        small:  { radius: 12, points: 100, next: null,    count: 0 },
    },
    ASTEROID_JAGGEDNESS: 0.4,
    ASTEROID_VERTICES: 11,
    ASTEROID_MIN_SPEED: 0.5,
    ASTEROID_MAX_SPEED: 1.6,
    ASTEROID_SPLIT_SPEED_BOOST: 1.4,
    ASTEROID_SAFE_RADIUS: 100,

    STARTING_LIVES: 3,
    EXTRA_LIFE_EVERY: 10000,
    WAVE_START_COUNT: 4,
    WAVE_COUNT_INCREMENT: 1,
    WAVE_MAX_COUNT: 9,
    WAVE_DELAY: 90,

    PARTICLE_COUNT_HIT: 12,
    PARTICLE_COUNT_SHIP: 24,
    PARTICLE_LIFETIME: 40,
    PARTICLE_SPEED: 2.5,

    DIFFICULTIES: {
        easy:   { label: "Easy",   speedMul: 0.8, asteroidStart: 3 },
        normal: { label: "Normal", speedMul: 1.0, asteroidStart: 4 },
        hard:   { label: "Hard",   speedMul: 1.3, asteroidStart: 5 },
    },

    DIFFICULTY_KEY: "asteroids.difficulty",
    SOUND_KEY:      "asteroids.soundEnabled",
    HIGH_SCORE_KEY: "asteroids.highScore",
};
