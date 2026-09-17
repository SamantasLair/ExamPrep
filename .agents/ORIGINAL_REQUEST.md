# Original User Request

## Initial Request — 2026-09-16T11:24:33Z

# Teamwork Project Prompt

> Requested team: Tim Penuh Skala Besar (Granular Module Breakdown)

Implementasi arsitektur optimasi web modern menyeluruh dengan fokus utama pada kekokohan sistem rendering soal (Exam Studio Canvas, LaTeX KaTeX, Stimulus 50-Question Engine, Review Studio), pencegahan layout shifts, peningkatan aksesibilitas vestibular, dan optimalisasi beban komputasi main-thread.

Working directory: C:\laragon\www\_MyCV\ExamPreparer
Integrity mode: development

## Requirements

### R1. Question & Content Rendering Fortress (Gagasan Utama)
- **Deskripsi**: Memperkuat kekokohan parsing dan rendering blok soal (`QuestionRenderer.tsx` dan `ContentBlockRenderer.tsx`). Memastikan teks KaTeX display/inline, sintaks Markdown terstruktur, dan komponen stimulus teks terisolasi dari layout reflow tak terduga.
- **Interface Contract**:
  - Input: Objek `Question` lengkap (berisi blok teks soal, formula KaTeX, stimulus bacaan, dan opsi A–E).
  - Output: Elemen DOM stabil dengan isolasi rendering (`contain: layout style paint` pada container butir soal) tanpa distorsi teks formula atau pemotongan batas bacaan.
  - Form Ergonomics: Input esai pendek dan scratchpad dilengkapi `field-sizing: content`, `spellcheck="false"`, dan `autoComplete="off"` untuk mencegah jump layout dan koreksi otomatis yang mengganggu.

### R2. Dual-Surface Virtualization & Layout Containment
- **Deskripsi**: Mengeliminasi bottleneck DOM footprint pada mode tampilan pengerjaan dan review 50 butir soal secara masif (Mode `all` pada `ExamRunner.tsx` dan `app/exam/[id]/review/page.tsx`).
- **Interface Contract**:
  - Terapkan CSS modern `content-visibility: auto` yang dipasangkan secara mutlak dengan `contain-intrinsic-size: auto 320px` pada seluruh kartu soal di luar initial viewport.
  - Memastikan paritas virtualisasi/containment di Review Studio sehingga 50 butir soal lengkap dengan ulasan pembahasan dan tips tidak membebani main thread perambah saat di-scroll.

### R3. View Transitions & Paging Ergonomics
- **Deskripsi**: Menyediakan pengalaman transisi antar-mode pengerjaan (`1 Soal` <-> `5 Soal` <-> `Semua Soal`) yang mulus tanpa kedip visual (*flash of unstyled content* atau *layout snap*).
- **Interface Contract**:
  - Bungkus pergantian mode paginasi dalam `document.startViewTransition()` dengan fallback aman ke direct state update jika perambah tidak mendukung API tersebut.
  - Sinkronisasi nomor butir soal aktif dan manajemen fokus aksesibilitas setelah transisi selesai.

### R4. Modern CSS & A11y Vestibular Guard
- **Deskripsi**: Mengintegrasikan perlindungan aksesibilitas gerak (*Reduced Motion*) dan penghalusan font fallback pada `globals.css` dan `layout.tsx`.
- **Interface Contract**:
  - Implementasikan media query `@media (prefers-reduced-motion: reduce)` yang menonaktifkan atau mempercepat animasi mikro (`keycapPop`, pulse, dan translasi slide) untuk kenyamanan vestibular pengguna.
  - Terapkan penghalusan metrik tipografi sans dan monospace menggunakan `font-size-adjust` untuk menekan Cumulative Layout Shift (CLS).

### R5. Dynamic Bundle Splitting & Asset Optimization
- **Deskripsi**: Memisahkan pustaka visual dan analitik berat (`recharts` di dasbor admin/siswa dan modul grafis eksternal) dari initial critical chunk menggunakan Next.js dynamic import.
- **Interface Contract**:
  - Seluruh komponen grafik IRT dan analitik dimuat via `next/dynamic` dengan opsi SSR yang aman, memangkas initial JS bundle yang diunduh siswa saat login atau memulai ujian.

### R6. Automated Testing & Zero-Regression Matrix
- **Deskripsi**: Verifikasi empiris ketahanan parser, formatting markdown, dan persistensi state tanpa merusak arsitektur Dexie.js dan 28 unit test Vitest yang sudah ada.
- **Interface Contract**:
  - Menjalankan `npm run test` (Vitest) dengan hasil 100% lulus.
  - Menjalankan `npm run build` tanpa adanya error TypeScript type-check atau kegagalan linting.

## Acceptance Criteria

### Sektor 1: Kekokohan Rendering Soal & Formula
- [ ] Soal dengan rumus matematika KaTeX dan blok Markdown kompleks tetap stabil tanpa visual overflow atau text jumping saat mode tampilan diubah.
- [ ] Textarea esai di `QuestionRenderer` mendukung `field-sizing: content` atau adaptasi tinggi alami tanpa glitch visual.

### Sektor 2: Rendering Containment & DOM Performance
- [ ] Elemen soal mode `all` di `ExamRunner` dan `ReviewPage` menerapkan `content-visibility: auto` dan `contain-intrinsic-size`.
- [ ] Pengujian scroll cepat 50 soal di Review Studio berjalan mulus pada 60 FPS tanpa freezing pada main thread.

### Sektor 3: Transisi & Aksesibilitas
- [ ] Mode `prefers-reduced-motion: reduce` aktif menetralkan animasi taktil dan transisi berlebihan.
- [ ] Transisi mode paginasi (1 / 5 / All) memanfaatkan View Transitions API secara progresif tanpa runtime error pada browser lama.

### Sektor 4: Verifikasi & Pipeline Sehat
- [ ] Seluruh unit test Vitest (`npm run test`) lulus 100% tanpa regresi.
- [ ] Build produksi Next.js (`npm run build`) selesai dengan exit code 0.
