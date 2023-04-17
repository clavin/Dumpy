<script lang="ts">
  import Empty from './views/Empty.svelte'
  import Sidebar from './views/Sidebar.svelte'
  import Detail from './views/Detail.svelte'

  import { parseDumpFile, type Dump } from './data/dump'
  import { initSymbolStore } from './data/symbols'

  /** The input element for selecting the dump file. */
  let dumpFileInput: HTMLInputElement

  let dump: Dump | undefined = undefined

  const symbolStore = initSymbolStore()

  async function fileDumpChanged(event: Event) {
    const { files } = event.target as HTMLInputElement

    if (files.length < 1) {
      return
    }

    const rawData = await files[0].arrayBuffer()
    const data = new Uint8Array(rawData)

    const result = await parseDumpFile(data, symbolStore)
    if (result.ok) {
      dump = result.dump
    } else if (result.ok === false) {
      console.error('Failed to parse dump file:', result.err)
    }
  }

  function clearDump() {
    dumpFileInput.value = ''
    dump = undefined
  }
</script>

<!-- TODO: on:dragenter, on:dragleave, on:drop -->
<main class="grid" style="grid-template: 100% / 18rem 1fr">
  <div class="bg-stone-200 overflow-scroll">
    <Sidebar
      state={dump === undefined ? undefined : { status: 'ok' }}
      on:clear-dump={clearDump}
    />
  </div>
  <div class="bg-stone-50 z-stack overflow-scroll">
    {#if dump === undefined}
      <Empty />
    {:else}
      <Detail {dump} />
    {/if}
  </div>
</main>

<!-- This file input lives during the whole app so we always have access to the file. -->
<input
  type="file"
  accept=".dmp"
  class="opacity-0"
  class:hidden={dump !== undefined}
  on:change={fileDumpChanged}
  bind:this={dumpFileInput}
/>
