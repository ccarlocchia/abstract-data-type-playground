<script lang="ts">
  let {
    lines,
    activeLine
  }: {
    lines: string[];
    activeLine: number | undefined;
  } = $props();
</script>

<div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
  <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Pseudocode</p>
  <ol class="space-y-1 font-mono text-xs leading-6">
    {#each lines as line, index}
      <li
        class={`rounded-lg px-2 ${activeLine === index + 1 ? 'bg-cyan-300/10 text-cyan-200' : 'text-slate-500'}`}
      >
        <span class="mr-3 inline-block w-4 text-right text-slate-600">{index + 1}</span>{line}
      </li>
    {/each}
  </ol>
</div>
