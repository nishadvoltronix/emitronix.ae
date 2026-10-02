'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { patchNext } = require('../scripts/apply-next-image-response-patch.cjs');
const manifest = require('../patches/next-15.5.27-image-response-socket.json');
const project = path.resolve(__dirname, '..');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'emitronix-patch-test-'));
  const directory = path.join(root, 'node_modules', 'next');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ version: manifest.version }));
  for (const target of manifest.targets) {
    const dest = path.join(directory, target.path);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(project, 'node_modules', 'next', target.path), dest);
  }
  // Both accepted installed states provide the exact official fixture bytes.
  patchNext({ root, mode: 'revert' });
  t.after(() => {
    const temp = fs.realpathSync(os.tmpdir());
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), temp);
    assert.match(path.basename(resolved), /^emitronix-patch-test-/);
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  return { root, directory, files: manifest.targets.map(x => path.join(directory, x.path)) };
}
const digests = f => f.files.map(p => hash(fs.readFileSync(p)));
const originalHashes = manifest.targets.map(t => t.originalSha256);
const patchedHashes = manifest.targets.map(t => t.patchedSha256);

test('applies both reviewed modules and verifies exact patched bytes', t => {
  const f = fixture(t);
  assert.deepEqual(digests(f), originalHashes);
  assert.equal(patchNext({ root: f.root }).changed, true);
  assert.deepEqual(digests(f), patchedHashes);
  assert.equal(patchNext({ root: f.root, mode: 'check' }).state, 'patched');
});
test('repeated installation is idempotent and reversal restores official bytes', t => {
  const f = fixture(t);
  patchNext({ root: f.root });
  assert.equal(patchNext({ root: f.root }).changed, false);
  assert.equal(patchNext({ root: f.root, mode: 'revert' }).changed, true);
  assert.deepEqual(digests(f), originalHashes);
  assert.equal(patchNext({ root: f.root, mode: 'revert' }).changed, false);
});
test('build/start verification refuses an unpatched install', t => {
  const f = fixture(t);
  assert.throws(() => patchNext({ root: f.root, mode: 'check' }), /patch is missing/);
  assert.deepEqual(digests(f), originalHashes);
});
test('a different Next version is rejected without vendor mutation', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.directory, 'package.json'), JSON.stringify({ version: '15.5.28' }));
  assert.throws(() => patchNext({ root: f.root }), /requires Next 15.5.27/);
  assert.deepEqual(digests(f), originalHashes);
});
test('tampering with either module leaves both files untouched', t => {
  for (const index of [0, 1]) {
    const f = fixture(t);
    fs.appendFileSync(f.files[index], '\n// unknown bytes\n');
    const before = digests(f);
    assert.throws(() => patchNext({ root: f.root }), /Unrecognized Next module/);
    assert.deepEqual(digests(f), before);
  }
});
test('mixed patched and original modules fail without a partial repair', t => {
  const f = fixture(t);
  const original = fs.readFileSync(f.files[1]);
  patchNext({ root: f.root });
  fs.writeFileSync(f.files[1], original);
  const before = digests(f);
  assert.throws(() => patchNext({ root: f.root }), /Mixed patched/);
  assert.deepEqual(digests(f), before);
});
test('staging failure preserves both originals and an existing unrelated file', t => {
  const f = fixture(t);
  const collision = `${f.files[1]}.image-response-patch-${process.pid}`;
  fs.writeFileSync(collision, 'retain this file');
  assert.throws(() => patchNext({ root: f.root }), /EEXIST/);
  assert.deepEqual(digests(f), originalHashes);
  assert.equal(fs.readFileSync(collision, 'utf8'), 'retain this file');
  assert.equal(fs.existsSync(`${f.files[0]}.image-response-patch-${process.pid}`), false);
});
test('second replacement failure rolls back the first module', t => {
  const f = fixture(t);
  const rename = fs.renameSync;
  let calls = 0;
  fs.renameSync = (...args) => {
    if (++calls === 2) throw new Error('simulated replacement failure');
    return rename(...args);
  };
  try { assert.throws(() => patchNext({ root: f.root }), /simulated replacement failure/); }
  finally { fs.renameSync = rename; }
  assert.deepEqual(digests(f), originalHashes);
  assert.equal(f.files.some(p => fs.existsSync(`${p}.image-response-patch-${process.pid}`)), false);
});
