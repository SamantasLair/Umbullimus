<template>
  <div class="bagan-page">
    <div class="page-hero" :style="bgStyle">
      <div class="page-hero__overlay"></div>
      <div class="page-hero__content">
        <span class="page-hero__label">Pemerintahan</span>
        <h1 class="page-hero__title">Struktur Organisasi<br><em>Desa Umbul Limus</em></h1>
        <p v-if="data.kecamatan" class="page-hero__sub">
          Kec. {{ data.kecamatan }} · Kab. {{ data.kabupaten }} · {{ data.provinsi }}
        </p>
      </div>
    </div>

    <div v-if="loading" class="state-loading"><div class="loading-dot"></div></div>

    <div v-else class="bagan-body">
      <!-- Kepala & Sekretaris -->
      <section class="bagan-leaders">
        <div class="bagan-wrap">
          <div v-if="data.kepala_desa" class="profile-feature profile-feature--terra">
            <img :src="data.kepala_desa.foto || fallbackAvatar(data.kepala_desa.nama)" :alt="data.kepala_desa.nama" class="pf-img" />
            <div class="pf-info">
              <span class="pf-jabatan">{{ data.kepala_desa.jabatan }}</span>
              <h3 class="pf-nama">{{ data.kepala_desa.nama }}</h3>
              <p v-if="data.kepala_desa.periode" class="pf-periode">{{ data.kepala_desa.periode }}</p>
              <p v-if="data.kepala_desa.bio" class="pf-bio">{{ data.kepala_desa.bio }}</p>
            </div>
          </div>
          <div v-if="data.sekretaris_desa" class="profile-feature profile-feature--sage">
            <img :src="data.sekretaris_desa.foto || fallbackAvatar(data.sekretaris_desa.nama)" :alt="data.sekretaris_desa.nama" class="pf-img" />
            <div class="pf-info">
              <span class="pf-jabatan pf-jabatan--sage">{{ data.sekretaris_desa.jabatan }}</span>
              <h3 class="pf-nama">{{ data.sekretaris_desa.nama }}</h3>
              <p v-if="data.sekretaris_desa.periode" class="pf-periode">{{ data.sekretaris_desa.periode }}</p>
              <p v-if="data.sekretaris_desa.bio" class="pf-bio">{{ data.sekretaris_desa.bio }}</p>
            </div>
          </div>
        </div>
      </section>

      <div class="bagan-divider"><div class="div-line"></div><span class="div-label">Perangkat Desa</span><div class="div-line"></div></div>

      <!-- Kaur & Kasi -->
      <section class="bagan-staff">
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

      <div class="bagan-divider"><div class="div-line"></div><span class="div-label">Kepala Dusun</span><div class="div-line"></div></div>

      <!-- Kadus -->
      <section class="bagan-kadus">
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
import { ref, computed, onMounted } from 'vue'
import anime from 'animejs'

const data = ref({})
const loading = ref(true)

const bgStyle = computed(() => ({
  backgroundImage: data.value.background
    ? `url(${data.value.background})`
    : 'linear-gradient(135deg, #5c3329, #4a6741)',
}))

const fallbackAvatar = (nama) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=7a4a3a&color=fff&size=200&bold=true`

onMounted(async () => {
  try {
    const res = await fetch('/data/bagan/struktur.json')
    if (res.ok) data.value = await res.json()
  } catch (e) {
    console.error('Gagal memuat bagan:', e)
  } finally {
    loading.value = false
  }

  setTimeout(() => {
    anime({
      targets: '.profile-feature, .staff-card, .kadus-card',
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(70, { start: 100 }),
      duration: 600,
      easing: 'easeOutExpo',
    })
  }, 80)
})
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
  background: linear-gradient(to top, rgba(30,15,8,.88) 0%, rgba(30,15,8,.45) 55%, rgba(30,15,8,.15) 100%);
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

/* Loading */
.state-loading { display:flex; justify-content:center; padding:6rem; }
.loading-dot { width:12px;height:12px;background:var(--c-terra);border-radius:50%;animation:pulse 1s ease infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)} }

/* Wrap */
.bagan-wrap { max-width:var(--max-w); margin:0 auto; display:flex; gap:1.5rem; flex-wrap:wrap; }
.bagan-wrap--center { justify-content: center; }

/* Sections */
.bagan-leaders, .bagan-staff, .bagan-kadus { padding: var(--sp-lg) var(--sp-md); }

/* Divider */
.bagan-divider { display:flex;align-items:center;gap:1rem;max-width:var(--max-w);margin:0 auto;padding:0 var(--sp-md); }
.div-line { flex:1;height:1px;background:var(--c-cream-dark); }
.div-label { font-size:.66rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--c-stone-muted);white-space:nowrap; }

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

.pf-img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 3px solid var(--c-cream-dark); }
.pf-info { display:flex;flex-direction:column;gap:.2rem; }
.pf-jabatan { font-size:.65rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--c-terra); }
.pf-jabatan--sage { color:var(--c-sage); }
.pf-nama { font-family:var(--font-serif);font-size:1.35rem;font-weight:600;color:var(--c-stone);line-height:1.2; }
.pf-periode { font-size:.72rem;color:var(--c-stone-muted);margin-top:.1rem; }
.pf-bio { font-size:.85rem;color:var(--c-stone-muted);line-height:1.6;margin-top:.4rem; }

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

@media (max-width:680px) {
  .bagan-wrap { flex-direction:column; }
  .profile-feature { flex-direction:column; gap:1rem; }
}
</style>
