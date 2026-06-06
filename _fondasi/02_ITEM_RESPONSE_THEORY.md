# 📊 Analisis Butir Soal: Deterministik Klasik (Tanpa Machine Learning)

*Konteks: Bagian dari [[00_FONDASI_INDEX]]*

Pada modul Analisis Dasbor Admin, sistem ExamPreparer menyajikan metrik "Tingkat Kesukaran". Berlawanan dengan asumsi awal, fitur ini **tidak dibangun menggunakan Machine Learning (AI)**, melainkan berbasis pada matematika deterministik murni dari kerangka *Classical Test Theory* (CTT).

## 1. Classical Test Theory (CTT) vs Item Response Theory (IRT)

Dalam keilmuan *Psychometrics* dan *Educational Data Mining*, terdapat dua pendekatan evaluasi kualitas soal:
- **IRT (Item Response Theory):** Pendekatan kompleks berbantuan *Machine Learning* yang menghitung probabilitas laten siswa berdasarkan lengkung karakteristik butir soal (ICC). 
- **CTT (Classical Test Theory):** Pendekatan statistik klasik yang menggunakan probabilitas rata-rata dari populasi yang ada. Pendekatan inilah yang **kita gunakan di ExamPreparer**.

Alasan kita menggunakan CTT (sering disebut Analisis Proporsi):
1. **Sangat Ringan:** Tidak butuh pelatihan (*training*) model, menghemat 100% *server cost* komputasi GPU/ML.
2. **Skalabilitas:** Dapat dieksekusi murni menggunakan kalkulasi SQL standar (`O(1)` kompleksitas komputasi via *Push-Down Aggregation*).
3. **Deterministik:** Hasilnya akurat dan stabil secara mutlak berdasarkan riwayat pengerjaan.

## 2. Rumus Matematika (Tingkat Kesukaran / *p-value*)

Indeks Tingkat Kesukaran (dilambangkan dengan $p$) menyatakan proporsi peserta tes yang dapat menjawab butir soal tersebut dengan benar.

Rumus matematikanya didefinisikan sebagai:
$$ p = \frac{N_c}{N} $$

- $p$ = Tingkat Kesukaran (*Difficulty Index*), bernilai antara $0.0$ hingga $1.0$.
- $N_c$ = Jumlah peserta yang menjawab soal tersebut dengan **benar** (*Correct*).
- $N$ = Total seluruh peserta yang menjawab soal tersebut.

### Interpretasi Skala ($p$)
Berdasarkan standar psikometri umum, sistem kita mengelompokkan skor $p$ sebagai berikut:

- $p < 0.3$: **Terlalu Sulit** (Hanya kurang dari 30% siswa yang berhasil menjawab). Soal direkomendasikan untuk direvisi karena kemungkinan mengecoh atau terlalu tinggi level kognitifnya.
- $0.3 \le p \le 0.8$: **Ideal** (Soal mampu membedakan kemampuan siswa dengan proporsi wajar).
- $p > 0.8$: **Terlalu Mudah** (Lebih dari 80% siswa berhasil menjawab). Soal direkomendasikan untuk diganti karena kurang menantang secara kognitif.

## 3. Eksekusi di Database (SQL)

Di sistem ExamPreparer, rumus di atas **tidak** diproses di *browser* Admin (karena jika ada 100.000 peserta, *browser* akan mogok kehabisan RAM). Rumus ini dieksekusi di *Server* menggunakan fungsi RPC PostgreSQL (lihat [[04_DATA_INTENSIVE_RPC]]).

```sql
-- Cuplikan algoritma di server
(correct_hits::numeric / v_total_attempts)::numeric as p_score
```

Kesimpulannya, ExamPreparer memanfaatkan teori edukasi statistik formal untuk mencapai kapabilitas *Enterprise* tanpa membebani sistem dengan kompleksitas *Machine Learning* yang tidak perlu.
