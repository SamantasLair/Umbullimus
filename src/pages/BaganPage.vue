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
      <div class="skel-row skel-row--2">
        <div class="skeleton-box skel-node skel-node--staff" v-for="n in 2" :key="n"></div>
      </div>
      <div class="skeleton-box skel-connector"></div>
      <div class="skel-row skel-row--3">
        <div class="skeleton-box skel-node skel-node--small" v-for="n in 3" :key="n"></div>
      </div>
    </div>

    <div v-else class="bagan-body">
      <!-- Kepala & Sekretaris: hierarki vertikal (Kepala Desa di atas) + Tokoh Adat di luar struktur -->
      <section class="bagan-leaders" ref="secLeaders">
        <div class="bagan-wrap bagan-wrap--hierarchy">
          <!-- Kolom hierarki formal -->
          <div class="hierarchy-column">
            <div v-if="data.kepala_desa" class="profile-feature profile-feature--lead">
              <span class="pf-crown">Pimpinan Tertinggi Desa</span>
              <img :src="data.kepala_desa.foto || fallbackAvatar(data.kepala_desa.nama)" :alt="data.kepala_desa.nama" class="pf-img pf-img--lead" />
              <div class="pf-info pf-info--center">
                <span class="pf-jabatan">{{ data.kepala_desa.jabatan }}</span>
                <h3 class="pf-nama pf-nama--lead">{{ data.kepala_desa.nama }}</h3>
                <p v-if="data.kepala_desa.periode" class="pf-periode">{{ data.kepala_desa.periode }}</p>
                <p v-if="data.kepala_desa.bio" class="pf-bio">{{ data.kepala_desa.bio }}</p>
              </div>
            </div>

            <div v-if="data.kepala_desa && data.sekretaris_desa" class="hierarchy-connector" aria-hidden="true"></div>

            <div v-if="data.sekretaris_desa" class="profile-feature profile-feature--sage profile-feature--second">
              <img :src="data.sekretaris_desa.foto || fallbackAvatar(data.sekretaris_desa.nama)" :alt="data.sekretaris_desa.nama" class="pf-img" />
              <div class="pf-info">
                <span class="pf-jabatan pf-jabatan--sage">{{ data.sekretaris_desa.jabatan }}</span>
                <h3 class="pf-nama">{{ data.sekretaris_desa.nama }}</h3>
                <p v-if="data.sekretaris_desa.periode" class="pf-periode">{{ data.sekretaris_desa.periode }}</p>
                <p v-if="data.sekretaris_desa.bio" class="pf-bio">{{ data.sekretaris_desa.bio }}</p>
              </div>
            </div>
          </div>

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

      <!-- Kaur & Kasi: bercabang dari Sekretaris di atas -->
      <section class="bagan-staff" ref="secStaff">
        <div class="tree-branch">
          <span class="tree-branch-label">Perangkat Desa</span>
          <div class="tree-branch-shape">
            <div class="tree-branch-trunk"></div>
            <div class="tree-branch-line"></div>
            <div class="tree-branch-drops tree-branch-drops--2">
              <span class="drop"></span>
              <span class="drop"></span>
            </div>
          </div>
        </div>
        <div class="bagan-wrap">
          <div class="staff-group">
            <h4 class="group-title">Kepala Urusan (Kaur)</h4>
            <div class="staff-list">
              <div v-for="p in data.kaur" :key="p.jabatan" class="staff-card staff-card--terra">
                <img :src="p.foto || fallbackAvatar(p.nama)" :alt="p.nama" class="sc-img" />
                <div class="sc-info">
                  <span class="sc-jabatan">{{ p.jabatan }}</span>
                  <span class="sc-nama">{{ p.nama }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="staff-group">
            <h4 class="group-title">Kepala Seksi (Kasi)</h4>
            <div class="staff-list">
              <div v-for="p in data.kasi" :key="p.jabatan" class="staff-card staff-card--sage">
                <img :src="p.foto || fallbackAvatar(p.nama)" :alt="p.nama" class="sc-img" />
                <div class="sc-info">
                  <span class="sc-jabatan sc-jabatan--sage">{{ p.jabatan }}</span>
                  <span class="sc-nama">{{ p.nama }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Kadus: bercabang dari Perangkat Desa di atas -->
      <section class="bagan-kadus" ref="secKadus">
        <div class="tree-branch">
          <span class="tree-branch-label">Kepala Dusun</span>
          <div class="tree-branch-shape">
            <div class="tree-branch-trunk"></div>
            <div class="tree-branch-line"></div>
            <div class="tree-branch-drops" :class="`tree-branch-drops--${data.kadus?.length || 3}`">
              <span class="drop" v-for="n in (data.kadus?.length || 3)" :key="n"></span>
            </div>
          </div>
        </div>
        <div class="bagan-wrap bagan-wrap--center">
          <div v-for="p in data.kadus" :key="p.jabatan" class="kadus-card">
            <img :src="p.foto || fallbackAvatar(p.nama)" :alt="p.nama" class="kd-img" />
            <span class="kd-jabatan">{{ p.jabatan }}</span>
            <span class="kd-nama">{{ p.nama }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import anime from 'animejs'
import { computed, nextTick, onMounted, ref } from 'vue'

const data = ref({})
const loading = ref(true)

// Section refs untuk per-section observer
const secLeaders  = ref(null)
const secStaff    = ref(null)
const secKadus    = ref(null)
const heroContent = ref(null)

const bgStyle = computed(() => ({
  backgroundImage: data.value.background
    ? `linear-gradient(135deg, rgba(92,44,22,0.85), rgba(160,120,48,0.85)), url(${data.value.background})`
    : 'linear-gradient(135deg, #5c2c16, var(--c-siger-dark))',
}))

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

  // Leaders: hierarki vertikal — Kepala Desa pop dari atas, connector tumbuh,
  // Sekretaris naik dari bawah, panel Tokoh Adat masuk dari samping kanan.
  // Signature UNIK: berbeda dari WisataSection (diagonal) dan Gallery (scale+blur)
  makeObserver(
    (sec) => {
      const lead = sec.querySelector('.profile-feature--lead')
      const connector = sec.querySelector('.hierarchy-connector')
      const second = sec.querySelector('.profile-feature--second')
      const tokohPanel = sec.querySelector('.tokoh-adat-panel')

      anime.timeline({ easing: 'easeOutExpo' })
        .add({
          targets: lead,
          opacity: [0, 1],
          translateY: [-30, 0],
          scale: [0.94, 1],
          duration: 650,
        })
        .add({
          targets: connector,
          opacity: [0, 1],
          scaleY: [0, 1],
          duration: 350,
          easing: 'easeInOutQuart',
        }, '-=150')
        .add({
          targets: second,
          opacity: [0, 1],
          translateY: [40, 0],
          duration: 600,
        }, '-=100')

      if (tokohPanel) {
        anime({
          targets: tokohPanel,
          opacity: [0, 1],
          translateX: [50, 0],
          duration: 700,
          delay: 150,
          easing: 'easeOutExpo',
        })
      }
    },
    (sec) => {
      const lead = sec.querySelector('.profile-feature--lead')
      const connector = sec.querySelector('.hierarchy-connector')
      const second = sec.querySelector('.profile-feature--second')
      const tokohPanel = sec.querySelector('.tokoh-adat-panel')
      ;[lead, second, tokohPanel].forEach(el => {
        if (!el) return
        el.style.opacity = '0'
        el.style.transform = ''
      })
      if (connector) {
        connector.style.opacity = '0'
        connector.style.transform = 'scaleY(0)'
      }
    },
    0.18
  ).observe(secLeaders.value)

  // ── Staff: cabang tree tumbuh dari atas, lalu kartu cascade diagonal ──
  makeObserver(
    (sec) => {
      anime.timeline({ easing: 'easeOutExpo' })
        .add({
          targets: sec.querySelector('.tree-branch-trunk'),
          opacity: [0, 1],
          scaleY: [0, 1],
          duration: 300,
          easing: 'easeInOutQuart',
        })
        .add({
          targets: sec.querySelector('.tree-branch-line'),
          opacity: [0, 1],
          scaleX: [0, 1],
          duration: 350,
          easing: 'easeInOutQuart',
        }, '-=80')
        .add({
          targets: sec.querySelectorAll('.tree-branch-drops .drop'),
          opacity: [0, 1],
          scaleY: [0, 1],
          delay: anime.stagger(60),
          duration: 300,
          easing: 'easeInOutQuart',
        }, '-=150')
        .add({
          targets: sec.querySelector('.tree-branch-label'),
          opacity: [0, 1],
          duration: 350,
        }, '-=200')
        .add({
          targets: sec.querySelectorAll('.staff-card'),
          opacity:    [0, 1],
          translateX: [-30, 0],
          translateY: [20, 0],
          delay: anime.stagger(55),
          duration: 550,
        }, '-=150')
    },
    (sec) => {
      const branchParts = sec.querySelectorAll('.tree-branch-trunk, .tree-branch-line, .tree-branch-drops .drop, .tree-branch-label')
      branchParts.forEach(el => { el.style.opacity = '0'; el.style.transform = '' })
      sec.querySelectorAll('.staff-card').forEach(el => {
        el.style.opacity = '0'
        el.style.transform = ''
      })
    }
  ).observe(secStaff.value)

  // ── Kadus: cabang tree tumbuh dari atas, lalu kartu scale pop ── Signature UNIK
  makeObserver(
    (sec) => {
      anime.timeline({ easing: 'easeOutExpo' })
        .add({
          targets: sec.querySelector('.tree-branch-trunk'),
          opacity: [0, 1],
          scaleY: [0, 1],
          duration: 300,
          easing: 'easeInOutQuart',
        })
        .add({
          targets: sec.querySelector('.tree-branch-line'),
          opacity: [0, 1],
          scaleX: [0, 1],
          duration: 350,
          easing: 'easeInOutQuart',
        }, '-=80')
        .add({
          targets: sec.querySelectorAll('.tree-branch-drops .drop'),
          opacity: [0, 1],
          scaleY: [0, 1],
          delay: anime.stagger(60),
          duration: 300,
          easing: 'easeInOutQuart',
        }, '-=150')
        .add({
          targets: sec.querySelector('.tree-branch-label'),
          opacity: [0, 1],
          duration: 350,
        }, '-=200')
        .add({
          targets: sec.querySelectorAll('.kadus-card'),
          opacity: [0, 1],
          scale:   [0.82, 1],
          translateY: [30, 0],
          delay: anime.stagger(70),
          duration: 600,
          easing: 'easeOutBack',
        }, '-=150')
    },
    (sec) => {
      const branchParts = sec.querySelectorAll('.tree-branch-trunk, .tree-branch-line, .tree-branch-drops .drop, .tree-branch-label')
      branchParts.forEach(el => { el.style.opacity = '0'; el.style.transform = '' })
      sec.querySelectorAll('.kadus-card').forEach(el => {
        el.style.opacity = '0'
        el.style.transform = ''
      })
    },
    0.12
  ).observe(secKadus.value)
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

/* ─── Skeleton: mengikuti bentuk bagan/tree organisasi (unik, bukan spinner generik) ── */
.bagan-skeleton {
  display: flex; flex-direction: column; align-items: center;
  gap: 0; padding: var(--sp-lg) var(--sp-md);
  max-width: var(--max-w-sm); margin: 0 auto;
}
.skel-node { border-radius: var(--radius-md); }
.skel-node--lead { width: 220px; height: 74px; }
.skel-connector { width: 2px; height: 2rem; }
.skel-row { display: flex; gap: 1.25rem; margin-top: 0.5rem; flex-wrap: wrap; justify-content: center; }
.skel-row--2 .skel-node--staff { width: 190px; height: 62px; }
.skel-row--3 { margin-top: 1.5rem; }
.skel-row--3 .skel-node--small { width: 150px; height: 68px; }

@media (max-width: 600px) {
  .skel-node--lead { width: 180px; }
  .skel-row { flex-direction: column; align-items: center; }
}

/* Wrap */
.bagan-wrap { max-width:var(--max-w); margin:0 auto; display:flex; gap:1.5rem; flex-wrap:wrap; }
.bagan-wrap--center { justify-content: center; }

/* Hierarki: kolom kepala/sekretaris di kiri, Tokoh Adat (di luar struktur) di kanan */
.bagan-wrap--hierarchy { align-items: flex-start; flex-wrap: nowrap; }
.hierarchy-column {
  flex: 1 1 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hierarchy-connector {
  width: 2px;
  height: 2.5rem;
  background: linear-gradient(to bottom, var(--c-terra), var(--c-sage));
  opacity: 0;
  transform-origin: top center;
}

/* Sections: alternating background supaya tiap tier org chart terlihat sebagai section terpisah */
.bagan-leaders, .bagan-staff, .bagan-kadus { padding: var(--sp-lg) var(--sp-md); }
.bagan-leaders { background: var(--c-cream); }
.bagan-staff   { background: var(--c-cream-dark); }
.bagan-kadus   { background: var(--c-cream); }

/* Tree branch: connector yang menyambungkan tier di atas ke grup di bawahnya */
.tree-branch {
  max-width: var(--max-w);
  margin: 0 auto 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.tree-branch-label {
  font-size: .66rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  color: var(--c-stone-muted);
  margin-bottom: .5rem;
  opacity: 0;
}
.tree-branch-shape { display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 360px; }
.tree-branch-trunk { width: 2px; height: 1.5rem; background: var(--c-stone-muted); opacity: 0; transform-origin: top center; }
.tree-branch-line { width: 70%; height: 2px; background: var(--c-stone-muted); opacity: 0; transform-origin: center center; }
.tree-branch-drops { width: 70%; display: flex; justify-content: space-between; }
.tree-branch-drops--3 { justify-content: space-around; }
.drop { width: 2px; height: 1.25rem; background: var(--c-stone-muted); opacity: 0; transform-origin: top center; }

/* Feature cards (Kades & Sekdes) */
.profile-feature {
  flex: 1 1 320px;
  display: flex; gap: 1.5rem;
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  box-shadow: var(--shadow-card);
  border-top: 4px solid var(--c-terra);
  opacity: 0;
  transition: box-shadow .3s, transform .3s;
}
.profile-feature--sage { border-top-color: var(--c-sage); }
.profile-feature:hover { box-shadow: var(--shadow-lift); transform: translateY(-3px); }

/* Kepala Desa: kartu unggulan paling atas, lebih besar & terpusat */
.profile-feature--lead {
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 440px;
  padding: 2.25rem 2rem;
  border-top-width: 5px;
  box-shadow: var(--shadow-lift);
  gap: 0.5rem;
}
.pf-crown {
  display: inline-block;
  font-size: .62rem; font-weight: 700;
  letter-spacing: .18em; text-transform: uppercase;
  color: var(--c-white);
  background: var(--c-terra-dark);
  padding: .3rem .8rem;
  border-radius: 50px;
  margin-bottom: .5rem;
}
.pf-img--lead { width: 120px; height: 120px; border-width: 4px; }
.pf-info--center { align-items: center; }
.pf-nama--lead { font-size: 1.65rem; }

/* Sekretaris: tier kedua, lebih ringkas dari kepala desa */
.profile-feature--second {
  max-width: 400px;
  width: 100%;
  padding: 1.4rem 1.5rem;
  border-top-width: 3px;
}
.profile-feature--second .pf-img { width: 72px; height: 72px; }
.profile-feature--second .pf-nama { font-size: 1.15rem; }

.pf-img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 3px solid var(--c-cream-dark); }
.pf-info { display:flex;flex-direction:column;gap:.2rem; }
.pf-jabatan { font-size:.65rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--c-terra); }
.pf-jabatan--sage { color:var(--c-sage); }
.pf-nama { font-family:var(--font-serif);font-size:1.35rem;font-weight:600;color:var(--c-stone);line-height:1.2; }
.pf-periode { font-size:.72rem;color:var(--c-stone-muted);margin-top:.1rem; }
.pf-bio { font-size:.85rem;color:var(--c-stone-muted);line-height:1.6;margin-top:.4rem; }

/* Tokoh Adat: eksplisit di luar struktur formal (border putus-putus + label) */
.tokoh-adat-panel {
  flex: 0 0 280px;
  align-self: stretch;
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

/* Staff group */
.staff-group { flex:1;min-width:280px; }
.group-title { font-family:var(--font-sans);font-size:.7rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--c-stone-muted);margin-bottom:1rem; }
.staff-list { display:flex;flex-direction:column;gap:.6rem; }

/* Staff card */
.staff-card {
  display: flex; align-items: center; gap: 1rem;
  background: var(--c-white);
  border-radius: var(--radius-md);
  padding: .9rem 1.1rem;
  box-shadow: var(--shadow-card);
  border-left: 3px solid var(--c-terra);
  opacity: 0;
  transition: box-shadow .25s, transform .25s;
}
.staff-card--sage { border-left-color: var(--c-sage); }
.staff-card:hover { box-shadow: var(--shadow-lift); transform: translateX(4px); }

.sc-img { width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0; }
.sc-info { display:flex;flex-direction:column;gap:.1rem; }
.sc-jabatan { font-size:.64rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--c-terra); }
.sc-jabatan--sage { color:var(--c-sage); }
.sc-nama { font-family:var(--font-serif);font-size:1rem;font-weight:600;color:var(--c-stone); }

/* Kadus card */
.kadus-card {
  display:flex;flex-direction:column;align-items:center;text-align:center;gap:.4rem;
  background:var(--c-white);border-radius:var(--radius-md);
  padding:1.25rem 1.5rem;box-shadow:var(--shadow-card);
  min-width:160px;
  opacity: 0;
  transition:box-shadow .25s,transform .25s;
  border-bottom: 3px solid var(--c-stone);
}
.kadus-card:hover { box-shadow:var(--shadow-lift);transform:translateY(-3px); }
.kd-img { width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid var(--c-cream-dark); }
.kd-jabatan { font-size:.64rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--c-stone-muted); }
.kd-nama { font-family:var(--font-serif);font-size:.95rem;font-weight:600;color:var(--c-stone); }

@media (max-width:900px) {
  .bagan-wrap--hierarchy { flex-wrap: wrap; }
  .hierarchy-column { flex: 1 1 100%; }
  .tokoh-adat-panel { flex: 1 1 100%; }
}

@media (max-width:680px) {
  .bagan-wrap { flex-direction:column; }
  .profile-feature { flex-direction:column; gap:1rem; }
}
</style>
