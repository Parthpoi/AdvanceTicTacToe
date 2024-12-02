document.addEventListener("DOMContentLoaded", function () {
    const board = document.getElementById("board");
    const sizeSelector = document.getElementById("size");
    const currentPlayerDisplay = document.getElementById("currentPlayer");
    const statusDisplay = document.getElementById("status");
    const restartButton = document.getElementById("restart");
    const tutorialButton = document.getElementById("tutorial");
    const vsComputerButton = document.getElementById("vsComputer");
    const player1Small = document.getElementById("player1Small");
    const player1Medium = document.getElementById("player1Medium");
    const player1Large = document.getElementById("player1Large");
    const player2Small = document.getElementById("player2Small");
    const player2Medium = document.getElementById("player2Medium");
    const player2Large = document.getElementById("player2Large");

    let currentPlayer = 1; // 1 = Player 1 (X), 2 = Player 2 (O)
    let selectedSize = 1; // Default size is Small (1)
    const boardState = Array(3).fill(null).map(() => Array(3).fill({ player: null, size: 0 }));
    const playerStats = {
        1: { small: 3, medium: 3, large: 3 },
        2: { small: 3, medium: 3, large: 3 },
    };
    let vsComputer = false; // Set to true if playing against the computer

    // Get size name based on the size number
    function getSizeName(size) {
        switch (size) {
            case 1:
                return "small";
            case 2:
                return "medium";
            case 3:
                return "large";
            default:
                return "";
        }
    }

    // Initialize the game board
    function initializeBoard() {
        board.innerHTML = ""; // Clear the board if already rendered
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = i;
                cell.dataset.col = j;
                board.appendChild(cell);

                // Add click event for each cell
                cell.addEventListener("click", () => handleCellClick(i, j));
            }
        }
    }

    // Handle size selection
    sizeSelector.addEventListener("change", (e) => {
        selectedSize = parseInt(e.target.value);
    });

    // Handle cell click
    function handleCellClick(row, col) {
        const cell = board.querySelector(`[data-row='${row}'][data-col='${col}']`);
        const currentCell = boardState[row][col];

        // Check if the selected size is available for the current player
        if (playerStats[currentPlayer][getSizeName(selectedSize)] === 0) {
            statusDisplay.textContent = `No more ${getSizeName(selectedSize)} marks left!`;
            statusDisplay.classList.add("invalid");
            return;
        }

        // Check if the cell is empty or can be overwritten
        if (currentCell.size >= selectedSize) {
            statusDisplay.textContent = "Invalid move: Cannot place smaller or same size.";
            statusDisplay.classList.add("invalid");
            return;
        }

        // Update the board state
        boardState[row][col] = { player: currentPlayer, size: selectedSize };
        playerStats[currentPlayer][getSizeName(selectedSize)]--;

        const symbol = document.createElement("div");
        symbol.classList.add("symbol");
        symbol.textContent = currentPlayer === 1 ? "X" : "O";
        symbol.style.color = currentPlayer === 1 ? "green" : "blue";

        // Replace smaller marks with larger ones
        cell.innerHTML = ""; // Clear previous mark if any
        cell.appendChild(symbol);
        cell.className = `cell size-${selectedSize}`; // Update cell size class

        updatePlayerStats();

        // Check for win or draw
        if (checkWin(row, col)) {
            statusDisplay.textContent = `Player ${currentPlayer} wins!`;
            statusDisplay.classList.add("win");
            board.style.pointerEvents = "none"; // Disable further clicks
        } else if (isOutOfMoves()) {
            statusDisplay.textContent = "It's a draw!";
            statusDisplay.classList.add("draw");
        } else {
            switchPlayer();
            if (vsComputer && currentPlayer === 2) {
                setTimeout(computerMove, 500); // Add some delay for AI to make a move
            }
        }
    }

    // Switch turn
    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateCurrentPlayerDisplay();
        statusDisplay.textContent = ""; // Clear previous status
        statusDisplay.classList.remove("invalid");
    }

    // Update the current player display
    function updateCurrentPlayerDisplay() {
        currentPlayerDisplay.textContent = `Player ${currentPlayer}'s Turn (${currentPlayer === 1 ? "X" : "O"})`;
        currentPlayerDisplay.className = `h4 text-${currentPlayer === 1 ? "success" : "primary"}`;
    }

    // Update player stats display
    function updatePlayerStats() {
        player1Small.textContent = `Small: ${playerStats[1].small}`;
        player1Medium.textContent = `Medium: ${playerStats[1].medium}`;
        player1Large.textContent = `Large: ${playerStats[1].large}`;
        player2Small.textContent = `Small: ${playerStats[2].small}`;
        player2Medium.textContent = `Medium: ${playerStats[2].medium}`;
        player2Large.textContent = `Large: ${playerStats[2].large}`;
    }

    // Check for a win
    function checkWin(row, col) {
        const player = boardState[row][col].player;

        const winConditions = [
            boardState[row], // Row
            boardState.map((r) => r[col]), // Column
            [boardState[0][0], boardState[1][1], boardState[2][2]], // Diagonal (TL to BR)
            [boardState[0][2], boardState[1][1], boardState[2][0]], // Diagonal (TR to BL)
        ];

        return winConditions.some((line) => {
            const playerMarks = line.filter((cell) => cell.player === player);
            const sizes = playerMarks.map((cell) => cell.size).sort();
            return sizes.length === 3 && sizes[0] === 1 && sizes[1] === 2 && sizes[2] === 3;
        });
    }

    // Check if all moves are used
    function isOutOfMoves() {
        return Object.values(playerStats[1]).every((count) => count === 0) &&
            Object.values(playerStats[2]).every((count) => count === 0);
    }

    // Restart button
    restartButton.addEventListener("click", () => {
        location.reload(); // Reload the page for a clean restart
    });

    // Computer AI move
    function computerMove() {
        // Try to win first
        if (tryToWinWithSize()) return;

        // If no winning move, try to block the opponent
        if (blockWinningMoveWithSize()) return;

        // If no block needed, make a strategic move
        makeStrategicMoveWithSize();
    }

    // Try to win considering sizes
    function tryToWinWithSize() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (canPlaceMarker(i, j, currentPlayer)) {
                    // Simulate placing the largest available marker
                    for (let size = 3; size >= 1; size--) {
                        if (playerStats[currentPlayer][getSizeName(size)] > 0) {
                            boardState[i][j] = { player: currentPlayer, size: size };
                            if (checkWinWithSize()) {
                                handleCellClick(i, j); // Make the winning move
                                return true;
                            }
                            boardState[i][j] = { player: null, size: 0 }; // Revert simulation
                        }
                    }
                }
            }
        }
        return false;
    }

    // Block the opponent's winning move considering sizes
    function blockWinningMoveWithSize() {
        const opponent = currentPlayer === 1 ? 2 : 1;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (canPlaceMarker(i, j, opponent)) {
                    // Simulate the opponent's move and check for winning
                    for (let size = 3; size >= 1; size--) {
                        if (playerStats[opponent][getSizeName(size)] > 0) {
                            boardState[i][j] = { player: opponent, size: size };
                            if (checkWinWithSize()) {
                                boardState[i][j] = { player: null, size: 0 }; // Revert simulation
                                handleCellClick(i, j); // Block with the largest available size
                                return true;
                            }
                            boardState[i][j] = { player: null, size: 0 }; // Revert simulation
                        }
                    }
                }
            }
        }
        return false;
    }

    // Make a strategic move considering sizes
    function makeStrategicMoveWithSize() {
        const preferredMoves = [
            { row: 1, col: 1 }, // Center
            { row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }, // Corners
            { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 1 }, // Edges
        ];

        for (const move of preferredMoves) {
            const { row, col } = move;
            if (canPlaceMarker(row, col, currentPlayer)) {
                for (let size = 3; size >= 1; size--) {
                    if (playerStats[currentPlayer][getSizeName(size)] > 0) {
                        handleCellClick(row, col, size); // Place the largest available marker
                        return;
                    }
                }
            }
        }
    }

    // Check if a marker can be placed considering sizes
    function canPlaceMarker(row, col, player) {
        const currentCell = boardState[row][col];
        return (
            currentCell.player === null || // Cell is empty
            (currentCell.player === player && currentCell.size < 3) // Can upgrade its own marker
        );
    }

    // Enhanced winning logic with sizes
    function checkWinWithSize() {
        for (let i = 0; i < 3; i++) {
            if (checkLineWithSize(boardState[i])) return true; // Row check
            if (checkLineWithSize([boardState[0][i], boardState[1][i], boardState[2][i]])) return true; // Column check
        }
        // Diagonals
        if (checkLineWithSize([boardState[0][0], boardState[1][1], boardState[2][2]])) return true;
        if (checkLineWithSize([boardState[0][2], boardState[1][1], boardState[2][0]])) return true;

        return false;
    }

    // Check a line for a winning combination with sizes
    function checkLineWithSize(line) {
        const sizes = line.map((cell) => cell.size);
        const players = line.map((cell) => cell.player);

        // Ensure all three sizes (1, 2, 3) are present and belong to the same player
        return (
            players.every((player) => player !== null && player === players[0]) &&
            sizes.includes(1) && sizes.includes(2) && sizes.includes(3)
        );
    }

    // Computer AI move
    function computerMove() {
        // Try to win first
        if (tryToWinWithSize()) return;

        // If no winning move, try to block the opponent
        if (blockWinningMoveWithSize()) return;

        // If no block needed, make a strategic move
        makeStrategicMoveWithSize();
    }

    // Try to win considering sizes
    function tryToWinWithSize() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (canPlaceMarker(i, j, currentPlayer)) {
                    // Simulate placing the largest available marker
                    for (let size = 3; size >= 1; size--) {
                        if (playerStats[currentPlayer][getSizeName(size)] > 0) {
                            boardState[i][j] = { player: currentPlayer, size: size };
                            if (checkWinWithSize()) {
                                handleCellClick(i, j); // Make the winning move
                                return true;
                            }
                            boardState[i][j] = { player: null, size: 0 }; // Revert simulation
                        }
                    }
                }
            }
        }
        return false;
    }

    // Block the opponent's winning move considering sizes
    function blockWinningMoveWithSize() {
        const opponent = currentPlayer === 1 ? 2 : 1;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (canPlaceMarker(i, j, opponent)) {
                    // Simulate the opponent's move and check for winning
                    for (let size = 3; size >= 1; size--) {
                        if (playerStats[opponent][getSizeName(size)] > 0) {
                            boardState[i][j] = { player: opponent, size: size };
                            if (checkWinWithSize()) {
                                boardState[i][j] = { player: null, size: 0 }; // Revert simulation
                                handleCellClick(i, j); // Block with the largest available size
                                return true;
                            }
                            boardState[i][j] = { player: null, size: 0 }; // Revert simulation
                        }
                    }
                }
            }
        }
        return false;
    }

    // Make a strategic move considering sizes
    function makeStrategicMoveWithSize() {
        const preferredMoves = [
            { row: 1, col: 1 }, // Center
            { row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }, // Corners
            { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 1 }, // Edges
        ];

        for (const move of preferredMoves) {
            const { row, col } = move;
            if (canPlaceMarker(row, col, currentPlayer)) {
                for (let size = 3; size >= 1; size--) {
                    if (playerStats[currentPlayer][getSizeName(size)] > 0) {
                        handleCellClick(row, col, size); // Place the largest available marker
                        return;
                    }
                }
            }
        }
    }

    // Check if a marker can be placed considering sizes
    function canPlaceMarker(row, col, player) {
        const currentCell = boardState[row][col];
        return (
            currentCell.player === null || // Cell is empty
            (currentCell.player === player && currentCell.size < 3) // Can upgrade its own marker
        );
    }

    // Enhanced winning logic with sizes
    function checkWinWithSize() {
        for (let i = 0; i < 3; i++) {
            if (checkLineWithSize(boardState[i])) return true; // Row check
            if (checkLineWithSize([boardState[0][i], boardState[1][i], boardState[2][i]])) return true; // Column check
        }
        // Diagonals
        if (checkLineWithSize([boardState[0][0], boardState[1][1], boardState[2][2]])) return true;
        if (checkLineWithSize([boardState[0][2], boardState[1][1], boardState[2][0]])) return true;

        return false;
    }

    // Check a line for a winning combination with sizes
    function checkLineWithSize(line) {
        const sizes = line.map((cell) => cell.size);
        const players = line.map((cell) => cell.player);

        // Ensure all three sizes (1, 2, 3) are present and belong to the same player
        return (
            players.every((player) => player !== null && player === players[0]) &&
            sizes.includes(1) && sizes.includes(2) && sizes.includes(3)
        );
    }


    // VS Computer toggle
    vsComputerButton.addEventListener("click", () => {
        vsComputer = !vsComputer;
        statusDisplay.textContent = vsComputer
            ? "Player 2 is now the computer!"
            : "Player 2 is now human!";
        statusDisplay.className = vsComputer ? "info text-info" : "";
        initializeBoard(); // Reset the board
    });

    // Tutorial popup
    tutorialButton.addEventListener("click", () => {
        const tutorialModal = new bootstrap.Modal(document.getElementById("howToPlayModal"));
        tutorialModal.show();
    });

    // Initialize the game
    initializeBoard();
    updateCurrentPlayerDisplay();
    updatePlayerStats();
});
