# Sistem Pembelajaran Bagian - AIZone

## 📋 Overview

Sistem ini menampilkan learning path visual untuk setiap bagian pembelajaran dengan desain yang sesuai dengan Figma. Setiap bagian berisi beberapa latihan (stages) yang harus diselesaikan secara berurutan.

## 🗂️ Struktur Folder

```
app/
├── belajar/
│   ├── page.tsx                    # Halaman daftar semua bagian
│   ├── layout.tsx                  # Layout wrapper
│   └── bagian-[bagian]/           # Dynamic route untuk setiap bagian
│       └── page.tsx               # Halaman detail bagian dengan learning path

components/
├── stage-node.tsx                 # Komponen node stage individual
├── learning-path-visual.tsx       # Komponen visual learning path lengkap
├── motivational-tooltip.tsx       # Tooltip motivasi
├── sidebar.tsx                    # Sidebar navigasi
└── dashboard-header.tsx           # Header dengan stats user

public/
└── imageAssets/
    └── bagian/
        ├── motivational-1-535224.png  # Gambar karakter motivasi atas
        └── motivational-2-b37cdb.png  # Gambar karakter motivasi bawah
```

## 🔄 Alur Navigasi

### 1. Halaman Belajar (`/belajar`)
- Menampilkan daftar semua bagian pembelajaran
- Setiap card menampilkan:
  - Nomor bagian (Bagian 1, Bagian 2, dst)
  - Judul pelajaran
  - Status (done/progress/locked)
  - Progress bar
  - Tombol aksi (Lanjutkan Belajar / Pelajari Lagi / Locked)

### 2. Klik Bagian
- User klik tombol "Lanjutkan Belajar" atau "Pelajari Lagi"
- Redirect ke `/belajar/bagian-1`, `/belajar/bagian-2`, dst
- URL menggunakan nomor bagian dari field `bagian` di tabel `pelajarans`

### 3. Halaman Bagian (`/belajar/bagian-[bagian]`)
- Menampilkan learning path visual dengan 6 stages
- Setiap stage merepresentasikan 1 latihan dari tabel `latihans`
- Stage diurutkan berdasarkan `nomor_latihan`
- Menampilkan:
  - Header card dengan judul bagian dan circular progress
  - Learning path visual dengan stages
  - 2 karakter motivasi dengan tooltips
  - Tombol back ke `/belajar`

### 4. Klik Stage
- User klik stage yang available (not locked)
- Redirect ke `/quiz?id=[latihan_id]`
- User mengerjakan latihan

## 🗄️ Database Schema

### Tabel `pelajarans`
Menyimpan informasi bagian pembelajaran:
```sql
id              bigint (PK)
judul           text           -- "Apa itu Algoritma dan Mengapa Penting?"
bagian          integer        -- 1, 2, 3, dst
```

### Tabel `latihans`
Menyimpan latihan/exercise untuk setiap bagian:
```sql
id              bigint (PK)
id_pelajaran    bigint (FK)    -- Link ke pelajarans
prompt          text           -- Deskripsi latihan
template_code   text           -- Template kode awal
correct_solution text          -- Solusi yang benar
points          integer        -- Poin yang didapat
type            exercise_type  -- Tipe latihan
data            jsonb          -- Data tambahan
nomor_latihan   integer        -- 1, 2, 3, dst (urutan)
```

### Tabel `progres_penggunas`
Menyimpan progress user per bagian:
```sql
id              bigint (PK)
id_pengguna     uuid (FK)      -- Link ke users
id_pelajaran    bigint (FK)    -- Link ke pelajarans
progres         integer        -- 0-100 (persentase)
status          text           -- "done" / "progress" / "locked"
nilai           integer        -- Nilai total
```

### Tabel `progres_latihans`
Menyimpan progress user per latihan:
```sql
id              bigint (PK)
id_pengguna     uuid (FK)      -- Link ke users
id_latihan      bigint (FK)    -- Link ke latihans
status          text           -- "done" / "progress" / "locked"
nilai           integer        -- Nilai latihan
```

## 🎯 Logika Status Stage

