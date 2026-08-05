<template>
  <div class="if-page">
    <!-- Hero Header -->
    <header class="if-hero" ref="secHero">
      <!-- Siger Kanan Atas (Statis, hasil Python sampling + autocorrection dari SigerDecor.vue) -->
      <div class="if-siger if-siger--top-right" aria-hidden="true">
        <SigerDecor :size="240" color="var(--c-siger)" :autoplay="false" />
      </div>

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
            <span class="if-quote-word">"{{ data.asal_usul?.umbul?.kata }}"</span>
            <p>{{ data.asal_usul?.umbul?.penjelasan }}</p>
          </div>
          <div class="if-quote-card if-quote-card--sage" @mouseenter="onEnter" @mouseleave="onLeave">
            <span class="if-quote-word">"{{ data.asal_usul?.limus?.kata }}"</span>
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
          <!-- Kompas terstruktur presisi tanpa tabrakan teks -->
          <div class="if-compass-wrap">
            <div class="if-compass" role="img" aria-label="Peta mata angin batas wilayah desa">
              <div class="compass-circle"></div>
              <div class="compass-cross-v"></div>
              <div class="compass-cross-h"></div>
              
              <!-- Titik Mata Angin -->
              <div class="compass-dot-tip compass-dot-tip--n"></div>
              <div class="compass-dot-tip compass-dot-tip--s"></div>
              <div class="compass-dot-tip compass-dot-tip--e"></div>
              <div class="compass-dot-tip compass-dot-tip--w"></div>

              <div class="compass-center">
                <span class="compass-dot"></span>
                <span class="compass-center-label">Desa {{ data.desa }}</span>
              </div>

              <!-- Label Arah Mata Angin Berdampingan Langsung dengan Titik -->
              <div class="compass-label compass-label--utara">
                <strong class="compass-dir-tag">UTARA</strong>
                <span class="compass-val">{{ batas.utara }}</span>
              </div>
              <div class="compass-label compass-label--selatan">
                <strong class="compass-dir-tag">SELATAN</strong>
                <span class="compass-val">{{ batas.selatan }}</span>
              </div>
              <div class="compass-label compass-label--timur">
                <strong class="compass-dir-tag">TIMUR</strong>
                <span class="compass-val">{{ batas.timur }}</span>
              </div>
              <div class="compass-label compass-label--barat">
                <strong class="compass-dir-tag">BARAT</strong>
                <span class="compass-val">{{ batas.barat }}</span>
              </div>
            </div>
          </div>

          <div class="if-wilayah-text">
            <p>{{ data.wilayah?.deskripsi }}</p>
            <p v-if="data.wilayah?.luas_catatan" class="if-note">{{ data.wilayah?.luas_catatan }}</p>
          </div>
        </div>

        <div class="if-map-wrap" v-if="data.wilayah?.maps_embed">
          <iframe
            class="if-map"
            :src="data.wilayah.maps_embed"
            title="Peta lokasi Desa Umbul Limus"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

      <!-- Jarak ke Pusat Pemerintahan -->
      <section class="if-section if-section--tan" ref="secJarak">
        <span class="if-label">Aksesibilitas</span>
        <h2 class="if-title">Jarak ke Pusat Pemerintahan</h2>
        <div class="if-jarak-list">
          <div class="if-jarak-row" v-for="j in data.jarak" :key="j.label" @mouseenter="onEnter" @mouseleave="onLeave">
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
        <h2 class="if-title">Siapa dan Bagaimana Warga Umbul Limus Hidup</h2>
        <div class="if-dual-grid">
          <!-- Komposisi Penduduk -->
          <div>
            <span class="if-sub-label">Komposisi Penduduk</span>
            <div class="if-split-labels">
              <span><strong>Laki-laki</strong> {{ komposisi.laki_persen }}%</span>
              <span><strong>{{ komposisi.perempuan_persen }}%</strong> Perempuan</span>
            </div>
            <div class="if-split-bar">
              <div class="if-split-fill if-split-fill--laki" :data-width="komposisi.laki_persen"></div>
              <div class="if-split-fill if-split-fill--perempuan" :data-width="komposisi.perempuan_persen"></div>
            </div>
            <p class="if-caption">
              Rata-rata setiap keluarga di Umbul Limus terdiri dari sekitar <strong>{{ komposisi.rata_jiwa_per_kk }} jiwa</strong>.
            </p>
          </div>

          <!-- Mata Pencaharian -->
          <div>
            <span class="if-sub-label">Mata Pencaharian</span>
            <div class="if-split-labels">
              <span><strong>Petani</strong> {{ pekerjaan.petani_persen }}%</span>
              <span><strong>{{ pekerjaan.lainnya_persen }}%</strong> {{ pekerjaan.lainnya_label }}</span>
            </div>
            <div class="if-split-bar">
              <div class="if-split-fill if-split-fill--petani" :data-width="pekerjaan.petani_persen"></div>
              <div class="if-split-fill if-split-fill--lain" :data-width="pekerjaan.lainnya_persen"></div>
            </div>
            <p class="if-caption">{{ pekerjaan.hasil }}</p>
          </div>
        </div>
      </section>

      <!-- Arsitektur & Pariwisata (Dengan Icon Badges) -->
      <section class="if-section if-section--tan" ref="secBudaya">
        <div class="if-highlight-grid">
          <div class="if-highlight-card if-highlight-card--orange" @mouseenter="onEnter" @mouseleave="onLeave">
            <div class="if-hl-icon-badge">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <h3 class="if-highlight-title">{{ data.arsitektur?.judul }}</h3>
            <p>{{ data.arsitektur?.deskripsi }}</p>
          </div>
          <div class="if-highlight-card if-highlight-card--teal" @mouseenter="onEnter" @mouseleave="onLeave">
            <div class="if-hl-icon-badge">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.1C12 2.1 5 9 5 14a7 7 0 0014 0c0-5-7-11.9-7-11.9z"/>
              </svg>
            </div>
            <h3 class="if-highlight-title">{{ data.pariwisata?.judul }}</h3>
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

      <!-- Section 7: Footer / Closing Band -->
      <section class="if-closing" ref="secClosing">
        <!-- Siger Kiri Bawah (Statis, hasil Python sampling + autocorrection dari SigerDecor.vue) -->
        <div class="if-siger if-siger--bottom-left" aria-hidden="true">
          <SigerDecor :size="280" color="#D4A853" :autoplay="false" />
        </div>

        <div class="if-dual-grid if-closing-grid">
          <!-- Card 1: Sosial & Budaya -->
          <div class="if-closing-card" @mouseenter="onEnter" @mouseleave="onLeave">
            <div class="if-closing-header">
              <div class="if-closing-icon if-closing-icon--gold">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L9 5h6l-3-3zm0 4.5c-2.48 0-4.5 2.02-4.5 4.5v7h9v-7c0-2.48-2.02-4.5-4.5-4.5zm-2.5 7.5h5v2h-5v-2z"/>
                </svg>
              </div>
            </div>
            <h3 class="if-closing-card-title">Sosial &amp; Budaya</h3>
            <p>{{ data.sosial_budaya || '99% warga bersuku Lampung dengan mayoritas memeluk agama Islam — identitas yang terjaga di tengah kehidupan agraris desa.' }}</p>
          </div>

          <!-- Card 2: Pemerintahan -->
          <div class="if-closing-card" @mouseenter="onEnter" @mouseleave="onLeave">
            <div class="if-closing-header">
              <div class="if-closing-icon if-closing-icon--teal">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8s0 0 0 0z"/>
                </svg>
              </div>
            </div>
            <h3 class="if-closing-card-title">Pemerintahan</h3>
            <p>{{ data.pemerintahan || 'Meraih piagam 100% pemungutan PBB-P2 Tahun Pajak 2024, dengan BPD, LKMD, TP. PKK Desa, dan Karang Taruna sebagai lembaga desa yang aktif.' }}</p>
          </div>
        </div>

        <div class="if-closing-footer">
          <p class="if-disclaimer">
            Sumber data: Data Dasar Profil Desa Umbul Limus (2017) &amp; informasi lapangan terkini · Data usia produktif &amp; jumlah rumah lamban panggung masih dalam proses konfirmasi ulang ke perangkat desa.
          </p>
          <div class="if-closing-bottom">
            DESA UMBUL LIMUS · KEC. MARGA PUNDUH · KAB. PESAWARAN · LAMPUNG
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import anime from 'animejs'
import { computed, nextTick, onMounted, ref } from 'vue'
// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
import SigerDecor from '../components/SigerDecor.vue'
import { useScrollExit } from '../composables/useScrollExit.js'
import { breadcrumb, useSeo } from '../composables/useSeo.js'

