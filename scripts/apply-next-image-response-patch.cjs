#!/usr/bin/env node
'use strict';

// Backport only PR #98168; never guess against a different Next release.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const manifest = require('../patches/next-15.5.27-image-response-socket.json');
const targets = ['dist/server/image-optimizer.js', 'dist/esm/server/image-optimizer.js'];
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function patchNext({ root = path.resolve(__dirname, '..'), mode = 'apply' } = {}) {
  if (!['apply', 'check', 'revert'].includes(mode)) throw new Error('Unknown patch operation');
  const project = fs.realpathSync(root);
  const directory = path.join(project, 'node_modules', 'next');
  if (fs.realpathSync(directory) !== directory) throw new Error('Refusing a linked Next installation');
  const installed = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
  if (installed.version !== manifest.version) {
    throw new Error(`Image patch requires Next ${manifest.version}; found ${installed.version}. Review the upstream release before changing this guard.`);
  }
  if (manifest.targets.length !== targets.length || manifest.targets.some((t, i) => t.path !== targets[i])) {
    throw new Error('Unexpected patch targets');
  }
  // Read and validate BOTH modules before touching either one.
  const entries = manifest.targets.map(target => {
    const filename = path.join(directory, target.path);
    if (fs.realpathSync(filename) !== filename) throw new Error('Refusing a linked patch target');
    const original = fs.readFileSync(filename);
    const digest = sha256(original);
    const state = digest === target.originalSha256 ? 'original' : digest === target.patchedSha256 ? 'patched' : 'unknown';
    if (state === 'unknown') throw new Error(`Unrecognized Next module: ${target.path}. Reinstall the pinned package; no files were changed.`);
    return { target, filename, original, state };
  });
  if (new Set(entries.map(e => e.state)).size !== 1) throw new Error('Mixed patched/pristine Next modules; no files were changed');
  const current = entries[0].state;
  if (mode === 'check') {
    if (current !== 'patched') throw new Error('Required image response patch is missing. Run npm install or npm run patch:framework before building/starting.');
    return { version: installed.version, state: current, changed: false };
  }
  const wanted = mode === 'revert' ? 'original' : 'patched';
  if (current === wanted) return { version: installed.version, state: current, changed: false };
  for (const entry of entries) {
    let text = entry.original.toString('utf8');
    for (const replacement of entry.target.replacements) {
      const before = mode === 'revert' ? replacement.after : replacement.before;
      const after = mode === 'revert' ? replacement.before : replacement.after;
      if (text.split(before).length !== 2) throw new Error(`Patch context is not unique: ${entry.target.path}`);
      text = text.replace(before, after);
    }
    entry.updated = Buffer.from(text);
    const expected = mode === 'revert' ? entry.target.originalSha256 : entry.target.patchedSha256;
    if (sha256(entry.updated) !== expected) throw new Error(`Patch output hash mismatch: ${entry.target.path}`);
  }
  // Stage both complete files first. Restore originals on a failed replacement.
  const staged = [];
  const replaced = [];
  try {
    for (const entry of entries) {
      const temporary = `${entry.filename}.image-response-patch-${process.pid}`;
      fs.writeFileSync(temporary, entry.updated, { flag: 'wx', mode: fs.statSync(entry.filename).mode });
      staged.push({ temporary, entry });
    }
    for (const item of staged) {
      fs.renameSync(item.temporary, item.entry.filename);
      replaced.push(item.entry);
    }
  } catch (error) {
    for (const entry of replaced.reverse()) fs.writeFileSync(entry.filename, entry.original);
    throw error;
  } finally {
    for (const { temporary } of staged) if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  return { version: installed.version, state: wanted, changed: true };
}

module.exports = { patchNext };
if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1 || (args.length && !['--check', '--revert'].includes(args[0]))) throw new Error('Usage: node scripts/apply-next-image-response-patch.cjs [--check|--revert]');
    const result = patchNext({ mode: args[0] === '--check' ? 'check' : args[0] === '--revert' ? 'revert' : 'apply' });
    console.log(`Next ${result.version} image response patch: ${result.state}${result.changed ? ' (updated)' : ''}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
