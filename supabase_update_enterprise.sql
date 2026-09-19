-- ==============================================================================
-- Peningkatan Sistem ExamPreparer (Tahap Enterprise)
-- SQL Migration Script
-- ==============================================================================

-- 1. Menambahkan kolom pelacakan pelanggaran Integritas (Focus Mode) pada tabel attempts
ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS violation_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS offline_sync_at timestamp with time zone;

-- COMMENT untuk dokumentasi
COMMENT ON COLUMN attempts.violation_count IS 'Jumlah pelanggaran (pindah tab/keluar dari layar ujian) selama sesi ujian.';
COMMENT ON COLUMN attempts.offline_sync_at IS 'Waktu saat data di-sync kembali ke server jika sebelumnya siswa submit dalam mode offline.';

-- 2. Memastikan tabel questions memiliki kolom tipe yang benar
-- (Cek tabel questions untuk memastikan jika butuh kolom tambahan untuk analisis IRT, 
--  namun untuk saat ini IRT bisa dihitung secara on-the-fly berdasarkan jsonb responses)

-- ==============================================================================
-- 3. Optimasi Analitik BIG DATA (Server-Side IRT Calculation)
-- ==============================================================================

-- Menambahkan kolom correct_answers untuk menyimpan jawaban benar dalam bentuk JSON
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS correct_answers jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN tests.correct_answers IS 'Menyimpan extract jawaban benar (A, B, dll) dalam bentuk JSON agar kalkulasi analitik IRT dapat dilakukan sepenuhnya di database tanpa mem-parsing raw_markdown.';

-- Membuat Fungsi RPC untuk Item Response Theory (Tingkat Kesukaran)
CREATE OR REPLACE FUNCTION calculate_irt(p_test_id uuid)
RETURNS TABLE (
    question_id text,
    p_score numeric,
    correct_count integer,
    total_count integer
) AS $$
DECLARE
    v_total_attempts integer;
BEGIN
    -- 1. Hitung total peserta yang telah menyelesaikan ujian ini
    SELECT count(*)
    INTO v_total_attempts
    FROM attempts
    WHERE test_id = p_test_id AND status = 'finished';

    IF v_total_attempts = 0 THEN
        RETURN; -- Tidak ada data, kembalikan tabel kosong
    END IF;

    -- 2. Kalkulasi p_score (Tingkat Kesukaran) per butir soal berdasarkan jsonb responses
    RETURN QUERY
    WITH CorrectAnswers AS (
        SELECT key as q_id, value::text as c_ans
        FROM tests, jsonb_each_text(correct_answers)
        WHERE id = p_test_id
    ),
    StudentResponses AS (
        SELECT a.id as attempt_id, q.key as q_id, q.value::text as user_ans
        FROM attempts a, jsonb_each_text(a.responses) q
        WHERE a.test_id = p_test_id AND a.status = 'finished'
    ),
    Aggregated AS (
        SELECT 
            c.q_id,
            COUNT(s.attempt_id) FILTER (WHERE s.user_ans = c.c_ans) as correct_hits
        FROM CorrectAnswers c
        LEFT JOIN StudentResponses s ON c.q_id = s.q_id
        GROUP BY c.q_id
    )
    SELECT 
        q_id,
        (correct_hits::numeric / v_total_attempts)::numeric as p_score,
        correct_hits::integer as correct_count,
        v_total_attempts as total_count
    FROM Aggregated;

END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- VIEW OPSIONAL: Item Response Theory (IRT) Aggregation 
-- (Bisa dijalankan jika ingin memindahkan beban komputasi analitik ke server Supabase)
-- ==============================================================================
-- Jika menggunakan view untuk mengekstrak respons JSONB:
-- DROP VIEW IF EXISTS vw_item_analytics;
-- CREATE VIEW vw_item_analytics AS
-- SELECT 
--     t.id as test_id,
--     q.key as question_id,
--     COUNT(a.id) as total_attempts,
--     SUM(CASE WHEN q.value::text = (SELECT correct_answer FROM questions WHERE id = q.key::uuid LIMIT 1) THEN 1 ELSE 0 END) as correct_answers
-- FROM attempts a
-- JOIN jsonb_each(a.responses) q ON true
-- ==============================================================================
-- 4. Indeksasi Database untuk Optimasi Kecepatan (BIG DATA DOCTRINE)
-- ==============================================================================
-- Memastikan pencarian berjalan dengan waktu O(1) untuk kueri-kueri berat
CREATE INDEX IF NOT EXISTS idx_attempts_test_id ON attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student_id ON attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_finished_at ON attempts(finished_at DESC);
CREATE INDEX IF NOT EXISTS idx_tests_created_at ON tests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);

