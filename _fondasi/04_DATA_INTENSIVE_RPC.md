# 🗄️ Data-Intensive Computing & BIG DATA Doctrine

*Konteks: Bagian dari [[00_FONDASI_INDEX]]*

Analisis butir soal pada sistem yang menangani ribuan ujian membutuhkan pemrosesan matriks berukuran besar. Awalnya, mengambil seluruh riwayat jawaban (*responses*) dari *database* ke *browser* admin (Client-Side) memakan *bandwidth* yang tak terkendali (kompleksitas memori $O(N \times Q)$, di mana $N$ adalah jumlah peserta dan $Q$ adalah jumlah soal). 

## 1. Ancaman Out of Memory (OOM)
Jika klien mengunduh matriks `JSONB` dari ratusan ribu baris percobaan ujian, *V8 JavaScript Engine* pada *browser* akan gagal mengalokasikan RAM, mengakibatkan *tab browser* mengalami *crash* ("Aw Snap" atau "Out of Memory"). Hal ini secara fundamental tidak memenuhi standar *Enterprise*.

## 2. Push-Down Aggregation (Server-Side RPC)
Mengikuti pedoman dari *Data-Intensive Application Design* (Martin Kleppmann), kita mengubah rute algoritma dengan mengembalikan komputasi ke titik terdekat dengan tempat data disimpan: **Database**.

Di ExamPreparer, kita mengimplementasikan **Remote Procedure Call (RPC)** PostgreSQL pada tabel Supabase bernama `calculate_irt`.

### Skema Arsitektur RPC

\`\`\`mermaid
sequenceDiagram
    participant Browser as Klien (Admin)
    participant RPC as API Supabase / RPC
    participant DB as Mesin PostgreSQL

    Browser->>RPC: Eksekusi calculate_irt(test_id)
    activate RPC
    RPC->>DB: Ekstrak JSONB `correct_answers` dari tabel `tests`
    RPC->>DB: Scan & Match JSONB `responses` pada `attempts`
    DB-->>RPC: Kembalikan Agregasi (Tabel Matriks CTT)
    RPC-->>Browser: JSON Hasil Analisis Proporsi (Sangat Ringan!)
    deactivate RPC
    Browser->>Browser: Update UI Dasbor $O(1)$
\`\`\`

## 3. Landasan Kinerja
- **Network Bandwidth:** Menurun dari puluhan Megabyte per klik ke kurang dari 5 Kilobyte (hanya mengembalikan ringkasan $p$-score per soal).
- **Time Complexity:** Karena PostgreSQL mengagregasi (*GROUP BY* dan ekspansi *JSONB*) menggunakan bahasa mesin rendah dan *Query Optimizer* berbasis C, perhitungan analitik lebih cepat 100x lipat dibanding *iterasi* perulangan `Array.forEach` JavaScript.
- **BIG DATA Doctrine:** Doktrin yang mengikat kita menetapkan aturan ketat bahwa semua beban pencarian (Filter/Agregasi) *wajib* terjadi di sisi server, membuat UI tetap responsif 60fps tanpa kompromi.
