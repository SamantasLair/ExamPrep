# 🕵️ Heuristic-Based Automated Proctoring

*Konteks: Bagian dari [[00_FONDASI_INDEX]]*

Kekurangan utama sistem ujian daring (*online examination*) konvensional adalah kesulitan mengawasi siswa (menghindari aksi curang seperti bertukar *tab* ke mesin pencari). Walaupun terdapat solusi pengawasan dengan web-kamera (*Webcam Proctoring*), solusi tersebut seringkali terkendala oleh isu privasi, bandwidth internet, dan infrastruktur klien yang tidak memadai.

Oleh karena itu, ExamPreparer menggunakan pendekatan **Heuristic-Based Automated Proctoring** (Pengawasan Berbasis Aturan/Heuristik di tingkat *Browser*).

## 1. Web Page Visibility API

Arsitektur kita me-monitor *Event Loop* tunggal dari *Browser* dengan mengaitkan *event listener* pada API standar industri web (`document.visibilitychange` dan `window.onblur`). 

Algoritma *Proctoring*:
1. Saat ujian dimulai, inisialisasi variabel `violationCount = 0` yang disimpan dengan aman (agar tidak musnah saat *refresh*).
2. Jika *event* `blur` memicu (indikasi pengguna meminimalkan peramban, menekan tombol `Alt+Tab`, atau membuka aplikasi lain), maka state dipicu ke `isFocused = false`.
3. UI akan diblokir dengan *layar penuh intervensi* (Blur merah) yang menutupi seluruh naskah soal.
4. Ketika fokus dikembalikan (`focus`), `violationCount` bertambah secara rekursif $+1$.
5. Jika pelacakan telah menembus batas anomali (Cth: `violationCount >= 3`), ujian diserahkan (`onSubmit`) secara paksa ke *Server*.

## 2. Diagram Keamanan *Event Loop*

\`\`\`mermaid
graph TD
    A[Mulai Ujian] --> B{Apakah Window Fokus?}
    B -- Ya --> C[Siswa Membaca / Menjawab Soal]
    B -- Tidak (Blur) --> D[Pelanggaran Terdeteksi]
    
    D --> E[Blokir UI & Tampilkan Peringatan]
    E --> F[Fokus Kembali?]
    
    F -- Ya --> G[Increment violation_count]
    G --> H{violation_count >= Max?}
    
    H -- Ya --> I((AUTO SUBMIT / DISKUALIFIKASI))
    H -- Tidak --> C
\`\`\`

## 3. Sandboxing & Kepatuhan Etika
Sistem deteksi anomali ini memiliki landasan etika perlindungan privasi data tingkat tinggi karena prosesnya dibatasi pada metode *Sandboxing Browser*:
- Bebas Kamera (Tidak melanggar batas spasial/fisik peserta).
- Ringan pada CPU (Hanya mengandalkan mitigasi *interruption listener* pasif).
- Transparan (Peringatan eksplisit kepada siswa tentang kuota kecurangan sebelum diskualifikasi memicu secara deterministik).
