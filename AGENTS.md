# WORKSPACE AGENTS RULES & DOCTRINES (EXAMPREPARER)

Dokumen ini memuat aturan perilaku, batasan arsitektur, dan protokol pencegahan bug yang wajib dipatuhi oleh seluruh AI agent yang beroperasi di workspace ini.

---

## 1. CSS TRANSFORM CONTAINING BLOCK & FIXED OVERLAY GUARD
- **Batasan (Constraint):** Setiap elemen antarmuka yang dirancang sebagai modal layar penuh, animasi pembuka/selamat datang, toast, atau backdrop (menggunakan `position: fixed` / `inset-0`) WAJIB di-mount menggunakan React Portal (`createPortal(content, document.body)`) jika ada kemungkinan elemen induk memiliki properti CSS `transform`, `filter`, atau animasi perpindahan.
- **Spesifikasi Teknis:** Berdasarkan *W3C CSS Transforms Module Level 1*, properti `transform` pada elemen induk menciptakan *containing block* lokal baru yang membajak koordinat `position: fixed` dari viewport jendela browser.
- **Scroll Locking:** Saat overlay layar penuh aktif, komponen wajib menerapkan penguncian scroll sementara (`document.body.style.overflow = 'hidden'`) dan merestorasinya saat unmount.

---

## 2. REACT PORTAL MOUNT LIFECYCLE & ZERO-FREEZE PROTOCOL
- **Batasan (Constraint):** Agen DILARANG mengeksekusi animasi imperatif berbasis DOM Ref di dalam `useEffect` mount jika komponen menggunakan guarded mounting (`if (!mounted) return null;`) pada render pertama.
- **Pemisahan Siklus (Separation of Concerns):**
  1. Pisahkan state `setMounted(true)` ke dalam satu `useEffect` pemula tanpa dependensi.
  2. Tempatkan eksekusi animasi imperatif (Anime.js, GSAP, dsb.) ke dalam `useEffect` kedua dengan dependensi `[mounted]` agar seluruh DOM Ref dipastikan sudah melekat pada elemen nyata di dokumen.
- **Unconditional Failsafe Timer:** Setiap animasi transisi layar penuh yang memblokir navigasi pengguna WAJIB menyertakan timer pengaman (`setTimeout(..., maxDurationMs)`) untuk menjamin pemanggilan callback `onComplete()` dan pemulihan scroll layar secara mutlak dalam segala kondisi (misal: throttling browser, tab berganti).

---

## 3. SUBAGENT REGISTRY LOOKUP FAILURE AUTONOMOUS FALLBACK
- **Batasan (Constraint):** Jika pemanggilan subagent via `invoke_subagent` menghasilkan error runtime lingkungan eksekusi (seperti kegagalan plugin container atau `skill_search` missing), agen UTAMA WAJIB langsung mengambil alih tugas secara otonom (*Solo Routine*).
- **Protokol:** Agen DILARANG menghentikan pekerjaan atau meminta pengguna membetulkan registri internal. Agen utama harus langsung membaca file, menerapkan perubahan, dan menjalankan verifikasi empiris mandiri.

---

## 4. EXAM STUDIO COCKPIT ERGONOMICS & ANTI-STACK SPRAWL
- **Batasan (Constraint):** Antarmuka pengerjaan ujian dilarang menggunakan kontainer tunggal sempit (`max-w-3xl`) yang mengapung di tengah layar hampa (*barren wasteland*), dan dilarang menumpuk lebih dari satu bilah navigasi vertikal (*stack sprawl*).
- **Unified Studio Command Bar:** Judul ujian, indikator waktu (*Countdown Timer*), bar kemajuan, dan tombol aksi QoL wajib disatukan ke dalam satu bilah atas setinggi 56px (`h-14`).
- **Arsitektur Dua Kolom:** Pada layar desktop (`lg:`), antarmuka wajib menerapkan tata letak dua kolom: Kanvas Baca Soal (70%) dan panel *Cockpit Inspector* persisten (30%) yang memuat matriks nomor soal dan KPI status pengerjaan real-time.
- **Tactile Keycap Badges:** Pilihan ganda wajib menggunakan lencana tombol taktil (`[A]`, `[B]`, `[C]`, `[D]`, `[E]`) dengan efek visual dopamin instan saat dipilih (*primary border ring*, *subtle lift*, *check icon*), dilengkapi listener navigasi keyboard fisik (`A-E`, `1-5`, `F` untuk ragu, `Panah Kanan/Kiri` untuk navigasi).
