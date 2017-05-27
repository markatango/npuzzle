try:
    import Queue as Q  # ver. < 3.0
except ImportError:
    import queue as Q
    

def solution(finalNode):
# build the solution list
    solution = Q.LifoQueue()
    node = finalNode
    while node.parent:
        solution.put(node.state)
        node = node.parent
    while not solution.empty():
        s = solution.get()
        s.toPrint()