-- ==============================================================================
-- 5. COURSE SYSTEM (ENTERPRISE LMS EXTENSION)
-- ==============================================================================

-- 1. Tabel Courses
CREATE TABLE IF NOT EXISTS courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    cover_url text,
    labels jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE courses IS 'Master kursus dan modul pembelajaran interaktif.';

-- 2. Tabel Course Categories
CREATE TABLE IF NOT EXISTS course_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title text NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE course_categories IS 'Kategori / cluster topik dalam sebuah kursus.';

-- 3. Tabel Course Chapters
CREATE TABLE IF NOT EXISTS course_chapters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid NOT NULL REFERENCES course_categories(id) ON DELETE CASCADE,
    title text NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE course_chapters IS 'Bab materi di dalam kategori kursus.';

-- 4. Tabel Course Subchapters
CREATE TABLE IF NOT EXISTS course_subchapters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id uuid NOT NULL REFERENCES course_chapters(id) ON DELETE CASCADE,
    title text NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE course_subchapters IS 'Sub-bab unit pembelajaran terkecil.';

-- 5. Tabel Course Materials
CREATE TABLE IF NOT EXISTS course_materials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subchapter_id uuid NOT NULL REFERENCES course_subchapters(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE course_materials IS 'Materi bacaan, teori, atau referensi Markdown dalam sub-bab.';

-- 6. Tabel Course Exercises
CREATE TABLE IF NOT EXISTS course_exercises (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subchapter_id uuid NOT NULL REFERENCES course_subchapters(id) ON DELETE CASCADE,
    title text NOT NULL,
    material_content text,
    question_ids uuid[] DEFAULT '{}',
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE course_exercises IS 'Latihan soal mandiri per sub-bab.';

-- 7. Tabel Course Quizzes
CREATE TABLE IF NOT EXISTS course_quizzes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subchapter_id uuid NOT NULL REFERENCES course_subchapters(id) ON DELETE CASCADE,
    title text NOT NULL,
    question_ids uuid[] DEFAULT '{}',
    passing_score numeric DEFAULT 70 NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
COMMENT ON TABLE course_quizzes IS 'Kuis evaluasi pemahaman sub-bab.';

-- 8. Tabel User Course Progress
CREATE TABLE IF NOT EXISTS user_course_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed_materials jsonb DEFAULT '[]'::jsonb NOT NULL,
    exercise_scores jsonb DEFAULT '{}'::jsonb NOT NULL,
    quiz_scores jsonb DEFAULT '{}'::jsonb NOT NULL,
    overall_progress numeric DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id)
);
COMMENT ON TABLE user_course_progress IS 'Pelacakan progres belajar siswa dalam kursus.';

