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

    <section v-else class="bagan-tree-section" ref="secTree">
      <div class="tree-outer">
        <OrgChart v-if="data.struktur?.length" :items="data.struktur" />
      </div>

      <!-- Di luar struktur formal: Tokoh Adat / Tokoh Masyarakat — selalu di bawah tree -->
      <div v-if="data.tokoh_adat && data.tokoh_adat.length" class="tokoh-adat-wrap">
        <aside class="tokoh-adat-panel">
          <div class="tap-header">
            <span class="tap-label">Di Luar Struktur Formal</span>
            <h4 class="tap-title">Tokoh Adat</h4>
          </div>
          <div class="tap-list">
            <div v-for="t in data.tokoh_adat" :key="t.nama" class="tap-card">
              <img :src="t.foto || fallbackAvatar(t.nama)" :alt="t.nama" class="tap-img" />
              <div class="tap-info">
                <span class="tap-nama">{{ t.nama }}</span>
                <span class="tap-peran">{{ t.peran }}</span>
              </div>
            </div>
          </div>
        </aside>
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
            <h3>Kepala Dusun</h3>
            <p>Unsur satuan tugas kewilayahan di bawah koordinasi Sekretaris Desa, membantu di wilayah dusun masing-masing: menjaga ketenteraman dan ketertiban, penanggulangan bencana, mobilitas kependudukan, serta penataan wilayah.</p>
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
import { fallbackAvatar } from '../composables/useOrgTree.js'

const data = ref({})
const loading = ref(true)

// biome-ignore lint/correctness/noUnusedVariables: Used in Vue template
const secTree     = ref(null)
const heroContent = ref(null)

// Tint tipis (bukan wash tebal) supaya foto aparat desa yang asli tetap terlihat jelas,
// dipadu overlay gelap-ke-transparan (.page-hero__overlay) khusus untuk keterbacaan teks.
const bgStyle = computed(() => ({
  backgroundImage: data.value.background
    ? `linear-gradient(135deg, rgba(58,50,30,0.45), rgba(26,20,12,0.5)), url(${data.value.background})`
    : 'linear-gradient(135deg, #3a3220, #1a140d)',
}))

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

  // ── Hero: teks muncul dari bawah + label badge fade-in ──
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

defineExpose({ bgStyle, fallbackAvatar })
</script>

<style scoped>
/* ─── Palet "Arsip Desa": diturunkan dari foto sepia/olive header ──
   Menggantikan hijau neon global (--c-terra dkk) di seluruh halaman
   bagan (termasuk OrgChart.vue, yang mewarisi custom property ini
   lewat cascade DOM meski style-nya scoped) supaya selaras dengan
   foto aparat desa yang bertone khaki/olive/coklat tua. */
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

/* ─── Skeleton: mengikuti bentuk tree organisasi (unik, bukan spinner generik) ── */
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

/* ─── Tree Section ── */
.bagan-tree-section {
  background: var(--c-cream-dark);
  padding: var(--sp-xl) var(--sp-md);
  overflow-x: hidden;
}

.tree-outer {
  max-width: var(--max-w);
  margin: 0 auto;
}

/* Tokoh Adat: eksplisit di luar struktur formal (border putus-putus + label), selalu di bawah tree */
.tokoh-adat-wrap {
  max-width: var(--max-w);
  margin: 3rem auto 0;
  display: flex;
  justify-content: center;
}
.tokoh-adat-panel {
  width: 100%;
  max-width: 760px;
  background: rgba(122, 74, 58, 0.05);
  border: 1.5px dashed var(--c-terra);
  border-radius: var(--radius-md);
  padding: 1.75rem;
}
.tap-header { margin-bottom: 1.25rem; }
.tap-label {
  display: block;
  font-size: .62rem; font-weight: 700;
  letter-spacing: .16em; text-transform: uppercase;
  color: var(--c-terra);
  margin-bottom: .35rem;
}
.tap-title { font-family: var(--font-serif); font-size: 1.15rem; color: var(--c-stone); }
.tap-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.1rem 1.5rem;
}
.tap-card { display: flex; align-items: center; gap: .8rem; }
.tap-img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid var(--c-cream-dark); }
.tap-info { display: flex; flex-direction: column; gap: .1rem; }
.tap-nama { font-family: var(--font-serif); font-size: .92rem; font-weight: 600; color: var(--c-stone); }
.tap-peran { font-size: .68rem; color: var(--c-stone-muted); }

/* ─── Tugas & Fungsi / Lembaga Kemasyarakatan ── */
.info-section { padding: var(--sp-lg) var(--sp-md); background: var(--c-cream); }
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
