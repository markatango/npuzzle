from FifteenPuzzle import FifteenPuzzle
from EightPuzzle import EightPuzzle
from Solution import solution

try:
    import Queue as Q  # ver. < 3.0
except ImportError:
    import queue as Q

class Node:

    def __init__(self, state, parent):
        self.state = state
        self.parent = parent
        self.metric = self.makeMetric()
        
    def makeMetric(self):
        self.G = 0
        self.metric = self.G + state.heuristic()
        
def run(state):
    frontier = Q.PriorityQueue()
    frontier_metrics = dict()
    visited_hashes = dict()
    visited_states = dict()

    root = Node(state, False)

    frontier.put((root.metric, root))
    frontier_metrics[root.state.hash] = root.metric
    
    iteration = 0
    while not frontier.empty():
        u_node = frontier.get()[1]
        assert frontier_metrics.has_key(u_node.state.hash), "Frontier is missing metric"
        
        # Found the goal state?
        if u_node.state.goal_test():
            break
        
        # test if there is a frontier node with smaller metric. If so, 
        # get the next node
        if frontier_metrics[u_node.state.hash] < u_node.metric:
            continue

        # record this node as 'visited'
        visited_hashes[u_node.state.hash] = True
        
        # gather up the children
        child_nodes = [Node(p, u_node) for p in u_node.state.children()]
                    
        for child_node in child_nodes:
            
            # process child if not seen before
             if not visited_hashes.has_key(child_node.state.hash):
                child_node.G =  u_node.G + 1
                child_node.metric = child_node.G + child_node.state.heuristic()

                # if the child is alread in the frontier, check to see which has the lower metric
                # if the child has a lower metric than the node in the frontier, update the
                # hash table and store the child (the matching node with the higher metric will be dropped
                # when tested at the beginning of the while loop)
                if frontier_metrics.has_key(child_node.state.hash):
                    if frontier_metrics[child_node.state.hash] > child_node.metric:
                       # print "metric: " + str(frontier_metrics[child_node.state.hash]) +  " > " + str(child_node.metric)
                        frontier_metrics[child_node.state.hash] = child_node.metric
                        frontier.put((child_node.metric, child_node))
                    # if the child metric is NOT lower than the one in the frontier,  do nothing
                else:
                    # if the child is not in the frontier. put it there
                    frontier_metrics[child_node.state.hash] = child_node.metric
                    frontier.put((child_node.metric, child_node))
                    
        # print str(u_node.G)
        # u_node.state.toPrint()
        iteration += 1
        #print str(frontier.qsize()) + " : " + str(len(frontier_metrics)) + " : " + str(len(visited_hashes))
                
    if u_node.state.goal_test():       
        print "iterations: " + str(iteration) + " : " + "number of solution steps: " +  str(u_node.metric) 
        print puzzle
        solution(u_node)
        
    else:
        print "Search failed"

## =================================================================

if __name__ == '__main__':
    puzzle = ((14, 13, 11, 15), (4, 1, 6, 10), (12, 16, 8, 7), (9, 5, 3, 2))
    state = FifteenPuzzle(puzzle)

    #puzzle = ((9, 4, 8), (6, 1, 2), (7, 5, 3))
    #puzzle = ((2, 3, 8), (1, 6, 5), (9, 4, 7))
    puzzle = ((6, 1, 2), (9, 4, 8), (7, 5, 3))
    state = EightPuzzle(puzzle)
   
    run(state)

    
