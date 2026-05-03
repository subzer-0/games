window.Pong = window.Pong || {};

window.Pong.bindInput = function bindInput(game, canvas) {
    const keys = {};
    game.keys = keys;
    game.touchTargets = { left: null, right: null };
    game.padInput = { leftDir: 0, rightDir: 0 };
    game._padPrev = {};

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
        game.touchTargets.left = null;
        game.touchTargets.right = null;
    });

    if (canvas) bindTouch(game, canvas);
};

function bindTouch(game, canvas) {
    const activeTouches = new Map();

    function pointFromTouch(t) {
        const rect = canvas.getBoundingClientRect();
        const xRatio = canvas.width / rect.width;
        const yRatio = canvas.height / rect.height;
        return {
            x: (t.clientX - rect.left) * xRatio,
            y: (t.clientY - rect.top) * yRatio,
        };
    }

    function applyTouches() {
        let leftY = null;
        let rightY = null;
        for (const p of activeTouches.values()) {
            if (p.x < window.Pong.config.COURT_WIDTH / 2) leftY = p.y;
            else rightY = p.y;
        }
        game.touchTargets.left = leftY;
        game.touchTargets.right = rightY;
    }

    canvas.addEventListener("touchstart", (e) => {
        for (const t of e.changedTouches) {
            activeTouches.set(t.identifier, pointFromTouch(t));
        }
        applyTouches();
        if (!game.isRunning) game.spaceAction();
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener("touchmove", (e) => {
        for (const t of e.changedTouches) {
            if (activeTouches.has(t.identifier)) activeTouches.set(t.identifier, pointFromTouch(t));
        }
        applyTouches();
        e.preventDefault();
    }, { passive: false });

    function endTouch(e) {
        for (const t of e.changedTouches) activeTouches.delete(t.identifier);
        applyTouches();
        e.preventDefault();
    }
    canvas.addEventListener("touchend", endTouch, { passive: false });
    canvas.addEventListener("touchcancel", endTouch, { passive: false });
}

window.Pong.pollGamepad = function pollGamepad(game) {
    if (!navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    let leftDir = 0;
    let rightDir = 0;
    let pauseEdge = false;

    const DEAD = 0.25;

    for (let i = 0; i < pads.length; i++) {
        const pad = pads[i];
        if (!pad) continue;

        const yAxis = pad.axes[1] || 0;
        const dpadUp = pad.buttons[12] && pad.buttons[12].pressed;
        const dpadDown = pad.buttons[13] && pad.buttons[13].pressed;

        let dir = 0;
        if (yAxis < -DEAD || dpadUp) dir = -1;
        else if (yAxis > DEAD || dpadDown) dir = 1;

        if (i === 0) leftDir = leftDir || dir;
        if (i === 1 || (game.mode === "2p" && i === 0)) {
            // In 2p single-pad fallback, right stick can drive right paddle
            const rAxis = pad.axes[3] || 0;
            let rdir = 0;
            if (rAxis < -DEAD) rdir = -1;
            else if (rAxis > DEAD) rdir = 1;
            if (i === 1) rightDir = rightDir || dir;
            else rightDir = rightDir || rdir;
        }

        const startBtn = pad.buttons[9] && pad.buttons[9].pressed;
        const aBtn = pad.buttons[0] && pad.buttons[0].pressed;
        const prevStart = game._padPrev["start" + i] || false;
        const prevA = game._padPrev["a" + i] || false;
        if ((startBtn && !prevStart) || (aBtn && !prevA)) pauseEdge = true;
        game._padPrev["start" + i] = startBtn;
        game._padPrev["a" + i] = aBtn;
    }

    game.padInput.leftDir = leftDir;
    game.padInput.rightDir = rightDir;
    if (pauseEdge) game.spaceAction();
};
