# claudeborne-brand-kit

Shared ClaudeBorne brand assets + generator tooling, consumed by each app as a git submodule.

## What's in here

- `component/BrandBanner.jsx` — pure presentational React component, imported via Vite `resolve.alias`.
- `static/css/brand.css` — design tokens (CSS vars) + utility classes, served via `vite-plugin-static-copy`.
- `static/logo/logo-mark.svg` / `logo-mark-light.svg` — logo mark, served via `vite-plugin-static-copy`.
- `static/icons-template/*.template` — wordmark-templated source SVGs for app icon generation (`{{LINE1}}` / `{{LINE2}}` placeholders).
- `scripts/download-fonts.mjs` — downloads Google Fonts to the *consuming app's* `public/fonts/` + writes that app's `public/brand/fonts.css`. Font lists differ per app, so this is a generator, not a shared static asset.
- `scripts/generate-brand-icons.mjs` — templates (on first run) and rasterizes a per-app icon set into that app's `public/brand/icons/<appName>/`.

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

## Editing the brand

Edit `component/BrandBanner.jsx`, `static/css/brand.css`, or the logo SVGs in this repo, commit, then in each consuming app run `git submodule update --remote brand-kit` (or `cd brand-kit && git pull`) to pick up the change everywhere.
