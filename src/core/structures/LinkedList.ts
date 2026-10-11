import type {
  ADTStructure,
  AnimationStep,
  LinkedListNodeSnapshot,
  LinkedListSnapshot
} from '../types';

function cloneNode(node: LinkedListNodeSnapshot | null): LinkedListNodeSnapshot | null {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    next: cloneNode(node.next)
  };
}

export class LinkedList implements ADTStructure {
  private head: LinkedListNodeSnapshot | null;
  private nextId: number;

  constructor(snapshot: LinkedListSnapshot = { kind: 'list', head: null }) {
    this.head = cloneNode(snapshot.head);
    this.nextId = this.findNextId(this.head);
  }

  getData(): LinkedListSnapshot {
    return { kind: 'list', head: cloneNode(this.head) };
  }

  insert(value: number): AnimationStep[] {
    const node: LinkedListNodeSnapshot = {
      id: `list-node-${this.nextId++}`,
      value,
      next: null
    };
    const steps: AnimationStep[] = [
      {
        description: `Create a node for ${value} to append at the end of the list.`,
        activeLine: 1,
        highlights: [],
        action: 'HIGHLIGHT_NODE',
        stateSnapshot: this.getData()
      }
    ];

    if (!this.head) {
      this.head = node;
    } else {
      let tail = this.head;
      while (tail.next) tail = tail.next;
      tail.next = node;
    }

    steps.push({
      description: `Append ${value} to the end of the linked list.`,
      activeLine: 2,
      highlights: [node.id],
      action: 'INSERT_NODE',
      stateSnapshot: this.getData()
    });
    return steps;
  }

  delete(value?: number): AnimationStep[] {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      return [
        {
          description: 'Enter a whole number to delete from the list.',
          activeLine: 1,
          highlights: [],
          action: 'COMPLETE',
          stateSnapshot: this.getData()
        }
      ];
    }

    let previous: LinkedListNodeSnapshot | null = null;
    let current = this.head;
    const steps: AnimationStep[] = [];

    while (current && current.value !== value) {
      steps.push({
        description: `Compare ${value} with ${current.value}; move to the next node.`,
        activeLine: 2,
        highlights: [current.id],
        action: 'COMPARE',
        stateSnapshot: this.getData()
      });
      previous = current;
      current = current.next;
    }

    if (!current) {
      steps.push({
        description: `${value} is not in the list, so there is nothing to delete.`,
        activeLine: 2,
        highlights: [],
        action: 'COMPLETE',
        stateSnapshot: this.getData()
      });
      return steps;
    }

    steps.push({
      description: `Found ${value}; unlink this node from the list.`,
      activeLine: 3,
      highlights: [current.id],
      action: 'HIGHLIGHT_NODE',
      stateSnapshot: this.getData()
    });

    if (previous) previous.next = current.next;
    else this.head = current.next;

    steps.push({
      description: `Delete the first node containing ${value}.`,
      activeLine: 4,
      highlights: [current.id],
      action: 'REMOVE_NODE',
      stateSnapshot: this.getData()
    });
    return steps;
  }

  private findNextId(node: LinkedListNodeSnapshot | null): number {
    let nextId = 1;
    let current = node;
    while (current) {
      const id = Number(current.id.replace(/^list-node-/, ''));
      if (Number.isInteger(id)) nextId = Math.max(nextId, id + 1);
      current = current.next;
    }
    return nextId;
  }
}
