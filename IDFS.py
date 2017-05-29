from FifteenPuzzle import FifteenPuzzle
from EightPuzzle import EightPuzzle
from Solution import solution

try:
    import Queue as Q  # ver. < 3.0
except ImportError:
    import queue as Q

frontier = Q.LifoQueue()
frontier_metrics = dict()
visited_hashes = dict()

class Node:

    def __init__(self, state, parent):
        self.parent = parent
        self.state = state
        self.G = 0
        self.metric = self.G + state.heuristic()

def IDFS(limit):
    return RIDFS(limit)


def RIDFS(limit):
    if frontier.empty():
        return "failure"
    # get next un-visited node in stack
    u_node = frontier.get()[1]
    while visited_hashes.has_key(u_node.state.hash):
        u_node = frontier.get()[1]
    # u_node.state.toPrint()
    visited_hashes[u_node.state.hash] = True

    if u_node.state.goal_test():
        return solution(u_node)
    
    if limit == 0:
        cutoff_occurred = True
        return "cutoff"

    # else look athe chilren
    cutoff_occurred = False
    
    # gather up the children and push them onto the stack
    # gather up the children
    child_nodes = [Node(p, u_node) for p in u_node.state.children()]
    for c in child_nodes:
        frontier.put((c.metric, c))
        #print "child" + str(c.state.puzzle)
                
    result = RIDFS(limit-1)
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
    root_node = Node(state, False)
    frontier.put((root_node.metric, root_node))
    frontier_metrics[root_node.state.hash] = root_node.metric

    print state.puzzle
    solution = IDFS(limit)
    
    ## =================================================================

if __name__ == '__main__':
    #puzzle = ((14, 13, 11, 15), (4, 1, 6, 10), (12, 16, 8, 7), (9, 5, 3, 2))
    #state = FifteenPuzzle(puzzle)


    puzzle = ((9, 4, 8), (6, 1, 2), (7, 5, 3))
    #puzzle = ((2, 3, 8), (1, 6, 5), (9, 4, 7))
    #puzzle = ((1,2,3), (4,5,6), (7,9,8))
    state = EightPuzzle(puzzle)

    limit = 600
    
    run(state, limit)

    
