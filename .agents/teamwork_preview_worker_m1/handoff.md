# Handoff Report: Milestone 1 (Features F01 through F07) Implementation

Konteks: Bagian dari [[INDEX]], [[CHANGELOG]], [[PROJECT]], dan [[ORIGINAL_REQUEST]].

## 1. Observation

Berdasarkan inspeksi statis, modifikasi kode dengan prinsip *minimal change*, dan verifikasi empiris pada workspace `C:\laragon\www\_MyCV\ExamPreparer`, berikut adalah rincian implementasi pada 5 berkas kepemilikan eksklusif:

### A. `src/components/exam/MathRenderer.tsx` (F01)
- **Sebelumnya**: Menggunakan `useEffect` imperatif + `useRef` yang awalnya merender `<span>` kosong (`<span ref={ref} className="block my-3 text-center overflow-x-auto" />` atau `<span ref={ref} className="inline" />`), kemudian menyuntikkan DOM KaTeX pasca-mount. Hal ini menimbulkan *dual-pass empty span rendering* dan *Cumulative Layout Shift* (CLS).
- **Perubahan**:
  - Dikonversi ke evaluasi sinkron menggunakan `katex.renderToString` di dalam `useMemo`:
    ```tsx
    const html = useMemo(() => {
      try {
        return katex.renderToString(tex, {
          displayMode,
          throwOnError: false,
          errorColor: '#ef4444',
        });
      } catch {
        return null;
      }
    }, [tex, displayMode]);
    ```
  - Merender output langsung pada first pass via `dangerouslySetInnerHTML={{ __html: html }}` dengan kelas isolasi rendering `[contain:layout_paint]` untuk display mode dan `[contain:layout_style]` untuk inline mode.
  - Menyertakan fallback aman `<span className={displayMode ? "block my-3 text-center" : "inline"}>{tex}</span>` jika `katex.renderToString` gagal.

### B. `src/components/exam/QuestionRenderer.tsx` (F02 & F03)
- **F02 (DOM Containment & Anchor ID / TabIndex)**:
  - Pada kontainer utama Card dan borderless, ditambahkan kelas `[contain:layout_style_paint]`, `id={\`question-card-\${question.id}\`}`, dan `tabIndex={-1}`:
    ```tsx
    ) : borderless ? (
      <div
        id={`question-card-${question.id}`}
        tabIndex={-1}
        className={cn(
          'transition-all duration-200 w-full [contain:layout_style_paint]',
          flagged && 'rounded-xl p-4 sm:p-5 bg-amber-500/[0.03] border border-amber-500/30 ring-1 ring-amber-500/10'
        )}
      >
        {innerContent}
      </div>
    ) : (
      <Card
        id={`question-card-${question.id}`}
        tabIndex={-1}
        className={cn(
          'transition-all duration-200 rounded-xl border bg-card shadow-xs [contain:layout_style_paint]',
          flagged ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-border/70 hover:border-zinc-300 dark:hover:border-zinc-700',
          isCorrect && 'border-emerald-500/40 bg-emerald-500/[0.03]',
          isWrong && 'border-rose-500/40 bg-rose-500/[0.03]',
          isNeutral && answer !== undefined && 'border-muted-foreground/30 bg-muted/20',
        )}
      >
    ```
  - Juga diterapkan pada kontainer `showOnlyDiscussion` dan `printMode` untuk konsistensi query DOM.
- **F03 (Form Ergonomics Lembar Jawaban Essay)**:
  - Pada komponen `Textarea` lembar essay (baris 223–231), ditambahkan `spellCheck={false}`, `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`, serta kelas `[field-sizing:content]`.

