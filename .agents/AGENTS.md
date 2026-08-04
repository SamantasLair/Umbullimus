# AGENTS.md — Rules & Doctrines for Web Desa Umbul Limus

## DECAP CMS OAUTH & CROSS-DOMAIN HANDSHAKE DOCTRINE
1. **Dynamic Origin Enforcement**: Jangan pernah menambahkan `base_url` hardcode di `config.yml` untuk deployment Vercel/Netlify. Biarkan Decap CMS mendeteksi `window.location.origin` secara otomatis untuk mendukung subdomain `www` dan `non-www`.
2. **Single-Encoded JSON Payload**: Sinyal `postMessage` OAuth wajib dikirimkan dengan format `authorization:github:success:{"token":"...","provider":"github"}` tanpa double-stringifying.
3. **Explicit Hash Route Navigation**: Saat meng-inject token manual ke `localStorage` (`decap-cms-user`), wajib mengarahkan peramban secara eksplisit ke `/admin/#/` sebelum me-reload halaman.
