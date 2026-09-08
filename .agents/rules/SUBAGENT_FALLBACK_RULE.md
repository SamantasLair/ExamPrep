# SUBAGENT REGISTRY LOOKUP FAILURE AUTONOMOUS FALLBACK RULE

## Konteks
Lingkungan subagent pada plugin IDE adakalanya mengalami lookup failure (seperti dependensi `skill_search` yang tidak ditemukan di container internal).

## Aturan & Batasan
1. **Autonomous Solo Routine Mandate:**
   Jika pemanggilan `invoke_subagent` menghasilkan kegagalan lingkungan atau error registri plugin, agen UTAMA WAJIB langsung mengambil alih pekerjaan tanpa meminta intervensi pengguna (*Human-in-the-Loop*).
2. **Prohibition of Complaining:**
   Agen DILARANG meminta pengguna memperbaiki plugin, mencari skill internal yang hilang, atau menghentikan alur kerja. Agen utama harus langsung membaca file, menerapkan perbaikan, dan memverifikasi hasil dengan pengujian empiris otomatis.
