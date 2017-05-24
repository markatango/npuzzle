import FifteenPuzzle as ep
try:
    import Queue as Q  # ver. < 3.0
except ImportError:
    import queue as Q



class Node:

    def __init__(self, puzzleObject):
        self.puzzleObject = puzzleObject
        self.G = 0
        self.metric = self.G + self.puzzleObject.heuristic()
        
    def incG(self):
        self.G += 1


if __name__ == '__main__':

    
    puzzle = ((2, 6, 8, 12), (5, 1, 3, 4),(16, 10, 7, 11), (9, 13, 15, 14) )
    puzzleObject = ep.FifteenPuzzle(puzzle)
    root = Node(puzzleObject)

    frontier = Q.PriorityQueue()
    visited = []
    frontier.put((root.metric, root))
    iteration = 0
    while not frontier.empty():
        u = frontier.get()[1] # strip off the queue metric
        visited.append(u.puzzleObject.puzzle) # store Nodes 
        if u.puzzleObject.goal_test():
            break

        # select the unvisited children and update the metrics
        child_nodes = [Node(p) for p in u.puzzleObject.children()]
        unvisited = list(filter(lambda child: not child.puzzleObject.puzzle in visited, child_nodes))
        
        for p in unvisited:
            p.incG()
            p.metric = p.G + p.puzzleObject.heuristic()

        # build the queue entries by pre-pending the metric to the node
        pentries = zip([p.metric for p in unvisited],[p for p in unvisited])

        map(frontier.put, pentries)
        iteration += 1
        u.puzzleObject.toPrint()
        
    if u.puzzleObject.goal_test():
        print iteration
        print "ta-da"
        print u.metric
        u.puzzleObject.toPrint()
        print "ta-da"
    else:
        print "Search failed"

    
    
        
        

    