### Status: `completed` ✅
- Latihan sudah selesai dikerjakan
- `progres_latihans.status = "done"`
- Warna: Biru (#3674B5)
- Icon: Checkmark circle
- Clickable: Ya

### Status: `current` 🟡
- Latihan sedang dikerjakan atau available untuk dikerjakan
- Kondisi:
  1. Latihan pertama (nomor_latihan = 1) selalu current
  2. Latihan sebelumnya sudah completed
  3. `progres_latihans.status = "progress"`
- Warna: Orange (#F5A524)
- Icon: Nomor stage
- Clickable: Ya

### Status: `locked` 🔒
- Latihan belum bisa dikerjakan
- Kondisi: Latihan sebelumnya belum completed
- Warna: Abu-abu (#A1A1AA)
- Icon: Lock
- Clickable: Tidak

## 📊 Perhitungan Progress

### Overall Progress (Circular Progress Bar)
```javascript
completedStages = stages.filter(s => s.status === "completed").length
totalStages = stages.length
overallProgress = Math.round((completedStages / totalStages) * 100)
```

### Progress di Halaman Belajar
```javascript
// Dari tabel progres_penggunas
progress = progres_penggunas.progres // 0-100
```

## 🎨 Desain Visual

### Learning Path Layout
```
┌─────────────────────────────────────┐
│  [Karakter 1 + Tooltip]             │
│                                     │
│         ┌─────┐                     │
│         │  1  │ (Stage 1)           │
│         └─────┘                     │
│            │                        │
│         ┌─────┐      ┌─────┐       │
│         │  2  │      │  3  │       │
│         └─────┘      └─────┘       │
│                          │          │
│         ┌─────┐      ┌─────┐       │
│         │  4  │      │  5  │       │
│         └─────┘      └─────┘       │
│            │                        │
│    ┌─────────────────────┐         │
│    │       Stage 6       │         │
│    └─────────────────────┘         │
│                                     │
│  [Karakter 2 + Tooltip]             │
└─────────────────────────────────────┘
```

### Color Palette
- **Background**: #FCFDFD
- **Primary Blue**: #3674B5 (Completed)
- **Primary Orange**: #F5A524 (Current)
- **Gray**: #A1A1AA (Locked)
- **Text**: #3F3F46
- **Border**: #E4E4E7
- **Progress**: #FF921F

## 🚀 Cara Penggunaan

### Setup Database
1. Pastikan tabel `latihans` sudah terisi dengan data
2. Setiap pelajaran harus punya minimal 1 latihan
3. `nomor_latihan` harus berurutan (1, 2, 3, dst)

### Menambah Bagian Baru
1. Insert data ke tabel `pelajarans`:
   ```sql
   INSERT INTO pelajarans (judul, bagian) 
   VALUES ('Judul Bagian Baru', 3);
   ```

2. Insert latihan untuk bagian tersebut:
   ```sql
   INSERT INTO latihans (id_pelajaran, prompt, nomor_latihan, points, type)
   VALUES 
     (3, 'Latihan 1: ...', 1, 10, 'code'),
     (3, 'Latihan 2: ...', 2, 15, 'code'),
     (3, 'Latihan 3: ...', 3, 20, 'code');
   ```

3. Halaman akan otomatis muncul di `/belajar/bagian-3`

### Testing
1. Buka `/belajar`
2. Klik "Lanjutkan Belajar" pada bagian yang ingin ditest
3. Verifikasi:
   - URL berubah ke `/belajar/bagian-[nomor]`
   - Stages muncul sesuai jumlah latihan
   - Stage pertama berstatus `current`
   - Stage lainnya berstatus `locked`
   - Circular progress menunjukkan 0%

## 🐛 Troubleshooting

### Problem: Halaman tidak muncul
**Solution**: 
- Periksa apakah data pelajaran ada di database
- Pastikan field `bagian` terisi dengan benar
- Check console untuk error

### Problem: Stages tidak muncul
**Solution**:
- Periksa apakah ada data di tabel `latihans` dengan `id_pelajaran` yang sesuai
- Pastikan `nomor_latihan` terisi
- Check error di console

### Problem: Semua stages locked
**Solution**:
- Periksa logika status di `bagian-[bagian]/page.tsx`
- Pastikan stage pertama (index 0) selalu `current`

### Problem: Gambar motivational tidak muncul
**Solution**:
- Pastikan file ada di `public/imageAssets/bagian/`
- Pindahkan file dari `C:\Users\ASUS\public\imageAssets\bagian\` ke folder project
- Restart dev server

## 📝 Notes

1. **Dynamic Route**: Menggunakan `[bagian]` bukan `{bagian}` untuk Next.js dynamic routing
2. **Progress Real-time**: Data progress selalu di-fetch dari database, tidak di-cache
3. **Sequential Learning**: User harus menyelesaikan latihan secara berurutan
4. **Responsive**: Layout responsive dan mobile-friendly
5. **Performance**: Menggunakan Next.js Image component untuk optimasi gambar

## 🔗 Related Files
- `/app/quiz/page.tsx` - Halaman untuk mengerjakan latihan
- `/app/lessons/page.tsx` - (Deprecated, diganti dengan quiz)
- `/components/sidebar.tsx` - Navigasi sidebar
- `/components/dashboard-header.tsx` - Header dengan stats

## 📚 References
- [Figma Design](https://www.figma.com/design/0rNfRsXL5pTFrS3tgpiqML/AIZONE?node-id=142-8592)
- [HeroUI Documentation](https://heroui.com)
- [FluentUI Icons](https://react.fluentui.dev)
- [Next.js Dynamic Routes](https://nextjs.org/docs/routing/dynamic-routes)

