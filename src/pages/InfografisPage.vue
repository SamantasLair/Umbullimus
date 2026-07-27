<template>
  <div class="if-page">
    <!-- Hero -->
    <header class="if-hero">
      <div class="if-hero-container">
        <span class="if-hero-label" ref="heroLabelEl">Profil Desa · {{ data.provinsi }}</span>
        <h1 class="if-hero-title" ref="heroTitleEl">Infografis <em>{{ data.desa }}</em></h1>
        <p class="if-hero-sub" ref="heroSubEl">
          Kecamatan {{ data.kecamatan }} · Kabupaten {{ data.kabupaten }} · Provinsi {{ data.provinsi }}
        </p>
        <span class="if-hero-rule"></span>
      </div>
    </header>
    <div class="if-zigzag" aria-hidden="true"></div>

    <div v-if="loading" class="if-skeleton" aria-hidden="true">
      <div class="if-skel-row">
        <div class="skeleton-box if-skel-card" v-for="n in 2" :key="n"></div>
      </div>
      <div class="if-skel-stats">
        <div class="skeleton-box if-skel-stat" v-for="n in 5" :key="n"></div>
      </div>
      <div class="skeleton-box if-skel-block"></div>
    </div>

    <template v-else>
      <!-- Asal Usul Nama -->
      <section class="if-section" ref="secAsal">
        <span class="if-label">Asal Usul Nama</span>
        <h2 class="if-title">{{ data.asal_usul?.judul }}</h2>
        <div class="if-quote-grid">
          <div class="if-quote-card if-quote-card--gold" @mouseenter="onEnter" @mouseleave="onLeave">
            <span class="if-quote-word">“{{ data.asal_usul?.umbul?.kata }}”</span>
            <p>{{ data.asal_usul?.umbul?.penjelasan }}</p>
          </div>
          <div class="if-quote-card if-quote-card--sage" @mouseenter="onEnter" @mouseleave="onLeave">
            <span class="if-quote-word">“{{ data.asal_usul?.limus?.kata }}”</span>
            <p>{{ data.asal_usul?.limus?.penjelasan }}</p>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="if-stats" ref="secStats">
        <div class="if-stat" v-for="(s, i) in data.stats" :key="s.label" @mouseenter="onEnter" @mouseleave="onLeave">
          <span class="if-stat-num" :ref="el => { if (el) statNumEls[i] = el }" :data-target="s.value">0</span>
          <span class="if-stat-label">{{ s.label }}</span>
        </div>
      </section>

      <!-- Wilayah -->
      <section class="if-section" ref="secWilayah">
        <span class="if-label">Wilayah</span>
        <h2 class="if-title">Batas dan Letak Desa</h2>
        <div class="if-wilayah-grid">
          <div class="if-compass">
            <span class="compass-dir compass-dir--utara">
              <strong>UTARA</strong>
              <span>{{ batas.utara }}</span>
            </span>
            <span class="compass-dir compass-dir--selatan">
              <strong>SELATAN</strong>
              <span>{{ batas.selatan }}</span>
            </span>
            <span class="compass-dir compass-dir--timur">
              <strong>TIMUR</strong>
              <span>{{ batas.timur }}</span>
            </span>
            <span class="compass-dir compass-dir--barat">
              <strong>BARAT</strong>
              <span>{{ batas.barat }}</span>
            </span>
            <div class="compass-circle"></div>
            <div class="compass-cross-v"></div>
            <div class="compass-cross-h"></div>
            <div class="compass-center">
              <span class="compass-dot"></span>
              <span class="compass-center-label">Desa {{ data.desa }}</span>
            </div>
          </div>
          <div class="if-wilayah-text">
            <p>{{ data.wilayah?.deskripsi }}</p>
            <p v-if="data.wilayah?.luas_catatan" class="if-note">{{ data.wilayah?.luas_catatan }}</p>
          </div>
        </div>
      </section>

      <!-- Jarak ke Pusat Pemerintahan -->
      <section class="if-section if-section--tan" ref="secJarak">
        <span class="if-label">Aksesibilitas</span>
        <h2 class="if-title">Jarak ke Pusat Pemerintahan</h2>
        <div class="if-jarak-list">
          <div class="if-jarak-row" v-for="j in data.jarak" :key="j.label">
            <div class="if-jarak-info">
              <span>{{ j.label }} <em>({{ j.waktu }})</em></span>
              <span class="if-jarak-km">{{ j.km }} km</span>
            </div>
            <div class="if-jarak-track">
              <div class="if-jarak-fill" :data-width="jarakWidth(j.km)"></div>
            </div>
          </div>
        </div>
      </section>

      <div class="if-zigzag" aria-hidden="true"></div>

      <!-- Penduduk & Ekonomi -->
      <section class="if-section" ref="secPenduduk">
        <span class="if-label">Penduduk &amp; Ekonomi</span>
        <h2 class="if-title">{{ data.penduduk_ekonomi?.judul }}</h2>
        <div class="if-dual-grid">
          <div>
            <span class="if-sub-label">Komposisi Penduduk</span>
            <div class="if-split-bar">
              <div class="if-split-fill if-split-fill--laki" :data-width="komposisi.laki_persen"></div>
              <div class="if-split-fill if-split-fill--perempuan" :data-width="komposisi.perempuan_persen"></div>
            </div>
            <div class="if-split-labels">
              <span><strong>{{ komposisi.laki_persen }}%</strong> Laki-laki</span>
              <span><strong>{{ komposisi.perempuan_persen }}%</strong> Perempuan</span>
            </div>
            <p class="if-caption">Rata-rata setiap keluarga di {{ data.desa }} terdiri dari sekitar <strong>{{ komposisi.rata_jiwa_per_kk }} jiwa</strong>.</p>
          </div>
          <div>
            <span class="if-sub-label">Mata Pencaharian</span>
            <div class="if-split-bar">
              <div class="if-split-fill if-split-fill--petani" :data-width="pekerjaan.petani_persen"></div>
              <div class="if-split-fill if-split-fill--lain" :data-width="pekerjaan.lainnya_persen"></div>
            </div>
            <div class="if-split-labels">
              <span><strong>{{ pekerjaan.petani_persen }}%</strong> Petani</span>
              <span><strong>{{ pekerjaan.lainnya_persen }}%</strong> {{ pekerjaan.lainnya_label }}</span>
            </div>
            <p class="if-caption">{{ pekerjaan.hasil }}</p>
          </div>
        </div>
      </section>

      <!-- Arsitektur & Pariwisata -->
      <section class="if-section if-section--tan" ref="secBudaya">
        <div class="if-dual-grid">
          <div>
            <span class="if-label">Arsitektur</span>
            <h3 class="if-subtitle">{{ data.arsitektur?.judul }}</h3>
            <p>{{ data.arsitektur?.deskripsi }}</p>
          </div>
          <div>
            <span class="if-label">Pariwisata</span>
            <h3 class="if-subtitle">{{ data.pariwisata?.judul }}</h3>
            <p>{{ data.pariwisata?.deskripsi }}</p>
          </div>
        </div>
      </section>

      <!-- Infrastruktur & Fasilitas -->
      <section class="if-section" ref="secInfra">
        <span class="if-label">Infrastruktur &amp; Fasilitas</span>
        <h2 class="if-title">Yang Sudah Ada, Yang Masih Dinanti</h2>
        <div class="if-dual-grid">
          <div>
            <span class="if-sub-label">Infrastruktur Dasar</span>
            <ul class="if-checklist">
              <li v-for="item in data.infrastruktur?.dasar" :key="item.label">
                <span class="if-check-icon" :class="item.ada ? 'if-check-icon--yes' : 'if-check-icon--no'">{{ item.ada ? '✓' : '✕' }}</span>
                {{ item.label }}
              </li>
            </ul>
          </div>
          <div>
            <span class="if-sub-label">Kesehatan, Pendidikan &amp; Ibadah</span>
            <ul class="if-checklist">
              <li v-for="item in data.infrastruktur?.sosial" :key="item.label">
                <span class="if-check-icon" :class="item.ada ? 'if-check-icon--yes' : 'if-check-icon--no'">{{ item.ada ? '✓' : '✕' }}</span>
                {{ item.label }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div class="if-zigzag" aria-hidden="true"></div>

      <!-- Footer band -->
      <section class="if-closing" ref="secClosing">
        <div class="if-dual-grid">
          <div>
            <span class="if-label if-label--on-dark">Sosial &amp; Budaya</span>
            <p>{{ data.sosial_budaya }}</p>
          </div>
          <div>
            <span class="if-label if-label--on-dark">Pemerintahan</span>
            <p>{{ data.pemerintahan }}</p>
          </div>
        </div>
        <div class="if-closing-bottom">
          Desa {{ data.desa }} · Kec. {{ data.kecamatan }} · Kab. {{ data.kabupaten }} · {{ data.provinsi }}
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import anime from 'animejs'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useScrollExit } from '../composables/useScrollExit.js'

