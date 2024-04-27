// @ts-nocheck
import wat from './wat/index.js'
import createWaxc from './waxc-web.js'

const wat2wasm = wat

let waxc
async function getWaxc() {
  return (
    waxc ||
    (waxc = (await createWaxc()).cwrap('transpile', 'string', [
      'string',
      'string',
      'string',
      'number',
    ]))
  )
}

async function toWat(waxCode: string): Promise<string> {
  return (await getWaxc())('wat', 'index.wax', waxCode, 0)
}

async function toJson(waxCode: string): Promise<string> {
  return JSON.parse((await getWaxc())('json', 'index.wax', waxCode, 0))
}

async function toWasm(waxCode) {
  return wat2wasm(await toWat(waxCode))
}

type WasmModule = {
  memory: WebAssembly.Memory
  run: () => {
    wasm: WasmModule
    output: string
  }
}

async function start(buffer: BufferSource): Promise<WasmModule> {
  const mod = new WebAssembly.Module(buffer)

  let memory

  function getStringFromMemory(offset, length) {
    const bytes = new Uint8Array(memory.buffer, offset, length)
    const str = new TextDecoder('utf8').decode(bytes)
    return str
  }

  let output = ''

  const imports = {
    console: {
      log(offset, length) {
        const str = getStringFromMemory(offset, length)
        output += str + '\n'
      },
    },
    Math,
    debug: {
      logi32: function (x) {
        console.log(x)
      },
    },
  }

  const instance = WebAssembly.instantiate(mod, imports)

  const results = await instance
  const lib = results.exports

  memory = lib.mem

  const wasm = {
    buffer,
    memory,
    run() {
      lib.main()
      let result = output
      output = ''
      return {
        wasm,
        output: result,
      }
    },
  }

  return wasm
}

async function run(waxCode: string) {
  return (await start(await toWasm(waxCode))).run()
}

async function loadWasmFile(url: string): Promise<ArrayBuffer> {
  return await start(await (await fetch(url)).arrayBuffer())
}

async function saveWasmFile(
  fileName: string,
  buffer: ArrayBuffer,
): Promise<void> {
  const blob = new Blob([buffer], { type: 'application/wasm' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
}

const wax = {
  toWat,
  toJson,
  wat2wasm,
  toWasm,
  start,
  run,
  loadWasmFile,
  saveWasmFile,
}

export type Wax = typeof wax

window.wax = wax
