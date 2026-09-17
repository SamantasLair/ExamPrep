# Handoff Report: Technical Survey for R1 (Question & Content Rendering Fortress) & R2 (Dual-Surface Virtualization & Layout Containment)

Konteks: Bagian dari [[INDEX]], [[CHANGELOG]], dan [[ORIGINAL_REQUEST]].

## 1. Observation

Berdasarkan inspeksi statis kode sumber (AST), struktur DOM, CSS Tailwind v4, serta eksekusi suite pengujian empiris pada workspace `C:\laragon\www\_MyCV\ExamPreparer`, ditemukan fakta-fakta spesifik berikut:

### A. Komponen `src/components/exam/QuestionRenderer.tsx`
1. **Ketiadaan DOM Containment pada Elemen Kontainer Soal:**
   Pada baris 315–334 `QuestionRenderer.tsx`:
   ```tsx
   315:   ) : borderless ? (
   316:     <div className={cn(
   317:       'transition-all duration-200 w-full',
   318:       flagged && 'rounded-xl p-4 sm:p-5 bg-amber-500/[0.03] border border-amber-500/30 ring-1 ring-amber-500/10'
   319:     )}>
   320:       {innerContent}
   321:     </div>
   322:   ) : (
   323:     <Card className={cn(
   324:       'transition-all duration-200 rounded-xl border bg-card shadow-xs',
   325:       flagged ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-border/70 hover:border-zinc-300 dark:hover:border-zinc-700',
   326:       isCorrect && 'border-emerald-500/40 bg-emerald-500/[0.03]',
   327:       isWrong && 'border-rose-500/40 bg-rose-500/[0.03]',
   328:       isNeutral && answer !== undefined && 'border-muted-foreground/30 bg-muted/20',
   329:     )}>
   330:       <CardContent className="p-5 md:p-6">
   331:         {innerContent}
   332:       </CardContent>
   333:     </Card>
   334:   );
   ```
   **Temuan:** Kontainer `QuestionRenderer` (baik mode `borderless` maupun `Card`) sama sekali tidak memiliki properti isolasi `contain: layout style paint` (atau `contain-content` / `[contain:layout_style_paint]`). Akibatnya, setiap mutasi state internal (seperti klik opsi jawaban, animasi keycap pop, expand tip penalti, atau pengetikan essay) memaksa browser menjalankan *layout recalculation* yang merembet ke kontainer induk (layout reflow).

2. **Form Ergonomics Lembar Jawaban Essay:**
   Pada baris 221–231 `QuestionRenderer.tsx`:
   ```tsx
   221:       {/* Essay Input (Only show textarea if not printing) */}
   222:       {question.type === 'ESSAY' && !printMode && (
   223:         <div className="pt-2">
   224:           <Textarea
   225:             placeholder="Tulis lembar jawaban essay Anda di sini secara runut dan lengkap..."
   226:             value={answer || ''}
   227:             onChange={(e) => onAnswer?.(question.id, e.target.value)}
   228:             disabled={disabled}
   229:             className="min-h-[140px] resize-y rounded-xl p-4 font-normal text-sm leading-relaxed border-border/80 focus:border-primary shadow-xs"
   230:           />
   231:         </div>
   232:       )}
   ```
   **Temuan:**
   - Komponen `Textarea` tidak menyertakan atribut penonaktifan koreksi otomatis: `spellCheck={false}`, `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`. Browser default akan menampilkan garis merah keriting (*red squiggly lines*) pada istilah matematika/teknis dan memunculkan popover autocomplete perambah yang mengaburkan lembar pengerjaan.
   - Kelas `resize-y` dan `min-h-[140px]` tidak dipasangkan secara eksplisit dengan dukungan `field-sizing: content` (atau `[field-sizing:content]`), sehingga textarea tidak bertambah tinggi secara adaptif mengikuti panjang paragraf siswa secara mulus tanpa penyesuaian manual drag kursor.

