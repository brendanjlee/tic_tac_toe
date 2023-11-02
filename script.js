/* Gameboard */
function GameBoard(dim) {
  const n = dim;
  const board = [];

  /* create gameboard */
  for (let i = 0; i < n; i++) {
    board[i] = [];
    for (let j = 0; j < n; j++) {
      board[i].push(Cell());
    }
  }

  /* getter methods */
  const getBoard = () => board;
  const getDim = () => n;
  const getCell = (row, col) => {
    if (row >= n || row < 0 || col >= n || col < 0) return -1;
    return board[row][col];
  }

  /* Repsents a player "drawing" in the board for their turn */
  const dropToken = (row, col, playerToken) => {
    console.log(`row: ${row}, col: ${col}, token: ${playerToken}`);

    // check for valid row and col
    if (row >= n || row < 0 || col >= n || col < 0) return -1;

    // check if there is already a token
    if (board[row][col].getCellValue() != 0) return -1;

    // update value
    board[row][col].addCellValue(playerToken);
    return 1;
  };

  /* Prints board as a simple matrix */
  const printBoard = () => {
    let boardWithValues = [];
    for (let i = 0; i < n; i++) {
      boardWithValues[i] = [];
      for (let j = 0; j < n; j++) {
        boardWithValues[i].push(board[i][j].getCellValue());
      }
    }
    console.log(boardWithValues);
  };

  /* Checks for game win condition */
  const checkWin = (token) => {
    const dirs = [
      [-1, 0], [-1, 1], [0, 1], [1 ,1],
      [1, 0], [1, -1], [0, -1], [-1, -1]
    ];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        let currCellValue = board[r][c].getCellValue();
        if (currCellValue == 0 || currCellValue != token) continue;

        /* check 8 directions */
        for (let i = 0; i < dirs.length; i++) {
          let dr = dirs[i][0];
          let dc = dirs[i][1];
          if (search(r, c, token, 0, dr, dc)) return true;
        }
      }
    }
    return false;
  };

  /* DFS helper for checking win conditions */
  const search = (r, c, token, count, dirR, dirC) => {
    if (count >= n) return true;  /* win condition */

    if (r < 0 || r >= n || c < 0 || c >= n) return false; /* check bounds */
    if (board[r][c].getCellValue() != token) return false /* check valid token */

    return search(r + dirR, c + dirC, token, ++count, dirR, dirC);
  }

  /* Clears the board for new game by setting values to default */
  const clearBoard = () => {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        board[r][c].addCellValue(0);
      }
    }
  }

  return {
    getBoard,
    getDim,
    dropToken,
    printBoard,
    checkWin,
    clearBoard,
    getCell
  }
}

/* Represents a single cell of a game board */
function Cell() {
  let value = 0;  /* 0 is default value */

  const addCellValue = (playerVal) => {
    value = playerVal;
  }

  const getCellValue = () => value;

  return {
    addCellValue,
    getCellValue
  }
}

/* Game Controller */
function GameController(
  p1Name = "Player 1",
  p2Name = "Player 2",
  dim = 3
) {
  const board = GameBoard(dim);   /* init gameboard */

  /* Create players */
  const players = [
    {
      name: p1Name,
      token: 'O'
    },
    {
      name: p2Name,
      token: 'X'
    }
  ];

  let activePlayer = players[0]   /* set current active player */

  let gameState = 0; /* 0 - ongoing, 1 - over */

  /* Getters */
  const getActiveBoard = () => board.getBoard();
  const getActivePlayer = () => activePlayer;
  const getAcitveCell = (row, col) => board.getCell(row, col);
  const getGameState = () => gameState;

  /* Switch Active Player */
  const switchPlayer = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  }

  /* Print board state */
  const printNewRound = () => {
    console.log(`${getActivePlayer().name}'s turn.`);
    board.printBoard();
  }

  /* Plays a round. Drops token, switches player, prints board */
  const playRound = (row, col) => {
    /* Drop token */
    if (board.dropToken(row, col, getActivePlayer().token) != 1) {
      console.log("invalid token");
      return false;
    };

    /* output new board state */
    printNewRound();

    /* check for win. Stop logic after win*/
    if (board.checkWin(getActivePlayer().token)) {
      gameState = 1;
      return true;
    }

    /* switch player */
    switchPlayer();
    return false;
  }

  /* Resets Game */
  const resetGame = () => {
    activePlayer = players[0];
    gameState = 0;
    board.clearBoard();
  }

  return {
    getActiveBoard,
    getActivePlayer,
    playRound,
    getAcitveCell,
    resetGame,
    getGameState
  }
}

function ScreenController(n=3) {
  const gameController = GameController();

  /* set dom elements */
  const turnDiv = document.querySelector('.turn');
  const boardDiv = document.querySelector('.board');
  const resetBtn = document.querySelector('.resetBtn');

  /* Render Gameboard */
  // TODO: let players choose dimension
  const renderBoard = () => {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        let cell = gameController.getAcitveCell(r, c);

        /* create button element */
        const cellBtn = document.createElement('button');
        cellBtn.classList.add('cell');

        /* add data attribute for id */
        cellBtn.dataset.row = r;
        cellBtn.dataset.col = c;
        if (cell.getCellValue() == 0) cellBtn.textContent = "";
        else cellBtn.textContent = cell.getCellValue();
        boardDiv.appendChild(cellBtn);
      }
    }
  }

  /* show current board state */
  const updateScreen = () => {
    /* clear board */
    boardDiv.textContent = "";

    /* get game state */
    const board = gameController.getActiveBoard();
    const activePlayer = gameController.getActivePlayer();

    /* dispalyer player turn or win */
    if (gameController.getGameState() == 0) turnDiv.textContent = `Player ${activePlayer.token}'s turn`;
    else turnDiv.textContent = `Player ${activePlayer.token} wins!`;

    renderBoard(board);
  }

  const clickHanlderBoard = (e) => {
    if (gameController.getGameState() == 1) return;
    console.log(e.target.dataset);
    const row = e.target.dataset.row;
    const col = e.target.dataset.col;

    if (!row || !col) return;

    gameController.playRound(Number(row), Number(col));
    updateScreen();
  }

  const clickHandlerReset = () => {
    gameController.resetGame();
    updateScreen();
  }

  boardDiv.addEventListener('click', clickHanlderBoard);
  resetBtn.addEventListener('click', clickHandlerReset);
  updateScreen();
}

ScreenController();