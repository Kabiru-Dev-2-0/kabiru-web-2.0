# Supabase Progress Calculation Function

## 📋 Deskripsi

Function ini menghitung progress pelajaran secara dinamis berdasarkan hasil latihan yang sudah dikerjakan user, tanpa perlu menyimpan data di tabel `progres_penggunas`.

## 🚀 Cara Setup di Supabase

### 1. Buka Supabase Dashboard
- Login ke https://supabase.com
- Pilih project Anda
- Buka **SQL Editor** dari sidebar

### 2. Jalankan SQL Script
Copy dan paste isi file `calculate_pelajaran_progress.sql` ke SQL Editor, lalu klik **Run**.

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
-- ... (isi lengkap ada di file SQL)
$$;
```

### 3. Test Function
Jalankan query test di SQL Editor:

```sql
-- Ganti 1 dengan id_pelajaran dan 123 dengan id_pengguna yang valid
SELECT * FROM calculate_pelajaran_progress(1, 123);
```

**Expected Output:**
```
progress | completed_count | total_count | average_nilai | status
---------|-----------------|-------------|---------------|----------
   60    |        3        |      5      |      85       | progress
```

## 📊 Return Values

Function ini mengembalikan 1 baris dengan kolom:

| Kolom | Type | Deskripsi |
|-------|------|-----------|
| `progress` | INTEGER | Persentase progress (0-100) |
| `completed_count` | INTEGER | Jumlah latihan yang sudah dikerjakan |
| `total_count` | INTEGER | Total latihan di pelajaran ini |
| `average_nilai` | INTEGER | Rata-rata nilai dari latihan yang dikerjakan |
| `status` | TEXT | Status: 'done', 'progress', atau 'locked' |

## 🔧 Cara Penggunaan di Frontend

### Import Helper Function
```typescript
import { calculatePelajaranProgress } from '@/utils/supabase/progress-helpers';
```

### Single Pelajaran
```typescript
const supabase = createClient();
const progress = await calculatePelajaranProgress(
  supabase,
  pelajaranId,    // ID pelajaran
  penggunaId      // ID pengguna (dari tabel penggunas)
);

console.log(progress);
// {
//   progress: 60,
//   completed_count: 3,
//   total_count: 5,
//   average_nilai: 85,
//   status: 'progress'
// }
```

### Multiple Pelajaran
```typescript
import { calculateMultiplePelajaranProgress } from '@/utils/supabase/progress-helpers';

const supabase = createClient();
const pelajarans = [...]; // Array of pelajaran objects
const penggunaId = 123;

const pelajaransWithProgress = await calculateMultiplePelajaranProgress(
  supabase,
  pelajarans,
  penggunaId
);
```

## 📝 Logika Perhitungan

### 1. Total Latihan
```sql
SELECT COUNT(*)
FROM latihans
WHERE id_pelajaran = p_id_pelajaran;
```

### 2. Latihan yang Sudah Dikerjakan
```sql
SELECT COUNT(DISTINCT nomor_latihan)
FROM hasil_latihans
WHERE id_pelajaran = p_id_pelajaran
  AND id_pengguna = p_id_pengguna;
```

### 3. Persentase Progress
```
progress = (completed_latihans / total_latihans) * 100
```

### 4. Status
- **done**: `progress = 100%` (semua latihan selesai)
- **progress**: `progress > 0%` (ada latihan yang dikerjakan)
- **locked**: `progress = 0%` (belum ada latihan dikerjakan)

## ⚡ Keuntungan Approach Ini

1. ✅ **Real-time Data** - Selalu accurate, dihitung on-the-fly
2. ✅ **No Redundancy** - Tidak perlu maintain tabel progress terpisah
3. ✅ **Single Source of Truth** - Data progress dihitung dari `hasil_latihans`
4. ✅ **Flexible** - Tabel `progres_penggunas` bisa digunakan untuk tujuan lain
5. ✅ **Efficient** - Function dijalankan di database (lebih cepat)

## 🔍 Troubleshooting

### Function tidak ditemukan
**Error:** `function calculate_pelajaran_progress does not exist`

**Solution:** 
- Pastikan SQL script sudah dijalankan di Supabase
- Check di **Database** > **Functions** apakah function sudah muncul

### Return null
**Penyebab:**
- `id_pelajaran` tidak valid
- `id_pengguna` tidak valid
- Tidak ada data latihan untuk pelajaran tersebut

**Debug:**
```sql
-- Check apakah pelajaran ada
SELECT * FROM latihans WHERE id_pelajaran = 1;

-- Check hasil user
SELECT * FROM hasil_latihans 
WHERE id_pelajaran = 1 AND id_pengguna = 123;
```

## 🔄 Update Function

Jika perlu update logic function:

1. Edit file `calculate_pelajaran_progress.sql`
2. Jalankan ulang di SQL Editor (akan replace function yang lama)
3. Test dengan query sample

## 📦 Dependencies

Function ini membutuhkan tabel:
- ✅ `latihans` - dengan kolom `id_pelajaran`, `nomor_latihan`
- ✅ `hasil_latihans` - dengan kolom `id_pelajaran`, `id_pengguna`, `nomor_latihan`, `nilai`
- ✅ `penggunas` - dengan kolom `id`, `uuid`

## 📞 Support

Jika ada issue atau pertanyaan, check:
1. Supabase logs di Dashboard
2. Browser console untuk error messages
3. Network tab untuk RPC call details

