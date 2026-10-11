import type { ADTStructure, AnimationStep, LinearItem, LinearSnapshot } from '../types';

export class Stack implements ADTStructure {
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
        description: `Prepare to push ${value} onto the stack.`,
        activeLine: 1,
        highlights: this.items.length ? [this.items[this.items.length - 1].id] : [],
        action: 'HIGHLIGHT_NODE',
        stateSnapshot: this.getData()
      }
    ];

    this.items.push(item);
    steps.push({
      description: `Push ${value} onto the top of the stack.`,
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
          description: 'The stack is empty, so there is nothing to pop.',
          activeLine: 1,
          highlights: [],
          action: 'COMPLETE',
          stateSnapshot: this.getData()
        }
      ];
    }

    const top = this.items[this.items.length - 1];
    const steps: AnimationStep[] = [
      {
        description: `Select ${top.value} from the top of the stack.`,
        activeLine: 2,
        highlights: [top.id],
        action: 'HIGHLIGHT_NODE',
        stateSnapshot: this.getData()
      }
    ];

    this.items.pop();
    steps.push({
      description: `Pop ${top.value} from the stack.`,
      activeLine: 3,
      highlights: [top.id],
      action: 'REMOVE_NODE',
      stateSnapshot: this.getData()
    });
    return steps;
  }
}
