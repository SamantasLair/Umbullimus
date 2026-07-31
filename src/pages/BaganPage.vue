<template>
  <div class="bagan-page">
    <div class="page-hero" :style="bgStyle">
      <div class="page-hero__overlay"></div>
      <div class="page-hero__content" ref="heroContent">
        <span class="page-hero__label">Pemerintahan</span>
        <h1 class="page-hero__title">Struktur Organisasi<br><em>Desa Umbul Limus</em></h1>
        <p v-if="data.kecamatan" class="page-hero__sub">
          Kec. {{ data.kecamatan }} · Kab. {{ data.kabupaten }} · {{ data.provinsi }}
        </p>
      </div>
    </div>

    <div v-if="loading" class="bagan-skeleton" aria-hidden="true">
      <div class="skeleton-box skel-node skel-node--lead"></div>
      <div class="skeleton-box skel-connector"></div>
      <div class="skel-row skel-row--4">
        <div class="skeleton-box skel-node skel-node--mid" v-for="n in 4" :key="n"></div>
      </div>
      <div class="skeleton-box skel-connector"></div>
      <div class="skel-row skel-row--6">
        <div class="skeleton-box skel-node skel-node--small" v-for="n in 6" :key="n"></div>
      </div>
    </div>

    <section v-else class="bagan-tree-section">
      <div class="tree-outer">
        <div v-if="data.struktur?.length" class="tree-toolbar">
          <div class="tree-toolbar__left">
            <label v-if="punyaTokohAdat" class="tree-toggle">
              <input type="checkbox" v-model="sertakanTokoh" />
              <span>Sertakan Tokoh Adat dalam unduhan</span>
            </label>
            <span class="tree-hint">Geser mendatar untuk melihat seluruh bagan</span>
          </div>
          <div class="tree-actions">
            <button
              type="button"
              class="dl-btn"
              :disabled="exporting !== ''"
              @click="unduh(false)"
            >
              {{ exporting === 'solid' ? 'Menyiapkan…' : 'Unduh PNG' }}
            </button>
            <button
              type="button"
              class="dl-btn dl-btn--ghost"
              :disabled="exporting !== ''"
              @click="unduh(true)"
            >
              {{ exporting === 'transparan' ? 'Menyiapkan…' : 'PNG Tanpa Latar' }}
            </button>
          </div>
        </div>
        <p v-if="exportError" class="dl-error" role="alert">{{ exportError }}</p>

        <div class="tree-viewport">
          <!-- Wadah potret ekspor: tree + panel di luar struktur, berdampingan -->
          <div class="tree-canvas" ref="captureRef">
            <OrgChart v-if="data.struktur?.length" ref="chartRef" :items="data.struktur" />

            <!-- Di luar struktur formal: Hierarki Garis Lurus Tokoh Adat Saibatin -->
            <aside v-if="punyaTokohAdat" class="tokoh-adat-panel">
              <div class="tap-header">
                <span class="tap-label">Ketua Adat Saibatin *</span>
                <h4 class="tap-title">Hierarki Tokoh Adat</h4>
              </div>
              <div class="tap-list tap-list--linear">
                <!-- Elemen DOM garis lurus vertikal kontinu dari badge 1 s/d 8 (100% terbaca di web & PNG) -->
                <div class="tap-spine-line" aria-hidden="true"></div>

                <div
                  v-for="t in data.tokoh_adat"
                  :key="t.nama"
                  class="tap-row"
                  :class="{ 'tap-row--top': t.rank === 1 }"
                >
                  <div class="tap-spine-node">
                    <div class="tap-node-badge">{{ t.rank }}</div>
                    <div class="tap-branch-line"></div>
                  </div>

                  <div class="tap-card" :class="{ 'tap-card--top': t.rank === 1 }">
                    <img :src="t.foto || fallbackAvatar(t.nama)" :alt="t.nama" class="tap-img" />
                    <div class="tap-info">
                      <span class="tap-nama">{{ t.nama }}</span>
                      <span class="tap-gelar">{{ t.gelar }}</span>
                      <span class="tap-peran">{{ t.peran }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="tap-note">
                <span class="tap-note-asterisk">*</span>
                <p>Meskipun sebagian besar adat warga Desa Umbul Limus berbasis <strong>Lampung Pepadun</strong>, struktur Pemimpin/Ketua Adat setempat bergelar dan beradat <strong>Lampung Saibatin</strong>.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>

    <!-- Tugas & Fungsi Perangkat Desa -->
    <section class="info-section">
      <div class="info-wrap">
        <span class="info-label">Pemerintahan Desa</span>
        <h2 class="info-title">Tugas &amp; Fungsi Perangkat Desa</h2>
        <div class="role-grid">
          <article class="role-card">
            <h3>Kepala Desa</h3>
            <p>Memimpin penyelenggaraan pemerintahan desa, melaksanakan pembangunan, pembinaan kemasyarakatan, dan pemberdayaan masyarakat desa sebagai penanggung jawab utama.</p>
          </article>
          <article class="role-card">
            <h3>Sekretaris Desa</h3>
            <p>Membantu Kepala Desa dalam bidang administrasi pemerintahan dan menyusun laporan penyelenggaraan pemerintahan desa, membawahi langsung 3 Kepala Dusun.</p>
          </article>
          <article class="role-card">
            <h3>Bendahara &amp; Operator Desa</h3>
            <p>Bendahara Desa mengelola keuangan dan aset desa. Operator Desa menangani administrasi digital, input data, serta pelaporan sistem desa.</p>
          </article>
          <article class="role-card">
            <h3>Kepala Urusan &amp; Kepala Seksi</h3>
            <p>Setara hierarkinya, langsung di bawah Kepala Desa. Kaur menjalankan pelayanan administratif (umum, keuangan, perencanaan). Kasi menjadi unsur pelaksana teknis di lapangan (pemerintahan, kesejahteraan, pelayanan) seperti urusan kependudukan, sosial budaya, dan keagamaan.</p>
          </article>
          <article class="role-card">
            <h3>Kepala Dusun &amp; Ketua RT</h3>
            <p>Kepala Dusun merupakan unsur pelaksana kewilayahan di bawah Sekretaris Desa. Ketua RT menjadi garda terdepan pelayanan kependudukan dan kemasyarakatan di tingkat lingkungan terdepan.</p>
          </article>
          <article class="role-card">
            <h3>Kader Pemberdayaan Masyarakat (KPM)</h3>
            <p>Unsur masyarakat desa yang bertugas menumbuhkan dan menggerakkan partisipasi warga, mendampingi proses perencanaan serta pelaksanaan pembangunan desa, dan memfasilitasi kegiatan pemberdayaan masyarakat secara berkelanjutan.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Gelar & Peran Struktur Tokoh Adat Saibatin -->
    <section class="info-section info-section--adat">
      <div class="info-wrap">
        <span class="info-label">Struktur Kebudayaan Lokal</span>
        <h2 class="info-title">Gelar &amp; Peran Tokoh Adat Saibatin</h2>
        <div class="role-grid role-grid--2">
          <article class="role-card role-card--adat">
            <h3>Khaghya (Khaghya Susunan Adat)</h3>
            <p>Pemimpin adat tertinggi (Puncak Hierarki) yang memegang kewenangan mutlak dalam musyawarah adat, pengayom norma kemasyarakatan, serta penyimbang utama dalam tradisi Lampung Saibatin di Desa Umbul Limus.</p>
          </article>
          <article class="role-card role-card--adat">
            <h3>Khaja (Khaja Simbangan)</h3>
            <p>Wakil pimpinan adat (Simbangan) yang mendampingi Khaghya dalam memimpin persidangan adat, mengoordinasikan jajaran pembesar adat, dan tata laksana upacara kebudayaan.</p>
          </article>
          <article class="role-card role-card--adat">
            <h3>Minak (Minak Setya &amp; Minak Panglima)</h3>
            <p>Pembesar adat yang bertugas menjaga keutuhan tatanan sosial, pengawalan nilai-nilai luhur adat, serta penegakan ketertiban hukum adat di lingkungan desa.</p>
          </article>
          <article class="role-card role-card--adat">
            <h3>Khadin (Khadin Pemuka, Jaksa, Mulya, Pengkhamban)</h3>
            <p>Jajaran pelaksana operasional adat yang mengurusi tata laksana ritual kebudayaan, kehakiman adat (Jaksa), penghormatan adat (Mulya), serta pengabdian pelayanan warga (Pengkhamban).</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Lembaga Kemasyarakatan Desa -->
    <section class="info-section info-section--dark">
      <div class="info-wrap">
        <span class="info-label info-label--on-dark">Mitra Pemerintah Desa</span>
        <h2 class="info-title info-title--on-dark">Lembaga Kemasyarakatan Desa</h2>
        <div class="role-grid role-grid--3">
          <article class="role-card role-card--dark">
            <h3>BPD (Badan Permusyawaratan Desa)</h3>
            <p>Dibentuk sejak 27 Mei 2011 dengan 5 orang anggota, BPD membahas dan menyepakati Rancangan Peraturan Desa bersama Kepala Desa, menampung serta menyalurkan aspirasi masyarakat, dan mengawasi kinerja Kepala Desa. BPD juga menyelenggarakan musyawarah desa dan membentuk panitia pemilihan Kepala Desa.</p>
          </article>
          <article class="role-card role-card--dark">
            <h3>LKMD (Lembaga Ketahanan Masyarakat Desa)</h3>
            <p>Wadah partisipasi masyarakat dalam pembangunan desa: menyusun rencana pembangunan secara partisipatif, menggerakkan swadaya gotong royong, serta membantu Pemerintah Desa dalam penyelenggaraan pembangunan dan kemasyarakatan.</p>
          </article>
          <article class="role-card role-card--dark">
            <h3>PKK (Pemberdayaan Kesejahteraan Keluarga)</h3>
            <p>Organisasi penggerak pemberdayaan perempuan dalam pembangunan desa, menjalankan 10 Program Pokok PKK — mulai dari gotong royong, pangan, pendidikan, hingga kesehatan keluarga — melalui kelompok dasa wisma di tingkat RT/dusun.</p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import anime from 'animejs'
import { computed, nextTick, onMounted, ref } from 'vue'
// biome-ignore lint/correctness/noUnusedImports: Used in template
import OrgChart from '../components/OrgChart.vue'
import { exportChartPng } from '../composables/useChartExport.js'
import { fallbackAvatar } from '../composables/useOrgTree.js'
import { breadcrumb, useSeo } from '../composables/useSeo.js'

const data = ref({})
const loading = ref(true)

const heroContent = ref(null)
const chartRef    = ref(null)
const captureRef  = ref(null)

const exporting   = ref('')
const exportError = ref('')

const sertakanTokoh = ref(true)
const punyaTokohAdat = computed(() => !!data.value.tokoh_adat?.length)

useSeo(() => ({
  title: 'Struktur Organisasi & Lembaga Desa Umbul Limus',
  description:
    'Situs resmi struktur organisasi Pemerintah Desa Umbul Limus, BPD, perangkat desa, serta lembaga adat Saibatin.',
  path: '/bagan',
  jsonLd: breadcrumb([
    { name: 'Beranda', path: '/' },
    { name: 'Struktur Organisasi', path: '/bagan' },
  ]),
}))

async function unduh(transparent) {
  if (exporting.value) return
  exporting.value = transparent ? 'transparan' : 'solid'
  exportError.value = ''
  try {
    await document.fonts?.ready
    chartRef.value?.refresh()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 80))
    chartRef.value?.refresh()

    const ikutTokoh = sertakanTokoh.value && punyaTokohAdat.value
    const target = ikutTokoh ? captureRef.value : chartRef.value?.wrapEl

    await exportChartPng(target, {
      transparent,
      title: `Struktur Organisasi Desa ${data.value.desa || ''}`.trim(),
      subtitle: data.value.kecamatan
        ? `Kec. ${data.value.kecamatan} · Kab. ${data.value.kabupaten} · ${data.value.provinsi}`
        : '',
      filename: transparent
        ? 'struktur-desa-umbul-limus-tanpa-latar.png'
        : 'struktur-desa-umbul-limus.png',
    })
  } catch (e) {
    console.error('Gagal mengunduh bagan:', e)
    exportError.value = 'Gagal menyiapkan berkas PNG. Silakan coba lagi.'
  } finally {
    exporting.value = ''
  }
}

