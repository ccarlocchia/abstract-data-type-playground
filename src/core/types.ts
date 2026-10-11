export type StructureKind = 'stack' | 'queue' | 'list' | 'bst';

export interface LinearItem {
  id: string;
  value: number;
}

export interface LinearSnapshot {
  kind: 'linear';
  items: LinearItem[];
}

export interface TreeNodeSnapshot {
  id: string;
  value: number;
  left: TreeNodeSnapshot | null;
  right: TreeNodeSnapshot | null;
}

export interface TreeSnapshot {
  kind: 'tree';
  root: TreeNodeSnapshot | null;
}

export interface LinkedListNodeSnapshot {
  id: string;
  value: number;
  next: LinkedListNodeSnapshot | null;
}

export interface LinkedListSnapshot {
  kind: 'list';
  head: LinkedListNodeSnapshot | null;
}

export type StructureSnapshot = LinearSnapshot | LinkedListSnapshot | TreeSnapshot;
export type AnimationActionType =
  | 'HIGHLIGHT_NODE'
  | 'COMPARE'
  | 'INSERT_NODE'
  | 'REMOVE_NODE'
  | 'SWAP'
  | 'BALANCE_NODE'
  | 'COMPLETE';

export interface AnimationStep {
  description: string;
  activeLine?: number;
  highlights: string[];
  action: AnimationActionType;
  stateSnapshot: StructureSnapshot;
}

export interface ADTStructure {
  getData(): StructureSnapshot;
  insert(value: number): AnimationStep[];
  delete(value?: number): AnimationStep[];
}
