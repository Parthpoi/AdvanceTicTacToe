document.addEventListener("DOMContentLoaded", function () {
    const board = document.getElementById("board");
    const sizeSelector = document.getElementById("size");
    const currentPlayerDisplay = document.getElementById("currentPlayer");
    const statusDisplay = document.getElementById("status");
    const restartButton = document.getElementById("restart");
    const playerStatsLeft = document.getElementById("playerStatsLeft");
    const playerStatsRight = document.getElementById("playerStatsRight");
    const tutorialButton = document.getElementById("tutorial");

    let currentPlayer = 1; // 1 = Player 1 (X), 2 = Player 2 (O)
    let selectedSize = 1; // Default size is Small (1)
    const boardState = Array(3).fill(null).map(() => Array(3).fill({ player: null, size: 0 }));
    const playerStats = {
        1: { small: 3, medium: 3, large: 3 },
        2: { small: 3, medium: 3, large: 3 },
    };

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
        if (currentPlayer === 1) {
            currentPlayerDisplay.textContent = "Player 1's Turn (X)";
            currentPlayerDisplay.style.color = "green"; // Player 1's color
        } else {
            currentPlayerDisplay.textContent = "Player 2's Turn (O)";
            currentPlayerDisplay.style.color = "blue"; // Player 2's color
        }
    }

    // Check for a win
    function checkWin(row, col) {
        const player = boardState[row][col].player;

        // Check row, column, and diagonals for the winning condition: 1 small, 1 medium, 1 large
        const winConditions = [
            // Rows
            boardState[row],
            // Columns
            boardState.map(r => r[col]),
            // Diagonal top-left to bottom-right
            [boardState[0][0], boardState[1][1], boardState[2][2]],
            // Diagonal top-right to bottom-left
            [boardState[0][2], boardState[1][1], boardState[2][0]],
        ];

        // Check if any of the lines has the required combination of small, medium, and large
        return winConditions.some(line => {
            const playerMarks = line.filter(cell => cell.player === player);
            const sizes = playerMarks.map(cell => cell.size).sort();
            return sizes.length === 3 && sizes[0] === 1 && sizes[1] === 2 && sizes[2] === 3;
        });
    }

    // Check if both players are out of moves
    function isOutOfMoves() {
        return (
            playerStats[1].small === 0 &&
            playerStats[1].medium === 0 &&
            playerStats[1].large === 0 &&
            playerStats[2].small === 0 &&
            playerStats[2].medium === 0 &&
            playerStats[2].large === 0
        );
    }

    // Update the player stats display
    function updatePlayerStats() {
        playerStatsLeft.innerHTML = `
            <div>Player 1 (X):</div>
            <div>Small: ${playerStats[1].small}</div>
            <div>Medium: ${playerStats[1].medium}</div>
            <div>Large: ${playerStats[1].large}</div>
        `;
        playerStatsRight.innerHTML = `
            <div>Player 2 (O):</div>
            <div>Small: ${playerStats[2].small}</div>
            <div>Medium: ${playerStats[2].medium}</div>
            <div>Large: ${playerStats[2].large}</div>
        `;
    }

    // Get size name based on size value
    function getSizeName(size) {
        return size === 1 ? "small" : size === 2 ? "medium" : "large";
    }

    // Restart button
    restartButton.addEventListener("click", () => {
        location.reload(); // Reload the page for a clean restart
    });

    // Tutorial Popup
    tutorialButton.addEventListener("click", () => {
        document.getElementById("tutorialPopup").style.display = "flex";
    });

    // Initialize the game
    initializeBoard();
    updateCurrentPlayerDisplay();
    updatePlayerStats();

    // Show "How to Play" Modal
    const howToPlayButton = document.getElementById("tutorial");
    const howToPlayModal = document.getElementById("howToPlayModal");
    const closeTutorialButton = document.getElementById("closeTutorial");

    howToPlayButton.addEventListener("click", () => {
        howToPlayModal.style.display = "flex"; // Show modal
    });

    closeTutorialButton.addEventListener("click", () => {
        howToPlayModal.style.display = "none"; // Hide modal
    });

    howToPlayModal.addEventListener("click", (e) => {
        if (e.target === howToPlayModal) {
            howToPlayModal.style.display = "none"; // Hide modal
        }
    });
});
