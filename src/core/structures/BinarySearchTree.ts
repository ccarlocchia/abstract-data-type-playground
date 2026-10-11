import type { ADTStructure, AnimationStep, TreeNodeSnapshot, TreeSnapshot } from '../types';

function cloneNode(node: TreeNodeSnapshot | null): TreeNodeSnapshot | null {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneNode(node.left),
    right: cloneNode(node.right)
  };
}

export class BinarySearchTree implements ADTStructure {
  private root: TreeNodeSnapshot | null;
  private nextId: number;

  constructor(snapshot: TreeSnapshot = { kind: 'tree', root: null }) {
    this.root = cloneNode(snapshot.root);
    this.nextId = this.findNextId(this.root);
  }

  getData(): TreeSnapshot {
    return { kind: 'tree', root: cloneNode(this.root) };
  }

  insert(value: number): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const newNode: TreeNodeSnapshot = {
      id: `node-${this.nextId++}`,
      value,
      left: null,
      right: null
    };

    if (!this.root) {
      this.root = newNode;
      return [
        {
          description: `Insert ${value} as the root node.`,
          activeLine: 4,
          highlights: [newNode.id],
          action: 'INSERT_NODE',
          stateSnapshot: this.getData()
        }
      ];
    }

    let current = this.root;
    while (true) {
      steps.push({
        description: `Compare ${value} with ${current.value}.`,
        activeLine: 3,
        highlights: [current.id],
        action: 'COMPARE',
        stateSnapshot: this.getData()
      });

      if (value === current.value) {
        steps.push({
          description: `${value} is already in the tree; duplicate values are ignored.`,
          activeLine: 3,
          highlights: [current.id],
          action: 'COMPLETE',
          stateSnapshot: this.getData()
        });
        return steps;
      }

      const direction = value < current.value ? 'left' : 'right';
      const next = current[direction];
      if (!next) {
        current[direction] = newNode;
        steps.push({
          description: `Insert ${value} as the ${direction} child of ${current.value}.`,
          activeLine: direction === 'left' ? 5 : 6,
          highlights: [newNode.id],
          action: 'INSERT_NODE',
          stateSnapshot: this.getData()
        });
        return steps;
      }
      current = next;
    }
  }

  delete(value?: number): AnimationStep[] {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      return [
        {
          description: 'Enter a whole number to delete from the tree.',
          activeLine: 1,
          highlights: [],
          action: 'COMPLETE',
          stateSnapshot: this.getData()
        }
      ];
    }

    const steps: AnimationStep[] = [];
    let parent: TreeNodeSnapshot | null = null;
    let target = this.root;
    let direction: 'left' | 'right' | null = null;

    while (target && target.value !== value) {
      steps.push({
        description: `Compare ${value} with ${target.value}.`,
        activeLine: 2,
        highlights: [target.id],
        action: 'COMPARE',
        stateSnapshot: this.getData()
      });
      parent = target;
      direction = value < target.value ? 'left' : 'right';
      target = target[direction];
    }

    if (!target) {
      steps.push({
        description: `${value} is not in the tree, so there is nothing to delete.`,
        activeLine: 2,
        highlights: [],
        action: 'COMPLETE',
        stateSnapshot: this.getData()
      });
      return steps;
    }

    steps.push({
      description: `Found ${value}. Check its children before removing it.`,
      activeLine: 3,
      highlights: [target.id],
      action: 'HIGHLIGHT_NODE',
      stateSnapshot: this.getData()
    });

    if (target.left && target.right) {
      let successorParent = target;
      let successor = target.right;
      while (successor.left) {
        steps.push({
          description: `Find the in-order successor by moving left from ${successor.value}.`,
          activeLine: 4,
          highlights: [successor.id],
          action: 'COMPARE',
          stateSnapshot: this.getData()
        });
        successorParent = successor;
        successor = successor.left;
      }

      const removedValue = target.value;
      target.value = successor.value;
      successor.value = removedValue;
      steps.push({
        description: `Swap ${removedValue} with its in-order successor ${target.value}.`,
        activeLine: 4,
        highlights: [target.id, successor.id],
        action: 'SWAP',
        stateSnapshot: this.getData()
      });

      if (successorParent === target) {
        successorParent.right = successor.right;
      } else {
        successorParent.left = successor.right;
      }
      steps.push({
        description: `Remove the successor node that now contains ${removedValue}.`,
        activeLine: 5,
        highlights: [successor.id],
        action: 'REMOVE_NODE',
        stateSnapshot: this.getData()
      });
      return steps;
    }

    const child = target.left ?? target.right;
    if (!parent) {
      this.root = child;
    } else if (direction) {
      parent[direction] = child;
    }
    steps.push({
      description: `Remove ${value} and connect its parent to its ${child ? 'child' : 'next node'}.`,
      activeLine: 5,
      highlights: [target.id],
      action: 'REMOVE_NODE',
      stateSnapshot: this.getData()
    });
    return steps;
  }

  balance(): AnimationStep[] {
    if (!this.root) {
      return [
        {
          description: 'The tree is empty, so there is nothing to balance.',
          activeLine: 1,
          highlights: [],
          action: 'COMPLETE',
          stateSnapshot: this.getData()
        }
      ];
    }

    if (this.getHeightIfBalanced(this.root) >= 0) {
      return [
        {
          description: 'The tree is already height-balanced.',
          activeLine: 1,
          highlights: [this.root.id],
          action: 'COMPLETE',
          stateSnapshot: this.getData()
        }
      ];
    }

    const sortedNodes: TreeNodeSnapshot[] = [];
    const collectInOrder = (node: TreeNodeSnapshot | null): void => {
      if (!node) return;
      collectInOrder(node.left);
      sortedNodes.push({ id: node.id, value: node.value, left: null, right: null });
      collectInOrder(node.right);
    };
    collectInOrder(this.root);

    const steps: AnimationStep[] = [];
    this.root = null;

    const rebuild = (
      start: number,
      end: number,
      parent: TreeNodeSnapshot | null,
      direction: 'left' | 'right' | null
    ): void => {
      if (start >= end) return;

      const middle = Math.floor((start + end) / 2);
      const node = sortedNodes[middle];
      if (!parent) {
        this.root = node;
      } else if (direction) {
        parent[direction] = node;
      }

      steps.push({
        description: `Place ${node.value} at the middle of its sorted range${parent ? ` as the ${direction} child of ${parent.value}` : ' as the new root'}.`,
        activeLine: parent ? 3 : 2,
        highlights: [node.id],
        action: 'BALANCE_NODE',
        stateSnapshot: this.getData()
      });

      rebuild(start, middle, node, 'left');
      rebuild(middle + 1, end, node, 'right');
    };

    rebuild(0, sortedNodes.length, null, null);
    return steps;
  }

  private getHeightIfBalanced(node: TreeNodeSnapshot | null): number {
    if (!node) return 0;
    const leftHeight = this.getHeightIfBalanced(node.left);
    if (leftHeight < 0) return -1;
    const rightHeight = this.getHeightIfBalanced(node.right);
    if (rightHeight < 0 || Math.abs(leftHeight - rightHeight) > 1) return -1;
    return Math.max(leftHeight, rightHeight) + 1;
  }

  private findNextId(node: TreeNodeSnapshot | null): number {
    if (!node) return 1;
    const id = Number(node.id.replace(/^node-/, ''));
    return Math.max(
      Number.isInteger(id) ? id + 1 : 1,
      this.findNextId(node.left),
      this.findNextId(node.right)
    );
  }
}
