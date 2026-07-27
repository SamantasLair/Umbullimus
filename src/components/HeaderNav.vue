<template>
  <header :class="['nav', { 'nav--scrolled': isScrolled, 'nav--open': menuOpen, 'nav--maroon': isMaroonTheme }]">
    <div class="nav-container">
      <!-- Wordmark -->
      <RouterLink to="/" class="nav-wordmark" @click="closeMenu">
        <img src="/images/logopesawaran.svg" alt="Logo Kabupaten Pesawaran" class="nav-logo" />
        <div class="wordmark-text">
          <span class="wordmark-main">Umbul Limus</span>
          <span class="wordmark-sub">Desa Wisata Lampung</span>
        </div>
      </RouterLink>

      <!-- Desktop Nav -->
      <nav class="nav-links" role="navigation" aria-label="Menu utama" ref="navLinksEl">
        <!-- Page Navigation -->
        <div class="nav-group nav-group--pages">
          <RouterLink to="/" class="nav-link" exact-active-class="nav-link--active">Beranda</RouterLink>
          <RouterLink to="/bagan" class="nav-link" active-class="nav-link--active">Struktur Desa</RouterLink>
          <RouterLink to="/infografis" class="nav-link" active-class="nav-link--active">Infografis</RouterLink>
        </div>

        <!-- Visual separator -->
        <div class="nav-sep" aria-hidden="true"></div>

        <!-- Page Navigation extra -->
        <div class="nav-group nav-group--anchors">
          <RouterLink to="/galeri" class="nav-link nav-link--anchor">Galeri</RouterLink>
        </div>
      </nav>

      <!-- CTA Siger -->
      <a
        href="https://wa.me/6281234567890"
        target="_blank"
        rel="noopener"
        class="nav-cta"
        id="nav-cta-wa"
        ref="ctaEl"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        <span class="cta-shimmer"></span>
        Hubungi Kami
      </a>

      <!-- Hamburger -->
      <button
        class="nav-hamburger"
        @click="toggleMenu"
        :aria-expanded="menuOpen"
        aria-label="Buka menu"
      >
        <span class="hb-bar hb-bar--1"></span>
        <span class="hb-bar hb-bar--2"></span>
        <span class="hb-bar hb-bar--3"></span>
      </button>
    </div>

    <!-- Full-Screen Overlay Mobile -->
    <div class="nav-overlay" :class="{ 'nav-overlay--open': menuOpen }" aria-hidden="!menuOpen">
      <div class="overlay-inner">
        <nav class="overlay-links" ref="overlayLinksEl">
          <RouterLink to="/" class="ov-link ov-link--page" @click="closeMenu" exact-active-class="ov-link--active">Beranda</RouterLink>
          <RouterLink to="/bagan" class="ov-link ov-link--page" @click="closeMenu" active-class="ov-link--active">Struktur Desa</RouterLink>
          <RouterLink to="/infografis" class="ov-link ov-link--page" @click="closeMenu" active-class="ov-link--active">Infografis</RouterLink>
          <div class="ov-sep"></div>
          <RouterLink to="/galeri" class="ov-link ov-link--anchor" @click="closeMenu">Galeri</RouterLink>
        </nav>
        <a href="https://wa.me/6281234567890" target="_blank" rel="noopener" class="ov-cta" @click="closeMenu">
          Hubungi Kami via WhatsApp
        </a>
      </div>
    </div>
  </header>
</template>

<script setup>
import anime from 'animejs'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const isMaroonTheme = computed(() => route.path === '/infografis')
const isScrolled = ref(false)
const menuOpen   = ref(false)
const ctaEl      = ref(null)
const navLinksEl     = ref(null)
const overlayLinksEl = ref(null)

const onScroll = () => { isScrolled.value = window.scrollY > 60 }

let shimmerLoop = null