const data = ref({})
const loading = ref(true)

const heroLabelEl = ref(null)
const heroTitleEl = ref(null)
const heroSubEl = ref(null)

const secAsal = ref(null)
const secStats = ref(null)
const secWilayah = ref(null)
const secJarak = ref(null)
const secPenduduk = ref(null)
const secBudaya = ref(null)
const secInfra = ref(null)
const secClosing = ref(null)

// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const statNumEls = ref([])

// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const batas = computed(() => data.value.wilayah?.batas || {})
// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const komposisi = computed(() => data.value.penduduk_ekonomi?.komposisi || {})
// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const pekerjaan = computed(() => data.value.penduduk_ekonomi?.pekerjaan || {})

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const jarakWidth = (km) => {
  const all = (data.value.jarak || []).map(j => j.km)
  const max = Math.max(...all, 1)
  return Math.round((km / max) * 100)
}

// Exit: kartu kutipan, angka statistik, dan checklist naik & menyusut saat dilewati ke atas
useScrollExit(
  secAsal,
  () => [...(secAsal.value?.querySelectorAll('.if-quote-card') || [])].map((el, i) => ({
    el, x: (i === 0 ? -1 : 1) * 20, y: -70, scale: 0.95,
  })),
  { exitZone: 260, staggerPx: 12 },
)
useScrollExit(
  secStats,
  () => [...(secStats.value?.querySelectorAll('.if-stat') || [])].map((el, i) => ({
    el, y: -50 - i * 8, scale: 0.94,
  })),
  { exitZone: 220, staggerPx: 10 },
)
useScrollExit(
  secInfra,
  () => [...(secInfra.value?.querySelectorAll('.if-checklist li') || [])].map((el, i) => ({
    el, x: -16, y: -40 - (i % 5) * 6,
  })),
  { exitZone: 260, staggerPx: 6 },
)

