# 📋 Panduan Setup Streak di Supabase

## 🎯 Tujuan
Setup function `streak_harian_update` di Supabase agar streak user bertambah otomatis setiap kali mendapat EXP dari latihan.

---

## 📝 Langkah-langkah Setup

### **Step 1: Buka Supabase Dashboard**
1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project kamu
3. Buka menu **SQL Editor** (di sidebar kiri)

### **Step 2: Buat Constraint Unique (Jika Belum Ada)**

Jalankan script ini di SQL Editor:

```sql
-- Cek apakah constraint sudah ada
-- Jika error "already exists", berarti sudah ada, skip step ini

ALTER TABLE public.user_daily_learning_summary
ADD CONSTRAINT user_daily_learning_summary_unique_per_day
UNIQUE (id_pengguna, activity_date);
```

**Catatan:** Jika error karena constraint sudah ada, tidak masalah, lanjut ke Step 3.

---

### **Step 3: Buat Function `streak_harian_update`**

Copy-paste script lengkap ini ke SQL Editor dan jalankan:

```sql
-- Hapus function lama jika ada (untuk clean start)
DROP FUNCTION IF EXISTS public.streak_harian_update(bigint, bigint);

-- Buat function streak_harian_update
CREATE OR REPLACE FUNCTION public.streak_harian_update(
  p_id_pengguna bigint,
  p_exp bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_streak integer;
  v_last_streak_date date;
  v_today date := CURRENT_DATE;
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

  -- 5. Insert summary hari ini
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

-- Berikan permission execute ke authenticated users
GRANT EXECUTE ON FUNCTION public.streak_harian_update(bigint, bigint) TO authenticated;
```

---

### **Step 4: Test Function (Opsional)**

Setelah function dibuat, test dengan mengganti `<id_pengguna_kamu>` dengan ID pengguna kamu:

```sql
-- Test panggil function
SELECT streak_harian_update(<id_pengguna_kamu>, 100);

-- Cek hasilnya
SELECT 
  id_pengguna,
  current_streak,
  last_streak_date,
  exp
FROM data_penggunas
WHERE id_pengguna = <id_pengguna_kamu>;

-- Cek summary harian
SELECT *
FROM user_daily_learning_summary
WHERE id_pengguna = <id_pengguna_kamu>
ORDER BY activity_date DESC
LIMIT 5;
```

**Expected Result:**
- `current_streak` harusnya jadi `1` (jika hari ini pertama kali)
- `last_streak_date` harusnya jadi tanggal hari ini
- Ada record baru di `user_daily_learning_summary` dengan `total_exp = 100`

---

## ✅ Checklist Setelah Setup

- [ ] Function `streak_harian_update` sudah dibuat di Supabase
- [ ] Permission `EXECUTE` sudah diberikan ke `authenticated`
- [ ] Constraint unique di `user_daily_learning_summary` sudah ada
- [ ] Test function manual berhasil (streak bertambah)

---

## 🔍 Troubleshooting

### **Problem: Function tidak jalan / streak tetap 0**

1. **Cek apakah function ada:**
   ```sql
   SELECT proname, proargtypes
   FROM pg_proc
   WHERE proname = 'streak_harian_update';
   ```

2. **Cek error di Supabase Logs:**
   - Buka **Logs** → **Postgres Logs**
   - Cari error terkait `streak_harian_update`

3. **Cek RLS (Row Level Security):**
   - Pastikan RLS di `data_penggunas` dan `user_daily_learning_summary` tidak menghalangi
   - Function pakai `SECURITY DEFINER` jadi seharusnya bypass RLS

4. **Cek apakah function dipanggil dari aplikasi:**
   - Buka browser console saat submit latihan
   - Cari log `Error updating streak:` → kalau ada, berarti ada error di function

### **Problem: Streak tidak bertambah di hari kedua**

- Pastikan `last_streak_date` di `data_penggunas` sudah ter-update ke hari sebelumnya
- Cek apakah ada record di `user_daily_learning_summary` untuk hari sebelumnya dengan `total_exp > 0`

### **Problem: Streak reset padahal seharusnya lanjut**

- Cek logic di function: `IF v_last_streak_date = v_today - INTERVAL '1 day'`
- Pastikan timezone server sama dengan yang diharapkan (atau ubah ke `timezone('Asia/Jakarta', now())::date`)

---

## 📚 File-file Terkait di Aplikasi

- `app/(quiz)/belajar/[modul]/[bagian]/quiz/quizAction.ts` → Memanggil function setelah EXP ditambahkan
- `components/dashboard-header.tsx` → Membaca `current_streak` dari `data_penggunas` untuk ditampilkan

---

## 🎉 Selesai!

Setelah semua step di atas, streak seharusnya sudah berfungsi:
- ✅ Setiap kali user dapat EXP dari latihan → streak bertambah (jika hari pertama) atau tetap (jika hari yang sama)
- ✅ Streak reset jika ada gap 1 hari tanpa aktivitas
- ✅ Header menampilkan `current_streak` secara real-time

