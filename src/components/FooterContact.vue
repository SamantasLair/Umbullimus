<template>
  <footer id="kontak" class="footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">
          <span class="footer-wordmark">Umbul Limus</span>
          <p class="footer-tagline">Surga tersembunyi di jantung Lampung.<br>Alam asri, budaya kaya, masyarakat hangat.</p>
          <div class="footer-socials">
            <a href="#" aria-label="Instagram" class="social-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://wa.me/6281234567890" aria-label="WhatsApp" class="social-link" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>

        <div class="footer-nav">
          <h4>Navigasi</h4>
          <a href="#home">Beranda</a>
          <a href="#wisata">Tempat Wisata</a>
          <a href="#galeri">Galeri</a>
          <a href="#bagan">Struktur Desa</a>
          <a href="#infografis">Infografis</a>
        </div>

        <div class="footer-kontak">
          <h4>Kontak</h4>
          <p>
            <strong>Alamat:</strong><br>
            Desa Umbul Limus, Kec. Pesawaran,<br>
            Kab. Pesawaran, Lampung.
          </p>
          <p>
            <strong>WhatsApp:</strong><br>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener">+62 812-3456-7890</a>
          </p>
          <a
            href="https://maps.google.com/?q=Umbul+Limus+Pesawaran+Lampung"
            target="_blank"
            rel="noopener"
            class="maps-link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Buka di Google Maps
          </a>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© {{ currentYear }} Desa Wisata Umbul Limus. Seluruh hak cipta dilindungi.</span>
        <span class="footer-credit">Dibuat oleh Tim KKN</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear();
</script>

<style scoped>
.footer {
  background: var(--c-stone);
  color: rgba(245, 240, 232, 0.75);
  padding: 4rem var(--sp-md) 0;
}

.footer-container { max-width: var(--max-w); margin: 0 auto; }

.footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba(245, 240, 232, 0.1);
}

.footer-wordmark {
  display: block;
  font-family: var(--font-serif);
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--c-cream);
  margin-bottom: 0.75rem;
}

.footer-tagline {
  font-size: 0.88rem;
  line-height: 1.65;
  margin-bottom: 1.5rem;
  max-width: 280px;
}

.footer-socials { display: flex; gap: 0.75rem; }
.social-link {
  width: 36px; height: 36px;
  border: 1px solid rgba(245, 240, 232, 0.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: rgba(245, 240, 232, 0.6);
  transition: var(--transition);
}
.social-link:hover {
  border-color: var(--c-terra);
  color: var(--c-terra);
}

.footer-nav, .footer-kontak { display: flex; flex-direction: column; gap: 0.6rem; }
.footer-nav h4, .footer-kontak h4 {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  color: var(--c-cream);
  margin-bottom: 0.5rem;
}
.footer-nav a {
  font-size: 0.88rem;
  color: rgba(245, 240, 232, 0.6);
  transition: color 0.2s ease;
}
.footer-nav a:hover { color: var(--c-cream); }

.footer-kontak p { font-size: 0.85rem; line-height: 1.65; margin-bottom: 0.5rem; }
.footer-kontak a { color: var(--c-terra); }
.footer-kontak a:hover { text-decoration: underline; }

.maps-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--c-terra) !important;
  border: 1px solid var(--c-terra);
  padding: 0.4rem 0.9rem;
  border-radius: 50px;
  transition: var(--transition);
  margin-top: 0.5rem;
  width: fit-content;
}
.maps-link:hover { background: var(--c-terra); color: var(--c-white) !important; }

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  font-size: 0.78rem;
  color: rgba(245, 240, 232, 0.35);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.footer-credit { font-style: italic; }

@media (max-width: 768px) {
  .footer-top { grid-template-columns: 1fr; gap: 2rem; }
  .footer-bottom { justify-content: center; text-align: center; }
}
</style>
