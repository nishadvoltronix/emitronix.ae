'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { patchNextHydrationReplay } = require('../scripts/apply-next-hydration-replay-patch.cjs');
const manifest = require('../patches/next-15.5.27-hydration-replay-manifest.json');
const project = path.resolve(__dirname, '..');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const originalHashes = manifest.targets.map(target => target.originalSha256);
const patchedHashes = manifest.targets.map(target => target.patchedSha256);
const stagingPath = filename => `${filename}.hydration-replay-patch-${process.pid}`;

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'emitronix-hydration-patch-test-'));
  const directory = path.join(root, 'node_modules', 'next');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ version: manifest.version }));
  const rendererPackage = fs.readFileSync(path.join(project, 'node_modules', 'next', 'dist/compiled/react-dom/package.json'));
  assert.equal(JSON.parse(rendererPackage).peerDependencies.react, manifest.rendererVersion);
  fs.mkdirSync(path.join(directory, 'dist/compiled/react-dom'), { recursive: true });
  fs.writeFileSync(path.join(directory, 'dist/compiled/react-dom/package.json'), rendererPackage);
  for (const target of manifest.targets) {
    const installed = fs.readFileSync(path.join(project, 'node_modules', 'next', target.path));
    assert.ok([target.originalSha256, target.patchedSha256].includes(sha256(installed)), `Unrecognized installed fixture source: ${target.path}`);
    const filename = path.join(directory, target.path);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, installed);
  }
  // Normalize only the disposable fixture; never patch the actual installation.
  patchNextHydrationReplay({ root, mode: 'revert' });
  t.after(() => {
    const temporaryRoot = fs.realpathSync(os.tmpdir());
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), temporaryRoot);
    assert.match(path.basename(resolved), /^emitronix-hydration-patch-test-/);
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  return { root, directory, files: manifest.targets.map(target => path.join(directory, target.path)) };
}
const digests = fixture => fixture.files.map(filename => sha256(fs.readFileSync(filename)));
const assertNoStagingFiles = fixture => assert.equal(fixture.files.some(filename => fs.existsSync(stagingPath(filename))), false);

function assertFailsWithoutWrites(fixture, action, expected) {
  const before = digests(fixture);
  const mutations = [];
  const originals = {};
  for (const name of ['writeFileSync', 'renameSync', 'unlinkSync', 'openSync']) {
    originals[name] = fs[name];
    fs[name] = (...args) => {
      const flags = args[1];
      const mutates = name !== 'openSync' || (typeof flags === 'string' ? /[wax+]/.test(flags) : Boolean(flags & (fs.constants.O_WRONLY | fs.constants.O_RDWR | fs.constants.O_CREAT | fs.constants.O_TRUNC | fs.constants.O_APPEND)));
      if (mutates) mutations.push({ name, filename: String(args[0]) });
      return originals[name](...args);
    };
  }
  try { assert.throws(action, expected); }
  finally { for (const [name, original] of Object.entries(originals)) fs[name] = original; }
  assert.deepEqual(mutations, []);
  assert.deepEqual(digests(fixture), before);
}

test('the hydration patch applies every exact reviewed renderer and checks its full-file hashes', t => {
  const f = fixture(t);
  assert.equal(manifest.version, '15.5.27');
  assert.equal(manifest.targets.length, 4);
  assert.deepEqual(digests(f), originalHashes);
  assert.equal(patchNextHydrationReplay({ root: f.root }).changed, true);
  assert.deepEqual(digests(f), patchedHashes);
  assert.equal(patchNextHydrationReplay({ root: f.root, mode: 'check' }).state, 'patched');
  for (const [index, target] of manifest.targets.entries()) {
    const patched = fs.readFileSync(f.files[index], 'utf8');
    for (const replacement of target.replacements) {
      assert.equal(patched.split(replacement.after).length - 1, 1, `Reviewed replacement must occur once: ${target.path}`);
    }
    assert.equal([...patched.matchAll(/function popHydrationStateOnInterruptedWork\(fiber\)/g)].length, 1);
    assert.equal([...patched.matchAll(/popHydrationStateOnInterruptedWork\(/g)].length, 2, 'Exactly one restoration call and one declaration');
  }
  assertNoStagingFiles(f);
});

test('a pristine install fails check without any vendor writes', t => {
  const f = fixture(t);
  assertFailsWithoutWrites(f, () => patchNextHydrationReplay({ root: f.root, mode: 'check' }), /patch is missing/i);
  assert.deepEqual(digests(f), originalHashes);
});

test('apply and check are idempotent while revert restores all official renderer bytes', t => {
  const f = fixture(t);
  patchNextHydrationReplay({ root: f.root });
  const before = digests(f);
  assert.equal(patchNextHydrationReplay({ root: f.root }).changed, false);
  assert.equal(patchNextHydrationReplay({ root: f.root, mode: 'check' }).changed, false);
  assert.deepEqual(digests(f), before);
  assert.equal(patchNextHydrationReplay({ root: f.root, mode: 'revert' }).changed, true);
  assert.deepEqual(digests(f), originalHashes);
  assert.equal(patchNextHydrationReplay({ root: f.root, mode: 'revert' }).changed, false);
  assertNoStagingFiles(f);
});

test('a different Next version is refused before any renderer mutation', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.directory, 'package.json'), JSON.stringify({ version: '15.5.28' }));
  assertFailsWithoutWrites(f, () => patchNextHydrationReplay({ root: f.root }), /requires Next 15\.5\.27/i);
});