const bgStyle = computed(() => {
  const bg = data.value.background || '/images/profil/header-aparat-desa.jpg'
  return {
    backgroundImage: `linear-gradient(135deg, rgba(58,50,30,0.45), rgba(26,20,12,0.5)), url(${bg})`,
  }
})

onMounted(async () => {
  try {
    const res = await fetch('/data/bagan/struktur.json', { cache: 'no-store' })
    if (res.ok) data.value = await res.json()
  } catch (e) {
    console.error('Gagal memuat bagan:', e)
  } finally {
    loading.value = false
  }

  await nextTick()

  if (heroContent.value) {
    anime({
      targets: heroContent.value.querySelectorAll('.page-hero__label, .page-hero__title, .page-hero__sub'),
      opacity:    [0, 1],
      translateY: [28, 0],
      delay: anime.stagger(120),
      duration: 700,
      easing: 'easeOutExpo',
    })
  }
})

defineExpose({ bgStyle, fallbackAvatar, unduh })
</script>

<style scoped>
.bagan-page {
  --c-terra: #b6924a;
  --c-terra-dark: #8a6f38;
  --c-sage: #7d7350;
  --c-sage-light: #ded2ab;
  --c-stone: #2a2118;
  --c-stone-muted: #6b5f4c;
  --c-dark-bg: #1a140d;
  --c-cream: #f6f1e4;
  --c-cream-dark: #ecdfc2;
  --c-white: #fbf8f0;
  background: var(--c-cream); min-height: 100vh;
}