-- Indeks Relasional Course System
CREATE INDEX IF NOT EXISTS idx_course_categories_course_id ON course_categories(course_id);
CREATE INDEX IF NOT EXISTS idx_course_chapters_category_id ON course_chapters(category_id);
CREATE INDEX IF NOT EXISTS idx_course_subchapters_chapter_id ON course_subchapters(chapter_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_subchapter_id ON course_materials(subchapter_id);
CREATE INDEX IF NOT EXISTS idx_course_exercises_subchapter_id ON course_exercises(subchapter_id);
CREATE INDEX IF NOT EXISTS idx_course_quizzes_subchapter_id ON course_quizzes(subchapter_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_course ON user_course_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_updated_at ON user_course_progress(updated_at DESC);

-- ==============================================================================
-- 6. FUNGSI RPC: COURSE PROGRESS MANAGEMENT
-- ==============================================================================

-- Fungsi Upsert Progres Kursus Tunggal
CREATE OR REPLACE FUNCTION upsert_course_progress(
    p_user_id text,
    p_course_id uuid,
    p_completed_materials jsonb DEFAULT '[]'::jsonb,
    p_exercise_scores jsonb DEFAULT '{}'::jsonb,
    p_quiz_scores jsonb DEFAULT '{}'::jsonb,
    p_overall_progress numeric DEFAULT 0
)
RETURNS user_course_progress AS $$
DECLARE
    v_record user_course_progress;
BEGIN
    INSERT INTO user_course_progress (
        user_id,
        course_id,
        completed_materials,
        exercise_scores,
        quiz_scores,
        overall_progress,
        updated_at
    )
    VALUES (
        p_user_id,
        p_course_id,
        COALESCE(p_completed_materials, '[]'::jsonb),
        COALESCE(p_exercise_scores, '{}'::jsonb),
        COALESCE(p_quiz_scores, '{}'::jsonb),
        COALESCE(p_overall_progress, 0),
        timezone('utc'::text, now())
    )
    ON CONFLICT (user_id, course_id)
    DO UPDATE SET
        completed_materials = EXCLUDED.completed_materials,
        exercise_scores = EXCLUDED.exercise_scores,
        quiz_scores = EXCLUDED.quiz_scores,
        overall_progress = EXCLUDED.overall_progress,
        updated_at = timezone('utc'::text, now())
    RETURNING * INTO v_record;

    RETURN v_record;
END;
$$ LANGUAGE plpgsql;

-- Fungsi Sinkronisasi Batch Progres Kursus (Offline / Bulk Sync)
CREATE OR REPLACE FUNCTION sync_course_progress_batch(p_payload jsonb)
RETURNS integer AS $$
DECLARE
    v_item jsonb;
    v_count integer := 0;
BEGIN
    IF p_payload IS NULL OR jsonb_typeof(p_payload) != 'array' THEN
        RETURN 0;
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_payload)
    LOOP
        INSERT INTO user_course_progress (
            user_id,
            course_id,
            completed_materials,
            exercise_scores,
            quiz_scores,
            overall_progress,
            updated_at
        )
        VALUES (
            (v_item->>'user_id')::text,
            (v_item->>'course_id')::uuid,
            COALESCE(v_item->'completed_materials', '[]'::jsonb),
            COALESCE(v_item->'exercise_scores', '{}'::jsonb),
            COALESCE(v_item->'quiz_scores', '{}'::jsonb),
            COALESCE((v_item->>'overall_progress')::numeric, 0),
            COALESCE((v_item->>'updated_at')::timestamp with time zone, timezone('utc'::text, now()))
        )
        ON CONFLICT (user_id, course_id)
        DO UPDATE SET
            completed_materials = EXCLUDED.completed_materials,
            exercise_scores = EXCLUDED.exercise_scores,
            quiz_scores = EXCLUDED.quiz_scores,
            overall_progress = EXCLUDED.overall_progress,
            updated_at = EXCLUDED.updated_at;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE course_chapters ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE course_subchapters ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE course_exercises ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE course_quizzes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Izinkan Akses Publik Courses" ON courses FOR SELECT USING (true);
-- CREATE POLICY "Izinkan Akses Publik Course Categories" ON course_categories FOR SELECT USING (true);
-- CREATE POLICY "Izinkan Akses Publik Course Chapters" ON course_chapters FOR SELECT USING (true);
-- CREATE POLICY "Izinkan Akses Publik Course Subchapters" ON course_subchapters FOR SELECT USING (true);
-- CREATE POLICY "Izinkan Akses Publik Course Materials" ON course_materials FOR SELECT USING (true);
-- CREATE POLICY "Izinkan Akses Publik Course Exercises" ON course_exercises FOR SELECT USING (true);
-- CREATE POLICY "Izinkan Akses Publik Course Quizzes" ON course_quizzes FOR SELECT USING (true);
-- CREATE POLICY "Izinkan Akses Publik User Progress" ON user_course_progress FOR ALL USING (true);