/**
 * Observer ringan & re-triggerable: satu animasi sederhana per section,
 * sengaja TIDAK ditumpuk banyak efek agar tetap ringan (permintaan user).
 */
const makeObserver = (fn, reset, threshold = 0.15) =>
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return
      reset(e.target)
      fn(e.target)
    })
  }, { threshold })

onMounted(async () => {
  try {
    const res = await fetch('/data/infografis/data.json')
    if (res.ok) data.value = await res.json()
  } catch (e) {
    console.error('Gagal memuat infografis:', e)
  } finally {
    loading.value = false
  }

  await nextTick()

  // ── Hero: fade + slide up on load, tanpa scroll trigger ──
  anime({
    targets: [heroLabelEl.value, heroTitleEl.value, heroSubEl.value],
    opacity: [0, 1],
    translateY: [16, 0],
    delay: anime.stagger(90),
    duration: 650,
    easing: 'easeOutExpo',
  })

  // ── Asal Usul: dua kartu kutipan fade + scale ──
  makeObserver(
    (sec) => anime({
      targets: sec.querySelectorAll('.if-quote-card'),
      opacity: [0, 1],
      translateY: [18, 0],
      delay: anime.stagger(120),
      duration: 550,
      easing: 'easeOutExpo',
    }),
    (sec) => sec.querySelectorAll('.if-quote-card').forEach(el => { el.style.opacity = '0'; el.style.transform = '' }),
  ).observe(secAsal.value)

  // ── Stats: count-up angka — Signature UNIK infografis ──
  makeObserver(
    (sec) => {
      sec.querySelectorAll('.if-stat-num').forEach((el, i) => {
        const target = Number(el.dataset.target) || 0
        const obj = { val: 0 }
        anime({
          targets: obj,
          val: target,
          round: 1,
          duration: 1200,
          delay: i * 90,
          easing: 'easeOutExpo',
          update: () => { el.textContent = Math.round(obj.val).toLocaleString('id-ID') },
        })
      })
    },
    (sec) => sec.querySelectorAll('.if-stat-num').forEach(el => { el.textContent = '0' }),
    0.3
  ).observe(secStats.value)

  // ── Wilayah: kompas muncul dengan scale ringan, teks fade terpisah ──
  makeObserver(
    (sec) => {
      anime({
        targets: sec.querySelector('.if-compass'),
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 650,
        easing: 'easeOutExpo',
      })
      anime({
        targets: sec.querySelectorAll('.if-wilayah-text, .if-wilayah-text p'),
        opacity: [0, 1],
        translateY: [14, 0],
        duration: 550,
        delay: anime.stagger(100, { start: 150 }),
        easing: 'easeOutExpo',
      })
    },
    (sec) => {
      const compass = sec.querySelector('.if-compass')
      if (compass) { compass.style.opacity = '0'; compass.style.transform = '' }
      sec.querySelectorAll('.if-wilayah-text, .if-wilayah-text p').forEach(el => {
        el.style.opacity = '0'
        el.style.transform = ''
      })
    },
    0.2
  ).observe(secWilayah.value)

  // ── Jarak: bar tumbuh dari kiri — konsisten dgn pola "bar grow" infografis ──
  makeObserver(
    (sec) => {
      sec.querySelectorAll('.if-jarak-fill').forEach((el, i) => {
        const w = el.dataset.width || 0
        anime({
          targets: el,
          width: ['0%', `${w}%`],
          duration: 900,
          delay: i * 100,
          easing: 'easeOutExpo',
        })
      })
      anime({
        targets: sec.querySelectorAll('.if-jarak-info'),
        opacity: [0, 1],
        duration: 400,
        delay: anime.stagger(80),
      })
    },
    (sec) => {
      sec.querySelectorAll('.if-jarak-fill').forEach(el => { el.style.width = '0%' })
      sec.querySelectorAll('.if-jarak-info').forEach(el => { el.style.opacity = '0' })
    },
    0.2
  ).observe(secJarak.value)

  // ── Penduduk & Ekonomi: split-bar tumbuh dari kiri ──
  makeObserver(
    (sec) => {
      sec.querySelectorAll('.if-split-fill').forEach((el, i) => {
        const w = el.dataset.width || 0
        anime({
          targets: el,
          width: ['0%', `${w}%`],
          duration: 800,
          delay: i * 90,
          easing: 'easeOutExpo',
        })
      })
      anime({
        targets: sec.querySelectorAll('.if-split-labels, .if-caption'),
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(70, { start: 250 }),
        duration: 450,
      })
    },
    (sec) => {
      sec.querySelectorAll('.if-split-fill').forEach(el => { el.style.width = '0%' })
      sec.querySelectorAll('.if-split-labels, .if-caption').forEach(el => { el.style.opacity = '0'; el.style.transform = '' })
    },
    0.2
  ).observe(secPenduduk.value)

  // ── Arsitektur & Pariwisata: fade + slide sederhana ──
  makeObserver(
    (sec) => anime({
      targets: sec.querySelectorAll('.if-dual-grid > div'),
      opacity: [0, 1],
      translateY: [16, 0],
      delay: anime.stagger(100),
      duration: 550,
      easing: 'easeOutExpo',
    }),
    (sec) => sec.querySelectorAll('.if-dual-grid > div').forEach(el => { el.style.opacity = '0'; el.style.transform = '' }),
  ).observe(secBudaya.value)

  // ── Infrastruktur: checklist stagger dari kiri ──
  makeObserver(
    (sec) => anime({
      targets: sec.querySelectorAll('.if-checklist li'),
      opacity: [0, 1],
      translateX: [-14, 0],
      delay: anime.stagger(45),
      duration: 400,
      easing: 'easeOutExpo',
    }),
    (sec) => sec.querySelectorAll('.if-checklist li').forEach(el => { el.style.opacity = '0'; el.style.transform = '' }),
    0.1
  ).observe(secInfra.value)

  // ── Penutup: fade + slide up ──
  makeObserver(
    (sec) => anime({
      targets: sec.querySelectorAll('.if-dual-grid > div, .if-closing-bottom'),
      opacity: [0, 1],
      translateY: [14, 0],
      delay: anime.stagger(90),
      duration: 500,
      easing: 'easeOutExpo',
    }),
    (sec) => sec.querySelectorAll('.if-dual-grid > div, .if-closing-bottom').forEach(el => { el.style.opacity = '0'; el.style.transform = '' }),
    0.15
  ).observe(secClosing.value)
})
</script>

