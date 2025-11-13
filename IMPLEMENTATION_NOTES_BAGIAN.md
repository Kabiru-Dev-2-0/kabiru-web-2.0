# Implementasi Halaman Belajar Bagian

## Overview
Halaman ini menampilkan learning path visual untuk setiap bagian pembelajaran dengan desain yang sesuai dengan Figma.

## File yang Dibuat

### 1. Components
- **`components/stage-node.tsx`**: Komponen untuk menampilkan node stage (1, 2, 3, dst) dengan status completed, current, atau locked
- **`components/learning-path-visual.tsx`**: Komponen untuk menampilkan visual learning path lengkap dengan stages dan motivational tooltips

### 2. Pages
- **`app/belajar/bagian-[bagian]/page.tsx`**: Halaman utama untuk setiap bagian pembelajaran (dynamic route)

## Fitur Utama

### 1. Stage Node
- **Status Completed**: Background biru (#3674B5) dengan icon checkmark
- **Status Current**: Background orange (#F5A524) dengan nomor stage
- **Status Locked**: Background abu-abu (#A1A1AA) dengan icon lock
- Setiap stage memiliki shadow effect sesuai desain Figma
- Hover effect untuk stage yang tidak locked

### 2. Learning Path Visual
- Menampilkan 6 stages dalam layout yang menarik
- Connector lines dengan dashed style
- 2 motivational images dengan tooltips:
  - Top: "Belajar yang baik adalah dengan sering latihan!"
  - Bottom: "Ayo lanjutkan latihanmu!"
- Gradient overlay di bagian bawah untuk smooth transition

### 3. Header Card
- Tombol back ke halaman /belajar
- Judul bagian dan pelajaran
- Circular progress indicator menunjukkan persentase penyelesaian

## Logika Progres

### Status Stage
1. **Completed**: Lesson sudah selesai (status = "done")
2. **Current**: 
   - Lesson pertama selalu available
   - Lesson sebelumnya sudah completed
   - Lesson sedang dalam progress
3. **Locked**: Lesson sebelumnya belum completed

### Perhitungan Progress
- Overall progress = (jumlah stage completed / total stages) × 100%
- Ditampilkan dalam circular progress bar

## Database Schema

### Tables yang Digunakan
1. **pelajarans**: Data pelajaran per bagian
   - `id`: bigint (primary key)
   - `judul`: text
   - `bagian`: integer

2. **latihans**: Data latihan/exercise per pelajaran (STAGE)
   - `id`: bigint (primary key)
   - `id_pelajaran`: bigint (foreign key to pelajarans)
   - `prompt`: text (deskripsi latihan)
   - `template_code`: text
   - `correct_solution`: text
   - `points`: integer
   - `type`: exercise_type enum
   - `data`: jsonb
   - `nomor_latihan`: integer (urutan latihan)

3. **progres_penggunas**: Progress user per pelajaran
   - `id`: bigint (primary key)
   - `id_pengguna`: uuid (foreign key to users)
   - `id_pelajaran`: bigint (foreign key to pelajarans)
   - `progres`: integer (0-100)
   - `status`: text (done/progress/locked)
   - `nilai`: integer

4. **progres_latihans**: Progress user per latihan
   - `id`: bigint (primary key)
   - `id_pengguna`: uuid (foreign key to users)
   - `id_latihan`: bigint (foreign key to latihans)
   - `status`: text (done/progress/locked)
   - `nilai`: integer

## Assets

### Gambar Motivational
File gambar harus ditempatkan di:
- `public/imageAssets/bagian/motivational-1-535224.png`
- `public/imageAssets/bagian/motivational-2-b37cdb.png`

**Catatan**: Gambar sudah di-download dari Figma dan perlu dipindahkan dari:
- `C:\Users\ASUS\public\imageAssets\bagian\` ke `public\imageAssets\bagian\`

## Styling

### Color Palette
- **Background**: #FCFDFD
- **Primary Blue**: #3674B5
- **Primary Orange**: #F5A524
- **Gray**: #A1A1AA
- **Text**: #3F3F46
- **Border**: #E4E4E7

### Components dari Libraries
- **HeroUI**: Card, Button, Progress
- **FluentUI**: ArrowLeftRegular, CheckmarkCircleColor, LockClosedColor
- **Next.js**: Image, Link, useRouter, useParams

## Navigation Flow

1. User klik bagian di `/belajar`
2. Redirect ke `/belajar/bagian-1`, `/belajar/bagian-2`, dst (sesuai nomor bagian)
3. User lihat learning path visual dengan stages dari tabel `latihans`
4. User klik stage yang available (not locked)
5. Redirect ke `/quiz?id=[latihan_id]` untuk mengerjakan latihan

## Responsive Design
- Layout menggunakan Flexbox
- Sidebar fixed di kiri
- Main content scrollable
- Learning path centered dengan max-width

## Performance Optimization
- Data fetching menggunakan Supabase client
- Loading state saat fetch data
- Error handling untuk user experience yang baik
- Image optimization dengan Next.js Image component

## Future Improvements
1. Add animation saat stage completed
2. Add sound effects
3. Add achievement badges
4. Add progress history
5. Add social sharing feature

