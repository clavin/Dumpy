<script lang="ts">
  import Icon from '../components/Icon.svelte'
  import CrashStar from '../assets/CrashStar.svg'
  import CPU from '../assets/CPU.svg'
  import Threads from '../assets/Threads.svg'
  import Boom from '../assets/Boom.svg'

  import type { Dump } from '../data/dump'

  export let dump: Dump

  $: isExceptionEmpty =
    dump.exception.processId === undefined &&
    dump.exception.type === undefined &&
    dump.exception.addr === undefined &&
    dump.exception.msg === undefined &&
    dump.exception.os === undefined

  $: isCpuEmpty =
    dump.cpu.arch === undefined &&
    dump.cpu.coreCount === undefined &&
    dump.cpu.microcodeVersion === undefined &&
    dump.cpu.note === undefined
</script>

<article>
  <section>
    <header>
      <Icon href={CrashStar} class="icon" style="color: #BD30FF" />
      <h2>Exception</h2>
    </header>

    {#if dump.exception.processId !== undefined}
      <span>Process ID:</span>
      <p>{dump.exception.processId}</p>
    {/if}

    {#if dump.exception.type !== undefined}
      <span><strong>Type:</strong></span>
      <p><strong>{dump.exception.type}</strong></p>
    {/if}

    {#if dump.exception.addr !== undefined}
      <span><strong>Address:</strong></span>
      <p><strong>{dump.exception.addr}</strong></p>
    {/if}

    {#if dump.exception.msg !== undefined}
      <span>Message:</span>
      <p class="quoted">{dump.exception.msg}</p>
    {/if}

    {#if dump.exception.os !== undefined}
      <span>OS:</span>
      <p>{dump.exception.os}</p>
    {/if}

    {#if isExceptionEmpty}
      <p class="empty"><em>No information.</em></p>
    {/if}
  </section>
  <section>
    <header>
      <Icon href={CPU} class="icon" style="color: #00DB16" />
      <h2>CPU</h2>
    </header>

    {#if dump.cpu.arch !== undefined}
      <span><strong>Architecture:</strong></span>
      <p><strong>{dump.cpu.arch}</strong></p>
    {/if}

    {#if dump.cpu.coreCount !== undefined}
      <span>Cores:</span>
      <p>{dump.cpu.coreCount} {dump.cpu.coreCount === 1 ? 'core' : 'cores'}</p>
    {/if}

    {#if dump.cpu.microcodeVersion !== undefined}
      <span>Microcode:</span>
      <p>v{dump.cpu.microcodeVersion}</p>
    {/if}

    {#if dump.cpu.note !== undefined}
      <span>Note:</span>
      <p class="quoted">{dump.cpu.note}</p>
    {/if}

    {#if isCpuEmpty}
      <p class="empty"><em>No information.</em></p>
    {/if}
  </section>
  <section class="col-span-2">
    <header>
      <Icon href={Threads} class="icon" style="color: #FF3737" />
      <h2>Threads</h2>
    </header>

    {#if dump.threads.length > 0}
      <span class="cause-label">
        <Icon href={Boom} class="icon" />
        <strong>Caused by:</strong>
      </span>
      <p class="cause">
        <strong>
          {dump.threads[0].name ?? '<unknown>'}
        </strong>
      </p>

      {#each dump.threads[0].frames as frame, i}
        <span>{i === 0 ? 'Stacktrace: ' : ''}{i}</span>
        <p class="stack-frame">
          {#if frame.module !== undefined}
            <span class="module">{frame.module}</span>
          {:else if frame.absOffset !== undefined}
            <span class="abs-offset">{frame.absOffset}</span>
          {:else}
            <span>{'<unknown>'}</span>
          {/if}

          {#if frame.fnName !== undefined}
            <span class="fn">
              <strong>
                {frame.fnName}
              </strong>
            </span>
            {#if frame.fnOffset !== undefined}
              <span class="fn-offset">+{frame.fnOffset}</span>
            {/if}
          {:else if frame.module !== undefined && frame.moduleOffset !== undefined}
            +{frame.moduleOffset}
          {/if}
        </p>
      {/each}
    {:else}
      <p class="empty"><em>No information.</em></p>
    {/if}
  </section>
</article>

<style lang="postcss">
  article {
    @apply grid p-8 pb-16 pt-36;
    gap: 5rem 1.5rem;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: max-content;
    max-width: 90rem;
    height: fit-content;
  }

  section {
    @apply grid;
    gap: 0.25rem 0.75rem;
    grid-template-columns: 7rem 1fr;
    grid-auto-rows: max-content;
  }

  header {
    @apply flex flex-col gap-1 pb-3;
    grid-column-start: 2;
  }
  header > :global(.icon) {
    width: 4.5rem;
    height: 4.5rem;
    margin-left: -0.75rem;
  }
  header > h2 {
    @apply text-2xl font-black;
  }

  section > span {
    @apply self-start justify-self-end text-sm text-stone-500;
  }
  section > p {
    @apply self-start justify-self-start font-monospace text-sm;
  }
  section > p.empty {
    grid-column-start: 2;
  }
  section > p.quoted:before {
    content: '“';
    margin-left: -1ch;
  }
  section > p.quoted:after {
    content: '”';
  }

  .cause-label {
    @apply flex flex-row items-center gap-1 text-red-600;
  }
  .cause-label > :global(.icon) {
    width: 1.5rem;
    height: 1.5rem;
  }

  .stack-frame > .module {
    @apply bg-stone-700 px-2 py-1 text-stone-100;
  }
</style>
