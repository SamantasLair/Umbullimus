<template>
  <div
    class="siger-decor-wrap"
    :style="{ width: size + 'px', opacity: opacity }"
    aria-hidden="true"
    ref="wrapEl"
  >
    <svg
      :width="size"
      :height="Math.round(size * (550 / 1000))"
      viewBox="0 0 1000 550"
      fill="var(--c-siger)"
      :fill-opacity="fillOpacity"
      xmlns="http://www.w3.org/2000/svg"
      class="siger-svg"
    >
      <path
        ref="pathEl"
        d="M 500 25 C 475 115, 455 180, 438 205 C 422 170, 402 140, 385 125 C 365 190, 345 240, 330 265 C 315 240, 298 220, 280 210 C 262 265, 242 315, 228 340 C 212 320, 195 305, 180 295 C 155 365, 125 410, 105 435 C 75 425, 48 395, 40 360 C 35 390, 45 465, 75 495 C 105 520, 145 525, 185 520 C 290 500, 390 420, 500 420 C 610 420, 710 500, 815 520 C 855 525, 895 520, 925 495 C 955 465, 965 390, 960 360 C 952 395, 925 425, 895 435 C 875 410, 845 365, 820 295 C 805 305, 788 320, 772 340 C 758 315, 738 265, 720 210 C 702 220, 685 240, 670 265 C 598 140, 578 170, 562 205 C 545 180, 525 115, 500 25 Z"
        :stroke="color"
        stroke-width="10"
        stroke-linecap="butt"
        stroke-linejoin="miter"
        stroke-miterlimit="6"
        class="siger-path"
      />
    </svg>
  </div>
</template>

<script setup>
import anime from 'animejs'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  size:    { type: Number, default: 240 },
  color:   { type: String, default: 'var(--c-siger)' },
  opacity: { type: Number, default: 1 },
  delay:   { type: Number, default: 0 },
  autoplay:{ type: Boolean, default: true },
  trigger: { type: String, default: 'visible' },
})

const wrapEl      = ref(null)
const pathEl      = ref(null)
const fillOpacity = ref(0)
let timeline      = null

function runTrace() {
  if (!pathEl.value) return
  const len = pathEl.value.getTotalLength()
  pathEl.value.style.strokeDasharray  = len
  pathEl.value.style.strokeDashoffset = len

  timeline = anime.timeline({ easing: 'easeInOutSine' })
    .add({
      targets: pathEl.value,
      strokeDashoffset: [len, 0],
      duration: 2400,
      delay: props.delay,
    })
    .add({
      targets: fillOpacity,
      value: 0.18,
      duration: 800,
    }, '-=500')
}

onMounted(async () => {
  await nextTick()
  if (!props.autoplay || !wrapEl.value) return

  if (props.trigger === 'load') {
    runTrace()
  } else {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        obs.unobserve(e.target)
        runTrace()
      })
    }, { threshold: 0.1 })
    obs.observe(wrapEl.value)
  }
})

onUnmounted(() => {
  if (timeline) timeline.pause()
})

defineExpose({ runTrace })
</script>

<style scoped>
.siger-decor-wrap {
  display: inline-block;
  line-height: 0;
  pointer-events: none;
  user-select: none;
}
.siger-svg {
  overflow: visible;
  filter: drop-shadow(0 0 16px rgba(212, 168, 83, 0.4));
}
.siger-path {
  stroke-dasharray: 99999;
  stroke-dashoffset: 99999;
}
</style>
