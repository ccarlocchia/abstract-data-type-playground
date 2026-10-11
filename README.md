# Structure Studio

An interactive data-structure playground built with SvelteKit and Tailwind CSS.

## Playground

The app includes interactive stack, queue, singly linked list, and binary search tree visualizations. Lists support appending nodes and deleting the first matching value. Operations produce immutable animation frames that can be played, paused, stepped through, and scrubbed backward or forward. Each frame includes a state snapshot, a description, and the related pseudocode line. Use the BST's **Balance** action to rebuild its current values into a height-balanced tree.

Framework-independent structure logic lives in `src/core/structures/`, and the playback/history controller is in `src/engine/`. The Svelte renderers and controls are in `src/lib/` and `src/routes/`.

## Develop locally

In **Windows PowerShell**, use `npm.cmd` so PowerShell does not try to run the blocked `npm.ps1` script:

```powershell
npm.cmd install
npm.cmd run dev
```

Run the other npm commands the same way, for example `npm.cmd run check` or `npm.cmd run build`.

In Command Prompt, Git Bash, or macOS/Linux terminals, the usual commands work:

```sh
npm install
npm run dev
```

The PowerShell error is caused by its script execution policy blocking `npm.ps1`; using `npm.cmd` avoids changing that policy.

Run `npm run check` (or `npm.cmd run check` in PowerShell) to check Svelte and TypeScript diagnostics, and `npm run build` (or `npm.cmd run build`) to create the static site in `build/`.

## Deploy to GitHub Pages

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds the static site and deploys it on pushes to `main` or `master` (or when run manually). It sets `BASE_PATH` to the repository name, so the site works from a GitHub Pages project URL such as `https://<owner>.github.io/<repository>/`.

In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

For local production builds, leave `BASE_PATH` unset to build for the root path. To test a project subpath, set `BASE_PATH` to the path segment, for example `/abstract-data-type-playground`.
