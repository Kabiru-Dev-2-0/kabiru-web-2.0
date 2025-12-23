-- ============================================
-- FIX GRANT_EXP_FOR_CLAIM FUNCTION
-- ============================================
-- Script ini memperbaiki fungsi grant_exp_for_claim agar bisa berfungsi dengan benar
-- Jalankan di Supabase SQL Editor

-- 1. Pastikan ada UNIQUE constraint pada id_pengguna di data_penggunas
-- (Jika belum ada, tambahkan)
DO $$ 
BEGIN
  -- Cek apakah constraint sudah ada
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'data_penggunas_id_pengguna_key' 
    AND conrelid = 'data_penggunas'::regclass
  ) THEN
    -- Tambahkan UNIQUE constraint
    ALTER TABLE data_penggunas 
    ADD CONSTRAINT data_penggunas_id_pengguna_key UNIQUE (id_pengguna);
  END IF;
END $$;

-- 2. Perbaiki fungsi grant_exp_for_claim dengan SECURITY DEFINER
CREATE OR REPLACE FUNCTION grant_exp_for_claim(
  p_uuid UUID,
  p_amount INT
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pengguna_id BIGINT;
BEGIN
  -- Validasi input
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN;
  END IF;
  
  -- Cari id_pengguna berdasarkan uuid
  SELECT id INTO v_pengguna_id 
  FROM penggunas 
  WHERE uuid = p_uuid;
  
  IF v_pengguna_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Update atau insert EXP
  INSERT INTO data_penggunas (id_pengguna, exp)
  VALUES (v_pengguna_id, p_amount)
  ON CONFLICT (id_pengguna) DO UPDATE
    SET exp = COALESCE(data_penggunas.exp, 0) + EXCLUDED.exp;
END $$;

-- 3. Berikan permission execute ke authenticated users
GRANT EXECUTE ON FUNCTION grant_exp_for_claim(UUID, INT) TO authenticated;

-- 4. (Optional) Berikan permission ke anon jika diperlukan
-- GRANT EXECUTE ON FUNCTION grant_exp_for_claim(UUID, INT) TO anon;

-- ============================================
-- CATATAN:
-- ============================================
-- 1. UNIQUE constraint pada id_pengguna diperlukan agar ON CONFLICT bisa bekerja
-- 2. SECURITY DEFINER memungkinkan function mengupdate data meskipun RLS aktif
-- 3. Function ini akan menambahkan EXP ke data_penggunas.exp
-- 4. Jika id_pengguna belum ada, akan di-insert dengan exp = p_amount
-- 5. Jika id_pengguna sudah ada, exp akan ditambahkan ke nilai yang sudah ada

