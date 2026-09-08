import os
import glob

# Definisikan direktori kerja file ini berada
folder_path = os.path.dirname(os.path.abspath(__file__))

# Cari semua file txt part (soal_sd5*.txt) dan kecualikan file FULL
all_files = glob.glob(os.path.join(folder_path, "soal_sd5*.txt"))

part1_file = os.path.join(folder_path, "soal_sd5_part1.txt")
other_parts = [f for f in all_files if f != part1_file and "FULL" not in f]
other_parts.sort()

files_to_merge = []
if os.path.exists(part1_file):
    files_to_merge.append(part1_file)
files_to_merge.extend(other_parts)

output_file = os.path.join(folder_path, "soal_sd5_FULL.txt")

print(f"Menemukan {len(files_to_merge)} file untuk digabungkan...")

with open(output_file, 'w', encoding='utf-8') as outfile:
    for fname in files_to_merge:
        print(f"Membaca {os.path.basename(fname)}...")
        with open(fname, 'r', encoding='utf-8') as infile:
            content = infile.read().strip()
            # Bersihkan pembungkus markdown ```text jika ada pada pecahan
            content = content.replace("```text\n", "").replace("```text", "")
            content = content.replace("\n```", "").replace("```", "")
            outfile.write(content)
            outfile.write("\n\n")

# Bungkus file hasil akhir dengan satu blok kode markdown
with open(output_file, 'r', encoding='utf-8') as f:
    final_content = f.read().strip()

with open(output_file, 'w', encoding='utf-8') as f:
    f.write("```text\n")
    f.write(final_content)
    f.write("\n```\n")

print(f"Sukses! File gabungan tersimpan di: {output_file}")
