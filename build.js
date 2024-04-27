import esbuild from 'esbuild'
import fs from 'node:fs/promises'
import { transformExtPlugin } from '@gjsify/esbuild-plugin-transform-ext'

const args = process.argv.slice(2)
let command = args.shift() || 'build'
const isDev = command === 'dev'

if (isDev) command = args.shift() // Optional: cjs, esm, web

;(async () => {

  // const { name } = JSON.parse(await fs.readFile('./package.json'))
  const name = 'wax'

  if (command==='wasm') {

    // Patch Emscripten output for web

    let src = 'src/waxc-web.js'
    await fs.writeFile(src,
      (await fs.readFile(src, 'utf8'))
      .replace(/require\("(\w+)"\)/g, '{}/* require $1 */')
      .replace(`if (typeof exports === 'object' && typeof module === 'object')
  module.exports = waxc;
else if (typeof define === 'function' && define['amd'])
  define([], () => waxc);`, 'export default waxc')
    )

    console.log('For web:', src)

    // For CLI
    src = 'src/waxc-cli.js'

    await fs.writeFile(src,
      (await fs.readFile(src, 'utf8'))
      // .replace(/require\("(\w+)"\)/g, '{}/* require $1 */')
      .replace(`export default Module`, 'Module().catch(console.error)')
    )

    console.log('For Node:', src)

    return
  }

  const esbuildOptions = {
    entryPoints: [
      `./src/web.ts`,
      './src/web-docs.ts'
    ],
    // outfile: `./docs/${name}.js`,
    outdir: './docs',
    assetNames: '',
    format: 'iife',
    // globalName: '',
    platform: 'browser',
    logLevel: 'info',
    bundle: true,
    minify: !isDev,
    sourcemap: true,
    jsx: 'automatic',
    plugins: [
      // Built ES module format expects import from .js
      transformExtPlugin({ outExtension: { '.ts': '.js' } })
    ]
  }

  if (command === 'cjs') {
    return
    // Individual files
    delete esbuildOptions.outfile

    Object.assign(esbuildOptions, {
      entryPoints: ['./src/**/*.ts'],
      outdir: './build/cjs',
      format: 'cjs',
      platform: 'node',
      bundle: false,
      minify: false,
      sourcemap: false,
    })

  } else if (command === 'esm') {

    const src = 'src/waxc-cli.js'
    const dest = `build/esm/${name}.js`

    await fs.mkdir('build/esm', {
      recursive: true
    })

    await fs.copyFile(src, dest)

    return

    delete esbuildOptions.outfile

    Object.assign(esbuildOptions, {
      entryPoints: ['./src/**/*.ts'],
      outdir: './build/esm',
      format: 'esm',
      platform: 'node',
      bundle: false,
      minify: false,
      sourcemap: false,
    })
  } else if (command === 'web') {

  } else {
    // docs
  }

  const context = await esbuild.context(esbuildOptions)

  await context.rebuild()

  if (command === 'cjs') {
    await fs.mkdir('build/cjs', { recursive: true })
    await fs.writeFile(`build/cjs/package.json`, `{"type": "commonjs"}`)
  } else if (command === 'esm') {
    await fs.mkdir('build/esm', { recursive: true })
    await fs.writeFile(`build/esm/package.json`, `{"type": "module"}`)
  } else if (command === 'web') {

    await fs.mkdir('build/web', { recursive: true })

    // Copy from docs
    await Promise.all([
      fs.copyFile(`./docs/web.js`, `./build/web/${name}.js`),
      fs.copyFile(`./docs/web.js.map`, `./build/web/${name}.js.map`)
    ])

  }

  if (isDev) {
    await context.watch()
    await context.serve({
      port: 8080,
      servedir: './docs'
    })
  } else {
    process.exit()
  }

})().catch((error) => {
  console.error(error)
  process.exit(1)
})