/* Hero */
.page-hero {
  position: relative;
  height: 52vh; min-height: 360px;
  display: flex; align-items: flex-end;
  background-size: cover; background-position: center 35%;
  overflow: hidden;
}
.page-hero__overlay {
  position: absolute; inset: 0;
  background:
    radial-gradient(circle at 50% 40%, rgba(58,50,30,0.25) 0%, rgba(20,10,5,0.75) 100%),
    linear-gradient(to top, var(--c-dark-bg) 0%, rgba(20,10,5,.55) 50%, rgba(20,10,5,.2) 100%);
  backdrop-filter: blur(1.5px);
  -webkit-backdrop-filter: blur(1.5px);
}
.page-hero__content {
  position: relative; z-index: 2;
  max-width: var(--max-w); width: 100%;
  margin: 0 auto; padding: 6.5rem var(--sp-md) 3rem;
}
.page-hero__label {
  display: inline-block; font-size: .68rem; font-weight: 700;
  letter-spacing: .22em; text-transform: uppercase;
  color: var(--c-terra); border: 1px solid var(--c-terra);
  padding: .28rem .9rem; border-radius: 50px; margin-bottom: 1rem;
}
.page-hero__title {
  font-family: var(--font-serif); font-size: clamp(2.2rem,6vw,4rem);
  font-weight: 700; color: var(--c-cream); line-height: 1.1; margin-bottom: .75rem;
}
.page-hero__title em { font-style: italic; color: rgba(245,240,232,.65); }
.page-hero__sub { font-size: .85rem; color: rgba(245,240,232,.5); letter-spacing: .06em; }

