window.Pong = window.Pong || {};

window.Pong.bindInput = function bindInput(game) {
    const keys = {};
    game.keys = keys;

    document.addEventListener("keydown", (e) => {
        keys[e.code] = true;

        if (e.code === "Space") {
            game.spaceAction();
            e.preventDefault();
            return;
        }
        if (e.code === "Escape" || e.code === "KeyP") {
            game.togglePause();
            return;
        }
        if (["ArrowUp", "ArrowDown"].includes(e.code)) {
            e.preventDefault();
        }
    });

    document.addEventListener("keyup", (e) => {
        keys[e.code] = false;
    });

    window.addEventListener("blur", () => {
        for (const k of Object.keys(keys)) keys[k] = false;
    });
};
