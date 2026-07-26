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
                <div class="org-box org-box--sekretaris">
                  <img :src="data.sekretaris_desa.foto || fallbackAvatar(data.sekretaris_desa.nama)" :alt="data.sekretaris_desa.nama" class="org-img" />
                  <span class="org-jabatan">{{ data.sekretaris_desa.jabatan }}</span>
                  <span class="org-nama">{{ data.sekretaris_desa.nama }}</span>
                  <span v-if="data.sekretaris_desa.periode" class="org-periode">{{ data.sekretaris_desa.periode }}</span>
                </div>

                <ul v-if="staffCombined.length">
                  <li v-for="p in staffCombined" :key="p.jabatan">
                    <div class="org-box org-box--staff" :class="p.group === 'kasi' ? 'org-box--kasi' : 'org-box--kaur'">
                      <img :src="p.foto || fallbackAvatar(p.nama)" :alt="p.nama" class="org-img org-img--sm" />
                      <span class="org-jabatan org-jabatan--sm">{{ p.jabatan }}</span>
                      <span class="org-nama org-nama--sm">{{ p.nama }}</span>
                    </div>
                  </li>
                </ul>
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

        <!-- Di luar struktur formal: Tokoh Adat / Tokoh Masyarakat -->
        <aside v-if="data.tokoh_adat && data.tokoh_adat.length" class="tokoh-adat-panel">
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

// Kaur & Kasi digabung jadi satu tier di bawah Sekretaris (tag "group" untuk pewarnaan)
const staffCombined = computed(() => {
  const kaur = (data.value.kaur || []).map(p => ({ ...p, group: 'kaur' }))
  const kasi = (data.value.kasi || []).map(p => ({ ...p, group: 'kasi' }))
  return [...kaur, ...kasi]
})

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

  // ── Tree: reveal per tingkat hierarki (root → sekretaris+kadus → kaur/kasi) ──
  // Signature UNIK: cascade top-down mengikuti kedalaman tree, bukan diagonal/scale seperti section lain
  makeObserver(
    (sec) => {
      const rootBox   = sec.querySelector('.org-tree > li > .org-box')
      const tier2Boxes = sec.querySelectorAll('.org-tree > li > ul > li > .org-box')
      const tier3Boxes = sec.querySelectorAll('.org-tree > li > ul > li > ul > li > .org-box')
      const tokohPanel = sec.querySelector('.tokoh-adat-panel')

      anime.timeline({ easing: 'easeOutExpo' })
        .add({
          targets: rootBox,
          opacity: [0, 1],
          translateY: [-30, 0],
          scale: [0.94, 1],
          duration: 650,
        })
        .add({
          targets: tier2Boxes,
          opacity: [0, 1],
          translateY: [30, 0],
          delay: anime.stagger(80),
          duration: 550,
        }, '-=250')
        .add({
          targets: tier3Boxes,
          opacity: [0, 1],
          translateY: [24, 0],
          scale: [0.92, 1],
          delay: anime.stagger(55),
          duration: 500,
          easing: 'easeOutBack',
        }, '-=200')

      if (tokohPanel) {
        anime({
          targets: tokohPanel,
          opacity: [0, 1],
          translateX: [50, 0],
          duration: 700,
          delay: 200,
          easing: 'easeOutExpo',
        })
      }
    },
    (sec) => {
      const boxes = sec.querySelectorAll('.org-box')
      const tokohPanel = sec.querySelector('.tokoh-adat-panel')
      boxes.forEach(el => { el.style.opacity = '0'; el.style.transform = '' })
      if (tokohPanel) {
        tokohPanel.style.opacity = '0'
        tokohPanel.style.transform = ''
      }
    },
    0.12
  ).observe(secTree.value)
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
}

.tree-outer {
  max-width: var(--max-w);
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  justify-content: center;
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
  opacity: 0;
  transition: box-shadow .25s, transform .25s;
}
.org-box:hover { box-shadow: var(--shadow-lift); transform: translateY(-2px); }

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

/* Sekretaris: tier kedua */
.org-box--sekretaris { border-top: 3px solid var(--c-sage); }

/* Kaur/Kasi: tier ketiga, dibedakan warna */
.org-box--staff { border-top: 3px solid var(--c-terra); }
.org-box--kasi { border-top-color: var(--c-sage); }

/* Kadus: cabang sejajar Sekretaris, langsung dari Kepala Desa */
.org-box--kadus { border-top: 3px solid var(--c-stone); }

/* Tokoh Adat: eksplisit di luar struktur formal (border putus-putus + label) */
.tokoh-adat-panel {
  flex: 0 0 260px;
  align-self: flex-start;
  background: rgba(122, 74, 58, 0.05);
  border: 1.5px dashed var(--c-terra);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  opacity: 0;
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

@media (max-width: 1024px) {
  .tree-outer { flex-direction: column; align-items: center; }
  .tokoh-adat-panel { flex: 1 1 100%; max-width: 480px; }
}

@media (max-width: 680px) {
  .org-tree, .org-tree ul { flex-wrap: wrap; }
  .org-box { min-width: 130px; padding: .9rem .75rem; }
  .org-box--kepala { min-width: 200px; padding: 1.5rem 1.25rem; }
}
</style>
