# AIZONE Website - Pages Latihan, Tantangan, dan Papan Peringkat

## Overview
Telah berhasil diimplementasikan 3 halaman baru yang mengikuti desain Figma dengan sangat detail:

## 1. Page Latihan (`/latihan`)
**Fitur:**
- 4 Learning Path Cards dengan status berbeda:
  - Bagian 1: Selesai (dengan icon CheckmarkCircle hijau)
  - Bagian 2: In Progress (dengan progress bar 30%)
  - Bagian 3: Dikunci (dengan icon Lock kuning)
  - Bagian 4: Dikunci (dengan icon Lock kuning)
- Tooltip motivasi di setiap card dengan mascot image
- 3 Widget di sidebar kanan:
  - Peringkat (#17)
  - Misi Harian (84% progress)
  - Perjalananku (Pemula - 30% progress)

**Komponen yang Digunakan:**
- Card, Button, Progress dari HeroUI
- CheckmarkCircleColor, LockClosedColor dari FluentUI
- TrophyColor, StarColor, PawColor dari FluentUI
- MotivationalTooltip (custom component)

## 2. Page Tantangan (`/tantangan`)
**Fitur:**
- 3 Misi Harian Cards:
  - Selesaikan 1 simulasi (32% progress)
  - Selesaikan 1 Modul (0% progress)
  - Kerjakan 1 Latihan (0% progress)
- Image mascot dengan tooltip motivasi di kiri bawah
- 2 Widget di sidebar kanan:
  - Peringkat (#17)
  - Perjalananku (Pemula - 30% progress)

**Komponen yang Digunakan:**
- MissionCard (custom component dengan icon dan progress bar)
- FlagColor, PaintBrushColor dari FluentUI
- MotivationalTooltip dengan posisi kiri

## 3. Page Papan Peringkat (`/peringkat`)
**Fitur:**
- Podium untuk 3 peringkat teratas:
  - Posisi 1 (tengah, paling tinggi): Annisa - 2732 XP (warna kuning/warning)
  - Posisi 2 (kiri, sedang): Isnaini - 1256 XP (warna hijau/success)
  - Posisi 3 (kanan, sedang): Tsaniya - 1034 XP (warna merah/danger)
- Ranking List untuk posisi 4-17:
  - Posisi 4-9 dengan opacity berbeda
  - Posisi 17 (user sendiri) dengan highlight biru dan text "(You)"
- Badge untuk ranking number
- 2 Widget di sidebar kanan:
  - Misi Harian (84% progress)
  - Perjalananku (Pemula - 30% progress)
- Image mascot dengan tooltip motivasi di kanan atas

**Komponen yang Digunakan:**
- Podium (custom component dengan 3 cards berwarna berbeda)
- RankingCard (custom component dengan badge, avatar, dan arrow indicator)
- ArrowUpRegular, ArrowDownRegular dari FluentUI
- Badge dari HeroUI

## Komponen Custom yang Dibuat

### 1. MissionCard
**Path:** `components/mission-card.tsx`

**Props:**
- `icon`: React.ReactNode - Icon untuk mission
- `title`: string - Judul mission
- `progress`: number - Progress current
- `total`: number - Total progress

**Fitur:**
- Card dengan border abu-abu
- Icon di kiri, progress bar di kanan
- Auto-calculate percentage
- Warning color untuk progress bar

### 2. RankingCard
**Path:** `components/ranking-card.tsx`

**Props:**
- `rank`: number - Ranking number
- `name`: string - Nama user
- `exp`: number - EXP points
- `isCurrentUser`: boolean - Highlight untuk user sendiri

**Fitur:**
- Badge untuk ranking number
- Avatar user
- EXP display dengan gradient text
- Arrow indicator untuk trend
- Highlight biru untuk current user
- Opacity berbeda untuk ranking > 6

### 3. Podium
**Path:** `components/podium.tsx`

**Props:**
- `firstPlace`: { name, exp } - Data pemenang 1
- `secondPlace`: { name, exp } - Data pemenang 2
- `thirdPlace`: { name, exp } - Data pemenang 3

**Fitur:**
- 3 Cards dengan warna berbeda (success, warning, danger)
- Trophy icon dengan ranking number di tengah
- Avatar dengan border sesuai warna podium
- Box shadow sesuai warna
- Height berbeda untuk setiap posisi

### 4. MotivationalTooltip
**Path:** `components/motivational-tooltip.tsx`

**Props:**
- `message`: string - Pesan motivasi (support line break dengan &#10;)
- `imageUrl`: string - URL image mascot
- `position`: "left" | "right" - Posisi tooltip

**Fitur:**
- Card biru dengan shadow
- Arrow indicator pointing to image
- Support multi-line text
- Bisa di kiri atau kanan image

## Icon FluentUI yang Digunakan

Semua icon menggunakan variant **Color** dari FluentUI:
- `TrophyColor` - Icon trophy untuk widget peringkat
- `StarColor` - Icon bintang untuk misi harian
- `PawColor` - Icon paw untuk perjalananku
- `CheckmarkCircleColor` - Icon checkmark untuk status selesai
- `LockClosedColor` - Icon lock untuk status dikunci
- `FlagColor` - Icon bendera untuk misi modul
- `PaintBrushColor` - Icon brush untuk misi latihan
- `ArrowUpRegular` - Arrow naik untuk trend
- `ArrowDownRegular` - Arrow turun untuk trend

## Styling Details

### Warna yang Digunakan:
- Primary Blue: `#006FEE`
- Success Green: `#17C964`
- Warning Orange: `#F5A524`
- Danger Red: `#F31260`
- Purple: `#7828C8`
- Background: `#FCFDFD` / `#FAFAFA`
- Border: `#E4E4E7` / `rgba(145,158,171,0.24)`
- Text Primary: `#11181C`
- Text Secondary: `#52525B`
- Text Tertiary: `#3F3F46`

### Shadow yang Digunakan:
- Primary: `0px 4px 6px -2px rgba(0,0,0,0.05), 0px 10px 15px -3px rgba(0,112,243,0.4)`
- Success: `0px 4px 6px -2px rgba(0,0,0,0.05), 0px 10px 15px -3px rgba(23,201,100,0.4)`
- Warning: `0px 4px 6px -2px rgba(0,0,0,0.05), 0px 10px 15px -3px rgba(245,165,36,0.4)`
- Danger: `0px 4px 6px -2px rgba(0,0,0,0.05), 0px 10px 15px -3px rgba(243,18,96,0.4)`
- Primary XL: `0px 10px 10px -5px rgba(0,112,243,0.4), 0px 20px 25px -5px rgba(0,112,243,0.2)`

### Spacing yang Digunakan:
- Card padding: `14px 18px 20px`
- Gap antar section: `24px` / `32px`
- Gap antar widget: `24px` / `20px`
- Border radius: `14px` (lg) / `10px` / `8px` (sm)

## Struktur File
```
app/
├── latihan/
│   ├── layout.tsx
│   └── page.tsx
├── tantangan/
│   ├── layout.tsx
│   └── page.tsx
└── peringkat/
    ├── layout.tsx
    └── page.tsx

components/
├── mission-card.tsx
├── ranking-card.tsx
├── podium.tsx
└── motivational-tooltip.tsx
```

## Testing Checklist

✅ Page latihan menampilkan 4 learning path cards dengan status berbeda
✅ Page latihan menampilkan tooltip motivasi di setiap card
✅ Page tantangan menampilkan 3 misi harian cards
✅ Page tantangan menampilkan tooltip motivasi di posisi kiri
✅ Page peringkat menampilkan podium untuk 3 teratas
✅ Page peringkat menampilkan ranking list dengan highlight untuk user
✅ Page peringkat menampilkan trend indicator (arrow up/down)
✅ Semua widget sidebar berfungsi dengan baik
✅ Semua icon FluentUI tampil dengan benar
✅ Tidak ada linter errors
✅ Styling sesuai dengan desain Figma

## Notes
- Semua component menggunakan HeroUI dan FluentUI sesuai requirement
- Layout responsive dengan sidebar fixed dan content scrollable
- Tooltip menggunakan HTML entity `&#10;` untuk line break
- Ranking card opacity: 1.0 (1-6), 0.7 (7), 0.5 (8), 0.3 (9+)
- Podium menggunakan absolute positioning untuk trophy dan avatar
- Badge component dari HeroUI dengan customization

