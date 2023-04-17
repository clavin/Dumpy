import {
  process_new_dump,
  reprocess_dump,
  dump_json,
  SymbolStore,
} from '@dumpy/wasm'

export interface Dump {
  exception: {
    processId?: number
    type?: string
    addr?: string
    msg?: string
    os?: string
  }
  cpu: {
    arch?: string
    coreCount?: number
    microcodeVersion?: number
    note?: string
  }
  threads: {
    name?: string
    // TODO: lastError?: string;
    frames: {
      registers?: Record<string, string>
      absOffset?: string
      module?: string
      moduleOffset?: string
      fnName?: string
      fnOffset?: string
      srcLine?: number
      symbolsMissing?: boolean
    }[]
  }[]
  modules: {
    fileName?: string
    main?: boolean
    baseAddr?: string
  }[]
}

export type DumpError =
  | { kind: 'todo' }
  | { kind: 'raw parse error'; err: Error }

type DeepPartialAndNullable<T> = {
  [K in keyof T]?: DeepPartialAndNullable<T[K]> | null | undefined
}

type RawDump = DeepPartialAndNullable<{
  pid: number
  crash_info: {
    type: string
    address: string
    assertion: string
  }
  system_info: {
    os: string
    os_ver: string
    cpu_arch: string
    cpu_info: string
    cpu_count: number
    cpu_microcode_version: number
  }
  threads: {
    thread_name: string
    // TODO: last_error_value: string
    frames: {
      registers: Record<string, string>
      offset: string
      module: string
      module_offset: string
      function: string
      function_offset: string
      file: string
      line: number
      missing_symbols: boolean
    }[]
  }[]
  main_module: number
  modules: {
    base_addr: string
    filename: string
  }[]
}>

function exists<T>(t: T | null | undefined): t is T {
  return t !== null && t !== undefined
}

function setIfExists<T, K extends keyof T>(
  target: T,
  key: K,
  t: T[K] | null | undefined
) {
  if (exists(t)) {
    target[key] = t
  }
}

function prettyOS(os: string, osVersion: string | null | undefined): string {
  let prettyOS: string
  switch (os.toLowerCase()) {
    case 'mac os x':
      prettyOS = 'macOS'
      break
    case 'windows nt':
      prettyOS = 'Windows'
      break
    default:
      prettyOS = os
      break
  }

  return prettyOS + (exists(osVersion) ? ' ' + osVersion : '')
}

export async function parseDumpFile(
  data: Uint8Array,
  symbolStore: SymbolStore
): Promise<{ ok: true; dump: Dump } | { ok: false; err: DumpError }> {
  let rawDump: RawDump
  try {
    const dump = await process_new_dump(data, symbolStore)
    rawDump = JSON.parse(dump_json(dump))
    dump.free()
  } catch (err) {
    return {
      ok: false,
      err: { kind: 'raw parse error', err },
    }
  }

  // Note: this object is mutated throughout this function
  const dump: Dump = {
    exception: {},
    cpu: {},
    threads: [],
    modules: [],
  }

  setIfExists(dump.exception, 'processId', rawDump.pid)

  if (exists(rawDump.crash_info)) {
    const info = rawDump.crash_info

    setIfExists(dump.exception, 'type', info.type)
    setIfExists(dump.exception, 'addr', info.address)
    setIfExists(dump.exception, 'msg', info.assertion)
  }

  if (exists(rawDump.system_info)) {
    const info = rawDump.system_info

    if (exists(info.os)) {
      dump.exception.os = prettyOS(info.os, info.os_ver)
    }

    setIfExists(dump.cpu, 'arch', info.cpu_arch)
    setIfExists(dump.cpu, 'coreCount', info.cpu_count)
    setIfExists(dump.cpu, 'microcodeVersion', info.cpu_microcode_version)
    setIfExists(dump.cpu, 'note', info.cpu_info)
  }

  if (exists(rawDump.threads)) {
    for (const rawThread of rawDump.threads) {
      const frames = exists(rawThread.frames)
        ? rawThread.frames.map(rawFrame => {
            const frame: Dump['threads'][number]['frames'][number] = {}

            setIfExists(frame, 'registers', rawFrame.registers)
            setIfExists(frame, 'absOffset', rawFrame.offset)
            setIfExists(frame, 'module', rawFrame.module)
            setIfExists(frame, 'moduleOffset', rawFrame.module_offset)
            setIfExists(frame, 'fnName', rawFrame.function)
            setIfExists(frame, 'fnOffset', rawFrame.function_offset)
            setIfExists(frame, 'srcLine', rawFrame.line)
            setIfExists(frame, 'symbolsMissing', rawFrame.missing_symbols)

            return frame
          })
        : []

      const thread: Dump['threads'][number] = { frames }
      setIfExists(thread, 'name', rawThread.thread_name)

      dump.threads.push(thread)
    }
  }

  if (exists(rawDump.modules)) {
    rawDump.modules.forEach((rawModule, i) => {
      const module: Dump['modules'][number] = {}

      setIfExists(module, 'fileName', rawModule.filename)
      setIfExists(module, 'baseAddr', rawModule.base_addr)

      if (exists(rawDump.main_module)) {
        module.main = i === rawDump.main_module
      }

      dump.modules.push(module)
    })
  }

  return {
    ok: true,
    dump,
  }
}
