(function () {
    const { Renderer, SoundManager, UI, Game, bindInput, config } = window.Snake;

    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
    }

    const elements = {
        container:       document.getElementById("game-container"),
        overlay:         document.getElementById("overlay"),
        overlayTitle:    document.getElementById("overlay-title"),
        overlaySubtitle: document.getElementById("overlay-subtitle"),
        startBtn:        document.getElementById("start-btn"),
        score:           document.getElementById("score"),
        highScore:       document.getElementById("high-score"),
        diffSelect:      document.getElementById("difficulty"),
        soundToggle:     document.getElementById("sound-toggle"),
    };

    const sound = new SoundManager();
    const renderer = new Renderer(elements.container, config.GRID_SIZE, elements.overlay);

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
    ui.updateScore(0, game.highScore);
    renderer.draw(game);

    bindInput(game, elements.container);

    window.addEventListener("resize", () => {
        renderer.recompute();
        renderer.draw(game);
    });
})();
