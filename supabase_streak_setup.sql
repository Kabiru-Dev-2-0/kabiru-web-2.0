-- ============================================
-- SETUP FUNCTION STREAK HARIAN DI SUPABASE
-- ============================================
-- Jalankan script ini di Supabase SQL Editor
-- Pastikan kamu sudah login sebagai admin atau user yang punya permission CREATE FUNCTION

-- 1. Hapus function lama jika ada (optional, untuk clean start)
DROP FUNCTION IF EXISTS public.streak_harian_update(bigint, bigint);

-- 2. Buat function streak_harian_update
CREATE OR REPLACE FUNCTION public.streak_harian_update(
  p_id_pengguna bigint,
  p_exp bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Penting: agar function bisa update data meskipun RLS aktif
AS $$
DECLARE
  v_current_streak integer;
  v_last_streak_date date;
  v_today date := CURRENT_DATE; -- Gunakan CURRENT_DATE (server timezone) atau timezone('Asia/Jakarta', now())::date untuk WIB
  v_has_active_today boolean;
BEGIN
  -- Safety: kalau exp <= 0 atau NULL, tidak usah ngapa-ngapain
  IF p_exp IS NULL OR p_exp <= 0 THEN
    RETURN;
  END IF;

  -- 1. Cek apakah hari ini SUDAH ada aktivitas belajar (total_exp > 0)
  SELECT EXISTS (
    SELECT 1
    FROM user_daily_learning_summary
    WHERE id_pengguna = p_id_pengguna
      AND activity_date = v_today
      AND total_exp > 0
  ) INTO v_has_active_today;

  IF v_has_active_today THEN
    -- Hari ini sudah pernah aktif → hanya tambah exp & jumlah latihan
    UPDATE user_daily_learning_summary
    SET
      total_exp = total_exp + p_exp,
      total_latihan = total_latihan + 1
    WHERE id_pengguna = p_id_pengguna
      AND activity_date = v_today;

    RETURN; -- Keluar, streak tidak berubah
  END IF;

  -- 2. Ambil streak terakhir user
  SELECT COALESCE(current_streak, 0), last_streak_date
  INTO v_current_streak, v_last_streak_date
  FROM data_penggunas
  WHERE id_pengguna = p_id_pengguna;

  -- Safety: kalau user belum ada di data_penggunas, tidak bisa update streak
  IF v_current_streak IS NULL THEN
    RETURN;
  END IF;

  -- 3. Hitung streak baru
  IF v_last_streak_date = v_today - INTERVAL '1 day' THEN
    -- Kemarin aktif → lanjut streak
    v_current_streak := v_current_streak + 1;
  ELSE
    -- Kemarin TIDAK aktif / belum pernah / gap lebih dari 1 hari → mulai dari 1
    v_current_streak := 1;
  END IF;

  -- 4. Update streak user di data_penggunas
  UPDATE data_penggunas
  SET
    current_streak = v_current_streak,
    last_streak_date = v_today
  WHERE id_pengguna = p_id_pengguna;

  -- 5. Insert summary hari ini (penanda bahwa hari ini SUDAH dihitung untuk streak)
  INSERT INTO user_daily_learning_summary (
    id_pengguna,
    activity_date,
    total_exp,
    total_latihan
  ) VALUES (
    p_id_pengguna,
    v_today,
    p_exp,
    1
  )
  ON CONFLICT (id_pengguna, activity_date) DO UPDATE
  SET
    total_exp = user_daily_learning_summary.total_exp + p_exp,
    total_latihan = user_daily_learning_summary.total_latihan + 1;
END;
$$;

-- 3. Berikan permission execute ke authenticated users (atau anon jika perlu)
GRANT EXECUTE ON FUNCTION public.streak_harian_update(bigint, bigint) TO authenticated;
-- Jika perlu untuk anon juga (tidak disarankan untuk security):
-- GRANT EXECUTE ON FUNCTION public.streak_harian_update(bigint, bigint) TO anon;

-- 4. (OPTIONAL) Buat function helper untuk baca streak (untuk header)
CREATE OR REPLACE FUNCTION public.get_current_streak(p_id_pengguna bigint)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(current_streak, 0)
  FROM data_penggunas
  WHERE id_pengguna = p_id_pengguna;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_streak(bigint) TO authenticated;

-- ============================================
-- CATATAN PENTING:
-- ============================================
-- 1. Function ini akan dipanggil dari quizAction.ts setelah EXP ditambahkan
-- 2. Pastikan RLS (Row Level Security) di tabel data_penggunas dan user_daily_learning_summary
--    tidak menghalangi UPDATE/INSERT dari function ini (karena pakai SECURITY DEFINER)
-- 3. Jika server timezone bukan Asia/Jakarta, ubah CURRENT_DATE menjadi:
--    timezone('Asia/Jakarta', now())::date
-- 4. Test function dengan:
--    SELECT streak_harian_update(<id_pengguna_kamu>, 100);
--    SELECT current_streak, last_streak_date FROM data_penggunas WHERE id_pengguna = <id_pengguna_kamu>;