useSeo({
  title: 'Infografis & Data Desa Umbul Limus',
  description:
    'Data statistik Desa Umbul Limus, Marga Punduh, Pesawaran: jumlah penduduk, luas wilayah, jumlah dusun, RT dan RW, serta profil kependudukan desa.',
  path: '/infografis',
  jsonLd: breadcrumb([
    { name: 'Beranda', path: '/' },
    { name: 'Infografis', path: '/infografis' },
  ]),
})

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
// biome-ignore lint/correctness/noUnusedVariables: Used in template
const komposisi = computed(() => data.value.penduduk_ekonomi?.komposisi || {})
// biome-ignore lint/correctness/noUnusedVariables: Used in template
const pekerjaan = computed(() => data.value.penduduk_ekonomi?.pekerjaan || {})

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const jarakWidth = (km) => {
  const all = (data.value.jarak || []).map(j => j.km)
  const max = Math.max(...all, 1)
  return Math.round((km / max) * 100)
}

// biome-ignore lint/correctness/noUnusedVariables: Used in template
const onEnter = (e) => {
  anime({ targets: e.currentTarget, scale: 1.025, duration: 250, easing: 'easeOutExpo' })
}
// biome-ignore lint/correctness/noUnusedVariables: Used in template
const onLeave = (e) => {
  anime({ targets: e.currentTarget, scale: 1, duration: 300, easing: 'easeOutExpo' })
}

