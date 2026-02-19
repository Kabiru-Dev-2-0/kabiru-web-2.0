


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";






CREATE TYPE "public"."challenge_tier" AS ENUM (
    'none',
    'bronze',
    'silver',
    'gold'
);


ALTER TYPE "public"."challenge_tier" OWNER TO "postgres";


CREATE TYPE "public"."challenge_type" AS ENUM (
    'login_harian',
    'quiz_beruntun',
    'quiz_sempurna'
);


ALTER TYPE "public"."challenge_type" OWNER TO "postgres";


CREATE TYPE "public"."exercise_type" AS ENUM (
    'fill_in_the_blank',
    'drag_and_drop',
    'sorting',
    'guessing',
    'multiple_choice',
    'checkbox'
);


ALTER TYPE "public"."exercise_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_pelajaran_progress"("p_id_pelajaran" bigint, "p_id_pengguna" bigint) RETURNS TABLE("progress" integer, "completed_count" integer, "total_count" integer, "average_nilai" integer, "status" "text")
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_total_latihans INTEGER;
  v_completed_latihans INTEGER;
  v_progress INTEGER;
  v_average_nilai NUMERIC;
  v_status TEXT;
BEGIN
  -- 1. Hitung total latihan untuk pelajaran ini
  SELECT COUNT(DISTINCT nomor_latihan)
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
END;$$;


