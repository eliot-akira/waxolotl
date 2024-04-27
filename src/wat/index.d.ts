export declare interface Options {
  metrics: boolean
}

export declare interface GlobalContext {
  globals: { name: string; vartype: string; type: string }[]
}

export declare interface Context {
  module: ModuleBuilder
  global: GlobalContext
}

declare const make: {
  (string: string, options?: Options, context?: Context): Uint8Array
}

export declare interface ModuleBuilder {}

export declare interface FunctionContext {}

declare const compile: {
  (node: Node): Context
}

declare type Node = any

declare const parse: {
  (s: any): Node
}

declare const tokenize: {
  (s: string): any
}

export { tokenize, parse, compile, make as default }
