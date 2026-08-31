import { describe, it, expect } from 'vitest';
import { stronglyConnected, findCycles, cycleEdges } from '../src/lib/tarjan.js';

const ids = comps => comps.map(c => [...c].sort()).sort((a, b) => a[0].localeCompare(b[0]));

describe('strongly connected components', () => {
  it('puts every isolated node in its own component', () => {
    expect(ids(stronglyConnected(['a', 'b', 'c'], []))).toEqual([['a'], ['b'], ['c']]);
  });

  it('does not group a plain chain', () => {
    const g = stronglyConnected(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']]);
    expect(ids(g)).toEqual([['a'], ['b'], ['c']]);
  });

  it('groups a two-node cycle', () => {
    const g = stronglyConnected(['a', 'b'], [['a', 'b'], ['b', 'a']]);
    expect(ids(g)).toEqual([['a', 'b']]);
  });

  it('groups a three-node cycle', () => {
    const g = stronglyConnected(['a', 'b', 'c'], [['a', 'b'], ['b', 'c'], ['c', 'a']]);
    expect(ids(g)).toEqual([['a', 'b', 'c']]);
  });

  it('separates two independent cycles', () => {
    const g = stronglyConnected(
      ['a', 'b', 'c', 'd'],
      [['a', 'b'], ['b', 'a'], ['c', 'd'], ['d', 'c']]
    );
    expect(ids(g)).toEqual([['a', 'b'], ['c', 'd']]);
  });

  // A cross-edge points at a component that is already finished. Counting it as
  // a back-edge is the classic way to get this algorithm wrong, and it would
  // merge two separate cycles into one false report.
  it('ignores cross-edges into a finished component', () => {
    const g = stronglyConnected(
      ['a', 'b', 'c', 'd'],
      [['a', 'b'], ['b', 'a'], ['c', 'd'], ['d', 'c'], ['a', 'c']]
    );
    expect(ids(g)).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('handles a node with no edges at all', () => {
    expect(ids(stronglyConnected(['lonely'], []))).toEqual([['lonely']]);
  });

  // The reason this implementation is iterative: recursion would overflow the
  // call stack on a deep graph and take the whole tab down.
  it('survives a graph deeper than the call stack would allow', () => {
    const n = 20000;
    const nodes = Array.from({ length: n }, (_, i) => `n${i}`);
    const edges = nodes.slice(0, -1).map((node, i) => [node, `n${i + 1}`]);
    expect(() => stronglyConnected(nodes, edges)).not.toThrow();
    expect(stronglyConnected(nodes, edges)).toHaveLength(n);
  });
});

describe('cycles', () => {
  it('reports nothing for an acyclic graph', () => {
    expect(findCycles(['a', 'b', 'c'], [['a', 'b'], ['b', 'c']])).toEqual([]);
  });

  it('reports a real cycle', () => {
    const cycles = findCycles(['a', 'b', 'c'], [['a', 'b'], ['b', 'c'], ['c', 'a']]);
    expect(cycles).toHaveLength(1);
    expect([...cycles[0]].sort()).toEqual(['a', 'b', 'c']);
  });

  // A single node is in a component by itself, which is not a cycle unless it
  // genuinely points at itself. Treating every component as a cycle is the
  // false-positive that made the old regex scanner useless.
  it('does not call a lone node a cycle', () => {
    expect(findCycles(['a'], [])).toEqual([]);
  });

  it('does call a self-dependency a cycle', () => {
    expect(findCycles(['a'], [['a', 'a']])).toEqual([['a']]);
  });

  it('marks only the edges inside a cycle', () => {
    const nodes = ['a', 'b', 'c', 'd'];
    const edges = [['a', 'b'], ['b', 'c'], ['c', 'a'], ['c', 'd']];
    const marked = cycleEdges(nodes, edges);
    expect(marked).toHaveLength(3);
    expect(marked.some(([, to]) => to === 'd')).toBe(false);
  });

  it('is deterministic', () => {
    const nodes = ['a', 'b', 'c', 'd'];
    const edges = [['a', 'b'], ['b', 'c'], ['c', 'a'], ['c', 'd'], ['d', 'b']];
    const once = JSON.stringify(findCycles(nodes, edges).map(c => [...c].sort()));
    for (let i = 0; i < 10; i++) {
      expect(JSON.stringify(findCycles(nodes, edges).map(c => [...c].sort()))).toBe(once);
    }
  });
});
