'use server';
import { createClient } from '@/utils/supabase/server';

export async function fetchExercises(params?: { id_pelajaran?: number; nomor_latihan?: number }) {
  const supabase = await createClient();
  let query = supabase.from('latihans').select('*');

  if (params?.id_pelajaran !== undefined) {
    query = query.eq('id_pelajaran', params.id_pelajaran!);
  }
  if (params?.nomor_latihan !== undefined) {
    query = query.eq('nomor_latihan', params.nomor_latihan!);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching exercises:', error);
    return { data: [], error: error.message };
  }

  return { data: data || [], error: null };
}

export async function submitHasilLatihan(params: {
  nilai: number;
  id_pelajaran: number;
  nomor_latihan: number;
  id_latihan: number;
}) {
  const supabase = await createClient();

  // Get current user from auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error getting user:', userError);
    return { data: null, error: 'User not authenticated' };
  }

  // Get pengguna ID from penggunas table using auth UUID
  const { data: penggunaData, error: penggunaError } = await supabase
    .from('penggunas')
    .select('id')
    .eq('uuid', user.id)
    .single();

  if (penggunaError || !penggunaData) {
    console.error('Error getting pengguna:', penggunaError);
    return { data: null, error: 'Pengguna not found' };
  }

  // Cek apakah hasil sudah ada untuk kombinasi pengguna + pelajaran + nomor_latihan
  const { data: existingRows, error: existingError } = await supabase
    .from('hasil_latihans')
    .select('id, nilai, id_latihan, created_at')
    .eq('id_pengguna', penggunaData.id)
    .eq('id_pelajaran', params.id_pelajaran)
    .eq('nomor_latihan', params.nomor_latihan)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!existingError && existingRows && existingRows.length > 0) {
    return { data: existingRows[0], error: null, earnedExp: 0 };
  }

  const { data, error } = await supabase
    .from('hasil_latihans')
    .insert({
      nilai: params.nilai,
      id_pelajaran: params.id_pelajaran,
      id_pengguna: penggunaData.id,
      nomor_latihan: params.nomor_latihan,
      id_latihan: params.id_latihan,
    })
    .select();

  if (error) {
    console.error('Error submitting hasil latihan:', error);
    return { data: null, error: error.message };
  }

  // Tambah EXP 100 untuk user ini (log progres)
  // Cek apakah user sudah memiliki data_pengguna
  const { data: expRows, error: getExpError } = await supabase
    .from('data_penggunas')
    .select('exp')
    .eq('id_pengguna', penggunaData.id)
    .single();
  if (getExpError || !expRows) {
    console.error('Error getting EXP:', getExpError);
    // Jangan gagalkan submit hasil jika EXP gagal, cukup log error
  }

  // Hitung total EXP dari points soal-soal latihan terkait
  const { data: exercisesData, error: exercisesError } = await supabase
    .from('latihans')
    .select('points')
    .eq('id_pelajaran', params.id_pelajaran)
    .eq('nomor_latihan', params.nomor_latihan);

  let expToAdd = 0;
  if (!exercisesError && exercisesData) {
    expToAdd = exercisesData.reduce((sum, item) => {
      const p = Number(item.points);
      return sum + (isNaN(p) ? 0 : p);
    }, 0);
  } else if (exercisesError) {
    console.error('Error fetching exercises points:', exercisesError);
  }

  const currentExp = expRows?.exp || 0;
  const newExp = currentExp + expToAdd;

  const { error: expError } = await supabase
    .from('data_penggunas')
    .update({
      exp: newExp,
    })
    .eq('id_pengguna', penggunaData.id);
  if (expError) {
    console.error('Error adding EXP:', expError);
    // Jangan gagalkan submit hasil jika EXP gagal, cukup log error
  } else {
    // Update streak harian setelah EXP berhasil ditambahkan
    try {
      await supabase.rpc('streak_harian_update', {
        p_id_pengguna: penggunaData.id,
        p_exp: expToAdd,
      });
    } catch (streakError) {
      console.error('Error updating streak:', streakError);
      // Jangan gagalkan submit hasil jika streak gagal, cukup log error
    }
  }

  return { data: data?.[0] || null, error: null, earnedExp: expToAdd };
}