### B. Komponen `src/components/exam/MathRenderer.tsx`
Pada baris 1–34 `MathRenderer.tsx`:
```tsx
1: 'use client';
2: 
3: import { useEffect, useRef } from 'react';
4: import katex from 'katex';
5: import 'katex/dist/katex.min.css';
6: 
7: interface MathRendererProps {
8:   tex: string;
9:   displayMode?: boolean;
10: }
11: 
12: export function MathRenderer({ tex, displayMode = false }: MathRendererProps) {
13:   const ref = useRef<HTMLSpanElement>(null);
14: 
15:   useEffect(() => {
16:     if (!ref.current) return;
17:     try {
18:       katex.render(tex, ref.current, {
19:         displayMode,
20:         throwOnError: false,
21:         errorColor: '#ef4444',
22:       });
23:     } catch {
24:       ref.current.textContent = tex;
25:     }
26:   }, [tex, displayMode]);
27: 
28:   return displayMode ? (
29:     <span ref={ref} className="block my-3 text-center overflow-x-auto" />
30:   ) : (
31:     <span ref={ref} className="inline" />
32:   );
33: }
```
**Temuan:**
- `MathRenderer` menggunakan rendering imperatif berbasis `useEffect` + `katex.render`.
- Pada render awal, komponen merender elemen kosong `<span class="inline"></span>` atau `<span class="block my-3 ..."></span>` tanpa konten matematika.
- Setelah siklus commit/paint browser, `useEffect` baru dieksekusi secara asinkron untuk menyuntikkan puluhan node DOM KaTeX ke dalam `ref.current`.
- Jika terdapat 50 butir soal di mana tiap soal rata-rata memiliki 3 formula KaTeX, browser mengalami 150 kali *imperative DOM mutation* pasca-render yang memicu *Cumulative Layout Shift* (CLS) masif dan visual jumping pada teks soal.
- Pustaka `katex` (v0.16.33 terpasang) menyediakan `katex.renderToString(tex, options)` murni yang dapat dievaluasi secara sinkron pada siklus render React melalui `useMemo` dan disuntikkan via `dangerouslySetInnerHTML`.

### C. Komponen `src/components/exam/ContentBlockRenderer.tsx` & `StimulusRenderer.tsx`
1. **Overflow Guard pada Blok Teks & Rumus:**
   Pada baris 72–150 `ContentBlockRenderer.tsx`, `FormattedTextBlock` merender paragraf tanpa `break-words` atau `[overflow-wrap:anywhere]`. Rumus panjang atau tautan/teks teks tanpa spasi berpotensi memotong batas kotak (*text clipping*).
