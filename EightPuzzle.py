import numpy as np
import random as r
from itertools import compress


class EightPuzzle:

    goal = [[1,2,3],[4,5,6],[7,8,9]]
    blank = 9
    N = 0
    tiles = []
    visited_puzzles = []

    def __init__(self, puzzle):
        
        EightPuzzle.N = len(puzzle)
        n_tiles = EightPuzzle.N * EightPuzzle.N
        EightPuzzle.tiles = [x + 1 for x in range(n_tiles)][:n_tiles-1]
        
        self.puzzle = self.validatePuzzle(puzzle)        
        self.movable_tiles = self.movables()
        self.hash = hash(puzzle)
                
    def validatePuzzle(self, puzzle):
        """confirm puzzle satisfies necessary criteria, listed below"""
        
        # more than one row
        assert len(puzzle) > 1, "Puzzle has fewer than 2 rows"
        
        # squareness
        isSquare = True
        n_row = len(puzzle)
        for n in range(n_row):
            if len(puzzle[n]) != n_row:
                is_square = False
                break
        assert isSquare, "Puzzle is not square"
            
        # continguous and distinct
        indArray = np.array([0 for i in range(EightPuzzle.N * EightPuzzle.N)])
        
        for n in range(EightPuzzle.N): #0,1,2,3
            for c in puzzle[n]:
                indArray[c-1] = 1
        if all(indArray):
            return puzzle
        assert all(indArray), "Puzzle has missing or duplicate tiles"
            
    def toPrint(self):
        """Simple print puzzle"""
        print self.puzzle

    def find_row(self, puzzle, tile):
        """Find which row the tile is in. Row numbers start at '1'."""
        res = False
        for r in range(EightPuzzle.N):
            if tile in puzzle[r]:
                res = r+1
                break
        if res > EightPuzzle.N:
            print "can't find tile in puzzle"
        return res

    def find_col(self, puzzle, tile):
        """find which column the tile is in."""
        row = self.find_row(puzzle, tile)
        return puzzle[row-1].index(tile) + 1

    def tile_distance(self, tile):
        """Compute manhattan distance one out of place tile"""
        return abs(self.find_row(EightPuzzle.goal, tile) - self.find_row(self.puzzle, tile)) + \
               abs(self.find_col(EightPuzzle.goal, tile) - self.find_col(self.puzzle, tile))

    def distance_between(self, tile1, tile2):
        """Compute manhattan distance between two tiles"""
        return abs(self.find_row(self.puzzle, tile1) - self.find_row(self.puzzle, tile2)) + \
               abs(self.find_col(self.puzzle, tile1) - self.find_col(self.puzzle, tile2))
               
    def heuristic(self):
        """Compute total manhattan distances of all out of place tiles"""
        return sum(map(self.tile_distance, EightPuzzle.tiles))

    def goal_test(self):
        """Test if goal has been reached"""
        return self.heuristic() == 0

    def movables(self):
        """Produce list of tiles that can change places with the blank"""
        movable_tiles = []
        for t in EightPuzzle.tiles:
            if self.distance_between(t, EightPuzzle.blank) == 1:
                movable_tiles.append(t)
        return movable_tiles

    def getTileIndex(self, tile):
        """Returns tuple with (row, col) index of tile"""
        temp_puzzle = np.array(self.puzzle)
        index = np.transpose(np.array(np.where(temp_puzzle == tile)))[0]
        return (index[0],index[1])

    def swapTiles(self, tile1, tile2):
        """Produce a puzzle that has the two tiles swapped"""
        assert self.distance_between(tile1, tile2) == 1, "Trying to swap two tiles that are too far apart"
        temp_puzzle = np.array(self.puzzle)

        tindex1 = self.getTileIndex(tile1)
        tindex2 = self.getTileIndex(tile2)
        temp_puzzle[tindex1] = tile2
        temp_puzzle[tindex2] = tile1
        return tuple(map(tuple, temp_puzzle))

    def possiblePuzzles(self):
        return [self.swapTiles(t1, EightPuzzle.blank) for t1 in self.movable_tiles]

    def children(self):
        return [EightPuzzle(p) for p in self.possiblePuzzles()]

   
            
# ===================================================================================

if __name__ == '__main__':
    puzzle = ((1,2,3),(4,5,6),(7,8,9))
    ep = EightPuzzle(puzzle)
    while True:
        eps = ep.children()
        ep = eps[np.random.choice(range(len(eps)))]
        print ep.puzzle
        
    
   
    

    
    
