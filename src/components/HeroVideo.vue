<template>
  <section id="home" class="hero">
    <div class="hero-overlay"></div>
    <video autoplay loop muted playsinline class="hero-video" aria-hidden="true" ref="videoEl">
      <source src="https://cdn.pixabay.com/video/2019/11/17/29168-373809623_large.mp4" type="video/mp4" />
    </video>

    <!-- Siger decor — ornamen background -->
    <div class="hero-siger-bg" aria-hidden="true">
      <SigerDecor :size="320" color="rgba(212,168,83,0.35)" trigger="load" :delay="1800" />
    </div>

    <div class="hero-content">
      <span class="hero-badge" ref="badgeEl">Pesawaran · Lampung</span>
      <h1 class="hero-title" aria-label="Umbul Limus">
        <span class="title-left" ref="titleLeftEl" aria-hidden="true">Umbul</span>
        <span class="title-right" ref="titleRightEl" aria-hidden="true"><em>Limus</em></span>
      </h1>
      <p class="hero-tagline" ref="taglineEl">
        Surga tersembunyi — mata air jernih, hutan tropis, dan warisan budaya Lampung.
      </p>
      <div class="hero-actions" ref="actionsEl">
        <a href="#wisata" class="btn-primary" @click.prevent="scrollTo('wisata')">Jelajahi Wisata</a>
        <a href="#galeri" class="btn-ghost" @click.prevent="scrollTo('galeri')">Lihat Galeri</a>
      </div>
    </div>

    <div class="hero-scroll-hint" ref="scrollHintEl" aria-hidden="true">
      <span>Scroll</span>
      <div class="scroll-line"></div>
    </div>
  </section>
</template>

<script setup>
import anime from 'animejs'
import { onMounted, ref } from 'vue'
import SigerDecor from './SigerDecor.vue'

const videoEl      = ref(null)
const badgeEl      = ref(null)
const titleLeftEl  = ref(null)
const titleRightEl = ref(null)
const taglineEl    = ref(null)
const actionsEl    = ref(null)
const scrollHintEl = ref(null)

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  // Video: slow scale-out dari 1.08 ke 1 (cinematic zoom)
  if (videoEl.value) {
    anime({
      targets: videoEl.value,
      scale:   [1.08, 1],
      opacity: [0, 1],
      duration: 2200,
      easing:  'easeOutQuart',
    })
  }

  // Cinematic timeline — tiap elemen punya karakter gerak sendiri
  anime.timeline({ easing: 'easeOutExpo' })
    // Badge turun dari atas
    .add({
      targets:    badgeEl.value,
      opacity:    [0, 1],
      translateY: [-14, 0],
      duration:   650,
      delay:      400,
    })
    // "Umbul" — masuk dari kiri
    .add({
      targets:    titleLeftEl.value,
      opacity:    [0, 1],
      translateX: [-60, 0],
      duration:   800,
    }, '-=250')
    // "Limus" — masuk dari kanan (counter-direction)
    .add({
      targets:    titleRightEl.value,
      opacity:    [0, 1],
      translateX: [60, 0],
      duration:   800,
    }, '-=700')
    // Tagline fade in + slight rise
    .add({
      targets:    taglineEl.value,
      opacity:    [0, 1],
      translateY: [14, 0],
      duration:   600,
    }, '-=350')
    // Tombol — scale in dari kecil
    .add({
      targets:    actionsEl.value.querySelectorAll('a'),
      opacity:    [0, 1],
      scale:      [0.9, 1],
      translateY: [8, 0],
      delay:      anime.stagger(100),
      duration:   500,
    }, '-=300')
    // Scroll hint
    .add({
      targets:  scrollHintEl.value,
      opacity:  [0, 1],
      duration: 500,
    }, '-=100')
})

defineExpose({
  SigerDecor,
  scrollTo
})
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%; height: 100vh; min-height: 600px;
  display: flex; align-items: flex-end;
  overflow: hidden;
  background: var(--c-dark-bg);
}

.hero-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; z-index: 0;
  opacity: 0;
}

.hero-overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(
    to top,
    rgba(7, 24, 4, 0.92) 0%,
    rgba(7, 24, 4, 0.45) 45%,
    rgba(7, 24, 4, 0.1)  100%
  );
}

/* Siger background ornamen */
.hero-siger-bg {
  position: absolute;
  bottom: 5rem; right: var(--sp-md);
  z-index: 2; pointer-events: none;
}

.hero-content {
  position: relative; z-index: 3;
  max-width: var(--max-w); width: 100%;
  margin: 0 auto;
  padding: 0 var(--sp-md) var(--sp-lg);
}

.hero-badge {
  display: inline-block;
  font-family: var(--font-sans);
  font-size: .72rem; font-weight: 600;
  letter-spacing: .25em; text-transform: uppercase;
  color: var(--c-siger);
  border: 1px solid rgba(212, 168, 83, .35);
  padding: .35rem .9rem; border-radius: 50px;
  margin-bottom: 1.5rem; opacity: 0;
}

.hero-title {
  font-family: var(--font-serif);
  font-size: clamp(4rem, 12vw, 9rem);
  font-weight: 700; color: var(--c-cream);
  line-height: 0.92; margin-bottom: 1.5rem;
  display: flex; flex-direction: column;
}
.title-left  { opacity: 0; }
.title-right { opacity: 0; padding-left: 1.5rem; }
.title-right em { font-style: italic; color: var(--c-sage-light); }

.hero-tagline {
  font-size: clamp(.9rem, 2vw, 1.1rem);
  color: rgba(237, 250, 233, .72);
  max-width: 480px; margin-bottom: 2rem;
  line-height: 1.65; opacity: 0;
}

.hero-actions { display:flex;gap:1rem;flex-wrap:wrap; }

.btn-primary {
  opacity: 0;
  background: var(--c-terra); color: var(--c-white);
  padding: .8rem 1.8rem; border-radius: 50px;
  font-size: .9rem; font-weight: 500;
  transition: var(--transition);
}
.btn-primary:hover { background:var(--c-terra-dark);transform:translateY(-2px);box-shadow:0 8px 20px rgba(38,181,21,.35); }

.btn-ghost {
  opacity: 0;
  border: 1.5px solid rgba(212,168,83,.4); color: var(--c-siger);
  padding: .8rem 1.8rem; border-radius: 50px;
  font-size: .9rem; font-weight: 500;
  transition: var(--transition);
}
.btn-ghost:hover { border-color:var(--c-siger);background:var(--c-siger-glow);transform:translateY(-2px); }

.hero-scroll-hint {
  position: absolute; bottom: 2.5rem; right: var(--sp-md);
  z-index: 3; display:flex;flex-direction:column;
  align-items:center;gap:.5rem;opacity:0;
}
.hero-scroll-hint span {
  font-size:.65rem;letter-spacing:.2em;text-transform:uppercase;
  color:rgba(237,250,233,.4);writing-mode:vertical-rl;
}
.scroll-line {
  width:1px;height:50px;
  background:linear-gradient(to bottom,var(--c-siger),transparent);
  animation:scrollPulse 2s ease infinite;
}
@keyframes scrollPulse {
  0%,100%{opacity:.5;transform:scaleY(1)}
  50%{opacity:1;transform:scaleY(1.2)}
}

.sr-only {
  position:absolute;width:1px;height:1px;
  overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;
}

@media (max-width:600px) {
  .hero-content { padding:0 1.25rem 4rem; }
  .title-right { padding-left:.75rem; }
  .hero-scroll-hint,.hero-siger-bg { display:none; }
}
</style>
