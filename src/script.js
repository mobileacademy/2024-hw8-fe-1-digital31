let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;
let bombProbability = 3;
let maxProbability = 15;

const difficulties = {
    easy: { rowCount: 9, colCount: 9 },
    medium: { rowCount: 16, colCount: 16 },
    hard: { rowCount: 16, colCount: 30 }
};

document.getElementById('bombProbability').addEventListener('input', (e) => {
    bombProbability = parseInt(e.target.value);
});

document.getElementById('maxProbability').addEventListener('input', (e) => {
    maxProbability = parseInt(e.target.value);
});

function startGame() {
    const difficulty = document.getElementById('difficulty').value;
    const { rowCount, colCount } = difficulties[difficulty];
    
    initializeGame(rowCount, colCount);
    renderBoard();
}

function initializeGame(rowCount, colCount) {
    squaresLeft = rowCount * colCount;
    bombCount = 0;

    board = Array.from({ length: rowCount }, () =>
        Array.from({ length: colCount }, () => new BoardSquare(false, 0))
    );

    placeBombs(rowCount, colCount);
    countBombsAround(rowCount, colCount);
    resetGameState();
}

function placeBombs(rowCount, colCount) {
    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            if (Math.random() * maxProbability < bombProbability) {
                board[i][j].hasBomb = true;
                bombCount++;
            }
        }
    }
}

function countBombsAround(rowCount, colCount) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],         [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            if (!board[i][j].hasBomb) {
                let bombsAround = 0;

                for (const [dx, dy] of directions) {
                    const newX = i + dx;
                    const newY = j + dy;

                    if (newX >= 0 && newX < rowCount && newY >= 0 && newY < colCount) {
                        if (board[newX][newY].hasBomb) {
                            bombsAround++;
                        }
                    }
                }

                board[i][j].bombsAround = bombsAround;
            }
        }
    }
}

function renderBoard() {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = ''; // Clear previous game

    const rowCount = board.length;
    const colCount = board[0].length;
    boardElement.style.gridTemplateColumns = `repeat(${colCount}, 30px)`;

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.addEventListener('click', () => openSquare(i, j));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(i, j);
            });
            boardElement.appendChild(cell);
        }
    }
}

function openSquare(x, y) {
    if (openedSquares.includes(`${x},${y}`) || flaggedSquares.includes(`${x},${y}`)) {
        return;
    }

    const square = board[x][y];
    openedSquares.push(`${x},${y}`);

    const cellIndex = x * board[0].length + y;
    const cell = document.getElementsByClassName('cell')[cellIndex];

    if (square.hasBomb) {
        cell.classList.add('bomb');
        alert('Game Over! You clicked on a bomb.');
        revealAllBombs();
        startGame();
    } else {
        cell.textContent = square.bombsAround || '';
        squaresLeft--;

        if (squaresLeft === bombCount) {
            alert('Congratulations! You won the game.');
            startGame();
        }
    }
}

function toggleFlag(x, y) {
    const squareID = `${x},${y}`;
    const cellIndex = x * board[0].length + y;
    const cell = document.getElementsByClassName('cell')[cellIndex];

    if (flaggedSquares.includes(squareID)) {
        flaggedSquares = flaggedSquares.filter((s) => s !== squareID);
        cell.classList.remove('flagged');
    } else {
        flaggedSquares.push(squareID);
        cell.classList.add('flagged');
    }
}

function revealAllBombs() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].hasBomb) {
                const cellIndex = i * board[0].length + j;
                const cell = document.getElementsByClassName('cell')[cellIndex];
                cell.classList.add('bomb');
            }
        }
    }
}

function resetGameState() {
    openedSquares = [];
    flaggedSquares = [];
}

class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
    }
}
