window.Pong = window.Pong || {};

window.Pong.Renderer = class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    draw(state) {
        const { COURT_WIDTH: W, COURT_HEIGHT: H } = window.Pong.config;
        const ctx = this.ctx;

        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 12]);
        ctx.beginPath();
        ctx.moveTo(W / 2, 0);
        ctx.lineTo(W / 2, H);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "bold 56px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(String(state.scoreL), W * 0.25, 24);
        ctx.fillText(String(state.scoreR), W * 0.75, 24);

        ctx.fillStyle = "#fff";
        ctx.fillRect(state.paddleL.x, state.paddleL.y, state.paddleL.w, state.paddleL.h);
        ctx.fillRect(state.paddleR.x, state.paddleR.y, state.paddleR.w, state.paddleR.h);

        ctx.beginPath();
        ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24";
        ctx.shadowColor = "rgba(251, 191, 36, 0.7)";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
};
