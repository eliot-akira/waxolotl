/*
 * [modified]: Modifications belong in the public domain.
 *
 * Original source: https://github.com/j-s-n/WebBS/blob/master/compiler/byteCode.js#L369
 */

import { wrap_instr } from './binary.js'

export const BYTE = {
  'type.i32': 0x7f,
  'type.i64': 0x7e,
  'type.f32': 0x7d,
  'type.f64': 0x7c,
  'type.void': 0x40,
  'type.func': 0x60,
  'type.funcref': 0x70,
  'section.custom': 0,
  'section.type': 1,
  'section.import': 2,
  'section.function': 3,
  'section.table': 4,
  'section.memory': 5,
  'section.global': 6,
  'section.export': 7,
  'section.start': 8,
  'section.element': 9,
  'section.code': 10,
  'section.data': 11,
  'import.func': 0x00,
  'import.table': 0x01,
  'import.memory': 0x02,
  'import.global': 0x03,
  'export.function': 0x00,
  'export.table': 0x01,
  'export.memory': 0x02,
  'export.global': 0x03,
  'global.const': 0x00,
  'global.var': 0x01,
  'global.mut': 0x01,
  'limits.min': 0x00,
  'limits.minmax': 0x01,
  'limits.shared': 0x03,
}

/*
  The WebAssembly binary encoding documentation specifies all the instruction byte codes.
  See the MVP documentation (which is no longer maintained):
    https://webassembly.org/docs/binary-encoding/
  Or the normative post-MVP documentation (which is much more precise and complete, if perhaps less readable):
    http://webassembly.github.io/spec/core/binary/index.html

  This is a consecutive list of the entire range of instruction codes (with 0s in place of unused/reserved spaces).
  The codeTable is populated by assigning 0x00 to 'unreachable', 0x01 to 'nop', and so on (skipping the unused slots).
*/
const opCodes = [
  'unreachable',
  'nop',
  'block',
  'loop',
  'if',
  'else',

  ,
  ,
  ,
  ,
  ,
  'end',
  'br',
  'br_if',
  'br_table',
  'return',
  'call',
  'call_indirect',

  ,
  ,
  ,
  ,
  ,
  ,
  ,
  ,
  'drop',
  'select',

  ,
  ,
  ,
  ,
  'local.get',
  'local.set',
  'local.tee',
  'global.get',
  'global.set',

  ,
  ,
  ,
  'i32.load',
  'i64.load',
  'f32.load',
  'f64.load',
  'i32.load8_s',
  'i32.load8_u',
  'i32.load16_s',
  'i32.load16_u',
  'i64.load8_s',
  'i64.load8_u',
  'i64.load16_s',
  'i64.load16_u',
  'i64.load32_s',
  'i64.load32_u',

  'i32.store',
  'i64.store',
  'f32.store',
  'f64.store',
  'i32.store8',
  'i32.store16',
  'i64.store8',
  'i64.store16',
  'i64.store32',

  'memory.size',
  'memory.grow',

  'i32.const',
  'i64.const',
  'f32.const',
  'f64.const',
  'i32.eqz',
  'i32.eq',
  'i32.ne',
  'i32.lt_s',
  'i32.lt_u',
  'i32.gt_s',
  'i32.gt_u',
  'i32.le_s',
  'i32.le_u',
  'i32.ge_s',
  'i32.ge_u',
  'i64.eqz',
  'i64.eq',
  'i64.ne',
  'i64.lt_s',
  'i64.lt_u',
  'i64.gt_s',
  'i64.gt_u',
  'i64.le_s',
  'i64.le_u',
  'i64.ge_s',
  'i64.ge_u',
  'f32.eq',
  'f32.ne',
  'f32.lt',
  'f32.gt',
  'f32.le',
  'f32.ge',
  'f64.eq',
  'f64.ne',
  'f64.lt',
  'f64.gt',
  'f64.le',
  'f64.ge',

  'i32.clz',
  'i32.ctz',
  'i32.popcnt',
  'i32.add',
  'i32.sub',
  'i32.mul',
  'i32.div_s',
  'i32.div_u',
  'i32.rem_s',
  'i32.rem_u',
  'i32.and',
  'i32.or',
  'i32.xor',
  'i32.shl',
  'i32.shr_s',
  'i32.shr_u',
  'i32.rotl',
  'i32.rotr',
  'i64.clz',
  'i64.ctz',
  'i64.popcnt',
  'i64.add',
  'i64.sub',
  'i64.mul',
  'i64.div_s',
  'i64.div_u',
  'i64.rem_s',
  'i64.rem_u',
  'i64.and',
  'i64.or',
  'i64.xor',
  'i64.shl',
  'i64.shr_s',
  'i64.shr_u',
  'i64.rotl',
  'i64.rotr',

  'f32.abs',
  'f32.neg',
  'f32.ceil',
  'f32.floor',
  'f32.trunc',
  'f32.nearest',
  'f32.sqrt',
  'f32.add',
  'f32.sub',
  'f32.mul',
  'f32.div',
  'f32.min',
  'f32.max',
  'f32.copysign',
  'f64.abs',
  'f64.neg',
  'f64.ceil',
  'f64.floor',
  'f64.trunc',
  'f64.nearest',
  'f64.sqrt',
  'f64.add',
  'f64.sub',
  'f64.mul',
  'f64.div',
  'f64.min',
  'f64.max',
  'f64.copysign',

  'i32.wrap_i64',

  'i32.trunc_f32_s',
  'i32.trunc_f32_u',
  'i32.trunc_f64_s',
  'i32.trunc_f64_u',
  'i64.extend_i32_s',
  'i64.extend_i32_u',
  'i64.trunc_f32_s',
  'i64.trunc_f32_u',
  'i64.trunc_f64_s',
  'i64.trunc_f64_u',

  'f32.convert_i32_s',
  'f32.convert_i32_u',
  'f32.convert_i64_s',
  'f32.convert_i64_u',
  'f32.demote_f64',
  'f64.convert_i32_s',
  'f64.convert_i32_u',
  'f64.convert_i64_s',
  'f64.convert_i64_u',
  'f64.promote_f32',

  'i32.reinterpret_f32',
  'i64.reinterpret_f64',
  'f32.reinterpret_i32',
  'f64.reinterpret_i64',
]

