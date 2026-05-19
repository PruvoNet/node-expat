#!/usr/bin/env node
'use strict'

const path = require('path')
const { spawnSync } = require('child_process')

const bindingPath = path.join(__dirname, '..', 'build', 'Release', 'node_expat.node')

function bindingLoadsCleanly () {
  try {
    require(bindingPath)
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
  ? spawnSync(process.execPath, [nodeGypBin, 'rebuild'], { stdio: 'inherit' })
  : spawnSync(process.platform === 'win32' ? 'node-gyp.cmd' : 'node-gyp', ['rebuild'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

process.exit(result.status == null ? 1 : result.status)
