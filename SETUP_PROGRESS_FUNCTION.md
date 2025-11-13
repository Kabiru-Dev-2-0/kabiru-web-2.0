# 🚀 Quick Start: Setup Progress Function

## Step 1: Jalankan SQL di Supabase

1. Buka Supabase Dashboard: https://supabase.com
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar
4. Copy-paste script berikut:

```sql
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
  
  -- 2. Hitung berapa latihan yang sudah dikerjakan
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
  
  -- 4. Hitung rata-rata nilai
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
```

5. Klik tombol **Run** atau tekan `Ctrl/Cmd + Enter`
6. Anda akan melihat pesan sukses: ✅ Success. No rows returned

## Step 2: Test Function

Jalankan query test ini (ganti dengan data yang valid):

```sql
-- Test dengan id_pelajaran = 1 dan id_pengguna = 123
SELECT * FROM calculate_pelajaran_progress(1, 123);
```

**Expected Result:**
```
progress | completed_count | total_count | average_nilai | status
---------|-----------------|-------------|---------------|----------
   60    |        3        |      5      |      85       | progress
```

## Step 3: Done! 🎉

Function sudah siap digunakan di aplikasi Anda. Progress akan dihitung otomatis dari data `hasil_latihans`.

## 📊 Cara Kerja

```
User mengerjakan latihan → Tersimpan di hasil_latihans
                            ↓
                    Function menghitung:
                    - Berapa latihan sudah dikerjakan
                    - Total latihan yang ada
                    - Persentase progress
                    - Rata-rata nilai
                            ↓
                    Ditampilkan di UI
```

## ✅ Keuntungan

- ✅ Progress **selalu akurat** dan **real-time**
- ✅ Tidak perlu maintenance tabel `progres_penggunas`
- ✅ Performa cepat (dihitung di database)
- ✅ Single source of truth

## 🔍 Verify Installation

Check di Supabase Dashboard:
1. Klik **Database** di sidebar
2. Klik **Functions**
3. Anda akan melihat `calculate_pelajaran_progress` di list

## 📝 Notes

- Function ini sudah terintegrasi dengan halaman `/belajar/[modul]`
- Progress akan otomatis terupdate setiap kali user menyelesaikan latihan
- Tidak perlu konfigurasi tambahan di aplikasi

