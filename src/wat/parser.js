export default function parse({ start, peek, accept, expect }) {
  // function error (token, message) {
  //   return new TypeError(message
  //     + ': ' + token.value
  //     + '\n  at position: ' + token.index)
  // }
  const encoder = new TextEncoder('utf-8')

  const HEX = /[0-9a-f]/i

  const stringchar = {
    t: 0x09,
    n: 0x0a,
    r: 0x0d,
    '"': 0x22,
    "'": 0x27,
    '\\': 0x5c,
  }

  // TODO: replace with a real implementation
  function parseDataString() {
    const parsed = []
    while (1) {
      const str = accept('string')
      if (!str) break

      for (let i = 0, ch, next; i < str.value.length; i++) {
        ch = str.value[i]
        if (ch === '\\') {
          next = str.value[i + 1]
          if (next in stringchar) {
            parsed.push(stringchar[next])
            i++
            continue
          }
          // TODO: \u
          else if (HEX.test(next)) {
            if (HEX.test(str.value[i + 2])) {
              parsed.push(parseInt(`${next}${str.value[(i += 2)]}`, 16))
            } else {
              parsed.push(parseInt(next, 16))
              i++
            }
            continue
          }
        }
        parsed.push(encoder.encode(ch))
      }
    }

    return parsed
  }

  function* params() {
    let param
    while (1) {
      if ((param = accept('number'))) {
        param.value = param.value.replace(/_/g, '')
        yield { param }
        continue
      }
      if ((param = accept('hex'))) {
        param.value = param.value.replace(/_/g, '')
        yield { param }
        continue
      }
      if ((param = accept('string'))) {
        yield { param }
        continue
      }
      if ((param = accept('label'))) {
        yield { param }
        continue
      }
      if ((param = accept('param'))) {
        let value
        if ((value = accept('number'))) {
          yield { param, value }
          continue
        }
        if ((value = accept('hex'))) {
          yield { param, value }
          continue
        } else {
          yield { param }
          continue
        }
      }
      break
    }
  }

  function expr() {
    const ref = accept('label')
    if (ref) return { ref }

    if (peek('string')) {
      // TODO: handle utf-8 strings
      return { data: parseDataString() }
    }

    const sexpr = accept('lparen')

    let instr
    if (sexpr) {
      instr = expect('instr')
    } else {
      instr = accept('instr')
      if (!instr) return
    }

    const node = {
      instr,
      name: accept('label'),
      params: [...params()],
      children: [],
    }

    if (sexpr) {
      let child

      while (!peek('eof') && (child = expr())) {
        node.children.push(child)
      }

      node.params.push(...params()) // can have params after children..

      expect('rparen')
    } else if (instr.value === 'block' || instr.value === 'loop') {
      let child

      while (!peek('eof') && !peek('instr', 'end') && (child = expr())) {
        node.children.push(child)
      }

      expect('instr', 'end')
    }

    return node
  }

  start()

  return expr()
}