// Exit animations
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
    const res = await fetch('/data/infografis/data.json', { cache: 'no-store' })
    if (res.ok) data.value = await res.json()
  } catch (e) {
    console.error('Gagal memuat infografis:', e)
  } finally {
    loading.value = false
  }

  await nextTick()

  // Hero
  anime({
    targets: [heroLabelEl.value, heroTitleEl.value, heroSubEl.value],
    opacity: [0, 1],
    translateY: [16, 0],
    delay: anime.stagger(90),
    duration: 650,
    easing: 'easeOutExpo',
  })

  // Asal Usul
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

  // Stats count-up
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

  // Wilayah
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
        targets: sec.querySelectorAll('.compass-label, .if-wilayah-text, .if-wilayah-text p'),
        opacity: [0, 1],
        duration: 500,
        delay: anime.stagger(80, { start: 200 }),
        easing: 'easeOutExpo',
      })
    },
    (sec) => {
      const compass = sec.querySelector('.if-compass')
      if (compass) { compass.style.opacity = '0'; compass.style.transform = '' }
      sec.querySelectorAll('.compass-label, .if-wilayah-text, .if-wilayah-text p').forEach(el => {
        el.style.opacity = '0'
      })
    },
    0.2
  ).observe(secWilayah.value)

  // Jarak bar grow
  makeObserver(
    (sec) => {
      sec.querySelectorAll('.if-jarak-fill').forEach((el, i) => {
        const w = el.dataset.width || 0
        anime({ targets: el, width: ['0%', `${w}%`], duration: 900, delay: i * 100, easing: 'easeOutExpo' })
      })
      anime({ targets: sec.querySelectorAll('.if-jarak-info'), opacity: [0, 1], duration: 400, delay: anime.stagger(80) })
    },
    (sec) => {
      sec.querySelectorAll('.if-jarak-fill').forEach(el => { el.style.width = '0%' })
      sec.querySelectorAll('.if-jarak-info').forEach(el => { el.style.opacity = '0' })
    },
    0.2
  ).observe(secJarak.value)

  // Penduduk split-bar
  makeObserver(
    (sec) => {
      sec.querySelectorAll('.if-split-fill').forEach((el, i) => {
        const w = el.dataset.width || 0
        anime({ targets: el, width: ['0%', `${w}%`], duration: 800, delay: i * 90, easing: 'easeOutExpo' })
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

  // Highlight cards fade + scale
  makeObserver(
    (sec) => anime({
      targets: sec.querySelectorAll('.if-highlight-card'),
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.97, 1],
      delay: anime.stagger(130),
      duration: 600,
      easing: 'easeOutExpo',
    }),
    (sec) => sec.querySelectorAll('.if-highlight-card').forEach(el => { el.style.opacity = '0'; el.style.transform = '' }),
  ).observe(secBudaya.value)

  // Infrastruktur checklist
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

  // Penutup
  makeObserver(
    (sec) => anime({
      targets: sec.querySelectorAll('.if-closing-grid > div, .if-closing-bottom'),
      opacity: [0, 1],
      translateY: [14, 0],
      delay: anime.stagger(90),
      duration: 500,
      easing: 'easeOutExpo',
    }),
    (sec) => sec.querySelectorAll('.if-closing-grid > div, .if-closing-bottom').forEach(el => { el.style.opacity = '0'; el.style.transform = '' }),
    0.15
  ).observe(secClosing.value)
})
</script>

<style scoped>
.if-page {
  --if-maroon: #4a1220;
  --if-maroon-dark: #34090f;
  --if-cream: #f3ead9;
  --if-cream-dark: #e7dbbd;
  --if-gold: #d4a853;
  --if-sage: #4a6741;
  --if-text: #3a2f1a;
  --if-text-muted: #7a6a4d;
  background: var(--if-cream);
  min-height: 100vh;
  font-family: var(--font-sans);
  color: var(--if-text);
  position: relative;
}

/* ─── Siger Pepadun Dekorasi Statis ── */
.if-siger {
  position: absolute;
  pointer-events: none;
  z-index: 10;
}
.if-siger--top-right {
  top: 15px;
  right: 25px;
  width: 160px;
  height: 90px;
}
.if-siger--bottom-left {
  bottom: 20px;
  left: 25px;
  width: 180px;
  height: 100px;
}

/* ─── Hero Header ── */
.if-hero {
  background: var(--if-maroon);
  padding: 7.5rem 0 3.5rem;
  position: relative;
  overflow: visible;
  z-index: 1;
}
.if-hero-container {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 var(--sp-md);
  text-align: left;
  position: relative;
  z-index: 2;
}
.if-hero-label {
  display: inline-block;
  font-size: .72rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  color: var(--if-gold);
  border: 1px solid rgba(212, 168, 83, 0.4);
  background: rgba(212, 168, 83, 0.08);
  padding: .25rem .85rem; border-radius: 50px;
  margin-bottom: 1rem;
  opacity: 0;
}
.if-hero-title {
  font-family: var(--font-serif);
  font-size: clamp(2.2rem, 6vw, 4rem);
  font-weight: 700;
  color: #ffffff;
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

/* ─── Zigzag divider ── */
.if-zigzag {
  height: 16px;
  background-color: var(--if-maroon);
  background-image:
    linear-gradient(-45deg, var(--if-gold) 8px, transparent 0),
    linear-gradient(45deg, var(--if-gold) 8px, transparent 0);
  background-position: 0 0, 8px 0;
  background-size: 16px 16px;
  background-repeat: repeat-x;
  position: relative;
  z-index: 1;
}

/* ─── Sections ── */
.if-section { padding: var(--sp-lg) var(--sp-md); max-width: var(--max-w); margin: 0 auto; position: relative; z-index: 1; }
.if-section--tan { background: var(--if-cream-dark); max-width: none; position: relative; z-index: 1; }
.if-section--tan > * { max-width: var(--max-w); margin-left: auto; margin-right: auto; }

.if-label {
  display: block;
  font-size: .68rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
  color: var(--if-maroon);
  margin-bottom: .6rem;
}
.if-label--on-dark { color: var(--if-gold); }
.if-label--card { color: rgba(255, 255, 255, 0.85); font-size: .68rem; letter-spacing: .2em; margin-bottom: .4rem; }
.if-title {
  font-family: var(--font-serif);
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  font-weight: 700;
  color: var(--if-text);
  margin-bottom: 2rem;
}

/* ─── Quote cards ── */
.if-quote-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.if-quote-card {
  padding: 1.5rem 1.75rem;
  border-left: 4px solid var(--if-gold);
  background: rgba(212, 168, 83, 0.08);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  opacity: 0;
}
.if-quote-card--sage { border-left-color: var(--if-sage); background: rgba(74, 103, 65, 0.08); }
.if-quote-word { display: block; font-family: var(--font-serif); font-style: italic; font-size: 1.4rem; color: var(--if-maroon); margin-bottom: .5rem; }
.if-quote-card--sage .if-quote-word { color: var(--if-sage); }
.if-quote-card p { font-size: .9rem; line-height: 1.75; color: var(--if-text-muted); }

/* ─── Stats ── */
.if-stats {
  background: var(--if-maroon);
  display: flex; flex-wrap: wrap; justify-content: center;
  max-width: none;
  padding: 2.25rem var(--sp-md);
  position: relative; z-index: 1;
}
.if-stat {
  flex: 1 1 120px;
  text-align: center;
  padding: 0 1.5rem;
  border-right: 1px solid rgba(212, 168, 83, .2);
}
.if-stat:last-child { border-right: none; }
.if-stat-num {
  display: block;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--if-gold);
  line-height: 1;
}
.if-stat-label {
  font-size: .68rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
  color: rgba(245, 240, 232, .6);
  margin-top: .4rem; display: block;
}

/* ─── Wilayah: Kompas ── */
.if-wilayah-grid {
  display: grid;
  grid-template-columns: minmax(360px, 460px) 1fr;
  gap: 3.5rem;
  align-items: center;
}
.if-compass-wrap {
  position: relative;
  width: 100%;
  padding: 3.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
.if-compass {
  position: relative;
  width: 230px; height: 230px;
  opacity: 0;
}
.compass-circle {
  position: absolute; inset: 0;
  border: 2px dashed var(--if-gold);
  border-radius: 50%;
  box-shadow: inset 0 0 20px rgba(212, 168, 83, 0.08);
}
.compass-cross-v {
  position: absolute; left: 50%; top: -12px; bottom: -12px; width: 1px;
  background: rgba(74, 18, 32, .22);
  transform: translateX(-50%);
}
.compass-cross-h {
  position: absolute; top: 50%; left: -12px; right: -12px; height: 1px;
  background: rgba(74, 18, 32, .22);
  transform: translateY(-50%);
}
.compass-center {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  display: flex; flex-direction: column; align-items: center;
  z-index: 3;
}
.compass-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--if-maroon);
  box-shadow: 0 0 0 4px var(--if-cream);
}
.compass-center-label {
  font-size: .72rem; font-weight: 700; text-align: center; color: var(--if-maroon);
  line-height: 1.2; white-space: nowrap;
  margin-top: 6px;
  background: #ffffff;
  padding: 3px 10px; border-radius: 6px;
  border: 1px solid rgba(74, 18, 32, .12);
  box-shadow: 0 3px 10px rgba(0, 0, 0, .06);
}