/* Skeleton */
.bagan-skeleton {
  display: flex; flex-direction: column; align-items: center;
  gap: 0; padding: var(--sp-lg) var(--sp-md);
  max-width: var(--max-w); margin: 0 auto;
}
.skel-node { border-radius: var(--radius-md); }
.skel-node--lead { width: 220px; height: 74px; }
.skel-connector { width: 2px; height: 2rem; }
.skel-row { display: flex; gap: 1.25rem; margin-top: 0.5rem; flex-wrap: wrap; justify-content: center; }
.skel-row--4 .skel-node--mid { width: 150px; height: 62px; }
.skel-row--6 { margin-top: 1.5rem; }
.skel-row--6 .skel-node--small { width: 120px; height: 58px; }

@media (max-width: 600px) {
  .skel-node--lead { width: 180px; }
  .skel-row { flex-direction: column; align-items: center; }
}

/* Tree Section */
.bagan-tree-section {
  background: var(--c-cream-dark);
  padding: var(--sp-xl) var(--sp-md);
  overflow-x: hidden;
}

.tree-outer {
  max-width: var(--max-w);
  margin: 0 auto;
}

.tree-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: .75rem 1rem;
  margin-bottom: 1.5rem;
}
.tree-toolbar__left {
  display: flex;
  flex-direction: column;
  gap: .3rem;
}
.tree-hint {
  font-size: .72rem;
  letter-spacing: .04em;
  color: var(--c-stone-muted);
}
.tree-toggle {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  font-size: .78rem;
  font-weight: 600;
  color: var(--c-stone);
  cursor: pointer;
  user-select: none;
}
.tree-toggle input {
  width: 15px; height: 15px;
  accent-color: var(--c-terra-dark);
  cursor: pointer;
}
.tree-actions { display: flex; gap: .6rem; flex-wrap: wrap; }

