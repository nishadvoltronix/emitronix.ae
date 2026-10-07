#!/usr/bin/env node
'use strict';

// An open browser tab can still request a previous build's hashed CSS/JS.
// next build cleans distDir, so keep public static assets outside that directory.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function directory(filename) {
  try {
    const stat = fs.lstatSync(filename);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new Error(`Expected an ordinary directory: ${filename}`);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    fs.mkdirSync(filename);
  }
}

function mergeStatic(source, target) {
  if (!fs.lstatSync(source, { throwIfNoEntry: false })) return;
  directory(source);
  directory(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) {
      mergeStatic(from, to);
    } else if (entry.isFile()) {
      try {
        fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        const existing = fs.lstatSync(to);
        if (!existing.isFile() || existing.isSymbolicLink()) {
          throw new Error(`Refusing a linked or non-file static asset: ${to}`);
        }
        // Never overwrite an asset produced by the current build. Hash-named
        // files are immutable; a collision with different bytes is a bad build.
        if (!fs.readFileSync(from).equals(fs.readFileSync(to))) {
          throw new Error(`Conflicting static asset: ${entry.name}`);
        }
      }
    } else {
      throw new Error(`Refusing a linked or special static asset: ${from}`);
    }
  }
}

function buildWithStaticHistory({
  root = path.resolve(__dirname, '..'),
  distDir = process.env.NEXT_DIST_DIR?.trim() || '.next',
  runBuild,
} = {}) {
  if (!/^\.next(?:-[a-z0-9-]+)?$/i.test(distDir) || distDir.toLowerCase() === '.next-static-history') {
    throw new Error('NEXT_DIST_DIR must be .next or a project-local .next-* build directory.');
  }
  const project = fs.realpathSync(root);
  const output = path.join(project, distDir);
  const historyRoot = path.join(project, '.next-static-history');
  directory(historyRoot);
  const history = path.join(historyRoot, distDir);
  directory(history);
  const lock = path.join(history, 'build.lock');
  try {
    fs.mkdirSync(lock);
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error(`Build already locked: ${lock}. Check for a running build before removing a stale lock.`);
    }
    throw error;
  }

  const savedStatic = path.join(history, 'static');
  const outputStatic = path.join(output, 'static');
  try {
    directory(output);
    // Do not archive development chunks or an incomplete first build.
    const buildId = path.join(output, 'BUILD_ID');
    const stat = fs.lstatSync(buildId, { throwIfNoEntry: false });
    if (stat) {
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Invalid BUILD_ID file.');
      if (fs.readFileSync(buildId, 'utf8').trim()) mergeStatic(outputStatic, savedStatic);
    }

    let result;
    try {
      result = runBuild ? runBuild() : spawnSync(
        process.execPath,
        [require.resolve('next/dist/bin/next'), 'build', ...process.argv.slice(2)],
        { cwd: project, env: { ...process.env, NEXT_DIST_DIR: distDir }, stdio: 'inherit' },
      );
    } finally {
      // Also restore public files after a failed build. This is not a rollback
      // of server code: never restart PM2 with an unsuccessful build.
      directory(output);
      mergeStatic(savedStatic, outputStatic);
    }
    if (result.error) throw result.error;
    if (result.signal) throw new Error(`Next.js build stopped by ${result.signal}.`);
    if (result.status !== 0) return result.status || 1;
    mergeStatic(outputStatic, savedStatic);
    console.log(`Retained previous static assets for ${distDir}.`);
    return 0;
  } finally {
    // Only remove the empty lock created by this process, never build output.
    fs.rmdirSync(lock);
  }
}

if (require.main === module) {
  try {
    // Match Next's production environment-file resolution before selecting the
    // output directory; a NEXT_DIST_DIR in .env.production must not be ignored.
    require('@next/env').loadEnvConfig(path.resolve(__dirname, '..'), false);
    process.exitCode = buildWithStaticHistory();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { buildWithStaticHistory };
