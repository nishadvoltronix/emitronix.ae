'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildWithStaticHistory } = require('../scripts/build-with-static-history.cjs');

function inside(root, relative) {
  const target = path.resolve(root, relative);
  const remainder = path.relative(root, target);
  assert.ok(remainder && !remainder.startsWith(`..${path.sep}`) && remainder !== '..' && !path.isAbsolute(remainder));
  return target;
}

function fixture(t) {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'emitronix-static-history-test-'));
  const root = inside(temporaryRoot, 'project');
  fs.mkdirSync(root);
  t.after(() => {
    const resolved = fs.realpathSync(temporaryRoot);
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
    assert.match(path.basename(resolved), /^emitronix-static-history-test-/);
    assert.equal(fs.lstatSync(temporaryRoot).isSymbolicLink(), false);
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  return {
    root,
    temporaryRoot,
    file(relative) { return inside(root, relative); },
    read(relative) { return fs.readFileSync(inside(root, relative), 'utf8'); },
    exists(relative) { return fs.existsSync(inside(root, relative)); },
    write(relative, value) {
      const filename = inside(root, relative);
      fs.mkdirSync(path.dirname(filename), { recursive: true });
      fs.writeFileSync(filename, value);
    },
    clear(relative) {
      const filename = inside(root, relative);
      if (!fs.existsSync(filename)) return;
      assert.equal(fs.lstatSync(filename).isSymbolicLink(), false);
      assert.ok(fs.realpathSync(filename).startsWith(`${fs.realpathSync(root)}${path.sep}`));
      fs.rmSync(filename, { recursive: true, force: true });
    },
  };
}

function production(f, distDir, files, buildId = 'fixture-build') {
  f.clear(distDir);
  f.write(`${distDir}/BUILD_ID`, buildId);
  for (const [name, bytes] of Object.entries(files)) f.write(`${distDir}/static/${name}`, bytes);
}

function build(f, files, { distDir = '.next', status = 0, buildId = 'next-fixture' } = {}) {
  return buildWithStaticHistory({
    root: f.root,
    distDir,
    runBuild() {
      production(f, distDir, files, buildId);
      return { status };
    },
  });
}

function unlocked(f, distDir = '.next') {
  assert.equal(f.exists(`.next-static-history/${distDir}/build.lock`), false);
}

test('first production build archives nested public assets without an existing output directory', t => {
  const f = fixture(t);
  const files = { 'css/first-a1.css': 'body{color:blue}', 'chunks/app/(en)/page-b2.js': 'first();', 'media/font-c3.woff2': 'font bytes' };
  assert.equal(build(f, files), 0);
  for (const [name, bytes] of Object.entries(files)) {
    assert.equal(f.read(`.next/static/${name}`), bytes);
    assert.equal(f.read(`.next-static-history/.next/static/${name}`), bytes);
  }
  unlocked(f);
});

test('successive clean builds retain earlier CSS and JavaScript bytes', t => {
  const f = fixture(t);
  const versions = [
    { 'css/old-a1.css': 'old CSS', 'chunks/old-b1.js': 'old JS', 'chunks/shared-f1.js': 'shared' },
    { 'css/new-a2.css': 'new CSS', 'chunks/shared-f1.js': 'shared' },
    { 'chunks/latest-b3.js': 'latest JS' },
  ];
  for (const [index, files] of versions.entries()) assert.equal(build(f, files, { buildId: `build-${index}` }), 0);
  for (const [name, bytes] of Object.entries(Object.assign({}, ...versions))) {
    assert.equal(f.read(`.next/static/${name}`), bytes);
    assert.equal(f.read(`.next-static-history/.next/static/${name}`), bytes);
  }
  unlocked(f);
});

test('captures a production build made before the wrapper was installed and excludes server output', t => {
  const f = fixture(t);
  production(f, '.next', { 'css/preexisting-a1.css': 'old CSS' });
  f.write('.next/server/app/index.html', 'private server output');
  f.write('.next/cache/secret-data', 'private cache');
  assert.equal(build(f, { 'css/current-b2.css': 'new CSS' }), 0);
  assert.equal(f.read('.next/static/css/preexisting-a1.css'), 'old CSS');
  assert.deepEqual(fs.readdirSync(f.file('.next-static-history/.next')), ['static']);
  assert.equal(f.exists('.next-static-history/.next/static/server'), false);
  assert.equal(f.exists('.next-static-history/.next/static/cache'), false);
});

test('a failed build restores old public files and preserves the failure exit code', t => {
  const f = fixture(t);
  production(f, '.next', { 'chunks/previous-a1.js': 'previous JS' });
  assert.equal(build(f, { 'chunks/partial-b2.js': 'partial JS' }, { status: 37 }), 37);
  assert.equal(f.read('.next/static/chunks/previous-a1.js'), 'previous JS');
  assert.equal(f.exists('.next-static-history/.next/static/chunks/partial-b2.js'), false);
  unlocked(f);
});

test('a thrown build error restores old files and releases its lock', t => {
  const f = fixture(t);
  production(f, '.next', { 'css/previous-a1.css': 'previous CSS' });
  const failure = new Error('simulated compiler failure');
  assert.throws(() => buildWithStaticHistory({
    root: f.root,
    distDir: '.next',
    runBuild() { f.clear('.next'); throw failure; },
  }), error => error === failure);
  assert.equal(f.read('.next/static/css/previous-a1.css'), 'previous CSS');
  unlocked(f);
});

test('spawn errors and termination signals fail after restoring the saved assets', t => {
  for (const result of [{ status: null, error: new Error('spawn failed') }, { status: null, signal: 'SIGTERM' }]) {
    const f = fixture(t);
    production(f, '.next', { 'css/previous-a1.css': 'previous CSS' });
    assert.throws(() => buildWithStaticHistory({
      root: f.root,
      distDir: '.next',
      runBuild() { f.clear('.next'); return result; },
    }), /spawn failed|SIGTERM/);
    assert.equal(f.read('.next/static/css/previous-a1.css'), 'previous CSS');
    unlocked(f);
  }
});

test('different bytes at an immutable asset path fail without overwriting the fresh build', t => {
  const f = fixture(t);
  production(f, '.next', { 'chunks/same-a1.js': 'old bytes' });
  assert.throws(() => build(f, { 'chunks/same-a1.js': 'fresh bytes' }), /Conflicting static asset/);
  assert.equal(f.read('.next/static/chunks/same-a1.js'), 'fresh bytes');
  assert.equal(f.read('.next-static-history/.next/static/chunks/same-a1.js'), 'old bytes');
  unlocked(f);
});

test('development output without a production BUILD_ID is not retained', t => {
  const f = fixture(t);
  f.write('.next/static/chunks/app/page.js', 'development code');
  assert.equal(build(f, { 'chunks/page-a1.js': 'production code' }), 0);
  assert.equal(f.exists('.next/static/chunks/app/page.js'), false);
  assert.equal(f.exists('.next-static-history/.next/static/chunks/app/page.js'), false);
});

test('an empty BUILD_ID does not mark incomplete output as a production build', t => {
  const f = fixture(t);
  production(f, '.next', { 'chunks/unfinished.js': 'unfinished code' }, '  \n');
  assert.equal(build(f, { 'chunks/page-a1.js': 'production code' }), 0);
  assert.equal(f.exists('.next/static/chunks/unfinished.js'), false);
  assert.equal(f.exists('.next-static-history/.next/static/chunks/unfinished.js'), false);
});

test('custom build directories have separate histories and do not modify the default build', t => {
  const f = fixture(t);
  production(f, '.next', { 'css/default-a1.css': 'default CSS' });
  production(f, '.next-review', { 'css/review-b1.css': 'review CSS' });
  assert.equal(build(f, { 'css/review-b2.css': 'new review CSS' }, { distDir: '.next-review' }), 0);
  assert.equal(f.read('.next/static/css/default-a1.css'), 'default CSS');
  assert.equal(f.read('.next-review/static/css/review-b1.css'), 'review CSS');
  assert.equal(f.exists('.next-review/static/css/default-a1.css'), false);
  assert.equal(f.exists('.next-static-history/.next'), false);
  assert.equal(f.exists('.next-static-history/.next-review/static/css/review-b2.css'), true);
  unlocked(f, '.next-review');
});

test('unsafe or reserved output directories are rejected before invoking the builder', t => {
  const f = fixture(t);
  for (const distDir of ['../outside', '.next/../../outside', 'C:\\outside', '/tmp/outside', '.next-static-history', '.NEXT-STATIC-HISTORY', 'public', '.next/review']) {
    assert.throws(() => buildWithStaticHistory({
      root: f.root,
      distDir,
      runBuild() { assert.fail('invalid output directory reached the builder'); },
    }), /NEXT_DIST_DIR/);
  }
  assert.deepEqual(fs.readdirSync(f.root), []);
});

test('an existing build lock prevents a second build and is not removed by it', t => {
  const f = fixture(t);
  const lock = f.file('.next-static-history/.next/build.lock');
  fs.mkdirSync(lock, { recursive: true });
  assert.throws(() => buildWithStaticHistory({
    root: f.root,
    distDir: '.next',
    runBuild() { assert.fail('locked build reached the builder'); },
  }), /Build already locked/);
  assert.equal(fs.statSync(lock).isDirectory(), true);
  assert.equal(f.exists('.next'), false);
});

test('a nested build cannot use the same output while the first build holds its lock', t => {
  const f = fixture(t);
  assert.equal(buildWithStaticHistory({
    root: f.root,
    distDir: '.next',
    runBuild() {
      assert.throws(() => build(f, { 'css/nested-b2.css': 'nested CSS' }), /Build already locked/);
      production(f, '.next', { 'css/first-a1.css': 'first CSS' });
      return { status: 0 };
    },
  }), 0);
  assert.equal(f.exists('.next/static/css/nested-b2.css'), false);
  unlocked(f);
});

test('linked output and history roots are rejected without writing through them', t => {
  for (const relative of ['.next', '.next-static-history', '.next-static-history/.next']) {
    const f = fixture(t);
    const external = inside(f.temporaryRoot, 'external');
    fs.mkdirSync(external);
    fs.writeFileSync(path.join(external, 'sentinel'), 'leave unchanged');
    const link = f.file(relative);
    fs.mkdirSync(path.dirname(link), { recursive: true });
    fs.symlinkSync(external, link, process.platform === 'win32' ? 'junction' : 'dir');
    assert.throws(() => buildWithStaticHistory({
      root: f.root,
      distDir: '.next',
      runBuild() { assert.fail('linked directory reached the builder'); },
    }), /ordinary directory/);
    assert.deepEqual(fs.readdirSync(external), ['sentinel']);
    assert.equal(fs.readFileSync(path.join(external, 'sentinel'), 'utf8'), 'leave unchanged');
  }
});

test('linked directories inside static assets are rejected before the build', t => {
  const f = fixture(t);
  production(f, '.next', { 'css/first-a1.css': 'first CSS' });
  const external = inside(f.temporaryRoot, 'external');
  fs.mkdirSync(external);
  fs.writeFileSync(path.join(external, 'sentinel'), 'leave unchanged');
  fs.symlinkSync(external, f.file('.next/static/linked'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => buildWithStaticHistory({
    root: f.root,
    distDir: '.next',
    runBuild() { assert.fail('linked static directory reached the builder'); },
  }), /linked|ordinary directory/);
  assert.deepEqual(fs.readdirSync(external), ['sentinel']);
  unlocked(f);
});

test('a dangling static-directory link is rejected instead of being treated as missing', t => {
  const f = fixture(t);
  f.write('.next/BUILD_ID', 'previous-build');
  const external = inside(f.temporaryRoot, 'external');
  fs.mkdirSync(external);
  fs.symlinkSync(external, f.file('.next/static'), process.platform === 'win32' ? 'junction' : 'dir');
  fs.rmdirSync(external);
  assert.throws(() => buildWithStaticHistory({
    root: f.root,
    distDir: '.next',
    runBuild() { assert.fail('dangling static link reached the builder'); },
  }), /ordinary directory|linked/);
  unlocked(f);
});

test('a linked archive destination is rejected without writing through it', t => {
  const f = fixture(t);
  production(f, '.next', { 'css/first-a1.css': 'first CSS' });
  const external = inside(f.temporaryRoot, 'external');
  fs.mkdirSync(external);
  fs.writeFileSync(path.join(external, 'sentinel'), 'leave unchanged');
  fs.mkdirSync(f.file('.next-static-history/.next/static'), { recursive: true });
  fs.symlinkSync(external, f.file('.next-static-history/.next/static/css'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => buildWithStaticHistory({
    root: f.root,
    distDir: '.next',
    runBuild() { assert.fail('linked archive destination reached the builder'); },
  }), /ordinary directory|linked/);
  assert.deepEqual(fs.readdirSync(external), ['sentinel']);
  assert.equal(fs.readFileSync(path.join(external, 'sentinel'), 'utf8'), 'leave unchanged');
  unlocked(f);
});

test('linked static files are rejected without copying their contents', t => {
  const f = fixture(t);
  production(f, '.next', { 'css/first-a1.css': 'first CSS' });
  const external = inside(f.temporaryRoot, 'external.txt');
  fs.writeFileSync(external, 'external bytes');
  try {
    fs.symlinkSync(external, f.file('.next/static/linked.js'), 'file');
  } catch (error) {
    if (process.platform === 'win32' && error.code === 'EPERM') { t.skip('Windows file symlinks require unavailable OS privileges.'); return; }
    throw error;
  }
  assert.throws(() => buildWithStaticHistory({
    root: f.root,
    distDir: '.next',
    runBuild() { assert.fail('linked static file reached the builder'); },
  }), /linked or special static asset/);
  assert.equal(f.exists('.next-static-history/.next/static/linked.js'), false);
  assert.equal(fs.readFileSync(external, 'utf8'), 'external bytes');
  unlocked(f);
});

test('a directory used as BUILD_ID is rejected before starting the build', t => {
  const f = fixture(t);
  fs.mkdirSync(f.file('.next/BUILD_ID'), { recursive: true });
  assert.throws(() => buildWithStaticHistory({
    root: f.root,
    distDir: '.next',
    runBuild() { assert.fail('invalid BUILD_ID reached the builder'); },
  }), /Invalid BUILD_ID/);
  unlocked(f);
});
