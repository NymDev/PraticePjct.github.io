class DouShouQi {
    constructor() {
        this.board = this.createBoard();
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.selectedCell = null;
        this.gameOver = false;
        this.capturedPieces = { red: [], blue: [] };
        this.lastAction = '';
        this.highlightTimer = null;
        this.gameMode = 'ai'; // 'pvp' or 'ai'
        this.aiPlayer = 'blue'; // AI plays as blue
        
        this.pieces = {
            elephant: { name: '象', rank: 8 },
            lion: { name: '獅', rank: 7 },
            tiger: { name: '虎', rank: 6 },
            panther: { name: '豹', rank: 5 },
            wolf: { name: '狼', rank: 4 },
            dog: { name: '狗', rank: 3 },
            cat: { name: '貓', rank: 2 },
            rat: { name: '鼠', rank: 1 }
        };
        
        this.initializeGame();
    }
    
    createBoard() {
        const board = Array(9).fill(null).map(() => Array(7).fill(null));
        
        // Set special terrain
        // Rivers (rows 3-5, cols 1,2,4,5)
        const riverCells = [
            [3, 1], [3, 2], [3, 4], [3, 5],
            [4, 1], [4, 2], [4, 4], [4, 5],
            [5, 1], [5, 2], [5, 4], [5, 5]
        ];
        
        // Traps and dens
        const specialCells = {
            // Red side (bottom)
            'trap-red': [[8, 2], [7, 3], [8, 4]],
            'den-red': [[8, 3]],
            // Blue side (top)
            'trap-blue': [[0, 2], [1, 3], [0, 4]],
            'den-blue': [[0, 3]]
        };
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 7; col++) {
                board[row][col] = {
                    piece: null,
                    terrain: this.getTerrainType(row, col, riverCells, specialCells)
                };
            }
        }
        
        return board;
    }
    
    getTerrainType(row, col, riverCells, specialCells) {
        // Check river
        if (riverCells.some(([r, c]) => r === row && c === col)) {
            return 'river';
        }
        
        // Check special cells
        for (const [terrain, cells] of Object.entries(specialCells)) {
            if (cells.some(([r, c]) => r === row && c === col)) {
                return terrain;
            }
        }
        
        return 'normal';
    }
    
    initializeGame() {
        this.setupPieces();
        this.renderBoard();
        this.setupEventListeners();
        this.updateGameInfo();
    }
    
    setupPieces() {
        // Red pieces (bottom) - 動物類型與藍方相對位置調換
        const redPieces = [
            { type: 'lion', pos: [8, 0] },    // 獅 - 對應藍方(0,0)虎的相對
            { type: 'tiger', pos: [8, 6] },   // 虎 - 對應藍方(0,6)獅的相對
            { type: 'rat', pos: [6, 0] },     // 鼠 - 對應藍方(2,0)象的相對
            { type: 'wolf', pos: [6, 4] },    // 狼 - 對應藍方(2,4)豹的相對
            { type: 'panther', pos: [6, 2] }, // 豹 - 對應藍方(2,2)狼的相對
            { type: 'cat', pos: [7, 5] },     // 貓 - 對應藍方(1,5)狗的相對
            { type: 'dog', pos: [7, 1] },     // 狗 - 對應藍方(1,1)貓的相對
            { type: 'elephant', pos: [6, 6] } // 象 - 對應藍方(2,6)鼠的相對
        ];
        
        // Blue pieces (top) - 按照圖片上方位置
        const bluePieces = [
            { type: 'tiger', pos: [0, 0] },   // 虎 - 圖片上方(0,0)
            { type: 'lion', pos: [0, 6] },    // 獅 - 圖片上方(0,6)
            { type: 'elephant', pos: [2, 0] }, // 象 - 圖片上方(2,0)
            { type: 'panther', pos: [2, 4] }, // 豹 - 圖片上方(2,4)
            { type: 'wolf', pos: [2, 2] },    // 狼 - 圖片上方(2,2)
            { type: 'dog', pos: [1, 5] },     // 狗 - 圖片上方(1,5)
            { type: 'cat', pos: [1, 1] },     // 貓 - 圖片上方(1,1)
            { type: 'rat', pos: [2, 6] }      // 鼠 - 圖片上方(2,6)
        ];
        
        // Place red pieces
        redPieces.forEach(({ type, pos }) => {
            const [row, col] = pos;
            this.board[row][col].piece = {
                type,
                color: 'red',
                name: this.pieces[type].name,
                rank: this.pieces[type].rank
            };
        });
        
        // Place blue pieces
        bluePieces.forEach(({ type, pos }) => {
            const [row, col] = pos;
            this.board[row][col].piece = {
                type,
                color: 'blue',
                name: this.pieces[type].name,
                rank: this.pieces[type].rank
            };
        });
    }
    
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${this.board[row][col].terrain}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Add terrain icon
                const terrain = this.board[row][col].terrain;
                if (terrain !== 'normal') {
                    const terrainIcon = document.createElement('div');
                    terrainIcon.className = `terrain-icon ${terrain}`;
                    
                    // Set icon text based on terrain type
                    switch (terrain) {
                        case 'river':
                            terrainIcon.textContent = '≈';
                            break;
                        case 'trap-red':
                            terrainIcon.textContent = '◇';
                            break;
                        case 'trap-blue':
                            terrainIcon.textContent = '◇';
                            break;
                        case 'den-red':
                            terrainIcon.textContent = '⌂';
                            break;
                        case 'den-blue':
                            terrainIcon.textContent = '⌂';
                            break;
                    }
                    cell.appendChild(terrainIcon);
                }
                
                const piece = this.board[row][col].piece;
                if (piece) {
                    const pieceElement = document.createElement('div');
                    let pieceClass = `piece ${piece.color}`;
                    
                    // Add blinking effect for current player's pieces
                    if (piece.color === this.currentPlayer && !this.gameOver) {
                        pieceClass += ' current-player';
                    }
                    
                    pieceElement.className = pieceClass;
                    pieceElement.textContent = piece.name;
                    cell.appendChild(pieceElement);
                }
                
                gameBoard.appendChild(cell);
            }
        }
    }
    
    setupEventListeners() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.addEventListener('click', (e) => this.handleCellClick(e));
        
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('rules-btn').addEventListener('click', () => this.showRules());
        
        // Game mode selection
        document.getElementById('pvp-mode-btn').addEventListener('click', () => this.setGameMode('pvp'));
        document.getElementById('ai-mode-btn').addEventListener('click', () => this.setGameMode('ai'));
        
        // Victory modal event listeners
        document.getElementById('victory-new-game').addEventListener('click', () => {
            this.closeVictoryModal();
            this.newGame();
        });
        
        document.getElementById('victory-close').addEventListener('click', () => {
            this.closeVictoryModal();
        });
        
        // Rules modal event listeners
        const rulesModal = document.getElementById('rules-modal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            rulesModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === rulesModal) {
                rulesModal.style.display = 'none';
            }
            
            const victoryModal = document.getElementById('victory-modal');
            if (e.target === victoryModal) {
                this.closeVictoryModal();
            }
        });
    }
    
    handleCellClick(e) {
        if (this.gameOver) return;
        
        // In AI mode, prevent human from moving AI pieces
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiPlayer) {
            return;
        }
        
        const cell = e.target.closest('.cell');
        if (!cell) return;
        
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (this.selectedPiece) {
            this.handleMove(row, col);
        } else {
            this.handleSelection(row, col);
        }
    }
    
    handleSelection(row, col) {
        const piece = this.board[row][col].piece;
        
        if (!piece) {
            this.clearSelection();
            return;
        }
        
        if (piece.color !== this.currentPlayer) {
            // Show message when clicking opponent's piece
            const opponentName = piece.color === 'red' ? '紅方' : '藍方';
            const currentName = this.currentPlayer === 'red' ? '紅方' : '藍方';
            
            if (this.gameMode === 'ai' && piece.color === this.aiPlayer) {
                this.showMessage('現在是玩家的回合，無法移動電腦的棋子！', 'info');
            } else {
                this.showMessage(`現在是${currentName}的回合，無法移動${opponentName}的棋子！`, 'info');
            }
            
            this.clearSelection();
            return;
        }
        
        this.selectedPiece = piece;
        this.selectedCell = { row, col };
        this.highlightPossibleMoves(row, col);
    }
    
    handleMove(row, col) {
        const fromRow = this.selectedCell.row;
        const fromCol = this.selectedCell.col;
        
        if (fromRow === row && fromCol === col) {
            this.clearSelection();
            return;
        }
        
        if (this.isValidMove(fromRow, fromCol, row, col)) {
            this.makeMove(fromRow, fromCol, row, col);
            this.clearSelection();
            this.switchPlayer();
            this.checkGameEnd();
        } else {
            this.clearSelection();
        }
    }
    
    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol].piece;
        const targetCell = this.board[toRow][toCol];
        const targetPiece = targetCell.piece;
        
        // Basic movement validation
        if (!this.isAdjacent(fromRow, fromCol, toRow, toCol) && !this.canJump(piece, fromRow, fromCol, toRow, toCol)) {
            return false;
        }
        
        // Can't move to own den
        if ((piece.color === 'red' && targetCell.terrain === 'den-red') ||
            (piece.color === 'blue' && targetCell.terrain === 'den-blue')) {
            return false;
        }
        
        // River rules
        if (targetCell.terrain === 'river') {
            if (piece.type !== 'rat') {
                return false;
            }
        }
        
        // Can't attack own pieces
        if (targetPiece && targetPiece.color === piece.color) {
            return false;
        }
        
        // Combat rules
        if (targetPiece) {
            return this.canCapture(piece, targetPiece, fromRow, fromCol, toRow, toCol);
        }
        
        return true;
    }
    
    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    canJump(piece, fromRow, fromCol, toRow, toCol) {
        if (piece.type !== 'tiger' && piece.type !== 'lion') {
            return false;
        }
        
        // Check if jumping over river
        if (fromRow === toRow) {
            // Horizontal jump
            const minCol = Math.min(fromCol, toCol);
            const maxCol = Math.max(fromCol, toCol);
            
            // Check if there's a river in between and no rat blocking
            for (let col = minCol + 1; col < maxCol; col++) {
                if (this.board[fromRow][col].terrain !== 'river') {
                    return false;
                }
                if (this.board[fromRow][col].piece && this.board[fromRow][col].piece.type === 'rat') {
                    return false;
                }
            }
            return maxCol - minCol > 1;
        } else if (fromCol === toCol) {
            // Vertical jump
            const minRow = Math.min(fromRow, toRow);
            const maxRow = Math.max(fromRow, toRow);
            
            // Check if there's a river in between and no rat blocking
            for (let row = minRow + 1; row < maxRow; row++) {
                if (this.board[row][fromCol].terrain !== 'river') {
                    return false;
                }
                if (this.board[row][fromCol].piece && this.board[row][fromCol].piece.type === 'rat') {
                    return false;
                }
            }
            return maxRow - minRow > 1;
        }
        
        return false;
    }
    
    canCapture(attacker, defender, fromRow, fromCol, toRow, toCol) {
        const attackerCell = this.board[fromRow][fromCol];
        const defenderCell = this.board[toRow][toCol];
        
        // Special rule: rat can eat elephant
        if (attacker.type === 'rat' && defender.type === 'elephant') {
            // Rat in river can't eat elephant on land and vice versa
            if (attackerCell.terrain === 'river' && defenderCell.terrain !== 'river') {
                return false;
            }
            if (attackerCell.terrain !== 'river' && defenderCell.terrain === 'river') {
                return false;
            }
            return true;
        }
        
        // Elephant can't be eaten by anything except rat
        if (defender.type === 'elephant' && attacker.type !== 'rat') {
            return false;
        }
        
        // Elephant can't eat rat
        if (attacker.type === 'elephant' && defender.type === 'rat') {
            return false;
        }
        
        // Rat in river can't be eaten by land animals
        if (defender.type === 'rat' && defenderCell.terrain === 'river' && attackerCell.terrain !== 'river') {
            return false;
        }
        
        // Land animals can't eat rat in river
        if (attacker.type !== 'rat' && defender.type === 'rat' && defenderCell.terrain === 'river') {
            return false;
        }
        
        // Check trap effect
        let attackerRank = attacker.rank;
        let defenderRank = defender.rank;
        
        // Attacker in enemy trap loses power
        if ((attacker.color === 'red' && attackerCell.terrain === 'trap-blue') ||
            (attacker.color === 'blue' && attackerCell.terrain === 'trap-red')) {
            attackerRank = 0;
        }
        
        // Defender in enemy trap loses power
        if ((defender.color === 'red' && defenderCell.terrain === 'trap-blue') ||
            (defender.color === 'blue' && defenderCell.terrain === 'trap-red')) {
            defenderRank = 0;
        }
        
        return attackerRank >= defenderRank;
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol].piece;
        const capturedPiece = this.board[toRow][toCol].piece;
        const currentPlayerName = this.currentPlayer === 'red' ? '紅方' : '藍方';
        
        if (capturedPiece) {
            this.capturedPieces[this.currentPlayer].push(capturedPiece);
            this.updateCapturedPieces();
            this.lastAction = `${currentPlayerName}的${piece.name} 吃掉了 ${capturedPiece.name}`;
        } else {
            this.lastAction = `${currentPlayerName}的${piece.name} 移動到新位置`;
        }
        
        this.board[toRow][toCol].piece = piece;
        this.board[fromRow][fromCol].piece = null;
        
        this.renderBoard();
        
        // Show move message with current player color and detailed description
        const actionClass = this.currentPlayer === 'red' ? 'red-action' : 'blue-action';
        const message = capturedPiece 
            ? `${currentPlayerName}的${piece.name} 吃掉了 ${capturedPiece.name}！`
            : `${currentPlayerName} 移動了 ${piece.name}`;
        this.showMessage(message, actionClass);
    }
    
    highlightPossibleMoves(row, col) {
        this.clearHighlights();
        
        // Highlight selected piece
        const selectedCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        selectedCell.classList.add('selected');
        
        // Highlight possible moves
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 7; c++) {
                if (this.isValidMove(row, col, r, c)) {
                    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                    const targetPiece = this.board[r][c].piece;
                    
                    if (targetPiece && targetPiece.color !== this.currentPlayer) {
                        cell.classList.add('enemy-piece');
                    } else {
                        cell.classList.add('possible-move');
                    }
                }
            }
        }
    }
    
    clearHighlights() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'possible-move', 'enemy-piece');
        });
    }
    
    clearSelection() {
        this.selectedPiece = null;
        this.selectedCell = null;
        this.clearHighlights();
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'blue' : 'red';
        this.updateGameInfo();
        
        // Trigger AI move if it's AI's turn
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiPlayer) {
            this.makeAIMove();
        }
    }
    
    updateGameInfo() {
        const playerDisplay = document.getElementById('current-player-display');
        const playerBoard = document.querySelector('.current-player-board');
        let currentPlayerName;
        
        if (this.gameMode === 'ai') {
            currentPlayerName = this.currentPlayer === 'red' ? '玩家（紅方）' : '電腦（藍方）';
        } else {
            currentPlayerName = this.currentPlayer === 'red' ? '紅方' : '藍方';
        }
        
        playerDisplay.textContent = `當前玩家：${currentPlayerName}`;
        
        // Update player board background color
        playerBoard.className = `current-player-board ${this.currentPlayer}`;
        
        // Show appropriate message based on game mode and turn
        if (!this.lastAction) {
            if (this.gameMode === 'ai' && this.currentPlayer === this.aiPlayer) {
                this.showMessage('電腦思考中...', `${this.currentPlayer}-turn`);
            } else {
                this.showMessage('尚未移動', `${this.currentPlayer}-turn`);
            }
        }
        
        // Start 1-second color highlight
        this.startColorHighlight();
    }
    
    startColorHighlight() {
        // Clear any existing timer
        if (this.highlightTimer) {
            clearTimeout(this.highlightTimer);
        }
        
        // Re-render board to show current player pieces highlighted
        this.renderBoard();
        
        // Set timer to stop highlight after 1 second
        this.highlightTimer = setTimeout(() => {
            this.stopColorHighlight();
        }, 1000);
        
        // Add mouse movement listener to stop highlight early
        this.addMouseListener();
    }
    
    addMouseListener() {
        const gameBoard = document.getElementById('game-board');
        const stopHighlight = () => {
            this.stopColorHighlight();
            gameBoard.removeEventListener('mousemove', stopHighlight);
        };
        gameBoard.addEventListener('mousemove', stopHighlight);
    }
    
    stopColorHighlight() {
        // Clear timer
        if (this.highlightTimer) {
            clearTimeout(this.highlightTimer);
            this.highlightTimer = null;
        }
        
        // Remove current-player class from all pieces
        document.querySelectorAll('.piece.current-player').forEach(piece => {
            piece.classList.remove('current-player');
        });
    }
    
    updateCapturedPieces() {
        const redCaptured = document.getElementById('red-captured-pieces');
        const blueCaptured = document.getElementById('blue-captured-pieces');
        
        redCaptured.innerHTML = '';
        blueCaptured.innerHTML = '';
        
        this.capturedPieces.red.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = `captured-piece ${piece.color}`;
            pieceElement.textContent = piece.name;
            redCaptured.appendChild(pieceElement);
        });
        
        this.capturedPieces.blue.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.className = `captured-piece ${piece.color}`;
            pieceElement.textContent = piece.name;
            blueCaptured.appendChild(pieceElement);
        });
    }
    
    checkGameEnd() {
        // Check if any player reached opponent's den
        const redInBlueDen = this.board[0][3].piece && this.board[0][3].piece.color === 'red';
        const blueInRedDen = this.board[8][3].piece && this.board[8][3].piece.color === 'blue';
        
        if (redInBlueDen) {
            this.endGame('紅方獲勝！成功進入敵方獸穴！');
            return;
        }
        
        if (blueInRedDen) {
            this.endGame('藍方獲勝！成功進入敵方獸穴！');
            return;
        }
        
        // Check if any player has no pieces left
        let redPieces = 0, bluePieces = 0;
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 7; col++) {
                const piece = this.board[row][col].piece;
                if (piece) {
                    if (piece.color === 'red') redPieces++;
                    else bluePieces++;
                }
            }
        }
        
        if (redPieces === 0) {
            this.endGame('藍方獲勝！吃掉了所有紅方棋子！');
        } else if (bluePieces === 0) {
            this.endGame('紅方獲勝！吃掉了所有藍方棋子！');
        }
    }
    
    endGame(message) {
        this.gameOver = true;
        this.clearSelection();
        
        // Clear highlight timer and stop color highlight
        this.stopColorHighlight();
        
        this.renderBoard(); // Re-render to stop highlight effect
        this.showMessage(message, 'win');
        
        // Show victory modal after a short delay
        setTimeout(() => {
            this.showVictoryModal(message);
        }, 1500);
    }
    
    showVictoryModal(message) {
        const modal = document.getElementById('victory-modal');
        const title = document.getElementById('victory-title');
        const messageEl = document.getElementById('victory-message');
        
        if (message.includes('紅方獲勝')) {
            title.textContent = '🔴 紅方獲勝！';
            title.style.color = '#e74c3c';
        } else if (message.includes('藍方獲勝')) {
            title.textContent = '🔵 藍方獲勝！';
            title.style.color = '#3498db';
        }
        
        messageEl.textContent = message;
        modal.style.display = 'block';
    }
    
    closeVictoryModal() {
        document.getElementById('victory-modal').style.display = 'none';
    }
    
    showMessage(text, type = 'info') {
        const messageElement = document.getElementById('game-message');
        messageElement.textContent = text;
        messageElement.className = `game-message ${type}`;
        
        // Only clear temporary info messages, not action messages
        if (type === 'info') {
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = 'game-message';
            }, 3000);
        }
        // Action messages (red-action, blue-action, no-action) persist
    }
    
    newGame() {
        this.board = this.createBoard();
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.selectedCell = null;
        this.gameOver = false;
        this.capturedPieces = { red: [], blue: [] };
        this.lastAction = '';
        
        // Clear highlight timer
        this.stopColorHighlight();
        
        this.setupPieces();
        this.renderBoard();
        this.updateGameInfo();
        this.updateCapturedPieces();
        
        // If AI mode and it's AI's turn (shouldn't happen since red goes first, but just in case)
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiPlayer) {
            this.makeAIMove();
        }
    }
    
    showRules() {
        document.getElementById('rules-modal').style.display = 'block';
    }
    
    // AI functionality
    setGameMode(mode) {
        this.gameMode = mode;
        const pvpBtn = document.getElementById('pvp-mode-btn');
        const aiBtn = document.getElementById('ai-mode-btn');
        
        pvpBtn.classList.remove('active');
        aiBtn.classList.remove('active');
        
        if (mode === 'pvp') {
            pvpBtn.classList.add('active');
        } else {
            aiBtn.classList.add('active');
        }
        
        this.newGame(); // Restart game when mode changes
    }
    
    makeAIMove() {
        if (this.gameMode !== 'ai' || this.currentPlayer !== this.aiPlayer || this.gameOver) {
            return;
        }
        
        // Add delay to make AI move feel more natural
        setTimeout(() => {
            const bestMove = this.findBestMove();
            if (bestMove) {
                this.makeMove(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol);
                this.clearSelection();
                this.switchPlayer();
                this.checkGameEnd();
            }
        }, 1000); // 1 second delay
    }
    
    findBestMove() {
        const moves = this.getAllValidMoves(this.aiPlayer);
        if (moves.length === 0) return null;
        
        let bestScore = -Infinity;
        let bestMove = null;
        
        // Evaluate each possible move
        for (const move of moves) {
            const score = this.evaluateMove(move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    getAllValidMoves(playerColor) {
        const moves = [];
        
        for (let fromRow = 0; fromRow < 9; fromRow++) {
            for (let fromCol = 0; fromCol < 7; fromCol++) {
                const piece = this.board[fromRow][fromCol].piece;
                if (!piece || piece.color !== playerColor) continue;
                
                for (let toRow = 0; toRow < 9; toRow++) {
                    for (let toCol = 0; toCol < 7; toCol++) {
                        if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                            moves.push({
                                fromRow, fromCol, toRow, toCol,
                                piece: piece,
                                target: this.board[toRow][toCol].piece
                            });
                        }
                    }
                }
            }
        }
        
        return moves;
    }
    
    evaluateMove(move) {
        let score = 0;
        const { toRow, toCol, piece, target } = move;
        
        // Prioritize capturing opponent pieces
        if (target) {
            score += target.rank * 10; // Bonus for capturing higher rank pieces
            
            // Special bonus for capturing elephant with rat
            if (piece.type === 'rat' && target.type === 'elephant') {
                score += 50;
            }
        }
        
        // Prioritize reaching opponent's den
        const targetTerrain = this.board[toRow][toCol].terrain;
        if (targetTerrain === 'den-red') {
            score += 1000; // Winning move
        }
        
        // Avoid enemy traps unless capturing
        if (targetTerrain === 'trap-red' && !target) {
            score -= 20;
        }
        
        // Positional bonuses
        score += this.getPositionalScore(piece, toRow, toCol);
        
        // Add some randomness to avoid predictable play
        score += Math.random() * 5;
        
        return score;
    }
    
    getPositionalScore(piece, row, col) {
        let score = 0;
        
        // Encourage advancement toward enemy
        if (piece.color === 'blue') {
            score += (8 - row) * 2; // Blue advances downward
        } else {
            score += row * 2; // Red advances upward
        }
        
        // Center control bonus
        const centerDistance = Math.abs(col - 3);
        score += (3 - centerDistance);
        
        // Special positioning for different pieces
        switch (piece.type) {
            case 'rat':
                // Rats should be near rivers or ready to attack elephants
                if (this.board[row][col].terrain === 'river') {
                    score += 5;
                }
                break;
            case 'tiger':
            case 'lion':
                // Tigers and lions should be positioned to jump rivers
                if (this.canJumpFromPosition(row, col)) {
                    score += 8;
                }
                break;
        }
        
        return score;
    }
    
    canJumpFromPosition(row, col) {
        // Check if tiger/lion can make a jumping move from this position
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
        ];
        
        for (const [dRow, dCol] of directions) {
            let currentRow = row + dRow;
            let currentCol = col + dCol;
            let riverCount = 0;
            
            while (currentRow >= 0 && currentRow < 9 && currentCol >= 0 && currentCol < 7) {
                const terrain = this.board[currentRow][currentCol].terrain;
                if (terrain === 'river') {
                    riverCount++;
                    if (this.board[currentRow][currentCol].piece?.type === 'rat') {
                        break; // Blocked by rat
                    }
                } else {
                    if (riverCount > 0) {
                        return true; // Can jump over river
                    }
                    break;
                }
                currentRow += dRow;
                currentCol += dCol;
            }
        }
        
        return false;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new DouShouQi();
});