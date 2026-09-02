// tarjan.js
// Strongly connected components, by Tarjan's algorithm.
//
// This is the real thing, not a demo approximation. It is the algorithm behind
// the cycle scanner Rheana built at Iosys, which took false positives from 88%
// to zero across 457 projects - the regex version it replaced could only see
// text, so it flagged anything that mentioned a module as depending on it.
//
// The idea: walk the graph depth-first, and give every node two numbers. `index`
// is when it was first seen. `low` is the earliest node reachable from it,
// including by one back-edge. If a node finishes its walk with low === index,
// nothing under it reached any further back, so that node and everything still
// on the stack beneath it form one strongly connected component.
//
// A component of more than one node is a cycle. A single node is only a cycle
// if it depends on itself.
//
// Iterative rather than recursive on purpose: a deep graph would blow the call
// stack, and a portfolio page must never take the tab down.

/**
 * @param {string[]} nodes
 * @param {Array<[string,string]>} edges  from -> to
 * @returns {string[][]} components, each an array of node ids
 */
export function stronglyConnected(nodes, edges) {
  const adjacency = new Map(nodes.map(n => [n, []]));
  for (const [from, to] of edges) {
    if (adjacency.has(from) && adjacency.has(to)) adjacency.get(from).push(to);
  }

  const index = new Map();
  const low = new Map();
  const onStack = new Set();
  const stack = [];
  const components = [];
  let counter = 0;

  for (const root of nodes) {
    if (index.has(root)) continue;

    // Each frame is [node, position in that node's neighbour list].
    const work = [[root, 0]];

    while (work.length) {
      const frame = work[work.length - 1];
      const [node] = frame;

      if (frame[1] === 0) {
        index.set(node, counter);
        low.set(node, counter);
        counter += 1;
        stack.push(node);
        onStack.add(node);
      }

      const neighbours = adjacency.get(node);
      let descended = false;

      while (frame[1] < neighbours.length) {
        const next = neighbours[frame[1]];
        frame[1] += 1;

        if (!index.has(next)) {
          work.push([next, 0]);
          descended = true;
          break;
        }
        // A back-edge to a node still on the stack means `next` is part of the
        // same component; ignore cross-edges to finished components.
        if (onStack.has(next)) {
          low.set(node, Math.min(low.get(node), index.get(next)));
        }
      }

      if (descended) continue;

      // Finished this node. Carry its low value up to its parent.
      if (low.get(node) === index.get(node)) {
        const component = [];
        let popped;
        do {
          popped = stack.pop();
          onStack.delete(popped);
          component.push(popped);
        } while (popped !== node);
        components.push(component);
      }

      work.pop();
      const parent = work[work.length - 1];
      if (parent) {
        low.set(parent[0], Math.min(low.get(parent[0]), low.get(node)));
      }
    }
  }

  return components;
}

/**
 * The components that are actually cycles.
 *
 * Every node is trivially in a component of its own, so a component only counts
 * as a cycle if it has more than one member, or if it is a single node that
 * depends on itself.
 */
export function findCycles(nodes, edges) {
  const selfEdges = new Set(edges.filter(([a, b]) => a === b).map(([a]) => a));
  return stronglyConnected(nodes, edges)
    .filter(c => c.length > 1 || selfEdges.has(c[0]));
}

/** Every edge that takes part in a cycle, for highlighting. */
export function cycleEdges(nodes, edges) {
  const inCycle = new Set();
  for (const component of findCycles(nodes, edges)) {
    for (const node of component) inCycle.add(node);
  }
  return edges.filter(([from, to]) => inCycle.has(from) && inCycle.has(to));
}
