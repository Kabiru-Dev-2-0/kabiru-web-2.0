-- ============================================
-- SETUP TANTANGAN CLAIMS SYSTEM
-- ============================================
-- Script lengkap untuk setup sistem claim individual tantangan
-- Jalankan di Supabase SQL Editor

-- ============================================
-- 1. FIX GRANT_EXP_FOR_CLAIM FUNCTION
-- ============================================

-- Pastikan ada UNIQUE constraint pada id_pengguna di data_penggunas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'data_penggunas_id_pengguna_key' 
    AND conrelid = 'data_penggunas'::regclass
  ) THEN
    ALTER TABLE data_penggunas 
    ADD CONSTRAINT data_penggunas_id_pengguna_key UNIQUE (id_pengguna);
  END IF;
END $$;

-- Perbaiki fungsi grant_exp_for_claim
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
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN;
  END IF;
  
  SELECT id INTO v_pengguna_id 
  FROM penggunas 
  WHERE uuid = p_uuid;
  
  IF v_pengguna_id IS NULL THEN
    RETURN;
  END IF;
  
  INSERT INTO data_penggunas (id_pengguna, exp)
  VALUES (v_pengguna_id, p_amount)
  ON CONFLICT (id_pengguna) DO UPDATE
    SET exp = COALESCE(data_penggunas.exp, 0) + EXCLUDED.exp;
END $$;

GRANT EXECUTE ON FUNCTION grant_exp_for_claim(UUID, INT) TO authenticated;

-- ============================================
-- 2. CREATE TABLE FOR INDIVIDUAL CLAIMS
-- ============================================

-- Tabel untuk tracking individual claim per tantangan per tier
CREATE TABLE IF NOT EXISTS tantangan_claims (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_pengguna BIGINT NOT NULL REFERENCES penggunas(id) ON DELETE CASCADE,
  tipe_tantangan VARCHAR(50) NOT NULL, -- 'login_harian', 'quiz_beruntun', 'quiz_sempurna'
  tier VARCHAR(20) NOT NULL, -- 'bronze', 'silver', 'gold'
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tantangan_claims_unique UNIQUE (id_pengguna, tipe_tantangan, tier)
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_tantangan_claims_pengguna 
ON tantangan_claims(id_pengguna);

CREATE INDEX IF NOT EXISTS idx_tantangan_claims_tipe_tier 
ON tantangan_claims(tipe_tantangan, tier);

-- ============================================
-- 3. ENABLE RLS (Row Level Security)
-- ============================================

ALTER TABLE tantangan_claims ENABLE ROW LEVEL SECURITY;

-- Policy: User hanya bisa melihat claim mereka sendiri
DROP POLICY IF EXISTS tantangan_claims_select_own ON tantangan_claims;
CREATE POLICY tantangan_claims_select_own ON tantangan_claims
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM penggunas p 
      WHERE p.id = tantangan_claims.id_pengguna 
      AND p.uuid = auth.uid()
    )
  );

-- Policy: User hanya bisa insert claim mereka sendiri
DROP POLICY IF EXISTS tantangan_claims_insert_own ON tantangan_claims;
CREATE POLICY tantangan_claims_insert_own ON tantangan_claims
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM penggunas p 
      WHERE p.id = tantangan_claims.id_pengguna 
      AND p.uuid = auth.uid()
    )
  );

-- ============================================
-- 4. HELPER FUNCTION: Check if claim exists
-- ============================================

CREATE OR REPLACE FUNCTION is_tantangan_claimed(
  p_id_pengguna BIGINT,
  p_tipe_tantangan VARCHAR,
  p_tier VARCHAR
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM tantangan_claims
    WHERE id_pengguna = p_id_pengguna
      AND tipe_tantangan = p_tipe_tantangan
      AND tier = p_tier
  );
$$;

GRANT EXECUTE ON FUNCTION is_tantangan_claimed(BIGINT, VARCHAR, VARCHAR) TO authenticated;

-- ============================================
-- 5. HELPER FUNCTION: Claim reward (with EXP grant)
-- ============================================

CREATE OR REPLACE FUNCTION claim_tantangan_reward(
  p_uuid UUID,
  p_tipe_tantangan VARCHAR,
  p_tier VARCHAR,
  p_exp_amount INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pengguna_id BIGINT;
  v_already_claimed BOOLEAN;
  v_result JSONB;
BEGIN
  -- Validasi input
  IF p_exp_amount IS NULL OR p_exp_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid EXP amount');
  END IF;

  -- Cari id_pengguna
  SELECT id INTO v_pengguna_id 
  FROM penggunas 
  WHERE uuid = p_uuid;
  
  IF v_pengguna_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Cek apakah sudah pernah di-claim
  SELECT EXISTS (
    SELECT 1 
    FROM tantangan_claims
    WHERE id_pengguna = v_pengguna_id
      AND tipe_tantangan = p_tipe_tantangan
      AND tier = p_tier
  ) INTO v_already_claimed;

  IF v_already_claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already claimed');
  END IF;

  -- Insert claim record
  INSERT INTO tantangan_claims (id_pengguna, tipe_tantangan, tier)
  VALUES (v_pengguna_id, p_tipe_tantangan, p_tier)
  ON CONFLICT (id_pengguna, tipe_tantangan, tier) DO NOTHING;

  -- Grant EXP
  PERFORM grant_exp_for_claim(p_uuid, p_exp_amount);

  RETURN jsonb_build_object('success', true, 'exp_granted', p_exp_amount);
END;
$$;

GRANT EXECUTE ON FUNCTION claim_tantangan_reward(UUID, VARCHAR, VARCHAR, INT) TO authenticated;

-- ============================================
-- CATATAN:
-- ============================================
-- 1. Tabel tantangan_claims menyimpan semua claim individual per tantangan per tier
-- 2. Function claim_tantangan_reward akan:
--    - Cek apakah sudah pernah di-claim
--    - Insert record claim
--    - Grant EXP secara otomatis
-- 3. Function is_tantangan_claimed untuk cek status claim
-- 4. Semua function menggunakan SECURITY DEFINER untuk bypass RLS jika diperlukan

