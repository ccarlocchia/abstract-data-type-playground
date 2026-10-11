<script lang="ts">
  import { onDestroy } from 'svelte';
  import { BinarySearchTree } from '../core/structures/BinarySearchTree';
  import { LinkedList } from '../core/structures/LinkedList';
  import { Queue } from '../core/structures/Queue';
  import { Stack } from '../core/structures/Stack';
  import type { ADTStructure, AnimationStep, StructureKind, StructureSnapshot } from '../core/types';
  import { AnimationController, type PlaybackState } from '../engine/AnimationController';
  import LinkedListRenderer from '../lib/LinkedListRenderer.svelte';
  import LinearRenderer from '../lib/LinearRenderer.svelte';
  import PseudocodeViewer from '../lib/PseudocodeViewer.svelte';
  import TreeRenderer from '../lib/TreeRenderer.svelte';

  const structureOptions: { id: StructureKind; name: string; description: string }[] = [
    { id: 'stack', name: 'Stack', description: 'Last in, first out' },
    { id: 'queue', name: 'Queue', description: 'First in, first out' },
    { id: 'list', name: 'Linked list', description: 'Nodes connected in sequence' },
    { id: 'bst', name: 'Binary search tree', description: 'Ordered, branching nodes' }
  ];

  const pseudocode = {
    stack: {
      insert: ['item ← value', 'push item onto stack'],
      delete: ['if stack is not empty', 'item ← top of stack', 'pop item from stack']
    },
    queue: {
      insert: ['item ← value', 'enqueue item at back'],
      delete: ['if queue is not empty', 'item ← front of queue', 'dequeue item from front']
    },
    list: {
      insert: ['create a node containing value', 'append node at the tail'],
      delete: [
        'start at the head',
        'compare value; move to next node',
        'if found, link previous to next',
        'remove the matching node'
      ]
    },
    bst: {
      insert: [
        'start at root',
        'if tree is empty, insert root',
        'compare value with current node',
        'if equal, stop',
        'if smaller, go left',
        'if larger, go right'
      ],
      balance: [
        'in-order traverse to collect sorted values',
        'choose the middle value as the root',
        'repeat for the left and right ranges'
      ],
      delete: [
        'start at root',
        'compare value; go left or right',
        'if found, inspect children',
        'if two children, find successor',
        'replace node or connect its child'
      ]
    }
  } satisfies {
    stack: Record<'insert' | 'delete', string[]>;
    queue: Record<'insert' | 'delete', string[]>;
    list: Record<'insert' | 'delete', string[]>;
    bst: Record<'insert' | 'delete' | 'balance', string[]>;
  };

  function makeInitialSnapshot(kind: StructureKind): StructureSnapshot {
    if (kind === 'bst') {
      const tree = new BinarySearchTree();
      for (const value of [18, 10, 25, 6, 14, 22, 31]) tree.insert(value);
      return tree.getData();
    }
    if (kind === 'list') {
      const list = new LinkedList();
      for (const value of [12, 8, 23, 4]) list.insert(value);
      return list.getData();
    }
    return {
      kind: 'linear',
      items: [12, 8, 23, 4].map((value, index) => ({ id: `item-${index + 1}`, value }))
    };
  }

  let selectedStructure = $state<StructureKind>('stack');
  let currentSnapshot = $state<StructureSnapshot>(makeInitialSnapshot('stack'));
  let currentStep = $state<AnimationStep | null>(null);
  let playback = $state<PlaybackState>({ index: 0, total: 0, playing: false });
  let inputValue = $state<number | undefined>(42);
  let speedMs = $state(600);
  let lastAction = $state<'insert' | 'delete' | 'balance'>('insert');
  let errorMessage = $state('');

  const controller = new AnimationController((step, state) => {
    currentStep = step;
    playback = state;
    if (step) currentSnapshot = step.stateSnapshot;
  });

  const activePseudocode = $derived(
    selectedStructure === 'bst' && lastAction === 'balance'
      ? pseudocode.bst.balance
      : pseudocode[selectedStructure][lastAction === 'balance' ? 'insert' : lastAction]
  );

  function selectStructure(kind: StructureKind): void {
    controller.loadSteps([]);
    selectedStructure = kind;
    currentSnapshot = makeInitialSnapshot(kind);
    lastAction = 'insert';
    errorMessage = '';
  }

  function runOperation(action: 'insert' | 'delete'): void {
    errorMessage = '';
    const needsValue = action === 'insert' || selectedStructure === 'bst' || selectedStructure === 'list';
    if (needsValue && (typeof inputValue !== 'number' || !Number.isInteger(inputValue))) {
      errorMessage = 'Enter a whole number before running this operation.';
      return;
    }

    let structure: ADTStructure;
    if (selectedStructure === 'bst') {
      structure = new BinarySearchTree(
        currentSnapshot.kind === 'tree' ? currentSnapshot : undefined
      );
    } else if (selectedStructure === 'list') {
      structure = new LinkedList(
        currentSnapshot.kind === 'list' ? currentSnapshot : undefined
      );
    } else {
      const snapshot = currentSnapshot.kind === 'linear' ? currentSnapshot : undefined;
      structure = selectedStructure === 'stack' ? new Stack(snapshot) : new Queue(snapshot);
    }

    let steps: AnimationStep[];
    if (action === 'insert') {
      if (typeof inputValue !== 'number') {
        errorMessage = 'Enter a whole number before running this operation.';
        return;
      }
      steps = structure.insert(inputValue);
    } else if (selectedStructure === 'bst' || selectedStructure === 'list') {
      if (typeof inputValue !== 'number') {
        errorMessage = `Enter a whole number to delete from the ${selectedStructure === 'bst' ? 'tree' : 'list'}.`;
        return;
      }
      steps = structure.delete(inputValue);
    } else {
      steps = structure.delete();
    }
    lastAction = action;
    controller.loadSteps(steps);
  }

  function balanceTree(): void {
    if (selectedStructure !== 'bst') return;
    const snapshot = currentSnapshot.kind === 'tree' ? currentSnapshot : undefined;
    const tree = new BinarySearchTree(snapshot);
    lastAction = 'balance';
    errorMessage = '';
    controller.loadSteps(tree.balance());
  }

  function togglePlayback(): void {
    if (playback.playing) controller.pause();
    else controller.play(speedMs);
  }

  function updateSpeed(value: number): void {
    speedMs = value;
    if (playback.playing) {
      controller.pause();
      controller.play(speedMs);
    }
  }

  onDestroy(() => controller.pause());
