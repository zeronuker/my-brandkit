# claudeborne-brand-kit

Shared ClaudeBorne brand assets + generator tooling, consumed by each app as a git submodule.

## What's in here

- `component/BrandBanner.jsx` — pure presentational React component, imported via Vite `resolve.alias`.
- `component/UpdatePrompt.jsx` — the standard "update available" modal (select current vs. latest build, update now or stay put). Pure presentational, themed via the `--cb-update-*` CSS var contract (see below) — pair with `useUpdate`.
- `component/useUpdate.js` — the hook backing `UpdatePrompt`: tracks the running build's own commit (via `__COMMIT_SHA__`), fetches the waiting build's commit from `build-info.json`, and persists "stay on current build" dismissals to localStorage.
- `static/css/brand.css` — design tokens (CSS vars) + utility classes, served via `vite-plugin-static-copy`.
- `static/logo/logo-mark.svg` / `logo-mark-light.svg` — logo mark, served via `vite-plugin-static-copy`.
- `static/icons-template/*.template` — wordmark-templated source SVGs for app icon generation (`{{LINE1}}` / `{{LINE2}}` placeholders).
- `scripts/download-fonts.mjs` — downloads Google Fonts to the *consuming app's* `public/fonts/` + writes that app's `public/brand/fonts.css`. Font lists differ per app, so this is a generator, not a shared static asset.
- `scripts/generate-brand-icons.mjs` — templates (on first run) and rasterizes a per-app icon set into that app's `public/brand/icons/<appName>/`.
- `scripts/commit-sha.mjs` / `scripts/write-build-info.mjs` — write that app's `public/build-info.json` before every build (dev and prod), so `useUpdate` can learn a waiting update's commit. Paths resolve against `process.cwd()`, so these run correctly from any consuming app's root.

Fonts and rasterized icons are NOT shared static files — each app's font list and wordmark differ, so only the generator tooling is shared.

## Consuming this in an app

1. Add as a submodule at the app's repo root:
   ```
   git submodule add <path-or-url> brand-kit
   ```
2. Install the static-copy plugin: `npm install vite-plugin-static-copy@3.4.0 --save-dev`
3. Add a `brand.config.mjs` at the app root:
   ```js
   export default {
     appName: 'myapp',
     wordmark: { line1: 'My', line2: 'App' },
     fonts: [
       { family: 'Tourney', slug: 'tourney', weights: [500, 700, 900] },
       // ...
     ],
   }
   ```
4. Wire `vite.config.js`:
   ```js
   import { viteStaticCopy } from 'vite-plugin-static-copy'
   import { resolve } from 'path'

   resolve: {
     alias: { '@brand/BrandBanner': resolve(__dirname, 'brand-kit/component/BrandBanner.jsx') },
   },
   plugins: [
     viteStaticCopy({
       targets: [
         { src: 'brand-kit/static/css/brand.css', dest: 'brand' },
         { src: 'brand-kit/static/logo/logo-mark.svg', dest: 'brand' },
         { src: 'brand-kit/static/logo/logo-mark-light.svg', dest: 'brand' },
       ],
     }),
   ],
   ```
5. `import BrandBanner from '@brand/BrandBanner'`
6. Add npm scripts:
   ```json
   "brand:fonts": "node brand-kit/scripts/download-fonts.mjs",
   "brand:icons": "node brand-kit/scripts/generate-brand-icons.mjs"
   ```
7. Run `npm run brand:fonts && npm run brand:icons` once to generate that app's local `public/brand/fonts.css`, `public/fonts/**`, and `public/brand/icons/<appName>/**`.

## Adding the standard update modal

Requires `vite-plugin-pwa` already configured with `registerType: 'prompt'` (`manifest: false` if you're supplying your own, same as the brand setup above).

1. Add the two aliases to `vite.config.js`'s existing `resolve.alias` block:
   ```js
   '@brand/UpdatePrompt': resolve(__dirname, 'brand-kit/component/UpdatePrompt.jsx'),
   '@brand/useUpdate':    resolve(__dirname, 'brand-kit/component/useUpdate.js'),
   ```
2. Add the commit-sha define, next to your other `defineConfig` options:
   ```js
   define: {
     __COMMIT_SHA__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA || 'dev'),
   },
   ```
3. If your workbox `globPatterns` includes the `json` extension, exclude the generated build-info file so it's never served stale from the precache:
   ```js
   workbox: { globIgnores: ['build-info.json'] }
   ```
4. Add npm scripts (build-info must be written before both dev and build):
   ```json
   "dev":   "node brand-kit/scripts/write-build-info.mjs && vite",
   "build": "node brand-kit/scripts/write-build-info.mjs && vite build",
   ```
5. Add `public/build-info.json` to `.gitignore` — it's regenerated every run.
6. In your top-level App component:
   ```js
   import UpdatePrompt from '@brand/UpdatePrompt'
   import { useUpdate } from '@brand/useUpdate'

   const update = useUpdate('myapp') // short app id — namespaces the dismissal localStorage key

   // ...
   <UpdatePrompt ready={!showSplash} update={update} appLabel="MY APP FULL NAME" />
   ```
7. If your app has a runtime-customizable accent color (a user-selectable theme), alias the contract var so the modal matches it instead of the static brand mint — add one line to your own theme CSS:
   ```css
   :root { --cb-update-accent: var(--your-app-accent-var); }
   ```
   Apps without customizable theming need no override — `--cb-update-accent` defaults to `--cb-mint` from `brand.css`.
8. For a Settings screen "App Update" section (recommended, but not part of the shared component since every app's Settings UI is structured differently), read `update.current.version`, `update.needRefresh`, `update.checkingUpdate`, `update.updateChecked`, `update.checkForUpdate`, and `update.updateServiceWorker` to build a CHECK FOR UPDATES / UPDATE NOW control and a persistent dot badge on the settings icon while `update.needRefresh` is true.

## Editing the brand

Edit `component/BrandBanner.jsx`, `component/UpdatePrompt.jsx`, `component/useUpdate.js`, `static/css/brand.css`, or the logo SVGs in this repo, commit, then in each consuming app run `git submodule update --remote brand-kit` (or `cd brand-kit && git pull`) to pick up the change everywhere.
