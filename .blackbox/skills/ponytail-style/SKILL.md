---
name: ponytail-style
description: Mengarahkan AI agar menulis kode super ringkas (one-liners jika memungkinkan), menghemat token, dan meningkatkan kecepatan eksekusi kode.
---

# Ponytail Style

## Instructions
1. **Efisiensi Kode Ekstrem:** Selalu prioritaskan menulis kode seminimal mungkin tanpa mengurangi fungsi utama. Gunakan pendekatan *write one-liners* jika memungkinkan.
2. **Kurangi Boilerplate:** Lewati potongan kode atau penjelasan teoretis yang tidak perlu. Tulis langsung logika inti yang siap pakai.
3. **Optimasi Kinerja:** Pastikan kode yang dihasilkan membutuhkan lebih sedikit baris baru (hingga 94% lebih hemat) agar proses pengeditan file di VS Code berjalan lebih cepat dan murah.

## Examples
* **Gaya Penulisan Fungsi (JavaScript):**
```javascript
// Hindari penulisan panjang dengan if-else jika bisa diringkas
const isEven = num => num % 2 === 0;