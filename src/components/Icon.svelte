<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let href: string

  export let width: number = 1
  export let height: number = 1

  let className: string | undefined = undefined
  export { className as class }

  export let style: string | undefined = undefined

  const dispatch = createEventDispatcher()

  function activate() {
    dispatch('activate')
  }
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox={`0 0 ${width} ${height}`}
  class={className}
  {style}
  on:click={activate}
  on:keypress={activate}
>
  <use {width} {height} href={`${href}#icon`} fill="currentColor" />
</svg>
