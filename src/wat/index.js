import ModuleBuilder from './builder.js'
import compile, { GlobalContext, FunctionContext } from './compiler.js'
import { tokenize } from './lexer.js'
import parse from './parser.js'

export { tokenize }
export { parse }
export { compile }
export { ModuleBuilder, GlobalContext, FunctionContext }

/**
 * Compiles a WAT source string to a buffer.
 *
 * ```js
 * import compile from 'wat-compiler'
 * const buffer = compile('(func (export "answer") (result i32) (i32.const 42))')
 * const mod = new WebAssembly.Module(buffer)
 * const instance = new WebAssembly.Instance(mod)
 * console.log(instance.exports.answer()) // => 42
 * ```
 *
 * @param {string} code The WAT code to compile
 * @param {Options} options An options object
 * @param {boolean} options.metrics Enable metrics with console.time
 * @param {Context} context
 * @param {ModuleBuilder} context.module
 * @param {GlobalContext} context.global
 * @returns {Uint8Array} The buffer to be passed on to WebAssembly
 */
export default function make(code, options, context = {}) {
  return compile(
    parse(tokenize('(module ' + code + ')')),
    context.module,
    context.global,
  ).module.build(options).buffer
}
