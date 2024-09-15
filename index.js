const canvas = document.getElementById('pixelCanvas');
const selBtns = document.querySelectorAll('.sel-tool');
const preBtns = document.querySelectorAll('.preset-color');
const selClr = document.querySelector('#sel-color');
const selClrBox = document.querySelector('.color-sel-box');
const btnClear = document.querySelector('.clear');
const fillEmpty = document.querySelector('.fill-empty');
const fillAll = document.querySelector('.fill');
const dl = document.querySelector('#dl');

const ctx = canvas.getContext('2d');
let isMouseDown = -1; // Track if the mouse is held down
let gridSize = 32; // pixel size
let currentColor = '#ff0000'; // Default color for the fill

let currentTool = "pencil";

function getSurroundingCoordinates(x, y) {
    return [
        [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
        [x - 1, y], [x + 1, y],
        [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
    ];
}

// Create a 2D array to store the state (color) of each square
var grid = [];
resizeGrid(16, 16, 20);
function resizeGrid(newWidth, newHeight, newGridSize, defColor=null) {
    gridSize = newGridSize;
    // Adjust canvas size to match the new grid
    canvas.width = newWidth * gridSize;
    canvas.height = newHeight * gridSize;

    // Recreate the grid array based on the new dimensions
    grid.length = 0; // Clear the old grid
    for (let row = 0; row < newHeight; row++) {
        grid.push(Array(newWidth).fill(defColor)); // Create new grid with the new dimensions
    }

    // Redraw the updated grid
    drawGrid();
}

fillAll.addEventListener('click', () => {
    resizeGrid(16, 16, 20, currentColor);
    drawGrid();
})
fillEmpty.addEventListener('click', ()=>{
    grid = grid.map(row =>
        row.map(cell => cell === null ? currentColor : cell)
    );
    drawGrid();
});
btnClear.addEventListener('click', ()=>{
    resizeGrid(16, 16, 20);
    drawGrid();
});
selBtns.forEach(x => {
    x.addEventListener('click', ()=>{
        currentTool = x.dataset.sel;
        selBtns.forEach(x => {
            x.classList.remove('btn-green');
        });
        x.classList.add('btn-green');
    })
});
preBtns.forEach(x => {
    x.style.backgroundColor = x.dataset.col;
    x.addEventListener('click', () => {
        currentColor = x.dataset.col;
        selClrBox.classList.remove('changing');
        selClrBox.style.backgroundColor = x.dataset.col;
    })
});
selClr.addEventListener('click', (e) => {
    selClrBox.classList.add('changing');
})
selClr.addEventListener('change', (e) => {
    selClrBox.classList.remove('changing');
    selClrBox.style.backgroundColor = e.target.value;
    currentColor = e.target.value;
})

// Function to draw grid-like background with saved colors
function drawGrid() {
    for (let row = 0; row < canvas.height / gridSize; row++) {
        for (let col = 0; col < canvas.width / gridSize; col++) {
            ctx.fillStyle = grid[row][col] || ((row + col) % 2 === 0 ? '#eee' : '#ccc');
            ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
        }
    }
    var url = canvas.toDataURL("image/png");
    dl.href = url;
}

// Function to highlight or reset the selected square
function updateSquareCoord(col, row, color) {
    grid[row][col] = color;
    drawGrid(); // Redraw the grid with the updated color
}
function updateSquare(x, y, color) {
    const col = Math.floor(x / gridSize);
    const row = Math.floor(y / gridSize);
    updateSquareCoord(col, row, color);
}

// Initial grid drawing
drawGrid();

function click(x, y, button) {
    const col = Math.floor(x / gridSize);
    const row = Math.floor(y / gridSize);

    switch (currentTool) {
        case "pencil":
            if (button === 0) {
                updateSquare(x, y, currentColor);
            } else if (button === 2) {
                updateSquare(x, y, null);
            }
            break;
        case "big":
            getSurroundingCoordinates(row, col).forEach(x => {
                if (button === 0) {
                    updateSquareCoord(x[1], x[0], currentColor);
                } else if (button === 2) {
                    updateSquareCoord(x[1], x[0], null);
                }
            });
            if (button === 0) {
                updateSquare(x, y, currentColor);
            } else if (button === 2) {
                updateSquare(x, y, null);
            }
            break;
        case "eraser":
            updateSquare(x, y, null);
            break;
        case "colorpicker":
            const pickedColor = grid[row][col]; // Get color from grid
            if (pickedColor) {
                currentColor = pickedColor; // Set currentColor to picked color
                selClrBox.style.backgroundColor = pickedColor;
            }
            break;
    }
}

// When the mouse button is pressed down
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isMouseDown = e.button; // Start dragging

    click(x, y, e.button);
});

// While the mouse is moving
canvas.addEventListener('mousemove', (e) => {
    if (isMouseDown > -1) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        click(x, y, isMouseDown);
    }
});
document.body.addEventListener('mousemove', (e)=>{
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Check if mouse is within the canvas bounds
    const isInsideCanvas = (
        x >= rect.left && x <= rect.right &&
        y >= rect.top && y <= rect.bottom
    );

    if(!isInsideCanvas) {
        isMouseDown = -1;
    }
})

// When the mouse button is released
canvas.addEventListener('mouseup', () => {
    isMouseDown = -1; // Stop dragging
});

// Prevent default context menu on right-click
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Prevent default right-click menu
});
