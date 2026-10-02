#!/usr/bin/env node
'use strict';

// Backport React PR #35494 only to the reviewed Next 15.5.27 vendored DOM
// renderers. Never infer a patch for another package or unknown file bytes.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const manifest = require('../patches/next-15.5.27-hydration-replay-manifest.json');
const NEXT_VERSION = '15.5.27';
const RENDERER_VERSION = '19.2.0-canary-0bdb9206-20250818';
const targets = [
  'dist/compiled/react-dom/cjs/react-dom-client.development.js',
  'dist/compiled/react-dom/cjs/react-dom-client.production.js',
  'dist/compiled/react-dom/cjs/react-dom-profiling.development.js',
  'dist/compiled/react-dom/cjs/react-dom-profiling.profiling.js'
];
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function patchNextHydrationReplay({ root = path.resolve(__dirname, '..'), mode = 'apply' } = {}) {
  if (!['apply', 'check', 'revert'].includes(mode)) throw new Error('Unknown patch operation');
  if (manifest.version !== NEXT_VERSION || manifest.rendererVersion !== RENDERER_VERSION || manifest.commit !== 'eaa592d626196e8cc4d87ef01e1ca9060d8a27dc' || manifest.supportsHydration !== true) {
    throw new Error('Unexpected hydration replay patch manifest');
  }
  if (manifest.targets.length !== targets.length || manifest.targets.some((target, index) => target.path !== targets[index] || !/^[a-f0-9]{64}$/.test(target.originalSha256) || !/^[a-f0-9]{64}$/.test(target.patchedSha256) || target.replacements.length !== 2 || target.insertionCount !== 1 || target.replayCallCount !== 1)) {
    throw new Error('Unexpected hydration replay patch targets');
  }
  const project = fs.realpathSync(root);
  const directory = path.join(project, 'node_modules', 'next');
  if (fs.realpathSync(directory) !== directory) throw new Error('Refusing a linked Next installation');
  const installed = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
  if (installed.version !== NEXT_VERSION) {
    throw new Error(`Hydration replay patch requires Next ${NEXT_VERSION}; found ${installed.version}. Review the upstream release before changing this guard.`);
  }
  const rendererPackagePath = path.join(directory, 'dist', 'compiled', 'react-dom', 'package.json');
  if (fs.realpathSync(rendererPackagePath) !== rendererPackagePath) throw new Error('Refusing linked renderer package metadata');
  const rendererPackage = JSON.parse(fs.readFileSync(rendererPackagePath, 'utf8'));
  if (rendererPackage.peerDependencies?.react !== RENDERER_VERSION) {
    throw new Error(`Hydration replay patch requires renderer ${RENDERER_VERSION}; found ${rendererPackage.peerDependencies?.react}. No files were changed.`);
  }

  // Read and validate ALL four whole files before writing any temporary file.
  const entries = manifest.targets.map(target => {
    const filename = path.join(directory, target.path);
    if (fs.realpathSync(filename) !== filename) throw new Error('Refusing a linked patch target');
    const original = fs.readFileSync(filename);
    const digest = sha256(original);
    const state = digest === target.originalSha256 ? 'original' : digest === target.patchedSha256 ? 'patched' : 'unknown';
    if (state === 'unknown') throw new Error(`Unrecognized Next renderer: ${target.path}. No files were changed.`);
    if (!original.toString('utf8').includes(`exports.version = "${RENDERER_VERSION}";`)) throw new Error('Unexpected renderer version bytes');
    return { target, filename, original, state, mode: fs.statSync(filename).mode };
  });
  if (new Set(entries.map(entry => entry.state)).size !== 1) throw new Error('Mixed patched/pristine Next renderers; no files were changed');
  const current = entries[0].state;
  if (mode === 'check') {
    if (current !== 'patched') throw new Error('Required hydration replay patch is missing. Run npm run patch:framework before building/starting.');
    return { version: installed.version, rendererVersion: RENDERER_VERSION, state: current, changed: false, targets: entries.length };
  }
  const wanted = mode === 'revert' ? 'original' : 'patched';
  if (current === wanted) return { version: installed.version, rendererVersion: RENDERER_VERSION, state: current, changed: false, targets: entries.length };
  for (const entry of entries) {
    let text = entry.original.toString('utf8');
    for (const replacement of entry.target.replacements) {
      const before = mode === 'revert' ? replacement.after : replacement.before;
      const after = mode === 'revert' ? replacement.before : replacement.after;
      if (typeof before !== 'string' || typeof after !== 'string' || !before || text.split(before).length !== 2) throw new Error(`Patch context is not unique: ${entry.target.path}`);
      text = text.replace(before, after);
    }
    entry.updated = Buffer.from(text);
    const expected = mode === 'revert' ? entry.target.originalSha256 : entry.target.patchedSha256;
    if (sha256(entry.updated) !== expected) throw new Error(`Patch output hash mismatch: ${entry.target.path}`);
    entry.temporary = `${entry.filename}.hydration-replay-patch-${process.pid}`;
  }

  // Record ownership only after exclusive creation succeeds. A stale/colliding
  // file is never ours to delete; a partial write to our own file is cleaned up.
  const ownedTemps = [];
  const replaced = [];
  let failure;
  const secondaryErrors = [];
  try {
    for (const entry of entries) {
      const descriptor = fs.openSync(entry.temporary, 'wx', entry.mode);
      ownedTemps.push(entry.temporary);
      try { fs.writeFileSync(descriptor, entry.updated); }
      finally { fs.closeSync(descriptor); }
    }
    for (const entry of entries) {
      if (!fs.readFileSync(entry.filename).equals(entry.original)) throw new Error(`Renderer changed during patch staging: ${entry.target.path}`);
      fs.renameSync(entry.temporary, entry.filename);
      replaced.push(entry);
    }
  } catch (error) {
    failure = error;
    for (const entry of replaced.reverse()) {
      try {
        fs.writeFileSync(entry.filename, entry.original);
        fs.chmodSync(entry.filename, entry.mode);
        if (!fs.readFileSync(entry.filename).equals(entry.original)) throw new Error('Restored bytes do not match the original');
      } catch (rollbackError) {
        secondaryErrors.push(new Error(`Rollback failed for ${entry.target.path}: ${rollbackError.message}`, { cause: rollbackError }));
      }
    }
  } finally {
    for (const temporary of ownedTemps) {
      try { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
      catch (cleanupError) { secondaryErrors.push(new Error(`Owned temporary cleanup failed: ${temporary}: ${cleanupError.message}`, { cause: cleanupError })); }
    }
  }
  if (secondaryErrors.length) {
    const errors = failure ? [failure, ...secondaryErrors] : secondaryErrors;
    throw new AggregateError(errors, `Hydration replay patch failed${failure ? ': ' + failure.message : ''}; rollback/cleanup failures: ${secondaryErrors.map(error => error.message).join('; ')}`, { cause: failure });
  }
  if (failure) throw failure;
  return { version: installed.version, rendererVersion: RENDERER_VERSION, state: wanted, changed: true, targets: entries.length };
}

module.exports = { patchNextHydrationReplay };
if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1 || (args.length && !['--check', '--revert'].includes(args[0]))) throw new Error('Usage: node scripts/apply-next-hydration-replay-patch.cjs [--check|--revert]');
    const result = patchNextHydrationReplay({ mode: args[0] === '--check' ? 'check' : args[0] === '--revert' ? 'revert' : 'apply' });
    console.log(`Next ${result.version} renderer ${result.rendererVersion} hydration replay patch: ${result.state}${result.changed ? ' (updated)' : ''}`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
