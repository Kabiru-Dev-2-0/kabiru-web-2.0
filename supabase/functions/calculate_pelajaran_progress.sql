-- Function untuk menghitung progress pelajaran berdasarkan hasil latihan
-- Menghitung berapa persen latihan yang sudah dikerjakan dari total latihan yang ada

CREATE OR REPLACE FUNCTION calculate_pelajaran_progress(
  p_id_pelajaran BIGINT,
  p_id_pengguna BIGINT
)
RETURNS TABLE (
  progress INTEGER,
  completed_count INTEGER,
  total_count INTEGER,
  average_nilai INTEGER,
  status TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_latihans INTEGER;
  v_completed_latihans INTEGER;
  v_progress INTEGER;
  v_average_nilai NUMERIC;
  v_status TEXT;
BEGIN
  -- 1. Hitung total latihan untuk pelajaran ini
  SELECT COUNT(*)
  INTO v_total_latihans
  FROM latihans
  WHERE id_pelajaran = p_id_pelajaran;
  
  -- 2. Hitung berapa latihan yang sudah dikerjakan (ada di hasil_latihans)
  SELECT COUNT(DISTINCT nomor_latihan)
  INTO v_completed_latihans
  FROM hasil_latihans
  WHERE id_pelajaran = p_id_pelajaran
    AND id_pengguna = p_id_pengguna;
  
  -- 3. Hitung persentase progress
  IF v_total_latihans > 0 THEN
    v_progress := ROUND((v_completed_latihans::NUMERIC / v_total_latihans::NUMERIC) * 100);
  ELSE
    v_progress := 0;
  END IF;
  
  -- 4. Hitung rata-rata nilai dari latihan yang sudah dikerjakan
  SELECT COALESCE(ROUND(AVG(nilai)), 0)
  INTO v_average_nilai
  FROM (
    SELECT DISTINCT ON (nomor_latihan) nilai
    FROM hasil_latihans
    WHERE id_pelajaran = p_id_pelajaran
      AND id_pengguna = p_id_pengguna
    ORDER BY nomor_latihan, created_at DESC
  ) AS latest_results;
  
  -- 5. Tentukan status
  IF v_progress = 100 THEN
    v_status := 'done';
  ELSIF v_progress > 0 THEN
    v_status := 'progress';
  ELSE
    v_status := 'locked';
  END IF;
  
  -- Return hasil
  RETURN QUERY
  SELECT 
    v_progress,
    v_completed_latihans,
    v_total_latihans,
    v_average_nilai::INTEGER,
    v_status;
END;
$$;

-- Contoh penggunaan:
-- SELECT * FROM calculate_pelajaran_progress(1, 123);
-- 
-- Hasil:
-- progress | completed_count | total_count | average_nilai | status
-- ---------|-----------------|-------------|---------------|----------
--    60    |        3        |      5      |      85       | progress

