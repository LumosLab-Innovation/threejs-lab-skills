import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
test('gallery publishes only the approved assets, model renders and relative static runtime', () => {
  const catalog = JSON.parse(readFileSync(new URL('gallery/catalog.json', root)));
  assert.equal(catalog.models.length, 43, 'The requested Lab029s collection must not shrink to a few examples');
  assert.equal(new Set(catalog.models.map(model => model.id)).size, catalog.models.length);
  for (const model of catalog.models) assert(catalog.assets[model.file], `Missing source: ${model.id}`);
  assert.deepEqual(readdirSync(new URL('gallery/assets', root)).sort(), Object.keys(catalog.assets).sort());
  for (const [name, asset] of Object.entries(catalog.assets)) {
    const data = readFileSync(new URL(`gallery/assets/${name}`, root));
    assert.equal(data.length, asset.bytes);
    assert.equal(createHash('sha256').update(data).digest('hex'), asset.sha256, `Source provenance changed: ${name}`);
    if (name.endsWith('.glb')) {
      assert.equal(data.toString('ascii', 0, 4), 'glTF');
      assert.equal(data.readUInt32LE(8), data.length);
      const gltf = JSON.parse(data.subarray(20, 20 + data.readUInt32LE(12)));
      assert(gltf.nodes.length > 0);
      assert(gltf.meshes.every(mesh => mesh.primitives[0].attributes.POSITION !== undefined));
    }
  }
  const built = spawnSync(process.execPath, ['scripts/build-gallery.mjs'], { cwd: fileURLToPath(root), encoding: 'utf8', windowsHide: true });
  assert.equal(built.status, 0, built.stderr);
  assert.deepEqual(readdirSync(new URL('dist/gallery/', root)).sort(), ['ATTRIBUTION.md', 'LICENSE.txt', 'THREE-LICENSE.txt', 'assets', 'catalog.json', 'draco', 'images', 'index.html', 'main.js', 'notices', 'style.css'].sort());
  assert.equal(readFileSync(new URL('dist/gallery/draco/draco_decoder.wasm', root)).readUInt32LE(0), 0x6d736100);
  assert(readFileSync(new URL('dist/gallery/draco/draco_wasm_wrapper.js', root)).length > 1000);
  assert(readFileSync(new URL('dist/gallery/notices/DRACO-LICENSE.txt', root), 'utf8').includes('Apache License'));
  const html = readFileSync(new URL('dist/gallery/index.html', root), 'utf8');
  for (const [, path] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (path.startsWith('https:') || path.startsWith('data:') || path === './') continue;
    assert(!path.startsWith('/'), `Breaks GitHub project path: ${path}`);
    assert(readFileSync(new URL(`dist/gallery/${path}`, root)).length > 0);
  }
  for (const { id } of catalog.models) {
    const jpg = readFileSync(new URL(`dist/gallery/images/${id}.jpg`, root));
    assert.equal(jpg.readUInt16BE(0), 0xffd8);
    assert(jpg.length > 10000, `Missing real model render: ${id}`);
  }
  const source = readFileSync(new URL('gallery/main.js', root), 'utf8');
  assert(source.includes('ticket !== generation'), 'Late model loads must be released');
  assert(source.includes('current.dispose()'), 'Switching models must release GPU resources');
  assert(source.includes('webglcontextlost'), 'Lost WebGL context needs a recovery action');
});
