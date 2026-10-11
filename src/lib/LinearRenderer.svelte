<script lang="ts">
  import type { LinearSnapshot } from '../core/types';

  let {
    kind,
    snapshot,
    highlights
  }: {
    kind: 'stack' | 'queue';
    snapshot: LinearSnapshot;
    highlights: string[];
  } = $props();

  let items = $derived(kind === 'stack' ? [...snapshot.items].reverse() : snapshot.items);
</script>

<div class="flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 p-6">
  {#if snapshot.items.length === 0}
    <p class="text-sm text-slate-500">Your {kind} is empty. Add a value to get started.</p>
  {:else if kind === 'stack'}
    <div class="flex flex-col items-center gap-2">
      <div class="mb-1 text-xs uppercase tracking-widest text-cyan-300">Top ↑</div>
      {#each items as item (item.id)}
        <div
          class={`grid h-12 w-40 place-items-center rounded-xl border font-mono transition-all duration-300 ${
            highlights.includes(item.id)
              ? 'scale-105 border-cyan-300 bg-cyan-300 text-slate-950'
              : 'border-white/10 bg-slate-800 text-slate-100'
          }`}
        >
          {item.value}
        </div>
      {/each}
      <div class="mt-2 text-xs uppercase tracking-widest text-slate-500">Bottom</div>
    </div>
  {:else}
    <div class="w-full overflow-x-auto">
      <div class="flex min-w-max items-center justify-center gap-3 px-2">
        {#each items as item, index (item.id)}
          <div class="flex items-center gap-3">
            <div class="flex flex-col items-center gap-2">
              <span class={`text-[10px] uppercase tracking-widest ${index === 0 ? 'text-cyan-300' : 'text-slate-600'}`}>
                {index === 0 ? 'Front' : index === items.length - 1 ? 'Back' : ''}
              </span>
              <div
                class={`grid size-14 place-items-center rounded-xl border font-mono transition-all duration-300 ${
                  highlights.includes(item.id)
                    ? 'scale-105 border-cyan-300 bg-cyan-300 text-slate-950'
                    : 'border-white/10 bg-slate-800 text-slate-100'
                }`}
              >
                {item.value}
              </div>
            </div>
            {#if index < items.length - 1}
              <span class="text-slate-600" aria-hidden="true">→</span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
