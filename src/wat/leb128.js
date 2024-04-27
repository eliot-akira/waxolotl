export function* bigint(n) {
  n = to_int64(n)
  while (true) {
    const byte = Number(n & 0x7fn)
    n >>= 7n
    if (
      (n === 0n && (byte & 0x40) === 0) ||
      (n === -1n && (byte & 0x40) !== 0)
    ) {
      yield byte
      break
    }
    yield byte | 0x80
  }
}

export function* int(value) {
  let byte = 0x00
  const size = Math.ceil(Math.log2(Math.abs(value)))
  const negative = value < 0
  let more = true

  while (more) {
    byte = value & 127
    value = value >> 7

    if (negative) {
      value = value | -(1 << (size - 7))
    }

    if (
      (value == 0 && (byte & 0x40) == 0) ||
      (value == -1 && (byte & 0x40) == 0x40)
    ) {
      more = false
    } else {
      byte = byte | 128
    }

    yield byte
  }
}

export function* uint(value, pad = 0) {
  if (value < 0)
    throw new TypeError('uint value must be positive, received: ' + value)

  let byte = 0x00

  do {
    byte = value & 0x7f
    value = value >> 0x07

    if (value != 0 || pad > 0) {
      byte = byte | 0x80
    }

    yield byte

    pad--
  } while (value != 0 || pad > -1)
}

const byteView = new DataView(new BigInt64Array(1).buffer)

export function to_int64(value) {
  byteView.setBigInt64(0, value)
  return byteView.getBigInt64(0)
}

// function to_uint64 (value) {
//   byteView.setBigUint64(0, value)
//   return byteView.getBigUint64(0)
// }

export function* f32(value) {
  byteView.setFloat32(0, value)
  for (let i = 4; i--; ) yield byteView.getUint8(i)
}

export function* f64(value) {
  byteView.setFloat64(0, value)
  for (let i = 8; i--; ) yield byteView.getUint8(i)
}

// https://github.com/xtuc/webassemblyjs/blob/master/packages/floating-point-hex-parser/src/index.js
export function hex2float(input) {
  input = input.toUpperCase()
  const splitIndex = input.indexOf('P')
  let mantissa, exponent

  if (splitIndex !== -1) {
    mantissa = input.substring(0, splitIndex)
    exponent = parseInt(input.substring(splitIndex + 1))
  } else {
    mantissa = input
    exponent = 0
  }

  const dotIndex = mantissa.indexOf('.')

  if (dotIndex !== -1) {
    let integerPart = parseInt(mantissa.substring(0, dotIndex), 16)
    const sign = Math.sign(integerPart)
    integerPart = sign * integerPart
    const fractionLength = mantissa.length - dotIndex - 1
    const fractionalPart = parseInt(mantissa.substring(dotIndex + 1), 16)
    const fraction =
      fractionLength > 0 ? fractionalPart / Math.pow(16, fractionLength) : 0
    if (sign === 0) {
      if (fraction === 0) {
        mantissa = sign
      } else {
        if (Object.is(sign, -0)) {
          mantissa = -fraction
        } else {
          mantissa = fraction
        }
      }
    } else {
      mantissa = sign * (integerPart + fraction)
    }
  } else {
    mantissa = parseInt(mantissa, 16)
  }

  return mantissa * (splitIndex !== -1 ? Math.pow(2, exponent) : 1)
}

const F32_SIGN = 0x80000000
const F32_NAN = 0x7f800000

export function* nanbox32(input) {
  let value = parseInt(input.split('nan:')[1])
  value |= F32_NAN
  if (input[0] === '-') value |= F32_SIGN

  byteView.setInt32(0, value)
  for (let i = 4; i--; ) yield byteView.getUint8(i)
}

const F64_SIGN = 0x8000000000000000n
const F64_NAN = 0x7ff0000000000000n

export function* nanbox64(input) {
  let value = BigInt(input.split('nan:')[1])
  value |= F64_NAN
  if (input[0] === '-') value |= F64_SIGN

  byteView.setBigInt64(0, value)
  for (let i = 8; i--; ) yield byteView.getUint8(i)
}
