# 🎨 Desain Sistem: Playful Clean UI & Interaksi Kognitif

*Konteks: Bagian dari [[00_FONDASI_INDEX]]*

Berlawanan dengan arsitektur UI konvensional pada aplikasi akademik yang kaku atau membosankan, ExamPreparer dibangun dengan pedoman ketat yang dituangkan ke dalam doktrin antarmuka `PLAYFUL_CLEAN_UI_DOCTRINE`.

## 1. Landasan Cognitive Load Theory (Teori Beban Kognitif)

Mengerjakan ujian—terutama di hadapan layar komputer selama lebih dari 60 menit—menyedot *Working Memory Capacity* siswa, menghasilkan kelelahan kognitif (*Cognitive Fatigue*). 

Jika antarmuka memiliki *Visual Noise* yang tinggi (banyak warna yang tumpang tindih secara tidak beraturan, tata letak acak, atau penanda tombol yang ambigu), siswa harus melakukan proses ganda:
1. Menavigasi tata letak layar.
2. Menyelesaikan soal matematika.

Oleh karena itu, sistem ini menuntut tata letak (*Layout*) dan ruang putih (*White Space*) yang luas dan bersih, membebaskan ruang memori otak siswa murni untuk memproses permasalahan di *Viewport* utama.

## 2. Paradigma Playful Clean UI (Aestetik Modern)

Tidak hanya bersih, UI harus "Hidup". Di dalam `PLAYFUL_CLEAN_UI_DOCTRINE`, kita mengintegrasikan elemen *Playful* melalui umpan balik animasi responsif dan taktil:

- **Warna Penuh Makna (Semantic Colors):** Pemilihan gradien warna halus (seperti Biru Elegan, Merah Hukuman/Neo-Brutal, dan Hijau Validasi) yang sangat tajam tanpa menyakiti retina mata. (Berbeda dengan desain Neobrutalism yang seringkali kasar dan memiliki bayangan solid/keras).
- **Glassmorphism & Micro-Interactions:** Menggunakan *blur* (efek kaca) dan gerak mikro (Animasi framer-motion saat modal/dialog muncul, transisi bayangan ketika kursor melayang di atas *Badge* nilai). Hal ini merangsang rilis dopamin halus yang membuat pengerjaan ujian terasa seperti permainan edukatif (*Gamification* ringan).

## 3. Diagram Hierarki Perhatian Mata

\`\`\`mermaid
graph TD
    subgraph Viewport Siswa
        Header[Header Kontras & Minimalis: Waktu Sisa Ujian]
        AreaSoal[Bidang Putih Luas: Merender Markdown & Soal]
        Navigasi[Panel Kiri/Bawah: Blok Navigasi Dinamis & State Jawaban]
    end

    Header -->|Atensi Rendah / Sesekali| AreaSoal
    AreaSoal -->|Atensi Tinggi / Memori Kerja Aktif| AreaSoal
    AreaSoal -->|Interaksi Taktil Tuntas| Navigasi
    Navigasi -.-> AreaSoal
\`\`\`

Desain visual dalam sistem ini bukanlah sekadar seni estetika, melainkan instrumen *Human-Computer Interaction (HCI)* yang telah disetrika menggunakan pertimbangan saintifik ketat agar ujian tidak menjadi beban mental yang berlebih.
