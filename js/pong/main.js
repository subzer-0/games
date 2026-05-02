(function () {
    const { Renderer, SoundManager, UI, Game, bindInput, config } = window.Pong;

    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
    }

    const canvas = document.getElementById("game-canvas");
    canvas.width = config.COURT_WIDTH;
    canvas.height = config.COURT_HEIGHT;

    const elements = {
        canvas,
        overlay:         document.getElementById("overlay"),
        overlayTitle:    document.getElementById("overlay-title"),
        overlaySubtitle: document.getElementById("overlay-subtitle"),
        startBtn:        document.getElementById("start-btn"),
        modeSelect:      document.getElementById("mode"),
        aiSelect:        document.getElementById("ai-difficulty"),
        aiWrapper:       document.getElementById("ai-wrapper"),
        soundToggle:     document.getElementById("sound-toggle"),
        hint:            document.getElementById("hint"),
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
        onModeChange: (m) => { if (game) game.setMode(m); },
        onAiDifficultyChange: (d) => { if (game) game.setAiDifficulty(d); },
    });

    game = new Game(renderer, sound, ui);
    ui.showStart();
    renderer.draw(game);
    bindInput(game);
})();
