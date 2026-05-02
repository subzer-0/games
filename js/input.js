window.Snake = window.Snake || {};

window.Snake.bindInput = function bindInput(game, container) {
    document.addEventListener("keydown", (e) => {
        const k = e.key;
        if      (k === "ArrowUp"    || k === "w" || k === "W") game.setDirection("up");
        else if (k === "ArrowDown"  || k === "s" || k === "S") game.setDirection("down");
        else if (k === "ArrowLeft"  || k === "a" || k === "A") game.setDirection("left");
        else if (k === "ArrowRight" || k === "d" || k === "D") game.setDirection("right");
        else if (k === "p" || k === "P" || k === "Escape")     game.togglePause();
        else if (e.code === "Space")                            game.spaceAction();

        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(k)) {
            e.preventDefault();
        }
    });

    let touchStart = null;
    container.addEventListener("touchstart", (e) => {
        const t = e.touches[0];
        touchStart = { x: t.clientX, y: t.clientY };
    }, { passive: true });

    container.addEventListener("touchend", (e) => {
        if (!touchStart) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touchStart.x;
        const dy = t.clientY - touchStart.y;
        const adx = Math.abs(dx), ady = Math.abs(dy);
        touchStart = null;
        if (Math.max(adx, ady) < 20) {
            game.spaceAction();
            return;
        }
        if (adx > ady) game.setDirection(dx > 0 ? "right" : "left");
        else            game.setDirection(dy > 0 ? "down"  : "up");
    }, { passive: true });
};