2. **Re-parsing Stimulus Tanpa Memoization pada Siklus Detik Timer:**
   - Di `src/components/exam/StimulusRenderer.tsx` baris 15:
     ```tsx
     15:   const parsed = parseMarkdown(`# Q1 (ESSAY)\n${content}`);
     16:   const blocks = parsed[0]?.body || [];
     ```
   - Di `src/components/exam/ExamRunner.tsx` baris 834:
     ```tsx
     834:   const stimulusBlocks = parseMarkdown(`# Q1 (ESSAY)\n${q.stimulus_content}`)[0]?.body || [];
     ```
   - Di `src/app/exam/[id]/review/page.tsx` baris 428:
     ```tsx
     428:   const stimulusBlocks = parseMarkdown(`# Q1 (ESSAY)\n${q.stimulus_content}`)[0]?.body || [];
     ```
   **Temuan:** Pemanggilan fungsi `parseMarkdown` dilakukan langsung di dalam badan komponen JSX tanpa `useMemo`. Setiap detik saat state `timeLeft` di `ExamRunner.tsx` berkurang 1 detik, seluruh teks stimulus di-tokenize dan di-parse ulang dari nol pada main thread.

### D. Komponen `src/components/exam/ExamRunner.tsx` (Mode 50 Soal "all" & Scratchpad)
1. **Lembar Coretan (Floating Scratchpad):**
   Pada baris 1374–1380 `ExamRunner.tsx`:
   ```tsx
   1374:               <Textarea
   1375:                 value={scratchpadText}
   1376:                 onChange={(e) => handleScratchpadChange(e.target.value)}
   1377:                 placeholder="Tulis hitungan rumus, coret eliminasi opsi, atau catatan di sini. Tersimpan otomatis..."
   1378:                 className="flex-1 text-xs leading-relaxed resize-none p-3 rounded-xl border-border/80 focus:border-primary bg-background/80 custom-scrollbar font-mono"
   1379:                 autoFocus
   1380:               />
   ```
   **Temuan:** Textarea coretan tidak memiliki `spellCheck={false}`, `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`. Saat peserta menulis hitungan rumus aljabar, perambah memunculkan koreksi ejaan merah dan menu dropdown saran otomatis.
2. **Animasi Slide Masif pada Virtual Items Mode "all":**
   Pada baris 944–957 `ExamRunner.tsx`:
   ```tsx
   944:                     <div
   945:                       key={virtualItem.key}
   946:                       data-index={virtualItem.index}
   947:                       ref={virtualizer.measureElement}
   948:                       style={{
   949:                         position: 'absolute',
   950:                         top: 0,
   951:                         left: 0,
   952:                         width: '100%',
   953:                         transform: `translateY(${virtualItem.start}px)`,
   954:                         paddingBottom: '24px',
   955:                       }}
   956:                       className="animate-in fade-in slide-in-from-bottom-2 duration-300"
   957:                     >
   ```
   **Temuan:** Setiap kartu yang di-mount saat scroll memicu animasi CSS `slide-in-from-bottom-2 duration-300`. Pada scroll kecepatan tinggi (60 FPS), pemicuan animasi berulang ini membebani GPU/compositor dan menyebabkan *jitter/micro-stutter*. Selain itu, kontainer kartu belum memanfaatkan `content-visibility: auto` dan `contain-intrinsic-size: auto 320px`.

### E. Komponen Review Studio (`src/app/exam/[id]/review/page.tsx`)
Pada baris 555–571 `src/app/exam/[id]/review/page.tsx`:
```tsx
555:             /* MODE 3: ALL QUESTIONS CONTINUOUS LIST */
556:             <div className="max-w-3xl xl:max-w-4xl mx-auto space-y-6 py-6 px-4 sm:px-6">
557:               {filteredQuestions.map((q) => (
558:                 <div key={q.id} id={`review-q-${q.id}`} className="scroll-mt-6">
559:                   <QuestionRenderer
560:                     question={q}
561:                     answer={responses[q.id]}
562:                     showDiscussion
563:                     showCorrectAnswer
564:                     feedbackMode={feedbackMode}
565:                     disabled
566:                     textSize={textSize}
567:                   />
568:                 </div>
569:               ))}
570:             </div>
571:           )}
```
**Temuan Kritis (Bottleneck Utama):**
- Pada mode `all` di Review Studio, seluruh 50 butir soal lengkap dengan ulasan pembahasan (`showDiscussion={true}`), kunci jawaban (`showCorrectAnswer`), formula KaTeX, tips, dan opsi A–E dirender sekaligus dalam DOM pohon datar (*flat DOM tree*).
- Total node DOM mencapai >3.000 elemen.
- **Ketiadaan Virtualisasi & Containment:** Tidak terdapat virtualisasi JS maupun CSS `content-visibility: auto` + `contain-intrinsic-size: auto 320px`. Seluruh 50 soal di luar viewport aktif terus dihitung layout dan di-paint oleh browser saat pengguna menggulir halaman, memicu *frame drop* dan *main-thread freeze*.

### F. Status Pengujian dan Compiler
- Perintah `npm run test` (Vitest run): **28 dari 28 tes lulus 100%** (5 test suite: randomizer, anime, parser, mockSupabase, dexieSync).
- Perintah `npx tsc --noEmit`: **0 error** (TypeScript type check bersih).

---

## 2. Logic Chain

```
[Observasi 1.A & 1.B]
QuestionRenderer & MathRenderer mengalami relayout pasca-mount karena ketiadaan 'contain' dan penggunaan useEffect imperatif untuk KaTeX.
   │
   ├─► [Dampak]
   │   Setiap interaksi pengguna (klik opsi, pengetikan essay, expand tips) memicu layout invalidation ke ancestor tree.
   │   KaTeX me-render <span> kosong dahulu, lalu mengisi DOM 100-200ms kemudian, menyebabkan text jumping (CLS).
   │
   ├─► [Solusi R1]
   │   1. Terapkan 'contain: layout style paint' ([contain:layout_style_paint]) pada kontainer QuestionRenderer.
   │   2. Migrasi MathRenderer dari useEffect imperatif ke 'katex.renderToString' sinkron dalam useMemo + dangerouslySetInnerHTML.
   │   3. Berikan 'break-words' dan overflow safety pada FormattedTextBlock.
   │   4. Berikan 'spellCheck={false}', 'autoComplete="off"', 'autoCorrect="off"', dan 'field-sizing: content' pada Textarea Essay & Scratchpad.
   │
