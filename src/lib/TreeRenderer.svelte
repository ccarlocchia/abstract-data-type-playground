<script lang="ts">
  import type { TreeNodeSnapshot } from '../core/types';

  interface PositionedNode {
    id: string;
    value: number;
    x: number;
    y: number;
    parentId: string | null;
  }

  let {
    root,
    highlights
  }: {
    root: TreeNodeSnapshot | null;
    highlights: string[];
  } = $props();

  let nodes = $derived.by(() => {
    const result: PositionedNode[] = [];
    let inorderIndex = 0;

    function place(node: TreeNodeSnapshot | null, depth: number, parentId: string | null): void {
      if (!node) return;
      place(node.left, depth + 1, node.id);
      result.push({
        id: node.id,
        value: node.value,
        x: 40 + inorderIndex++ * 88,
        y: 42 + depth * 78,
        parentId
      });
      place(node.right, depth + 1, node.id);
    }

    place(root, 0, null);
    return result;
  });

  let width = $derived(Math.max(640, nodes.length * 88 + 40));
  let height = $derived(Math.max(280, ...nodes.map((node) => node.y + 42)));
</script>

<div class="min-h-64 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/40 p-4">
  {#if !root}
    <div class="grid min-h-56 place-items-center text-sm text-slate-500">
      Your tree is empty. Insert a value to create its root.
    </div>
  {:else}
    <svg
      class="mx-auto block"
      {width}
      {height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Binary search tree visualization"
    >
      {#each nodes.filter((node) => node.parentId) as node (node.id)}
        {@const parent = nodes.find((candidate) => candidate.id === node.parentId)}
        {#if parent}
          <line
            x1={parent.x}
            y1={parent.y}
            x2={node.x}
            y2={node.y}
            class:stroke-cyan-300={highlights.includes(parent.id) || highlights.includes(node.id)}
            class:stroke-slate-700={!highlights.includes(parent.id) && !highlights.includes(node.id)}
            stroke-width="2"
          />
        {/if}
      {/each}
      {#each nodes as node (node.id)}
        <g class="transition-all duration-300">
          <circle
            cx={node.x}
            cy={node.y}
            r="22"
            class:fill-cyan-300={highlights.includes(node.id)}
            class:stroke-cyan-300={highlights.includes(node.id)}
            class:fill-slate-800={!highlights.includes(node.id)}
            class:stroke-slate-600={!highlights.includes(node.id)}
            stroke-width="2"
          />
          <text
            x={node.x}
            y={node.y + 5}
            text-anchor="middle"
            class:fill-slate-950={highlights.includes(node.id)}
            class:fill-slate-100={!highlights.includes(node.id)}
            class="font-mono text-sm"
          >
            {node.value}
          </text>
        </g>
      {/each}
    </svg>
  {/if}
</div>