onMounted(() => {
  window.addEventListener('scroll', onScroll)

  // Nav links reveal on load: target within navLinksEl ref only, never touch hamburger
  setTimeout(() => {
    const linkTargets = navLinksEl.value
      ? navLinksEl.value.querySelectorAll('.nav-link')
      : []
    const ctaTarget = ctaEl.value
    const targets = [...linkTargets, ctaTarget].filter(Boolean)
    if (targets.length) {
      anime({
        targets,
        opacity: [0, 1],
        translateY: [-6, 0],
        delay: anime.stagger(55, { start: 200 }),
        duration: 500,
        easing: 'easeOutExpo',
      })
    }
  }, 100)

  // Shimmer CTA + Outline Gleam: tiap 4.5 detik
  shimmerLoop = setInterval(() => {
    if (!ctaEl.value) return
    const shimmer = ctaEl.value.querySelector('.cta-shimmer')
    
    anime({
      targets: shimmer,
      translateX: ['-100%', '400%'],
      duration: 750,
      easing: 'easeInOutSine',
      complete: () => {
        if (!ctaEl.value) return
        // Matikan CSS transition sementara agar tidak bentrok dengan Anime.js
        ctaEl.value.style.transition = 'none'
        
        // Efek mengkilap pada outline (pulse) ke seluruh tombol
        anime({
          targets: ctaEl.value,
          boxShadow: [
            { value: '0 0 0 0px rgba(255, 255, 255, 0)', duration: 0 },
            { value: '0 0 0 2.5px rgba(255, 255, 255, 0.9)', duration: 150, easing: 'easeOutQuad' },
            { value: '0 0 0 6px rgba(255, 255, 255, 0)', duration: 350, easing: 'easeOutQuad' }
          ],
          complete: () => {
            if (!ctaEl.value) return
            // Kembalikan ke state semula
            ctaEl.value.style.transition = ''
            ctaEl.value.style.boxShadow = ''
          }
        })
      }
    })
  }, 4500)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (shimmerLoop) clearInterval(shimmerLoop)
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
function closeMenu() {
  menuOpen.value = false
}

// Animate overlay links & lock body scroll saat menu buka
watch(menuOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    if (overlayLinksEl.value) {
      anime({
        targets: overlayLinksEl.value.querySelectorAll('.ov-link, .ov-sep'),
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(60, { start: 150 }),
        duration: 450,
        easing: 'easeOutExpo',
      })
    }
  } else {
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
  }
})

defineExpose({
  toggleMenu,
  closeMenu
})
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 200;
  padding: 1.3rem 0;
  transition: var(--transition);
}
.nav--scrolled {
  background: rgba(237, 250, 233, 0.94);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 0.8rem 0;
  box-shadow: 0 1px 0 rgba(15, 36, 9, 0.08);
}

.nav-container {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 var(--sp-md);
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* Wordmark */
.nav-wordmark { display:flex;align-items:center;gap:.85rem;line-height:1;flex-shrink:0;text-decoration:none;z-index:300;position:relative; }
.nav-logo { height: 50px; width: auto; object-fit: contain; flex-shrink: 0; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3)); transition: var(--transition); }
.nav--scrolled .nav-logo { height: 42px; }
.wordmark-text { display:flex;flex-direction:column; }
.wordmark-main { font-family:var(--font-serif);font-size:1.3rem;font-weight:600;color:var(--c-white);transition:var(--transition); }
.nav--scrolled .wordmark-main { color:var(--c-stone); }
.wordmark-sub { font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.55);margin-top:2px;transition:var(--transition); }
.nav--scrolled .wordmark-sub { color:var(--c-stone-muted); }

/* Desktop Nav groups */
.nav-links { display:flex;align-items:center;gap:.5rem;margin-left:auto; }
.nav-group { display:flex;align-items:center;gap:1.5rem; }

/* Separator */
.nav-sep {
  width: 1px; height: 16px;
  background: rgba(255,255,255,0.2);
  margin: 0 .25rem;
  transition: var(--transition);
}
.nav--scrolled .nav-sep { background: rgba(15,36,9,0.15); }

/* Links */
.nav-link {
  font-size:.83rem;font-weight:500;
  color:rgba(255,255,255,.82);
  position:relative;
  transition:color .25s;
  text-decoration:none;
  opacity:0;
}
.nav-link::after {
  content:'';position:absolute;bottom:-4px;left:0;
  width:0;height:1.5px;
  background:var(--c-terra);
  transition:width .3s ease;
}
.nav-link:hover::after,
.nav-link--active::after { width:100%; }
.nav-link:hover { color:var(--c-white); }
.nav--scrolled .nav-link { color:var(--c-stone-muted); }
.nav--scrolled .nav-link:hover,
.nav--scrolled .nav-link--active { color:var(--c-stone); }

/* Anchor links: italic, softer */
.nav-link--anchor { font-style:italic;font-weight:400;color:rgba(255,255,255,.55); }
.nav-link--anchor::after { background:var(--c-siger); }
.nav--scrolled .nav-link--anchor { color:var(--c-stone-muted); }

