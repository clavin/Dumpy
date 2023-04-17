use std::{collections::HashMap};

use minidump::Minidump;
use minidump_processor::{Symbolizer, process_minidump, string_symbol_supplier, ProcessState};
use wasm_bindgen::prelude::*;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct SymbolStore {
    symbols: HashMap<String, String>,
    symbolizer: Option<Symbolizer>
}

impl SymbolStore {
    fn get_symbolizer(&mut self) -> &Symbolizer {
        self.symbolizer.get_or_insert_with(|| {
            Symbolizer::new(string_symbol_supplier(self.symbols.clone()))
        })
    }
}

#[wasm_bindgen]
pub fn init_symbol_store() -> SymbolStore {
    SymbolStore { symbols: HashMap::new(), symbolizer: None }
}

#[wasm_bindgen]
pub fn add_symbol(store: &mut SymbolStore, name: String, symbol: String) {
    store.symbols.insert(name, symbol);
    store.symbolizer = None;
}

#[wasm_bindgen]
pub struct Dump {
    minidump: Minidump<'static, Box<[u8]>>,
    proc_state: ProcessState,
}

impl Dump {
    async fn process(minidump: Minidump<'static, Box<[u8]>>, symbol_store: &mut SymbolStore) -> Result<Self, String> {
        let symbolizer = symbol_store.get_symbolizer();
        let proc_state = process_minidump(&minidump, symbolizer).await.map_err(err_to_str)?;

        Ok(Self {
            minidump,
            proc_state,
        })
    }

    async fn reprocess(&mut self, symbol_store: &mut SymbolStore) -> Result<(), String> {
        self.proc_state = process_minidump(&self.minidump, symbol_store.get_symbolizer()).await.map_err(err_to_str)?;

        Ok(())
    }
}

#[wasm_bindgen]
pub async fn process_new_dump(data: Box<[u8]>, symbol_store: &mut SymbolStore) -> Result<Dump, String> {
    let minidump = Minidump::read(data).map_err(err_to_str)?;
    Dump::process(minidump, symbol_store).await
}

#[wasm_bindgen]
pub async fn reprocess_dump(dump: &mut Dump, symbol_store: &mut SymbolStore) -> Result<(), String> {
    dump.reprocess(symbol_store).await
}

#[wasm_bindgen]
pub fn dump_json(dump: &Dump) -> Result<String, String> {
    let mut json_raw = vec![];
    dump.proc_state.print_json(&mut json_raw, false).map_err(err_to_str)?;
    String::from_utf8(json_raw).map_err(err_to_str)
}

fn err_to_str(err: impl std::error::Error) -> String {
    format!("{:?}", err)
}