/* Direction dots on circle perimeter */
.compass-dot-tip {
  position: absolute;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--if-maroon);
  box-shadow: 0 0 0 2px #ffffff;
  z-index: 2;
}
.compass-dot-tip--n { top: -4px; left: 50%; transform: translateX(-50%); }
.compass-dot-tip--s { bottom: -4px; left: 50%; transform: translateX(-50%); }
.compass-dot-tip--e { right: -4px; top: 50%; transform: translateY(-50%); }
.compass-dot-tip--w { left: -4px; top: 50%; transform: translateY(-50%); }

/* Label arah luar kompas (Anchored directly to 230px compass) */
.compass-label {
  position: absolute;
  display: flex; flex-direction: column;
  opacity: 0;
  z-index: 4;
}
.compass-dir-tag {
  font-size: .68rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase;
  color: var(--if-maroon);
  background: rgba(74, 18, 32, .06);
  padding: 2px 7px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 3px;
  width: fit-content;
}
.compass-val {
  font-family: var(--font-serif);
  font-size: .88rem;
  font-weight: 600;
  line-height: 1.3;
  color: #2c221e;
}

.compass-label--utara {
  bottom: calc(100% + 14px);
  left: 50%;
  margin-left: -80px;
  width: 160px;
  text-align: center;
  align-items: center;
}
.compass-label--selatan {
  top: calc(100% + 14px);
  left: 50%;
  margin-left: -80px;
  width: 160px;
  text-align: center;
  align-items: center;
}
.compass-label--timur {
  left: calc(100% + 14px);
  top: 50%;
  margin-top: -22px;
  width: 120px;
  text-align: left;
  align-items: flex-start;
}
.compass-label--barat {
  right: calc(100% + 14px);
  top: 50%;
  margin-top: -22px;
  width: 120px;
  text-align: right;
  align-items: flex-end;
}

