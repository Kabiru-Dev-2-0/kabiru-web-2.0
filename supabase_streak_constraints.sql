-- ============================================
-- SETUP CONSTRAINT UNIQUE UNTUK STREAK
-- ============================================
-- Jalankan script ini jika belum ada constraint unique di user_daily_learning_summary

-- Cek apakah constraint sudah ada
-- Jika sudah ada, skip script ini

-- Buat constraint unique untuk (id_pengguna, activity_date)
-- Ini memastikan 1 user hanya punya 1 record per hari
ALTER TABLE public.user_daily_learning_summary
ADD CONSTRAINT user_daily_learning_summary_unique_per_day
UNIQUE (id_pengguna, activity_date);

-- Jika constraint sudah ada dan error, gunakan ini untuk drop dulu:
-- ALTER TABLE public.user_daily_learning_summary
-- DROP CONSTRAINT IF EXISTS user_daily_learning_summary_unique_per_day;





