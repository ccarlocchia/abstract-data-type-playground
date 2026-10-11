Architecture Blueprint: ADT Playground1. High-Level System ArchitectureThe application follows a Model-View-Intent (MVI) / State-Machine Pattern. Because visualization requires predictable, reproducible steps (stepping forward/backward through operations), decoupling the state mutation logic from the UI rendering is critical.Plaintext ┌────────────────────────────────────────────────────────┐
 │                      User Interface                    │
 │  (Control Panel, Speed Slider, Step Buttons, Canvas)   │
 └───────────┬────────────────────────────▲───────────────┘
             │ Dispatches Actions         │ Renders State
             ▼                            │
 ┌────────────────────────────────────────┴───────────────┐
 │                   State Management                     │
 │          (Centralized Store / Animation Engine)        │
 ├────────────────────────────────────────────────────────┤
 │  • Current Data Structure State (Array/Tree/Nodes)     │
 │  • History Log (Stack of states for "Rewind")          │
 │  • Playback Controller (Playing, Paused, Step, Speed)  │
 └───────────┬────────────────────────────▲───────────────┘
             │ Executes Op & Generates    │ Returns Immutable
             ▼ History Frames             │ State Snapshots
 ┌────────────────────────────────────────┴───────────────┐
 │               Data Structure Core Logic                │
 │     (Stack, Queue, BST classes returning operations)   │
 └────────────────────────────────────────────────────────┘
2. Directory Structure RecommendationA clean modular layout using Vite + React (or Svelte):Plaintextadt-playground/
├── public/
├── src/
│   ├── core/                  # Pure data structure logic (Framework-agnostic)
│   │   ├── structures/
│   │   │   ├── Stack.ts
│   │   │   ├── Queue.ts
│   │   │   └── BinarySearchTree.ts
│   │   └── types.ts           # Common interfaces (Node, Operation, Step)
│   │
│   ├── engine/                # Animation & History Controller
│   │   ├── AnimationController.ts  # Manages play/pause/step-through loop
│   │   └── historyStore.ts          # State snapshots for backward stepping
│   │
│   ├── components/            # UI Components
│   │   ├── canvas/
│   │   │   ├── TreeRenderer.tsx     # SVG/Canvas renderer for trees
│   │   │   └── LinearRenderer.tsx   # Renderer for Stacks/Queues
│   │   ├── controls/
│   │   │   ├── PlaybackBar.tsx      # Play, Pause, Step Forward/Back, Slider
│   │   │   └── ActionPanel.tsx      # Push, Pop, Insert, Delete forms
│   │   └── PseudocodeViewer.tsx     # Highlights active code lines
│   │
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
3. Core Component DesignA. The Data Structure Engine (src/core/)Instead of mutating state directly on the UI, actions on data structures should return a list of step-by-step animation frames.For example, inserting into a Binary Search Tree shouldn't just instantly update the tree; it should yield a sequence:Compare value with root. (Highlight root node yellow)Go left/right. (Highlight edge green)Insert new node. (Animate node scaling in)TypeScript Interface Example (src/core/types.ts):TypeScriptexport type AnimationActionType = 
  | 'HIGHLIGHT_NODE' 
  | 'COMPARE' 
  | 'INSERT_NODE' 
  | 'REMOVE_NODE' 
  | 'SWAP';

export interface AnimationStep {
  description: string;
  activeLine?: number; // For the pseudocode viewer
  highlights: string[]; // IDs of nodes currently targeted
  stateSnapshot: any;   // Deep copy of the data structure at this exact step
}

export interface ADTStructure<T> {
  getData(): T;
  // Each operation returns an array of frames for the animation controller to consume
  insert(value: number): AnimationStep[];
  delete(value: number): AnimationStep[];
}
B. The Animation & History Controller (src/engine/)To allow users to scrub backward and forward through an algorithm execution, the controller maintains an array of AnimationStep frames for the current operation.TypeScriptclass AnimationController {
  private steps: AnimationStep[] = [];
  private currentStepIndex: number = 0;
  private isPlaying: boolean = false;
  private timerId: any = null;

  constructor(private onStateChange: (step: AnimationStep) => void) {}

  public loadSteps(steps: AnimationStep[]) {
    this.steps = steps;
    this.currentStepIndex = 0;
    this.onStateChange(this.steps[0]);
  }

  public stepForward() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.onStateChange(this.steps[this.currentStepIndex]);
    } else {
      this.pause();
    }
  }

  public stepBackward() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.onStateChange(this.steps[this.currentStepIndex]);
    }
  }

  public play(speedMs: number = 500) {
    this.isPlaying = true;
    this.timerId = setInterval(() => {
      this.stepForward();
    }, speedMs);
  }

  public pause() {
    this.isPlaying = false;
    clearInterval(this.timerId);
  }
}
C. Rendering Layer (src/components/canvas/)For Stacks & Queues: Simple CSS flexbox/grid containers where items enter and exit with smooth CSS transitions (framer-motion works wonderfully here for list reordering/fading).For Trees (BST / AVL): SVG elements work best. You can compute Cartesian coordinates $(x, y)$ for each node recursively based on its depth and horizontal offset, then render <line> elements for parent-child edges and <circle> / <g> elements for the nodes themselves.4. GitHub Pages Deployment StrategySince GitHub Pages serves static files, setting up continuous deployment via GitHub Actions is clean and free.Create .github/workflows/deploy.yml:YAMLname: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build App
        run: npm run build # Outputs to 'dist'

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
(Note: Ensure your Vite config has the correct base: '/<repo-name>/' property so asset paths resolve properly on GitHub Pages).