.tree-viewport {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding: 0.5rem 0.5rem 1rem;
  scroll-behavior: smooth;
  overscroll-behavior-x: contain;
}
.tree-viewport::-webkit-scrollbar {
  height: 10px;
}
.tree-viewport::-webkit-scrollbar-track {
  background: rgba(42, 33, 24, 0.08);
  border-radius: 10px;
}
.tree-viewport::-webkit-scrollbar-thumb {
  background: var(--c-terra-dark);
  border-radius: 10px;
}
.tree-viewport::-webkit-scrollbar-thumb:hover {
  background: var(--c-terra);
}

.tree-canvas {
  display: flex;
  align-items: stretch;
  gap: 1.75rem;
  width: max-content;
}

.dl-btn {
  font-family: inherit;
  font-size: .76rem;
  font-weight: 600;
  letter-spacing: .04em;
  color: var(--c-white);
  background: var(--c-terra-dark);
  border: 1px solid var(--c-terra-dark);
  border-radius: 50px;
  padding: .5rem 1.15rem;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}
.dl-btn:hover:not(:disabled) {
  background: var(--c-terra);
  border-color: var(--c-terra);
  transform: translateY(-1px);
}
.dl-btn:disabled { opacity: .55; cursor: progress; }

.dl-btn--ghost {
  background: transparent;
  color: var(--c-terra-dark);
}
.dl-btn--ghost:hover:not(:disabled) {
  background: var(--c-terra);
  color: var(--c-white);
}

.dl-error {
  font-size: .78rem;
  color: #a3341f;
  margin-bottom: 1rem;
}

/* ─── Tokoh Adat: Hierarki Garis Lurus (Saibatin) ─── */
.tokoh-adat-panel {
  width: 325px;
  flex-shrink: 0;
  background: rgba(122, 74, 58, 0.06);
  border: 1.5px dashed var(--c-terra);
  border-radius: var(--radius-md);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.tap-header { margin-bottom: .75rem; }
.tap-label {
  display: inline-block;
  font-size: .62rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
  color: var(--c-white);
  background: var(--c-terra-dark);
  padding: .25rem .75rem;
  border-radius: 50px;
  margin-bottom: .45rem;
}
.tap-title { font-family: var(--font-serif); font-size: 1.15rem; color: var(--c-stone); }

.tap-list--linear {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  gap: .65rem;
  margin: .5rem 0;
}

/* Elemen DOM nyata: garis lurus vertikal kontinu dari badge 1 s/d 8 (100% nyambung & 100% terbaca di PNG) */
.tap-spine-line {
  position: absolute;
  top: 18px;
  bottom: 18px;
  left: 12.75px;
  width: 2.5px;
  background: var(--c-terra-dark);
  z-index: 0;
}

.tap-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0;
}

