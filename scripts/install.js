#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs')
const { spawnSync } = require('child_process')

const PACKAGE_ROOT = path.join(__dirname, '..')
const BINDING_PATH = path.join(PACKAGE_ROOT, 'build', 'Release', 'node_expat.node')

function bindingLoadsCleanly () {
  try {
    require(BINDING_PATH)
    return true
  } catch (_) {
    return false
  }
}

if (bindingLoadsCleanly()) {
  console.log('node-expat: existing binding loads on this runtime, skipping rebuild')
  process.exit(0)
}

console.log('node-expat: binding missing or incompatible for this runtime, running node-gyp rebuild')

let nodeGypBin
try {
  const nodeGypPkg = require('node-gyp/package.json')
  const binEntry = typeof nodeGypPkg.bin === 'string' ? nodeGypPkg.bin : nodeGypPkg.bin['node-gyp']
  nodeGypBin = path.join(path.dirname(require.resolve('node-gyp/package.json')), binEntry)
} catch (_) {
  nodeGypBin = null
}

const result = nodeGypBin
  ? spawnSync(process.execPath, [nodeGypBin, 'rebuild'], {
    cwd: PACKAGE_ROOT,
    stdio: 'inherit',
  })
  : spawnSync(process.platform === 'win32' ? 'node-gyp.cmd' : 'node-gyp', ['rebuild'], {
    cwd: PACKAGE_ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

if (result.error) {
  console.error('node-expat: failed to spawn node-gyp:', result.error.message)
  process.exit(1)
}

if (result.status !== 0) {
  console.error('node-expat: node-gyp rebuild exited with code', result.status)
  process.exit(result.status || 1)
}

// Refuse to exit 0 unless the binding is actually on disk AND loadable.
// This prevents pnpm's side-effects cache from storing a "built" state
// that has no artifact, which would silently propagate across every
// subsequent install that hits this cache.
if (!fs.existsSync(BINDING_PATH)) {
  console.error('node-expat: node-gyp reported success but binding is missing at:', BINDING_PATH)
  process.exit(1)
}

if (!bindingLoadsCleanly()) {
  console.error('node-expat: binding exists at', BINDING_PATH, 'but does not load on this runtime')
  process.exit(1)
}

console.log('node-expat: binding successfully built and verified at', BINDING_PATH)
process.exit(0)
