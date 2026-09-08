# EXAM STUDIO COCKPIT ERGONOMICS RULE

## Konteks
Aplikasi asesmen digital (CBT/CAT) membutuhkan efisiensi kognitif tinggi (*low cognitive load*) dan ergonomi navigasi optimal.

## Aturan & Batasan
1. **Full-Viewport Studio Layout:**
   Antarmuka ujian dilarang dibungkus ke dalam kartu mengapung sempit tunggal (`max-w-3xl`) yang menyisakan ruang hampa luas di monitor desktop. Gunakan seluruh viewport `h-screen`.
2. **Unified Studio Command Bar (56px):**
   Dilarang menumpuk beberapa bilah sub-header vertikal (*stack sprawl*). Satukan judul, indikator waktu, progress bar, dan tombol alat ke dalam 1 baris terpadu setinggi 56px (`h-14`).
3. **Arsitektur Dua Kolom (Kanvas & Cockpit):**
   Di layar desktop (`lg:`), sediakan panel Cockpit Inspector (30%) yang memuat matriks nomor soal dan KPI status pengerjaan secara persisten.
4. **Tactile Keycaps & Keyboard Accessibility:**
   Setiap pilihan ganda wajib memiliki lencana keycap taktil (`[A]`, `[B]`, `[C]`, `[D]`, `[E]`) dengan efek dopamine selection state dan dukungan listener keyboard fisik (`A-E`, `1-5`, `F` untuk ragu, `Panah Kanan/Kiri` untuk navigasi).
