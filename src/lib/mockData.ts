import type { StudentRow, TestRow, QuestionRow } from './types';

export const INITIAL_STUDENTS: StudentRow[] = [
  {
    id: 'EXA-001',
    name: 'Budi Pratama',
    birthday: '2008-04-15',
    avatar_url: null,
    created_at: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'EXA-002',
    name: 'Siti Rahma',
    birthday: '2008-09-22',
    avatar_url: null,
    created_at: '2026-01-11T09:30:00.000Z'
  },
  {
    id: 'EXA-003',
    name: 'Ahmad Fauzi',
    birthday: '2007-12-05',
    avatar_url: null,
    created_at: '2026-01-12T10:15:00.000Z'
  }
];

export const INITIAL_TESTS: TestRow[] = [
  {
    id: 'mock-test-1',
    title: 'Simulasi Akbar UTBK SNBT 2026 (50 Soal Lengkap)',
    description: 'Ujian komprehensif 50 butir soal mencakup Literasi Bahasa Indonesia, Penalaran Umum, Pengetahuan Kuantitatif, Literasi Bahasa Inggris, dan Pemecahan Masalah.',
    raw_markdown: "STIMULUS: literasi-indo-ai\n**Transformasi Kecerdasan Buatan dan Literasi Kritis dalam Pendidikan Abad 21**\n\nIntegrasi kecerdasan buatan (Artificial Intelligence/AI) ke dalam sektor pendidikan telah membuka dimensi baru dalam pedagogi modern. Sistem pembelajaran adaptif berbasis algoritma generatif memungkinkan kurikulum disesuaikan dengan ritme kognitif individual tiap peserta didik. Model ini mampu mendeteksi kesenjangan pemahaman secara *real-time*, memberikan umpan balik diagnostik instan, serta memangkas beban administratif pengajar hingga 40%. Namun, lompatan teknologi ini memicu perdebatan epistemologis mengenai peran esensial manusia dalam proses transmisi pengetahuan.\n\nKritikus berargumen bahwa ketergantungan berlebih terhadap model bahasa besar (Large Language Models) berisiko mendegradasi kemampuan bernalar mandiri dan daya analisis kritis siswa. Fenomena *cognitive offloading*—kecenderungan mendelegasikan tugas pemecahan masalah yang rumit ke mesin cerdas—berpotensi menghasilkan generasi yang piawai mengonsumsi sintesis informasi, tetapi rapuh dalam memverifikasi validitas data primer. Di samping itu, bias inheren pada korpus data latih berpotensi memperkuat misinformasi dan stereotip sosial budaya.\n\nOleh karena itu, institusi pendidikan dituntut untuk menggeser paradigma pengajaran dari sekadar transfer fakta menuju penguasaan literasi digital kritis (*critical algorithmic literacy*). Peserta didik tidak hanya dituntut mampu berinteraksi dengan AI secara produktif, melainkan wajib memiliki kecakapan dalam mendekonstruksi bias algoritma, menguji logika inferensi model, dan menegakkan integritas akademik. Masa depan pendidikan tidak ditentukan oleh adopsi teknologi semata, melainkan oleh sintesis harmonis antara efisiensi kecerdasan artifisial dan kedalaman kebijaksanaan humanistik.\nEND_STIMULUS\n\n# Q1 (PILGAN)\nBerdasarkan paragraf pertama, apakah manfaat utama integrasi kecerdasan buatan dalam proses pembelajaran?\n\n[[A]] Menggantikan peran guru sepenuhnya dalam memberikan instruksi di dalam kelas.\n[[B]] Menstandarisasi kecepatan belajar seluruh siswa agar mencapai target kurikulum yang seragam.\n[[C]] Menyesuaikan materi dengan ritme kognitif individual dan mengurangi beban administratif pengajar.\n[[D]] Memastikan seluruh siswa lulus ujian kelulusan dengan nilai di atas KKM secara otomatis.\n[[E]] Menghilangkan kebutuhan evaluasi diagnostik berkala oleh institusi sekolah.\n\nANSWER: C\nDISCUSSION:\nParagraf pertama secara eksplisit menyatakan bahwa sistem pembelajaran adaptif berbasis AI memungkinkan kurikulum disesuaikan dengan ritme kognitif individual dan memangkas beban administratif pengajar hingga 40%.\nLABELS: Literasi Bahasa Indonesia, SNBT, Gagasan Utama\n\n# Q2 (PILGAN)\nIstilah *cognitive offloading* dalam konteks bacaan di atas merujuk pada:\n\n[[A]] Kelelahan mental yang dialami pengajar akibat penggunaan perangkat digital secara intensif.\n[[B]] Kecenderungan siswa mendelegasikan proses pemecahan masalah rumit ke mesin cerdas.\n[[C]] Proses penghapusan data memori yang tidak relevan dari pusat penyimpanan peladen cloud.\n[[D]] Peningkatan kapasitas otak manusia setelah berkolaborasi secara intensif dengan teknologi AI.\n[[E]] Penurunan daya ingat jangka pendek akibat paparan radiasi layar komputer.\n\nANSWER: B\nDISCUSSION:\nParagraf kedua mendefinisikan fenomena *cognitive offloading* sebagai kecenderungan mendelegasikan tugas pemecahan masalah yang rumit ke mesin cerdas, yang berpotensi melemahkan penalaran mandiri.\nLABELS: Literasi Bahasa Indonesia, SNBT, Makna Kontekstual\n\n# Q3 (PILGAN)\nPernyataan manakah yang PALING SESUAI dengan pandangan penulis mengenai masa depan pendidikan di era AI?\n\n[[A]] Pembatasan ketat penggunaan perangkat komputasi di lingkungan sekolah formal.\n[[B]] Penggantian kurikulum humaniora dengan mata pelajaran ilmu komputer terapan secara menyeluruh.\n[[C]] Penyerahan seluruh perancangan silabus pendidikan kepada algoritma model bahasa besar.\n[[D]] Perpaduan harmonis antara efisiensi kecerdasan buatan dan literasi kritis humanistik.\n[[E]] Keyakinan bahwa AI akan menurunkan kualitas seluruh lulusan perguruan tinggi di masa depan.\n\nANSWER: D\nDISCUSSION:\nKalimat terakhir paragraf ketiga menyatakan bahwa masa depan pendidikan ditentukan oleh 'sintesis harmonis antara efisiensi kecerdasan artifisial dan kedalaman kebijaksanaan humanistik'.\nLABELS: Literasi Bahasa Indonesia, SNBT, Simpulan Teks\n\n# Q4 (PILGAN)\nBerdasarkan bacaan, bahaya laten yang muncul akibat bias pada korpus data latih model AI adalah:\n\n[[A]] Terjadinya kegagalan perangkat keras komputasi server sekolah.\n[[B]] Penguatan misinformasi dan pelestarian stereotip sosial budaya di masyarakat.\n[[C]] Meningkatnya biaya lisensi perangkat lunak pendidikan berbayar.\n[[D]] Penurunan drastis kecepatan akses internet pita lebar nasional.\n[[E]] Ketidakmampuan AI dalam memproses perintah bahasa Indonesia baku.\n\nANSWER: B\nDISCUSSION:\nParagraf kedua menyebutkan bahwa bias inheren pada korpus data latih AI berpotensi memperkuat misinformasi dan stereotip sosial budaya.\nLABELS: Literasi Bahasa Indonesia, SNBT, Analisis Detail\n\n# Q5 (PILGAN)\nSikap kritis yang diharapkan dimiliki siswa dalam era literasi algoritmik (*critical algorithmic literacy*) adalah:\n\n[[A]] Menolak segala bentuk penggunaan teknologi berbasis internet dalam belajar.\n[[B]] Menghafal seluruh baris kode pembuat model bahasa cerdas.\n[[C]] Mampu mendekonstruksi bias algoritma dan memverifikasi validitas data primer.\n[[D]] Mempercayai seluruh hasil pencarian mesin cerdas tanpa perlu melakukan pengecekan ulang.\n[[E]] Menggunakan AI secara rahasia tanpa mencantumkan atribusi akademik.\n\nANSWER: C\nDISCUSSION:\nParagraf ketiga menjelaskan bahwa siswa diharapkan memiliki kecakapan mendekonstruksi bias algoritma, menguji logika inferensi model, dan menegakkan integritas data primer.\nLABELS: Literasi Bahasa Indonesia, SNBT, Evaluasi Teks\nCLEAR_STIMULUS\n\n# Q6 (PILGAN)\nPerhatikan kalimat berikut:\n\"Pemerintah berupaya menaikkan standar mutu pendidikan *dimana* hal tersebut membutuhkan alokasi dana yang terencana.\"\nPerbaikan yang tepat untuk kata yang dicetak miring agar menjadi kalimat efektif adalah:\n\n[[A]] yang mana\n[[B]] di mana\n[[C]] sehingga\n[[D]] oleh karena\n[[E]] dan\n\nANSWER: C\nDISCUSSION:\nKata 'dimana' adalah kata tanya tempat dan tidak boleh digunakan sebagai kata penghubung antarklausa. Konjungsi yang tepat untuk menyatakan hubungan akibat/penjelasan adalah 'sehingga'.\nLABELS: Tata Bahasa, Kalimat Efektif, PUEBI\n\n# Q7 (PILGAN)\nPenulisan gabungan kata berikut ini yang TIDAK BAKU menurut Pedoman Umum Ejaan Bahasa Indonesia (PUEBI) adalah:\n\n[[A]] pascasarjana\n[[B]] antarkota\n[[C]] non-pemerintah\n[[D]] sub-bagian\n[[E]] tunaaksara\n\nANSWER: D\nDISCUSSION:\nBentuk terikat 'sub-' ditulis serangkai tanpa tanda hubung jika bertemu kata berhuruf kecil yang bukan singkatan/istilah asing, sehingga bentuk bakunya adalah 'subbagian'.\nLABELS: Tata Bahasa, Ejaan, PUEBI\n\n# Q8 (PILGAN)\nSinonim yang paling tepat untuk kata **KOMPREHENSIF** adalah:\n\n[[A]] Menyeluruh dan mendalam\n[[B]] Cepat dan singkat\n[[C]] Eksklusif dan terbatas\n[[D]] Bertahap dan perlahan\n[[E]] Sederhana dan terpadu\n\nANSWER: A\nDISCUSSION:\nMenurut KBBI, komprehensif berarti bersifat mampu menangkap (menerima) dengan baik; luas dan lengkap (tentang ruang lingkup atau isi); menyeluruh.\nLABELS: Kosakata, Sinonim, Penalaran Umum\n\n# Q9 (PILGAN)\nAntonim yang paling tepat untuk kata **SPORADIS** adalah:\n\n[[A]] Jarang\n[[B]] Berkelanjutan\n[[C]] Meluas\n[[D]] Tiba-tiba\n[[E]] Terpencil\n\nANSWER: B\nDISCUSSION:\nSporadis berarti keadaan yang jarang terjadi atau tersebar secara tidak menentu. Lawan kata yang tepat adalah teratur atau berkelanjutan (kontinu).\nLABELS: Kosakata, Antonim, Penalaran Umum\n\n# Q10 (PILGAN)\nKalimat manakah yang memiliki susunan subjek, predikat, objek, dan keterangan (S-P-O-K) yang lengkap dan tepat?\n\n[[A]] Di perpustakaan kota kemarin siang.\n[[B]] Para mahasiswa mengkaji dampak kecerdasan buatan di ruang seminar.\n[[C]] Telah dipelajari secara mendalam teori kuantum modern.\n[[D]] Peneliti yang berprestasi tinggi dari universitas terkemuka.\n[[E]] Membaca buku teks sains dengan cermat dan teliti.\n\nANSWER: B\nDISCUSSION:\nSubjek: 'Para mahasiswa', Predikat: 'mengkaji', Objek: 'dampak kecerdasan buatan', Keterangan: 'di ruang seminar'.\nLABELS: Tata Bahasa, Struktur Kalimat, Sintaksis\n\n# Q11 (PILGAN)\nPremis 1: Jika cuaca mendung dan angin berhembus kencang, maka hujan akan turun lebat.\nPremis 2: Hari ini hujan tidak turun lebat.\nKesimpulan yang sah menurut hukum Modus Tollens adalah:\n\n[[A]] Hari ini cuaca cerah tanpa angin.\n[[B]] Cuaca tidak mendung atau angin tidak berhembus kencang.\n[[C]] Cuaca mendung tetapi angin tidak berhembus kencang.\n[[D]] Angin bertiup sangat kencang sepanjang hari.\n[[E]] Hujan akan turun lebat pada malam hari.\n\nANSWER: B\nDISCUSSION:\nPernyataan $P \\land Q \\rightarrow R$. Diketahui $\\sim R$. Dengan modus tollens diperoleh $\\sim(P \\land Q)$, yang menurut hukum De Morgan ekuivalen dengan $\\sim P \\lor \\sim Q$ (Cuaca tidak mendung atau angin tidak berhembus kencang).\nLABELS: Logika, Modus Tollens, Penalaran Umum\n\n# Q12 (PILGAN)\nSemua ilmuwan memiliki rasa ingin tahu yang tinggi. Sebagian ilmuwan menyukai musik klasik.\nKesimpulan yang tepat dari kedua premis di atas adalah:\n\n[[A]] Semua orang yang menyukai musik klasik adalah ilmuwan.\n[[B]] Semua yang memiliki rasa ingin tahu tinggi menyukai musik klasik.\n[[C]] Sebagian orang yang memiliki rasa ingin tahu tinggi menyukai musik klasik.\n[[D]] Tidak ada penyuka musik klasik yang bukan ilmuwan.\n[[E]] Sebagian ilmuwan tidak memiliki rasa ingin tahu yang tinggi.\n\nANSWER: C\nDISCUSSION:\nKarena sebagian ilmuwan menyukai musik klasik dan setiap ilmuwan memiliki rasa ingin tahu tinggi, maka pasti ada sebagian orang yang memiliki rasa ingin tahu tinggi yang menyukai musik klasik.\nLABELS: Logika, Silogisme, Penalaran Umum\n\n# Q13 (PILGAN)\nNegasi dari proposisi majemuk \"Hari ini tidak hujan dan lalu lintas lancar\" adalah:\n\n[[A]] Hari ini hujan dan lalu lintas macet.\n[[B]] Hari ini hujan atau lalu lintas tidak lancar.\n[[C]] Hari ini tidak hujan atau lalu lintas macet.\n[[D]] Jika hari ini hujan maka lalu lintas lancar.\n[[E]] Hari ini cerah serta lalu lintas ramai lancar.\n\nANSWER: B\nDISCUSSION:\nBentuk awal $\\sim P \\land Q$. Negasinya adalah $\\sim(\\sim P \\land Q) \\equiv P \\lor \\sim Q$ (Hari ini hujan atau lalu lintas tidak lancar).\nLABELS: Logika, De Morgan, Penalaran Umum\n\n# Q14 (PILGAN)\nJika pernyataan \"Semua peserta seminar wajib membawa kartu identitas\" bernilai SALAH, maka pernyataan manakah yang PASTI bernilai BENAR?\n\n[[A]] Tidak ada peserta seminar yang membawa kartu identitas.\n[[B]] Semua peserta seminar tidak membawa kartu identitas.\n[[C]] Ada peserta seminar yang tidak membawa kartu identitas.\n[[D]] Sebagian peserta seminar membawa kartu identitas ganda.\n[[E]] Panitia seminar melarang peserta membawa kartu identitas.\n\nANSWER: C\nDISCUSSION:\nPernyataan universal bernilai salah jika dan hanya jika negasinya (proposisi partikular negatif) bernilai benar: $\\sim(\\forall x, P(x)) \\equiv \\exists x, \\sim P(x)$ (\"Ada/sebagian peserta yang tidak membawa kartu identitas\").\nLABELS: Logika, Kuantor, Penalaran Umum\n\n# Q15 (PILGAN)\nKontraposisi dari pernyataan \"Jika suatu bilangan habis dibagi 6, maka bilangan tersebut habis dibagi 2 dan habis dibagi 3\" adalah:\n\n[[A]] Jika suatu bilangan tidak habis dibagi 6, maka bilangan tersebut tidak habis dibagi 2 atau tidak habis dibagi 3.\n[[B]] Jika suatu bilangan habis dibagi 2 dan 3, maka bilangan tersebut habis dibagi 6.\n[[C]] Jika suatu bilangan tidak habis dibagi 2 atau tidak habis dibagi 3, maka bilangan tersebut tidak habis dibagi 6.\n[[D]] Jika suatu bilangan tidak habis dibagi 2 dan tidak habis dibagi 3, maka bilangan tersebut tidak habis dibagi 6.\n[[E]] Suatu bilangan habis dibagi 6 jika dan hanya jika habis dibagi 2 dan 3.\n\nANSWER: C\nDISCUSSION:\nKontraposisi dari $P \\rightarrow (Q \\land R)$ adalah $\\sim(Q \\land R) \\rightarrow \\sim P$, yang ekuivalen dengan $(\\sim Q \\lor \\sim R) \\rightarrow \\sim P$.\nLABELS: Logika, Kontraposisi, Penalaran Umum\n\n# Q16 (PILGAN)\nLima orang atlet (A, B, C, D, E) menempati garis finis dengan ketentuan:\n- B finis lebih cepat daripada D.\n- A finis lebih cepat daripada B tetapi lebih lambat daripada C.\n- E finis paling cepat di antara semuanya.\nUrutan pelari yang finis dari yang paling cepat ke paling lambat adalah:\n\n[[A]] E - C - A - B - D\n[[B]] E - A - C - B - D\n[[C]] C - E - A - B - D\n[[D]] E - C - B - A - D\n[[E]] E - B - A - C - D\n\nANSWER: A\nDISCUSSION:\nDari ketentuan: E paling cepat (1). C lebih cepat dari A. A lebih cepat dari B. B lebih cepat dari D. Urutan: E - C - A - B - D.\nLABELS: Logika Analitik, Penalaran Umum, Urutan\n\n# Q17 (PILGAN)\nJika $x$ adalah bilangan bulat genap positif dan $y$ adalah bilangan bulat ganjil positif, manakah dari ekspresi berikut yang PASTI menghasilkan bilangan ganjil?\n\n[[A]] $x \\cdot y$\n[[B]] $x + 2y$\n[[C]] $2x + y$\n[[D]] $x^2 + y^2 + 1$\n[[E]] $3x + 4y$\n\nANSWER: C\nDISCUSSION:\n$x$ genap, $y$ ganjil. $2x$ selalu genap. Genap + Ganjil = Ganjil. Jadi $2x + y$ pasti menghasilkan bilangan ganjil.\nLABELS: Teori Bilangan, Penalaran Kuantitatif\n\n# Q18 (PILGAN)\nPerhatikan barisan bilangan berikut:\n$3, 7, 15, 31, 63, \\dots$\nAngka berikutnya pada barisan tersebut adalah:\n\n[[A]] 95\n[[B]] 112\n[[C]] 127\n[[D]] 135\n[[E]] 144\n\nANSWER: C\nDISCUSSION:\nPola pertambahan: $+4, +8, +16, +32, \\dots$. Suku berikutnya adalah $63 + 64 = 127$.\nLABELS: Deret Angka, Pola Bilangan, Penalaran Kuantitatif\n\n# Q19 (PILGAN)\nPerhatikan barisan huruf berikut:\n$B, D, G, K, P, \\dots$\nHuruf berikutnya pada pola tersebut adalah:\n\n[[A]] S\n[[B]] T\n[[C]] U\n[[D]] V\n[[E]] W\n\nANSWER: D\nDISCUSSION:\nB (2), D (4), G (7), K (11), P (16). Selisih: $+2, +3, +4, +5$. Selisih berikutnya $+6 \\rightarrow 16 + 6 = 22$, yaitu huruf V.\nLABELS: Deret Huruf, Penalaran Umum\n\n# Q20 (PILGAN)\nHubungan analogi kata **KOMPAS : ARAH** setara dengan:\n\n[[A]] JAM : WAKTU\n[[B]] TERMOMETER : AIR\n[[C]] MIKROSKOP : CAHAYA\n[[D]] KALKULATOR : KERTAS\n[[E]] PETA : KENDARAAN\n\nANSWER: A\nDISCUSSION:\nKompas adalah instrumen pengukur/penunjuk arah. Jam adalah instrumen pengukur/penunjuk waktu.\nLABELS: Analogi Kata, Penalaran Umum\n\n# Q21 (PILGAN)\nJika persamaan kuadrat $x^2 - 7x + 10 = 0$ memiliki akar-akar $p$ dan $q$, berapakah nilai dari $p^2 + q^2$?\n\n[[A]] 29\n[[B]] 39\n[[C]] 49\n[[D]] 59\n[[E]] 69\n\nANSWER: A\nDISCUSSION:\nDari rumus Vieta: $p + q = 7$ dan $p \\cdot q = 10$.\n$p^2 + q^2 = (p + q)^2 - 2pq = 7^2 - 2(10) = 49 - 20 = 29$.\nLABELS: Matematika Dasar, Aljabar Kuadrat\n\n# Q22 (PILGAN)\nDiketahui sistem persamaan linear:\n$$2x + 3y = 13$$\n$$x - y = 4$$\nBerapakah nilai dari $x + 2y$?\n\n[[A]] 5\n[[B]] 6\n[[C]] 7\n[[D]] 8\n[[E]] 9\n\nANSWER: C\nDISCUSSION:\nDari pers (2): $x = y + 4$. Substitusikan ke pers (1): $2(y + 4) + 3y = 13 \\rightarrow 5y = 5 \\rightarrow y = 1, x = 5$.\nNilai $x + 2y = 5 + 2(1) = 7$.\nLABELS: Matematika Dasar, Sistem Persamaan Linear\n\n# Q23 (PILGAN)\nSebuah barang dijual dengan harga Rp180.000,00 setelah mendapatkan diskon sebesar 25%. Berapakah harga asli barang tersebut sebelum didiskon?\n\n[[A]] Rp210.000,00\n[[B]] Rp225.000,00\n[[C]] Rp240.000,00\n[[D]] Rp250.000,00\n[[E]] Rp260.000,00\n\nANSWER: C\nDISCUSSION:\nHarga jual $= 75\\% \\times \\text{Harga Asli} = 180.000$.\nHarga Asli $= 180.000 / 0,75 = 240.000$.\nLABELS: Aritmetika Sosial, Penalaran Kuantitatif\n\n# Q24 (PILGAN)\nRata-rata nilai ujian matematika dari 18 siswa adalah 75. Jika 2 orang siswa baru dengan nilai 85 dan 95 dimasukkan ke dalam kelompok tersebut, berapakah rata-rata nilai gabungan sekarang?\n\n[[A]] 75,5\n[[B]] 76,5\n[[C]] 77,0\n[[D]] 77,5\n[[E]] 78,0\n\nANSWER: B\nDISCUSSION:\nTotal nilai awal $= 18 \\times 75 = 1350$.\nTotal nilai baru $= 1350 + 85 + 95 = 1530$.\nBanyak siswa sekarang $= 18 + 2 = 20$.\nRata-rata baru $= 1530 / 20 = 76,5$.\nLABELS: Statistika, Rata-rata Gabungan\n\n# Q25 (PILGAN)\nSuatu pekerjaan dapat diselesaikan oleh 6 orang pekerja dalam waktu 15 hari. Jika pekerjaan tersebut harus diselesaikan dalam waktu 10 hari, berapa banyak pekerja tambahan yang dibutuhkan?\n\n[[A]] 2 orang\n[[B]] 3 orang\n[[C]] 4 orang\n[[D]] 5 orang\n[[E]] 9 orang\n\nANSWER: B\nDISCUSSION:\n$6 \\times 15 = N \\times 10 \\rightarrow 90 = 10N \\rightarrow N = 9$ orang.\nPekerja tambahan $= 9 - 6 = 3$ orang.\nLABELS: Perbandingan, Aritmetika\n\n# Q26 (PILGAN)\nJika fungsi $f(x) = 3x - 1$ dan $g(x) = x^2 + 2$, berapakah nilai komposisi $(g \\circ f)(2)$?\n\n[[A]] 25\n[[B]] 27\n[[C]] 29\n[[D]] 31\n[[E]] 33\n\nANSWER: B\nDISCUSSION:\n$f(2) = 3(2) - 1 = 5$.\n$(g \\circ f)(2) = g(5) = 5^2 + 2 = 27$.\nLABELS: Matematika, Fungsi Komposisi\n\n# Q27 (PILGAN)\nPanjang jari-jari sebuah lingkaran bertambah sebesar 20%. Berapakah persentase pertambahan luas lingkaran tersebut?\n\n[[A]] 20%\n[[B]] 40%\n[[C]] 44%\n[[D]] 50%\n[[E]] 54%\n\nANSWER: C\nDISCUSSION:\nLuas awal $L_1 = \\pi r^2$.\nLuas baru $L_2 = \\pi (1,2r)^2 = 1,44 \\pi r^2 = 1,44 L_1$.\nPertambahan luas $= 44\\%$.\nLABELS: Geometri, Persentase Luas\n\n# Q28 (PILGAN)\nBerapakah nilai dari $\\left(\\frac{1}{27}\\right)^{-\\frac{2}{3}}$?\n\n[[A]] 3\n[[B]] 6\n[[C]] 9\n[[D]] 18\n[[E]] 81\n\nANSWER: C\nDISCUSSION:\n$\\left(\\frac{1}{27}\\right)^{-\\frac{2}{3}} = (27)^{\\frac{2}{3}} = (3^3)^{\\frac{2}{3}} = 3^2 = 9$.\nLABELS: Eksponen, Aljabar\n\n# Q29 (PILGAN)\nDua dadu homogen bermata enam dilempar bersama-sama satu kali. Peluang munculnya jumlah kedua mata dadu sama dengan 8 adalah:\n\n[[A]] 3/36\n[[B]] 4/36\n[[C]] 5/36\n[[D]] 6/36\n[[E]] 7/36\n\nANSWER: C\nDISCUSSION:\nTitik sampel dengan jumlah 8: $(2,6), (3,5), (4,4), (5,3), (6,2)$, total 5 pasang dari 36 kemungkinan. Peluang $= 5/36$.\nLABELS: Peluang, Teori Probabilitas\n\n# Q30 (PILGAN)\nKeliling suatu persegi panjang adalah 40 cm. Jika panjangnya 4 cm lebih panjang dari lebarnya, berapakah luas persegi panjang tersebut?\n\n[[A]] 84 cm²\n[[B]] 96 cm²\n[[C]] 100 cm²\n[[D]] 104 cm²\n[[E]] 112 cm²\n\nANSWER: B\nDISCUSSION:\n$2(p + l) = 40 \\rightarrow p + l = 20$.\n$p = l + 4 \\rightarrow 2l + 4 = 20 \\rightarrow l = 8, p = 12$.\nLuas $= 12 \\times 8 = 96$ cm².\nLABELS: Geometri, Persegi Panjang\n\nSTIMULUS: english-marine-energy\n**Harnessing Ocean Kinetic Energy: A Frontier in Sustainable Power**\n\nThe relentless motion of Earth's oceans represents one of the most concentrated, predictable, and largely untapped reservoirs of clean energy on the planet. Unlike solar and wind generation, which are fundamentally intermittent and subject to rapid atmospheric shifts, ocean tidal cycles are governed by gravitational interactions among the Earth, Moon, and Sun. This celestial predictability enables utility operators to forecast electricity generation with mathematical precision months and even years in advance.\n\nCurrent marine energy conversion technologies primarily leverage two distinct dynamic regimes: tidal stream currents and surface wave oscillation. Tidal stream turbines, operating submerged beneath high-velocity marine straits, function analogously to underwater wind turbines, capturing the kinetic thrust of dense seawater. Because seawater is approximately 830 times denser than ambient air, a relatively compact hydrokinetic turbine can generate equivalent mechanical power to a much larger terrestrial wind installation at comparable fluid speeds.\n\nNevertheless, commercial-scale deployment faces formidable engineering and environmental hurdles. Subsea infrastructure must endure corrosive saline immersion, violent storm surges, and the biofouling accumulation of barnacles and macroalgae. Moreover, conservation marine biologists emphasize the imperative of monitoring ecological consequences, such as acoustic emissions disturbing marine mammal navigation and hydrodynamic alterations impacting coastal benthic habitats. Overcoming these impediments demands resilient biomimetic material engineering paired with rigorous environmental impact telemetry.\nEND_STIMULUS\n\n# Q31 (PILGAN)\nWhat is the primary advantage of ocean tidal energy over solar and wind energy mentioned in paragraph 1?\n\n[[A]] Lower manufacturing capital cost for subsea installations.\n[[B]] Highly predictable generation cycles governed by celestial gravitation.\n[[C]] Minimal physical footprint on coastal environments.\n[[D]] Total immunity from mechanical wear and corrosion.\n[[E]] Immediate global ubiquity in all freshwater ecosystems.\n\nANSWER: B\nDISCUSSION:\nParagraph 1 states that unlike intermittent solar and wind energy, tidal cycles are governed by celestial gravitational interactions, allowing electricity forecasts with mathematical precision months in advance.\nLABELS: Literasi Bahasa Inggris, Main Idea, Reading Comprehension\n\n# Q32 (PILGAN)\nAccording to paragraph 2, why can a compact underwater turbine produce power comparable to a larger terrestrial wind turbine?\n\n[[A]] Seawater moves at three times the speed of terrestrial wind currents.\n[[B]] Submerged marine generators are constructed using radioactive isotopes.\n[[C]] Seawater density is approximately 830 times greater than air density.\n[[D]] Tidal straits generate thermal energy through tectonic friction.\n[[E]] Deep ocean currents exhibit zero drag resistance.\n\nANSWER: C\nDISCUSSION:\nParagraph 2 explains that because seawater is roughly 830 times denser than air, a smaller turbine can harvest the same mechanical thrust as a much larger wind turbine.\nLABELS: Literasi Bahasa Inggris, Detail Inquiry\n\n# Q33 (PILGAN)\nThe word **\"formidable\"** in paragraph 3 is closest in meaning to:\n\n[[A]] Insignificant\n[[B]] Challenging and daunting\n[[C]] Easily resolvable\n[[D]] Obsolete\n[[E]] Theoretical\n\nANSWER: B\nDISCUSSION:\n'Formidable' means inspiring fear or respect through being impressively large, powerful, intense, or difficult. In this context, 'challenging and daunting' is the closest synonym.\nLABELS: Literasi Bahasa Inggris, Vocabulary in Context\n\n# Q34 (PILGAN)\nWhich of the following environmental concerns is explicitly raised by marine biologists in paragraph 3?\n\n[[A]] The depletion of oceanic dissolved oxygen levels.\n[[B]] Excessive heating of coastal surface water temperatures.\n[[C]] Acoustic emissions that disrupt marine mammal navigation.\n[[D]] Chemical contamination from turbine photovoltaic coatings.\n[[E]] Complete destruction of deep pelagic phytoplankton colonies.\n\nANSWER: C\nDISCUSSION:\nParagraph 3 mentions ecological concerns including 'acoustic emissions disturbing marine mammal navigation and hydrodynamic alterations impacting coastal benthic habitats'.\nLABELS: Literasi Bahasa Inggris, Detail Analysis\n\n# Q35 (PILGAN)\nWhat tone does the author adopt regarding the future of marine energy commercialization?\n\n[[A]] Cynical and dismissive\n[[B]] Recklessly optimistic\n[[C]] Objective and pragmatic\n[[D]] Sarcastic and skeptical\n[[E]] Indifferent and disinterested\n\nANSWER: C\nDISCUSSION:\nThe author presents both the clear advantages (high predictability, energy density) and the genuine technical/ecological challenges objectively and pragmatically.\nLABELS: Literasi Bahasa Inggris, Author Tone\nCLEAR_STIMULUS\n\n# Q36 (PILGAN)\nChoose the option that correctly completes the sentence:\n\"Had the meteorological department issued the warning earlier, the maritime fleet ______ in the harbor.\"\n\n[[A]] will remain\n[[B]] would have remained\n[[C]] would remain\n[[D]] has remained\n[[E]] had remained\n\nANSWER: B\nDISCUSSION:\nThis is a third conditional inversion (Past Unreal Conditional): 'Had + subject + past participle, subject + would have + past participle'.\nLABELS: Bahasa Inggris, Conditional Sentence\n\n# Q37 (PILGAN)\nChoose the sentence that displays correct subject-verb agreement:\n\n[[A]] Neither the lead researcher nor his assistants was present at the conference.\n[[B]] Each of the experimental samples were labeled with a unique cryptographic barcode.\n[[C]] The team of aerospace engineers has successfully completed the telemetry trial.\n[[D]] A collection of classical literature manuscripts are on display in the museum.\n[[E]] Either the sensors or the battery pack have malfunctioned during descent.\n\nANSWER: C\nDISCUSSION:\n'The team' is a singular collective noun functioning as a unit, taking the singular verb 'has completed'.\nLABELS: Bahasa Inggris, Subject-Verb Agreement\n\n# Q38 (PILGAN)\nWhich word best completes the blank in context?\n\"The pharmaceutical committee requested additional clinical trials to verify that the vaccine produced ______ antibodies without causing severe adverse reactions.\"\n\n[[A]] transient\n[[B]] potent\n[[C]] nominal\n[[D]] arbitrary\n[[E]] hazardous\n\nANSWER: B\nDISCUSSION:\n'Potent' means having great power, influence, or effect (producing strong/effective antibodies).\nLABELS: Bahasa Inggris, Vocabulary in Context\n\n# Q39 (PILGAN)\nIdentify the sentence containing a misplaced modifier:\n\n[[A]] Walking through the park at sunrise, the morning mist was refreshing.\n[[B]] While preparing for the exam, she summarized all key formulas in a notebook.\n[[C]] After graduating from university, he joined an international research consortium.\n[[D]] Because the rain was torrential, we postponed the field expedition.\n[[E]] Driven by scientific curiosity, Marie Curie discovered two radioactive elements.\n\nANSWER: A\nDISCUSSION:\nIn sentence A, 'Walking through the park at sunrise' modifies 'the morning mist', which cannot walk! This is a classic dangling modifier.\nLABELS: Bahasa Inggris, Modifier Error\n\n# Q40 (PILGAN)\nThe phrase **\"on the fence\"** in an idiom context signifies:\n\n[[A]] In an extremely hazardous situation\n[[B]] Undecided or hesitant between two options\n[[C]] Achieving total consensus\n[[D]] Operating beyond legal boundaries\n[[E]] Fully committed to a specific outcome\n\nANSWER: B\nDISCUSSION:\nThe idiom 'on the fence' means neutral, undecided, or unable to choose between two alternatives.\nLABELS: Bahasa Inggris, Idiomatic Expressions\n\n# Q41 (PILGAN)\nSuku ke-3 suatu barisan aritmetika adalah 11 dan suku ke-8 adalah 26. Berapakah jumlah 15 suku pertama barisan tersebut?\n\n[[A]] 345\n[[B]] 375\n[[C]] 390\n[[D]] 415\n[[E]] 435\n\nANSWER: C\nDISCUSSION:\n$U_3 = a + 2b = 11$, $U_8 = a + 7b = 26 \\rightarrow 5b = 15 \\rightarrow b = 3, a = 5$.\n$S_{15} = \\frac{15}{2}(2(5) + 14(3)) = 15 \\times 26 = 390$.\nLABELS: Barisan & Deret, Matematika\n\n# Q42 (PILGAN)\nDari 7 orang siswa berprestasi akan dipilih suatu tim delegasi olimpiade yang beranggotakan 3 orang. Berapa banyak susunan tim berbeda yang dapat dibentuk?\n\n[[A]] 21\n[[B]] 35\n[[C]] 42\n[[D]] 120\n[[E]] 210\n\nANSWER: B\nDISCUSSION:\n$$C(7, 3) = \\frac{7 \\times 6 \\times 5}{3 \\times 2 \\times 1} = 35$$.\nLABELS: Kombinatorika, Peluang\n\n# Q43 (PILGAN)\nSebuah kotak berisi 5 bola merah dan 3 bola biru. Jika diambil 2 bola sekaligus secara acak, berapakah peluang terambilnya 1 bola merah dan 1 bola biru?\n\n[[A]] 15/56\n[[B]] 15/28\n[[C]] 5/14\n[[D]] 3/8\n[[E]] 9/28\n\nANSWER: B\nDISCUSSION:\nTotal cara ambil 2 dari 8: $C(8,2) = 28$.\nCara ambil 1 merah & 1 biru: $C(5,1) \\times C(3,1) = 15$.\nPeluang $= 15/28$.\nLABELS: Peluang, Kombinasi\n\n# Q44 (PILGAN)\nBerapakah sisa pembagian dari $3^{2026}$ jika dibagi dengan 5?\n\n[[A]] 1\n[[B]] 2\n[[C]] 3\n[[D]] 4\n[[E]] 0\n\nANSWER: D\nDISCUSSION:\nPeriode sisa $3^n \\pmod 5$: $3, 4, 2, 1$ (panjang periode 4).\n$2026 = 4 \\times 506 + 2$. Sisa sama dengan $3^2 = 9 \\equiv 4 \\pmod 5$.\nLABELS: Teori Bilangan, Aritmetika Modulo\n\n# Q45 (PILGAN)\nSuatu tangki air memiliki dua pipa pengisi. Pipa A dapat mengisi tangki hingga penuh dalam waktu 4 jam, sedangkan Pipa B dapat mengisi penuh dalam waktu 6 jam. Jika kedua pipa dibuka bersamaan, berapa waktu yang dibutuhkan untuk mengisi tangki tersebut hingga penuh?\n\n[[A]] 2 jam 12 menit\n[[B]] 2 jam 24 menit\n[[C]] 2 jam 30 menit\n[[D]] 2 jam 40 menit\n[[E]] 3 jam\n\nANSWER: B\nDISCUSSION:\nLaju gabungan: $1/4 + 1/6 = 5/12$ tangki/jam. Waktu $= 12/5 = 2,4$ jam $= 2$ jam 24 menit.\nLABELS: Aritmetika, Laju Alir\n\n# Q46 (PILGAN)\nPersamaan garis singgung pada kurva $y = 2x^2 - 3x + 1$ di titik dengan absis $x = 2$ adalah:\n\n[[A]] $y = 5x - 7$\n[[B]] $y = 5x + 3$\n[[C]] $y = 7x - 11$\n[[D]] $y = 3x - 3$\n[[E]] $y = 4x - 5$\n\nANSWER: A\nDISCUSSION:\n$x = 2 \\rightarrow y = 2(4) - 6 + 1 = 3$. Titik $(2, 3)$.\n$m = y' = 4x - 3 = 4(2) - 3 = 5$.\n$y - 3 = 5(x - 2) \\rightarrow y = 5x - 7$.\nLABELS: Kalkulus, Garis Singgung Kurva\n\n# Q47 (PILGAN)\nPerhatikan data terurut berikut:\n$4, 6, 7, x, 11, 14, 19$\nJika median dari kumpulan data tersebut adalah 9, berapakah nilai rata-rata (*mean*) dari ketujuh bilangan tersebut?\n\n[[A]] 9,0\n[[B]] 9,5\n[[C]] 10,0\n[[D]] 10,5\n[[E]] 11,0\n\nANSWER: C\nDISCUSSION:\nMedian data ke-4 adalah $x = 9$.\nTotal $= 4 + 6 + 7 + 9 + 11 + 14 + 19 = 70$.\nRata-rata $= 70 / 7 = 10,0$.\nLABELS: Statistika, Ukuran Pemusatan\n\n# Q48 (PILGAN)\nJika $\\log_2 3 = a$ dan $\\log_3 5 = b$, maka nilai dari $\\log_6 15$ dinyatakan dalam $a$ dan $b$ adalah:\n\n[[A]] $\\frac{a + b}{1 + a}$\n[[B]] $\\frac{a(1 + b)}{1 + a}$\n[[C]] $\\frac{1 + ab}{1 + a}$\n[[D]] $\\frac{a + ab}{a + 1}$\n[[E]] $\\frac{b(1 + a)}{1 + b}$\n\nANSWER: B\nDISCUSSION:\n$\\log_6 15 = \\frac{\\log_2 15}{\\log_2 6} = \\frac{\\log_2 3 + \\log_2 5}{1 + \\log_2 3} = \\frac{a + ab}{1 + a} = \\frac{a(1 + b)}{1 + a}$.\nLABELS: Logaritma, Aljabar\n\n# Q49 (PILGAN)\nHimpunan penyelesaian dari pertidaksamaan $|2x - 5| \\le 7$ adalah:\n\n[[A]] $-1 \\le x \\le 6$\n[[B]] $x \\le -1$ atau $x \\ge 6$\n[[C]] $1 \\le x \\le 7$\n[[D]] $-6 \\le x \\le 1$\n[[E]] $-2 \\le x \\le 5$\n\nANSWER: A\nDISCUSSION:\n$-7 \\le 2x - 5 \\le 7 \\rightarrow -2 \\le 2x \\le 12 \\rightarrow -1 \\le x \\le 6$.\nLABELS: Nilai Mutlak, Pertidaksamaan\n\n# Q50 (ESSAY)\nSebuah perusahaan manufaktur memproduksi $x$ unit barang per hari dengan fungsi biaya total:\n$$C(x) = 2x^2 + 40x + 1800$$\n(dalam ribuan rupiah). Setiap unit barang dijual dengan harga pasar tetap sebesar $Rp200.000,00$ ($200$ ribu rupiah).\nTentukan:\na) Fungsi keuntungan total $P(x)$.\nb) Jumlah produksi harian $x$ yang memaksimumkan keuntungan.\nc) Nilai keuntungan maksimum yang dapat dicapai perusahaan tersebut!\n\nANSWER: ESSAY\nDISCUSSION:\na) Pendapatan $R(x) = 200x$. Keuntungan $P(x) = 200x - (2x^2 + 40x + 1800) = -2x^2 + 160x - 1800$.\nb) $P'(x) = -4x + 160 = 0 \\rightarrow x = 40$ unit/hari.\nc) Keuntungan maksimum: $P(40) = -2(1600) + 6400 - 1800 = 1400$ ribu rupiah (Rp1.400.000,00 per hari).\nLABELS: Matematika, Optimasi Ekonomi, Kalkulus Terapan",
    duration_minutes: 75,
    start_at: null,
    end_at: null,
    passing_grade: 70,
    show_answer: true,
    immediate_feedback: false,
    enable_tip_penalty: false,
    penalty_theory_config: '10, 15, 20',
    penalty_practice_config: '15, 20, 25',
    created_by: 'Admin',
    created_at: '2026-02-01T08:00:00.000Z'
  },
  {
    id: 'mock-test-2',
    title: 'Kuis Penalaran Umum & Logika Proposisional (50 Soal)',
    description: 'Tes pemahaman logika formal, implikasi kebenaran matematika, dan penalaran analitis.',
    raw_markdown: "STIMULUS: literasi-indo-ai\n**Transformasi Kecerdasan Buatan dan Literasi Kritis dalam Pendidikan Abad 21**\n\nIntegrasi kecerdasan buatan (Artificial Intelligence/AI) ke dalam sektor pendidikan telah membuka dimensi baru dalam pedagogi modern. Sistem pembelajaran adaptif berbasis algoritma generatif memungkinkan kurikulum disesuaikan dengan ritme kognitif individual tiap peserta didik. Model ini mampu mendeteksi kesenjangan pemahaman secara *real-time*, memberikan umpan balik diagnostik instan, serta memangkas beban administratif pengajar hingga 40%. Namun, lompatan teknologi ini memicu perdebatan epistemologis mengenai peran esensial manusia dalam proses transmisi pengetahuan.\n\nKritikus berargumen bahwa ketergantungan berlebih terhadap model bahasa besar (Large Language Models) berisiko mendegradasi kemampuan bernalar mandiri dan daya analisis kritis siswa. Fenomena *cognitive offloading*—kecenderungan mendelegasikan tugas pemecahan masalah yang rumit ke mesin cerdas—berpotensi menghasilkan generasi yang piawai mengonsumsi sintesis informasi, tetapi rapuh dalam memverifikasi validitas data primer. Di samping itu, bias inheren pada korpus data latih berpotensi memperkuat misinformasi dan stereotip sosial budaya.\n\nOleh karena itu, institusi pendidikan dituntut untuk menggeser paradigma pengajaran dari sekadar transfer fakta menuju penguasaan literasi digital kritis (*critical algorithmic literacy*). Peserta didik tidak hanya dituntut mampu berinteraksi dengan AI secara produktif, melainkan wajib memiliki kecakapan dalam mendekonstruksi bias algoritma, menguji logika inferensi model, dan menegakkan integritas akademik. Masa depan pendidikan tidak ditentukan oleh adopsi teknologi semata, melainkan oleh sintesis harmonis antara efisiensi kecerdasan artifisial dan kedalaman kebijaksanaan humanistik.\nEND_STIMULUS\n\n# Q1 (PILGAN)\nBerdasarkan paragraf pertama, apakah manfaat utama integrasi kecerdasan buatan dalam proses pembelajaran?\n\n[[A]] Menggantikan peran guru sepenuhnya dalam memberikan instruksi di dalam kelas.\n[[B]] Menstandarisasi kecepatan belajar seluruh siswa agar mencapai target kurikulum yang seragam.\n[[C]] Menyesuaikan materi dengan ritme kognitif individual dan mengurangi beban administratif pengajar.\n[[D]] Memastikan seluruh siswa lulus ujian kelulusan dengan nilai di atas KKM secara otomatis.\n[[E]] Menghilangkan kebutuhan evaluasi diagnostik berkala oleh institusi sekolah.\n\nANSWER: C\nDISCUSSION:\nParagraf pertama secara eksplisit menyatakan bahwa sistem pembelajaran adaptif berbasis AI memungkinkan kurikulum disesuaikan dengan ritme kognitif individual dan memangkas beban administratif pengajar hingga 40%.\nLABELS: Literasi Bahasa Indonesia, SNBT, Gagasan Utama\n\n# Q2 (PILGAN)\nIstilah *cognitive offloading* dalam konteks bacaan di atas merujuk pada:\n\n[[A]] Kelelahan mental yang dialami pengajar akibat penggunaan perangkat digital secara intensif.\n[[B]] Kecenderungan siswa mendelegasikan proses pemecahan masalah rumit ke mesin cerdas.\n[[C]] Proses penghapusan data memori yang tidak relevan dari pusat penyimpanan peladen cloud.\n[[D]] Peningkatan kapasitas otak manusia setelah berkolaborasi secara intensif dengan teknologi AI.\n[[E]] Penurunan daya ingat jangka pendek akibat paparan radiasi layar komputer.\n\nANSWER: B\nDISCUSSION:\nParagraf kedua mendefinisikan fenomena *cognitive offloading* sebagai kecenderungan mendelegasikan tugas pemecahan masalah yang rumit ke mesin cerdas, yang berpotensi melemahkan penalaran mandiri.\nLABELS: Literasi Bahasa Indonesia, SNBT, Makna Kontekstual\n\n# Q3 (PILGAN)\nPernyataan manakah yang PALING SESUAI dengan pandangan penulis mengenai masa depan pendidikan di era AI?\n\n[[A]] Pembatasan ketat penggunaan perangkat komputasi di lingkungan sekolah formal.\n[[B]] Penggantian kurikulum humaniora dengan mata pelajaran ilmu komputer terapan secara menyeluruh.\n[[C]] Penyerahan seluruh perancangan silabus pendidikan kepada algoritma model bahasa besar.\n[[D]] Perpaduan harmonis antara efisiensi kecerdasan buatan dan literasi kritis humanistik.\n[[E]] Keyakinan bahwa AI akan menurunkan kualitas seluruh lulusan perguruan tinggi di masa depan.\n\nANSWER: D\nDISCUSSION:\nKalimat terakhir paragraf ketiga menyatakan bahwa masa depan pendidikan ditentukan oleh 'sintesis harmonis antara efisiensi kecerdasan artifisial dan kedalaman kebijaksanaan humanistik'.\nLABELS: Literasi Bahasa Indonesia, SNBT, Simpulan Teks\n\n# Q4 (PILGAN)\nBerdasarkan bacaan, bahaya laten yang muncul akibat bias pada korpus data latih model AI adalah:\n\n[[A]] Terjadinya kegagalan perangkat keras komputasi server sekolah.\n[[B]] Penguatan misinformasi dan pelestarian stereotip sosial budaya di masyarakat.\n[[C]] Meningkatnya biaya lisensi perangkat lunak pendidikan berbayar.\n[[D]] Penurunan drastis kecepatan akses internet pita lebar nasional.\n[[E]] Ketidakmampuan AI dalam memproses perintah bahasa Indonesia baku.\n\nANSWER: B\nDISCUSSION:\nParagraf kedua menyebutkan bahwa bias inheren pada korpus data latih AI berpotensi memperkuat misinformasi dan stereotip sosial budaya.\nLABELS: Literasi Bahasa Indonesia, SNBT, Analisis Detail\n\n# Q5 (PILGAN)\nSikap kritis yang diharapkan dimiliki siswa dalam era literasi algoritmik (*critical algorithmic literacy*) adalah:\n\n[[A]] Menolak segala bentuk penggunaan teknologi berbasis internet dalam belajar.\n[[B]] Menghafal seluruh baris kode pembuat model bahasa cerdas.\n[[C]] Mampu mendekonstruksi bias algoritma dan memverifikasi validitas data primer.\n[[D]] Mempercayai seluruh hasil pencarian mesin cerdas tanpa perlu melakukan pengecekan ulang.\n[[E]] Menggunakan AI secara rahasia tanpa mencantumkan atribusi akademik.\n\nANSWER: C\nDISCUSSION:\nParagraf ketiga menjelaskan bahwa siswa diharapkan memiliki kecakapan mendekonstruksi bias algoritma, menguji logika inferensi model, dan menegakkan integritas data primer.\nLABELS: Literasi Bahasa Indonesia, SNBT, Evaluasi Teks\nCLEAR_STIMULUS\n\n# Q6 (PILGAN)\nPerhatikan kalimat berikut:\n\"Pemerintah berupaya menaikkan standar mutu pendidikan *dimana* hal tersebut membutuhkan alokasi dana yang terencana.\"\nPerbaikan yang tepat untuk kata yang dicetak miring agar menjadi kalimat efektif adalah:\n\n[[A]] yang mana\n[[B]] di mana\n[[C]] sehingga\n[[D]] oleh karena\n[[E]] dan\n\nANSWER: C\nDISCUSSION:\nKata 'dimana' adalah kata tanya tempat dan tidak boleh digunakan sebagai kata penghubung antarklausa. Konjungsi yang tepat untuk menyatakan hubungan akibat/penjelasan adalah 'sehingga'.\nLABELS: Tata Bahasa, Kalimat Efektif, PUEBI\n\n# Q7 (PILGAN)\nPenulisan gabungan kata berikut ini yang TIDAK BAKU menurut Pedoman Umum Ejaan Bahasa Indonesia (PUEBI) adalah:\n\n[[A]] pascasarjana\n[[B]] antarkota\n[[C]] non-pemerintah\n[[D]] sub-bagian\n[[E]] tunaaksara\n\nANSWER: D\nDISCUSSION:\nBentuk terikat 'sub-' ditulis serangkai tanpa tanda hubung jika bertemu kata berhuruf kecil yang bukan singkatan/istilah asing, sehingga bentuk bakunya adalah 'subbagian'.\nLABELS: Tata Bahasa, Ejaan, PUEBI\n\n# Q8 (PILGAN)\nSinonim yang paling tepat untuk kata **KOMPREHENSIF** adalah:\n\n[[A]] Menyeluruh dan mendalam\n[[B]] Cepat dan singkat\n[[C]] Eksklusif dan terbatas\n[[D]] Bertahap dan perlahan\n[[E]] Sederhana dan terpadu\n\nANSWER: A\nDISCUSSION:\nMenurut KBBI, komprehensif berarti bersifat mampu menangkap (menerima) dengan baik; luas dan lengkap (tentang ruang lingkup atau isi); menyeluruh.\nLABELS: Kosakata, Sinonim, Penalaran Umum\n\n# Q9 (PILGAN)\nAntonim yang paling tepat untuk kata **SPORADIS** adalah:\n\n[[A]] Jarang\n[[B]] Berkelanjutan\n[[C]] Meluas\n[[D]] Tiba-tiba\n[[E]] Terpencil\n\nANSWER: B\nDISCUSSION:\nSporadis berarti keadaan yang jarang terjadi atau tersebar secara tidak menentu. Lawan kata yang tepat adalah teratur atau berkelanjutan (kontinu).\nLABELS: Kosakata, Antonim, Penalaran Umum\n\n# Q10 (PILGAN)\nKalimat manakah yang memiliki susunan subjek, predikat, objek, dan keterangan (S-P-O-K) yang lengkap dan tepat?\n\n[[A]] Di perpustakaan kota kemarin siang.\n[[B]] Para mahasiswa mengkaji dampak kecerdasan buatan di ruang seminar.\n[[C]] Telah dipelajari secara mendalam teori kuantum modern.\n[[D]] Peneliti yang berprestasi tinggi dari universitas terkemuka.\n[[E]] Membaca buku teks sains dengan cermat dan teliti.\n\nANSWER: B\nDISCUSSION:\nSubjek: 'Para mahasiswa', Predikat: 'mengkaji', Objek: 'dampak kecerdasan buatan', Keterangan: 'di ruang seminar'.\nLABELS: Tata Bahasa, Struktur Kalimat, Sintaksis\n\n# Q11 (PILGAN)\nPremis 1: Jika cuaca mendung dan angin berhembus kencang, maka hujan akan turun lebat.\nPremis 2: Hari ini hujan tidak turun lebat.\nKesimpulan yang sah menurut hukum Modus Tollens adalah:\n\n[[A]] Hari ini cuaca cerah tanpa angin.\n[[B]] Cuaca tidak mendung atau angin tidak berhembus kencang.\n[[C]] Cuaca mendung tetapi angin tidak berhembus kencang.\n[[D]] Angin bertiup sangat kencang sepanjang hari.\n[[E]] Hujan akan turun lebat pada malam hari.\n\nANSWER: B\nDISCUSSION:\nPernyataan $P \\land Q \\rightarrow R$. Diketahui $\\sim R$. Dengan modus tollens diperoleh $\\sim(P \\land Q)$, yang menurut hukum De Morgan ekuivalen dengan $\\sim P \\lor \\sim Q$ (Cuaca tidak mendung atau angin tidak berhembus kencang).\nLABELS: Logika, Modus Tollens, Penalaran Umum\n\n# Q12 (PILGAN)\nSemua ilmuwan memiliki rasa ingin tahu yang tinggi. Sebagian ilmuwan menyukai musik klasik.\nKesimpulan yang tepat dari kedua premis di atas adalah:\n\n[[A]] Semua orang yang menyukai musik klasik adalah ilmuwan.\n[[B]] Semua yang memiliki rasa ingin tahu tinggi menyukai musik klasik.\n[[C]] Sebagian orang yang memiliki rasa ingin tahu tinggi menyukai musik klasik.\n[[D]] Tidak ada penyuka musik klasik yang bukan ilmuwan.\n[[E]] Sebagian ilmuwan tidak memiliki rasa ingin tahu yang tinggi.\n\nANSWER: C\nDISCUSSION:\nKarena sebagian ilmuwan menyukai musik klasik dan setiap ilmuwan memiliki rasa ingin tahu tinggi, maka pasti ada sebagian orang yang memiliki rasa ingin tahu tinggi yang menyukai musik klasik.\nLABELS: Logika, Silogisme, Penalaran Umum\n\n# Q13 (PILGAN)\nNegasi dari proposisi majemuk \"Hari ini tidak hujan dan lalu lintas lancar\" adalah:\n\n[[A]] Hari ini hujan dan lalu lintas macet.\n[[B]] Hari ini hujan atau lalu lintas tidak lancar.\n[[C]] Hari ini tidak hujan atau lalu lintas macet.\n[[D]] Jika hari ini hujan maka lalu lintas lancar.\n[[E]] Hari ini cerah serta lalu lintas ramai lancar.\n\nANSWER: B\nDISCUSSION:\nBentuk awal $\\sim P \\land Q$. Negasinya adalah $\\sim(\\sim P \\land Q) \\equiv P \\lor \\sim Q$ (Hari ini hujan atau lalu lintas tidak lancar).\nLABELS: Logika, De Morgan, Penalaran Umum\n\n# Q14 (PILGAN)\nJika pernyataan \"Semua peserta seminar wajib membawa kartu identitas\" bernilai SALAH, maka pernyataan manakah yang PASTI bernilai BENAR?\n\n[[A]] Tidak ada peserta seminar yang membawa kartu identitas.\n[[B]] Semua peserta seminar tidak membawa kartu identitas.\n[[C]] Ada peserta seminar yang tidak membawa kartu identitas.\n[[D]] Sebagian peserta seminar membawa kartu identitas ganda.\n[[E]] Panitia seminar melarang peserta membawa kartu identitas.\n\nANSWER: C\nDISCUSSION:\nPernyataan universal bernilai salah jika dan hanya jika negasinya (proposisi partikular negatif) bernilai benar: $\\sim(\\forall x, P(x)) \\equiv \\exists x, \\sim P(x)$ (\"Ada/sebagian peserta yang tidak membawa kartu identitas\").\nLABELS: Logika, Kuantor, Penalaran Umum\n\n# Q15 (PILGAN)\nKontraposisi dari pernyataan \"Jika suatu bilangan habis dibagi 6, maka bilangan tersebut habis dibagi 2 dan habis dibagi 3\" adalah:\n\n[[A]] Jika suatu bilangan tidak habis dibagi 6, maka bilangan tersebut tidak habis dibagi 2 atau tidak habis dibagi 3.\n[[B]] Jika suatu bilangan habis dibagi 2 dan 3, maka bilangan tersebut habis dibagi 6.\n[[C]] Jika suatu bilangan tidak habis dibagi 2 atau tidak habis dibagi 3, maka bilangan tersebut tidak habis dibagi 6.\n[[D]] Jika suatu bilangan tidak habis dibagi 2 dan tidak habis dibagi 3, maka bilangan tersebut tidak habis dibagi 6.\n[[E]] Suatu bilangan habis dibagi 6 jika dan hanya jika habis dibagi 2 dan 3.\n\nANSWER: C\nDISCUSSION:\nKontraposisi dari $P \\rightarrow (Q \\land R)$ adalah $\\sim(Q \\land R) \\rightarrow \\sim P$, yang ekuivalen dengan $(\\sim Q \\lor \\sim R) \\rightarrow \\sim P$.\nLABELS: Logika, Kontraposisi, Penalaran Umum\n\n# Q16 (PILGAN)\nLima orang atlet (A, B, C, D, E) menempati garis finis dengan ketentuan:\n- B finis lebih cepat daripada D.\n- A finis lebih cepat daripada B tetapi lebih lambat daripada C.\n- E finis paling cepat di antara semuanya.\nUrutan pelari yang finis dari yang paling cepat ke paling lambat adalah:\n\n[[A]] E - C - A - B - D\n[[B]] E - A - C - B - D\n[[C]] C - E - A - B - D\n[[D]] E - C - B - A - D\n[[E]] E - B - A - C - D\n\nANSWER: A\nDISCUSSION:\nDari ketentuan: E paling cepat (1). C lebih cepat dari A. A lebih cepat dari B. B lebih cepat dari D. Urutan: E - C - A - B - D.\nLABELS: Logika Analitik, Penalaran Umum, Urutan\n\n# Q17 (PILGAN)\nJika $x$ adalah bilangan bulat genap positif dan $y$ adalah bilangan bulat ganjil positif, manakah dari ekspresi berikut yang PASTI menghasilkan bilangan ganjil?\n\n[[A]] $x \\cdot y$\n[[B]] $x + 2y$\n[[C]] $2x + y$\n[[D]] $x^2 + y^2 + 1$\n[[E]] $3x + 4y$\n\nANSWER: C\nDISCUSSION:\n$x$ genap, $y$ ganjil. $2x$ selalu genap. Genap + Ganjil = Ganjil. Jadi $2x + y$ pasti menghasilkan bilangan ganjil.\nLABELS: Teori Bilangan, Penalaran Kuantitatif\n\n# Q18 (PILGAN)\nPerhatikan barisan bilangan berikut:\n$3, 7, 15, 31, 63, \\dots$\nAngka berikutnya pada barisan tersebut adalah:\n\n[[A]] 95\n[[B]] 112\n[[C]] 127\n[[D]] 135\n[[E]] 144\n\nANSWER: C\nDISCUSSION:\nPola pertambahan: $+4, +8, +16, +32, \\dots$. Suku berikutnya adalah $63 + 64 = 127$.\nLABELS: Deret Angka, Pola Bilangan, Penalaran Kuantitatif\n\n# Q19 (PILGAN)\nPerhatikan barisan huruf berikut:\n$B, D, G, K, P, \\dots$\nHuruf berikutnya pada pola tersebut adalah:\n\n[[A]] S\n[[B]] T\n[[C]] U\n[[D]] V\n[[E]] W\n\nANSWER: D\nDISCUSSION:\nB (2), D (4), G (7), K (11), P (16). Selisih: $+2, +3, +4, +5$. Selisih berikutnya $+6 \\rightarrow 16 + 6 = 22$, yaitu huruf V.\nLABELS: Deret Huruf, Penalaran Umum\n\n# Q20 (PILGAN)\nHubungan analogi kata **KOMPAS : ARAH** setara dengan:\n\n[[A]] JAM : WAKTU\n[[B]] TERMOMETER : AIR\n[[C]] MIKROSKOP : CAHAYA\n[[D]] KALKULATOR : KERTAS\n[[E]] PETA : KENDARAAN\n\nANSWER: A\nDISCUSSION:\nKompas adalah instrumen pengukur/penunjuk arah. Jam adalah instrumen pengukur/penunjuk waktu.\nLABELS: Analogi Kata, Penalaran Umum\n\n# Q21 (PILGAN)\nJika persamaan kuadrat $x^2 - 7x + 10 = 0$ memiliki akar-akar $p$ dan $q$, berapakah nilai dari $p^2 + q^2$?\n\n[[A]] 29\n[[B]] 39\n[[C]] 49\n[[D]] 59\n[[E]] 69\n\nANSWER: A\nDISCUSSION:\nDari rumus Vieta: $p + q = 7$ dan $p \\cdot q = 10$.\n$p^2 + q^2 = (p + q)^2 - 2pq = 7^2 - 2(10) = 49 - 20 = 29$.\nLABELS: Matematika Dasar, Aljabar Kuadrat\n\n# Q22 (PILGAN)\nDiketahui sistem persamaan linear:\n$$2x + 3y = 13$$\n$$x - y = 4$$\nBerapakah nilai dari $x + 2y$?\n\n[[A]] 5\n[[B]] 6\n[[C]] 7\n[[D]] 8\n[[E]] 9\n\nANSWER: C\nDISCUSSION:\nDari pers (2): $x = y + 4$. Substitusikan ke pers (1): $2(y + 4) + 3y = 13 \\rightarrow 5y = 5 \\rightarrow y = 1, x = 5$.\nNilai $x + 2y = 5 + 2(1) = 7$.\nLABELS: Matematika Dasar, Sistem Persamaan Linear\n\n# Q23 (PILGAN)\nSebuah barang dijual dengan harga Rp180.000,00 setelah mendapatkan diskon sebesar 25%. Berapakah harga asli barang tersebut sebelum didiskon?\n\n[[A]] Rp210.000,00\n[[B]] Rp225.000,00\n[[C]] Rp240.000,00\n[[D]] Rp250.000,00\n[[E]] Rp260.000,00\n\nANSWER: C\nDISCUSSION:\nHarga jual $= 75\\% \\times \\text{Harga Asli} = 180.000$.\nHarga Asli $= 180.000 / 0,75 = 240.000$.\nLABELS: Aritmetika Sosial, Penalaran Kuantitatif\n\n# Q24 (PILGAN)\nRata-rata nilai ujian matematika dari 18 siswa adalah 75. Jika 2 orang siswa baru dengan nilai 85 dan 95 dimasukkan ke dalam kelompok tersebut, berapakah rata-rata nilai gabungan sekarang?\n\n[[A]] 75,5\n[[B]] 76,5\n[[C]] 77,0\n[[D]] 77,5\n[[E]] 78,0\n\nANSWER: B\nDISCUSSION:\nTotal nilai awal $= 18 \\times 75 = 1350$.\nTotal nilai baru $= 1350 + 85 + 95 = 1530$.\nBanyak siswa sekarang $= 18 + 2 = 20$.\nRata-rata baru $= 1530 / 20 = 76,5$.\nLABELS: Statistika, Rata-rata Gabungan\n\n# Q25 (PILGAN)\nSuatu pekerjaan dapat diselesaikan oleh 6 orang pekerja dalam waktu 15 hari. Jika pekerjaan tersebut harus diselesaikan dalam waktu 10 hari, berapa banyak pekerja tambahan yang dibutuhkan?\n\n[[A]] 2 orang\n[[B]] 3 orang\n[[C]] 4 orang\n[[D]] 5 orang\n[[E]] 9 orang\n\nANSWER: B\nDISCUSSION:\n$6 \\times 15 = N \\times 10 \\rightarrow 90 = 10N \\rightarrow N = 9$ orang.\nPekerja tambahan $= 9 - 6 = 3$ orang.\nLABELS: Perbandingan, Aritmetika\n\n# Q26 (PILGAN)\nJika fungsi $f(x) = 3x - 1$ dan $g(x) = x^2 + 2$, berapakah nilai komposisi $(g \\circ f)(2)$?\n\n[[A]] 25\n[[B]] 27\n[[C]] 29\n[[D]] 31\n[[E]] 33\n\nANSWER: B\nDISCUSSION:\n$f(2) = 3(2) - 1 = 5$.\n$(g \\circ f)(2) = g(5) = 5^2 + 2 = 27$.\nLABELS: Matematika, Fungsi Komposisi\n\n# Q27 (PILGAN)\nPanjang jari-jari sebuah lingkaran bertambah sebesar 20%. Berapakah persentase pertambahan luas lingkaran tersebut?\n\n[[A]] 20%\n[[B]] 40%\n[[C]] 44%\n[[D]] 50%\n[[E]] 54%\n\nANSWER: C\nDISCUSSION:\nLuas awal $L_1 = \\pi r^2$.\nLuas baru $L_2 = \\pi (1,2r)^2 = 1,44 \\pi r^2 = 1,44 L_1$.\nPertambahan luas $= 44\\%$.\nLABELS: Geometri, Persentase Luas\n\n# Q28 (PILGAN)\nBerapakah nilai dari $\\left(\\frac{1}{27}\\right)^{-\\frac{2}{3}}$?\n\n[[A]] 3\n[[B]] 6\n[[C]] 9\n[[D]] 18\n[[E]] 81\n\nANSWER: C\nDISCUSSION:\n$\\left(\\frac{1}{27}\\right)^{-\\frac{2}{3}} = (27)^{\\frac{2}{3}} = (3^3)^{\\frac{2}{3}} = 3^2 = 9$.\nLABELS: Eksponen, Aljabar\n\n# Q29 (PILGAN)\nDua dadu homogen bermata enam dilempar bersama-sama satu kali. Peluang munculnya jumlah kedua mata dadu sama dengan 8 adalah:\n\n[[A]] 3/36\n[[B]] 4/36\n[[C]] 5/36\n[[D]] 6/36\n[[E]] 7/36\n\nANSWER: C\nDISCUSSION:\nTitik sampel dengan jumlah 8: $(2,6), (3,5), (4,4), (5,3), (6,2)$, total 5 pasang dari 36 kemungkinan. Peluang $= 5/36$.\nLABELS: Peluang, Teori Probabilitas\n\n# Q30 (PILGAN)\nKeliling suatu persegi panjang adalah 40 cm. Jika panjangnya 4 cm lebih panjang dari lebarnya, berapakah luas persegi panjang tersebut?\n\n[[A]] 84 cm²\n[[B]] 96 cm²\n[[C]] 100 cm²\n[[D]] 104 cm²\n[[E]] 112 cm²\n\nANSWER: B\nDISCUSSION:\n$2(p + l) = 40 \\rightarrow p + l = 20$.\n$p = l + 4 \\rightarrow 2l + 4 = 20 \\rightarrow l = 8, p = 12$.\nLuas $= 12 \\times 8 = 96$ cm².\nLABELS: Geometri, Persegi Panjang\n\nSTIMULUS: english-marine-energy\n**Harnessing Ocean Kinetic Energy: A Frontier in Sustainable Power**\n\nThe relentless motion of Earth's oceans represents one of the most concentrated, predictable, and largely untapped reservoirs of clean energy on the planet. Unlike solar and wind generation, which are fundamentally intermittent and subject to rapid atmospheric shifts, ocean tidal cycles are governed by gravitational interactions among the Earth, Moon, and Sun. This celestial predictability enables utility operators to forecast electricity generation with mathematical precision months and even years in advance.\n\nCurrent marine energy conversion technologies primarily leverage two distinct dynamic regimes: tidal stream currents and surface wave oscillation. Tidal stream turbines, operating submerged beneath high-velocity marine straits, function analogously to underwater wind turbines, capturing the kinetic thrust of dense seawater. Because seawater is approximately 830 times denser than ambient air, a relatively compact hydrokinetic turbine can generate equivalent mechanical power to a much larger terrestrial wind installation at comparable fluid speeds.\n\nNevertheless, commercial-scale deployment faces formidable engineering and environmental hurdles. Subsea infrastructure must endure corrosive saline immersion, violent storm surges, and the biofouling accumulation of barnacles and macroalgae. Moreover, conservation marine biologists emphasize the imperative of monitoring ecological consequences, such as acoustic emissions disturbing marine mammal navigation and hydrodynamic alterations impacting coastal benthic habitats. Overcoming these impediments demands resilient biomimetic material engineering paired with rigorous environmental impact telemetry.\nEND_STIMULUS\n\n# Q31 (PILGAN)\nWhat is the primary advantage of ocean tidal energy over solar and wind energy mentioned in paragraph 1?\n\n[[A]] Lower manufacturing capital cost for subsea installations.\n[[B]] Highly predictable generation cycles governed by celestial gravitation.\n[[C]] Minimal physical footprint on coastal environments.\n[[D]] Total immunity from mechanical wear and corrosion.\n[[E]] Immediate global ubiquity in all freshwater ecosystems.\n\nANSWER: B\nDISCUSSION:\nParagraph 1 states that unlike intermittent solar and wind energy, tidal cycles are governed by celestial gravitational interactions, allowing electricity forecasts with mathematical precision months in advance.\nLABELS: Literasi Bahasa Inggris, Main Idea, Reading Comprehension\n\n# Q32 (PILGAN)\nAccording to paragraph 2, why can a compact underwater turbine produce power comparable to a larger terrestrial wind turbine?\n\n[[A]] Seawater moves at three times the speed of terrestrial wind currents.\n[[B]] Submerged marine generators are constructed using radioactive isotopes.\n[[C]] Seawater density is approximately 830 times greater than air density.\n[[D]] Tidal straits generate thermal energy through tectonic friction.\n[[E]] Deep ocean currents exhibit zero drag resistance.\n\nANSWER: C\nDISCUSSION:\nParagraph 2 explains that because seawater is roughly 830 times denser than air, a smaller turbine can harvest the same mechanical thrust as a much larger wind turbine.\nLABELS: Literasi Bahasa Inggris, Detail Inquiry\n\n# Q33 (PILGAN)\nThe word **\"formidable\"** in paragraph 3 is closest in meaning to:\n\n[[A]] Insignificant\n[[B]] Challenging and daunting\n[[C]] Easily resolvable\n[[D]] Obsolete\n[[E]] Theoretical\n\nANSWER: B\nDISCUSSION:\n'Formidable' means inspiring fear or respect through being impressively large, powerful, intense, or difficult. In this context, 'challenging and daunting' is the closest synonym.\nLABELS: Literasi Bahasa Inggris, Vocabulary in Context\n\n# Q34 (PILGAN)\nWhich of the following environmental concerns is explicitly raised by marine biologists in paragraph 3?\n\n[[A]] The depletion of oceanic dissolved oxygen levels.\n[[B]] Excessive heating of coastal surface water temperatures.\n[[C]] Acoustic emissions that disrupt marine mammal navigation.\n[[D]] Chemical contamination from turbine photovoltaic coatings.\n[[E]] Complete destruction of deep pelagic phytoplankton colonies.\n\nANSWER: C\nDISCUSSION:\nParagraph 3 mentions ecological concerns including 'acoustic emissions disturbing marine mammal navigation and hydrodynamic alterations impacting coastal benthic habitats'.\nLABELS: Literasi Bahasa Inggris, Detail Analysis\n\n# Q35 (PILGAN)\nWhat tone does the author adopt regarding the future of marine energy commercialization?\n\n[[A]] Cynical and dismissive\n[[B]] Recklessly optimistic\n[[C]] Objective and pragmatic\n[[D]] Sarcastic and skeptical\n[[E]] Indifferent and disinterested\n\nANSWER: C\nDISCUSSION:\nThe author presents both the clear advantages (high predictability, energy density) and the genuine technical/ecological challenges objectively and pragmatically.\nLABELS: Literasi Bahasa Inggris, Author Tone\nCLEAR_STIMULUS\n\n# Q36 (PILGAN)\nChoose the option that correctly completes the sentence:\n\"Had the meteorological department issued the warning earlier, the maritime fleet ______ in the harbor.\"\n\n[[A]] will remain\n[[B]] would have remained\n[[C]] would remain\n[[D]] has remained\n[[E]] had remained\n\nANSWER: B\nDISCUSSION:\nThis is a third conditional inversion (Past Unreal Conditional): 'Had + subject + past participle, subject + would have + past participle'.\nLABELS: Bahasa Inggris, Conditional Sentence\n\n# Q37 (PILGAN)\nChoose the sentence that displays correct subject-verb agreement:\n\n[[A]] Neither the lead researcher nor his assistants was present at the conference.\n[[B]] Each of the experimental samples were labeled with a unique cryptographic barcode.\n[[C]] The team of aerospace engineers has successfully completed the telemetry trial.\n[[D]] A collection of classical literature manuscripts are on display in the museum.\n[[E]] Either the sensors or the battery pack have malfunctioned during descent.\n\nANSWER: C\nDISCUSSION:\n'The team' is a singular collective noun functioning as a unit, taking the singular verb 'has completed'.\nLABELS: Bahasa Inggris, Subject-Verb Agreement\n\n# Q38 (PILGAN)\nWhich word best completes the blank in context?\n\"The pharmaceutical committee requested additional clinical trials to verify that the vaccine produced ______ antibodies without causing severe adverse reactions.\"\n\n[[A]] transient\n[[B]] potent\n[[C]] nominal\n[[D]] arbitrary\n[[E]] hazardous\n\nANSWER: B\nDISCUSSION:\n'Potent' means having great power, influence, or effect (producing strong/effective antibodies).\nLABELS: Bahasa Inggris, Vocabulary in Context\n\n# Q39 (PILGAN)\nIdentify the sentence containing a misplaced modifier:\n\n[[A]] Walking through the park at sunrise, the morning mist was refreshing.\n[[B]] While preparing for the exam, she summarized all key formulas in a notebook.\n[[C]] After graduating from university, he joined an international research consortium.\n[[D]] Because the rain was torrential, we postponed the field expedition.\n[[E]] Driven by scientific curiosity, Marie Curie discovered two radioactive elements.\n\nANSWER: A\nDISCUSSION:\nIn sentence A, 'Walking through the park at sunrise' modifies 'the morning mist', which cannot walk! This is a classic dangling modifier.\nLABELS: Bahasa Inggris, Modifier Error\n\n# Q40 (PILGAN)\nThe phrase **\"on the fence\"** in an idiom context signifies:\n\n[[A]] In an extremely hazardous situation\n[[B]] Undecided or hesitant between two options\n[[C]] Achieving total consensus\n[[D]] Operating beyond legal boundaries\n[[E]] Fully committed to a specific outcome\n\nANSWER: B\nDISCUSSION:\nThe idiom 'on the fence' means neutral, undecided, or unable to choose between two alternatives.\nLABELS: Bahasa Inggris, Idiomatic Expressions\n\n# Q41 (PILGAN)\nSuku ke-3 suatu barisan aritmetika adalah 11 dan suku ke-8 adalah 26. Berapakah jumlah 15 suku pertama barisan tersebut?\n\n[[A]] 345\n[[B]] 375\n[[C]] 390\n[[D]] 415\n[[E]] 435\n\nANSWER: C\nDISCUSSION:\n$U_3 = a + 2b = 11$, $U_8 = a + 7b = 26 \\rightarrow 5b = 15 \\rightarrow b = 3, a = 5$.\n$S_{15} = \\frac{15}{2}(2(5) + 14(3)) = 15 \\times 26 = 390$.\nLABELS: Barisan & Deret, Matematika\n\n# Q42 (PILGAN)\nDari 7 orang siswa berprestasi akan dipilih suatu tim delegasi olimpiade yang beranggotakan 3 orang. Berapa banyak susunan tim berbeda yang dapat dibentuk?\n\n[[A]] 21\n[[B]] 35\n[[C]] 42\n[[D]] 120\n[[E]] 210\n\nANSWER: B\nDISCUSSION:\n$$C(7, 3) = \\frac{7 \\times 6 \\times 5}{3 \\times 2 \\times 1} = 35$$.\nLABELS: Kombinatorika, Peluang\n\n# Q43 (PILGAN)\nSebuah kotak berisi 5 bola merah dan 3 bola biru. Jika diambil 2 bola sekaligus secara acak, berapakah peluang terambilnya 1 bola merah dan 1 bola biru?\n\n[[A]] 15/56\n[[B]] 15/28\n[[C]] 5/14\n[[D]] 3/8\n[[E]] 9/28\n\nANSWER: B\nDISCUSSION:\nTotal cara ambil 2 dari 8: $C(8,2) = 28$.\nCara ambil 1 merah & 1 biru: $C(5,1) \\times C(3,1) = 15$.\nPeluang $= 15/28$.\nLABELS: Peluang, Kombinasi\n\n# Q44 (PILGAN)\nBerapakah sisa pembagian dari $3^{2026}$ jika dibagi dengan 5?\n\n[[A]] 1\n[[B]] 2\n[[C]] 3\n[[D]] 4\n[[E]] 0\n\nANSWER: D\nDISCUSSION:\nPeriode sisa $3^n \\pmod 5$: $3, 4, 2, 1$ (panjang periode 4).\n$2026 = 4 \\times 506 + 2$. Sisa sama dengan $3^2 = 9 \\equiv 4 \\pmod 5$.\nLABELS: Teori Bilangan, Aritmetika Modulo\n\n# Q45 (PILGAN)\nSuatu tangki air memiliki dua pipa pengisi. Pipa A dapat mengisi tangki hingga penuh dalam waktu 4 jam, sedangkan Pipa B dapat mengisi penuh dalam waktu 6 jam. Jika kedua pipa dibuka bersamaan, berapa waktu yang dibutuhkan untuk mengisi tangki tersebut hingga penuh?\n\n[[A]] 2 jam 12 menit\n[[B]] 2 jam 24 menit\n[[C]] 2 jam 30 menit\n[[D]] 2 jam 40 menit\n[[E]] 3 jam\n\nANSWER: B\nDISCUSSION:\nLaju gabungan: $1/4 + 1/6 = 5/12$ tangki/jam. Waktu $= 12/5 = 2,4$ jam $= 2$ jam 24 menit.\nLABELS: Aritmetika, Laju Alir\n\n# Q46 (PILGAN)\nPersamaan garis singgung pada kurva $y = 2x^2 - 3x + 1$ di titik dengan absis $x = 2$ adalah:\n\n[[A]] $y = 5x - 7$\n[[B]] $y = 5x + 3$\n[[C]] $y = 7x - 11$\n[[D]] $y = 3x - 3$\n[[E]] $y = 4x - 5$\n\nANSWER: A\nDISCUSSION:\n$x = 2 \\rightarrow y = 2(4) - 6 + 1 = 3$. Titik $(2, 3)$.\n$m = y' = 4x - 3 = 4(2) - 3 = 5$.\n$y - 3 = 5(x - 2) \\rightarrow y = 5x - 7$.\nLABELS: Kalkulus, Garis Singgung Kurva\n\n# Q47 (PILGAN)\nPerhatikan data terurut berikut:\n$4, 6, 7, x, 11, 14, 19$\nJika median dari kumpulan data tersebut adalah 9, berapakah nilai rata-rata (*mean*) dari ketujuh bilangan tersebut?\n\n[[A]] 9,0\n[[B]] 9,5\n[[C]] 10,0\n[[D]] 10,5\n[[E]] 11,0\n\nANSWER: C\nDISCUSSION:\nMedian data ke-4 adalah $x = 9$.\nTotal $= 4 + 6 + 7 + 9 + 11 + 14 + 19 = 70$.\nRata-rata $= 70 / 7 = 10,0$.\nLABELS: Statistika, Ukuran Pemusatan\n\n# Q48 (PILGAN)\nJika $\\log_2 3 = a$ dan $\\log_3 5 = b$, maka nilai dari $\\log_6 15$ dinyatakan dalam $a$ dan $b$ adalah:\n\n[[A]] $\\frac{a + b}{1 + a}$\n[[B]] $\\frac{a(1 + b)}{1 + a}$\n[[C]] $\\frac{1 + ab}{1 + a}$\n[[D]] $\\frac{a + ab}{a + 1}$\n[[E]] $\\frac{b(1 + a)}{1 + b}$\n\nANSWER: B\nDISCUSSION:\n$\\log_6 15 = \\frac{\\log_2 15}{\\log_2 6} = \\frac{\\log_2 3 + \\log_2 5}{1 + \\log_2 3} = \\frac{a + ab}{1 + a} = \\frac{a(1 + b)}{1 + a}$.\nLABELS: Logaritma, Aljabar\n\n# Q49 (PILGAN)\nHimpunan penyelesaian dari pertidaksamaan $|2x - 5| \\le 7$ adalah:\n\n[[A]] $-1 \\le x \\le 6$\n[[B]] $x \\le -1$ atau $x \\ge 6$\n[[C]] $1 \\le x \\le 7$\n[[D]] $-6 \\le x \\le 1$\n[[E]] $-2 \\le x \\le 5$\n\nANSWER: A\nDISCUSSION:\n$-7 \\le 2x - 5 \\le 7 \\rightarrow -2 \\le 2x \\le 12 \\rightarrow -1 \\le x \\le 6$.\nLABELS: Nilai Mutlak, Pertidaksamaan\n\n# Q50 (ESSAY)\nSebuah perusahaan manufaktur memproduksi $x$ unit barang per hari dengan fungsi biaya total:\n$$C(x) = 2x^2 + 40x + 1800$$\n(dalam ribuan rupiah). Setiap unit barang dijual dengan harga pasar tetap sebesar $Rp200.000,00$ ($200$ ribu rupiah).\nTentukan:\na) Fungsi keuntungan total $P(x)$.\nb) Jumlah produksi harian $x$ yang memaksimumkan keuntungan.\nc) Nilai keuntungan maksimum yang dapat dicapai perusahaan tersebut!\n\nANSWER: ESSAY\nDISCUSSION:\na) Pendapatan $R(x) = 200x$. Keuntungan $P(x) = 200x - (2x^2 + 40x + 1800) = -2x^2 + 160x - 1800$.\nb) $P'(x) = -4x + 160 = 0 \\rightarrow x = 40$ unit/hari.\nc) Keuntungan maksimum: $P(40) = -2(1600) + 6400 - 1800 = 1400$ ribu rupiah (Rp1.400.000,00 per hari).\nLABELS: Matematika, Optimasi Ekonomi, Kalkulus Terapan",
    duration_minutes: 60,
    start_at: null,
    end_at: null,
    passing_grade: 65,
    show_answer: true,
    immediate_feedback: false,
    enable_tip_penalty: false,
    penalty_theory_config: '10, 15, 20',
    penalty_practice_config: '15, 20, 25',
    created_by: 'Admin',
    created_at: '2026-02-05T10:00:00.000Z'
  }
];