test('a different bundled React renderer version is refused without vendor writes', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.directory, 'dist/compiled/react-dom/package.json'), JSON.stringify({ peerDependencies: { react: '19.2.0' } }));
  assertFailsWithoutWrites(f, () => patchNextHydrationReplay({ root: f.root }), /renderer|React.*version|requires.*19\.2/i);
});

test('unknown bytes in any one of the four renderers fail closed without writes', t => {
  for (let index = 0; index < manifest.targets.length; index++) {
    const f = fixture(t);
    fs.appendFileSync(f.files[index], '\n// unrecognized renderer bytes\n');
    assertFailsWithoutWrites(f, () => patchNextHydrationReplay({ root: f.root }), /Unrecognized Next renderer/i);
  }
});

test('mixed pristine and patched renderers refuse apply, check, and revert without writes', t => {
  for (let index = 0; index < manifest.targets.length; index++) {
    const f = fixture(t);
    const original = fs.readFileSync(f.files[index]);
    patchNextHydrationReplay({ root: f.root });
    fs.writeFileSync(f.files[index], original);
    for (const mode of ['apply', 'check', 'revert']) {
      assertFailsWithoutWrites(f, () => patchNextHydrationReplay({ root: f.root, mode }), /Mixed patched/i);
    }
  }
});

test('a pre-existing staging file is preserved and only newly created staging files are removed', t => {
  for (let index = 0; index < manifest.targets.length; index++) {
    const f = fixture(t);
    const collision = stagingPath(f.files[index]);
    const retained = `unrelated pre-existing temporary file ${index}`;
    fs.writeFileSync(collision, retained);
    assert.throws(() => patchNextHydrationReplay({ root: f.root }), /EEXIST/);
    assert.deepEqual(digests(f), originalHashes);
    assert.equal(fs.readFileSync(collision, 'utf8'), retained);
    for (const filename of f.files) if (filename !== f.files[index]) assert.equal(fs.existsSync(stagingPath(filename)), false);
  }
});

test('failure at each renderer replacement rolls every prior replacement back to pristine bytes', t => {
  for (let boundary = 1; boundary <= manifest.targets.length; boundary++) {
    const f = fixture(t);
    const rename = fs.renameSync;
    let calls = 0;
    fs.renameSync = (...args) => {
      if (++calls === boundary) throw new Error('injected hydration renderer replacement failure');
      return rename(...args);
    };
    try { assert.throws(() => patchNextHydrationReplay({ root: f.root }), /injected hydration renderer replacement failure/); }
    finally { fs.renameSync = rename; }
    assert.deepEqual(digests(f), originalHashes);
    assertNoStagingFiles(f);
  }
});

test('a partial staging write cleans only its owned temporary files and preserves all originals', t => {
  const f = fixture(t);
  const write = fs.writeFileSync;
  let descriptorWrites = 0;
  fs.writeFileSync = (...args) => {
    if (typeof args[0] === 'number' && ++descriptorWrites === 2) {
      write(args[0], Buffer.from('partial staged bytes'));
      throw new Error('injected hydration staging write failure');
    }
    return write(...args);
  };
  try { assert.throws(() => patchNextHydrationReplay({ root: f.root }), /injected hydration staging write failure/); }
  finally { fs.writeFileSync = write; }
  assert.deepEqual(digests(f), originalHashes);
  assertNoStagingFiles(f);
});

test('a failed revert rolls prior replacements back to the exact patched installation', t => {
  const f = fixture(t);
  patchNextHydrationReplay({ root: f.root });
  const rename = fs.renameSync;
  let calls = 0;
  fs.renameSync = (...args) => {
    if (++calls === 3) throw new Error('injected hydration revert replacement failure');
    return rename(...args);
  };
  try { assert.throws(() => patchNextHydrationReplay({ root: f.root, mode: 'revert' }), /injected hydration revert replacement failure/); }
  finally { fs.renameSync = rename; }
  assert.deepEqual(digests(f), patchedHashes);
  assertNoStagingFiles(f);
});

test('a failed rollback reports both causes and the affected renderer instead of hiding partial state', t => {
  const f = fixture(t);
  const rename = fs.renameSync;
  const write = fs.writeFileSync;
  let calls = 0;
  fs.renameSync = (...args) => {
    if (++calls === 2) throw new Error('injected primary renderer replacement failure');
    return rename(...args);
  };
  fs.writeFileSync = (...args) => {
    if (args[0] === f.files[0]) throw new Error('injected renderer rollback write failure');
    return write(...args);
  };
  try {
    assert.throws(() => patchNextHydrationReplay({ root: f.root }), error => {
      assert.ok(error instanceof AggregateError);
      assert.match(error.cause.message, /injected primary renderer replacement failure/);
      assert.ok(error.errors.some(item => /injected primary renderer replacement failure/.test(item.message)));
      assert.ok(error.errors.some(item => item.message.includes(`Rollback failed for ${manifest.targets[0].path}`) && /injected renderer rollback write failure/.test(item.message)));
      return true;
    });
  } finally { fs.renameSync = rename; fs.writeFileSync = write; }
  // This intentionally damaged state exists only in the disposable fixture.
  assert.deepEqual(digests(f), [patchedHashes[0], ...originalHashes.slice(1)]);
  assertNoStagingFiles(f);
});
