// Node class for A* search
class SearchNode {
    constructor(puzzle, emptyPos, parent = null, move = null, gCost = 0) {
        this.puzzle = puzzle.map(row => [...row]);
        this.emptyPos = { ...emptyPos };
        this.parent = parent;
        this.move = move;
        this.gCost = gCost;
        this.hCost = 0;
        this.fCost = 0;
        this.stateKey = this.getStateKey();
    }
    
    getStateKey() {
        return this.puzzle.flat().join(',');
    }
    
    equals(other) {
        return this.stateKey === other.stateKey;
    }
}

class SlidingPuzzleAStar {
    constructor() {
        this.size = 3;
        this.puzzle = [];
        this.emptyPos = { row: 0, col: 0 };
        this.moveCount = 0;
        this.isSolving = false;
        this.solution = null;
        this.nodesExplored = 0;
        this.nodesInQueue = 0;
        this.searchTime = 0;
        this.heuristicFunction = 'manhattan';
        
        this.initializeElements();
        this.setupEventListeners();
        this.generateSolvedPuzzle();
        this.renderPuzzle();
        this.updateStats();
    }
    
    initializeElements() {
        this.elements = {
            puzzleSize: document.getElementById('puzzleSize'),
            heuristicFunction: document.getElementById('heuristicFunction'),
            puzzleGrid: document.getElementById('puzzleGrid'),
            statusText: document.getElementById('statusText'),
            statusIndicator: document.getElementById('statusIndicator'),
            logContent: document.getElementById('logContent'),
            nodesExplored: document.getElementById('nodesExplored'),
            nodesInQueue: document.getElementById('nodesInQueue'),
            solutionLength: document.getElementById('solutionLength'),
            searchTime: document.getElementById('searchTime'),
            moveCount: document.getElementById('moveCount'),
            progressFill: document.getElementById('progressFill'),
            newPuzzleBtn: document.getElementById('newPuzzleBtn'),
            solveBtn: document.getElementById('solveBtn'),
            stopBtn: document.getElementById('stopBtn')
        };
        
        // Check for missing elements
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.error(`Missing element: ${key}`);
            }
        }
    }
    
    setupEventListeners() {
        this.elements.puzzleSize.addEventListener('change', () => this.onPuzzleSizeChange());
        this.elements.heuristicFunction.addEventListener('change', () => this.onHeuristicChange());
        this.elements.newPuzzleBtn.addEventListener('click', () => this.newPuzzle());
        this.elements.solveBtn.addEventListener('click', () => this.startSolving());
        this.elements.stopBtn.addEventListener('click', () => this.stopSolving());
    }
    
    onPuzzleSizeChange() {
        this.size = parseInt(this.elements.puzzleSize.value);
        this.resetSearch();
        this.generateSolvedPuzzle();
        this.renderPuzzle();
        this.updateStats();
        this.log(`📐 Puzzle size changed to ${this.size}x${this.size}`, 'info');
    }
    
    onHeuristicChange() {
        this.heuristicFunction = this.elements.heuristicFunction.value;
        this.log(`🎯 Heuristic changed to ${this.getHeuristicName()}`, 'info');
    }
    
    getHeuristicName() {
        const names = {
            'manhattan': 'Manhattan Distance',
            'misplaced': 'Misplaced Tiles',
            'euclidean': 'Euclidean Distance',
            'combined': 'Combined Heuristic'
        };
        return names[this.heuristicFunction] || 'Unknown';
    }
    
    resetSearch() {
        this.solution = null;
        this.nodesExplored = 0;
        this.nodesInQueue = 0;
        this.searchTime = 0;
        this.elements.solveBtn.disabled = false;
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
        this.elements.nodesExplored.textContent = this.nodesExplored.toLocaleString();
        this.elements.nodesInQueue.textContent = this.nodesInQueue.toLocaleString();
        this.elements.solutionLength.textContent = this.solution ? 
            `${this.solution.length} moves` : 'None';
        this.elements.searchTime.textContent = `${this.searchTime}ms`;
        this.elements.moveCount.textContent = this.moveCount;
    }
    
    updateProgress(current, estimated) {
        if (estimated > 0) {
            const percentage = Math.min(100, (current / estimated) * 100);
            this.elements.progressFill.style.width = percentage + '%';
            this.elements.progressFill.textContent = percentage.toFixed(1) + '%';
        }
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
        // const shuffleMoves = this.size === 3 ? 25 : this.size === 4 ? 50 : 100;
        const shuffleMoves = this.size === 3 ? 25 : this.size === 4 ? 50 : this.size === 5 ? 50 : 200;
        this.shufflePuzzle(shuffleMoves);
        
        this.moveCount = 0;
        this.resetSearch();
        this.renderPuzzle();
        this.updateStats();
        this.log(`🔄 New ${this.size}x${this.size} puzzle generated`, 'info');
        this.setStatus('Ready to solve', 'idle');
        this.elements.solveBtn.disabled = false;
    }
    
    shufflePuzzle(moves) {
        for (let i = 0; i < moves; i++) {
            const validMoves = this.getValidMoves(this.emptyPos);
            if (validMoves.length > 0) {
                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                this.makeMove(randomMove.row, randomMove.col, false);
            }
        }
    }
    
    getValidMoves(emptyPos) {
        const moves = [];
        const directions = [
            { row: -1, col: 0 }, { row: 1, col: 0 },
            { row: 0, col: -1 }, { row: 0, col: 1 }
        ];
        
        for (const dir of directions) {
            const newRow = emptyPos.row + dir.row;
            const newCol = emptyPos.col + dir.col;
            
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
    
    isSolved(puzzle = this.puzzle) {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const expectedValue = i * this.size + j + 1;
                const actualValue = puzzle[i][j];
                
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
                        if (!this.isSolving) {
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
    
    // Heuristic functions
    manhattanDistance(puzzle) {
        let distance = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = puzzle[i][j];
                if (value !== 0) {
                    const targetRow = Math.floor((value - 1) / this.size);
                    const targetCol = (value - 1) % this.size;
                    distance += Math.abs(i - targetRow) + Math.abs(j - targetCol);
                }
            }
        }
        return distance;
    }
    
    misplacedTiles(puzzle) {
        let misplaced = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = puzzle[i][j];
                if (value !== 0) {
                    const expectedValue = i * this.size + j + 1;
                    if (value !== expectedValue) {
                        misplaced++;
                    }
                }
            }
        }
        return misplaced;
    }
    
    euclideanDistance(puzzle) {
        let distance = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = puzzle[i][j];
                if (value !== 0) {
                    const targetRow = Math.floor((value - 1) / this.size);
                    const targetCol = (value - 1) % this.size;
                    distance += Math.sqrt(Math.pow(i - targetRow, 2) + Math.pow(j - targetCol, 2));
                }
            }
        }
        return distance;
    }
    
    combinedHeuristic(puzzle) {
        return this.manhattanDistance(puzzle) + (this.misplacedTiles(puzzle) * 2);
    }
    
    calculateHeuristic(puzzle) {
        switch (this.heuristicFunction) {
            case 'manhattan': return this.manhattanDistance(puzzle);
            case 'misplaced': return this.misplacedTiles(puzzle);
            case 'euclidean': return this.euclideanDistance(puzzle);
            case 'combined': return this.combinedHeuristic(puzzle);
            default: return this.manhattanDistance(puzzle);
        }
    }
    
    getNeighbors(node) {
        const neighbors = [];
        const validMoves = this.getValidMoves(node.emptyPos);
        
        for (const move of validMoves) {
            const newPuzzle = node.puzzle.map(row => [...row]);
            const newEmptyPos = { ...node.emptyPos };
            
            // Make the move
            newPuzzle[newEmptyPos.row][newEmptyPos.col] = newPuzzle[move.row][move.col];
            newPuzzle[move.row][move.col] = 0;
            newEmptyPos.row = move.row;
            newEmptyPos.col = move.col;
            
            const neighbor = new SearchNode(
                newPuzzle,
                newEmptyPos,
                node,
                { from: node.emptyPos, to: move, tile: newPuzzle[newEmptyPos.row][newEmptyPos.col] },
                node.gCost + 1
            );
            
            neighbor.hCost = this.calculateHeuristic(newPuzzle);
            neighbor.fCost = neighbor.gCost + neighbor.hCost;
            
            neighbors.push(neighbor);
        }
        
        return neighbors;
    }
    
    reconstructPath(node) {
        const path = [];
        let current = node;
        
        while (current.parent) {
            path.unshift(current.move);
            current = current.parent;
        }
        
        return path;
    }
    
    async aStar() {
        const startTime = Date.now();
        const startNode = new SearchNode(this.puzzle, this.emptyPos);
        startNode.hCost = this.calculateHeuristic(this.puzzle);
        startNode.fCost = startNode.gCost + startNode.hCost;
        
        const openSet = [startNode];
        const closedSet = new Set();
        this.nodesExplored = 0;
        
        this.log(`🔍 Starting A* search with ${this.getHeuristicName()}...`, 'info');
        
        while (openSet.length > 0 && this.isSolving) {
            // Sort by fCost (lowest first), then by hCost
            openSet.sort((a, b) => {
                if (a.fCost !== b.fCost) return a.fCost - b.fCost;
                return a.hCost - b.hCost;
            });
            
            const current = openSet.shift();
            this.nodesExplored++;
            this.nodesInQueue = openSet.length;
            
            if (this.isSolved(current.puzzle)) {
                this.searchTime = Date.now() - startTime;
                this.solution = this.reconstructPath(current);
                this.updateStats();
                this.log(`✅ Solution found! ${this.solution.length} moves, ${this.nodesExplored} nodes explored`, 'success');
                return this.solution;
            }
            
            closedSet.add(current.stateKey);
            
            const neighbors = this.getNeighbors(current);
            
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor.stateKey)) continue;
                
                const existingNode = openSet.find(node => node.stateKey === neighbor.stateKey);
                
                if (!existingNode) {
                    openSet.push(neighbor);
                } else if (neighbor.gCost < existingNode.gCost) {
                    // Better path found
                    existingNode.gCost = neighbor.gCost;
                    existingNode.fCost = neighbor.fCost;
                    existingNode.parent = neighbor.parent;
                    existingNode.move = neighbor.move;
                }
            }
            
            // Update progress and stats periodically
            if (this.nodesExplored % 100 === 0) {
                this.updateStats();
                this.updateProgress(this.nodesExplored, Math.min(this.nodesExplored * 2, 10000));
                await new Promise(resolve => setTimeout(resolve, 1));
            }
            
            // Prevent infinite search
            if (this.nodesExplored > 100000) {
                this.log('⚠️ Search limit reached. Puzzle may be too complex.', 'warning');
                break;
            }
        }
        
        this.searchTime = Date.now() - startTime;
        this.updateStats();
        return null; // No solution found
    }
    
    async startSolving() {
        if (this.isSolved()) {
            this.log('✅ Puzzle is already solved!', 'info');
            return;
        }
        
        this.isSolving = true;
        this.elements.solveBtn.disabled = true;
        this.elements.stopBtn.disabled = false;
        this.setStatus('Searching... 🔍', 'solving');
        
        this.resetSearch();
        
        const solution = await this.aStar();
        
        if (solution && this.isSolving) {
            this.setStatus('Solution found! 🎯', 'idle');
            this.elements.stopBtn.disabled = true;
            
            // Ask user if they want to see the solution animated
            this.log('🎬 Animating solution...', 'info');
            await this.animateSolution(solution);
        } else if (this.isSolving) {
            this.setStatus('No solution found', 'idle');
            this.log('❌ No solution found within search limits', 'error');
        }
        
        this.isSolving = false;
        this.elements.solveBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
    }
    
    async animateSolution(solution) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        for (let i = 0; i < solution.length && this.isSolving; i++) {
            const move = solution[i];
            
            this.log(`Step ${i + 1}/${solution.length}: Moving tile ${move.tile}`);
            
            // Animate the tile
            this.animateTile(move.to.row, move.to.col);
            
            this.makeMove(move.to.row, move.to.col);
            this.renderPuzzle();
            
            if (this.isSolved()) {
                this.setStatus('Puzzle Solved! 🎉', 'solved');
                this.log('🎉 A* successfully solved the puzzle!', 'success');
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 600));
        }
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
    
    stopSolving() {
        this.isSolving = false;
        this.elements.solveBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.setStatus('Stopped', 'idle');
        this.log('⏹️ Search stopped', 'warning');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SlidingPuzzleAStar();
});