export const INITIAL_QUESTIONS: QuestionRow[] = [
  {
    id: 'q-bank-001',
    stimulus_id: 'literasi-indo-ai',
    chain_index: 1,
    body: "# Q1 (PILGAN)\nBerdasarkan paragraf pertama, apakah manfaat utama integrasi kecerdasan buatan dalam proses pembelajaran?\n\n[[A]] Menggantikan peran guru sepenuhnya dalam memberikan instruksi di dalam kelas.\n[[B]] Menstandarisasi kecepatan belajar seluruh siswa agar mencapai target kurikulum yang seragam.\n[[C]] Menyesuaikan materi dengan ritme kognitif individual dan mengurangi beban administratif pengajar.\n[[D]] Memastikan seluruh siswa lulus ujian kelulusan dengan nilai di atas KKM secara otomatis.\n[[E]] Menghilangkan kebutuhan evaluasi diagnostik berkala oleh institusi sekolah.\n\nANSWER: C\nDISCUSSION:\nParagraf pertama secara eksplisit menyatakan bahwa sistem pembelajaran adaptif berbasis AI memungkinkan kurikulum disesuaikan dengan ritme kognitif individual dan memangkas beban administratif pengajar hingga 40%.\nLABELS: Literasi Bahasa Indonesia, SNBT, Gagasan Utama",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Literasi Bahasa Indonesia"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-01T08:00:00.000Z'
  },
  {
    id: 'q-bank-002',
    stimulus_id: 'literasi-indo-ai',
    chain_index: 2,
    body: "# Q2 (PILGAN)\nIstilah *cognitive offloading* dalam konteks bacaan di atas merujuk pada:\n\n[[A]] Kelelahan mental yang dialami pengajar akibat penggunaan perangkat digital secara intensif.\n[[B]] Kecenderungan siswa mendelegasikan proses pemecahan masalah rumit ke mesin cerdas.\n[[C]] Proses penghapusan data memori yang tidak relevan dari pusat penyimpanan peladen cloud.\n[[D]] Peningkatan kapasitas otak manusia setelah berkolaborasi secara intensif dengan teknologi AI.\n[[E]] Penurunan daya ingat jangka pendek akibat paparan radiasi layar komputer.\n\nANSWER: B\nDISCUSSION:\nParagraf kedua mendefinisikan fenomena *cognitive offloading* sebagai kecenderungan mendelegasikan tugas pemecahan masalah yang rumit ke mesin cerdas, yang berpotensi melemahkan penalaran mandiri.\nLABELS: Literasi Bahasa Indonesia, SNBT, Makna Kontekstual",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Literasi Bahasa Indonesia"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-01T08:00:00.000Z'
  },
  {
    id: 'q-bank-003',
    stimulus_id: 'literasi-indo-ai',
    chain_index: 3,
    body: "# Q3 (PILGAN)\nPernyataan manakah yang PALING SESUAI dengan pandangan penulis mengenai masa depan pendidikan di era AI?\n\n[[A]] Pembatasan ketat penggunaan perangkat komputasi di lingkungan sekolah formal.\n[[B]] Penggantian kurikulum humaniora dengan mata pelajaran ilmu komputer terapan secara menyeluruh.\n[[C]] Penyerahan seluruh perancangan silabus pendidikan kepada algoritma model bahasa besar.\n[[D]] Perpaduan harmonis antara efisiensi kecerdasan buatan dan literasi kritis humanistik.\n[[E]] Keyakinan bahwa AI akan menurunkan kualitas seluruh lulusan perguruan tinggi di masa depan.\n\nANSWER: D\nDISCUSSION:\nKalimat terakhir paragraf ketiga menyatakan bahwa masa depan pendidikan ditentukan oleh 'sintesis harmonis antara efisiensi kecerdasan artifisial dan kedalaman kebijaksanaan humanistik'.\nLABELS: Literasi Bahasa Indonesia, SNBT, Simpulan Teks",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Literasi Bahasa Indonesia"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-02T08:00:00.000Z'
  },
  {
    id: 'q-bank-004',
    stimulus_id: 'literasi-indo-ai',
    chain_index: 4,
    body: "# Q4 (PILGAN)\nBerdasarkan bacaan, bahaya laten yang muncul akibat bias pada korpus data latih model AI adalah:\n\n[[A]] Terjadinya kegagalan perangkat keras komputasi server sekolah.\n[[B]] Penguatan misinformasi dan pelestarian stereotip sosial budaya di masyarakat.\n[[C]] Meningkatnya biaya lisensi perangkat lunak pendidikan berbayar.\n[[D]] Penurunan drastis kecepatan akses internet pita lebar nasional.\n[[E]] Ketidakmampuan AI dalam memproses perintah bahasa Indonesia baku.\n\nANSWER: B\nDISCUSSION:\nParagraf kedua menyebutkan bahwa bias inheren pada korpus data latih AI berpotensi memperkuat misinformasi dan stereotip sosial budaya.\nLABELS: Literasi Bahasa Indonesia, SNBT, Analisis Detail",
    type: 'MCQ',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Literasi Bahasa Indonesia"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-02T08:00:00.000Z'
  },
  {
    id: 'q-bank-005',
    stimulus_id: 'literasi-indo-ai',
    chain_index: 5,
    body: "# Q5 (PILGAN)\nSikap kritis yang diharapkan dimiliki siswa dalam era literasi algoritmik (*critical algorithmic literacy*) adalah:\n\n[[A]] Menolak segala bentuk penggunaan teknologi berbasis internet dalam belajar.\n[[B]] Menghafal seluruh baris kode pembuat model bahasa cerdas.\n[[C]] Mampu mendekonstruksi bias algoritma dan memverifikasi validitas data primer.\n[[D]] Mempercayai seluruh hasil pencarian mesin cerdas tanpa perlu melakukan pengecekan ulang.\n[[E]] Menggunakan AI secara rahasia tanpa mencantumkan atribusi akademik.\n\nANSWER: C\nDISCUSSION:\nParagraf ketiga menjelaskan bahwa siswa diharapkan memiliki kecakapan mendekonstruksi bias algoritma, menguji logika inferensi model, dan menegakkan integritas data primer.\nLABELS: Literasi Bahasa Indonesia, SNBT, Evaluasi Teks",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Literasi Bahasa Indonesia"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-03T08:00:00.000Z'
  },
  {
    id: 'q-bank-006',
    stimulus_id: null,
    chain_index: null,
    body: "# Q6 (PILGAN)\nPerhatikan kalimat berikut:\n\"Pemerintah berupaya menaikkan standar mutu pendidikan *dimana* hal tersebut membutuhkan alokasi dana yang terencana.\"\nPerbaikan yang tepat untuk kata yang dicetak miring agar menjadi kalimat efektif adalah:\n\n[[A]] yang mana\n[[B]] di mana\n[[C]] sehingga\n[[D]] oleh karena\n[[E]] dan\n\nANSWER: C\nDISCUSSION:\nKata 'dimana' adalah kata tanya tempat dan tidak boleh digunakan sebagai kata penghubung antarklausa. Konjungsi yang tepat untuk menyatakan hubungan akibat/penjelasan adalah 'sehingga'.\nLABELS: Tata Bahasa, Kalimat Efektif, PUEBI",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Literasi Bahasa Indonesia"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-03T08:00:00.000Z'
  },
  {
    id: 'q-bank-007',
    stimulus_id: null,
    chain_index: null,
    body: "# Q7 (PILGAN)\nPenulisan gabungan kata berikut ini yang TIDAK BAKU menurut Pedoman Umum Ejaan Bahasa Indonesia (PUEBI) adalah:\n\n[[A]] pascasarjana\n[[B]] antarkota\n[[C]] non-pemerintah\n[[D]] sub-bagian\n[[E]] tunaaksara\n\nANSWER: D\nDISCUSSION:\nBentuk terikat 'sub-' ditulis serangkai tanpa tanda hubung jika bertemu kata berhuruf kecil yang bukan singkatan/istilah asing, sehingga bentuk bakunya adalah 'subbagian'.\nLABELS: Tata Bahasa, Ejaan, PUEBI",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Literasi Bahasa Indonesia"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-04T08:00:00.000Z'
  },
  {
    id: 'q-bank-008',
    stimulus_id: null,
    chain_index: null,
    body: "# Q8 (PILGAN)\nSinonim yang paling tepat untuk kata **KOMPREHENSIF** adalah:\n\n[[A]] Menyeluruh dan mendalam\n[[B]] Cepat dan singkat\n[[C]] Eksklusif dan terbatas\n[[D]] Bertahap dan perlahan\n[[E]] Sederhana dan terpadu\n\nANSWER: A\nDISCUSSION:\nMenurut KBBI, komprehensif berarti bersifat mampu menangkap (menerima) dengan baik; luas dan lengkap (tentang ruang lingkup atau isi); menyeluruh.\nLABELS: Kosakata, Sinonim, Penalaran Umum",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Literasi Bahasa Indonesia"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-04T08:00:00.000Z'
  },
  {
    id: 'q-bank-009',
    stimulus_id: null,
    chain_index: null,
    body: "# Q9 (PILGAN)\nAntonim yang paling tepat untuk kata **SPORADIS** adalah:\n\n[[A]] Jarang\n[[B]] Berkelanjutan\n[[C]] Meluas\n[[D]] Tiba-tiba\n[[E]] Terpencil\n\nANSWER: B\nDISCUSSION:\nSporadis berarti keadaan yang jarang terjadi atau tersebar secara tidak menentu. Lawan kata yang tepat adalah teratur atau berkelanjutan (kontinu).\nLABELS: Kosakata, Antonim, Penalaran Umum",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Literasi Bahasa Indonesia"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-05T08:00:00.000Z'
  },
  {
    id: 'q-bank-010',
    stimulus_id: null,
    chain_index: null,
    body: "# Q10 (PILGAN)\nKalimat manakah yang memiliki susunan subjek, predikat, objek, dan keterangan (S-P-O-K) yang lengkap dan tepat?\n\n[[A]] Di perpustakaan kota kemarin siang.\n[[B]] Para mahasiswa mengkaji dampak kecerdasan buatan di ruang seminar.\n[[C]] Telah dipelajari secara mendalam teori kuantum modern.\n[[D]] Peneliti yang berprestasi tinggi dari universitas terkemuka.\n[[E]] Membaca buku teks sains dengan cermat dan teliti.\n\nANSWER: B\nDISCUSSION:\nSubjek: 'Para mahasiswa', Predikat: 'mengkaji', Objek: 'dampak kecerdasan buatan', Keterangan: 'di ruang seminar'.\nLABELS: Tata Bahasa, Struktur Kalimat, Sintaksis",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Literasi Bahasa Indonesia"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-05T08:00:00.000Z'
  },
  {
    id: 'q-bank-011',
    stimulus_id: null,
    chain_index: null,
    body: "# Q11 (PILGAN)\nPremis 1: Jika cuaca mendung dan angin berhembus kencang, maka hujan akan turun lebat.\nPremis 2: Hari ini hujan tidak turun lebat.\nKesimpulan yang sah menurut hukum Modus Tollens adalah:\n\n[[A]] Hari ini cuaca cerah tanpa angin.\n[[B]] Cuaca tidak mendung atau angin tidak berhembus kencang.\n[[C]] Cuaca mendung tetapi angin tidak berhembus kencang.\n[[D]] Angin bertiup sangat kencang sepanjang hari.\n[[E]] Hujan akan turun lebat pada malam hari.\n\nANSWER: B\nDISCUSSION:\nPernyataan $P \\land Q \\rightarrow R$. Diketahui $\\sim R$. Dengan modus tollens diperoleh $\\sim(P \\land Q)$, yang menurut hukum De Morgan ekuivalen dengan $\\sim P \\lor \\sim Q$ (Cuaca tidak mendung atau angin tidak berhembus kencang).\nLABELS: Logika, Modus Tollens, Penalaran Umum",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Penalaran Umum"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-06T08:00:00.000Z'
  },
  {
    id: 'q-bank-012',
    stimulus_id: null,
    chain_index: null,
    body: "# Q12 (PILGAN)\nSemua ilmuwan memiliki rasa ingin tahu yang tinggi. Sebagian ilmuwan menyukai musik klasik.\nKesimpulan yang tepat dari kedua premis di atas adalah:\n\n[[A]] Semua orang yang menyukai musik klasik adalah ilmuwan.\n[[B]] Semua yang memiliki rasa ingin tahu tinggi menyukai musik klasik.\n[[C]] Sebagian orang yang memiliki rasa ingin tahu tinggi menyukai musik klasik.\n[[D]] Tidak ada penyuka musik klasik yang bukan ilmuwan.\n[[E]] Sebagian ilmuwan tidak memiliki rasa ingin tahu yang tinggi.\n\nANSWER: C\nDISCUSSION:\nKarena sebagian ilmuwan menyukai musik klasik dan setiap ilmuwan memiliki rasa ingin tahu tinggi, maka pasti ada sebagian orang yang memiliki rasa ingin tahu tinggi yang menyukai musik klasik.\nLABELS: Logika, Silogisme, Penalaran Umum",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Penalaran Umum"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-06T08:00:00.000Z'
  },
  {
    id: 'q-bank-013',
    stimulus_id: null,
    chain_index: null,
    body: "# Q13 (PILGAN)\nNegasi dari proposisi majemuk \"Hari ini tidak hujan dan lalu lintas lancar\" adalah:\n\n[[A]] Hari ini hujan dan lalu lintas macet.\n[[B]] Hari ini hujan atau lalu lintas tidak lancar.\n[[C]] Hari ini tidak hujan atau lalu lintas macet.\n[[D]] Jika hari ini hujan maka lalu lintas lancar.\n[[E]] Hari ini cerah serta lalu lintas ramai lancar.\n\nANSWER: B\nDISCUSSION:\nBentuk awal $\\sim P \\land Q$. Negasinya adalah $\\sim(\\sim P \\land Q) \\equiv P \\lor \\sim Q$ (Hari ini hujan atau lalu lintas tidak lancar).\nLABELS: Logika, De Morgan, Penalaran Umum",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Penalaran Umum"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-07T08:00:00.000Z'
  },
  {
    id: 'q-bank-014',
    stimulus_id: null,
    chain_index: null,
    body: "# Q14 (PILGAN)\nJika pernyataan \"Semua peserta seminar wajib membawa kartu identitas\" bernilai SALAH, maka pernyataan manakah yang PASTI bernilai BENAR?\n\n[[A]] Tidak ada peserta seminar yang membawa kartu identitas.\n[[B]] Semua peserta seminar tidak membawa kartu identitas.\n[[C]] Ada peserta seminar yang tidak membawa kartu identitas.\n[[D]] Sebagian peserta seminar membawa kartu identitas ganda.\n[[E]] Panitia seminar melarang peserta membawa kartu identitas.\n\nANSWER: C\nDISCUSSION:\nPernyataan universal bernilai salah jika dan hanya jika negasinya (proposisi partikular negatif) bernilai benar: $\\sim(\\forall x, P(x)) \\equiv \\exists x, \\sim P(x)$ (\"Ada/sebagian peserta yang tidak membawa kartu identitas\").\nLABELS: Logika, Kuantor, Penalaran Umum",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Penalaran Umum"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-07T08:00:00.000Z'
  },
  {
    id: 'q-bank-015',
    stimulus_id: null,
    chain_index: null,
    body: "# Q15 (PILGAN)\nKontraposisi dari pernyataan \"Jika suatu bilangan habis dibagi 6, maka bilangan tersebut habis dibagi 2 dan habis dibagi 3\" adalah:\n\n[[A]] Jika suatu bilangan tidak habis dibagi 6, maka bilangan tersebut tidak habis dibagi 2 atau tidak habis dibagi 3.\n[[B]] Jika suatu bilangan habis dibagi 2 dan 3, maka bilangan tersebut habis dibagi 6.\n[[C]] Jika suatu bilangan tidak habis dibagi 2 atau tidak habis dibagi 3, maka bilangan tersebut tidak habis dibagi 6.\n[[D]] Jika suatu bilangan tidak habis dibagi 2 dan tidak habis dibagi 3, maka bilangan tersebut tidak habis dibagi 6.\n[[E]] Suatu bilangan habis dibagi 6 jika dan hanya jika habis dibagi 2 dan 3.\n\nANSWER: C\nDISCUSSION:\nKontraposisi dari $P \\rightarrow (Q \\land R)$ adalah $\\sim(Q \\land R) \\rightarrow \\sim P$, yang ekuivalen dengan $(\\sim Q \\lor \\sim R) \\rightarrow \\sim P$.\nLABELS: Logika, Kontraposisi, Penalaran Umum",
    type: 'MCQ',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Penalaran Umum"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-08T08:00:00.000Z'
  },
  {
    id: 'q-bank-016',
    stimulus_id: null,
    chain_index: null,
    body: "# Q16 (PILGAN)\nLima orang atlet (A, B, C, D, E) menempati garis finis dengan ketentuan:\n- B finis lebih cepat daripada D.\n- A finis lebih cepat daripada B tetapi lebih lambat daripada C.\n- E finis paling cepat di antara semuanya.\nUrutan pelari yang finis dari yang paling cepat ke paling lambat adalah:\n\n[[A]] E - C - A - B - D\n[[B]] E - A - C - B - D\n[[C]] C - E - A - B - D\n[[D]] E - C - B - A - D\n[[E]] E - B - A - C - D\n\nANSWER: A\nDISCUSSION:\nDari ketentuan: E paling cepat (1). C lebih cepat dari A. A lebih cepat dari B. B lebih cepat dari D. Urutan: E - C - A - B - D.\nLABELS: Logika Analitik, Penalaran Umum, Urutan",
    type: 'MCQ',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Penalaran Umum"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-08T08:00:00.000Z'
  },
  {
    id: 'q-bank-017',
    stimulus_id: null,
    chain_index: null,
    body: "# Q17 (PILGAN)\nJika $x$ adalah bilangan bulat genap positif dan $y$ adalah bilangan bulat ganjil positif, manakah dari ekspresi berikut yang PASTI menghasilkan bilangan ganjil?\n\n[[A]] $x \\cdot y$\n[[B]] $x + 2y$\n[[C]] $2x + y$\n[[D]] $x^2 + y^2 + 1$\n[[E]] $3x + 4y$\n\nANSWER: C\nDISCUSSION:\n$x$ genap, $y$ ganjil. $2x$ selalu genap. Genap + Ganjil = Ganjil. Jadi $2x + y$ pasti menghasilkan bilangan ganjil.\nLABELS: Teori Bilangan, Penalaran Kuantitatif",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Penalaran Umum"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-09T08:00:00.000Z'
  },
  {
    id: 'q-bank-018',
    stimulus_id: null,
    chain_index: null,
    body: "# Q18 (PILGAN)\nPerhatikan barisan bilangan berikut:\n$3, 7, 15, 31, 63, \\dots$\nAngka berikutnya pada barisan tersebut adalah:\n\n[[A]] 95\n[[B]] 112\n[[C]] 127\n[[D]] 135\n[[E]] 144\n\nANSWER: C\nDISCUSSION:\nPola pertambahan: $+4, +8, +16, +32, \\dots$. Suku berikutnya adalah $63 + 64 = 127$.\nLABELS: Deret Angka, Pola Bilangan, Penalaran Kuantitatif",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Penalaran Umum"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-09T08:00:00.000Z'
  },
  {
    id: 'q-bank-019',
    stimulus_id: null,
    chain_index: null,
    body: "# Q19 (PILGAN)\nPerhatikan barisan huruf berikut:\n$B, D, G, K, P, \\dots$\nHuruf berikutnya pada pola tersebut adalah:\n\n[[A]] S\n[[B]] T\n[[C]] U\n[[D]] V\n[[E]] W\n\nANSWER: D\nDISCUSSION:\nB (2), D (4), G (7), K (11), P (16). Selisih: $+2, +3, +4, +5$. Selisih berikutnya $+6 \\rightarrow 16 + 6 = 22$, yaitu huruf V.\nLABELS: Deret Huruf, Penalaran Umum",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Penalaran Umum"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-10T08:00:00.000Z'
  },
  {
    id: 'q-bank-020',
    stimulus_id: null,
    chain_index: null,
    body: "# Q20 (PILGAN)\nHubungan analogi kata **KOMPAS : ARAH** setara dengan:\n\n[[A]] JAM : WAKTU\n[[B]] TERMOMETER : AIR\n[[C]] MIKROSKOP : CAHAYA\n[[D]] KALKULATOR : KERTAS\n[[E]] PETA : KENDARAAN\n\nANSWER: A\nDISCUSSION:\nKompas adalah instrumen pengukur/penunjuk arah. Jam adalah instrumen pengukur/penunjuk waktu.\nLABELS: Analogi Kata, Penalaran Umum",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Penalaran Umum"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-10T08:00:00.000Z'
  },
  {
    id: 'q-bank-021',
    stimulus_id: null,
    chain_index: null,
    body: "# Q21 (PILGAN)\nJika persamaan kuadrat $x^2 - 7x + 10 = 0$ memiliki akar-akar $p$ dan $q$, berapakah nilai dari $p^2 + q^2$?\n\n[[A]] 29\n[[B]] 39\n[[C]] 49\n[[D]] 59\n[[E]] 69\n\nANSWER: A\nDISCUSSION:\nDari rumus Vieta: $p + q = 7$ dan $p \\cdot q = 10$.\n$p^2 + q^2 = (p + q)^2 - 2pq = 7^2 - 2(10) = 49 - 20 = 29$.\nLABELS: Matematika Dasar, Aljabar Kuadrat",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Matematika"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-11T08:00:00.000Z'
  },
  {
    id: 'q-bank-022',
    stimulus_id: null,
    chain_index: null,
    body: "# Q22 (PILGAN)\nDiketahui sistem persamaan linear:\n$$2x + 3y = 13$$\n$$x - y = 4$$\nBerapakah nilai dari $x + 2y$?\n\n[[A]] 5\n[[B]] 6\n[[C]] 7\n[[D]] 8\n[[E]] 9\n\nANSWER: C\nDISCUSSION:\nDari pers (2): $x = y + 4$. Substitusikan ke pers (1): $2(y + 4) + 3y = 13 \\rightarrow 5y = 5 \\rightarrow y = 1, x = 5$.\nNilai $x + 2y = 5 + 2(1) = 7$.\nLABELS: Matematika Dasar, Sistem Persamaan Linear",
    type: 'MCQ',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Matematika"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-11T08:00:00.000Z'
  },
  {
    id: 'q-bank-023',
    stimulus_id: null,
    chain_index: null,
    body: "# Q23 (PILGAN)\nSebuah barang dijual dengan harga Rp180.000,00 setelah mendapatkan diskon sebesar 25%. Berapakah harga asli barang tersebut sebelum didiskon?\n\n[[A]] Rp210.000,00\n[[B]] Rp225.000,00\n[[C]] Rp240.000,00\n[[D]] Rp250.000,00\n[[E]] Rp260.000,00\n\nANSWER: C\nDISCUSSION:\nHarga jual $= 75\\% \\times \\text{Harga Asli} = 180.000$.\nHarga Asli $= 180.000 / 0,75 = 240.000$.\nLABELS: Aritmetika Sosial, Penalaran Kuantitatif",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Matematika"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-12T08:00:00.000Z'
  },
  {
    id: 'q-bank-024',
    stimulus_id: null,
    chain_index: null,
    body: "# Q24 (PILGAN)\nRata-rata nilai ujian matematika dari 18 siswa adalah 75. Jika 2 orang siswa baru dengan nilai 85 dan 95 dimasukkan ke dalam kelompok tersebut, berapakah rata-rata nilai gabungan sekarang?\n\n[[A]] 75,5\n[[B]] 76,5\n[[C]] 77,0\n[[D]] 77,5\n[[E]] 78,0\n\nANSWER: B\nDISCUSSION:\nTotal nilai awal $= 18 \\times 75 = 1350$.\nTotal nilai baru $= 1350 + 85 + 95 = 1530$.\nBanyak siswa sekarang $= 18 + 2 = 20$.\nRata-rata baru $= 1530 / 20 = 76,5$.\nLABELS: Statistika, Rata-rata Gabungan",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Matematika"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-12T08:00:00.000Z'
  },
  {
    id: 'q-bank-025',
    stimulus_id: null,
    chain_index: null,
    body: "# Q25 (PILGAN)\nSuatu pekerjaan dapat diselesaikan oleh 6 orang pekerja dalam waktu 15 hari. Jika pekerjaan tersebut harus diselesaikan dalam waktu 10 hari, berapa banyak pekerja tambahan yang dibutuhkan?\n\n[[A]] 2 orang\n[[B]] 3 orang\n[[C]] 4 orang\n[[D]] 5 orang\n[[E]] 9 orang\n\nANSWER: B\nDISCUSSION:\n$6 \\times 15 = N \\times 10 \\rightarrow 90 = 10N \\rightarrow N = 9$ orang.\nPekerja tambahan $= 9 - 6 = 3$ orang.\nLABELS: Perbandingan, Aritmetika",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Matematika"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-13T08:00:00.000Z'
  },
  {
    id: 'q-bank-026',
    stimulus_id: null,
    chain_index: null,
    body: "# Q26 (PILGAN)\nJika fungsi $f(x) = 3x - 1$ dan $g(x) = x^2 + 2$, berapakah nilai komposisi $(g \\circ f)(2)$?\n\n[[A]] 25\n[[B]] 27\n[[C]] 29\n[[D]] 31\n[[E]] 33\n\nANSWER: B\nDISCUSSION:\n$f(2) = 3(2) - 1 = 5$.\n$(g \\circ f)(2) = g(5) = 5^2 + 2 = 27$.\nLABELS: Matematika, Fungsi Komposisi",
    type: 'MCQ',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Matematika"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-13T08:00:00.000Z'
  },
  {
    id: 'q-bank-027',
    stimulus_id: null,
    chain_index: null,
    body: "# Q27 (PILGAN)\nPanjang jari-jari sebuah lingkaran bertambah sebesar 20%. Berapakah persentase pertambahan luas lingkaran tersebut?\n\n[[A]] 20%\n[[B]] 40%\n[[C]] 44%\n[[D]] 50%\n[[E]] 54%\n\nANSWER: C\nDISCUSSION:\nLuas awal $L_1 = \\pi r^2$.\nLuas baru $L_2 = \\pi (1,2r)^2 = 1,44 \\pi r^2 = 1,44 L_1$.\nPertambahan luas $= 44\\%$.\nLABELS: Geometri, Persentase Luas",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Matematika"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-14T08:00:00.000Z'
  },
  {
    id: 'q-bank-028',
    stimulus_id: null,
    chain_index: null,
    body: "# Q28 (PILGAN)\nBerapakah nilai dari $\\left(\\frac{1}{27}\\right)^{-\\frac{2}{3}}$?\n\n[[A]] 3\n[[B]] 6\n[[C]] 9\n[[D]] 18\n[[E]] 81\n\nANSWER: C\nDISCUSSION:\n$\\left(\\frac{1}{27}\\right)^{-\\frac{2}{3}} = (27)^{\\frac{2}{3}} = (3^3)^{\\frac{2}{3}} = 3^2 = 9$.\nLABELS: Eksponen, Aljabar",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Matematika"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-14T08:00:00.000Z'
  },
  {
    id: 'q-bank-029',
    stimulus_id: null,
    chain_index: null,
    body: "# Q29 (PILGAN)\nDua dadu homogen bermata enam dilempar bersama-sama satu kali. Peluang munculnya jumlah kedua mata dadu sama dengan 8 adalah:\n\n[[A]] 3/36\n[[B]] 4/36\n[[C]] 5/36\n[[D]] 6/36\n[[E]] 7/36\n\nANSWER: C\nDISCUSSION:\nTitik sampel dengan jumlah 8: $(2,6), (3,5), (4,4), (5,3), (6,2)$, total 5 pasang dari 36 kemungkinan. Peluang $= 5/36$.\nLABELS: Peluang, Teori Probabilitas",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Matematika"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-15T08:00:00.000Z'
  },
  {
    id: 'q-bank-030',
    stimulus_id: null,
    chain_index: null,
    body: "# Q30 (PILGAN)\nKeliling suatu persegi panjang adalah 40 cm. Jika panjangnya 4 cm lebih panjang dari lebarnya, berapakah luas persegi panjang tersebut?\n\n[[A]] 84 cm²\n[[B]] 96 cm²\n[[C]] 100 cm²\n[[D]] 104 cm²\n[[E]] 112 cm²\n\nANSWER: B\nDISCUSSION:\n$2(p + l) = 40 \\rightarrow p + l = 20$.\n$p = l + 4 \\rightarrow 2l + 4 = 20 \\rightarrow l = 8, p = 12$.\nLuas $= 12 \\times 8 = 96$ cm².\nLABELS: Geometri, Persegi Panjang",
    type: 'MCQ',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Matematika"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-15T08:00:00.000Z'
  },
  {
    id: 'q-bank-031',
    stimulus_id: 'english-marine-energy',
    chain_index: 1,
    body: "# Q31 (PILGAN)\nWhat is the primary advantage of ocean tidal energy over solar and wind energy mentioned in paragraph 1?\n\n[[A]] Lower manufacturing capital cost for subsea installations.\n[[B]] Highly predictable generation cycles governed by celestial gravitation.\n[[C]] Minimal physical footprint on coastal environments.\n[[D]] Total immunity from mechanical wear and corrosion.\n[[E]] Immediate global ubiquity in all freshwater ecosystems.\n\nANSWER: B\nDISCUSSION:\nParagraph 1 states that unlike intermittent solar and wind energy, tidal cycles are governed by celestial gravitational interactions, allowing electricity forecasts with mathematical precision months in advance.\nLABELS: Literasi Bahasa Inggris, Main Idea, Reading Comprehension",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Bahasa Inggris"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-16T08:00:00.000Z'
  },
  {
    id: 'q-bank-032',
    stimulus_id: 'english-marine-energy',
    chain_index: 2,
    body: "# Q32 (PILGAN)\nAccording to paragraph 2, why can a compact underwater turbine produce power comparable to a larger terrestrial wind turbine?\n\n[[A]] Seawater moves at three times the speed of terrestrial wind currents.\n[[B]] Submerged marine generators are constructed using radioactive isotopes.\n[[C]] Seawater density is approximately 830 times greater than air density.\n[[D]] Tidal straits generate thermal energy through tectonic friction.\n[[E]] Deep ocean currents exhibit zero drag resistance.\n\nANSWER: C\nDISCUSSION:\nParagraph 2 explains that because seawater is roughly 830 times denser than air, a smaller turbine can harvest the same mechanical thrust as a much larger wind turbine.\nLABELS: Literasi Bahasa Inggris, Detail Inquiry",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Bahasa Inggris"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-16T08:00:00.000Z'
  },
  {
    id: 'q-bank-033',
    stimulus_id: 'english-marine-energy',
    chain_index: 3,
    body: "# Q33 (PILGAN)\nThe word **\"formidable\"** in paragraph 3 is closest in meaning to:\n\n[[A]] Insignificant\n[[B]] Challenging and daunting\n[[C]] Easily resolvable\n[[D]] Obsolete\n[[E]] Theoretical\n\nANSWER: B\nDISCUSSION:\n'Formidable' means inspiring fear or respect through being impressively large, powerful, intense, or difficult. In this context, 'challenging and daunting' is the closest synonym.\nLABELS: Literasi Bahasa Inggris, Vocabulary in Context",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Bahasa Inggris"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-17T08:00:00.000Z'
  },
  {
    id: 'q-bank-034',
    stimulus_id: 'english-marine-energy',
    chain_index: 4,
    body: "# Q34 (PILGAN)\nWhich of the following environmental concerns is explicitly raised by marine biologists in paragraph 3?\n\n[[A]] The depletion of oceanic dissolved oxygen levels.\n[[B]] Excessive heating of coastal surface water temperatures.\n[[C]] Acoustic emissions that disrupt marine mammal navigation.\n[[D]] Chemical contamination from turbine photovoltaic coatings.\n[[E]] Complete destruction of deep pelagic phytoplankton colonies.\n\nANSWER: C\nDISCUSSION:\nParagraph 3 mentions ecological concerns including 'acoustic emissions disturbing marine mammal navigation and hydrodynamic alterations impacting coastal benthic habitats'.\nLABELS: Literasi Bahasa Inggris, Detail Analysis",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Bahasa Inggris"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-17T08:00:00.000Z'
  },
  {
    id: 'q-bank-035',
    stimulus_id: 'english-marine-energy',
    chain_index: 5,
    body: "# Q35 (PILGAN)\nWhat tone does the author adopt regarding the future of marine energy commercialization?\n\n[[A]] Cynical and dismissive\n[[B]] Recklessly optimistic\n[[C]] Objective and pragmatic\n[[D]] Sarcastic and skeptical\n[[E]] Indifferent and disinterested\n\nANSWER: C\nDISCUSSION:\nThe author presents both the clear advantages (high predictability, energy density) and the genuine technical/ecological challenges objectively and pragmatically.\nLABELS: Literasi Bahasa Inggris, Author Tone",
    type: 'MCQ',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Bahasa Inggris"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-18T08:00:00.000Z'
  },
  {
    id: 'q-bank-036',
    stimulus_id: null,
    chain_index: null,
    body: "# Q36 (PILGAN)\nChoose the option that correctly completes the sentence:\n\"Had the meteorological department issued the warning earlier, the maritime fleet ______ in the harbor.\"\n\n[[A]] will remain\n[[B]] would have remained\n[[C]] would remain\n[[D]] has remained\n[[E]] had remained\n\nANSWER: B\nDISCUSSION:\nThis is a third conditional inversion (Past Unreal Conditional): 'Had + subject + past participle, subject + would have + past participle'.\nLABELS: Bahasa Inggris, Conditional Sentence",
    type: 'MCQ',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Bahasa Inggris"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-18T08:00:00.000Z'
  },
  {
    id: 'q-bank-037',
    stimulus_id: null,
    chain_index: null,
    body: "# Q37 (PILGAN)\nChoose the sentence that displays correct subject-verb agreement:\n\n[[A]] Neither the lead researcher nor his assistants was present at the conference.\n[[B]] Each of the experimental samples were labeled with a unique cryptographic barcode.\n[[C]] The team of aerospace engineers has successfully completed the telemetry trial.\n[[D]] A collection of classical literature manuscripts are on display in the museum.\n[[E]] Either the sensors or the battery pack have malfunctioned during descent.\n\nANSWER: C\nDISCUSSION:\n'The team' is a singular collective noun functioning as a unit, taking the singular verb 'has completed'.\nLABELS: Bahasa Inggris, Subject-Verb Agreement",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Bahasa Inggris"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-19T08:00:00.000Z'
  },
  {
    id: 'q-bank-038',
    stimulus_id: null,
    chain_index: null,
    body: "# Q38 (PILGAN)\nWhich word best completes the blank in context?\n\"The pharmaceutical committee requested additional clinical trials to verify that the vaccine produced ______ antibodies without causing severe adverse reactions.\"\n\n[[A]] transient\n[[B]] potent\n[[C]] nominal\n[[D]] arbitrary\n[[E]] hazardous\n\nANSWER: B\nDISCUSSION:\n'Potent' means having great power, influence, or effect (producing strong/effective antibodies).\nLABELS: Bahasa Inggris, Vocabulary in Context",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Bahasa Inggris"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-19T08:00:00.000Z'
  },
  {
    id: 'q-bank-039',
    stimulus_id: null,
    chain_index: null,
    body: "# Q39 (PILGAN)\nIdentify the sentence containing a misplaced modifier:\n\n[[A]] Walking through the park at sunrise, the morning mist was refreshing.\n[[B]] While preparing for the exam, she summarized all key formulas in a notebook.\n[[C]] After graduating from university, he joined an international research consortium.\n[[D]] Because the rain was torrential, we postponed the field expedition.\n[[E]] Driven by scientific curiosity, Marie Curie discovered two radioactive elements.\n\nANSWER: A\nDISCUSSION:\nIn sentence A, 'Walking through the park at sunrise' modifies 'the morning mist', which cannot walk! This is a classic dangling modifier.\nLABELS: Bahasa Inggris, Modifier Error",
    type: 'MCQ',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Bahasa Inggris"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-20T08:00:00.000Z'
  },
  {
    id: 'q-bank-040',
    stimulus_id: null,
    chain_index: null,
    body: "# Q40 (PILGAN)\nThe phrase **\"on the fence\"** in an idiom context signifies:\n\n[[A]] In an extremely hazardous situation\n[[B]] Undecided or hesitant between two options\n[[C]] Achieving total consensus\n[[D]] Operating beyond legal boundaries\n[[E]] Fully committed to a specific outcome\n\nANSWER: B\nDISCUSSION:\nThe idiom 'on the fence' means neutral, undecided, or unable to choose between two alternatives.\nLABELS: Bahasa Inggris, Idiomatic Expressions",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Bahasa Inggris"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-20T08:00:00.000Z'
  },
  {
    id: 'q-bank-041',
    stimulus_id: null,
    chain_index: null,
    body: "# Q41 (PILGAN)\nSuku ke-3 suatu barisan aritmetika adalah 11 dan suku ke-8 adalah 26. Berapakah jumlah 15 suku pertama barisan tersebut?\n\n[[A]] 345\n[[B]] 375\n[[C]] 390\n[[D]] 415\n[[E]] 435\n\nANSWER: C\nDISCUSSION:\n$U_3 = a + 2b = 11$, $U_8 = a + 7b = 26 \\rightarrow 5b = 15 \\rightarrow b = 3, a = 5$.\n$S_{15} = \\frac{15}{2}(2(5) + 14(3)) = 15 \\times 26 = 390$.\nLABELS: Barisan & Deret, Matematika",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Pemecahan Masalah"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-21T08:00:00.000Z'
  },
  {
    id: 'q-bank-042',
    stimulus_id: null,
    chain_index: null,
    body: "# Q42 (PILGAN)\nDari 7 orang siswa berprestasi akan dipilih suatu tim delegasi olimpiade yang beranggotakan 3 orang. Berapa banyak susunan tim berbeda yang dapat dibentuk?\n\n[[A]] 21\n[[B]] 35\n[[C]] 42\n[[D]] 120\n[[E]] 210\n\nANSWER: B\nDISCUSSION:\n$$C(7, 3) = \\frac{7 \\times 6 \\times 5}{3 \\times 2 \\times 1} = 35$$.\nLABELS: Kombinatorika, Peluang",
    type: 'MCQ',
    labels: {
      difficulty: ["Mudah"],
      subject: ["Pemecahan Masalah"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-21T08:00:00.000Z'
  },
  {
    id: 'q-bank-043',
    stimulus_id: null,
    chain_index: null,
    body: "# Q43 (PILGAN)\nSebuah kotak berisi 5 bola merah dan 3 bola biru. Jika diambil 2 bola sekaligus secara acak, berapakah peluang terambilnya 1 bola merah dan 1 bola biru?\n\n[[A]] 15/56\n[[B]] 15/28\n[[C]] 5/14\n[[D]] 3/8\n[[E]] 9/28\n\nANSWER: B\nDISCUSSION:\nTotal cara ambil 2 dari 8: $C(8,2) = 28$.\nCara ambil 1 merah & 1 biru: $C(5,1) \\times C(3,1) = 15$.\nPeluang $= 15/28$.\nLABELS: Peluang, Kombinasi",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Pemecahan Masalah"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-22T08:00:00.000Z'
  },
  {
    id: 'q-bank-044',
    stimulus_id: null,
    chain_index: null,
    body: "# Q44 (PILGAN)\nBerapakah sisa pembagian dari $3^{2026}$ jika dibagi dengan 5?\n\n[[A]] 1\n[[B]] 2\n[[C]] 3\n[[D]] 4\n[[E]] 0\n\nANSWER: D\nDISCUSSION:\nPeriode sisa $3^n \\pmod 5$: $3, 4, 2, 1$ (panjang periode 4).\n$2026 = 4 \\times 506 + 2$. Sisa sama dengan $3^2 = 9 \\equiv 4 \\pmod 5$.\nLABELS: Teori Bilangan, Aritmetika Modulo",
    type: 'MCQ',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Pemecahan Masalah"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-22T08:00:00.000Z'
  },
  {
    id: 'q-bank-045',
    stimulus_id: null,
    chain_index: null,
    body: "# Q45 (PILGAN)\nSuatu tangki air memiliki dua pipa pengisi. Pipa A dapat mengisi tangki hingga penuh dalam waktu 4 jam, sedangkan Pipa B dapat mengisi penuh dalam waktu 6 jam. Jika kedua pipa dibuka bersamaan, berapa waktu yang dibutuhkan untuk mengisi tangki tersebut hingga penuh?\n\n[[A]] 2 jam 12 menit\n[[B]] 2 jam 24 menit\n[[C]] 2 jam 30 menit\n[[D]] 2 jam 40 menit\n[[E]] 3 jam\n\nANSWER: B\nDISCUSSION:\nLaju gabungan: $1/4 + 1/6 = 5/12$ tangki/jam. Waktu $= 12/5 = 2,4$ jam $= 2$ jam 24 menit.\nLABELS: Aritmetika, Laju Alir",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Pemecahan Masalah"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-23T08:00:00.000Z'
  },
  {
    id: 'q-bank-046',
    stimulus_id: null,
    chain_index: null,
    body: "# Q46 (PILGAN)\nPersamaan garis singgung pada kurva $y = 2x^2 - 3x + 1$ di titik dengan absis $x = 2$ adalah:\n\n[[A]] $y = 5x - 7$\n[[B]] $y = 5x + 3$\n[[C]] $y = 7x - 11$\n[[D]] $y = 3x - 3$\n[[E]] $y = 4x - 5$\n\nANSWER: A\nDISCUSSION:\n$x = 2 \\rightarrow y = 2(4) - 6 + 1 = 3$. Titik $(2, 3)$.\n$m = y' = 4x - 3 = 4(2) - 3 = 5$.\n$y - 3 = 5(x - 2) \\rightarrow y = 5x - 7$.\nLABELS: Kalkulus, Garis Singgung Kurva",
    type: 'MCQ',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Pemecahan Masalah"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-23T08:00:00.000Z'
  },
  {
    id: 'q-bank-047',
    stimulus_id: null,
    chain_index: null,
    body: "# Q47 (PILGAN)\nPerhatikan data terurut berikut:\n$4, 6, 7, x, 11, 14, 19$\nJika median dari kumpulan data tersebut adalah 9, berapakah nilai rata-rata (*mean*) dari ketujuh bilangan tersebut?\n\n[[A]] 9,0\n[[B]] 9,5\n[[C]] 10,0\n[[D]] 10,5\n[[E]] 11,0\n\nANSWER: C\nDISCUSSION:\nMedian data ke-4 adalah $x = 9$.\nTotal $= 4 + 6 + 7 + 9 + 11 + 14 + 19 = 70$.\nRata-rata $= 70 / 7 = 10,0$.\nLABELS: Statistika, Ukuran Pemusatan",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Pemecahan Masalah"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-24T08:00:00.000Z'
  },
  {
    id: 'q-bank-048',
    stimulus_id: null,
    chain_index: null,
    body: "# Q48 (PILGAN)\nJika $\\log_2 3 = a$ dan $\\log_3 5 = b$, maka nilai dari $\\log_6 15$ dinyatakan dalam $a$ dan $b$ adalah:\n\n[[A]] $\\frac{a + b}{1 + a}$\n[[B]] $\\frac{a(1 + b)}{1 + a}$\n[[C]] $\\frac{1 + ab}{1 + a}$\n[[D]] $\\frac{a + ab}{a + 1}$\n[[E]] $\\frac{b(1 + a)}{1 + b}$\n\nANSWER: B\nDISCUSSION:\n$\\log_6 15 = \\frac{\\log_2 15}{\\log_2 6} = \\frac{\\log_2 3 + \\log_2 5}{1 + \\log_2 3} = \\frac{a + ab}{1 + a} = \\frac{a(1 + b)}{1 + a}$.\nLABELS: Logaritma, Aljabar",
    type: 'MCQ',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Pemecahan Masalah"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-24T08:00:00.000Z'
  },
  {
    id: 'q-bank-049',
    stimulus_id: null,
    chain_index: null,
    body: "# Q49 (PILGAN)\nHimpunan penyelesaian dari pertidaksamaan $|2x - 5| \\le 7$ adalah:\n\n[[A]] $-1 \\le x \\le 6$\n[[B]] $x \\le -1$ atau $x \\ge 6$\n[[C]] $1 \\le x \\le 7$\n[[D]] $-6 \\le x \\le 1$\n[[E]] $-2 \\le x \\le 5$\n\nANSWER: A\nDISCUSSION:\n$-7 \\le 2x - 5 \\le 7 \\rightarrow -2 \\le 2x \\le 12 \\rightarrow -1 \\le x \\le 6$.\nLABELS: Nilai Mutlak, Pertidaksamaan",
    type: 'MCQ',
    labels: {
      difficulty: ["Sedang"],
      subject: ["Pemecahan Masalah"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-25T08:00:00.000Z'
  },
  {
    id: 'q-bank-050',
    stimulus_id: null,
    chain_index: null,
    body: "# Q50 (ESSAY)\nSebuah perusahaan manufaktur memproduksi $x$ unit barang per hari dengan fungsi biaya total:\n$$C(x) = 2x^2 + 40x + 1800$$\n(dalam ribuan rupiah). Setiap unit barang dijual dengan harga pasar tetap sebesar $Rp200.000,00$ ($200$ ribu rupiah).\nTentukan:\na) Fungsi keuntungan total $P(x)$.\nb) Jumlah produksi harian $x$ yang memaksimumkan keuntungan.\nc) Nilai keuntungan maksimum yang dapat dicapai perusahaan tersebut!\n\nANSWER: ESSAY\nDISCUSSION:\na) Pendapatan $R(x) = 200x$. Keuntungan $P(x) = 200x - (2x^2 + 40x + 1800) = -2x^2 + 160x - 1800$.\nb) $P'(x) = -4x + 160 = 0 \\rightarrow x = 40$ unit/hari.\nc) Keuntungan maksimum: $P(40) = -2(1600) + 6400 - 1800 = 1400$ ribu rupiah (Rp1.400.000,00 per hari).\nLABELS: Matematika, Optimasi Ekonomi, Kalkulus Terapan",
    type: 'ESSAY',
    labels: {
      difficulty: ["Sulit"],
      subject: ["Pemecahan Masalah"],
      ageRange: ["SMA / UTBK"]
    },
    created_at: '2026-02-25T08:00:00.000Z'
  }
];


export interface MockAttemptRecord {
  id: string;
  test_id: string;
  student_id: string | null;
  responses: Record<string, string>;
  tips_used: Record<string, { theory: number; practice: number }>;
  score: number;
  status: 'finished' | 'in_progress';
  finished_at: string;
  violation_count: number;
  created_at: string;
}

export const INITIAL_ATTEMPTS: MockAttemptRecord[] = [
  {
    id: 'mock-att-001',
    test_id: 'mock-test-1',
    student_id: 'EXA-001',
    responses: {
      '1': 'C', '2': 'B', '3': 'D', '4': 'B', '5': 'C',
      '6': 'C', '7': 'D', '8': 'A', '9': 'A', '10': 'B',
      '11': 'B', '12': 'C', '13': 'A', '14': 'C', '15': 'C',
      '16': 'A', '17': 'C', '18': 'C', '19': 'D', '20': 'A',
      '21': 'A', '22': 'B', '23': 'C', '24': 'B', '25': 'B',
      '26': 'B', '27': 'C', '28': 'C', '29': 'A', '30': 'B',
      '31': 'B', '32': 'C', '33': 'B', '34': 'C', '35': 'C',
      '36': 'B', '37': 'A', '38': 'B', '39': 'A', '40': 'B',
      '41': 'C', '42': 'B', '43': 'B', '44': 'D', '45': 'B',
      '46': 'A', '47': 'C', '48': 'B'
    },
    tips_used: {},
    score: 84,
    status: 'finished',
    finished_at: '2026-02-15T10:30:00.000Z',
    violation_count: 0,
    created_at: '2026-02-15T09:45:00.000Z'
  }
];
