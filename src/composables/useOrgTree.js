// Skema hierarki: setiap orang punya { id, tier, parent }.
// tier   = baris TAMPILAN (makin besar makin rendah posisinya di bagan).
// parent = id atasan langsung yang menjadi tujuan garis penghubung (0 = akar).
// tier TIDAK harus parent.tier + 1 — boleh "melompat" beberapa baris tampilan
// (mis. Bendahara tier 3 tapi parent-nya Kepala Desa yang tier 1), karena tier
// menunjukkan urutan/kedudukan visual, sedangkan parent menunjukkan garis komando asli.
export function groupByTier(items) {
  const map = new Map()
  for (const item of items) {
    if (!map.has(item.tier)) map.set(item.tier, [])
    map.get(item.tier).push(item)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([tier, nodes]) => ({ tier, nodes }))
}

export function fallbackAvatar(nama) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=7a4a3a&color=fff&size=200&bold=true`
}
