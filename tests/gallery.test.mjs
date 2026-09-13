import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
test('gallery publishes only the approved assets, model renders and relative static runtime', () => {
  const hashes = {
    'classroom_globe.glb': '5177a2fd5c44726043e1d81c7d299edf9ef2af6db35e302e7544ee15abb429d9',
    'flashlight.glb': 'b33ec7f40875e045430c6dfc80f9d8a79ce283951288f3f896cc431f5c7a4dca',
    'earth_day_nasa.webp': '33af0ffcd8250b4c737fa6e99e965af9798260eacf33baa69b0e666fee54384b',
    'earth_night_nasa.webp': '6cc4d37c98ae5cb34c4adede5e6df2e4b8cfb8f5068fe6bb73806e034a1e3f34',
    'moon-solar-system-scope.webp': '9db7655f6a575005e8200714e85f1c1980e9d68609c9efd44a5d9bd7b0c19d08',
  };
  assert.deepEqual(readdirSync(new URL('gallery/assets', root)).sort(), Object.keys(hashes).sort());
  for (const [name, hash] of Object.entries(hashes)) {
    const data = readFileSync(new URL(`gallery/assets/${name}`, root));
    assert.equal(createHash('sha256').update(data).digest('hex'), hash, `Source provenance changed: ${name}`);
    if (name.endsWith('.glb')) {
      assert.equal(data.toString('ascii', 0, 4), 'glTF');
      assert.equal(data.readUInt32LE(8), data.length);
      const gltf = JSON.parse(data.subarray(20, 20 + data.readUInt32LE(12)));
      assert.equal(gltf.nodes.length, 5);
      assert(gltf.meshes.every(mesh => mesh.primitives[0].attributes.POSITION !== undefined));
    }
  }
  const built = spawnSync(process.execPath, ['scripts/build-gallery.mjs'], { cwd: fileURLToPath(root), encoding: 'utf8', windowsHide: true });
  assert.equal(built.status, 0, built.stderr);
  assert.deepEqual(readdirSync(new URL('dist/gallery/', root)).sort(), ['ATTRIBUTION.md', 'LICENSE.txt', 'THREE-LICENSE.txt', 'assets', 'images', 'index.html', 'main.js', 'style.css'].sort());
  const html = readFileSync(new URL('dist/gallery/index.html', root), 'utf8');
  for (const [, path] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (path.startsWith('https:') || path.startsWith('data:') || path === './') continue;
    assert(!path.startsWith('/'), `Breaks GitHub project path: ${path}`);
    assert(readFileSync(new URL(`dist/gallery/${path}`, root)).length > 0);
  }
  for (const id of ['earth', 'moon', 'globe', 'flashlight']) {
    const jpg = readFileSync(new URL(`dist/gallery/images/${id}.jpg`, root));
    assert.equal(jpg.readUInt16BE(0), 0xffd8);
    assert(jpg.length > 10000, `Missing real model render: ${id}`);
  }
  const source = readFileSync(new URL('gallery/main.js', root), 'utf8');
  assert(source.includes('ticket !== generation'), 'Late model loads must be released');
  assert(source.includes('current.dispose()'), 'Switching models must release GPU resources');
  assert(source.includes('webglcontextlost'), 'Lost WebGL context needs a recovery action');
});