/* CTA: Siger Gold */
.nav-cta {
  position:relative;overflow:hidden;
  display:inline-flex;align-items:center;gap:.4rem;
  background:var(--c-siger);
  color:var(--c-stone);
  padding:.52rem 1.1rem;
  border-radius:50px;
  font-size:.8rem;font-weight:600;
  white-space:nowrap;flex-shrink:0;
  text-decoration:none;
  transition:var(--transition);
  opacity:0;
}
.nav-cta:hover { background:var(--c-siger-dark);transform:translateY(-1px);box-shadow:var(--shadow-siger); }
.cta-shimmer {
  position:absolute;top:0;left:0;
  width:40%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent);
  transform:translateX(-100%);
  pointer-events:none;
}

/* Hamburger */
.nav-hamburger {
  display:none;
  background:none;
  border:none;
  cursor:pointer;
  padding:8px;
  margin-left:auto;
  position:relative;
  z-index:300;
}
.hb-bar {
  display:block;
  width:24px;
  height:2px;
  background:var(--c-white);
  border-radius:2px;
  transition:var(--transition);
  transform-origin:center;
}
.nav--scrolled .hb-bar { background:var(--c-stone); }
.hb-bar--1 { margin-bottom:6px; }
.hb-bar--3 { margin-top:6px; }

/* Hamburger open state → X */
.nav--open .hb-bar--1 { transform:translateY(8px) rotate(45deg); }
.nav--open .hb-bar--2 { opacity:0;transform:scaleX(0); }
.nav--open .hb-bar--3 { transform:translateY(-8px) rotate(-45deg); }

/* Mandatory high-contrast white elements when mobile menu overlay is open */
.nav--open .hb-bar { background: var(--c-white) !important; }
.nav--open .wordmark-main { color: var(--c-white) !important; }
.nav--open .wordmark-sub { color: rgba(255, 255, 255, 0.75) !important; }

/* Full-Screen Overlay */
.nav-overlay {
  position:fixed;
  inset:0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background:var(--c-dark-bg);
  z-index:250;
  display:flex;align-items:center;justify-content:center;
  opacity:0;pointer-events:none;
  transition:opacity .4s ease;
  overflow-y:auto;
}
.nav-overlay--open { opacity:1;pointer-events:all; }

.overlay-inner { text-align:center;display:flex;flex-direction:column;align-items:center;gap:2rem; }

.overlay-links { display:flex;flex-direction:column;align-items:center;gap:.25rem; }
.ov-link {
  font-family:var(--font-serif);
  font-size:clamp(1.8rem,7vw,2.8rem);
  font-weight:600;
  color:rgba(255,255,255,.7);
  text-decoration:none;
  padding:.35rem 1rem;
  transition:color .25s;
  opacity:0;
}
.ov-link--page:hover,
.ov-link--active { color:var(--c-sage-light); }
.ov-link--anchor {
  font-style:italic;font-size:clamp(1.2rem,4.5vw,1.8rem);
  color:rgba(255,255,255,.4);
  font-weight:400;
}
.ov-link--anchor:hover { color:var(--c-siger); }
.ov-sep { width:48px;height:1px;background:rgba(255,255,255,.12);margin:.5rem 0;opacity:0; }

.ov-cta {
  display:inline-block;
  background:var(--c-siger);color:var(--c-stone);
  padding:.7rem 2rem;border-radius:50px;
  font-size:.9rem;font-weight:600;
  text-decoration:none;
  transition:var(--transition);
}
.ov-cta:hover { background:var(--c-siger-dark);transform:translateY(-2px); }

/* Tema Maroon: menyesuaikan halaman Infografis (lihat isMaroonTheme) */
.nav--maroon.nav--scrolled {
  background: rgba(74, 18, 32, 0.94);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.15);
}
.nav--maroon.nav--scrolled .wordmark-main { color: var(--c-cream); }
.nav--maroon.nav--scrolled .wordmark-sub { color: rgba(237, 250, 233, 0.6); }
.nav--maroon.nav--scrolled .nav-sep { background: rgba(245, 240, 232, 0.2); }
.nav--maroon.nav--scrolled .nav-link,
.nav--maroon.nav--scrolled .nav-link--anchor { color: rgba(245, 240, 232, 0.65); }
.nav--maroon.nav--scrolled .nav-link:hover,
.nav--maroon.nav--scrolled .nav-link--active { color: var(--c-cream); }
.nav--maroon.nav--scrolled .nav-link::after { background: var(--c-siger); }
.nav--maroon.nav--scrolled .hb-bar { background: var(--c-cream); }

/* Responsive */
@media (max-width:960px) {
  .nav-logo { height: 42px; }
  .nav--scrolled .nav-logo { height: 36px; }
  .nav-links { display:none; }
  .nav-cta { display:none; }
  .nav-hamburger { display:flex; flex-direction:column; justify-content:center; align-items:center; }
}
</style>
