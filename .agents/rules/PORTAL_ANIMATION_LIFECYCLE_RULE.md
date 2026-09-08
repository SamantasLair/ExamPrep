# REACT PORTAL MOUNT LIFECYCLE & ZERO-FREEZE RULE

## Konteks
Komponen klien yang memanfaatkan `createPortal` sering kali menerapkan guarded mounting (`if (!mounted) return null;`) untuk mencegah *hydration mismatch*. Pada siklus render pertama, pengembalian `null` membuat DOM Ref masih bernilai `null` saat efek mount pertama dieksekusi.

## Aturan & Batasan
1. **Pemisahan Efek (Separation of Lifecycle Effects):**
   - Efek pertama: `useEffect(() => { setMounted(true); }, [])` semata-mata untuk mengaktifkan rendering portal.
   - Efek kedua: `useEffect(() => { if (!mounted) return; /* jalankan animasi */ }, [mounted])` untuk memastikan seluruh elemen DOM Ref telah terikat sempurna ke elemen HTML nyata.
2. **Unconditional Failsafe Timer:**
   Setiap animasi transisi penutup yang memanggil callback `onComplete()` wajib menyertakan timer pengaman `setTimeout(..., maxDurationMs)` agar transisi keluar dijamin 100% selalu terpanggil meskipun animasi imperatif (Anime.js, GSAP) mengalami interupsi, background tab throttling, atau error tak terduga.
