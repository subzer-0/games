window.Snake = window.Snake || {};

window.Snake.Renderer = class Renderer {
    constructor(container, gridSize, overlay) {
        this.container = container;
        this.gridSize = gridSize;
        this.overlay = overlay;
        this.tileSize = container.clientWidth / gridSize;
    }

    recompute() {
        this.tileSize = this.container.clientWidth / this.gridSize;
    }

    placeCell(el, cell) {
        el.style.left   = cell.x * this.tileSize + "px";
        el.style.top    = cell.y * this.tileSize + "px";
        el.style.width  = this.tileSize + "px";
        el.style.height = this.tileSize + "px";
    }

    draw(state) {
        const c = this.container;
        c.innerHTML = "";
        c.appendChild(this.overlay);

        state.snake.forEach((segment, i) => {
            const el = document.createElement("div");
            el.classList.add("snake");
            if (i === 0) {
                el.classList.add("head");
                const eyeL = document.createElement("div");
                eyeL.className = "eye left";
                const eyeR = document.createElement("div");
                eyeR.className = "eye right";
                el.appendChild(eyeL);
                el.appendChild(eyeR);
            }
            this.placeCell(el, segment);
            c.appendChild(el);
        });

        if (state.food) {
            const el = document.createElement("div");
            el.className = "food";
            this.placeCell(el, state.food);
            c.appendChild(el);
        }
        if (state.bonus) {
            const el = document.createElement("div");
            el.className = "food bonus";
            this.placeCell(el, state.bonus);
            c.appendChild(el);
        }
    }
};
