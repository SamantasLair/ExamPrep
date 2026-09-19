import type { Course, CourseCategory } from '@/lib/types';

export const SAMPLE_GEOM_CATEGORIES: CourseCategory[] = [
  {
    id: 'cat-geom-01',
    course_id: 'course-geom-01',
    title: 'Fondasi Vektor & Koordinat Tiga Dimensi',
    description: 'Pemahaman sistem koordinat kartesius 3D, representasi vektor posisi, dan operasi aljabar vektor.',
    order_index: 1,
    chapters: [
      {
        id: 'chap-geom-101',
        category_id: 'cat-geom-01',
        title: 'Sistem Koordinat Kartesius & Vektor Posisi ℝ³',
        description: 'Pengenalan ruang tiga dimensi, vektor baris dan kolom, panjang vektor, serta vektor satuan.',
        order_index: 1,
        subchapters: [
          {
            id: 'sub-geom-101-1',
            chapter_id: 'chap-geom-101',
            title: 'Pengantar Ruang 3 Dimensi & Vektor Satuan',
            description: 'Memahami basis standar $\\mathbf{i}, \\mathbf{j}, \\mathbf{k}$ dan representasi geometris di ruang Euclid.',
            order_index: 1,
            materials: [
              {
                id: 'mat-geom-101-1-1',
                subchapter_id: 'sub-geom-101-1',
                title: 'Konsep Dasar Vektor dan Sistem Sumbu Tiga Dimensi',
                content: `### Sistem Koordinat Tiga Dimensi\n\nRuang Euclid tiga dimensi didefinisikan dengan tiga sumbu yang saling tegak lurus: sumbu-$X$, sumbu-$Y$, dan sumbu-$Z$.\n\n> [!NOTE]\n> Setiap titik $P(x, y, z)$ dalam ruang memiliki vektor posisi $\\vec{r} = x\\mathbf{i} + y\\mathbf{j} + z\\mathbf{k}$ dengan panjang $\\|\\vec{r}\\| = \\sqrt{x^2 + y^2 + z^2}$.\n\nBerikut sketsa diagram vektor posisi pada bidang proyeksi ortogonal:\n\n[DIAGRAM]\ntype: geometry\nbounds: -1, 5, 5, -1\naxis: on\ngrid: on\npoint O: 0, 0, color=#64748b, size=4\npoint P: 3, 4, color=#2563eb, size=5\nline O -> P, stroke=#2563eb, width=2\n[/DIAGRAM]\n\nOperasi penjumlahan dua vektor $\\vec{u} = \\langle u_1, u_2, u_3 \\rangle$ dan $\\vec{v} = \\langle v_1, v_2, v_3 \\rangle$ bersifat analitis komponen per komponen:\n$$\\vec{u} + \\vec{v} = \\langle u_1 + v_1, u_2 + v_2, u_3 + v_3 \\rangle$$`,
                order_index: 1,
                estimated_read_minutes: 8
              }
            ],
            exercises: [
              {
                id: 'ex-geom-101-1-1',
                subchapter_id: 'sub-geom-101-1',
                title: 'Latihan Terpandu: Panjang Vektor & Vektor Satuan',
                material_content: `Petunjuk: Gunakan rumus panjang vektor $\\|\\vec{v}\\| = \\sqrt{v_1^2 + v_2^2 + v_3^2}$. Vektor satuan diperoleh dengan membagi setiap komponen dengan panjangnya.`,
                question_ids: ['q-geom-ex-1'],
                order_index: 1
              }
            ],
            quizzes: [
              {
                id: 'quiz-geom-101-1-1',
                subchapter_id: 'sub-geom-101-1',
                title: 'Kuis Evaluasi: Vektor Posisi Dasar',
                question_ids: ['q-geom-quiz-1'],
                passing_score: 70,
                order_index: 1
              }
            ]
          },
          {
            id: 'sub-geom-101-2',
            chapter_id: 'chap-geom-101',
            title: 'Operasi Aljabar Vektor: Perkalian Titik (Dot Product)',
            description: 'Aplikasi perkalian skalar untuk menentukan sudut apit dua vektor dan ortogonalitas.',
            order_index: 2,
            materials: [
              {
                id: 'mat-geom-101-2-1',
                subchapter_id: 'sub-geom-101-2',
                title: 'Perkalian Skalar dan Karakteristik Sudut Apit',
                content: `### Perkalian Titik (*Dot Product*)\n\nPerkalian titik antara $\\vec{u}$ dan $\\vec{v}$ menghasilkan bilangan skalar:\n$$\\vec{u} \\cdot \\vec{v} = u_1 v_1 + u_2 v_2 + u_3 v_3 = \\|\\vec{u}\\| \\|\\vec{v}\\| \\cos\\theta$$\n\n> [!IMPORTANT]\n> Dua vektor tak-nol saling tegak lurus (ortogonal) jika dan hanya jika $\\vec{u} \\cdot \\vec{v} = 0$.`,
                order_index: 1,
                estimated_read_minutes: 10
              }
            ],
            exercises: [
              {
                id: 'ex-geom-101-2-1',
                subchapter_id: 'sub-geom-101-2',
                title: 'Latihan OpenBook: Perhitungan Kosinus Sudut Apit',
                material_content: `Ingat: $\\cos\\theta = \\frac{\\vec{u} \\cdot \\vec{v}}{\\|\\vec{u}\\| \\|\\vec{v}\\|}$.`,
                question_ids: ['q-geom-ex-2'],
                order_index: 1
              }
            ],
            quizzes: [
              {
                id: 'quiz-geom-101-2-1',
                subchapter_id: 'sub-geom-101-2',
                title: 'Kuis Evaluasi: Perkalian Titik & Ortogonalitas',
                question_ids: ['q-geom-quiz-2'],
                passing_score: 70,
                order_index: 1
              }
            ]
          }
        ]
      },
      {
        id: 'chap-geom-102',
        category_id: 'cat-geom-01',
        title: 'Perkalian Silang (Cross Product) & Vektor Normal',
        description: 'Kalkulasi determinan matriks 3x3 untuk vektor tegak lurus bersama dan luas jajar genjang.',
        order_index: 2,
        subchapters: [
          {
            id: 'sub-geom-102-1',
            chapter_id: 'chap-geom-102',
            title: 'Kalkulasi Cross Product & Sifat Antikomutatif',
            description: 'Menghitung $\\vec{u} \\times \\vec{v}$ dan menerapkan aturan tangan kanan.',
            order_index: 1,
            materials: [
              {
                id: 'mat-geom-102-1-1',
                subchapter_id: 'sub-geom-102-1',
                title: 'Rumus Determinan Cross Product',
                content: `### Cross Product\n\n$$\\vec{u} \\times \\vec{v} = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ u_1 & u_2 & u_3 \\\\ v_1 & v_2 & v_3 \\end{vmatrix}$$`,
                order_index: 1,
                estimated_read_minutes: 12
              }
            ],
            exercises: [
              {
                id: 'ex-geom-102-1-1',
                subchapter_id: 'sub-geom-102-1',
                title: 'Latihan: Luas Jajargenjang Berbasis Cross Product',
                question_ids: ['q-geom-ex-3'],
                order_index: 1
              }
            ],
            quizzes: [
              {
                id: 'quiz-geom-102-1-1',
                subchapter_id: 'sub-geom-102-1',
                title: 'Kuis Evaluasi: Perkalian Silang',
                question_ids: ['q-geom-quiz-3'],
                passing_score: 70,
                order_index: 1
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cat-geom-02',
    course_id: 'course-geom-01',
    title: 'Garis, Bidang, dan Kedudukan Objek di Ruang',
    description: 'Persamaan parametrik garis lurus, persamaan umum bidang datar, dan interaksi spasial.',
    order_index: 2,
    chapters: [
      {
        id: 'chap-geom-201',
        category_id: 'cat-geom-02',
        title: 'Persamaan Garis Lurus di Ruang Tiga Dimensi',
        description: 'Bentuk vektor dan simetris garis melalui titik tertentu dengan vektor arah.',
        order_index: 1,
        subchapters: [
          {
            id: 'sub-geom-201-1',
            chapter_id: 'chap-geom-201',
            title: 'Persamaan Vektor & Parametrik Garis Lurus',
            description: 'Menyusun $\\mathbf{r}(t) = \\mathbf{r}_0 + t\\mathbf{v}$ untuk $t \\in \\mathbb{R}$.',
            order_index: 1,
            materials: [
              {
                id: 'mat-geom-201-1-1',
                subchapter_id: 'sub-geom-201-1',
                title: 'Representasi Garis Spasial',
                content: `### Garis di ℝ³\n\nGaris lurus yang melalui titik $P_0(x_0, y_0, z_0)$ searah vektor $\\vec{v} = \\langle a, b, c \\rangle$ memiliki bentuk parametrik:\n$$x = x_0 + at, \\quad y = y_0 + bt, \\quad z = z_0 + ct$$`,
                order_index: 1,
                estimated_read_minutes: 10
              }
            ],
            exercises: [
              {
                id: 'ex-geom-201-1-1',
                subchapter_id: 'sub-geom-201-1',
                title: 'Latihan: Titik Potong Garis dengan Bidang Koordinat',
                question_ids: ['q-geom-ex-4'],
                order_index: 1
              }
            ],
            quizzes: [
              {
                id: 'quiz-geom-201-1-1',
                subchapter_id: 'sub-geom-201-1',
                title: 'Kuis: Persamaan Garis di Ruang',
                question_ids: ['q-geom-quiz-4'],
                passing_score: 70,
                order_index: 1
              }
            ]
          }
        ]
      },
      {
        id: 'chap-geom-202',
        category_id: 'cat-geom-02',
        title: 'Persamaan Bidang Datar & Jarak Titik ke Bidang',
        description: 'Vektor normal bidang datar $Ax + By + Cz + D = 0$ dan formula jarak ortogonal.',
        order_index: 2,
        subchapters: [
          {
            id: 'sub-geom-202-1',
            chapter_id: 'chap-geom-202',
            title: 'Formulasi Persamaan Bidang Datar',
            description: 'Menentukan bidang datar dari vektor normal dan satu titik yang dilalui.',
            order_index: 1,
            materials: [
              {
                id: 'mat-geom-202-1-1',
                subchapter_id: 'sub-geom-202-1',
                title: 'Bidang Datar di Ruang',
                content: `### Persamaan Bidang\n\nJika $\\vec{n} = \\langle A, B, C \\rangle$ tegak lurus bidang dan melalui titik $(x_0, y_0, z_0)$, maka:\n$$A(x - x_0) + B(y - y_0) + C(z - z_0) = 0$$`,
                order_index: 1,
                estimated_read_minutes: 10
              }
            ],
            exercises: [
              {
                id: 'ex-geom-202-1-1',
                subchapter_id: 'sub-geom-202-1',
                title: 'Latihan: Persamaan Bidang dari Tiga Titik',
                question_ids: ['q-geom-ex-5'],
                order_index: 1
              }
            ],
            quizzes: [
              {
                id: 'quiz-geom-202-1-1',
                subchapter_id: 'sub-geom-202-1',
                title: 'Kuis: Bidang Datar',
                question_ids: ['q-geom-quiz-5'],
                passing_score: 70,
                order_index: 1
              }
            ]
          },
          {
            id: 'sub-geom-202-2',
            chapter_id: 'chap-geom-202',
            title: 'Jarak Terpendek Titik ke Bidang Datar',
            description: 'Perhitungan jarak titik $(x_1, y_1, z_1)$ ke bidang datar $Ax + By + Cz + D = 0$.',
            order_index: 2,
            materials: [
              {
                id: 'mat-geom-202-2-1',
                subchapter_id: 'sub-geom-202-2',
                title: 'Formula Jarak Titik ke Bidang',
                content: `### Jarak Titik ke Bidang\n\n$$d = \\frac{|Ax_1 + By_1 + Cz_1 + D|}{\\sqrt{A^2 + B^2 + C^2}}$$`,
                order_index: 1,
                estimated_read_minutes: 10
              }
            ],
            exercises: [
              {
                id: 'ex-geom-202-2-1',
                subchapter_id: 'sub-geom-202-2',
                title: 'Latihan: Jarak Titik Sudut Kubus ke Bidang Diagonal',
                question_ids: ['q-geom-ex-6'],
                order_index: 1
              }
            ],
            quizzes: [
              {
                id: 'quiz-geom-202-2-1',
                subchapter_id: 'sub-geom-202-2',
                title: 'Kuis Evaluasi: Jarak & Dimensi Tiga',
                question_ids: ['q-geom-quiz-6'],
                passing_score: 70,
                order_index: 1
              }
            ]
          }
        ]
      }
    ]
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-geom-01',
    slug: 'geometri-analitik-ruang',
    title: 'Geometri Analitik & Bangun Ruang 3D',
    description: 'Konsep dasar vektor ruang, persamaan bidang dan bola, proyeksi ortogonal, serta jarak titik ke bidang dalam dimensi tiga.',
    cover_url: '',
    level: 'SMA',
    tags: ['Geometri', 'Dimensi Tiga', 'Vektor', 'Aljabar Linear'],
    estimated_hours: 12,
    created_at: '2026-03-01T08:00:00.000Z',
    updated_at: '2026-03-10T12:00:00.000Z',
    categories: SAMPLE_GEOM_CATEGORIES
  },
  {
    id: 'course-alj-01',
    slug: 'aljabar-polinomial-matriks',
    title: 'Aljabar Lanjut: Polinomial & Matriks',
    description: 'Eksplorasi teorema sisa suku banyak, faktorisasi rasional, operasi matriks, determinan, dan inversi untuk pemecahan sistem SPL.',
    cover_url: '',
    level: 'SMA',
    tags: ['Aljabar', 'Polinomial', 'Matriks', 'SPLDV'],
    estimated_hours: 10,
    created_at: '2026-03-02T09:00:00.000Z',
    updated_at: '2026-03-12T14:30:00.000Z',
    categories: [
      {
        id: 'cat-alj-01',
        course_id: 'course-alj-01',
        title: 'Polinomial & Teorema Sisa Aljabar',
        description: 'Pembagian suku banyak Horner, faktorisasi rasional, dan teorema akar Vieta.',
        order_index: 1,
        chapters: [
          {
            id: 'chap-alj-101',
            category_id: 'cat-alj-01',
            title: 'Pembagian Polinomial & Algoritma Horner',
            description: 'Metode pembagian bersusun dan sintetik Horner pada suku banyak berderajat $n$.',
            order_index: 1,
            subchapters: [
              {
                id: 'sub-alj-101-1',
                chapter_id: 'chap-alj-101',
                title: 'Teorema Sisa dan Teorema Faktor',
                description: 'Karakteristik sisa $P(k)$ saat suku banyak dibagi oleh $(x - k)$.',
                order_index: 1,
                materials: [
                  {
                    id: 'mat-alj-101-1-1',
                    subchapter_id: 'sub-alj-101-1',
                    title: 'Prinsip Dasar Teorema Sisa & Skema Horner',
                    content: `### Teorema Sisa\n\nJika suatu suku banyak $P(x)$ berderajat $n$ dibagi oleh pembagi linear $(x - k)$, maka sisa pembagiannya adalah bilangan skalar konstan $R$ yang memenuhi:\n$$R = P(k)$$\n\n> [!NOTE]\n> Teorema Faktor menyatakan bahwa $(x - k)$ merupakan faktor dari polinomial $P(x)$ jika dan hanya jika $P(k) = 0$.\n\nBerikut visualisasi kurva polinomial kubik $P(x) = x^3 - 3x - 2$ beserta penandaan akar real:\n\n[DIAGRAM]\ntype: geometry\nbounds: -4, 4, 4, -4\naxis: on\ngrid: on\nfn f = x^3 - 3*x - 2, stroke=#2563eb, width=2\npoint P1: 2, 0, color=#ef4444, size=4\npoint P2: -1, 0, color=#ef4444, size=4\n[/DIAGRAM]\n\nBerdasarkan skema Horner untuk pembagian oleh $(x - k)$, koefisien hasil bagi diperoleh secara rekursif:\n$$b_{i} = a_{i} + k \\cdot b_{i+1}$$`,
                    order_index: 1,
                    estimated_read_minutes: 10
                  }
                ],
                exercises: [
                  {
                    id: 'ex-alj-101-1-1',
                    subchapter_id: 'sub-alj-101-1',
                    title: 'Latihan Horner & Sisa Pembagian',
                    material_content: `Gunakan substitusi langsung atau skema Horner. Nilai sisa pembagian $P(x)$ oleh $(x - k)$ sama dengan $P(k)$.`,
                    question_ids: ['q-alj-ex-1'],
                    order_index: 1
                  }
                ],
                quizzes: [
                  {
                    id: 'quiz-alj-101-1-1',
                    subchapter_id: 'sub-alj-101-1',
                    title: 'Kuis Teorema Sisa',
                    question_ids: ['q-alj-quiz-1'],
                    passing_score: 70,
                    order_index: 1
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-kalk-01',
    slug: 'kalkulus-diferensial-integral',
    title: 'Kalkulus Diferensial & Integral Terapan',
    description: 'Penguasaan limit kontinuitas, aturan turunan rantai, integral substitusi dan parsial, serta optimasi titik ekstrem fungsi kontemporer.',
    cover_url: '',
    level: 'UTBK',
    tags: ['Kalkulus', 'Turunan', 'Integral', 'Optimasi'],
    estimated_hours: 18,
    created_at: '2026-03-03T10:00:00.000Z',
    updated_at: '2026-03-14T09:15:00.000Z',
    categories: [
      {
        id: 'cat-kalk-01',
        course_id: 'course-kalk-01',
        title: 'Kalkulus Diferensial & Turunan Rantai',
        description: 'Konsep limit kontinuitas, turunan fungsi trigonometri, dan optimasi ekstrem.',
        order_index: 1,
        chapters: [
          {
            id: 'chap-kalk-101',
            category_id: 'cat-kalk-01',
            title: 'Aturan Rantai & Turunan Lanjut',
            description: 'Diferensiasi fungsi komposisi dan fungsi implisit.',
            order_index: 1,
            subchapters: [
              {
                id: 'sub-kalk-101-1',
                chapter_id: 'chap-kalk-101',
                title: 'Aturan Rantai pada Fungsi Majemuk',
                description: 'Formula $\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$.',
                order_index: 1,
                materials: [
                  {
                    id: 'mat-kalk-101-1-1',
                    subchapter_id: 'sub-kalk-101-1',
                    title: 'Konsep Aturan Rantai & Garis Singgung Kurva',
                    content: `### Aturan Rantai Diferensiasi\n\nUntuk fungsi komposisi $y = f(g(x))$, jika $u = g(x)$ diferensiabel pada $x$ dan $y = f(u)$ diferensiabel pada $u$, maka laju perubahan sesaat didefinisikan sebagai:\n$$\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx} = f'(g(x)) \\cdot g'(x)$$\n\n> [!IMPORTANT]\n> Gradien garis singgung $m$ kurva $y = f(x)$ pada titik $(x_0, y_0)$ adalah nilai turunan pertama di titik tersebut: $m = f'(x_0)$.\n\nBerikut representasi grafis fungsi kuadrat $f(x) = x^2 - 2x - 1$ beserta titik balik minimum $(1, -2)$:\n\n[DIAGRAM]\ntype: geometry\nbounds: -3, 3, 5, -3\naxis: on\ngrid: on\nfn f = x^2 - 2*x - 1, stroke=#10b981, width=2\npoint Min: 1, -2, color=#f59e0b, size=4\n[/DIAGRAM]\n\nPersamaan garis singgung pada absis $x_0$ ditentukan dengan relasi ortogonal atau titik-gradien:\n$$y - y_0 = m(x - x_0)$$`,
                    order_index: 1,
                    estimated_read_minutes: 10
                  }
                ],
                exercises: [
                  {
                    id: 'ex-kalk-101-1-1',
                    subchapter_id: 'sub-kalk-101-1',
                    title: 'Latihan Aturan Rantai Bertingkat',
                    material_content: `Misalkan $u = g(x)$, tentukan $\\frac{dy}{du}$ dan $\\frac{du}{dx}$, kemudian kalikan keduanya untuk mendapatkan $\\frac{dy}{dx}$.`,
                    question_ids: ['q-kalk-ex-1'],
                    order_index: 1
                  }
                ],
                quizzes: [
                  {
                    id: 'quiz-kalk-101-1-1',
                    subchapter_id: 'sub-kalk-101-1',
                    title: 'Kuis Aturan Rantai',
                    question_ids: ['q-kalk-quiz-1'],
                    passing_score: 70,
                    order_index: 1
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'course-fis-01',
    slug: 'mekanika-klasik-fluida',
    title: 'Mekanika Klasik & Dinamika Fluida',
    description: 'Hukum gerak Newton, dinamika rotasi benda tegar, momen inersia, hukum Bernoulli, serta fenomena fluida dinamis dalam konteks sains terapan.',
    cover_url: '',
    level: 'UTBK',
    tags: ['Fisika', 'Mekanika', 'Fluida', 'Dinamika Rotasi'],
    estimated_hours: 16,
    created_at: '2026-03-04T11:00:00.000Z',
    updated_at: '2026-03-15T11:00:00.000Z'
  },
  {
    id: 'course-log-01',
    slug: 'penalaran-logika-analitik',
    title: 'Penalaran Umum & Logika Analitik SNBT',
    description: 'Strategi pemecahan masalah silogisme formal, kontraposisi, diagram Euler-Venn, penalaran induktif-deduktif, dan analisis urutan kritis.',
    cover_url: '',
    level: 'UTBK',
    tags: ['Logika', 'Silogisme', 'Penalaran Analitik', 'SNBT'],
    estimated_hours: 14,
    created_at: '2026-03-05T08:30:00.000Z',
    updated_at: '2026-03-16T15:20:00.000Z'
  },
  {
    id: 'course-stat-01',
    slug: 'statistika-peluang-kombinatorika',
    title: 'Statistika Inferensial & Kombinatorika',
    description: 'Prinsip pencacahan perkalian, permutasi siklis, kombinasi binomium, distribusi frekuensi, serta nilai harapan peluang majemuk.',
    cover_url: '',
    level: 'SMA',
    tags: ['Statistika', 'Peluang', 'Kombinatorika', 'Distribusi Normal'],
    estimated_hours: 12,
    created_at: '2026-03-06T13:00:00.000Z',
    updated_at: '2026-03-17T16:00:00.000Z'
  },
  {
    id: 'course-olim-01',
    slug: 'teori-bilangan-olimpiade',
    title: 'Masterclass Teori Bilangan Olimpiade Sains',
    description: 'Aritmetika modular tingkat tinggi, teorema sisa Tiongkok (CRT), fungsi Euler phi, persamaan Diophantine, dan bilangan prima distribusi.',
    cover_url: '',
    level: 'OLIMPIADE',
    tags: ['Olimpiade', 'Teori Bilangan', 'Modulo', 'OSN'],
    estimated_hours: 24,
    created_at: '2026-03-07T10:00:00.000Z',
    updated_at: '2026-03-18T10:00:00.000Z'
  },
  {
    id: 'course-eng-01',
    slug: 'literasi-bahasa-inggris-akademik',
    title: 'Literasi Bahasa Inggris & Analisis Wacana',
    description: 'Analisis struktur teks argumen ilmiah, inferensi makna kontekstual, pemahaman nada penulis (*author tone*), dan *reading comprehension* komprehensif.',
    cover_url: '',
    level: 'UTBK',
    tags: ['Bahasa Inggris', 'Reading Comprehension', 'Literasi', 'SNBT'],
    estimated_hours: 10,
    created_at: '2026-03-08T09:00:00.000Z',
    updated_at: '2026-03-18T14:00:00.000Z'
  }
];

export function getCourseByIdOrSlug(idOrSlug: string): Course | undefined {
  return INITIAL_COURSES.find(
    (c) => c.id === idOrSlug || c.slug === idOrSlug
  );
}

export interface SubChapterContext {
  course: Course;
  category?: Course['categories'] extends (infer U)[] | undefined ? U : never;
  chapter?: Course['categories'] extends (infer Cat)[] | undefined ? Cat extends { chapters?: (infer Chap)[] } ? Chap : never : never;
  subchapter?: Course['categories'] extends (infer Cat)[] | undefined ? Cat extends { chapters?: (infer Chap)[] } ? Chap extends { subchapters?: (infer Sub)[] } ? Sub : never : never : never;
}

export function getSubChapterContext(courseIdOrSlug: string, subChapterId: string) {
  const course = getCourseByIdOrSlug(courseIdOrSlug);
  if (!course || !course.categories) return undefined;

  for (const category of course.categories) {
    for (const chapter of category.chapters || []) {
      for (const subchapter of chapter.subchapters || []) {
        if (subchapter.id === subChapterId) {
          return {
            course,
            category,
            chapter,
            subchapter,
          };
        }
      }
    }
  }

  return undefined;
}

export interface CourseProgressCalculationOptions {
  completedMaterials?: string[];
  exerciseScores?: Record<string, number>;
  quizScores?: Record<string, number>;
}

export interface CourseProgressResult {
  overallPercentage: number;
  totalUnits: number;
  completedUnits: number;
  materialsCount: number;
  completedMaterialsCount: number;
  exercisesCount: number;
  completedExercisesCount: number;
  quizzesCount: number;
  passedQuizzesCount: number;
}

/**
 * Calculates curriculum progress weight and percentage across a course.
 * Handles zero-division guard (returns 0 when total units = 0).
 */
export function calculateCourseProgress(
  course: Course | null | undefined,
  options?: CourseProgressCalculationOptions
): CourseProgressResult {
  if (!course || !course.categories || course.categories.length === 0) {
    return {
      overallPercentage: 0,
      totalUnits: 0,
      completedUnits: 0,
      materialsCount: 0,
      completedMaterialsCount: 0,
      exercisesCount: 0,
      completedExercisesCount: 0,
      quizzesCount: 0,
      passedQuizzesCount: 0,
    };
  }

  const completedMaterialsSet = new Set(options?.completedMaterials || []);
  const exerciseScores = options?.exerciseScores || {};
  const quizScores = options?.quizScores || {};

  let materialsCount = 0;
  let completedMaterialsCount = 0;
  let exercisesCount = 0;
  let completedExercisesCount = 0;
  let quizzesCount = 0;
  let passedQuizzesCount = 0;

  for (const category of course.categories) {
    for (const chapter of category.chapters || []) {
      for (const subChapter of chapter.subchapters || []) {
        // Count materials
        for (const mat of subChapter.materials || []) {
          materialsCount++;
          if (completedMaterialsSet.has(mat.id)) {
            completedMaterialsCount++;
          }
        }
        // Count exercises
        for (const ex of subChapter.exercises || []) {
          exercisesCount++;
          if (exerciseScores[ex.id] !== undefined) {
            completedExercisesCount++;
          }
        }
        // Count quizzes
        for (const quiz of subChapter.quizzes || []) {
          quizzesCount++;
          const score = quizScores[quiz.id];
          if (score !== undefined && score >= (quiz.passing_score ?? 70)) {
            passedQuizzesCount++;
          }
        }
      }
    }
  }

  const totalUnits = materialsCount + exercisesCount + quizzesCount;
  const completedUnits = completedMaterialsCount + completedExercisesCount + passedQuizzesCount;

  // Zero-division guard
  const overallPercentage = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  return {
    overallPercentage,
    totalUnits,
    completedUnits,
    materialsCount,
    completedMaterialsCount,
    exercisesCount,
    completedExercisesCount,
    quizzesCount,
    passedQuizzesCount,
  };
}

/**
 * Evaluates whether a subchapter or quiz is locked based on prerequisite quizzes and scores.
 */
export function isSubChapterLocked(
  quizzes: { id: string; passing_score?: number }[] | undefined,
  quizScores: Record<string, number> | undefined
): boolean {
  if (!quizzes || quizzes.length === 0) return false;
  const scores = quizScores || {};
  return quizzes.some((q) => {
    const score = scores[q.id];
    return score !== undefined && score < (q.passing_score ?? 70);
  });
}