<style scoped>
.if-page {
  /* Warna maroon & emas berasal dari token global (--c-maroon / --c-siger) agar
     header & footer situs bisa ikut menyesuaikan saat berada di halaman ini. */
  --if-maroon: var(--c-maroon);
  --if-maroon-dark: var(--c-maroon-dark);
  --if-cream: #f3ead9;
  --if-cream-dark: #e7dbbd;
  --if-gold: var(--c-siger);
  --if-sage: #4a6741;
  --if-text: #3a2f1a;
  --if-text-muted: #7a6a4d;
  background: var(--if-cream);
  min-height: 100vh;
  font-family: var(--font-sans);
  color: var(--if-text);
}

/* ─── Hero ── */
.if-hero {
  background: var(--if-maroon);
  padding: 7.5rem 0 3.5rem;
  position: relative;
  overflow: hidden;
}
.if-hero-container {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 var(--sp-md);
  text-align: left;
}
.if-hero-label {
  display: inline-block;
  font-size: .72rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  color: var(--if-gold);
  border: 1px solid rgba(201, 162, 39, 0.4);
  background: rgba(201, 162, 39, 0.08);
  padding: .25rem .85rem; border-radius: 50px;
  margin-bottom: 1rem;
  opacity: 0;
}
.if-hero-title {
  font-family: var(--font-serif);
  font-size: clamp(2.2rem, 6vw, 4rem);
  font-weight: 700;
  color: var(--c-cream);
  line-height: 1.1;
  margin-bottom: .75rem;
  opacity: 0;
}
.if-hero-title em { font-style: italic; color: rgba(245, 240, 232, 0.7); }
.if-hero-sub { font-size: .88rem; color: rgba(245, 240, 232, .65); letter-spacing: .04em; opacity: 0; }
.if-hero-rule {
  display: block;
  width: 56px; height: 3px;
  background: var(--if-gold);
  margin-top: 1.5rem;
  border-radius: 2px;
}

