const regexp = new RegExp(
  [
    /(?<comment>;;.*|\(;[^]*?;\))/,
    /"(?<string>(?:\\"|[^"])*?)"/,
    /(?<param>offset|align|shared|funcref)=?/,
    /(?<hex>([+-]?nan:)?[+-]?0x[0-9a-f.p+-_]+)/,
    /(?<number>[+-]?inf|[+-]?nan|[+-]?\d[\d.e_+-]*)/,
    /(?<instr>[a-z][a-z0-9!#$%&'*+\-./:<=>?@\\^_`|~]+)/,
    /\$(?<label>[a-z0-9!#$%&'*+\-./:<=>?@\\^_`|~]+)/,
    /(?<lparen>\()|(?<rparen>\))|(?<nul>[ \t\n]+)|(?<error>.)/,
  ]
    .map((x) => x.toString().slice(1, -1))
    .join('|'),
  'gi',
)

export function tokenize(input) {
  let last = {}
  let curr = {}

  const matches = input.matchAll(regexp)

  function next() {
    const match = matches.next()
    if (match.done)
      return {
        value: { value: null, kind: 'eof', index: input.length },
        done: true,
      } //match

    const [kind, value] = Object.entries(match.value.groups).filter(
      (e) => e[1] != null,
    )[0]
    return { value: { value, kind, index: match.value.index }, done: false }
  }

  function advance() {
    last = curr
    do {
      curr = next().value
    } while (curr.kind === 'nul' || curr.kind === 'comment')
    return last
  }

  function peek(kind, value) {
    if (kind != null) {
      if (value != null) {
        return value === curr.value
      } else {
        return kind === curr.kind
      }
    }
    return curr
  }

  function accept(kind, value) {
    if (kind === curr.kind) {
      if (value != null) {
        if (value === curr.value) {
          return advance()
        }
      } else {
        return advance()
      }
    }
    return null
  }

  function expect(kind, value) {
    const token = accept(kind, value)
    if (!token) {
      throw new SyntaxError(
        'Unexpected token: ' +
          curr.value +
          '\n        expected: ' +
          kind +
          (value ? ' "' + value + '"' : '') +
          '\n    but received: ' +
          curr.kind +
          '\n     at position: ' +
          curr.index,
      )
    }
    return token
  }

  const iterator = {
    [Symbol.iterator]() {
      return this
    },
    next,
    advance,
    peek,
    accept,
    expect,
    start: advance,
  }

  return iterator
}

export default (input) => [...tokenize(input)]