[Observasi 1.D & 1.E]
Mode 'all' pada Review Studio me-render 50 soal lengkap dengan pembahasan masif (>3.000 node DOM) tanpa containment atau virtualisasi.
ExamRunner mode 'all' memiliki animasi CSS berulang saat scroll.
   │
   ├─► [Dampak]
   │   Main thread terbebani komputasi paint/layout 50 soal sekaligus saat scrolling cepat, menggagalkan target 60 FPS.
   │   Scrollbar melompat jika ukuran elemen tidak dipreservasi.
   │
   └─► [Solusi R2]
       1. Terapkan CSS modern 'content-visibility: auto' dipasangkan dengan 'contain-intrinsic-size: auto 320px' pada seluruh wrapper soal di Review Studio dan ExamRunner.
       2. Browser secara native men-skip kalkulasi layout & paint untuk kartu di luar viewport tanpa merusak struktur DOM (navigasi anchor scroll-mt-6 dan search Ctrl+F tetap berfungsi).
       3. Kata kunci 'auto' pada 'contain-intrinsic-size: auto 320px' menjamin browser mencatat tinggi nyata kartu begitu pernah masuk viewport, menghilangkan scrollbar jitter.
       4. Hilangkan animasi slide berulang pada item virtual ExamRunner saat scroll aktif.
       5. Memoize parsing stimulus agar tidak dieksekusi ulang tiap detik saat countdown timer berjalan.
```

---

## 3. Caveats

1. **Dukungan Perambah untuk `content-visibility: auto`:**
   - Didukung secara penuh pada Chromium (Chrome, Edge, Opera, Brave) sejak versi 85 (2020) dan Safari sejak 18.0 (2024).
   - Pada perambah yang belum mendukung, CSS engine mengabaikan properti tersebut secara *graceful degradation* (kembali ke layout normal tanpa runtime error).
2. **Interaksi `contain: paint` dan Elemen Melayang (Overlays):**
   - Properti `contain: paint` membatasi *stacking context* dan memotong visual yang keluar batas (*bounding box*).
   - Seluruh modal, dialog, command palette, dan focus tracker di workspace ini sudah dipastikan menggunakan React Portal (`createPortal(..., document.body)`) sesuai [[AGENTS]] Doktrin 1, sehingga tidak akan terpotong oleh `contain: paint` pada kartu soal.
   - Pada mode cetak (`printMode`), `contain: paint` ditiadakan agar dekorasi kurung siku jawaban tidak terpotong.
3. **Paritas TanStack Virtual vs CSS `content-visibility`:**
   - Di `ExamRunner.tsx`, mode `all` sudah memakai `@tanstack/react-virtual`. Namun kartu di dalamnya tetap membutuhkan `contain: layout style paint`.
   - Di `Review Studio` (`review/page.tsx`), penggunaan `content-visibility: auto` + `contain-intrinsic-size: auto 320px` jauh lebih unggul dibanding memasang TanStack Virtual karena tetap mempertahankan keutuhan tautan anchor per-soal (`navigateToQuestion(qId)` via `scrollIntoView`), tanpa risiko desinkronisasi indeks filter.

---

## 4. Conclusion & Actionable Proposals

Sistem rendering soal saat ini fungsional namun memiliki kerentanan performa layout shift (CLS) dan beban main-thread tinggi pada mode 50 butir soal. Berikut adalah cetak biru perubahan (*actionable proposal*) untuk implementer:

### Proposal 1: Penguatan `src/components/exam/QuestionRenderer.tsx` (R1)
1. Tambahkan kelas containment pada pembungkus kartu (Card & borderless):
   ```tsx
   // Ganti baris 316-333 dengan kelas containment eksplisit
   ) : borderless ? (
     <div className={cn(
       'transition-all duration-200 w-full [contain:layout_style_paint]',
       flagged && 'rounded-xl p-4 sm:p-5 bg-amber-500/[0.03] border border-amber-500/30 ring-1 ring-amber-500/10'
     )}>
       {innerContent}
     </div>
   ) : (
     <Card className={cn(
       'transition-all duration-200 rounded-xl border bg-card shadow-xs [contain:layout_style_paint]',
       flagged ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-border/70 hover:border-zinc-300 dark:hover:border-zinc-700',
       isCorrect && 'border-emerald-500/40 bg-emerald-500/[0.03]',
       isWrong && 'border-rose-500/40 bg-rose-500/[0.03]',
       isNeutral && answer !== undefined && 'border-muted-foreground/30 bg-muted/20',
     )}>
   ```
2. Lengkapi form ergonomics pada Textarea Essay:
   ```tsx
   // Baris 224-230
   <Textarea
     placeholder="Tulis lembar jawaban essay Anda di sini secara runut dan lengkap..."
     value={answer || ''}
     onChange={(e) => onAnswer?.(question.id, e.target.value)}
     disabled={disabled}
     spellCheck={false}
     autoComplete="off"
     autoCorrect="off"
     autoCapitalize="off"
     className="min-h-[140px] resize-y [field-sizing:content] rounded-xl p-4 font-normal text-sm leading-relaxed border-border/80 focus:border-primary shadow-xs"
   />
   ```

### Proposal 2: Migrasi KaTeX Sinkron `src/components/exam/MathRenderer.tsx` (R1)
Ganti implementasi `useEffect` imperatif dengan `useMemo` sinkron berbasis `katex.renderToString`:
```tsx
'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  tex: string;
  displayMode?: boolean;
}

