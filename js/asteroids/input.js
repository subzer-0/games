window.Asteroids = window.Asteroids || {};

window.Asteroids.bindInput = function bindInput(game, touchEls) {
    const keys = {};
    game.keys = keys;
    game.touchKeys = { left: false, right: false, thrust: false };
    game.padInput = { rotate: 0, thrust: false };
    game._padPrev = {};

    document.addEventListener("keydown", (e) => {
        if (e.repeat) {
            if (e.code === "Space" || ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
                e.preventDefault();
            }
            return;
        }
        keys[e.code] = true;

        if (e.code === "Space") {
            game.fireAction();
            e.preventDefault();
            return;
        }
        if (e.code === "Enter") {
            game.enterAction();
            return;
        }
        if (e.code === "Escape" || e.code === "KeyP") {
            game.togglePause();
            return;
        }
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
            e.preventDefault();
        }
    });

    document.addEventListener("keyup", (e) => {
        keys[e.code] = false;
    });

    window.addEventListener("blur", () => {
        for (const k of Object.keys(keys)) keys[k] = false;
        game.touchKeys.left = false;
        game.touchKeys.right = false;
        game.touchKeys.thrust = false;
    });

    if (touchEls) bindTouch(game, touchEls);
};

function bindTouch(game, els) {
    const holdButton = (btn, onDown, onUp) => {
        if (!btn) return;
        const start = (e) => { onDown(); e.preventDefault(); };
        const end = (e) => { onUp(); e.preventDefault(); };
        btn.addEventListener("touchstart", start, { passive: false });
        btn.addEventListener("touchend", end, { passive: false });
        btn.addEventListener("touchcancel", end, { passive: false });
        btn.addEventListener("mousedown", start);
        btn.addEventListener("mouseup", end);
        btn.addEventListener("mouseleave", end);
    };

    holdButton(els.left,   () => game.touchKeys.left = true,   () => game.touchKeys.left = false);
    holdButton(els.right,  () => game.touchKeys.right = true,  () => game.touchKeys.right = false);
    holdButton(els.thrust, () => game.touchKeys.thrust = true, () => game.touchKeys.thrust = false);

    if (els.fire) {
        const fire = (e) => { game.fireAction(); e.preventDefault(); };
        els.fire.addEventListener("touchstart", fire, { passive: false });
        els.fire.addEventListener("mousedown", fire);
    }
}

window.Asteroids.pollGamepad = function pollGamepad(game) {
    if (!navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    let rotate = 0;
    let thrust = false;
    let fireEdge = false;
    let pauseEdge = false;
    let startEdge = false;

    const DEAD = 0.25;

    for (let i = 0; i < pads.length; i++) {
        const pad = pads[i];
        if (!pad) continue;

        const xAxis = pad.axes[0] || 0;
        const dpadL = pad.buttons[14] && pad.buttons[14].pressed;
        const dpadR = pad.buttons[15] && pad.buttons[15].pressed;

        if (xAxis < -DEAD || dpadL) rotate = -1;
        else if (xAxis > DEAD || dpadR) rotate = 1;

        const aBtn = pad.buttons[0] && pad.buttons[0].pressed;
        const rTrigger = pad.buttons[7] && (pad.buttons[7].value > 0.3 || pad.buttons[7].pressed);
        if (aBtn || rTrigger) thrust = true;

        const xBtn = pad.buttons[2] && pad.buttons[2].pressed;
        const rShoulder = pad.buttons[5] && pad.buttons[5].pressed;
        const prevFire = game._padPrev["fire" + i] || false;
        const fireNow = xBtn || rShoulder;
        if (fireNow && !prevFire) fireEdge = true;
        game._padPrev["fire" + i] = fireNow;

        const startBtn = pad.buttons[9] && pad.buttons[9].pressed;
        const prevStart = game._padPrev["start" + i] || false;
        if (startBtn && !prevStart) {
            if (game.isRunning) pauseEdge = true;
            else startEdge = true;
        }
        game._padPrev["start" + i] = startBtn;
    }

    game.padInput.rotate = rotate;
    game.padInput.thrust = thrust;
    if (fireEdge) game.fireAction();
    if (startEdge) game.enterAction();
    if (pauseEdge) game.togglePause();
};
