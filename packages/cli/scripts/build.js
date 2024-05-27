#!/usr/bin/env node

import semver from 'semver'
import { build, context } from 'esbuild'

const pkg = await import('../package.json', 
  (semver.gt(process.version, '20.10.0') ? {
    with: { type: 'json' } // 'assert' is deprecated in Node 22
  } : {
    assert: { type: 'json' }
  })
)

const common = {
  bundle: true,
  minify: true,
  platform: 'node',
  define: { VERSION: `"${pkg.version}"` },
}

const cliOptions = {
  ...common,
  entryPoints: ['./src/cli.ts'],
  format: 'cjs',
  outfile: './dist/cli.cjs',
}

const indexOptions = {
  ...common,
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.mjs',
  format: 'esm',
}

const watch = process.argv.slice(2)[0] === '--watch'
if (watch) {
  const ctx = await context(cliOptions)
  ctx.watch()
} else {
  await build(cliOptions)
  await build(indexOptions)
}
