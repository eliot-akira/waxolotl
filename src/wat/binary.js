/**
 * @private
 * [modified]: modifications belong in the public domain.
 *
 * Original source: https://github.com/surma/bfwasm
 * Original license:
 * Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// https://github.com/samthor/fast-text-encoding/blob/master/text.js
;(function (l) {
  function m() {}
  function k(a, c) {
    a = void 0 === a ? 'utf-8' : a
    c = void 0 === c ? { fatal: !1 } : c
    if (-1 === r.indexOf(a.toLowerCase()))
      throw new RangeError(
        "Failed to construct 'TextDecoder': The encoding label provided ('" +
          a +
          "') is invalid.",
      )
    if (c.fatal)
      throw Error(
        "Failed to construct 'TextDecoder': the 'fatal' option is unsupported.",
      )
  }
  function t(a) {
    return Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('utf-8')
  }
  function u(a) {
    var c = URL.createObjectURL(
      new Blob([a], { type: 'text/plain;charset=UTF-8' }),
    )
    try {
      var f = new XMLHttpRequest()
      f.open('GET', c, !1)
      f.send()
      return f.responseText
    } catch (e) {
      return q(a)
    } finally {
      URL.revokeObjectURL(c)
    }
  }
  function q(a) {
    for (
      var c = 0,
        f = Math.min(65536, a.length + 1),
        e = new Uint16Array(f),
        h = [],
        d = 0;
      ;

    ) {
      var b = c < a.length
      if (!b || d >= f - 1) {
        h.push(String.fromCharCode.apply(null, e.subarray(0, d)))
        if (!b) return h.join('')
        a = a.subarray(c)
        d = c = 0
      }
      b = a[c++]
      if (0 === (b & 128)) e[d++] = b
      else if (192 === (b & 224)) {
        var g = a[c++] & 63
        e[d++] = ((b & 31) << 6) | g
      } else if (224 === (b & 240)) {
        g = a[c++] & 63
        var n = a[c++] & 63
        e[d++] = ((b & 31) << 12) | (g << 6) | n
      } else if (240 === (b & 248)) {
        g = a[c++] & 63
        n = a[c++] & 63
        var v = a[c++] & 63
        b = ((b & 7) << 18) | (g << 12) | (n << 6) | v
        65535 < b &&
          ((b -= 65536),
          (e[d++] = ((b >>> 10) & 1023) | 55296),
          (b = 56320 | (b & 1023)))
        e[d++] = b
      }
    }
  }
  if (l.TextEncoder && l.TextDecoder) return !1
  var r = ['utf-8', 'utf8', 'unicode-1-1-utf-8']
  Object.defineProperty(m.prototype, 'encoding', { value: 'utf-8' })
  m.prototype.encode = function (a, c) {
    c = void 0 === c ? { stream: !1 } : c
    if (c.stream)
      throw Error("Failed to encode: the 'stream' option is unsupported.")
    c = 0
    for (
      var f = a.length,
        e = 0,
        h = Math.max(32, f + (f >>> 1) + 7),
        d = new Uint8Array((h >>> 3) << 3);
      c < f;

    ) {
      var b = a.charCodeAt(c++)
      if (55296 <= b && 56319 >= b) {
        if (c < f) {
          var g = a.charCodeAt(c)
          56320 === (g & 64512) &&
            (++c, (b = ((b & 1023) << 10) + (g & 1023) + 65536))
        }
        if (55296 <= b && 56319 >= b) continue
      }
      e + 4 > d.length &&
        ((h += 8),
        (h *= 1 + (c / a.length) * 2),
        (h = (h >>> 3) << 3),
        (g = new Uint8Array(h)),
        g.set(d),
        (d = g))
      if (0 === (b & 4294967168)) d[e++] = b
      else {
        if (0 === (b & 4294965248)) d[e++] = ((b >>> 6) & 31) | 192
        else if (0 === (b & 4294901760))
          (d[e++] = ((b >>> 12) & 15) | 224), (d[e++] = ((b >>> 6) & 63) | 128)
        else if (0 === (b & 4292870144))
          (d[e++] = ((b >>> 18) & 7) | 240),
            (d[e++] = ((b >>> 12) & 63) | 128),
            (d[e++] = ((b >>> 6) & 63) | 128)
        else continue
        d[e++] = (b & 63) | 128
      }
    }
    return d.slice ? d.slice(0, e) : d.subarray(0, e)
  }
  Object.defineProperty(k.prototype, 'encoding', { value: 'utf-8' })
  Object.defineProperty(k.prototype, 'fatal', { value: !1 })
  Object.defineProperty(k.prototype, 'ignoreBOM', { value: !1 })
  var p = q
  'function' === typeof Buffer && Buffer.from
    ? (p = t)
    : 'function' === typeof Blob &&
      'function' === typeof URL &&
      'function' === typeof URL.createObjectURL &&
      (p = u)
  k.prototype.decode = function (a, c) {
    c = void 0 === c ? { stream: !1 } : c
    if (c.stream)
      throw Error("Failed to decode: the 'stream' option is unsupported.")
    a =
      a instanceof Uint8Array
        ? a
        : a.buffer instanceof ArrayBuffer
          ? new Uint8Array(a.buffer)
          : new Uint8Array(a)
    return p(a)
  }
  l.TextEncoder = m
  l.TextDecoder = k
})(
  'undefined' !== typeof window
    ? window
    : 'undefined' !== typeof global
      ? global
      : globalThis,
)

import { BYTE } from './const.js'
import { bigint, f32, f64, int, uint } from './leb128.js'

export function wrap_instr(code) {
  return function (args, exprs) {
    return instr(
      code,
      args != null && !Array.isArray(args) ? [args] : args,
      exprs != null && !Array.isArray(exprs) ? [exprs] : exprs,
    )
  }
}

const encoding = {
  'f64.const': f64,
  'f32.const': f32,
}

export function* instr(code, args = [], exprs = []) {
  for (let expr of exprs) {
    switch (typeof expr) {
      case 'number':
        yield expr
        break
      default:
        yield* expr
        break
    }
  }
  yield* Array.isArray(BYTE[code]) ? BYTE[code] : [BYTE[code]]
  for (let arg of args) {
    switch (typeof arg) {
      case 'bigint':
        yield* bigint(arg)
        break
      case 'number':
        yield* (encoding[code] ?? int)(arg)
        break
      default:
        yield* arg
    }
  }
}

const encoder = new TextEncoder('utf-8')
export function utf8(s) {
  return [...encoder.encode(s)]
}

export function header() {
  return [...utf8('\0asm'), 1, 0, 0, 0]
}

export function section(type, data) {
  return [BYTE.section[type], ...uint(data.length), ...data]
}

export function vector(items) {
  return [...uint(items.length), ...items.flat()]
}

function locals(items) {
  const out = []
  let curr = []
  let prev

  for (const type of items) {
    if (type !== prev && curr.length) {
      out.push([...uint(curr.length), BYTE.type[curr[0]]])
      curr = []
    }
    curr.push(type)
    prev = type
  }

  if (curr.length) out.push([...uint(curr.length), BYTE.type[curr[0]]])

  return out
}

function limits(min, max, shared) {
  if (shared != null) {
    return [BYTE.limits.shared, ...uint(min), ...uint(max)]
  } else if (max != null) {
    return [BYTE.limits.minmax, ...uint(min), ...uint(max)]
  } else {
    return [BYTE.limits.min, ...uint(min)]
  }
}

section.type = function (types) {
  return section(
    'type',
    vector(
      types.map(([params, results]) => [
        BYTE.type.func,
        ...vector(params.map((x) => BYTE.type[x])),
        ...vector(results.map((x) => BYTE.type[x])),
      ]),
    ),
  )
}

section.import = function (imported) {
  return section(
    'import',
    vector(
      imported.map(([mod, field, type, desc]) => [
        ...vector(utf8(mod)),
        ...vector(utf8(field)),
        BYTE.import[type],
        ...{
          func: () => desc.map((idx) => [...uint(idx)]),
          memory: () => limits(...desc),
        }[type](),
      ]),
    ),
  )
}

section.function = function (funcs) {
  return section('function', vector(funcs.map((func) => [...uint(func)])))
}

section.table = function (tables) {
  return section(
    'table',
    vector(
      tables.map(([type, min, max]) => [BYTE.type[type], ...limits(min, max)]),
    ),
  )
}

section.memory = function (memories) {
  return section(
    'memory',
    vector(memories.map(([min, max]) => limits(min, max))),
  )
}

section.global = function (globals) {
  return section(
    'global',
    vector(
      globals.map(([mut, valtype, expr]) => [
        BYTE.type[valtype],
        BYTE.global[mut],
        ...expr,
        BYTE.end,
      ]),
    ),
  )
}

section.export = function (exports) {
  return section(
    'export',
    vector(
      exports.map(([name, type, idx]) => [
        ...vector(utf8(name)),
        BYTE.export[type],
        ...uint(idx),
      ]),
    ),
  )
}

section.start = function (func_idx) {
  return section('start', [...uint(func_idx)])
}

section.element = function (elements) {
  return section(
    'element',
    vector(
      elements.map(([table_idx, offset_idx_expr, funcs]) => [
        ...uint(table_idx),
        ...offset_idx_expr,
        BYTE.end,
        ...vector(funcs),
      ]),
    ),
  )
}

section.code = function (funcs) {
  return section(
    'code',
    vector(
      funcs.map(([func_locals, func_body]) =>
        vector([...vector(locals(func_locals)), ...func_body, BYTE.end]),
      ),
    ),
  )
}

section.data = function (data) {
  return section(
    'data',
    vector(
      data.map(([mem_idx, offset_idx_expr, bytes]) => [
        ...uint(mem_idx),
        ...offset_idx_expr,
        BYTE.end,
        ...vector(bytes),
      ]),
    ),
  )
}
