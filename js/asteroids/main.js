(function () {
    const { Renderer, SoundManager, UI, Game, bindInput, config } = window.Asteroids;

    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
    }

    const canvas = document.getElementById("game-canvas");
    canvas.width = config.FIELD_WIDTH;
    canvas.height = config.FIELD_HEIGHT;

    const elements = {
        canvas,
        overlay:           document.getElementById("overlay"),
        overlayTitle:      document.getElementById("overlay-title"),
        overlaySubtitle:   document.getElementById("overlay-subtitle"),
        startBtn:          document.getElementById("start-btn"),
        difficultySelect:  document.getElementById("difficulty"),
        soundToggle:       document.getElementById("sound-toggle"),
        hint:              document.getElementById("hint"),
    };

    const sound = new SoundManager();
    const renderer = new Renderer(canvas);

    let game;
    const ui = new UI(elements, sound, {
        onStartOrResume: () => {
            if (!game) return;
            if (game.isPaused) game.togglePause();
            else game.start();
        },
        onDifficultyChange: (d) => { if (game) game.setDifficulty(d); },
    });

    game = new Game(renderer, sound, ui);
    ui.showStart();
    renderer.draw(game);
    bindInput(game, {
        left:   document.getElementById("btn-left"),
        right:  document.getElementById("btn-right"),
        thrust: document.getElementById("btn-thrust"),
        fire:   document.getElementById("btn-fire"),
    });

    function metaPoll() {
        requestAnimationFrame(metaPoll);
        const inGameLoop = game.isRunning && !game.isPaused;
        if (!inGameLoop && window.Asteroids.pollGamepad) {
            window.Asteroids.pollGamepad(game);
        }
    }
    metaPoll();
})();
