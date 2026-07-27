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
        <ul class="org-tree" v-if="data.kepala_desa">
          <li>
            <div class="org-box org-box--kepala">
              <span class="pf-crown">Pimpinan Tertinggi Desa</span>
              <img :src="data.kepala_desa.foto || fallbackAvatar(data.kepala_desa.nama)" :alt="data.kepala_desa.nama" class="org-img org-img--lead" />
              <span class="org-jabatan">{{ data.kepala_desa.jabatan }}</span>
              <span class="org-nama org-nama--lead">{{ data.kepala_desa.nama }}</span>
              <span v-if="data.kepala_desa.periode" class="org-periode">{{ data.kepala_desa.periode }}</span>
              <p v-if="data.kepala_desa.bio" class="org-bio">{{ data.kepala_desa.bio }}</p>
            </div>

            <ul>
              <li v-if="data.sekretaris_desa">
                <!-- Kaur & Kasi ditampilkan MENYATU di dalam kartu Sekretaris (bukan cabang tree terpisah),
                     supaya di tampilan bertumpuk (mobile) tidak terbaca seolah Kadus ada di bawah rantai
                     Kaur/Kasi. Sekretaris & Kadus tetap sama-sama daun langsung dari Kepala Desa. -->
                <div class="org-box org-box--sekretaris">
                  <img :src="data.sekretaris_desa.foto || fallbackAvatar(data.sekretaris_desa.nama)" :alt="data.sekretaris_desa.nama" class="org-img" />
                  <span class="org-jabatan">{{ data.sekretaris_desa.jabatan }}</span>
                  <span class="org-nama">{{ data.sekretaris_desa.nama }}</span>
                  <span v-if="data.sekretaris_desa.periode" class="org-periode">{{ data.sekretaris_desa.periode }}</span>

                  <div class="org-substaff" v-if="staffGroups.length">
                    <div class="org-substaff-group" v-for="g in staffGroups" :key="g.key">
                      <span class="org-group-title" :class="`org-group-title--${g.key}`">{{ g.label }}</span>
                      <div class="org-group-list">
                        <div class="org-group-person" v-for="p in g.people" :key="p.jabatan">
                          <img :src="p.foto || fallbackAvatar(p.nama)" :alt="p.nama" class="org-img org-img--xs" />
                          <div class="org-group-person-text">
                            <span class="org-jabatan org-jabatan--sm">{{ p.jabatan }}</span>
                            <span class="org-nama org-nama--sm">{{ p.nama }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              <li v-for="k in data.kadus" :key="k.jabatan">
                <div class="org-box org-box--kadus">
                  <img :src="k.foto || fallbackAvatar(k.nama)" :alt="k.nama" class="org-img org-img--sm" />
                  <span class="org-jabatan org-jabatan--sm">{{ k.jabatan }}</span>
                  <span class="org-nama org-nama--sm">{{ k.nama }}</span>
                </div>
              </li>
            </ul>
          </li>
        </ul>
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
            <p>Membantu Kepala Desa dalam bidang administrasi pemerintahan, mengoordinasikan tugas Kaur dan Kasi, serta menyusun laporan penyelenggaraan pemerintahan desa.</p>
          </article>
          <article class="role-card">
            <h3>Kepala Urusan &amp; Kepala Seksi</h3>
            <p>Kaur membantu Sekretaris Desa dalam pelayanan administratif (umum, keuangan, perencanaan). Kasi menjadi unsur pelaksana teknis di lapangan (pemerintahan, kesejahteraan, pelayanan) seperti urusan kependudukan, sosial budaya, dan keagamaan.</p>
          </article>
          <article class="role-card">
            <h3>Kepala Dusun</h3>
            <p>Unsur satuan tugas kewilayahan yang membantu Kepala Desa di wilayah dusun masing-masing: menjaga ketenteraman dan ketertiban, penanggulangan bencana, mobilitas kependudukan, serta penataan wilayah.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Lembaga Kemasyarakatan Desa -->
    <section class="info-section info-section--dark">
      <div class="info-wrap">
        <span class="info-label info-label--on-dark">Mitra Pemerintah Desa</span>
        <h2 class="info-title info-title--on-dark">Lembaga Kemasyarakatan Desa</h2>
        <div class="role-grid role-grid--2">
          <article class="role-card role-card--dark">
            <h3>BPD (Badan Permusyawaratan Desa)</h3>
            <p>Dibentuk sejak 27 Mei 2011 dengan 5 orang anggota, BPD membahas dan menyepakati Rancangan Peraturan Desa bersama Kepala Desa, menampung serta menyalurkan aspirasi masyarakat, dan mengawasi kinerja Kepala Desa. BPD juga menyelenggarakan musyawarah desa dan membentuk panitia pemilihan Kepala Desa.</p>
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

const data = ref({})
const loading = ref(true)

const secTree     = ref(null)
const heroContent = ref(null)

const bgStyle = computed(() => ({
  backgroundImage: data.value.background
    ? `linear-gradient(135deg, rgba(92,44,22,0.85), rgba(160,120,48,0.85)), url(${data.value.background})`
    : 'linear-gradient(135deg, #5c2c16, var(--c-siger-dark))',
}))

// Kaur & Kasi ditampilkan sebagai 2 kotak grup (bukan tiap orang jadi daun tree sendiri)
// supaya tier ini tidak melebar terlalu jauh dan tetap muat tanpa scroll horizontal.
const staffGroups = computed(() => [
  { key: 'kaur', label: 'Kepala Urusan (Kaur)', people: data.value.kaur || [] },
  { key: 'kasi', label: 'Kepala Seksi (Kasi)', people: data.value.kasi || [] },
].filter(g => g.people.length))

const fallbackAvatar = (nama) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=7a4a3a&color=fff&size=200&bold=true`

/**
 * Buat IntersectionObserver yang re-triggerable (TIDAK unobserve).
 * Memanggil resetFn sebelum animateFn agar animasi bersih saat re-entry.
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
    const res = await fetch('/data/bagan/struktur.json')
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
.bagan-page { background: var(--c-cream); min-height: 100vh; }

/* Hero */
.page-hero {
  position: relative;
  height: 52vh; min-height: 360px;
  display: flex; align-items: flex-end;
  background-size: cover; background-position: center;
  overflow: hidden;
}
.page-hero__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, var(--c-dark-bg) 0%, rgba(20,10,5,.55) 55%, rgba(20,10,5,.15) 100%);
}
.page-hero__content {
  position: relative; z-index: 2;
  max-width: var(--max-w); width: 100%;
  margin: 0 auto; padding: 0 var(--sp-md) 3rem;
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

/* ─── Pure-CSS Org Chart (nested list + right-angle connectors) ───
   Ref: teknik klasik "CSS-only Org Chart / Family Tree" (CSS-Tricks) */
.org-tree,
.org-tree ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}
.org-tree { justify-content: center; }
.org-tree ul {
  padding-top: 2rem;
  position: relative;
}
.org-tree li {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  padding: 2rem 0.75rem 0 0.75rem;
}
.org-tree li::before,
.org-tree li::after {
  content: '';
  position: absolute;
  top: 0; right: 50%;
  width: 50%; height: 2rem;
  border-top: 2px solid var(--c-stone-muted);
}
.org-tree li::after {
  right: auto; left: 50%;
  border-left: 2px solid var(--c-stone-muted);
}
.org-tree li:only-child::before,
.org-tree li:only-child::after { display: none; }
.org-tree li:only-child { padding-top: 0; }
.org-tree li:first-child::before,
.org-tree li:last-child::after { border: 0 none; }
.org-tree li:last-child::before {
  border-right: 2px solid var(--c-stone-muted);
  border-radius: 0 6px 0 0;
}
.org-tree li:first-child::after { border-radius: 6px 0 0 0; }
.org-tree li > ul::before {
  content: '';
  position: absolute;
  top: 0; left: 50%;
  width: 0; height: 2rem;
  border-left: 2px solid var(--c-stone-muted);
}

/* ─── Boxes ── */
.org-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--c-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: 1.1rem 1rem;
  min-width: 150px;
  transition: box-shadow .25s;
}
.org-box:hover { box-shadow: var(--shadow-lift); }

.org-img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; margin-bottom: .5rem; border: 2px solid var(--c-cream-dark); }
.org-img--lead { width: 96px; height: 96px; border-width: 3px; }
.org-img--sm { width: 44px; height: 44px; }

.org-jabatan { font-size: .62rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--c-terra); }
.org-jabatan--sm { font-size: .58rem; }
.org-nama { font-family: var(--font-serif); font-size: 1rem; font-weight: 600; color: var(--c-stone); margin-top: .15rem; }
.org-nama--lead { font-size: 1.35rem; }
.org-nama--sm { font-size: .82rem; }
.org-periode { font-size: .68rem; color: var(--c-stone-muted); margin-top: .2rem; }
.org-bio { font-size: .8rem; color: var(--c-stone-muted); line-height: 1.6; margin-top: .6rem; max-width: 260px; }

/* Kepala Desa: box unggulan paling atas */
.org-box--kepala {
  min-width: 220px;
  max-width: 320px;
  padding: 1.75rem 1.5rem;
  border-top: 5px solid var(--c-terra-dark);
  box-shadow: var(--shadow-lift);
}
.pf-crown {
  display: inline-block;
  font-size: .6rem; font-weight: 700;
  letter-spacing: .16em; text-transform: uppercase;
  color: var(--c-white);
  background: var(--c-terra-dark);
  padding: .3rem .75rem;
  border-radius: 50px;
  margin-bottom: .6rem;
}

/* Sekretaris: tier kedua, lebih lebar karena memuat daftar Kaur & Kasi di dalamnya */
.org-box--sekretaris { border-top: 3px solid var(--c-sage); min-width: 280px; max-width: 340px; }

/* Kaur & Kasi: bagian DI DALAM kartu Sekretaris (bukan node tree terpisah), supaya
   hierarki Sekretaris vs Kadus (sama-sama anak langsung Kepala Desa) tidak rancu
   saat tampilan bertumpuk di mobile. */
.org-substaff {
  width: 100%;
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--c-cream-dark);
  display: flex;
  flex-direction: column;
  gap: .9rem;
  text-align: left;
}
.org-group-title {
  display: block;
  font-size: .62rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  margin-bottom: .5rem;
}
.org-group-title--kaur { color: var(--c-terra); }
.org-group-title--kasi { color: var(--c-sage); }
.org-group-list { display: flex; flex-direction: column; gap: .5rem; }
.org-group-person { display: flex; align-items: center; gap: .5rem; }
.org-group-person-text { display: flex; flex-direction: column; }
.org-img--xs { width: 32px; height: 32px; margin-bottom: 0; flex-shrink: 0; }

/* Kadus: cabang sejajar Sekretaris, langsung dari Kepala Desa */
.org-box--kadus { border-top: 3px solid var(--c-stone); }

/* Tokoh Adat: eksplisit di luar struktur formal (border putus-putus + label), selalu di bawah tree */
.tokoh-adat-wrap {
  max-width: var(--max-w);
  margin: 3rem auto 0;
  display: flex;
  justify-content: center;
}
.tokoh-adat-panel {
  width: 100%;
  max-width: 480px;
  background: rgba(122, 74, 58, 0.05);
  border: 1.5px dashed var(--c-terra);
  border-radius: var(--radius-md);
  padding: 1.5rem;
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
.tap-list { display: flex; flex-direction: column; gap: .9rem; }
.tap-card { display: flex; align-items: center; gap: .8rem; }
.tap-img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 2px solid var(--c-cream-dark); }
.tap-info { display: flex; flex-direction: column; gap: .1rem; }
.tap-nama { font-family: var(--font-serif); font-size: .92rem; font-weight: 600; color: var(--c-stone); }
.tap-peran { font-size: .68rem; color: var(--c-stone-muted); }

/* Di layar sempit (tablet potret ke bawah), tree jadi tumpukan vertikal:
   bus-line horizontal ala desktop diganti garis vertikal sederhana yang
   tetap menyambung tiap kotak yang ditumpuk (supaya tidak "terputus-putus")
   — dan tidak pernah perlu scroll kiri-kanan. */
@media (max-width: 768px) {
  .org-tree, .org-tree ul {
    flex-direction: column;
    align-items: center;
  }
  .org-tree li {
    padding: 1.5rem 0 0 0;
  }
  /* Matikan bus-line horizontal desktop */
  .org-tree li::before,
  .org-tree li::after {
    display: none;
  }
  /* Ganti: garis vertikal pendek penyambung antar kotak yang ditumpuk */
  .org-tree li:not(:first-child)::before {
    content: '';
    display: block;
    position: absolute;
    top: 0; left: 50%;
    width: 0; height: 1.5rem;
    border-left: 2px solid var(--c-stone-muted);
    transform: translateX(-50%);
  }
}

@media (max-width: 480px) {
  .org-box { min-width: 0; width: 100%; max-width: 260px; padding: .9rem .75rem; }
  .org-box--kepala { max-width: 280px; padding: 1.5rem 1.25rem; }
  .org-box--sekretaris { max-width: 300px; }
}

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