### C. `src/components/exam/StimulusRenderer.tsx` (F05)
- **Sebelumnya**: Baris 15 memanggil `const parsed = parseMarkdown(\`# Q1 (ESSAY)\\n\${content}\`);` secara langsung pada setiap siklus render.
- **Perubahan**:
  - Dibungkus dengan `useMemo` dengan dependensi `[content]`:
    ```tsx
    const blocks = useMemo(() => {
      const parsed = parseMarkdown(`# Q1 (ESSAY)\n${content}`);
      return parsed[0]?.body || [];
    }, [content]);
    ```

### D. `src/components/exam/ExamRunner.tsx` (F04, F05, F06, F07)
- **F04 (Scratchpad Ergonomics)**:
  - Pada Textarea floating scratchpad (baris 1381–1391), ditambahkan `spellCheck={false}`, `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`.
- **F05 (Stimulus Memoization)**:
  - Ditambahkan `singleStimulusBlocks` via `useMemo` di tingkat komponen dengan dependensi `[questions, currentSingleIdx]`.
  - Pada render Mode 1, pemanggilan langsung `parseMarkdown` digantikan dengan referensi ke `singleStimulusBlocks`, mencegah tokenisasi ulang markdown setiap detik saat timer berdetik.
- **F06 & F07 (Virtual Items Scrolling & Containment)**:
  - Pada item virtualizer mode `all` (baris 960–965), dihapus animasi pemicu stutter `animate-in fade-in slide-in-from-bottom-2 duration-300`.
  - Dipasangkan kelas CSS modern `className="[content-visibility:auto] [contain-intrinsic-size:auto_320px]"`.

### E. `src/app/exam/[id]/review/page.tsx` (F05 & F06)
- **F05 (Stimulus Memoization)**:
  - Ditambahkan `singleStimulusBlocks` via `useMemo` dengan dependensi `[filteredQuestions, currentSingleIdx]`.
  - Pada render Mode 1, pemanggilan inline `parseMarkdown` digantikan dengan referensi ke `singleStimulusBlocks`.
- **F06 (Review Studio 50-Question Virtualization)**:
  - Pada pembungkus kartu soal Mode 3 (All Questions continuous list, baris 563–570), ditambahkan kelas `[content-visibility:auto] [contain-intrinsic-size:auto_320px]`.

---

## 2. Logic Chain

1. **Dari Observasi 1.A ke Eliminasi CLS (F01)**:
   - KaTeX imperatif via `useEffect` menyebabkan penundaan render 1 siklus frame (commit -> paint -> effect -> mutate DOM -> relayout).
   - Migrasi ke `katex.renderToString` dalam `useMemo` menjamin string HTML KaTeX siap saat SSR/VNode pertama dihasilkan, sehingga `dangerouslySetInnerHTML` merender konten rumus secara sinkron tanpa CLS.
   - Pemberian `[contain:layout_paint]` dan `[contain:layout_style]` mengisolasi reflow internal KaTeX agar tidak merambat ke parent card.

2. **Dari Observasi 1.B ke Isolasi Subtree & Navigasi Aksesibel (F02 & F03)**:
   - Pemberian `[contain:layout_style_paint]` pada `QuestionRenderer` mengunci batasan layout kartu, sehingga seleksi opsi A–E, animasi lencana taktil, atau expand tips hanya memicu relayout lokal di dalam batas kartu.
   - Penambahan `id={\`question-card-\${question.id}\`}` dan `tabIndex={-1}` menyediakan target DOM yang valid untuk navigasi keyboard dan pemindahan fokus otomatis pasca-transisi mode (WCAG 2.4.3).
   - Penonaktifan autocomplete/spellcheck pada essay menghilangkan garis merah gangguan pada rumus atau istilah akademik dan mencegah layout jumping dengan `[field-sizing:content]`.

3. **Dari Observasi 1.C, 1.D, dan 1.E ke Eliminasi Beban Main-Thread Timer (F05)**:
   - State `timeLeft` di `ExamRunner` diperbarui setiap 1.000 ms. Tanpa `useMemo`, fungsi `parseMarkdown` mengeksekusi regex tokenizer penuh setiap detik untuk teks stimulus yang identik.
   - Dengan memoize `singleStimulusBlocks` di `ExamRunner.tsx`, `review/page.tsx`, dan `blocks` di `StimulusRenderer.tsx`, biaya eksekusi parsing markdown pada siklus detik turun menjadi O(1) cache hit.

4. **Dari Observasi 1.D dan 1.E ke 60 FPS Virtualization (F06 & F07)**:
   - Mode `all` di Review Studio dan ExamRunner me-render hingga 50 butir soal beserta ulasan dan formula KaTeX.
   - Pemasangan `content-visibility: auto` bersama `contain-intrinsic-size: auto 320px` memungkinkan engine browser Chromium dan Safari untuk melewati (*skip*) proses layout dan painting pada kartu yang berada di luar viewport aktif tanpa menghilangkan node dari DOM (sehingga anchor jump `scrollIntoView` dan pencarian peramban tetap berfungsi).
   - Penghapusan animasi berulang `slide-in-from-bottom-2` saat virtual scroll di `ExamRunner.tsx` menghilangkan lonjakan kerja GPU/compositor yang sebelumnya menyebabkan micro-stutters.

---

## 3. Caveats

- **Dukungan Perambah untuk `content-visibility: auto` dan `field-sizing: content`**:
  - `content-visibility: auto` didukung secara native pada Chrome/Edge 85+ dan Safari 18+. Pada browser lama, properti ini diabaikan secara elegan (*graceful degradation*) tanpa menimbulkan kesalahan JavaScript.
  - `field-sizing: content` didukung secara native pada Chromium 123+. Pada browser lain, textarea tetap memiliki batas tinggi minimum `min-h-[140px]` dan dapat diatur tinggi manualnya melalui kursor `resize-y`.
- **Properti `contain: paint`**:
  - Tidak memotong popover, dialog, atau HUD Command Palette karena seluruh komponen overlay di ExamPreparer telah di-mount via React Portal (`createPortal(..., document.body)`) sesuai [[AGENTS]] Doktrin 1.
- Tidak ada modifikasi yang dilakukan pada file di luar 5 target berkas yang ditentukan.

---

## 4. Conclusion

Seluruh 7 fitur pada Milestone 1 (F01 hingga F07) telah diimplementasikan secara penuh, genuine (tanpa dummy/hardcoding), dan bersih sesuai standar arsitektur:
- **F01**: KaTeX renderToString sinkron di `MathRenderer.tsx` selesai.
- **F02**: DOM containment `[contain:layout_style_paint]` serta anchor `id` & `tabIndex={-1}` di `QuestionRenderer.tsx` selesai.
- **F03**: Ergonomi textarea essay di `QuestionRenderer.tsx` selesai.
- **F04**: Ergonomi scratchpad textarea di `ExamRunner.tsx` selesai.
- **F05**: Memoization stimulus markdown parsing di `StimulusRenderer.tsx`, `ExamRunner.tsx`, dan `review/page.tsx` selesai.
- **F06**: Dual-surface virtualization & containment di `review/page.tsx` dan `ExamRunner.tsx` selesai.
- **F07**: Penghapusan animasi slide virtual scrolling di `ExamRunner.tsx` selesai.

Semua 28 unit test Vitest lulus 100%, kompilasi TypeScript `tsc --noEmit` bersih (0 error), dan linting ESLint pada berkas termodifikasi menghasilkan 0 error.

---

## 5. Verification Method

Eksekusi perintah berikut untuk memverifikasi secara independen:

1. **Uji Unit Vitest**:
   ```bash
   npm run test
   ```
   *Hasil verifikasi empiris:*
   ```
   ✓ tests/randomizer.test.ts (2 tests)
   ✓ tests/anime.test.ts (2 tests)
   ✓ tests/parser.test.ts (15 tests)
   ✓ tests/mockSupabase.test.ts (5 tests)
   ✓ tests/dexieSync.test.ts (4 tests)

   Test Files  5 passed (5)
        Tests  28 passed (28)
   ```

2. **Pemeriksaan Tipe TypeScript**:
   ```bash
   npx tsc --noEmit
   ```
   *Hasil verifikasi empiris:* Exited with code 0 (Zero errors).

3. **Pemeriksaan Linting ESLint pada Target Files**:
   ```bash
   npx eslint src/components/exam/MathRenderer.tsx src/components/exam/QuestionRenderer.tsx src/components/exam/StimulusRenderer.tsx src/components/exam/ExamRunner.tsx "src/app/exam/[id]/review/page.tsx"
   ```
   *Hasil verifikasi empiris:* Exited with code 0 (0 errors).
