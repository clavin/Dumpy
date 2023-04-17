import { init_symbol_store, type SymbolStore } from '@dumpy/wasm'

export function initSymbolStore(): SymbolStore {
  return init_symbol_store()
}