/* ─── Zigzag triangle divider ── */
.if-zigzag {
  height: 16px;
  background-color: var(--if-maroon);
  background-image:
    linear-gradient(-45deg, var(--if-gold) 8px, transparent 0),
    linear-gradient(45deg, var(--if-gold) 8px, transparent 0);
  background-position: 0 0, 8px 0;
  background-size: 16px 16px;
  background-repeat: repeat-x;
}

/* ─── Sections ── */
.if-section { padding: var(--sp-lg) var(--sp-md); max-width: var(--max-w); margin: 0 auto; }
.if-section--tan { background: var(--if-cream-dark); max-width: none; }
.if-section--tan > * { max-width: var(--max-w); margin-left: auto; margin-right: auto; }

.if-label {
  display: block;
  font-size: .68rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
  color: var(--if-maroon);
  margin-bottom: .6rem;
}
.if-label--on-dark { color: var(--if-gold); }
.if-title {
  font-family: var(--font-serif);
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  font-weight: 700;
  color: var(--if-text);
  margin-bottom: 2rem;
}
.if-subtitle { font-family: var(--font-serif); font-size: 1.3rem; color: var(--if-text); margin: .3rem 0 .75rem; }

/* ─── Asal Usul: kartu kutipan ── */
.if-quote-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.if-quote-card {
  padding: 1.5rem 1.75rem;
  border-left: 3px solid var(--if-gold);
  background: rgba(201, 162, 39, 0.06);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  opacity: 0;
}
.if-quote-card--sage { border-left-color: var(--if-sage); background: rgba(74, 103, 65, 0.06); }
.if-quote-word { display: block; font-family: var(--font-serif); font-style: italic; font-size: 1.3rem; color: var(--if-maroon); margin-bottom: .5rem; }
.if-quote-card--sage .if-quote-word { color: var(--if-sage); }
.if-quote-card p { font-size: .9rem; line-height: 1.7; color: var(--if-text-muted); }

