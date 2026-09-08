# CSS TRANSFORM CONTAINING BLOCK & FIXED OVERLAY RULE

## Konteks
Berdasarkan spesifikasi *W3C CSS Transforms Module Level 1*, penerapan properti `transform` (`translateY`, `scale`, `rotate`), `filter`, atau `perspective` pada kontainer induk menyebabkan elemen tersebut membentuk *new containing block* lokal bagi seluruh elemen keturunan berstatus `position: fixed`.

## Aturan & Batasan
1. **Mandatory React Portal:** Setiap komponen yang berfungsi sebagai modal viewport penuh, overlay animasi pembuka, backdrop, atau toast yang harus mengacu pada layar browser wajib di-render via `createPortal(content, document.body)`.
2. **Anti-Clipping:** Dilarang meletakkan elemen `position: fixed` secara inline di dalam kontainer yang memiliki animasi transform CSS (misal: `<AnimeBox preset="page">`), karena koordinat fixed akan terbajak oleh tinggi kontainer induk dan memunculkan scrollbar yang tidak diinginkan.
3. **Scroll Locking:** Komponen overlay penuh wajib mengatur `document.body.style.overflow = 'hidden'` saat terpasang dan merestorasinya saat unmount.
