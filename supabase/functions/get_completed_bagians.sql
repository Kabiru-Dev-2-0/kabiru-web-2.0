-- Return completed/progress/locked status per pelajaran (bagian) for a user within a modul
-- Usage:
-- select * from get_completed_bagians(p_id_modul := 1, p_id_pengguna := 123);
-- Output columns:
--   id_pelajaran (bigint)
--   bagian (int4)
--   status (text)   -- 'done' | 'progress' | 'locked'
--   progress (int4) -- percentage 0..100
CREATE OR REPLACE FUNCTION get_completed_bagians(
  p_id_modul bigint,
  p_id_pengguna bigint
)
RETURNS TABLE (
  id_pelajaran bigint,
  bagian int4,
  status text,
  progress int4
)
LANGUAGE sql
AS $$
  WITH pelajaran_in_modul AS (
    SELECT p.id AS id_pelajaran,
           p.bagian
    FROM pelajarans p
    WHERE p.id_modul = p_id_modul
  ),
  total_latihan AS (
    SELECT l.id_pelajaran,
           COUNT(*)::int AS total_count
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
  ORDER BY pim.bagian ASC;
$$;