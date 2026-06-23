// Generalized icon generator — rasterizes a per-app icon-source SVG (templated
// from this submodule's static/icons-template/ on first run) into the PNG
// sizes needed for iOS/Android/favicons.
// Run from the consuming app's root (cwd): node brand-kit/scripts/generate-brand-icons.mjs
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { renderIconTemplate } from './lib/render-icon-template.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const configFlagIndex = args.indexOf('--config');
const configPath = configFlagIndex !== -1
  ? resolve(process.cwd(), args[configFlagIndex + 1])
  : resolve(process.cwd(), 'brand.config.mjs');

const { default: config } = await import(pathToFileURL(configPath).href);

const FONT_CSS_URL = 'https://fonts.googleapis.com/css2?family=Tourney:wght@900&display=swap';

async function getTourneyFont() {
  const cachePath = join(tmpdir(), 'tourney-900.ttf');
  if (existsSync(cachePath)) return cachePath;
  const css = await fetch(FONT_CSS_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then((r) => r.text());
  const fontUrl = css.match(/url\(([^)]+)\)/)[1];
  const buf = await fetch(fontUrl).then((r) => r.arrayBuffer());
  writeFileSync(cachePath, Buffer.from(buf));
  return cachePath;
}

const SIZES = [
  { file: 'favicon-16.png', size: 16 },
  { file: 'favicon-32.png', size: 32 },
  { file: 'icon-72.png', size: 72 },
  { file: 'apple-touch-icon-120.png', size: 120 },
  { file: 'apple-touch-icon-152.png', size: 152 },
  { file: 'apple-touch-icon-167.png', size: 167 },
  { file: 'apple-touch-icon-180.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
];

async function main() {
  const fontPath = await getTourneyFont();

  const dir = resolve(process.cwd(), 'public', 'brand', 'icons', config.appName);
  mkdirSync(dir, { recursive: true });

  const regularPath = join(dir, 'icon-source.svg');
  const maskablePath = join(dir, 'icon-source-maskable.svg');

  if (!existsSync(regularPath)) {
    const template = readFileSync(join(__dirname, '..', 'static', 'icons-template', 'icon-source.svg.template'), 'utf8');
    writeFileSync(regularPath, renderIconTemplate(template, config.wordmark));
  }
  if (!existsSync(maskablePath)) {
    const template = readFileSync(join(__dirname, '..', 'static', 'icons-template', 'icon-source-maskable.svg.template'), 'utf8');
    writeFileSync(maskablePath, renderIconTemplate(template, config.wordmark));
  }

  const regularSvg = readFileSync(regularPath, 'utf8');
  const maskableSvg = readFileSync(maskablePath, 'utf8');

  for (const { file, size } of SIZES) {
    const resvg = new Resvg(regularSvg, {
      fitTo: { mode: 'width', value: size },
      font: { fontFiles: [fontPath], loadSystemFonts: false, defaultFontFamily: 'Tourney' },
    });
    writeFileSync(join(dir, file), resvg.render().asPng());
  }

  const maskable = new Resvg(maskableSvg, {
    fitTo: { mode: 'width', value: 512 },
    font: { fontFiles: [fontPath], loadSystemFonts: false, defaultFontFamily: 'Tourney' },
  });
  writeFileSync(join(dir, 'icon-maskable-512.png'), maskable.render().asPng());

  console.log(`Generated icons for ${config.appName}`);
}

main();