</script>

<svelte:head>
  <title>Structure Studio — Data structure playground</title>
  <meta
    name="description"
    content="Explore stacks, queues, linked lists, and binary search trees with step-by-step algorithm visualizations."
  />
</svelte:head>

<main class="min-h-screen px-5 py-6 text-slate-100 sm:px-8 lg:px-12">
  <div class="mx-auto max-w-7xl">
    <header class="flex items-center justify-between border-b border-white/10 pb-5">
      <a class="flex items-center gap-3 font-semibold tracking-tight" href="#top" aria-label="Structure Studio home">
        <span class="grid size-10 place-items-center rounded-xl bg-cyan-300 text-lg font-black text-slate-950">S</span>
        <span>structure<span class="text-cyan-300">.studio</span></span>
      </a>
      <span class="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-400">ADT PLAYGROUND</span>
    </header>

    <section id="top" class="py-10 sm:py-14">
      <p class="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-300">
        <span class="size-2 rounded-full bg-cyan-300"></span>
        Learn by doing
      </p>
      <div class="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
            Data structures, <span class="text-cyan-300">in motion.</span>
          </h1>
          <p class="mt-4 max-w-2xl leading-7 text-slate-400">
            Run an operation, inspect each algorithm step, and rewind to see how the structure changes.
          </p>
        </div>
        <span class="text-sm text-slate-500">Framework-independent core · Replayable history</span>
      </div>
    </section>

    <section id="playground" class="rounded-3xl border border-white/10 bg-slate-900/50 p-4 sm:p-6 lg:p-8">
      <div class="flex flex-wrap gap-2" aria-label="Choose a data structure">
        {#each structureOptions as option (option.id)}
          <button
            class={`rounded-xl border px-4 py-3 text-left transition ${
              selectedStructure === option.id
                ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-100'
                : 'border-white/10 bg-slate-950/30 text-slate-400 hover:border-white/20 hover:text-slate-200'
            }`}
            aria-pressed={selectedStructure === option.id}
            onclick={() => selectStructure(option.id)}
          >
            <span class="block text-sm font-semibold">{option.name}</span>
            <span class="mt-1 block text-xs opacity-70">{option.description}</span>
          </button>
        {/each}
      </div>

      <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div class="min-w-0">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">
                {structureOptions.find((option) => option.id === selectedStructure)?.name}
              </h2>
              <p class="mt-1 text-xs text-slate-500">
                {selectedStructure === 'stack'
                  ? 'PUSH adds to the top · POP removes from the top'
                  : selectedStructure === 'queue'
                    ? 'ENQUEUE adds to the back · DEQUEUE removes from the front'
                    : selectedStructure === 'list'
                      ? 'APPEND adds a node at the tail · DELETE removes the first matching value'
                    : 'INSERT preserves order · DELETE reconnects the tree'}
              </p>
            </div>
            <span class="rounded-full bg-slate-800 px-3 py-1.5 text-xs text-slate-400">
              {selectedStructure === 'bst'
                ? 'BINARY SEARCH TREE'
                : selectedStructure === 'list'
                  ? 'SINGLY LINKED LIST'
                  : selectedStructure.toUpperCase()}
            </span>
          </div>

          {#if currentSnapshot.kind === 'tree'}
            <TreeRenderer root={currentSnapshot.root} highlights={currentStep?.highlights ?? []} />
          {:else if currentSnapshot.kind === 'list'}
            <LinkedListRenderer head={currentSnapshot.head} highlights={currentStep?.highlights ?? []} />
          {:else}
            <LinearRenderer
              kind={selectedStructure === 'stack' ? 'stack' : 'queue'}
              snapshot={currentSnapshot}
              highlights={currentStep?.highlights ?? []}
            />
          {/if}

          <div class="mt-4 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3" aria-live="polite">
            <p class="text-sm text-slate-300">
              {currentStep?.description ?? 'Choose an operation to see its algorithm steps here.'}
            </p>
          </div>

          <div class="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <button
                  class="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Step backward"
                  title="Step backward"
                  disabled={playback.index === 0 || playback.total === 0}
                  onclick={() => controller.stepBackward()}
                >←</button>
                <button
                  class="grid size-10 place-items-center rounded-xl bg-cyan-300 text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={playback.playing ? 'Pause animation' : 'Play animation'}
                  title={playback.playing ? 'Pause' : 'Play'}
                  disabled={playback.total === 0 || (!playback.playing && playback.index >= playback.total - 1)}
                  onclick={togglePlayback}
                >
                  {playback.playing ? 'Ⅱ' : '▶'}
                </button>
                <button
                  class="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Step forward"
                  title="Step forward"
                  disabled={playback.index >= playback.total - 1 || playback.total === 0}
                  onclick={() => controller.stepForward()}
                >→</button>
              </div>

              <label class="flex items-center gap-3 text-xs text-slate-400">
                Speed
                <input
                  class="accent-cyan-300"
                  type="range"
                  min="150"
                  max="1200"
                  step="50"
                  value={speedMs}
                  oninput={(event) => updateSpeed(Number(event.currentTarget.value))}
                  aria-label="Animation speed"
                />
                <span class="w-14 text-right">{(speedMs / 1000).toFixed(2)}s</span>
              </label>

              <span class="font-mono text-xs text-slate-500">
                {playback.total ? playback.index + 1 : 0} / {playback.total} steps
              </span>
            </div>
            <input
              class="mt-4 w-full accent-cyan-300"
              type="range"
              min="0"
              max={Math.max(playback.total - 1, 0)}
              value={playback.index}
              disabled={playback.total < 2}
              aria-label="Scrub through operation history"
              oninput={(event) => controller.seek(Number(event.currentTarget.value))}
            />
          </div>
        </div>

        <aside class="space-y-5">
          <section class="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <h3 class="font-semibold">Run an operation</h3>
            <p class="mt-1 text-xs leading-5 text-slate-500">
              {selectedStructure === 'bst' || selectedStructure === 'list'
                ? 'Enter an integer to insert or search for and delete.'
                : 'Enter an integer to add. Remove uses the structure’s next item.'}
            </p>
            <label class="mt-4 block text-xs font-medium text-slate-400" for="value-input">Value</label>
            <input
              id="value-input"
              class="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
              type="number"
              step="1"
              bind:value={inputValue}
              placeholder="Enter a whole number"
            />
            {#if errorMessage}
              <p class="mt-2 text-xs text-rose-300" role="alert">{errorMessage}</p>
            {/if}
            <div class={`mt-3 grid gap-2 ${selectedStructure === 'bst' ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <button
                class="rounded-xl bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                onclick={() => runOperation('insert')}
              >
                {selectedStructure === 'stack'
                  ? 'Push'
                  : selectedStructure === 'queue'
                    ? 'Enqueue'
                    : selectedStructure === 'list'
                      ? 'Append'
                      : 'Insert'}
              </button>
              <button
                class="rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                onclick={() => runOperation('delete')}
              >
                {selectedStructure === 'stack'
                  ? 'Pop'
                  : selectedStructure === 'queue'
                    ? 'Dequeue'
                    : selectedStructure === 'list'
                      ? 'Delete value'
                      : 'Delete'}
              </button>
              {#if selectedStructure === 'bst'}
                <button
                  class="rounded-xl border border-cyan-300/30 px-3 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/10"
                  onclick={balanceTree}
                >
                  Balance
                </button>
              {/if}
            </div>
          </section>

          <PseudocodeViewer lines={activePseudocode} activeLine={currentStep?.activeLine} />

          <div class="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
            <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">Operation history</p>
            <p class="mt-2 text-sm text-slate-400">
              {playback.total
                ? `${playback.total} replayable ${playback.total === 1 ? 'step' : 'steps'}`
                : 'Run an operation to create a rewindable history.'}
            </p>
          </div>
        </aside>
      </div>
    </section>

    <footer class="py-8 text-center text-xs text-slate-600">
      Structure Studio · Explore the logic behind the data
    </footer>
  </div>
</main>
