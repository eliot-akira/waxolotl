;(async () => {
  const { waxc } = window
  const waxon = (await waxc()).cwrap('transpile', 'string', [
    'string',
    'string',
    'string',
    'number',
  ])

  const compile = wat.default

  const waxCode = await (await fetch('/examples/raycast.wax')).text()
  // console.log(waxCode)

  const code = waxon('wat', 'index.wax', waxCode, 0)

  // console.log(code)
  const buffer = compile(code)
  // console.log('compile', compile(code))

  const mod = new WebAssembly.Module(buffer)

  var waxMemory = {}
  var _wax_is_node = typeof window == 'undefined'
  var wasmPath = 'index.wasm'

  let consoleContent = ''

  function getStr(offset, length) {
    var bytes = new Uint8Array(waxMemory[wasmPath].buffer, offset, length)
    var str = new TextDecoder('utf8').decode(bytes)
    return str
  }

  const imports = {
    console: {
      log: function (offset, length) {
        const str = getStr(offset, length)
        // console.log(str)
        consoleContent += str + '\n'
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

  let lib = results.exports
  waxMemory[wasmPath] = lib.mem

  lib.main()

  // console.log(consoleContent)

  const $svg = document.getElementById('svgView')
  const $consoleContainer = document.getElementById('consoleView')
  const $console = $consoleContainer.querySelector('code')

  if (consoleContent.startsWith('<svg')) {
    $svg.style.display = 'block'
    $svg.innerHTML = consoleContent

    $console.style.display = 'none'
    $console.innerText = ''
  } else {
    $svg.style.display = 'none'
    $svg.innerHTML = ''

    $console.style.display = 'block'
    $console.innerText = consoleContent
  }
})().catch(console.error)
