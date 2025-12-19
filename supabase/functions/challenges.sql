-- Tantangan & Progress System (Supabase)
-- Menambahkan tabel `tantangans`, `tantangan_pengguna`, `login_activities`
-- beserta fungsi dan trigger untuk meng-update progress tantangan.

-- ENUM types
DO $$ BEGIN
  CREATE TYPE challenge_type AS ENUM ('login_harian', 'quiz_beruntun', 'modul_selesai');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE challenge_tier AS ENUM ('none', 'bronze', 'silver', 'gold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Master table tantangans
CREATE TABLE IF NOT EXISTS tantangans (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tipe challenge_type NOT NULL,
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  threshold_bronze INT NOT NULL,
  threshold_silver INT NOT NULL,
  threshold_gold INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS tantangans_tipe_key ON tantangans(tipe);

-- Seed tiga tantangan sesuai requirement
INSERT INTO tantangans (tipe, judul, deskripsi, threshold_bronze, threshold_silver, threshold_gold, is_active)
VALUES
  ('login_harian', 'Login Harian', 'Bronze 3 hari beruntun, Silver 5, Gold 7', 3, 5, 7, TRUE),
  ('quiz_beruntun', 'Quiz Beruntun', 'Bronze 3 quiz beruntun, Silver 5, Gold 7', 3, 5, 7, TRUE),
  ('modul_selesai', 'Quiz Sempurna', 'Bronze 1, Silver 2, Gold 3 quiz sempurna', 1, 2, 3, TRUE)
ON CONFLICT (tipe) DO UPDATE SET
  judul = EXCLUDED.judul,
  deskripsi = EXCLUDED.deskripsi,
  threshold_bronze = EXCLUDED.threshold_bronze,
  threshold_silver = EXCLUDED.threshold_silver,
  threshold_gold = EXCLUDED.threshold_gold,
  is_active = TRUE;

-- Progress per pengguna per tantangan
CREATE TABLE IF NOT EXISTS tantangan_pengguna (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_tantangan BIGINT NOT NULL REFERENCES tantangans(id) ON DELETE CASCADE,
  id_pengguna BIGINT NOT NULL REFERENCES penggunas(id) ON DELETE CASCADE,
  current_value INT NOT NULL DEFAULT 0,
  best_value INT NOT NULL DEFAULT 0,
  badge_level challenge_tier NOT NULL DEFAULT 'none',
  bronze_achieved_at TIMESTAMPTZ,
  silver_achieved_at TIMESTAMPTZ,
  gold_achieved_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_tantangan, id_pengguna)
);

ALTER TABLE tantangan_pengguna
  ADD COLUMN IF NOT EXISTS streak_reset_at TIMESTAMPTZ;

-- Log aktivitas login harian untuk hitung streak
CREATE TABLE IF NOT EXISTS login_activities (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_pengguna BIGINT NOT NULL REFERENCES penggunas(id) ON DELETE CASCADE,
  login_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_pengguna, login_date)
);

-- RLS
ALTER TABLE tantangans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tantangan_pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_activities ENABLE ROW LEVEL SECURITY;