ALTER FUNCTION "public"."calculate_pelajaran_progress"("p_id_pelajaran" bigint, "p_id_pengguna" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_tantangan_reward"("p_uuid" "uuid", "p_tipe_tantangan" character varying, "p_tier" character varying, "p_exp_amount" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."claim_tantangan_reward"("p_uuid" "uuid", "p_tipe_tantangan" character varying, "p_tier" character varying, "p_exp_amount" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_current_user"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_id uuid;
  v_pengguna_id bigint;
BEGIN
  v_user_id := auth.uid();
  
  -- Get penggunas id (if exists)
  SELECT id INTO v_pengguna_id FROM public.penggunas WHERE uuid = v_user_id;

  -- 1. Delete data tied to public.penggunas (id) - BIGINT references
  IF v_pengguna_id IS NOT NULL THEN
    -- Delete from data_penggunas
    DELETE FROM public.data_penggunas WHERE id_pengguna = v_pengguna_id;
    
    -- Delete from tantangan_pengguna
    DELETE FROM public.tantangan_pengguna WHERE id_pengguna = v_pengguna_id;
    
    -- Delete from login_activities
    DELETE FROM public.login_activities WHERE id_pengguna = v_pengguna_id;
    
    -- Delete from tantangan_claims (if exists)
    BEGIN
      DELETE FROM public.tantangan_claims WHERE id_pengguna = v_pengguna_id;
    EXCEPTION WHEN undefined_table THEN NULL; END;
    
    -- Delete from user_daily_learning_summary (if exists)
    BEGIN
      DELETE FROM public.user_daily_learning_summary WHERE id_pengguna = v_pengguna_id;
    EXCEPTION WHEN undefined_table THEN NULL; END;
    
    -- Delete from hasil_latihans (if exists)
    BEGIN
      DELETE FROM public.hasil_latihans WHERE id_pengguna = v_pengguna_id;
    EXCEPTION WHEN undefined_table THEN NULL; END;

    -- Delete the penggunas record itself
    DELETE FROM public.penggunas WHERE id = v_pengguna_id;
  END IF;

  -- 2. Delete data tied to auth.users (uuid) directly - UUID references
  
  -- Delete from chat_sessions (this cascades to chat_messages)
  BEGIN
    DELETE FROM public.chat_sessions WHERE user_id = v_user_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- Delete from progres_penggunas (if exists)
  BEGIN
    DELETE FROM public.progres_penggunas WHERE id_pengguna = v_user_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- Delete from progres_latihans (if exists)
  BEGIN
    DELETE FROM public.progres_latihans WHERE id_pengguna = v_user_id;
  EXCEPTION WHEN undefined_table THEN NULL; END;

  -- 3. Finally delete the auth user
  -- This is the critical step. If this fails, the whole transaction rolls back.
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;


ALTER FUNCTION "public"."delete_current_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_completed_bagians"("p_id_modul" bigint, "p_id_pengguna" bigint) RETURNS TABLE("id_pelajaran" bigint, "bagian" integer, "status" "text", "progress" integer)
    LANGUAGE "sql"
    AS $$WITH pelajaran_in_modul AS (
    SELECT p.id AS id_pelajaran,
           p.bagian
    FROM pelajarans p
    WHERE p.id_modul = p_id_modul
  ),
  total_latihan AS (
    SELECT l.id_pelajaran,
           COUNT(DISTINCT l.nomor_latihan)::int AS total_count
    FROM latihans l
    GROUP BY l.id_pelajaran
  ),
  selesai_latihan AS (
    -- A latihan counted as completed if the user has a row in hasil_latihans for it
    SELECT h.id_pelajaran,
           COUNT(DISTINCT h.nomor_latihan)::int AS completed_count
    FROM hasil_latihans h
    WHERE h.id_pengguna = p_id_pengguna
    GROUP BY h.id_pelajaran
  )
  SELECT pim.id_pelajaran,
         pim.bagian,
         CASE
           WHEN COALESCE(tl.total_count, 0) > 0 AND COALESCE(sl.completed_count, 0) = COALESCE(tl.total_count, 0) THEN 'done'
           WHEN COALESCE(sl.completed_count, 0) > 0 THEN 'progress'
           ELSE 'locked'
         END AS status,
         CASE
           WHEN COALESCE(tl.total_count, 0) > 0 THEN ROUND((COALESCE(sl.completed_count, 0) * 100.0) / tl.total_count)::int
           ELSE 0
         END AS progress
  FROM pelajaran_in_modul pim
  LEFT JOIN total_latihan tl ON tl.id_pelajaran = pim.id_pelajaran
  LEFT JOIN selesai_latihan sl ON sl.id_pelajaran = pim.id_pelajaran
  ORDER BY pim.bagian ASC;$$;


ALTER FUNCTION "public"."get_completed_bagians"("p_id_modul" bigint, "p_id_pengguna" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_streak"("p_id_pengguna" bigint) RETURNS integer
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT COALESCE(current_streak, 0)
  FROM data_penggunas
  WHERE id_pengguna = p_id_pengguna;
$$;


ALTER FUNCTION "public"."get_current_streak"("p_id_pengguna" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_latihans_by_nomor_latihan"("p_id_pelajaran" integer) RETURNS TABLE("id" integer, "prompt" "text", "nomor_latihan" integer, "points" integer, "type" "text")
    LANGUAGE "plpgsql"
    AS $$
begin
  return query
  select 
    id, 
    prompt, 
    nomor_latihan, 
    points, 
    type
  from latihans
  where id_pelajaran = p_id_pelajaran
  group by nomor_latihan
  order by nomor_latihan;
end;
$$;


ALTER FUNCTION "public"."get_latihans_by_nomor_latihan"("p_id_pelajaran" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_leaderboard"("p_bronze_weight" integer DEFAULT 1, "p_silver_weight" integer DEFAULT 3, "p_gold_weight" integer DEFAULT 6) RETURNS TABLE("id_pengguna" bigint, "username" character varying, "avatar" "text", "exp" bigint, "bronze" bigint, "silver" bigint, "gold" bigint, "score" bigint, "rank" integer, "streak" integer, "last_activity" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$BEGIN
  RETURN QUERY WITH active_users AS (
    SELECT p.id AS id_pengguna,
           COALESCE(dp.username, 'Pengguna') AS username,
           dp.avatar,
           COALESCE(dp.exp, 0) AS exp,
           COALESCE(dp.current_streak, 0) AS streak,
           COALESCE(dp.updated_at, NOW()) AS last_activity
    FROM penggunas p
    LEFT JOIN data_penggunas dp ON dp.id_pengguna = p.id
    -- WHERE COALESCE(dp.exp, 0) > 0 -- Filter dihapus sesuai request
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
           a.username,
           a.avatar,
           a.exp,
           m.bronze,
           m.silver,
           m.gold,
           (a.exp) AS score,
           a.streak,
           a.last_activity
    FROM active_users a
    LEFT JOIN medal_counts m ON m.id_pengguna = a.id_pengguna
  )
  SELECT ag.id_pengguna,
         ag.username,
         ag.avatar,
         ag.exp,
         ag.bronze,
         ag.silver,
         ag.gold,
         ag.score,
         ROW_NUMBER() OVER (ORDER BY ag.score DESC, ag.exp DESC, ag.streak DESC, ag.last_activity ASC)::INT AS rank,
         ag.streak::INT,
         ag.last_activity
  FROM aggregated ag
  ORDER BY ag.score DESC, ag.exp DESC, ag.streak DESC, ag.last_activity ASC;
END;$$;


ALTER FUNCTION "public"."get_leaderboard"("p_bronze_weight" integer, "p_silver_weight" integer, "p_gold_weight" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."grant_exp_for_claim"("p_uuid" "uuid", "p_amount" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."grant_exp_for_claim"("p_uuid" "uuid", "p_amount" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$DECLARE
  new_pengguna_id bigint;  -- Untuk menyimpan id (bigint) dari penggunas yang baru diinsert
BEGIN
  -- Insert ke tabel penggunas dengan uuid dari auth.users
  INSERT INTO public.penggunas (uuid, created_at)
  VALUES (NEW.id, NOW())
  RETURNING id INTO new_pengguna_id;  -- Ambil id (bigint) yang baru diinsert

  -- Insert ke tabel data_penggunas dengan id_pengguna dari atas, nama_lengkap dan avatar dikosongkan (NULL)
  INSERT INTO public.data_penggunas (id_pengguna, nama_lengkap, avatar, created_at)
  VALUES (new_pengguna_id, NULL, NULL, NOW());

  -- Insert ke tabel tantangan_pengguna dengan nilai awalan kosong
  INSERT INTO public.tantangan_pengguna (
      id_pengguna,
      id_tantangan,
      current_value,
      best_value
  )
  VALUES
      (new_pengguna_id, 1, 0, 0),
      (new_pengguna_id, 2, 0, 0),
      (new_pengguna_id, 3, 0, 0);

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_tantangan_claimed"("p_id_pengguna" bigint, "p_tipe_tantangan" character varying, "p_tier" character varying) RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM tantangan_claims
    WHERE id_pengguna = p_id_pengguna
      AND tipe_tantangan = p_tipe_tantangan
      AND tier = p_tier
  );
$$;


ALTER FUNCTION "public"."is_tantangan_claimed"("p_id_pengguna" bigint, "p_tipe_tantangan" character varying, "p_tier" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_daily_login"("p_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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


ALTER FUNCTION "public"."log_daily_login"("p_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_documents"("query_embedding" "public"."vector", "match_count" integer DEFAULT 4) RETURNS TABLE("id" "uuid", "content" "text", "metadata" "jsonb", "similarity" double precision)
    LANGUAGE "plpgsql"
    AS $$
begin
  return query
  select d.id, d.content, d.metadata,
         1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;


ALTER FUNCTION "public"."match_documents"("query_embedding" "public"."vector", "match_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."on_hasil_latihans_insert_update_challenges"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_user BIGINT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_user := OLD.id_pengguna;
  ELSE
    v_user := NEW.id_pengguna;
  END IF;

  PERFORM update_quiz_streak_challenge(v_user);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END$$;


ALTER FUNCTION "public"."on_hasil_latihans_insert_update_challenges"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_quiz_streak"("p_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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


ALTER FUNCTION "public"."reset_quiz_streak"("p_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_badge_level"("p_id_tantangan" bigint, "p_id_pengguna" bigint, "p_value" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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


ALTER FUNCTION "public"."set_badge_level"("p_id_tantangan" bigint, "p_id_pengguna" bigint, "p_value" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."streak_harian_update"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_current_streak integer;
  v_last_streak_date date;
  v_today date := CURRENT_DATE;         -- atau timezone('Asia/Jakarta', now())::date
  v_has_active_today boolean;
BEGIN
  -- Safety: kalau exp <= 0, tidak usah ngapa-ngapain
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

    RETURN;
  END IF;

  -- 2. Ambil streak terakhir user
  SELECT current_streak, last_streak_date
  INTO v_current_streak, v_last_streak_date
  FROM data_penggunas
  WHERE id_pengguna = p_id_pengguna;

  IF v_current_streak IS NULL THEN
    v_current_streak := 0;
  END IF;

  -- 3. Hitung streak baru
  IF v_last_streak_date = v_today - INTERVAL '1 day' THEN
    -- Kemarin aktif → lanjut streak
    v_current_streak := v_current_streak + 1;
  ELSE
    -- Kemarin TIDAK aktif / belum pernah → mulai dari 1
    v_current_streak := 1;
  END IF;

  -- 4. Update streak user
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
  );
END;$$;


ALTER FUNCTION "public"."streak_harian_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."streak_harian_update"("p_id_pengguna" bigint, "p_exp" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."streak_harian_update"("p_id_pengguna" bigint, "p_exp" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_daily_login_challenge"("p_id_pengguna" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_tantangan_id BIGINT;
  v_total_logins INT := 0;
BEGIN
  SELECT id INTO v_tantangan_id FROM tantangans WHERE tipe = 'login_harian';
  IF v_tantangan_id IS NULL THEN RETURN; END IF;

  INSERT INTO tantangan_pengguna (id_tantangan, id_pengguna)
  VALUES (v_tantangan_id, p_id_pengguna)
  ON CONFLICT (id_tantangan, id_pengguna) DO NOTHING;

  SELECT COUNT(*) INTO v_total_logins
  FROM login_activities
  WHERE id_pengguna = p_id_pengguna;

  UPDATE tantangan_pengguna
  SET
    current_value = v_total_logins,
    best_value = GREATEST(best_value, v_total_logins),
    last_updated_at = NOW()
  WHERE id_tantangan = v_tantangan_id AND id_pengguna = p_id_pengguna;

  PERFORM set_badge_level(
    v_tantangan_id,
    p_id_pengguna,
    (SELECT best_value FROM tantangan_pengguna WHERE id_tantangan = v_tantangan_id AND id_pengguna = p_id_pengguna)
  );
END $$;


ALTER FUNCTION "public"."update_daily_login_challenge"("p_id_pengguna" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_data_penggunas_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$ 
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END; 
$$;


ALTER FUNCTION "public"."update_data_penggunas_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_module_completion_challenge"("p_id_pengguna" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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


ALTER FUNCTION "public"."update_module_completion_challenge"("p_id_pengguna" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_quiz_sempurna_completion_challenge"("p_uuid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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


ALTER FUNCTION "public"."update_quiz_sempurna_completion_challenge"("p_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_quiz_streak_challenge"("p_id_pengguna" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
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


ALTER FUNCTION "public"."update_quiz_streak_challenge"("p_id_pengguna" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_quiz_streak_challenge"("p_id_pengguna" bigint, "p_id_pelajaran" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  PERFORM update_quiz_streak_challenge(p_id_pengguna);
END $$;


ALTER FUNCTION "public"."update_quiz_streak_challenge"("p_id_pengguna" bigint, "p_id_pelajaran" bigint) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admins" (
    "id" bigint NOT NULL,
    "uuid" "uuid" DEFAULT "gen_random_uuid"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admins" OWNER TO "postgres";


ALTER TABLE "public"."admins" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."admins_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."data_penggunas" (
    "id" bigint NOT NULL,
    "id_pengguna" bigint,
    "nama_lengkap" character varying,
    "avatar" "text" DEFAULT '/imageAssets/avatar/default.png'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "exp" bigint DEFAULT '0'::bigint,
    "modul_dipilih" integer DEFAULT 1,
    "username" character varying,
    "is_pengguna_baru" boolean DEFAULT true,
    "asal_sekolah" character varying,
    "jenjang" smallint,
    "tantangan1_isclaimed" boolean DEFAULT false,
    "tantangan2_isclaimed" boolean DEFAULT false,
    "tantangan3_isclaimed" boolean DEFAULT false,
    "current_streak" integer DEFAULT 0 NOT NULL,
    "last_streak_date" "date",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."data_penggunas" OWNER TO "postgres";


COMMENT ON COLUMN "public"."data_penggunas"."nama_lengkap" IS 'SEBENERNYA USERNAME';



COMMENT ON COLUMN "public"."data_penggunas"."modul_dipilih" IS 'Untuk melihat modul apa yang sedang dipilih';



COMMENT ON COLUMN "public"."data_penggunas"."jenjang" IS 'Kelas berapa dia?';



ALTER TABLE "public"."data_penggunas" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."data_penggunas_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "text",
    "metadata" "jsonb",
    "embedding" "public"."vector"(768),
    "pdf_path" "text",
    "pdf_filename" "text",
    "pdf_size" bigint,
    "pdf_pages" integer
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


COMMENT ON TABLE "public"."documents" IS 'Vector table for RAG LLM.';



CREATE TABLE IF NOT EXISTS "public"."hasil_latihans" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nilai" bigint,
    "id_pelajaran" bigint,
    "id_pengguna" bigint,
    "nomor_latihan" smallint,
    "id_latihan" bigint
);


ALTER TABLE "public"."hasil_latihans" OWNER TO "postgres";


COMMENT ON TABLE "public"."hasil_latihans" IS 'Tabel berisi hasil dari setiap latihan';



COMMENT ON COLUMN "public"."hasil_latihans"."nomor_latihan" IS 'Nomor latihan yang sudah diselesaikan';



COMMENT ON COLUMN "public"."hasil_latihans"."id_latihan" IS 'Foreign key ke tabel latihan';



ALTER TABLE "public"."hasil_latihans" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."hasil_latihans_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."latihans" (
    "id" bigint NOT NULL,
    "id_pelajaran" bigint NOT NULL,
    "prompt" "text" NOT NULL,
    "template_code" "text",
    "correct_solution" "text",
    "points" integer DEFAULT 10 NOT NULL,
    "type" "public"."exercise_type" NOT NULL,
    "data" "jsonb" NOT NULL,
    "nomor_latihan" integer,
    "nomor_urut" smallint,
    "pertanyaan" "text",
    "unit_name" "text"
);


ALTER TABLE "public"."latihans" OWNER TO "postgres";


COMMENT ON COLUMN "public"."latihans"."nomor_urut" IS 'nomor urut untuk soal pada latihan tertentu';



ALTER TABLE "public"."latihans" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."latihans_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."latihans_view" AS
 SELECT "id_pelajaran",
    "nomor_latihan"
   FROM "public"."latihans"
  GROUP BY "nomor_latihan", "id_pelajaran"
  ORDER BY "id_pelajaran", "nomor_latihan";


ALTER VIEW "public"."latihans_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pelajarans" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "judul" character varying,
    "bagian" integer,
    "id_modul" bigint,
    "deskripsi" "text"
);


ALTER TABLE "public"."pelajarans" OWNER TO "postgres";


COMMENT ON TABLE "public"."pelajarans" IS 'Mata Pelajaran, dibagi jadi bagian-bagian.';



COMMENT ON COLUMN "public"."pelajarans"."bagian" IS 'Nomor bagian ke berapa';



COMMENT ON COLUMN "public"."pelajarans"."id_modul" IS 'Foreign key dari tabel Moduls';



ALTER TABLE "public"."pelajarans" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."lessons_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."login_activities" (
    "id" bigint NOT NULL,
    "id_pengguna" bigint NOT NULL,
    "login_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."login_activities" OWNER TO "postgres";


ALTER TABLE "public"."login_activities" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."login_activities_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."moduls" (
    "id" bigint NOT NULL,
    "nomor_modul" integer,
    "judul" character varying,
    "deskripsi" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "gambar" "text"
);


ALTER TABLE "public"."moduls" OWNER TO "postgres";


COMMENT ON TABLE "public"."moduls" IS 'Tabel module yang anaknya akan Pelajarans';



ALTER TABLE "public"."moduls" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."moduls_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."penggunas" (
    "id" bigint NOT NULL,
    "uuid" "uuid" DEFAULT "gen_random_uuid"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."penggunas" OWNER TO "postgres";


COMMENT ON TABLE "public"."penggunas" IS 'Tabel berisi pengguna, diambil dari UUID auth supabase.';



ALTER TABLE "public"."penggunas" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."penggunas_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tantangan_claims" (
    "id" bigint NOT NULL,
    "id_pengguna" bigint NOT NULL,
    "tipe_tantangan" character varying(50) NOT NULL,
    "tier" character varying(20) NOT NULL,
    "claimed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tantangan_claims" OWNER TO "postgres";


ALTER TABLE "public"."tantangan_claims" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."tantangan_claims_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tantangan_pengguna" (
    "id" bigint NOT NULL,
    "id_tantangan" bigint NOT NULL,
    "id_pengguna" bigint NOT NULL,
    "current_value" integer DEFAULT 0 NOT NULL,
    "best_value" integer DEFAULT 0 NOT NULL,
    "badge_level" "public"."challenge_tier" DEFAULT 'none'::"public"."challenge_tier" NOT NULL,
    "bronze_achieved_at" timestamp with time zone,
    "silver_achieved_at" timestamp with time zone,
    "gold_achieved_at" timestamp with time zone,
    "last_updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "streak_reset_at" timestamp with time zone
);


ALTER TABLE "public"."tantangan_pengguna" OWNER TO "postgres";


ALTER TABLE "public"."tantangan_pengguna" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."tantangan_pengguna_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tantangans" (
    "id" bigint NOT NULL,
    "tipe" "public"."challenge_type" NOT NULL,
    "judul" character varying(255) NOT NULL,
    "deskripsi" "text",
    "threshold_bronze" integer NOT NULL,
    "threshold_silver" integer NOT NULL,
    "threshold_gold" integer NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tantangans" OWNER TO "postgres";


ALTER TABLE "public"."tantangans" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."tantangans_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_daily_learning_summary" (
    "id" bigint NOT NULL,
    "id_pengguna" bigint NOT NULL,
    "activity_date" "date" NOT NULL,
    "total_exp" bigint DEFAULT 0 NOT NULL,
    "total_latihan" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_daily_learning_summary" OWNER TO "postgres";


ALTER TABLE "public"."user_daily_learning_summary" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."user_daily_learning_summary_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."v_completed_latihans" (
    "count" bigint
);


ALTER TABLE "public"."v_completed_latihans" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_tantangan_progress" AS
 SELECT "tp"."id_pengguna",
    "t"."tipe",
    "t"."judul",
    "tp"."current_value",
    "tp"."best_value",
    "tp"."badge_level",
    "t"."threshold_bronze",
    "t"."threshold_silver",
    "t"."threshold_gold",
    "tp"."last_updated_at"
   FROM ("public"."tantangan_pengguna" "tp"
     JOIN "public"."tantangans" "t" ON (("t"."id" = "tp"."id_tantangan")));


ALTER VIEW "public"."v_tantangan_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."v_total_latihans" (
    "count" bigint
);


ALTER TABLE "public"."v_total_latihans" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."data_penggunas"
    ADD CONSTRAINT "data_penggunas_id_pengguna_key" UNIQUE ("id_pengguna");



ALTER TABLE ONLY "public"."data_penggunas"
    ADD CONSTRAINT "data_penggunas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."data_penggunas"
    ADD CONSTRAINT "data_penggunas_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."latihans"
    ADD CONSTRAINT "exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hasil_latihans"
    ADD CONSTRAINT "hasil_latihans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pelajarans"
    ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."login_activities"
    ADD CONSTRAINT "login_activities_id_pengguna_login_date_key" UNIQUE ("id_pengguna", "login_date");



ALTER TABLE ONLY "public"."login_activities"
    ADD CONSTRAINT "login_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moduls"
    ADD CONSTRAINT "moduls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."penggunas"
    ADD CONSTRAINT "penggunas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tantangan_claims"
    ADD CONSTRAINT "tantangan_claims_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tantangan_claims"
    ADD CONSTRAINT "tantangan_claims_unique" UNIQUE ("id_pengguna", "tipe_tantangan", "tier");



ALTER TABLE ONLY "public"."tantangan_pengguna"
    ADD CONSTRAINT "tantangan_pengguna_id_tantangan_id_pengguna_key" UNIQUE ("id_tantangan", "id_pengguna");



ALTER TABLE ONLY "public"."tantangan_pengguna"
    ADD CONSTRAINT "tantangan_pengguna_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tantangans"
    ADD CONSTRAINT "tantangans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_daily_learning_summary"
    ADD CONSTRAINT "uq_user_daily" UNIQUE ("id_pengguna", "activity_date");



ALTER TABLE ONLY "public"."user_daily_learning_summary"
    ADD CONSTRAINT "user_daily_learning_summary_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_daily_learning_summary"
    ADD CONSTRAINT "user_daily_learning_summary_unique_per_day" UNIQUE ("id_pengguna", "activity_date");



CREATE INDEX "idx_exercises_data" ON "public"."latihans" USING "gin" ("data");



CREATE INDEX "idx_tantangan_claims_pengguna" ON "public"."tantangan_claims" USING "btree" ("id_pengguna");



CREATE INDEX "idx_tantangan_claims_tipe_tier" ON "public"."tantangan_claims" USING "btree" ("tipe_tantangan", "tier");



CREATE UNIQUE INDEX "tantangans_tipe_key" ON "public"."tantangans" USING "btree" ("tipe");



CREATE OR REPLACE TRIGGER "trg_data_penggunas_updated_at" BEFORE UPDATE ON "public"."data_penggunas" FOR EACH ROW EXECUTE FUNCTION "public"."update_data_penggunas_updated_at"();



CREATE OR REPLACE TRIGGER "trg_hasil_latihans_update_challenges" AFTER INSERT ON "public"."hasil_latihans" FOR EACH ROW EXECUTE FUNCTION "public"."on_hasil_latihans_insert_update_challenges"();



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_uuid_fkey" FOREIGN KEY ("uuid") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."data_penggunas"
    ADD CONSTRAINT "data_penggunas_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "public"."penggunas"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_daily_learning_summary"
    ADD CONSTRAINT "fk_user_daily_pengguna" FOREIGN KEY ("id_pengguna") REFERENCES "public"."penggunas"("id");



ALTER TABLE ONLY "public"."hasil_latihans"
    ADD CONSTRAINT "hasil_latihans_id_latihan_fkey" FOREIGN KEY ("id_latihan") REFERENCES "public"."latihans"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hasil_latihans"
    ADD CONSTRAINT "hasil_latihans_id_pelajaran_fkey" FOREIGN KEY ("id_pelajaran") REFERENCES "public"."pelajarans"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hasil_latihans"
    ADD CONSTRAINT "hasil_latihans_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "public"."penggunas"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."latihans"
    ADD CONSTRAINT "latihans_id_pelajaran_fkey" FOREIGN KEY ("id_pelajaran") REFERENCES "public"."pelajarans"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."login_activities"
    ADD CONSTRAINT "login_activities_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "public"."penggunas"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pelajarans"
    ADD CONSTRAINT "pelajarans_id_modul_fkey" FOREIGN KEY ("id_modul") REFERENCES "public"."moduls"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."penggunas"
    ADD CONSTRAINT "penggunas_uuid_fkey" FOREIGN KEY ("uuid") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tantangan_claims"
    ADD CONSTRAINT "tantangan_claims_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "public"."penggunas"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tantangan_pengguna"
    ADD CONSTRAINT "tantangan_pengguna_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "public"."penggunas"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tantangan_pengguna"
    ADD CONSTRAINT "tantangan_pengguna_id_tantangan_fkey" FOREIGN KEY ("id_tantangan") REFERENCES "public"."tantangans"("id") ON DELETE CASCADE;



CREATE POLICY "Allow authenticated users to delete documents" ON "public"."documents" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to insert documents" ON "public"."documents" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to read documents" ON "public"."documents" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow service role full access" ON "public"."documents" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Enable delete for authenticated users only" ON "public"."latihans" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."latihans" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."admins" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."latihans" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."pelajarans" FOR SELECT USING (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."latihans" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tantangan_claims_insert_own" ON "public"."tantangan_claims" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."penggunas" "p"
  WHERE (("p"."id" = "tantangan_claims"."id_pengguna") AND ("p"."uuid" = "auth"."uid"())))));



CREATE POLICY "tantangan_claims_select_own" ON "public"."tantangan_claims" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."penggunas" "p"
  WHERE (("p"."id" = "tantangan_claims"."id_pengguna") AND ("p"."uuid" = "auth"."uid"())))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_pelajaran_progress"("p_id_pelajaran" bigint, "p_id_pengguna" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_pelajaran_progress"("p_id_pelajaran" bigint, "p_id_pengguna" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_pelajaran_progress"("p_id_pelajaran" bigint, "p_id_pengguna" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."claim_tantangan_reward"("p_uuid" "uuid", "p_tipe_tantangan" character varying, "p_tier" character varying, "p_exp_amount" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."claim_tantangan_reward"("p_uuid" "uuid", "p_tipe_tantangan" character varying, "p_tier" character varying, "p_exp_amount" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."claim_tantangan_reward"("p_uuid" "uuid", "p_tipe_tantangan" character varying, "p_tier" character varying, "p_exp_amount" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_current_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_current_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_current_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_completed_bagians"("p_id_modul" bigint, "p_id_pengguna" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_completed_bagians"("p_id_modul" bigint, "p_id_pengguna" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_completed_bagians"("p_id_modul" bigint, "p_id_pengguna" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_streak"("p_id_pengguna" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_streak"("p_id_pengguna" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_streak"("p_id_pengguna" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_latihans_by_nomor_latihan"("p_id_pelajaran" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_latihans_by_nomor_latihan"("p_id_pelajaran" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_latihans_by_nomor_latihan"("p_id_pelajaran" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_leaderboard"("p_bronze_weight" integer, "p_silver_weight" integer, "p_gold_weight" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_leaderboard"("p_bronze_weight" integer, "p_silver_weight" integer, "p_gold_weight" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_leaderboard"("p_bronze_weight" integer, "p_silver_weight" integer, "p_gold_weight" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."grant_exp_for_claim"("p_uuid" "uuid", "p_amount" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."grant_exp_for_claim"("p_uuid" "uuid", "p_amount" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."grant_exp_for_claim"("p_uuid" "uuid", "p_amount" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_tantangan_claimed"("p_id_pengguna" bigint, "p_tipe_tantangan" character varying, "p_tier" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."is_tantangan_claimed"("p_id_pengguna" bigint, "p_tipe_tantangan" character varying, "p_tier" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_tantangan_claimed"("p_id_pengguna" bigint, "p_tipe_tantangan" character varying, "p_tier" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_daily_login"("p_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."log_daily_login"("p_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_daily_login"("p_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."match_documents"("query_embedding" "public"."vector", "match_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."match_documents"("query_embedding" "public"."vector", "match_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_documents"("query_embedding" "public"."vector", "match_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."on_hasil_latihans_insert_update_challenges"() TO "anon";
GRANT ALL ON FUNCTION "public"."on_hasil_latihans_insert_update_challenges"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."on_hasil_latihans_insert_update_challenges"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_quiz_streak"("p_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."reset_quiz_streak"("p_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_quiz_streak"("p_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_badge_level"("p_id_tantangan" bigint, "p_id_pengguna" bigint, "p_value" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."set_badge_level"("p_id_tantangan" bigint, "p_id_pengguna" bigint, "p_value" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_badge_level"("p_id_tantangan" bigint, "p_id_pengguna" bigint, "p_value" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."streak_harian_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."streak_harian_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."streak_harian_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."streak_harian_update"("p_id_pengguna" bigint, "p_exp" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."streak_harian_update"("p_id_pengguna" bigint, "p_exp" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."streak_harian_update"("p_id_pengguna" bigint, "p_exp" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_daily_login_challenge"("p_id_pengguna" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_daily_login_challenge"("p_id_pengguna" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_daily_login_challenge"("p_id_pengguna" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_data_penggunas_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_data_penggunas_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_data_penggunas_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_module_completion_challenge"("p_id_pengguna" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_module_completion_challenge"("p_id_pengguna" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_module_completion_challenge"("p_id_pengguna" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_quiz_sempurna_completion_challenge"("p_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_quiz_sempurna_completion_challenge"("p_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_quiz_sempurna_completion_challenge"("p_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_quiz_streak_challenge"("p_id_pengguna" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_quiz_streak_challenge"("p_id_pengguna" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_quiz_streak_challenge"("p_id_pengguna" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_quiz_streak_challenge"("p_id_pengguna" bigint, "p_id_pelajaran" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."update_quiz_streak_challenge"("p_id_pengguna" bigint, "p_id_pelajaran" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_quiz_streak_challenge"("p_id_pengguna" bigint, "p_id_pelajaran" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "service_role";












GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "service_role";









GRANT ALL ON TABLE "public"."admins" TO "anon";
GRANT ALL ON TABLE "public"."admins" TO "authenticated";
GRANT ALL ON TABLE "public"."admins" TO "service_role";



GRANT ALL ON SEQUENCE "public"."admins_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."admins_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."admins_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."data_penggunas" TO "anon";
GRANT ALL ON TABLE "public"."data_penggunas" TO "authenticated";
GRANT ALL ON TABLE "public"."data_penggunas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."data_penggunas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."data_penggunas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."data_penggunas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."hasil_latihans" TO "anon";
GRANT ALL ON TABLE "public"."hasil_latihans" TO "authenticated";
GRANT ALL ON TABLE "public"."hasil_latihans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."hasil_latihans_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."hasil_latihans_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."hasil_latihans_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."latihans" TO "anon";
GRANT ALL ON TABLE "public"."latihans" TO "authenticated";
GRANT ALL ON TABLE "public"."latihans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."latihans_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."latihans_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."latihans_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."latihans_view" TO "anon";
GRANT ALL ON TABLE "public"."latihans_view" TO "authenticated";
GRANT ALL ON TABLE "public"."latihans_view" TO "service_role";



GRANT ALL ON TABLE "public"."pelajarans" TO "anon";
GRANT ALL ON TABLE "public"."pelajarans" TO "authenticated";
GRANT ALL ON TABLE "public"."pelajarans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."lessons_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."lessons_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."lessons_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."login_activities" TO "anon";
GRANT ALL ON TABLE "public"."login_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."login_activities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."login_activities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."login_activities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."login_activities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."moduls" TO "anon";
GRANT ALL ON TABLE "public"."moduls" TO "authenticated";
GRANT ALL ON TABLE "public"."moduls" TO "service_role";



GRANT ALL ON SEQUENCE "public"."moduls_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."moduls_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."moduls_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."penggunas" TO "anon";
GRANT ALL ON TABLE "public"."penggunas" TO "authenticated";
GRANT ALL ON TABLE "public"."penggunas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."penggunas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."penggunas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."penggunas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tantangan_claims" TO "anon";
GRANT ALL ON TABLE "public"."tantangan_claims" TO "authenticated";
GRANT ALL ON TABLE "public"."tantangan_claims" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tantangan_claims_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tantangan_claims_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tantangan_claims_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tantangan_pengguna" TO "anon";
GRANT ALL ON TABLE "public"."tantangan_pengguna" TO "authenticated";
GRANT ALL ON TABLE "public"."tantangan_pengguna" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tantangan_pengguna_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tantangan_pengguna_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tantangan_pengguna_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tantangans" TO "anon";
GRANT ALL ON TABLE "public"."tantangans" TO "authenticated";
GRANT ALL ON TABLE "public"."tantangans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tantangans_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tantangans_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tantangans_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_daily_learning_summary" TO "anon";
GRANT ALL ON TABLE "public"."user_daily_learning_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."user_daily_learning_summary" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_daily_learning_summary_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_daily_learning_summary_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_daily_learning_summary_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_completed_latihans" TO "anon";
GRANT ALL ON TABLE "public"."v_completed_latihans" TO "authenticated";
GRANT ALL ON TABLE "public"."v_completed_latihans" TO "service_role";



GRANT ALL ON TABLE "public"."v_tantangan_progress" TO "anon";
GRANT ALL ON TABLE "public"."v_tantangan_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."v_tantangan_progress" TO "service_role";



GRANT ALL ON TABLE "public"."v_total_latihans" TO "anon";
GRANT ALL ON TABLE "public"."v_total_latihans" TO "authenticated";
GRANT ALL ON TABLE "public"."v_total_latihans" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