/* ─── Stats ── */
.if-stats {
  background: var(--if-cream-dark);
  display: flex; flex-wrap: wrap; justify-content: center;
  max-width: var(--max-w); margin: 0 auto;
  padding: 2rem var(--sp-md);
}
.if-stat {
  flex: 1 1 120px;
  text-align: center;
  padding: 0 1.25rem;
  border-right: 1px solid rgba(74, 18, 32, .15);
}
.if-stat:last-child { border-right: none; }
.if-stat-num { display: block; font-family: var(--font-serif); font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 700; color: var(--if-maroon); line-height: 1; }
.if-stat-label { font-size: .68rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--if-text-muted); margin-top: .35rem; display: block; }

/* ─── Wilayah: kompas ── */
.if-wilayah-grid { display: grid; grid-template-columns: minmax(380px, 420px) 1fr; gap: 3.5rem; align-items: center; }
.if-compass { position: relative; width: 400px; height: 320px; margin: 0 auto; opacity: 0; flex-shrink: 0; }
.compass-circle { position: absolute; width: 182px; height: 182px; top: 50%; left: 50%; transform: translate(-50%, -50%); border: 1.5px dashed var(--if-gold); border-radius: 50%; z-index: 1; }
.compass-cross-v { position: absolute; left: 50%; top: calc(50% - 91px); height: 182px; width: 1px; background: rgba(74, 18, 32, .2); transform: translateX(-50%); z-index: 1; }
.compass-cross-h { position: absolute; top: 50%; left: calc(50% - 91px); width: 182px; height: 1px; background: rgba(74, 18, 32, .2); transform: translateY(-50%); z-index: 1; }
.compass-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; z-index: 3; }
.compass-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--if-maroon); box-shadow: 0 0 0 3px var(--if-cream); }
.compass-center-label { font-size: .72rem; font-weight: 600; text-align: center; color: var(--if-text); line-height: 1.2; width: max-content; margin-top: 4px; background: var(--if-cream); padding: 1px 6px; border-radius: 4px; z-index: 3; }
.compass-dir { position: absolute; display: flex; flex-direction: column; font-size: .8rem; line-height: 1.35; color: var(--if-text-muted); z-index: 3; background: var(--if-cream); padding: 2px 4px; border-radius: 4px; }
.compass-dir strong { font-size: .72rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--if-maroon); margin-bottom: 2px; }
.compass-dir--utara { top: 4px; left: 50%; transform: translateX(-50%); text-align: center; align-items: center; }
.compass-dir--selatan { bottom: 4px; left: 50%; transform: translateX(-50%); text-align: center; align-items: center; }
.compass-dir--timur { top: 50%; right: 0; transform: translateY(-50%); text-align: left; align-items: flex-start; max-width: 105px; }
.compass-dir--barat { top: 50%; left: 0; transform: translateY(-50%); text-align: right; align-items: flex-end; max-width: 105px; }
.if-wilayah-text p { font-size: .95rem; line-height: 1.75; color: var(--if-text-muted); }
.if-wilayah-text .if-note { font-size: .78rem; font-style: italic; color: var(--if-text-muted); opacity: .85; margin-top: .75rem; }

/* ─── Jarak ── */
.if-jarak-list { display: flex; flex-direction: column; gap: 1.4rem; max-width: 640px; }
.if-jarak-info { display: flex; justify-content: space-between; font-size: .88rem; margin-bottom: .4rem; opacity: 0; }
.if-jarak-info em { font-style: italic; color: var(--if-text-muted); font-size: .8rem; }
.if-jarak-km { font-weight: 700; color: var(--if-maroon); }
.if-jarak-track { height: 8px; background: rgba(74, 18, 32, .1); border-radius: 99px; overflow: hidden; }
.if-jarak-fill { height: 100%; width: 0%; border-radius: 99px; background: linear-gradient(90deg, var(--if-sage), var(--if-gold)); }

