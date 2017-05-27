from FifteenPuzzle import FifteenPuzzle
from EightPuzzle import EightPuzzle
from Solution import solution

try:
    import Queue as Q  # ver. < 3.0
except ImportError:
    import queue as Q

class Node:

    def __init__(self, state, parent):
        self.parent = parent
        self.state = state
        self.G = 0
        self.metric = self.G + state.heuristic()

def DFS(state, limit):
    return RDFS(Node(state, False), limit)

def RDFS(node, limit):
    node.state.toPrint()
    print limit
    if state.goal_test():
        return solution(node)
    
    if limit == 0:
         cutoff_occurred = True
         return "cutoff"
    cutoff_occurred = False
    
    # gather up the children
    child_nodes = [Node(p, node) for p in node.state.children()]
                
    for child_node in child_nodes:
        result = RDFS(child_node, limit-1)
        if result == "cutoff":
            cutoff_occurred = True
        else:
            if not result == "failure":
                return result
    if cutoff_occurred:
        return "cutoff"
    else:
        return "failure"
            
            

def run(state, limit):
    DFS(state, limit)
    
    ## =================================================================

if __name__ == '__main__':
    #puzzle = ((14, 13, 11, 15), (4, 1, 6, 10), (12, 16, 8, 7), (9, 5, 3, 2))
    #state = FifteenPuzzle(puzzle)


    #puzzle = ((9, 4, 8), (6, 1, 2), (7, 5, 3))
    puzzle = ((2, 3, 8), (1, 6, 5), (9, 4, 7))
    state = EightPuzzle(puzzle)

    limit = 5
   
    run(state, limit)

    
