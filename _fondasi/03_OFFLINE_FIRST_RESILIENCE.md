# 🔌 Offline-First Resilience (Toleransi Jaringan)

*Konteks: Bagian dari [[00_FONDASI_INDEX]]*

Masalah klasik dalam ujian *online* konvensional (seperti sistem CBT lama) adalah: Jika jaringan internet siswa terputus tepat saat mereka menekan tombol "Submit", data pengerjaan akan hilang, dan siswa divonis tidak mengumpulkan jawaban. Sistem ExamPreparer Enterprise mencegah hal ini menggunakan prinsip **Offline-First Resilience** dan konsep **Eventual Consistency**.

## 1. Local-First Architecture

Berbeda dengan sistem *Cloud-First* yang bergantung penuh pada *fetch/POST request* konstan, pendekatan *Local-First* menjadikan memori lokal perangkat (sebagai `localStorage` pada browser) sebagai penyimpanan data utama (sumber kebenaran sementara).

## 2. Implementasi Queueing (Antrean Sinkronisasi)

Ketika siswa menekan tombol penyelesaian ujian (`onSubmit`), logika di `useExamPageVM.ts` beroperasi melalui state-machine berikut:

\`\`\`mermaid
stateDiagram-v2
    [*] --> CheckNetwork
    CheckNetwork --> SubmitOnline: if navigator.onLine == true
    CheckNetwork --> SaveToLocalQueue: if navigator.onLine == false

    SaveToLocalQueue --> IdleOffline: Data tersimpan di localStorage
    IdleOffline --> BackgroundSyncTrigger: Browser trigger event 'online'
    BackgroundSyncTrigger --> SubmitOnline: Flush data & hapus antrean

    SubmitOnline --> Success: Hapus localStorage
    Success --> [*]
\`\`\`

## 3. Aspek Teori Fault Tolerance (Toleransi Kesalahan)

- **Asynchronous Flush:** Sistem secara reaktif "mendengarkan" kembalinya sinyal internet via *event listener* `window.addEventListener('online', syncOfflineData)`. Ini masuk ke dalam payung teori *Asynchronous Event-Driven Architecture*.
- **Data Integrity:** Karena data dikemas secara penuh (*payload payload utuh*) lengkap dengan cap waktu (`offline_sync_at`), tidak ada kerancuan (*race condition*) mengenai kapan ujian sebenarnya diselesaikan di sisi klien.

Pendekatan ini memastikan kepatuhan penuh terhadap standar industri perangkat lunak tangguh (*Resilient Software*), di mana infrastruktur pengguna (yang rentan terhadap pemadaman WiFi lokal) tidak mengorbankan integritas dan nilai hasil studi.
