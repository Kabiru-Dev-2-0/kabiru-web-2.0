import { SupabaseClient } from '@supabase/supabase-js';

export interface PelajaranProgress {
  progress: number;
  completed_count: number;
  total_count: number;
  average_nilai: number;
  status: 'done' | 'progress' | 'locked';
}

/**
 * Menghitung progress pelajaran menggunakan Supabase function
 * @param supabase - Supabase client instance
 * @param idPelajaran - ID pelajaran yang ingin dihitung progressnya
 * @param idPengguna - ID pengguna (dari tabel penggunas, bukan UUID)
 * @returns Progress data atau null jika error
 */
export async function calculatePelajaranProgress(
  supabase: SupabaseClient,
  idPelajaran: number,
  idPengguna: number
): Promise<PelajaranProgress | null> {
  try {
    const { data, error } = await supabase.rpc('calculate_pelajaran_progress', {
      p_id_pelajaran: idPelajaran,
      p_id_pengguna: idPengguna,
    });

    if (error) {
      console.error('Error calculating progress:', error);
      return null;
    }

    // RPC returns array, ambil element pertama
    if (data && data.length > 0) {
      return data[0] as PelajaranProgress;
    }

    return null;
  } catch (err) {
    console.error('Exception calculating progress:', err);
    return null;
  }
}

/**
 * Menghitung progress untuk multiple pelajaran sekaligus
 * @param supabase - Supabase client instance
 * @param pelajarans - Array of pelajaran dengan id
 * @param idPengguna - ID pengguna
 * @returns Array of pelajaran dengan progress
 */
export async function calculateMultiplePelajaranProgress(
  supabase: SupabaseClient,
  pelajarans: Array<{ id: number; [key: string]: any }>,
  idPengguna: number
): Promise<Array<any>> {
  const pelajaransWithProgress = await Promise.all(
    pelajarans.map(async (pel) => {
      const progressData = await calculatePelajaranProgress(
        supabase,
        pel.id,
        idPengguna
      );

      return {
        ...pel,
        progress: progressData?.progress || 0,
        status: progressData?.status || (pel.bagian === 1 ? 'progress' : 'locked'),
        progressLabel:
          progressData?.status === 'done'
            ? 'SELESAI!'
            : progressData?.status === 'progress'
              ? `${progressData?.progress || 0}%`
              : 'DIKUNCI',
        average_nilai: progressData?.average_nilai || 0,
        completed_count: progressData?.completed_count || 0,
        total_count: progressData?.total_count || 0,
      };
    })
  );

  return pelajaransWithProgress;
}

/**
 * Mengambil status per bagian (pelajaran) dalam satu modul untuk user tertentu
 * RPC: get_completed_bagians(p_id_modul, p_id_pengguna)
 */
export async function getCompletedBagiansForModul(
  supabase: SupabaseClient,
  idModul: number,
  idPengguna: number
): Promise<Array<{ id_pelajaran: number; bagian: number; status: 'done' | 'progress' | 'locked'; progress: number }>> {
  const { data, error } = await supabase.rpc('get_completed_bagians', {
    p_id_modul: idModul,
    p_id_pengguna: idPengguna,
  });

  if (error) {
    console.error('Error fetching completed bagians:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id_pelajaran: row.id_pelajaran,
    bagian: row.bagian,
    status: row.status,
    progress: row.progress,
  }));
}

