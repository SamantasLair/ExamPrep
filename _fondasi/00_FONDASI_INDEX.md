# 🧠 Central Hub: Fondasi Akademik & Praktik Industri

Konteks: File ini adalah *Index/Graph Hub* untuk seluruh pilar teoretis dan praktik rekayasa perangkat lunak yang diimplementasikan pada sistem **ExamPreparer**. Sistem ini tidak dibangun secara asal, melainkan dilandasi oleh berbagai disiplin ilmu yang kuat (*Software Engineering*, *Data Science*, *HCI*, dan *Distributed Systems*).

> **STATUS:** DIREKTORI RAHASIA (`.gitignore`). HANYA UNTUK REFERENSI PENGEMBANG DAN MATERI SIDANG/PRESENTASI.

---

## 🗺️ Peta Konsep (Graph View)

\`\`\`mermaid
graph TD
    A[ExamPreparer Enterprise] --> B(Frontend Architecture)
    A --> C(Backend & Data Layer)
    A --> D(User Experience & HCI)
    A --> E(Security & Integrity)

    B -->|Pattern| B1[[01_MVVM_CLEAN_ARCHITECTURE]]
    B -->|Network| B2[[03_OFFLINE_FIRST_RESILIENCE]]

    C -->|Analytics| C1[[02_ITEM_RESPONSE_THEORY]]
    C -->|Performance| C2[[04_DATA_INTENSIVE_RPC]]

    D -->|Design System| D1[[06_PLAYFUL_CLEAN_UI]]

    E -->|Proctoring| E1[[05_BROWSER_HEURISTIC_PROCTORING]]
\`\`\`

## 📚 Daftar Dokumen

Berikut adalah penjabaran mendalam dari masing-masing pilar yang dapat dipertanggungjawabkan secara akademis:

1. **[[01_MVVM_CLEAN_ARCHITECTURE]]**
   Membahas mengapa kita memisahkan logika ke dalam `use...VM.ts` (*ViewModel*) dan tidak mencampurnya di dalam *Component* React.
2. **[[02_ITEM_RESPONSE_THEORY]]**
   Klarifikasi bahwa kita menggunakan formula deterministik statistik dari *Classical Test Theory* (CTT), **bukan** Model Machine Learning.
3. **[[03_OFFLINE_FIRST_RESILIENCE]]**
   Membahas teori toleransi kesalahan (*Fault Tolerance*) menggunakan *Local-First Architecture* saat internet peserta terputus.
4. **[[04_DATA_INTENSIVE_RPC]]**
   Doktrin BIG DATA (*Push-Down Aggregation*) yang mencegah *Out of Memory* dengan memindahkan perhitungan $p$-score ke *Server-Side* PostgreSQL.
5. **[[05_BROWSER_HEURISTIC_PROCTORING]]**
   Implementasi *Anti-Cheat* tanpa mengorbankan privasi (tanpa kamera) menggunakan *Event Loop Monitoring*.
6. **[[06_PLAYFUL_CLEAN_UI]]**
   Penerapan *Cognitive Load Theory* melalui visual modern yang bersih dan *micro-interactions* untuk mencegah kelelahan mental siswa.

---
*Dokumen ini saling tertaut. Gunakan Obsidian atau VS Code dengan ekstensi Markdown WikiLinks untuk menjelajahinya.*
