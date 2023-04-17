<script lang="ts">
  import Icon from '../components/Icon.svelte'

  import DumpyHappy from '../assets/Dumpy-Happy.svg'
  import DumpyNeutral from '../assets/Dumpy-Neutral.svg'
  import DumpyError from '../assets/Dumpy-Error.svg'

  import CrashStar from '../assets/CrashStar.svg'
  import CPU from '../assets/CPU.svg'
  import Threads from '../assets/Threads.svg'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let state:
    | { status: 'ok' }
    | { status: 'error'; message: string }
    | undefined = undefined

  $: isOk = state?.status === 'ok'
  $: isError = state?.status === 'error'

  $: dumpyIcon = isOk ? DumpyHappy : isError ? DumpyError : DumpyNeutral

  function clearDump() {
    if (state !== undefined && state.status === 'ok') {
      dispatch('clear-dump')
    }
  }
</script>

<!--
  TODO:
  - make the list items actually clickable
-->

<nav class={isOk ? 'text-stone-600' : 'text-stone-400'}>
  <Icon
    href={dumpyIcon}
    width={isError ? 40 : 28}
    height={36}
    class={`dumpy-icon ${isError ? 'is-error' : ''}`}
    on:activate={clearDump}
  />

  <Icon href={CrashStar} class={`icon ${isOk ? 'text-fuchsia-600' : ''}`} />
  <span>Exception</span>

  <Icon href={CPU} class={`icon ${isOk ? 'text-green-600' : ''}`} />
  <span>CPU</span>

  <Icon
    href={Threads}
    class={`icon ${isOk ? 'text-red-600' : ''}`}
    style="grid-row-start: 5"
  />
  <span style="grid-row-start: 5">Threads</span>
</nav>

<style lang="postcss">
  nav {
    @apply grid w-full p-8 pt-12;
    gap: 0.75rem 0.5rem;
    grid-template: 5.25rem 1.5rem 1.5rem 3rem 1.5rem / 2rem 1fr;
  }
  nav > span {
    @apply self-center text-base;
    grid-column-start: 2;
  }
  nav > :global(.dumpy-icon) {
    @apply h-9 w-7 self-start justify-self-end;
    grid-row-start: 1;
  }
  nav > :global(.dumpy-icon.is-error) {
    @apply w-10 text-red-700;
  }
  nav > :global(.icon) {
    @apply h-6 w-6 self-center justify-self-end;
    grid-column-start: 1;
  }
</style>
