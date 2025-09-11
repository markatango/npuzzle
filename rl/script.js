class SlidingPuzzleRL {
    constructor() {
        this.size = 3;
        this.puzzle = [];
        this.emptyPos = { row: 0, col: 0 };
        this.moveCount = 0;
        this.isTraining = false;
        this.isSolving = false;
        this.qTable = new Map();
        this.bestSolution = null;
        this.bestSolutionMoves = Infinity;
        this.trainingPuzzle = null;
        this.trainingEmptyPos = null;
        this.episodes = 0;
        this.successCount = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        this.generateSolvedPuzzle();
        this.renderPuzzle();
        this.updateStats();
    }
    
    initializeElements() {
        this.elements = {
            puzzleSize: document.getElementById('puzzleSize'),
            trainingEpisodes: document.getElementById('trainingEpisodes'),
            puzzleGrid: document.getElementById('puzzleGrid'),
            statusText: document.getElementById('statusText'),
            statusIndicator: document.getElementById('statusIndicator'),
            logContent: document.getElementById('logContent'),
            episodeCount: document.getElementById('episodeCount'),
            successRate: document.getElementById('successRate'),
            bestSolution: document.getElementById('bestSolution'),
            qTableSize: document.getElementById('qTableSize'),
            moveCount: document.getElementById('moveCount'),
            progressFill: document.getElementById('progressFill'),
            newPuzzleBtn: document.getElementById('newPuzzleBtn'),
            trainBtn: document.getElementById('trainBtn'),
            solveBtn: document.getElementById('solveBtn'),
            stopBtn: document.getElementById('stopBtn')
        };
    }
    
    setupEventListeners() {
        this.elements.puzzleSize.addEventListener('change', () => this.onPuzzleSizeChange());
        this.elements.newPuzzleBtn.addEventListener('click', () => this.newPuzzle());
        this.elements.trainBtn.addEventListener('click', () => this.startTraining());
        this.elements.solveBtn.addEventListener('click', () => this.startSolving());
        this.elements.stopBtn.addEventListener('click', () => this.stopAll());
    }
    
    onPuzzleSizeChange() {
        this.size = parseInt(this.elements.puzzleSize.value);
        this.resetAI();
        this.generateSolvedPuzzle();
        this.renderPuzzle();
        this.updateStats();
        this.log(`📐 Puzzle size changed to ${this.size}x${this.size}`, 'info');
    }
    
    resetAI() {
        this.qTable.clear();
        this.bestSolution = null;
        this.bestSolutionMoves = Infinity;
        this.trainingPuzzle = null;
        this.trainingEmptyPos = null;
        this.episodes = 0;
        this.successCount = 0;
        this.elements.solveBtn.disabled = true;
    }
    
    log(message, type = '') {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = message;
        this.elements.logContent.appendChild(logEntry);
        this.elements.logContent.scrollTop = this.elements.logContent.scrollHeight;
    }
    
    setStatus(text, type) {
        this.elements.statusText.textContent = text;
        this.elements.statusIndicator.className = `status-indicator status-${type}`;
    }
    
    updateStats() {
        this.elements.episodeCount.textContent = this.episodes;
        this.elements.successRate.textContent = this.episodes > 0 ? 
            ((this.successCount / this.episodes) * 100).toFixed(1) + '%' : '0%';
        this.elements.bestSolution.textContent = this.bestSolution ? 
            `${this.bestSolutionMoves} moves` : 'None';
        this.elements.qTableSize.textContent = this.qTable.size;
        this.elements.moveCount.textContent = this.moveCount;
    }
    
    updateProgress(current, total) {
        const percentage = (current / total) * 100;
        this.elements.progressFill.style.width = percentage + '%';
        this.elements.progressFill.textContent = percentage.toFixed(1) + '%';
    }
    
    generateSolvedPuzzle() {
        this.puzzle = [];
        for (let i = 0; i < this.size; i++) {
            this.puzzle[i] = [];
            for (let j = 0; j < this.size; j++) {
                const value = i * this.size + j + 1;
                const maxTileNumber = this.size * this.size - 1;
                this.puzzle[i][j] = value <= maxTileNumber ? value : 0;
            }
        }
        this.emptyPos = { row: this.size - 1, col: this.size - 1 };
    }
    
    newPuzzle() {
        this.generateSolvedPuzzle();
        
        // Scale shuffle moves with puzzle size
        const shuffleMoves = this.size === 3 ? 20 : this.size === 4 ? 50 : 100;
        this.shufflePuzzle(shuffleMoves);
        
        this.moveCount = 0;
        this.renderPuzzle();
        this.updateStats();
        this.log(`🔄 New ${this.size}x${this.size} puzzle generated`, 'info');
        this.setStatus('Ready to train', 'idle');
    }
    
    shufflePuzzle(moves) {
        for (let i = 0; i < moves; i++) {
            const validMoves = this.getValidMoves();
            if (validMoves.length > 0) {
                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                this.makeMove(randomMove.row, randomMove.col, false);
            }
        }
        
        // Store training puzzle
        this.trainingPuzzle = this.puzzle.map(row => [...row]);
        this.trainingEmptyPos = { ...this.emptyPos };
    }
    
    getValidMoves() {
        const moves = [];
        const directions = [
            { row: -1, col: 0 }, { row: 1, col: 0 },
            { row: 0, col: -1 }, { row: 0, col: 1 }
        ];
        
        for (const dir of directions) {
            const newRow = this.emptyPos.row + dir.row;
            const newCol = this.emptyPos.col + dir.col;
            
            if (newRow >= 0 && newRow < this.size && newCol >= 0 && newCol < this.size) {
                moves.push({ row: newRow, col: newCol });
            }
        }
        
        return moves;
    }
    
    makeMove(row, col, updateCount = true) {
        if (this.isValidMove(row, col)) {
            this.puzzle[this.emptyPos.row][this.emptyPos.col] = this.puzzle[row][col];
            this.puzzle[row][col] = 0;
            this.emptyPos = { row, col };
            
            if (updateCount) {
                this.moveCount++;
                this.updateStats();
            }
            
            return true;
        }
        return false;
    }
    
    isValidMove(row, col) {
        const rowDiff = Math.abs(row - this.emptyPos.row);
        const colDiff = Math.abs(col - this.emptyPos.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    isSolved() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const expectedValue = i * this.size + j + 1;
                const actualValue = this.puzzle[i][j];
                
                if (i === this.size - 1 && j === this.size - 1) {
                    if (actualValue !== 0) return false;
                } else {
                    if (actualValue !== expectedValue) return false;
                }
            }
        }
        return true;
    }
    
    renderPuzzle() {
        this.elements.puzzleGrid.innerHTML = '';
        
        // Set grid columns dynamically based on size
        this.elements.puzzleGrid.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                
                // Adjust tile size based on puzzle size
                const tileSize = this.size === 3 ? '80px' : this.size === 4 ? '65px' : '50px';
                const fontSize = this.size === 3 ? '24px' : this.size === 4 ? '20px' : '16px';
                
                tile.style.width = tileSize;
                tile.style.height = tileSize;
                tile.style.fontSize = fontSize;
                
                if (this.puzzle[i][j] === 0) {
                    tile.className += ' empty';
                } else {
                    tile.textContent = this.puzzle[i][j];
                    tile.addEventListener('click', () => {
                        if (!this.isTraining && !this.isSolving) {
                            if (this.makeMove(i, j)) {
                                this.renderPuzzle();
                                if (this.isSolved()) {
                                    this.setStatus('Puzzle Solved! 🎉', 'solved');
                                    this.log('🎉 Congratulations! Manually solved!', 'success');
                                }
                            }
                        }
                    });
                }
                
                this.elements.puzzleGrid.appendChild(tile);
            }
        }
    }
    
    getStateKey() {
        return this.puzzle.flat().join(',');
    }
    
    calculateReward() {
        if (this.isSolved()) return 100;
        
        let manhattanDistance = 0;
        let correctPositions = 0;
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.puzzle[i][j];
                if (value !== 0) {
                    const targetRow = Math.floor((value - 1) / this.size);
                    const targetCol = (value - 1) % this.size;
                    const distance = Math.abs(i - targetRow) + Math.abs(j - targetCol);
                    manhattanDistance += distance;
                    
                    if (distance === 0) correctPositions++;
                }
            }
        }
        
        return correctPositions * 10 - manhattanDistance * 0.5;
    }
    
    getBestAction(state, validMoves) {
        let bestAction = validMoves[0];
        let bestValue = -Infinity;
        
        for (const action of validMoves) {
            const actionKey = `${action.row},${action.col}`;
            const stateActionKey = `${state}:${actionKey}`;
            const qValue = this.qTable.get(stateActionKey) || 0;
            
            if (qValue > bestValue) {
                bestValue = qValue;
                bestAction = action;
            }
        }
        
        return bestAction;
    }
    
    updateQValue(state, action, reward, nextState) {
        const actionKey = `${action.row},${action.col}`;
        const stateActionKey = `${state}:${actionKey}`;
        const currentQ = this.qTable.get(stateActionKey) || 0;
        
        const nextValidMoves = this.getValidMoves();
        let maxNextQ = -Infinity;
        for (const nextAction of nextValidMoves) {
            const nextActionKey = `${nextAction.row},${nextAction.col}`;
            const nextStateActionKey = `${nextState}:${nextActionKey}`;
            const nextQ = this.qTable.get(nextStateActionKey) || 0;
            maxNextQ = Math.max(maxNextQ, nextQ);
        }
        if (maxNextQ === -Infinity) maxNextQ = 0;
        
        const learningRate = 0.1;
        const discountFactor = 0.9;
        const newQ = currentQ + learningRate * (reward + discountFactor * maxNextQ - currentQ);
        
        this.qTable.set(stateActionKey, newQ);
    }
    
    validateSolution(solutionPath) {
        const testPuzzle = this.trainingPuzzle.map(row => [...row]);
        const testEmpty = { ...this.trainingEmptyPos };
        
        for (const move of solutionPath) {
            const rowDiff = Math.abs(move.to.row - testEmpty.row);
            const colDiff = Math.abs(move.to.col - testEmpty.col);
            if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
                return false;
            }
            
            testPuzzle[testEmpty.row][testEmpty.col] = testPuzzle[move.to.row][move.to.col];
            testPuzzle[move.to.row][move.to.col] = 0;
            testEmpty.row = move.to.row;
            testEmpty.col = move.to.col;
        }
        
        // Check if solved
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const expectedValue = i * this.size + j + 1;
                const actualValue = testPuzzle[i][j];
                
                if (i === this.size - 1 && j === this.size - 1) {
                    if (actualValue !== 0) return false;
                } else {
                    if (actualValue !== expectedValue) return false;
                }
            }
        }
        
        return true;
    }
    
    async startTraining() {
        if (!this.trainingPuzzle) {
            this.log('⚠️ Please generate a new puzzle first!', 'warning');
            return;
        }
        
        this.isTraining = true;
        this.episodes = 0;
        this.successCount = 0;
        this.qTable.clear();
        
        this.elements.trainBtn.disabled = true;
        this.elements.stopBtn.disabled = false;
        this.setStatus('Training AI... 🧠', 'training');
        
        const totalEpisodes = parseInt(this.elements.trainingEpisodes.value);
        this.log(`🧠 Starting AI training for ${totalEpisodes.toLocaleString()} episodes on ${this.size}x${this.size} puzzle...`, 'info');
        
        for (let episode = 0; episode < totalEpisodes && this.isTraining; episode++) {
            this.episodes = episode + 1;
            
            // Reset to training puzzle
            this.puzzle = this.trainingPuzzle.map(row => [...row]);
            this.emptyPos = { ...this.trainingEmptyPos };
            
            let solutionPath = [];
            let lastMove = null;
            const maxMoves = this.size === 3 ? 200 : this.size === 4 ? 500 : 1000;
            
            for (let move = 0; move < maxMoves && this.isTraining; move++) {
                const state = this.getStateKey();
                const validMoves = this.getValidMoves();
                
                if (validMoves.length === 0) break;
                
                const epsilon = Math.max(0.05, 0.95 - (episode / totalEpisodes) * 0.8);
                let action;
                
                if (Math.random() < epsilon) {
                    let explorationMoves = validMoves;
                    if (lastMove && validMoves.length > 1) {
                        explorationMoves = validMoves.filter(m => 
                            !(m.row === lastMove.row && m.col === lastMove.col)
                        );
                        if (explorationMoves.length === 0) {
                            explorationMoves = validMoves;
                        }
                    }
                    action = explorationMoves[Math.floor(Math.random() * explorationMoves.length)];
                } else {
                    action = this.getBestAction(state, validMoves);
                }
                
                const prevState = state;
                const oldEmpty = { ...this.emptyPos };
                
                this.makeMove(action.row, action.col, false);
                solutionPath.push({
                    from: oldEmpty,
                    to: action,
                    tile: this.puzzle[oldEmpty.row][oldEmpty.col]
                });
                
                lastMove = { row: oldEmpty.row, col: oldEmpty.col };
                
                const newState = this.getStateKey();
                let reward = this.calculateReward();
                
                if (lastMove && action.row === lastMove.row && action.col === lastMove.col) {
                    reward -= 2;
                }
                
                this.updateQValue(prevState, action, reward, newState);
                
                if (this.isSolved()) {
                    this.successCount++;
                    
                    if (this.validateSolution(solutionPath)) {
                        if (solutionPath.length < this.bestSolutionMoves) {
                            this.bestSolutionMoves = solutionPath.length;
                            this.bestSolution = [...solutionPath];
                            this.log(`🎯 New best solution: ${solutionPath.length} moves!`, 'success');
                        }
                    }
                    break;
                }
            }
            
            if (episode % 1000 === 0 || episode === totalEpisodes - 1) {
                this.updateProgress(episode + 1, totalEpisodes);
                this.updateStats();
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        this.isTraining = false;
        this.elements.trainBtn.disabled = false;
        this.elements.solveBtn.disabled = !this.bestSolution;
        this.elements.stopBtn.disabled = true;
        this.updateStats();
        
        if (this.bestSolution) {
            this.setStatus('Training Complete! ✅', 'idle');
            this.log(`✅ Training complete! Best solution: ${this.bestSolutionMoves} moves`, 'success');
        } else {
            this.setStatus('Training Complete (No solution)', 'idle');
            this.log('⚠️ Training complete but no solution found. Try more episodes.', 'warning');
        }
    }
    
    async startSolving() {
        if (!this.bestSolution) {
            this.log('❌ No solution available! Train the AI first.', 'error');
            return;
        }
        
        this.isSolving = true;
        this.elements.solveBtn.disabled = true;
        this.elements.stopBtn.disabled = false;
        this.setStatus('Solving... 🎯', 'solving');
        this.log('🎯 Replaying best solution...', 'info');
        
        // Reset to training puzzle
        this.puzzle = this.trainingPuzzle.map(row => [...row]);
        this.emptyPos = { ...this.trainingEmptyPos };
        this.moveCount = 0;
        this.renderPuzzle();
        this.updateStats();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        for (let i = 0; i < this.bestSolution.length && this.isSolving; i++) {
            const move = this.bestSolution[i];
            
            this.log(`Step ${i + 1}/${this.bestSolution.length}: Moving tile ${move.tile}`);
            
            // Animate the tile
            this.animateTile(move.to.row, move.to.col);
            
            this.makeMove(move.to.row, move.to.col);
            this.renderPuzzle();
            
            if (this.isSolved()) {
                this.setStatus('Puzzle Solved! 🎉', 'solved');
                this.log('🎉 AI successfully solved the puzzle!', 'success');
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        this.isSolving = false;
        this.elements.solveBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
    }
    
    animateTile(row, col) {
        const tiles = this.elements.puzzleGrid.children;
        for (let tile of tiles) {
            if (tile.textContent == this.puzzle[row][col]) {
                tile.classList.add('animate');
                setTimeout(() => {
                    tile.classList.remove('animate');
                }, 400);
                break;
            }
        }
    }
    
    stopAll() {
        this.isTraining = false;
        this.isSolving = false;
        this.elements.trainBtn.disabled = false;
        this.elements.solveBtn.disabled = !this.bestSolution;
        this.elements.stopBtn.disabled = true;
        this.setStatus('Stopped', 'idle');
        this.log('⏹️ Operation stopped', 'warning');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SlidingPuzzleRL();
});

