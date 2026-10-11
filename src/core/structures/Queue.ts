import type { ADTStructure, AnimationStep, LinearItem, LinearSnapshot } from '../types';

export class Queue implements ADTStructure {
  private items: LinearItem[];
  private nextId: number;

  constructor(snapshot: LinearSnapshot = { kind: 'linear', items: [] }) {
    this.items = snapshot.items.map((item) => ({ ...item }));
    this.nextId = this.items.reduce((nextId, item) => {
      const id = Number(item.id.replace(/^item-/, ''));
      return Number.isInteger(id) ? Math.max(nextId, id + 1) : nextId;
    }, 1);
  }

  getData(): LinearSnapshot {
    return { kind: 'linear', items: this.items.map((item) => ({ ...item })) };
  }

  insert(value: number): AnimationStep[] {
    const item = { id: `item-${this.nextId++}`, value };
    const steps: AnimationStep[] = [
      {
        description: `Prepare to enqueue ${value} at the back of the queue.`,
        activeLine: 1,
        highlights: [],
        action: 'HIGHLIGHT_NODE',
        stateSnapshot: this.getData()
      }
    ];

    this.items.push(item);
    steps.push({
      description: `Enqueue ${value} at the back of the queue.`,
      activeLine: 2,
      highlights: [item.id],
      action: 'INSERT_NODE',
      stateSnapshot: this.getData()
    });
    return steps;
  }

  delete(): AnimationStep[] {
    if (this.items.length === 0) {
      return [
        {
          description: 'The queue is empty, so there is nothing to dequeue.',
          activeLine: 1,
          highlights: [],
          action: 'COMPLETE',
          stateSnapshot: this.getData()
        }
      ];
    }

    const front = this.items[0];
    const steps: AnimationStep[] = [
      {
        description: `Select ${front.value} at the front of the queue.`,
        activeLine: 2,
        highlights: [front.id],
        action: 'HIGHLIGHT_NODE',
        stateSnapshot: this.getData()
      }
    ];

    this.items.shift();
    steps.push({
      description: `Dequeue ${front.value} from the front of the queue.`,
      activeLine: 3,
      highlights: [front.id],
      action: 'REMOVE_NODE',
      stateSnapshot: this.getData()
    });
    return steps;
  }
}