/* ─── Dual grid (reused by Penduduk/Ekonomi, Arsitektur/Pariwisata, Penutup) ── */
.if-dual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
.if-dual-grid p { font-size: .92rem; line-height: 1.75; color: var(--if-text-muted); }
.if-sub-label { display: block; font-size: .7rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--if-maroon); margin-bottom: .9rem; }

/* Split bar (komposisi penduduk / pekerjaan) */
.if-split-bar { display: flex; height: 10px; border-radius: 99px; overflow: hidden; background: rgba(74, 18, 32, .08); }
.if-split-fill { height: 100%; width: 0%; }
.if-split-fill--laki, .if-split-fill--petani { background: var(--if-maroon); }
.if-split-fill--perempuan, .if-split-fill--lain { background: var(--if-gold); }
.if-split-labels { display: flex; justify-content: space-between; font-size: .82rem; margin-top: .6rem; opacity: 0; }
.if-split-labels strong { color: var(--if-text); }
.if-caption { margin-top: .9rem; opacity: 0; }

/* ─── Checklist ── */
.if-checklist { display: flex; flex-direction: column; gap: .75rem; }
.if-checklist li { display: flex; align-items: center; gap: .7rem; font-size: .9rem; opacity: 0; }
.if-check-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 50%;
  font-size: .68rem; font-weight: 700; flex-shrink: 0;
  color: var(--c-white);
}
.if-check-icon--yes { background: var(--if-sage); }
.if-check-icon--no { background: #a04040; }

/* ─── Penutup ── */
.if-closing { background: var(--if-maroon); padding: var(--sp-lg) var(--sp-md) 2rem; }
.if-closing .if-dual-grid { max-width: var(--max-w); margin: 0 auto; }
.if-closing p { color: rgba(245, 240, 232, .75); }
.if-closing-bottom {
  max-width: var(--max-w); margin: 2.5rem auto 0;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(245, 240, 232, .15);
  font-size: .7rem; letter-spacing: .1em; text-transform: uppercase;
  color: rgba(245, 240, 232, .4);
  opacity: 0;
}

/* ─── Skeleton ── */
.if-skeleton { max-width: var(--max-w); margin: 0 auto; padding: var(--sp-lg) var(--sp-md); display: flex; flex-direction: column; gap: 2rem; }
.if-skel-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.if-skel-card { height: 110px; border-radius: var(--radius-sm); }
.if-skel-stats { display: flex; gap: 1rem; }
.if-skel-stat { flex: 1; height: 70px; border-radius: var(--radius-sm); }
.if-skel-block { height: 220px; border-radius: var(--radius-sm); }

@media (max-width: 900px) {
  .if-wilayah-grid { grid-template-columns: 1fr; }
  .if-dual-grid { grid-template-columns: 1fr; gap: 2rem; }
  .if-quote-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  /* Nav global position:fixed tinggi ~80px (tanpa background di state awal/belum discroll) —
     padding-top harus cukup supaya badge/judul hero tidak tertindih nav. */
  .if-hero { padding: 6.5rem 1.25rem 2.25rem; }
  .if-section, .if-closing { padding: var(--sp-lg) 1.25rem; }
  .if-stats { padding: 1.5rem 1.25rem; }
  .if-stat { flex: 1 1 40%; border-right: none; margin-bottom: 1rem; }

  /* Responsive Mobile Compass */
  .if-compass { width: 100%; max-width: 350px; height: 280px; }
  .compass-circle { width: 150px; height: 150px; }
  .compass-cross-v { top: calc(50% - 75px); height: 150px; }
  .compass-cross-h { left: calc(50% - 75px); width: 150px; }
  .compass-dir--timur { max-width: 92px; font-size: .74rem; }
  .compass-dir--barat { max-width: 92px; font-size: .74rem; }
  .compass-dir strong { font-size: .68rem; }
  .compass-center-label { font-size: .68rem; padding: 1px 5px; }
}
</style>