const alias = {
  get_local: 'local.get',
  set_local: 'local.set',
  tee_local: 'local.tee',
  get_global: 'global.get',
  set_global: 'global.set',

  'i32.trunc_s/f32': 'i32.trunc_f32_s',
  'i32.trunc_u/f32': 'i32.trunc_f32_u',
  'i32.trunc_s/f64': 'i32.trunc_f64_s',
  'i32.trunc_u/f64': 'i32.trunc_f64_u',
  'i64.extend_s/i32': 'i64.extend_i32_s',
  'i64.extend_u/i32': 'i64.extend_i32_u',
  'i64.trunc_s/f32': 'i64.trunc_f32_s',
  'i64.trunc_u/f32': 'i64.trunc_f32_u',
  'i64.trunc_s/f64': 'i64.trunc_f64_s',
  'i64.trunc_u/f64': 'i64.trunc_f64_u',

  'f32.convert_s/i32': 'f32.convert_i32_s',
  'f32.convert_u/i32': 'f32.convert_i32_u',
  'f32.convert_s/i64': 'f32.convert_i64_s',
  'f32.convert_u/i64': 'f32.convert_i64_u',
  'f32.demote/f64': 'f32.demote_f64',

  'f64.convert_s/i32': 'f64.convert_i32_s',
  'f64.convert_u/i32': 'f64.convert_i32_u',
  'f64.convert_s/i64': 'f64.convert_i64_s',
  'f64.convert_u/i64': 'f64.convert_i64_u',
  'f64.promote/f32': 'f64.promote_f32',
}

// Use the above opCodes list to fill the codeTable, skipping reserved segments.
for (const [i, op] of opCodes.entries()) {
  if (op != null) {
    BYTE[op] = i
  }
}

BYTE['i32.trunc_sat_f32_s'] = [0xfc, 0x00]
BYTE['i32.trunc_sat_f32_u'] = [0xfc, 0x01]
BYTE['i32.trunc_sat_f64_s'] = [0xfc, 0x02]
BYTE['i32.trunc_sat_f64_u'] = [0xfc, 0x03]
BYTE['i64.trunc_sat_f32_s'] = [0xfc, 0x04]
BYTE['i64.trunc_sat_f32_u'] = [0xfc, 0x05]
BYTE['i64.trunc_sat_f64_s'] = [0xfc, 0x06]
BYTE['i64.trunc_sat_f64_u'] = [0xfc, 0x07]

BYTE['memory.init'] = [0xfc, 0x08]

BYTE['data.drop'] = [0xfc, 0x09]

BYTE['memory.copy'] = [0xfc, 0x0a]
BYTE['memory.fill'] = [0xfc, 0x0b]

BYTE['table.init'] = [0xfc, 0x0c]

BYTE['elem.drop'] = [0xfc, 0x0d]

BYTE['table.copy'] = [0xfc, 0x0e]
BYTE['table.grow'] = [0xfc, 0x0f]
BYTE['table.size'] = [0xfc, 0x10]
BYTE['table.fill'] = [0xfc, 0x11]

// alias old keywords
for (const name in alias) {
  const i = opCodes.indexOf(alias[name])
  BYTE[name] = i
}

export const INSTR = {}

for (const op in BYTE) {
  INSTR[op] = wrap_instr(op)
  const [group, method] = op.split('.')
  if (method != null) {
    BYTE[group] = BYTE[group] ?? {}
    BYTE[group][method] = BYTE[op]
    INSTR[group] = INSTR[group] ?? {}
    INSTR[group][method] = wrap_instr(op)
  }
}

// https://webassembly.github.io/spec/core/text/instructions.html#memory-instructions
export const ALIGN = {
  'i32.load': 4,
  'i64.load': 8,
  'f32.load': 4,
  'f64.load': 8,

  'i32.load8_s': 1,
  'i32.load8_u': 1,
  'i32.load16_s': 2,
  'i32.load16_u': 2,

  'i64.load8_s': 1,
  'i64.load8_u': 1,
  'i64.load16_s': 2,
  'i64.load16_u': 2,
  'i64.load32_s': 4,
  'i64.load32_u': 4,

  'i32.store': 4,
  'i64.store': 8,
  'f32.store': 4,
  'f64.store': 8,

  'i32.store8': 1,
  'i32.store16': 2,
  'i64.store8': 1,
  'i64.store16': 2,
  'i64.store32': 4,
}
