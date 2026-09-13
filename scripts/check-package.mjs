import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

assert(process.env.npm_execpath, 'Run npm run check:package');
const result = spawnSync(process.execPath, [process.env.npm_execpath, 'pack', '--dry-run', '--json'], { encoding: 'utf8', windowsHide: true });
assert.equal(result.status, 0, result.stderr);
const [pack] = JSON.parse(result.stdout);
const paths = pack.files.map(file => file.path);
assert(!paths.some(path => /(^|\/)(node_modules|output|\.session\.json|\.env)(\/|$)/.test(path)), 'Private or runtime artifacts in package');
assert(paths.includes('plugins/threejs-lab/skills/threejs-studio/package-lock.json'), 'Runtime lockfile missing');
assert(paths.includes('THIRD_PARTY_NOTICES.md') && paths.includes('LICENSE'), 'License notices missing');
assert(pack.unpackedSize < 1024 * 1024, 'Skill package unexpectedly exceeds 1 MB; inspect included files');
console.log(`${pack.entryCount} files; ${pack.size} bytes compressed; no node_modules or review artifacts`);
