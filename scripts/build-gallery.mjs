import { cp, mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const runtime = new URL('plugins/threejs-lab/skills/threejs-studio/package.json', root);
const require = createRequire(runtime);
const { build } = require('esbuild');
const output = new URL('dist/gallery/', root);
await mkdir(output, { recursive: true });
// Explicit public files only: never publish the repo, local sessions or node_modules.
for (const path of ['index.html', 'style.css', 'ATTRIBUTION.md', 'assets', 'catalog.json', 'notices']) {
  await cp(new URL(`gallery/${path}`, root), new URL(path, output), { recursive: true });
}
await cp(new URL('assets/showcase/lab029s/', root), new URL('images/', output), { recursive: true });
await cp(new URL('LICENSE', root), new URL('LICENSE.txt', output));
await cp(new URL('plugins/threejs-lab/skills/threejs-studio/node_modules/three/LICENSE', root), new URL('THREE-LICENSE.txt', output));
await mkdir(new URL('draco/', output), { recursive: true });
for (const file of ['draco_decoder.wasm', 'draco_wasm_wrapper.js']) {
  await cp(new URL(`plugins/threejs-lab/skills/threejs-studio/node_modules/three/examples/jsm/libs/draco/gltf/${file}`, root), new URL(`draco/${file}`, output));
}
await build({
  entryPoints: [fileURLToPath(new URL('gallery/main.js', root))],
  bundle: true, minify: true, format: 'esm', target: 'es2022', legalComments: 'eof',
  nodePaths: [fileURLToPath(new URL('./node_modules', runtime))],
  outfile: fileURLToPath(new URL('main.js', output)),
});
const html = await readFile(new URL('index.html', output), 'utf8');
if (html.includes('src="/')) throw new Error('Gallery URLs must work under the GitHub project path');
console.log('Gallery built: dist/gallery (no external runtime/CDN)');
