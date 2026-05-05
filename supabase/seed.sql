-- Seed data untuk tabel tantangans
-- 3 tantangan sesuai requirement aplikasi

INSERT INTO public.tantangans (tipe, judul, deskripsi, threshold_bronze, threshold_silver, threshold_gold, is_active)
VALUES
  ('login_harian',  'Login Harian',   'Bronze 3 hari beruntun, Silver 5, Gold 7',           3, 5, 7, TRUE),
  ('quiz_beruntun', 'Quiz Beruntun',  'Bronze 3 quiz beruntun, Silver 5, Gold 7',            3, 5, 7, TRUE),
  ('quiz_sempurna', 'Quiz Sempurna',  'Bronze 1, Silver 2, Gold 3 quiz sempurna',            1, 2, 3, TRUE)
ON CONFLICT (tipe) DO UPDATE SET
  judul            = EXCLUDED.judul,
  deskripsi        = EXCLUDED.deskripsi,
  threshold_bronze = EXCLUDED.threshold_bronze,
  threshold_silver = EXCLUDED.threshold_silver,
  threshold_gold   = EXCLUDED.threshold_gold,
  is_active        = TRUE;

-- CATATAN: Data konten (moduls, pelajarans, latihans) ada di supabase/content_data.sql
-- Setelah db reset, jalankan ulang:
--   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "SET client_encoding TO 'UTF8';" -f "supabase/content_data.sql"