-- Baca semua tantangans publik
DO $$ BEGIN
  CREATE POLICY tantangans_read_all ON tantangans FOR SELECT USING (TRUE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Hanya pemilik yang bisa akses progress serta login activities
DO $$ BEGIN
  CREATE POLICY tantangan_pengguna_select_own ON tantangan_pengguna FOR SELECT
    USING (EXISTS (SELECT 1 FROM penggunas p WHERE p.id = tantangan_pengguna.id_pengguna AND p.uuid = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY tantangan_pengguna_insert_own ON tantangan_pengguna FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM penggunas p WHERE p.id = tantangan_pengguna.id_pengguna AND p.uuid = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY tantangan_pengguna_update_own ON tantangan_pengguna FOR UPDATE
    USING (EXISTS (SELECT 1 FROM penggunas p WHERE p.id = tantangan_pengguna.id_pengguna AND p.uuid = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM penggunas p WHERE p.id = tantangan_pengguna.id_pengguna AND p.uuid = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY login_activities_select_own ON login_activities FOR SELECT
    USING (EXISTS (SELECT 1 FROM penggunas p WHERE p.id = login_activities.id_pengguna AND p.uuid = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY login_activities_insert_own ON login_activities FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM penggunas p WHERE p.id = login_activities.id_pengguna AND p.uuid = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helper: set badge level berdasarkan thresholds
CREATE OR REPLACE FUNCTION set_badge_level(
  p_id_tantangan BIGINT,
  p_id_pengguna BIGINT,
  p_value INT
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_bronze INT;
  v_silver INT;
  v_gold INT;
  v_level challenge_tier := 'none';
  v_now TIMESTAMPTZ := NOW();
BEGIN
  SELECT t.threshold_bronze, t.threshold_silver, t.threshold_gold
    INTO v_bronze, v_silver, v_gold
  FROM tantangans t WHERE t.id = p_id_tantangan;

  IF v_gold IS NOT NULL AND p_value >= v_gold THEN
    v_level := 'gold';
  ELSIF v_silver IS NOT NULL AND p_value >= v_silver THEN
    v_level := 'silver';
  ELSIF v_bronze IS NOT NULL AND p_value >= v_bronze THEN
    v_level := 'bronze';
  ELSE
    v_level := 'none';
  END IF;

  UPDATE tantangan_pengguna
  SET
    badge_level = v_level,
    bronze_achieved_at = CASE WHEN v_level IN ('bronze','silver','gold') AND bronze_achieved_at IS NULL THEN v_now ELSE bronze_achieved_at END,
    silver_achieved_at = CASE WHEN v_level IN ('silver','gold') AND silver_achieved_at IS NULL THEN v_now ELSE silver_achieved_at END,
    gold_achieved_at   = CASE WHEN v_level = 'gold' AND gold_achieved_at IS NULL THEN v_now ELSE gold_achieved_at END,
    last_updated_at = v_now
  WHERE id_tantangan = p_id_tantangan AND id_pengguna = p_id_pengguna;
END $$;

-- 1) Daily Login: update streak berdasarkan login_activities
CREATE OR REPLACE FUNCTION update_daily_login_challenge(
  p_id_pengguna BIGINT
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_tantangan_id BIGINT;
  v_streak INT := 0;
  v_date DATE := CURRENT_DATE;
BEGIN
  -- Dapatkan id tantangan
  SELECT id INTO v_tantangan_id FROM tantangans WHERE tipe = 'login_harian';
  IF v_tantangan_id IS NULL THEN RETURN; END IF;

  -- Pastikan ada row untuk pengguna
  INSERT INTO tantangan_pengguna (id_tantangan, id_pengguna)
  VALUES (v_tantangan_id, p_id_pengguna)
  ON CONFLICT (id_tantangan, id_pengguna) DO NOTHING;

  -- Hitung streak mundur dari hari ini
  LOOP
    IF EXISTS (
      SELECT 1 FROM login_activities
      WHERE id_pengguna = p_id_pengguna AND login_date = v_date
    ) THEN
      v_streak := v_streak + 1;
      v_date := v_date - 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  -- Update progress
  UPDATE tantangan_pengguna
  SET
    current_value = v_streak,
    best_value = GREATEST(best_value, v_streak),
    last_updated_at = NOW()
  WHERE id_tantangan = v_tantangan_id AND id_pengguna = p_id_pengguna;

  PERFORM set_badge_level(v_tantangan_id, p_id_pengguna, (SELECT best_value FROM tantangan_pengguna WHERE id_tantangan = v_tantangan_id AND id_pengguna = p_id_pengguna));
END $$;

-- RPC: Catat login hari ini lalu update tantangan
CREATE OR REPLACE FUNCTION log_daily_login(
  p_uuid UUID
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_pengguna_id BIGINT;
BEGIN
  SELECT id INTO v_pengguna_id FROM penggunas WHERE uuid = p_uuid;
  IF v_pengguna_id IS NULL THEN RETURN; END IF;

  INSERT INTO login_activities (id_pengguna, login_date)
  VALUES (v_pengguna_id, CURRENT_DATE)
  ON CONFLICT (id_pengguna, login_date) DO NOTHING;

  PERFORM update_daily_login_challenge(v_pengguna_id);
END $$;

-- 2) Quiz Beruntun: hitung beruntun dari nomor_latihan berturut mulai 1 pada pelajaran terbaru
DROP FUNCTION IF EXISTS update_quiz_streak_challenge(BIGINT, BIGINT);

CREATE OR REPLACE FUNCTION update_quiz_streak_challenge(
  p_id_pengguna BIGINT
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_tantangan_id BIGINT;
  v_current INT := 0;
  v_reset_at TIMESTAMPTZ;
BEGIN
  SELECT id INTO v_tantangan_id FROM tantangans WHERE tipe = 'quiz_beruntun';
  IF v_tantangan_id IS NULL THEN RETURN; END IF;

  INSERT INTO tantangan_pengguna (id_tantangan, id_pengguna)
  VALUES (v_tantangan_id, p_id_pengguna)
  ON CONFLICT (id_tantangan, id_pengguna) DO NOTHING;

  SELECT streak_reset_at INTO v_reset_at
  FROM tantangan_pengguna
  WHERE id_tantangan = v_tantangan_id AND id_pengguna = p_id_pengguna;

  WITH distinct_quizzes_since AS (
    SELECT DISTINCT id_pelajaran, nomor_latihan
    FROM hasil_latihans
    WHERE id_pengguna = p_id_pengguna
      AND (v_reset_at IS NULL OR created_at >= v_reset_at)
  )
  SELECT COUNT(*) INTO v_current FROM distinct_quizzes_since;

  UPDATE tantangan_pengguna
  SET
    current_value = v_current,
    best_value = GREATEST(best_value, v_current),
    last_updated_at = NOW()
  WHERE id_tantangan = v_tantangan_id AND id_pengguna = p_id_pengguna;

  PERFORM set_badge_level(v_tantangan_id, p_id_pengguna, (SELECT best_value FROM tantangan_pengguna WHERE id_tantangan = v_tantangan_id AND id_pengguna = p_id_pengguna));
END $$;

CREATE OR REPLACE FUNCTION update_quiz_streak_challenge(
  p_id_pengguna BIGINT,
  p_id_pelajaran BIGINT
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  PERFORM update_quiz_streak_challenge(p_id_pengguna);
END $$;

CREATE OR REPLACE FUNCTION update_quiz_sempurna_completion_challenge(
  p_uuid UUID
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_pengguna_id BIGINT;
  v_tantangan_id BIGINT := 3;
BEGIN
  SELECT id INTO v_pengguna_id FROM penggunas WHERE uuid = p_uuid;
  IF v_pengguna_id IS NULL THEN RETURN; END IF;

  INSERT INTO tantangan_pengguna (id_tantangan, id_pengguna)
  VALUES (v_tantangan_id, v_pengguna_id)
  ON CONFLICT (id_tantangan, id_pengguna) DO NOTHING;

  UPDATE tantangan_pengguna
  SET
    current_value = current_value + 1,
    best_value = GREATEST(best_value, current_value + 1),
    last_updated_at = NOW()
  WHERE id_tantangan = v_tantangan_id AND id_pengguna = v_pengguna_id;

  PERFORM set_badge_level(
    v_tantangan_id,
    v_pengguna_id,
    (SELECT best_value FROM tantangan_pengguna WHERE id_tantangan = v_tantangan_id AND id_pengguna = v_pengguna_id)
  );
END $$;

-- 3) Modul Selesai: jumlah modul yang seluruh latihannya telah dikerjakan
CREATE OR REPLACE FUNCTION update_module_completion_challenge(
  p_id_pengguna BIGINT
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_tantangan_id BIGINT;
  v_completed_modul_count INT := 0;
BEGIN
  SELECT id INTO v_tantangan_id FROM tantangans WHERE tipe = 'modul_selesai';
  IF v_tantangan_id IS NULL THEN RETURN; END IF;

  INSERT INTO tantangan_pengguna (id_tantangan, id_pengguna)
  VALUES (v_tantangan_id, p_id_pengguna)
  ON CONFLICT (id_tantangan, id_pengguna) DO NOTHING;

  -- Hitung modul yang selesai: semua latihans (id) ada di hasil_latihans.id_latihan
  WITH latihans_per_modul AS (
    SELECT m.id AS id_modul, l.id AS id_latihan
    FROM moduls m
    JOIN pelajarans p ON p.id_modul = m.id
    JOIN latihans l ON l.id_pelajaran = p.id
  ), completed_per_modul AS (
    SELECT lm.id_modul, COUNT(DISTINCT lm.id_latihan) AS total_latihan,
           COUNT(DISTINCT h.id_latihan) FILTER (WHERE h.id_pengguna = p_id_pengguna) AS done_latihan
    FROM latihans_per_modul lm
    LEFT JOIN hasil_latihans h ON h.id_latihan = lm.id_latihan
    GROUP BY lm.id_modul
  )
  SELECT COUNT(*) INTO v_completed_modul_count
  FROM completed_per_modul cpm
  WHERE cpm.total_latihan > 0 AND cpm.done_latihan = cpm.total_latihan;

  UPDATE tantangan_pengguna
  SET
    current_value = v_completed_modul_count,
    best_value = GREATEST(best_value, v_completed_modul_count),
    last_updated_at = NOW()
  WHERE id_tantangan = v_tantangan_id AND id_pengguna = p_id_pengguna;

  PERFORM set_badge_level(v_tantangan_id, p_id_pengguna, (SELECT best_value FROM tantangan_pengguna WHERE id_tantangan = v_tantangan_id AND id_pengguna = p_id_pengguna));
END $$;

-- Trigger: setelah insert hasil_latihans, update quiz_streak & modul_selesai
CREATE OR REPLACE FUNCTION on_hasil_latihans_insert_update_challenges()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_user BIGINT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_user := OLD.id_pengguna;
  ELSE
    v_user := NEW.id_pengguna;
  END IF;

  PERFORM update_quiz_streak_challenge(v_user);
  PERFORM update_module_completion_challenge(v_user);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_hasil_latihans_update_challenges ON hasil_latihans;
CREATE TRIGGER trg_hasil_latihans_update_challenges
AFTER INSERT OR UPDATE OR DELETE ON hasil_latihans
FOR EACH ROW EXECUTE FUNCTION on_hasil_latihans_insert_update_challenges();
END $$;

CREATE OR REPLACE FUNCTION reset_quiz_streak(
  p_uuid UUID
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_pengguna_id BIGINT;
  v_tantangan_id BIGINT;
BEGIN
  SELECT id INTO v_pengguna_id FROM penggunas WHERE uuid = p_uuid;
  IF v_pengguna_id IS NULL THEN RETURN; END IF;

  SELECT id INTO v_tantangan_id FROM tantangans WHERE tipe = 'quiz_beruntun';
  IF v_tantangan_id IS NULL THEN RETURN; END IF;

  INSERT INTO tantangan_pengguna (id_tantangan, id_pengguna)
  VALUES (v_tantangan_id, v_pengguna_id)
  ON CONFLICT (id_tantangan, id_pengguna) DO NOTHING;

  UPDATE tantangan_pengguna
  SET current_value = 0,
      streak_reset_at = NOW(),
      last_updated_at = NOW()
  WHERE id_tantangan = v_tantangan_id AND id_pengguna = v_pengguna_id;
END $$;

-- View ringkas untuk membaca progress tantangan pengguna
CREATE OR REPLACE VIEW v_tantangan_progress AS
SELECT tp.id_pengguna,
       t.tipe,
       t.judul,
       tp.current_value,
       tp.best_value,
       tp.badge_level,
       t.threshold_bronze,
       t.threshold_silver,
       t.threshold_gold,
       tp.last_updated_at
FROM tantangan_pengguna tp
JOIN tantangans t ON t.id = tp.id_tantangan;

-- Leaderboard: skor = exp + (bronze*w_bronze) + (silver*w_silver) + (gold*w_gold)
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_days_active INT DEFAULT 30,
  p_bronze_weight INT DEFAULT 1,
  p_silver_weight INT DEFAULT 3,
  p_gold_weight INT DEFAULT 6
) RETURNS TABLE (
  id_pengguna BIGINT,
  nama_lengkap VARCHAR,
  avatar TEXT,
  exp INT,
  bronze INT,
  silver INT,
  gold INT,
  score INT,
  rank INT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY WITH active_users AS (
    SELECT p.id AS id_pengguna,
           COALESCE(dp.nama_lengkap, '') AS nama_lengkap,
           dp.avatar,
           COALESCE(dp.exp, 0) AS exp
    FROM penggunas p
    LEFT JOIN data_penggunas dp ON dp.id_pengguna = p.id
    WHERE EXISTS (
      SELECT 1 FROM login_activities la
      WHERE la.id_pengguna = p.id AND la.login_date >= CURRENT_DATE - p_days_active
    )
  ), medal_counts AS (
    SELECT a.id_pengguna,
           COALESCE(COUNT(*) FILTER (WHERE tp.badge_level = 'bronze'), 0) AS bronze,
           COALESCE(COUNT(*) FILTER (WHERE tp.badge_level = 'silver'), 0) AS silver,
           COALESCE(COUNT(*) FILTER (WHERE tp.badge_level = 'gold'), 0) AS gold
    FROM active_users a
    LEFT JOIN tantangan_pengguna tp ON tp.id_pengguna = a.id_pengguna
    GROUP BY a.id_pengguna
  ), aggregated AS (
    SELECT a.id_pengguna,
           a.nama_lengkap,
           a.avatar,
           a.exp,
           m.bronze,
           m.silver,
           m.gold,
           (a.exp + m.bronze * p_bronze_weight + m.silver * p_silver_weight + m.gold * p_gold_weight) AS score
    FROM active_users a
    LEFT JOIN medal_counts m ON m.id_pengguna = a.id_pengguna
  )
  SELECT id_pengguna,
         nama_lengkap,
         avatar,
         exp,
         bronze,
         silver,
         gold,
         score,
         DENSE_RANK() OVER (ORDER BY score DESC, exp DESC) AS rank
  FROM aggregated
  ORDER BY score DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_leaderboard(INT, INT, INT, INT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION grant_exp_for_claim(
  p_uuid UUID,
  p_amount INT
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_pengguna_id BIGINT;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN;
  END IF;
  SELECT id INTO v_pengguna_id FROM penggunas WHERE uuid = p_uuid;
  IF v_pengguna_id IS NULL THEN
    RETURN;
  END IF;
  INSERT INTO data_penggunas (id_pengguna, exp)
  VALUES (v_pengguna_id, p_amount)
  ON CONFLICT (id_pengguna) DO UPDATE
    SET exp = COALESCE(data_penggunas.exp, 0) + EXCLUDED.exp;
END $$;