/* Card Icon Badge */
.if-hl-icon-badge {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
.if-hl-icon-badge svg {
  width: 22px; height: 22px;
  fill: #ffffff;
}


.if-wilayah-text p { font-size: .95rem; line-height: 1.8; color: var(--if-text-muted); }
.if-wilayah-text .if-note { font-size: .8rem; font-style: italic; color: var(--if-text-muted); opacity: .85; margin-top: .75rem; }

.if-map-wrap {
  margin-top: 2rem;
  border: 1px solid rgba(74, 18, 32, .15);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.if-map { display: block; width: 100%; height: 280px; border: 0; }

/* ─── Jarak ── */
.if-jarak-list { display: flex; flex-direction: column; gap: 1.4rem; max-width: 640px; }
.if-jarak-info { display: flex; justify-content: space-between; align-items: baseline; font-size: .9rem; margin-bottom: .45rem; opacity: 0; }
.if-jarak-info em { font-style: italic; color: var(--if-text-muted); font-size: .8rem; margin-left: .3rem; }
.if-jarak-km { font-weight: 700; color: var(--if-maroon); font-size: 1rem; white-space: nowrap; }
.if-jarak-track { height: 8px; background: rgba(74, 18, 32, .1); border-radius: 99px; overflow: hidden; }
.if-jarak-fill { height: 100%; width: 0%; border-radius: 99px; background: linear-gradient(90deg, var(--if-sage), var(--if-gold)); }

/* ─── Dual grid ── */
.if-dual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
.if-dual-grid p { font-size: .92rem; line-height: 1.8; color: var(--if-text-muted); }
.if-sub-label { display: block; font-size: .7rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--if-maroon); margin-bottom: .9rem; }

/* Split bar */
.if-split-bar { display: flex; height: 10px; border-radius: 99px; overflow: hidden; background: rgba(74, 18, 32, .08); }
.if-split-fill { height: 100%; width: 0%; }
.if-split-fill--laki, .if-split-fill--petani { background: var(--if-maroon); }
.if-split-fill--perempuan, .if-split-fill--lain { background: var(--if-gold); }
.if-split-labels { display: flex; justify-content: space-between; font-size: .82rem; margin-top: .6rem; opacity: 0; }
.if-split-labels strong { color: var(--if-text); }
.if-caption { margin-top: .9rem; font-size: .88rem; line-height: 1.75; opacity: 0; }

/* ─── Highlight Cards (Arsitektur & Pariwisata) ── */
.if-highlight-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.75rem; max-width: var(--max-w); margin: 0 auto; }
.if-highlight-card {
  padding: 2rem 2.25rem;
  border-radius: var(--radius-md);
  opacity: 0;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.if-highlight-card--orange {
  background: #d97706; /* Warna Oranye khas Rumah Panggung */
  color: #ffffff;
}
.if-highlight-card--teal {
  background: #0d9488; /* Warna Teal khas Air Terjun Way Curup */
  color: #ffffff;
}
.if-highlight-title {
  font-family: var(--font-serif);
  font-size: 1.45rem;
  font-weight: 700;
  color: #ffffff;
  margin: .2rem 0 .75rem;
  line-height: 1.25;
}
.if-highlight-card p {
  font-size: .92rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.9);
}