.tap-spine-node {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
}

.tap-node-badge {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--c-terra-dark);
  color: var(--c-white);
  font-size: .78rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 0 2.5px var(--c-cream-dark);
}
.tap-row--top .tap-node-badge {
  background: var(--c-terra-dark);
  box-shadow: 0 0 0 3px #8a6f38, 0 2px 5px rgba(0,0,0,0.18);
}

.tap-branch-line {
  width: 14px;
  height: 2.5px;
  background: var(--c-terra-dark);
  flex-shrink: 0;
}

.tap-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: .65rem;
  background: var(--c-white);
  border-radius: var(--radius-sm);
  padding: .55rem .65rem;
  box-shadow: var(--shadow-card);
  border-left: 3px solid var(--c-sage);
  transition: transform .2s, box-shadow .2s;
  min-width: 0;
}
.tap-card:hover {
  transform: translateX(3px);
  box-shadow: var(--shadow-lift);
}
.tap-card--top {
  border-left: 4px solid var(--c-terra-dark);
  background: var(--c-cream);
}
.tap-img {
  width: 54px; height: 54px;
  border-radius: 50%; object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--c-cream-dark);
}
.tap-info { display: flex; flex-direction: column; min-width: 0; }
.tap-nama { font-family: var(--font-serif); font-size: .98rem; font-weight: 700; color: var(--c-stone); line-height: 1.2; }
.tap-gelar { font-size: .78rem; font-weight: 600; color: var(--c-terra-dark); margin-top: .1rem; }
.tap-peran { font-size: .68rem; color: var(--c-stone-muted); margin-top: .05rem; }

.tap-note {
  display: flex;
  gap: .4rem;
  margin-top: 1.25rem;
  padding-top: .85rem;
  border-top: 1px dashed var(--c-terra);
  font-size: .72rem;
  line-height: 1.5;
  color: var(--c-stone-muted);
}
.tap-note-asterisk {
  font-weight: 700;
  color: var(--c-terra-dark);
  font-size: .95rem;
  line-height: 1;
}

/* Info Sections */
.info-section { padding: var(--sp-lg) var(--sp-md); background: var(--c-cream); }
.info-section--adat {
  background: var(--c-cream-dark);
  border-top: 1px solid var(--c-cream);
}
.info-section--dark { background: var(--c-stone); }
.info-wrap { max-width: var(--max-w); margin: 0 auto; }

.info-label {
  display: block; font-size: .68rem; font-weight: 700;
  letter-spacing: .18em; text-transform: uppercase;
  color: var(--c-terra-dark); margin-bottom: .6rem;
}
.info-label--on-dark { color: var(--c-sage-light); }
.info-title {
  font-family: var(--font-serif); font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700; color: var(--c-stone); margin-bottom: 2rem;
}
.info-title--on-dark { color: var(--c-cream); }

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}
.role-grid--2 { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.role-grid--3 { grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); }

.role-card {
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-card);
  border-left: 3px solid var(--c-terra);
}
.role-card--adat {
  border-left: 3.5px solid var(--c-terra-dark);
  background: var(--c-white);
}
.role-card h3 {
  font-family: var(--font-serif); font-size: 1.05rem;
  color: var(--c-stone); margin-bottom: .6rem;
}
.role-card p { font-size: .88rem; line-height: 1.7; color: var(--c-stone-muted); }

.role-card--dark {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 3px solid var(--c-siger);
  box-shadow: none;
}
.role-card--dark h3 { color: var(--c-cream); }
.role-card--dark p { color: rgba(237, 250, 233, 0.65); }

@media (max-width: 600px) {
  .info-section { padding: var(--sp-lg) 1.25rem; }
}
</style>
