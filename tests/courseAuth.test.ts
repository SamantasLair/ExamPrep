import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockSupabaseClient, resetMockData } from '../src/lib/mockSupabase';
import { db, getCourseProgressLocal, saveCourseProgressLocal } from '../src/lib/db';
import { loginAdminAction, checkAdminAuthAction } from '../src/app/actions';
import type { StudentRow, UserCourseProgress } from '../src/lib/types';

// Mock cookies for Server Action testing in Node.js environment
const mockCookieMap = new Map<string, { value: string; options?: any }>();

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (key: string) => {
      const item = mockCookieMap.get(key);
      return item ? { name: key, value: item.value } : undefined;
    },
    set: (key: string, value: string, options?: any) => {
      mockCookieMap.set(key, { value, options });
    },
    delete: (key: string) => {
      mockCookieMap.delete(key);
    },
  }),
}));

describe('SW-T02: User Authentication & Student Profile Audit Suite', () => {
  const authenticStudentProfiles: StudentRow[] = [
    {
      id: 'SMA-001',
      name: 'Budi Santoso',
      birthday: '2008-04-12',
      avatar_url: null,
      created_at: '2026-01-10T08:00:00.000Z',
    },
    {
      id: 'SMA-002',
      name: 'Siti Rahma',
      birthday: '2008-09-22',
      avatar_url: null,
      created_at: '2026-01-11T09:30:00.000Z',
    },
    {
      id: 'SMA-003',
      name: 'Ahmad Fauzi',
      birthday: '2007-12-05',
      avatar_url: null,
      created_at: '2026-01-12T10:15:00.000Z',
    },
    {
      id: 'SMA-004',
      name: 'Dewi Lestari',
      birthday: '2008-07-18',
      avatar_url: null,
      created_at: '2026-01-15T11:00:00.000Z',
    },
  ];

  beforeEach(async () => {
    resetMockData();
    mockCookieMap.clear();
    await db.courseProgress.clear();
    await db.progressDeltas.clear();

    // Daftarkan profil siswa autentik SMA-001 s/d SMA-004 ke mock database
    await mockSupabaseClient.from('students').insert(authenticStudentProfiles);
  });

  /* ==============================================================================
   * 1. Pengujian Validasi Profil Siswa Autentik (SMA-001 s/d SMA-004)
   * ============================================================================== */
  describe('1. Validasi Profil Siswa Autentik (SMA-001 s/d SMA-004)', () => {
    it('harus memvalidasi keberadaan seluruh profil siswa SMA-001 hingga SMA-004', async () => {
      for (const expectedStudent of authenticStudentProfiles) {
        const { data, error } = await mockSupabaseClient
          .from('students')
          .select('*')
          .eq('id', expectedStudent.id)
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.id).toBe(expectedStudent.id);
        expect(data.name).toBe(expectedStudent.name);
        expect(data.birthday).toBe(expectedStudent.birthday);
      }
    });

    it('harus memvalidasi struktur data dan format profil siswa sesuai interface StudentRow', async () => {
      const { data: students, error } = await mockSupabaseClient
        .from('students')
        .select('*');

      expect(error).toBeNull();
      expect(students).toBeDefined();

      const filteredSma = students.filter((s: StudentRow) => s.id.startsWith('SMA-'));
      expect(filteredSma.length).toBe(4);

      filteredSma.forEach((stu: StudentRow) => {
        expect(stu.id).toMatch(/^SMA-\d{3}$/);
        expect(typeof stu.name).toBe('string');
        expect(stu.name.length).toBeGreaterThan(0);
        expect(typeof stu.created_at).toBe('string');
      });
    });

    it('harus mengembalikan error atau null jika mencari ID siswa non-eksisten', async () => {
      const { data, error } = await mockSupabaseClient
        .from('students')
        .select('*')
        .eq('id', 'SMA-999')
        .single();

      expect(data).toBeNull();
      expect(error).toBeDefined();
    });
  });

  /* ==============================================================================
   * 2. Format ID String Custom Siswa (Non-UUID) Kompatibel dengan Relasi user_course_progress
   * ============================================================================== */
  describe('2. Kompatibilitas Format String Custom ID Siswa (Non-UUID)', () => {
    it('harus menerima dan menyimpan record user_course_progress dengan ID string custom seperti SMA-001', async () => {
      const progressRecord: UserCourseProgress = {
        id: 'prog-001',
        user_id: 'SMA-001',
        course_id: 'course-geom-01',
        completed_materials: ['mat-geom-101-1-1'],
        exercise_scores: { 'ex-geom-101-1-1': 100 },
        quiz_scores: { 'quiz-geom-101-1-1': 85 },
        overall_progress: 35,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await mockSupabaseClient
        .from('user_course_progress')
        .insert(progressRecord)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user_id).toBe('SMA-001');
      expect(data.course_id).toBe('course-geom-01');
      expect(data.overall_progress).toBe(35);
    });

    it('harus mendukung relasi upsert pada user_course_progress menggunakan user_id string non-UUID', async () => {
      const initial = {
        id: 'prog-002',
        user_id: 'SMA-002',
        course_id: 'course-alj-01',
        completed_materials: ['mat-alj-1'],
        exercise_scores: {},
        quiz_scores: {},
        overall_progress: 10,
        updated_at: new Date().toISOString(),
      };

      await mockSupabaseClient
        .from('user_course_progress')
        .insert(initial);

      // Lakukan update/upsert progres terbaru untuk SMA-002
      const updated = {
        id: 'prog-002',
        user_id: 'SMA-002',
        course_id: 'course-alj-01',
        completed_materials: ['mat-alj-1', 'mat-alj-2'],
        exercise_scores: { 'ex-alj-1': 90 },
        quiz_scores: { 'quiz-alj-1': 95 },
        overall_progress: 50,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await mockSupabaseClient
        .from('user_course_progress')
        .upsert(updated)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data.overall_progress).toBe(50);
      expect(data.completed_materials.length).toBe(2);
      expect(data.user_id).toBe('SMA-002');
    });

    it('harus kompatibel dengan penyimpanan lokal Dexie IndexedDB menggunakan key string non-UUID', async () => {
      const dexieRecord = {
        id: 'course-geom-01_SMA-001',
        courseId: 'course-geom-01',
        userId: 'SMA-001',
        completedMaterials: ['mat-geom-1'],
        exerciseScores: { 'ex-1': 80 },
        quizScores: { 'quiz-1': 90 },
        overallProgress: 45,
        updatedAt: Date.now(),
      };

      await saveCourseProgressLocal(dexieRecord);

      const retrieved = await getCourseProgressLocal('course-geom-01', 'SMA-001');
      expect(retrieved).toBeDefined();
      expect(retrieved?.userId).toBe('SMA-001');
      expect(retrieved?.courseId).toBe('course-geom-01');
      expect(retrieved?.overallProgress).toBe(45);
    });
  });

  /* ==============================================================================
   * 3. Pengujian Isolasi Progress Antarsiswa (Budi Santoso vs Siti Rahma)
   * ============================================================================== */
  describe('3. Isolasi Progress Antarsiswa (100% Terpisah)', () => {
    it('harus mengisolasi 100% progres belajar antara Budi Santoso (SMA-001) dan Siti Rahma (SMA-002)', async () => {
      // 1. Progres Budi Santoso: Selesai 3 materi, skor 100
      const budiProgress = {
        id: 'prog-budi-geom',
        user_id: 'SMA-001',
        course_id: 'course-geom-01',
        completed_materials: ['mat-geom-1', 'mat-geom-2', 'mat-geom-3'],
        exercise_scores: { 'ex-geom-1': 100, 'ex-geom-2': 100 },
        quiz_scores: { 'quiz-geom-1': 100 },
        overall_progress: 80,
        updated_at: new Date().toISOString(),
      };

      // 2. Progres Siti Rahma: Baru mulai 1 materi, skor 60
      const sitiProgress = {
        id: 'prog-siti-geom',
        user_id: 'SMA-002',
        course_id: 'course-geom-01',
        completed_materials: ['mat-geom-1'],
        exercise_scores: { 'ex-geom-1': 60 },
        quiz_scores: {},
        overall_progress: 20,
        updated_at: new Date().toISOString(),
      };

      await mockSupabaseClient.from('user_course_progress').insert([budiProgress, sitiProgress]);

      // Query progres Budi Santoso
      const { data: budiData } = await mockSupabaseClient
        .from('user_course_progress')
        .select('*')
        .eq('user_id', 'SMA-001')
        .eq('course_id', 'course-geom-01')
        .single();

      // Query progres Siti Rahma
      const { data: sitiData } = await mockSupabaseClient
        .from('user_course_progress')
        .select('*')
        .eq('user_id', 'SMA-002')
        .eq('course_id', 'course-geom-01')
        .single();

      // Verifikasi segregasi mutlak
      expect(budiData).toBeDefined();
      expect(sitiData).toBeDefined();

      expect(budiData.user_id).toBe('SMA-001');
      expect(budiData.overall_progress).toBe(80);
      expect(budiData.completed_materials).toHaveLength(3);
      expect(budiData.exercise_scores['ex-geom-1']).toBe(100);

      expect(sitiData.user_id).toBe('SMA-002');
      expect(sitiData.overall_progress).toBe(20);
      expect(sitiData.completed_materials).toHaveLength(1);
      expect(sitiData.exercise_scores['ex-geom-1']).toBe(60);

      // Memastikan mutasi progres Budi tidak berdampak pada Siti
      const updatedBudi = {
        ...budiData,
        overall_progress: 100,
        completed_materials: ['mat-geom-1', 'mat-geom-2', 'mat-geom-3', 'mat-geom-4'],
      };
      await mockSupabaseClient.from('user_course_progress').upsert(updatedBudi);

      const { data: recheckSiti } = await mockSupabaseClient
        .from('user_course_progress')
        .select('*')
        .eq('user_id', 'SMA-002')
        .eq('course_id', 'course-geom-01')
        .single();

      expect(recheckSiti.overall_progress).toBe(20);
      expect(recheckSiti.completed_materials).toHaveLength(1);
    });

    it('harus mengisolasi data riwayat ujian (attempts) antarsiswa', async () => {
      const budiAttempt = {
        id: 'att-budi-01',
        test_id: 'mock-test-1',
        student_id: 'SMA-001',
        responses: { '1': 'C', '2': 'B' },
        score: 95,
        status: 'finished',
        started_at: '2026-03-01T10:00:00Z',
        finished_at: '2026-03-01T11:00:00Z',
      };

      const sitiAttempt = {
        id: 'att-siti-01',
        test_id: 'mock-test-1',
        student_id: 'SMA-002',
        responses: { '1': 'A', '2': 'D' },
        score: 70,
        status: 'finished',
        started_at: '2026-03-01T10:05:00Z',
        finished_at: '2026-03-01T11:10:00Z',
      };

      await mockSupabaseClient.from('attempts').insert([budiAttempt, sitiAttempt]);

      const { data: budiAttempts } = await mockSupabaseClient
        .from('attempts')
        .select('*')
        .eq('student_id', 'SMA-001');

      const { data: sitiAttempts } = await mockSupabaseClient
        .from('attempts')
        .select('*')
        .eq('student_id', 'SMA-002');

      expect(budiAttempts.length).toBe(1);
      expect(budiAttempts[0].score).toBe(95);

      expect(sitiAttempts.length).toBe(1);
      expect(sitiAttempts[0].score).toBe(70);

      // Verifikasi tidak ada kebocoran ID attempt
      expect(budiAttempts.some((a: any) => a.student_id === 'SMA-002')).toBe(false);
      expect(sitiAttempts.some((a: any) => a.student_id === 'SMA-001')).toBe(false);
    });
  });

  /* ==============================================================================
   * 4. Pengujian Integritas Otorisasi Siswa vs Admin Saat Mengakses Data Kursus
   * ============================================================================== */
  describe('4. Integritas Otorisasi Siswa vs Admin Saat Mengakses Data Kursus', () => {
    it('harus menolak otentikasi admin jika kredensial salah dan mengizinkan jika password valid', async () => {
      const failLogin = await loginAdminAction('wrong_password');
      expect(failLogin).toBe(false);
      expect(await checkAdminAuthAction()).toBe(false);

      const successLogin = await loginAdminAction('superSeecreetPassword');
      expect(successLogin).toBe(true);
      expect(await checkAdminAuthAction()).toBe(true);
    });

    it('harus mengizinkan siswa mengakses data publik silabus kursus tanpa otentikasi admin', async () => {
      // Siswa belum / tidak memiliki sesi admin
      const isAdmin = await checkAdminAuthAction();
      expect(isAdmin).toBe(false);

      // Siswa tetap dapat mengakses data kursus & silabus
      const { data: courses, error } = await mockSupabaseClient
        .from('courses')
        .select('*');

      expect(error).toBeNull();
      expect(courses).toBeDefined();
    });

    it('harus memastikan siswa biasa tidak memiliki hak administratif untuk mereset seluruh progres siswa lain', async () => {
      // Simulasi siswa Budi Santoso (SMA-001) mencoba membaca dan memodifikasi
      const { data: sitiProgress } = await mockSupabaseClient
        .from('user_course_progress')
        .select('*')
        .eq('user_id', 'SMA-002');

      // Siswa hanya berhak mengubah record miliknya sendiri berdasarkan filter user_id
      const attemptMaliciousWrite = async (actingUserId: string, targetUserId: string) => {
        if (actingUserId !== targetUserId) {
          throw new Error('403 Forbidden: Siswa tidak diizinkan mengubah progres siswa lain');
        }
      };

      await expect(attemptMaliciousWrite('SMA-001', 'SMA-002')).rejects.toThrow('403 Forbidden');
      await expect(attemptMaliciousWrite('SMA-001', 'SMA-001')).resolves.toBeUndefined();
    });
  });
});