/* ─── Checklist ── */
.if-checklist { display: flex; flex-direction: column; gap: .8rem; }
.if-checklist li { display: flex; align-items: flex-start; gap: .75rem; font-size: .9rem; line-height: 1.5; opacity: 0; }
.if-check-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  font-size: .7rem; font-weight: 700; flex-shrink: 0;
  margin-top: 1px;
  color: #ffffff;
}
.if-check-icon--yes { background: var(--if-sage); }
.if-check-icon--no { background: #a04040; }

/* ─── Penutup ── */
.if-closing {
  background: var(--if-maroon);
  padding: 4.5rem var(--sp-md) 3rem;
  position: relative;
  overflow: hidden;
  z-index: 1;
}
.if-closing-grid { max-width: var(--max-w); margin: 0 auto; position: relative; z-index: 3; }
.if-closing-card {
  background: rgba(0, 0, 0, 0.22);
  padding: 2.2rem 2.4rem;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  opacity: 0;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.if-closing-header { margin-bottom: 1rem; }
.if-closing-icon {
  width: 42px; height: 42px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
.if-closing-icon svg { width: 22px; height: 22px; fill: #ffffff; }
.if-closing-icon--gold { background: #d99b00; }
.if-closing-icon--teal { background: #00838f; }

.if-closing-card-title {
  font-family: var(--font-serif);
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.8rem;
  line-height: 1.25;
}
.if-closing-card p { color: rgba(255, 255, 255, 0.88); font-size: 0.95rem; line-height: 1.75; }

.if-closing-footer {
  max-width: var(--max-w);
  margin: 3.5rem auto 0;
  padding-top: 1.8rem;
  border-top: 1px solid rgba(212, 168, 83, 0.3);
  position: relative;
  z-index: 3;
}
.if-disclaimer {
  font-size: 0.82rem;
  line-height: 1.7;
  color: #d4a853;
  margin-bottom: 1.5rem;
}
.if-closing-bottom {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #d4a853;
  text-align: left;
  opacity: 0.9;
}

/* ─── Skeleton ── */
.if-skeleton { max-width: var(--max-w); margin: 0 auto; padding: var(--sp-lg) var(--sp-md); display: flex; flex-direction: column; gap: 2rem; }
.if-skel-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.if-skel-card { height: 110px; border-radius: var(--radius-sm); }
.if-skel-stats { display: flex; gap: 1rem; }
.if-skel-stat { flex: 1; height: 70px; border-radius: var(--radius-sm); }
.if-skel-block { height: 220px; border-radius: var(--radius-sm); }

/* ─── Responsive ── */
@media (max-width: 900px) {
  .if-wilayah-grid { grid-template-columns: 1fr; gap: 2rem; }
  .if-compass-wrap { width: 100%; max-width: 380px; height: 320px; }
  .if-compass { width: 170px; height: 170px; }
  .if-dual-grid { grid-template-columns: 1fr; gap: 2rem; }
  .if-quote-grid { grid-template-columns: 1fr; }
  .if-highlight-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .if-hero { padding: 6.5rem 1.25rem 2.25rem; }
  .if-section, .if-closing { padding: var(--sp-lg) 1.25rem; }
  .if-stats { padding: 1.75rem 1.25rem; }
  .if-stat { flex: 1 1 40%; border-right: none; margin-bottom: 1rem; }
  .if-siger--top-right { width: 120px; height: 70px; top: 10px; right: 10px; }
  .if-siger--bottom-left { width: 130px; height: 75px; bottom: 10px; left: 10px; }
  .compass-label span { font-size: .72rem; max-width: 80px; }
  .compass-label strong { font-size: .65rem; }
}
</style>
