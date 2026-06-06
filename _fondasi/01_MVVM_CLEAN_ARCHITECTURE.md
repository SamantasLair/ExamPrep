# 📐 MVVM & Clean Architecture pada React Frontend

*Konteks: Bagian dari [[00_FONDASI_INDEX]]*

Sistem ExamPreparer Enterprise tidak menggunakan pendekatan React standar di mana *state*, *fetching*, dan UI dirender di dalam satu file (Monolitik MVC). Kita secara ketat mengimplementasikan pola **Model-View-ViewModel (MVVM)** yang terinspirasi dari Clean Architecture (Robert C. Martin).

## 1. Masalah pada Pendekatan Monolitik
Secara tradisional, komponen React sering kali mengidap *Spaghetti Code*:
- *Data Fetching* (`useEffect`) bersarang dengan *Event Handlers*.
- *State Management* (`useState`) bercampur dengan JSX *Rendering*.
- Akibatnya: Jika kita ingin mengubah desain antarmuka, kita berisiko merusak logika bisnis. Komponen sangat sulit diuji (*Unit Testing*).

## 2. Solusi MVVM di ExamPreparer

Kita memisahkan tanggung jawab (Separation of Concerns) menjadi tiga lapisan ketat:

### A. Model (Data Layer)
- Terdiri dari entitas tipe data (`lib/types.ts`) dan abstraksi koneksi database (`lib/supabase.ts`).
- Fokus hanya pada *apa* bentuk datanya.

### B. ViewModel (Logika Bisnis)
- Berbentuk *Custom Hooks* (`src/viewmodels/use...VM.ts`).
- **Tugas:** Melakukan pemanggilan data, manipulasi *state*, memvalidasi aturan bisnis (misal: "Ujian harus disubmit jika waktu habis"), dan menyediakan *methods* bersih untuk View.
- **Aturan Ketat:** *ViewModel* TIDAK BOLEH mengandung kode antarmuka HTML/JSX sama sekali.

### C. View (Presentasi UI)
- Berbentuk komponen React (`AdminDashboard.tsx`, `ExamRunner.tsx`).
- **Tugas:** Menerima data dari *ViewModel* dan me-rendernya menjadi visual.
- **Aturan Ketat:** *View* tidak boleh memiliki logika komputasi kompleks. Semua *button onClick* hanya memanggil fungsi yang telah disediakan oleh *ViewModel*.

## 3. Visualisasi Arsitektur

\`\`\`mermaid
graph LR
    subgraph UI Layer
        V(View: ExamRunner.tsx)
    end
    subgraph Logic Layer
        VM(ViewModel: useExamRunnerVM.ts)
    end
    subgraph Data Layer
        M(Model: Supabase & Types)
    end

    V -->|User Action onClick| VM
    VM -->|Data Binding State| V
    VM -->|Fetch/Update Data| M
    M -->|JSON Response| VM
\`\`\`

## 4. Landasan Keilmuan & Manfaat
- **Testability:** Kita bisa menguji `useExamRunnerVM.ts` secara matematis tanpa merender *browser*.
- **Scalability:** Jika suatu saat kita ingin membuat aplikasi *Mobile* (React Native), kita bisa menggunakan ulang *ViewModel* yang persis sama, hanya perlu membuat *View* (UI) yang baru.
- **Referensi Standar:** Pendekatan ini merupakan adopsi modern dari arsitektur perangkat lunak reaktif yang diadopsi secara luas di *Enterprise Frontend Engineering* (sejalan dengan paradigma *Functional Reactive Programming*).
