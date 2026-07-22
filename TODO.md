# TODO - Perbaikan Logika Level Complete Game Trivia

## Tujuan
Saat 10 soal selesai di setiap level, tampilkan popup dengan pilihan "Selesai" (akhiri game) dan "Selanjutnya" (lanjut ke level berikutnya).

## Status
✅ Selesai!

## Perubahan yang Dilakukan

### `src/app.js`:
1. **`selectAnswer()`** — Simpan `completedLevelIndex` sebelum increment levelIndex, panggil `showLevelComplete(completedLevelIndex)` untuk **SEMUA** level (tidak hanya 'mudah')
2. **`handleTimeout()`** — Sama seperti `selectAnswer()`, panggil `showLevelComplete(completedLevelIndex)` untuk semua level
3. **`showLevelComplete(completedLevelIndex)`** — Menerima parameter index level yang selesai, menampilkan nama level yang benar, dan menyembunyikan tombol "Selanjutnya" jika level terakhir (Sulit)
4. **Handler `playAgainBtn`** — Sekarang memanggil `endGame()` untuk menampilkan skor akhir (tombol "Selesai")

### `index.html`:
5. **Tombol `#play-again-btn`** — Teks diubah dari "Main Lagi" menjadi "Selesai"
