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
    let all = range(0, NUM_CELLS);
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
    } else if (won) {
        document.body.classList.add("won");
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

function seen(model, idx) {
    let colRoot = idx % NUM_COLS;
    for (var i = colRoot; i < NUM_CELLS; i += NUM_COLS) {
        if (model[i].bomb) {
            return true;
        }
    }
    let rowIdx = Math.floor(idx / NUM_COLS);
    let rowRoot = rowIdx * NUM_COLS;
    for (i = rowRoot; i < rowRoot + NUM_COLS; i++) {
        if (model[i].bomb) {
            return true;
        }
    }

    for (var rowNum = 0; rowNum < NUM_ROWS; rowNum++) {
        let rowStart = rowNum * NUM_COLS;

        let rowOffset = rowNum - rowIdx;
        let leftDiagColNum = colRoot + rowOffset;
        if (leftDiagColNum >= 0 && leftDiagColNum < NUM_COLS) {
            if (model[rowStart + leftDiagColNum].bomb) {
                return true;
            }
        }
        let rightDiagColNum = colRoot - rowOffset;
        if (rightDiagColNum >= 0 && rightDiagColNum < NUM_COLS) {
            if (model[rowStart + rightDiagColNum].bomb) {
                return true;
            }
        }
    }

    return false;
}

(function() {
    let grid = document.getElementById("grid");

    initGrid();
    var model = createModel();
    renderModel(model);

    let cells = document.getElementsByClassName("cell");
    for (let i=0, cell; (cell = cells[i]) !== undefined; i++) {
        cell.addEventListener('click', function(event) {
            model[i].revealed = true;
            renderModel(model);
        });
    }
})();