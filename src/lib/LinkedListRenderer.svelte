<script lang="ts">
  import type { LinkedListNodeSnapshot } from '../core/types';

  let {
    head,
    highlights
  }: {
    head: LinkedListNodeSnapshot | null;
    highlights: string[];
  } = $props();

  let nodes = $derived.by(() => {
    const result: LinkedListNodeSnapshot[] = [];
    let current = head;
    while (current) {
      result.push(current);
      current = current.next;
    }
    return result;
  });
</script>

<div class="flex min-h-64 items-center justify-center overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/40 p-6">
  {#if nodes.length === 0}
    <p class="text-sm text-slate-500">Your list is empty. Append a value to get started.</p>
  {:else}
    <div class="flex min-w-max items-center gap-3 px-2">
      {#each nodes as node, index (node.id)}
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-center gap-2">
            <span class={`text-[10px] uppercase tracking-widest ${index === 0 ? 'text-cyan-300' : 'text-slate-600'}`}>
              {index === 0 ? 'Head' : ''}
            </span>
            <div
              class={`grid size-14 place-items-center rounded-xl border font-mono transition-all duration-300 ${
                highlights.includes(node.id)
                  ? 'scale-105 border-cyan-300 bg-cyan-300 text-slate-950'
                  : 'border-white/10 bg-slate-800 text-slate-100'
              }`}
            >
              {node.value}
            </div>
          </div>
          {#if node.next}
            <span class="text-cyan-300" aria-label="points to next node">→</span>
          {:else}
            <span class="font-mono text-xs text-slate-500">null</span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
