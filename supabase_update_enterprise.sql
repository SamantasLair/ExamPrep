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
