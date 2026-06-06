import os
import glob

# Definisikan folder tempat soal berada
folder_path = r"c:\laragon\www\_MyCV\ExamPreparer\Soal\S1Ilkom\NLP\NLP_S1_20260606_120313"

# Cari semua file txt yang digenerate (soal_nlp_s1*.txt)
# Urutkan berdasarkan nama agar part1 - part6 urut
# Note: soal_nlp_s1.txt (part 1) perlu ditangani khusus agar berada di depan
all_files = glob.glob(os.path.join(folder_path, "soal_nlp_s1*.txt"))

# Memisahkan part 1 (tanpa embel-embel "part") dan part lainnya
part1_file = os.path.join(folder_path, "soal_nlp_s1.txt")
other_parts = [f for f in all_files if f != part1_file and "FULL" not in f]

# Mengurutkan part 2 sampai part 6 secara alfabetik/numerik
other_parts.sort()

# Menggabungkan kembali
files_to_merge = []
if os.path.exists(part1_file):
    files_to_merge.append(part1_file)
files_to_merge.extend(other_parts)

output_file = os.path.join(folder_path, "soal_nlp_s1_FULL.txt")

print(f"Menemukan {len(files_to_merge)} file untuk digabung...")

with open(output_file, 'w', encoding='utf-8') as outfile:
    for i, fname in enumerate(files_to_merge):
        print(f"Membaca {fname}...")
        with open(fname, 'r', encoding='utf-8') as infile:
            content = infile.read().strip()
            # Bersihkan tag ```text di awal dan akhir jika ada, karena kita ingin menggabungkannya jadi 1 file teks bersih (atau gabungan blok markdown)
            # Karena exaprep butuh dibungkus dalam SATU blok kode markdown ```text ... ```, 
            # kita akan menghapus semua tag ```text dan ``` yang ada di setiap file, lalu kita bungkus ulang di file final.
            
            content = content.replace("```text\n", "").replace("```text", "")
            content = content.replace("\n```", "").replace("```", "")
            
            outfile.write(content)
            outfile.write("\n\n")

# Bungkus ulang hasil akhir dengan markdown block
with open(output_file, 'r', encoding='utf-8') as f:
    final_content = f.read().strip()

with open(output_file, 'w', encoding='utf-8') as f:
    f.write("```text\n")
    f.write(final_content)
    f.write("\n```")

print(f"\nSukses! File gabungan disimpan di: {output_file}")
