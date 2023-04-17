<script lang="ts">
  import Dumpy from '../assets/dumpy.svg'
</script>

<!-- This is the "stitching" around the edge of this view -->
<svg class="box-border m-4" viewBox="0 0 1 1" preserveAspectRatio="none">
  <!-- The magic here comes from the `non-scaling-stroke` effect -->
  <path
    d="M0,0L1,0 1,1 0,1Z"
    vector-effect="non-scaling-stroke"
    fill="none"
    stroke-width="8px"
    stroke-dasharray="16px"
    class="stroke-stone-300"
  />
</svg>

<div
  class="flex flex-col items-center gap-8 max-w-sm place-self-center text-2xl text-center"
>
  <img
    src={Dumpy}
    alt="Dumpy, a characterization of a crash dump file with a smile"
    class="w-64 h-64"
  />
  <div
    class="flex flex-col gap-2 p-4 pt-2 bg-stone-50 border-stone-300 border-4"
  >
    <!-- TODO: chat bubble chip -->
    <p>Hiya, I'm <strong class="text-4xl font-black">Dumpy.</strong></p>
    <p>I'm the crash dump assistant and my job is to help you.</p>
  </div>
  <div class="intro-3 flex flex-col gap-2 items-center">
    <p class="text-4xl font-black">Drop your dump anywhere</p>
    <p class="text-stone-500">(or click to pick a file)</p>
  </div>
</div>
