export interface LevelConfig {
  key: string;
  label: string;
  min: number;
  max: number | null;
  desc: string;
}

export const JOURNEY_LEVELS: LevelConfig[] = [
  {
    key: 'newbie',
    label: 'Newbie',
    min: 0,
    max: 999,
    desc: 'Mulai perjalananmu dari dasar-dasar komunikasi.',
  },
  {
    key: 'learner',
    label: 'Learner',
    min: 1000,
    max: 3999,
    desc: 'Mulai nyaman belajar dan berlatih secara konsisten.',
  },
  {
    key: 'explorer',
    label: 'Explorer',
    min: 4000,
    max: 8999,
    desc: 'Mengeksplorasi lebih banyak topik dan situasi.',
  },
  {
    key: 'skilled',
    label: 'Skilled',
    min: 9000,
    max: 15999,
    desc: 'Kemampuan makin terasah dan terasa natural.',
  },
  {
    key: 'proficient',
    label: 'Proficient',
    min: 16000,
    max: 24999,
    desc: 'Sudah sangat mahir dan siap tantangan lanjutan.',
  },
  {
    key: 'master',
    label: 'Master',
    min: 25000,
    max: null,
    desc: 'Level tertinggi: menguasai seluruh materi dan tantangan.',
  },
  
];

export interface LevelProgress {
  level: number; // 1-based index
  label: string;
  progressPercent: number; // 0-100
  currentExp: number;
  minExp: number;
  maxExp: number | null;
  nextLevelExp: number | null;
}

/**
 * Menghitung progress level berdasarkan EXP total.
 * Aturan:
 * 1. Jika EXP tepat pada batas atas level (max), dianggap level tersebut sudah 100% (belum naik level).
 * 2. Progress dihitung relatif terhadap range level saat ini: (EXP - min) / (max - min).
 * 
 * @param exp Total EXP pengguna (integer >= 0)
 * @returns Object LevelProgress berisi detail level dan persentase
 */
export function calculateLevelProgress(exp: number): LevelProgress {
  // Pastikan exp tidak negatif
  const safeExp = Math.max(0, Math.floor(exp));

  // Cari level yang sesuai
  // Kita iterasi dari level terendah
  let currentLevelIdx = 0;
  
  for (let i = 0; i < JOURNEY_LEVELS.length; i++) {
    const lvl = JOURNEY_LEVELS[i];
    
    // Jika level ini punya max (bukan level terakhir)
    if (lvl.max !== null) {
      // Cek apakah EXP masuk dalam range level ini
      // Menggunakan <= pada max untuk menangani kasus "tepat pada batas atas"
      // Artinya 1000 masuk ke Newbie (0-1000), bukan Learner (1000-2200)
      if (safeExp <= lvl.max) {
        currentLevelIdx = i;
        break;
      }
    } else {
      // Level terakhir (Proficient), exp >= 5200
      currentLevelIdx = i;
      break;
    }
  }

  const lvl = JOURNEY_LEVELS[currentLevelIdx];
  const min = lvl.min;
  const max = lvl.max;
  
  let progressPercent = 0;

  if (max !== null) {
    const range = max - min;
    const relativeExp = safeExp - min;
    
    // Hitung persentase
    // Jika range 0 (tidak mungkin di config ini, tapi untuk safety), progress 100%
    if (range <= 0) {
      progressPercent = 100;
    } else {
      const rawPercent = (relativeExp / range) * 100;
      // Clamp 0-100 (seharusnya sudah aman dengan logika pencarian level, tapi untuk presisi)
      progressPercent = Math.min(100, Math.max(0, rawPercent));
    }
  } else {
    // Level terakhir (unbounded)
    // Asumsikan 100% atau hitung progress ke target fiktif?
    // User tidak spesifik untuk level max, tapi biasanya 100% atau based on next milestone.
    // Kita set 100% karena "Sudah sangat mahir".
    progressPercent = 100;
  }

  return {
    level: currentLevelIdx + 1,
    label: lvl.label,
    progressPercent: Number(progressPercent.toFixed(2)), // Format 2 desimal
    currentExp: safeExp,
    minExp: min,
    maxExp: max,
    nextLevelExp: max, // Alias for convenient UI usage
  };
}
