const grid = document.getElementById('grid');

const NUM_COLS = 8;
const NUM_ROWS = 8;
const NUM_CELLS = NUM_ROWS * NUM_COLS;
const NUM_BOMBS = 10;

function initGrid() {
    grid.innerHTML = '';
    for (var idx = 0; idx < NUM_CELLS; idx++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.draggable = false;
        grid.appendChild(cell);
    }
}

function range(start, end) {
    return Array.from({ length: end - start }, (_, i) => i + start)
}

function createModel() {
    const model = [];
    for (var idx = 0; idx < NUM_CELLS; idx++) {
        model.push({});
    }
    return model;
}

function initBombs(model, clicked_idx) {
    let all = range(0, NUM_CELLS);
    if (clicked_idx >= 0) {
        all.splice(clicked_idx, 1);
    }
    for (var idx = 0; idx < NUM_BOMBS; idx++) {
        let bidx = Math.floor(Math.random() * all.length);
        let b = all[bidx];
        all.splice(bidx, 1);
        model[b].bomb=true;
    }
    return model;
}

function renderModel(model) {
    var won = true;
    var lost = false;
    const grid = document.getElementById('grid');
    for (var idx = 0; idx < NUM_CELLS; idx++) {
        if (model[idx].flagged) {
            grid.children[idx].classList.add("flagged");
        }
        if (!model[idx].revealed) {
            grid.children[idx].classList.remove("bomb");
            grid.children[idx].classList.add("hidden");
            grid.children[idx].textContent = undefined;
            if (!model[idx].bomb) {
                won = false;
            }
        } else if (model[idx].bomb) {
            grid.children[idx].classList.remove("hidden");
            grid.children[idx].classList.add("bomb");
            grid.children[idx].textContent = 'B';
            lost = true;
        } else {
            grid.children[idx].classList.remove("hidden");
            grid.children[idx].classList.remove("bomb");
            grid.children[idx].textContent = undefined;
            let count = neighborCount(model, idx);
            if (count > 0) {
                grid.children[idx].textContent = count.toString();
            }
        }
    }
    if (lost) {
        document.body.classList.add("lost");
        for (var idx = 0; idx < NUM_CELLS; idx++) {
            if (model[idx].bomb && !model[idx].revealed) {
                grid.children[idx].classList.remove("hidden");
                grid.children[idx].classList.add("bomb");
                grid.children[idx].textContent = 'B';
            }
        }
    } else if (won) {
        document.body.classList.add("won");
    }
}

function handleRevealed(model, clicked_idx) {
    const seen = {};
    const q = [clicked_idx];
    while (q.length > 0) {
        let idx = q.shift();
        if (!seen[idx]) {
            seen[idx] = true;
            model[idx].revealed = true;
            if (!model[idx].bomb && neighborCount(model, idx) === 0) {
                q.push(...neighbors(idx));
            }
        }
    }
}

function neighbors(idx) {
    var ret = [];
    if (idx % NUM_COLS !== 0) {
        ret.push(idx - 1);
        if (idx >= NUM_COLS) {
            ret.push(idx - 1 - NUM_COLS);
        }
        if (idx + NUM_COLS < NUM_CELLS) {
            ret.push(idx - 1 + NUM_COLS);
        }
    }
    if (idx % NUM_COLS !== NUM_COLS - 1) {
        ret.push(idx + 1);
        if (idx >= NUM_COLS) {
            ret.push(idx + 1 - NUM_COLS);
        }
        if (idx + NUM_COLS < NUM_CELLS) {
            ret.push(idx + 1 + NUM_COLS);
        }
    }
    if (idx - NUM_COLS >= 0) {
        ret.push(idx - NUM_COLS);
    }
    if (idx + NUM_COLS < NUM_CELLS) {
        ret.push(idx + NUM_COLS);
    }
    return ret;
}

function neighborCount(model, idx) {
    return neighbors(idx)
        .filter(i => model[i].bomb)
        .length;
}

(function() {
    let grid = document.getElementById("grid");

    initGrid();
    var model = createModel();
    renderModel(model);

    var first = true;

    let cells = document.getElementsByClassName("cell");
    for (let i=0, cell; (cell = cells[i]) !== undefined; i++) {
        cell.addEventListener('click', function(event) {
            if (first) {
                initBombs(model, i);
                first = false;
            }
            handleRevealed(model, i);
            renderModel(model);
        });
        cell.addEventListener('contextmenu', function(ev) {
            ev.preventDefault();
            if (first) {
                initBombs(model, -1);
                first = false;
            }
            model[i].flagged = true;
            renderModel(model);
            return false;
        }, false);
    }
})();