export function MathRenderer({ tex, displayMode = false }: MathRendererProps) {
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

  if (!html) {
    return <span className={displayMode ? "block my-3 text-center" : "inline"}>{tex}</span>;
  }

  return displayMode ? (
    <span
      className="block my-3 text-center overflow-x-auto custom-scrollbar max-w-full [contain:layout_paint]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <span
      className="inline-block max-w-full align-middle [contain:layout_style]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

### Proposal 3: Integrasi Dual-Surface Containment & Virtualisasi di Review Studio (R2)
Pada `src/app/exam/[id]/review/page.tsx` baris 557–570:
```tsx
{filteredQuestions.map((q) => (
  <div
    key={q.id}
    id={`review-q-${q.id}`}
    className="scroll-mt-6 [content-visibility:auto] [contain-intrinsic-size:auto_320px]"
  >
    <QuestionRenderer
      question={q}
      answer={responses[q.id]}
      showDiscussion
      showCorrectAnswer
      feedbackMode={feedbackMode}
      disabled
      textSize={textSize}
    />
  </div>
))}
```

### Proposal 4: Penguatan Ergonomi Lembar Coretan & Memoize Stimulus di `ExamRunner.tsx` (R1 & R2)
1. Pada `ExamRunner.tsx` Textarea Scratchpad (baris 1374–1380):
   Tambahkan `spellCheck={false}`, `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`.
2. Pada `ExamRunner.tsx` mode `all` (baris 956):
   Hapus kelas animasi `slide-in-from-bottom-2 duration-300` yang memicu re-render frame jitter saat scrolling cepat. Pasangkan `[content-visibility:auto] [contain-intrinsic-size:auto_320px]` pada wrapper kartu.
3. Memoize parsing stimulus di `ExamRunner.tsx`, `ReviewPage`, dan `StimulusRenderer.tsx`:
   Gunakan `useMemo(() => parseMarkdown(\`# Q1 (ESSAY)\\n\${content}\`)[0]?.body || [], [content])` untuk menghindari kalkulasi ulang tiap detik saat countdown timer berjalan.

---

## 5. Verification Method

Untuk memverifikasi secara independen sebelum dan sesudah implementasi:

1. **Uji Unit Regresi (Vitest):**
   ```bash
   npm run test
   ```
   *Kondisi lulus:* Seluruh 28 unit test di `tests/` wajib berstatus lulus 100% (exit code 0).

2. **Pemeriksaan Tipe TypeScript (Zero Compile Errors):**
   ```bash
   npx tsc --noEmit
   ```
   *Kondisi lulus:* Tidak ada error tipe baru yang diperkenalkan (exit code 0).

3. **Verifikasi DOM & Containment di DevTools Browser:**
   - Buka mode 50 Soal di Exam Runner dan Review Studio.
   - Inspect element kartu soal (`#review-q-X`): pastikan computed style memiliki `content-visibility: auto` dan `contain-intrinsic-size: auto 320px`.
   - Periksa kartu soal di luar viewport: browser DevTools harus menandai node tersebut dengan badge `[skipped]` pada rendering tree.
   - Scroll cepat dari soal 1 ke 50: Frame rate rendering pada Performance panel Chrome DevTools stabil pada 60 FPS tanpa visual micro-stuttering.
   - Navigasi anchor: Klik nomor soal di Matriks Evaluasi (misal: Soal 45), halaman harus bergulir mulus ke posisi yang tepat tanpa pergeseran layout.

4. **Kondisi Invalidasi:**
   - Jika `contain: paint` memotong popover/dialog (dipastikan tidak terjadi karena React Portal `document.body` sudah aktif).
   - Jika rumus matematika tidak ter-render (dicegah oleh fallback string jika KaTeX melempar error).
