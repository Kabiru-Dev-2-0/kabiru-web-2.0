'use server';
import { createClient } from '@/utils/supabase/server';

export async function fetchExercises(params?: { id_pelajaran?: number; nomor_latihan?: number }) {
  const supabase = await createClient();
  // Ambil seluruh kolom, lalu sanitasi sebelum dikirim ke client
  // Alasan: skema dapat berubah-ubah; sanitasi dilakukan programatik untuk menghapus kunci jawaban/solusi
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

  const deepStrip = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    const dangerKeys = new Set([
      'solution',
      'solutions',
      'explanation',
      'rationale',
      'analysis',
      'answer_text',
      'kunci',
      'kunci_jawaban',
      'pembahasan',
    ]);
    if (Array.isArray(obj)) return obj.map((v) => deepStrip(v));
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (dangerKeys.has(k)) continue;
      out[k] = deepStrip(v);
    }
    return out;
  };

  const sanitized = (data || []).map((row: any): any => {
    const r = { ...row };
    // Hapus metadata pembahasan pada level atas jika ada
    delete (r as any).pembahasan;
    delete (r as any).explanation;
    delete (r as any).rationale;
    // Sanitasi field JSON 'data' agar tidak mengandung pembahasan/solusi panjang
    if (r.data && typeof r.data === 'object') {
      r.data = deepStrip(r.data);
    }
    return r;
  });

  return { data: sanitized, error: null };
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
    const existing = existingRows[0];
    const createdAt = new Date(existing.created_at).getTime();
    const now = new Date().getTime();

    // Jika data sudah ada dan dibuat kurang dari 30 detik yang lalu (kemungkinan double submit)
    // Kembalikan nilai EXP yang seharusnya didapat agar UI tidak "blip" ke 0
    if (now - createdAt < 30000) {
      const { data: exercisesData } = await supabase
        .from('latihans')
        .select('points')
        .eq('id_pelajaran', params.id_pelajaran)
        .eq('nomor_latihan', params.nomor_latihan);

      let expToAdd = 0;
      if (exercisesData) {
        expToAdd = exercisesData.reduce((sum, item) => {
          const p = Number(item.points);
          return sum + (isNaN(p) ? 0 : p);
        }, 0);
      }
      return { data: existing, error: null, earnedExp: expToAdd };
    }

    return { data: existing, error: null, earnedExp: 0 };
  }

  // Server-side gating: pastikan bagian & latihan yang diminta sudah unlocked
  try {
    // Ambil info pelajaran (bagian, id_modul)
    const { data: pelInfo } = await supabase
      .from('pelajarans')
      .select('id, bagian, id_modul')
      .eq('id', params.id_pelajaran)
      .single();
    if (!pelInfo) {
      return { data: null, error: 'Pelajaran tidak ditemukan' };
    }
    // Hitung activeBagianByProgress pada modul yang sama
    const { data: allPelajarans } = await supabase
      .from('pelajarans')
      .select('id, bagian')
      .eq('id_modul', pelInfo.id_modul)
      .order('bagian', { ascending: true });
    let activeBagianByProgress: number | null = null;
    if (allPelajarans && allPelajarans.length > 0) {
      for (const p of allPelajarans) {
        const { data: latList } = await supabase
          .from('latihans')
          .select('nomor_latihan')
          .eq('id_pelajaran', p.id)
          .order('nomor_latihan', { ascending: true });
        const uniqLat = latList
          ? Array.from(new Map(latList.map((item) => [item.nomor_latihan, item])).values())
          : [];
        uniqLat.sort((a: any, b: any) => a.nomor_latihan - b.nomor_latihan);
        const { data: hasilList } = await supabase
          .from('hasil_latihans')
          .select('nomor_latihan')
          .eq('id_pengguna', penggunaData.id)
          .eq('id_pelajaran', p.id);
        const selesai = new Set((hasilList || []).map((h) => h.nomor_latihan));
        const hasIncomplete = uniqLat.some((l: any) => !selesai.has(l.nomor_latihan));
        if (hasIncomplete) {
          activeBagianByProgress = p.bagian;
          break;
        }
      }
      if (!activeBagianByProgress) {
        activeBagianByProgress = allPelajarans[0].bagian;
      }
    }
    if (activeBagianByProgress && pelInfo.bagian > activeBagianByProgress) {
      return { data: null, error: 'Bagian masih terkunci' };
    }
    // Cek allowed nomor_latihan dalam pelajaran ini
    const { data: latList } = await supabase
      .from('latihans')
      .select('nomor_latihan')
      .eq('id_pelajaran', pelInfo.id)
      .order('nomor_latihan', { ascending: true });
    const uniqLat = latList
      ? Array.from(new Map(latList.map((item) => [item.nomor_latihan, item])).values())
      : [];
    uniqLat.sort((a: any, b: any) => a.nomor_latihan - b.nomor_latihan);
    const { data: hasilList } = await supabase
      .from('hasil_latihans')
      .select('nomor_latihan')
      .eq('id_pengguna', penggunaData.id)
      .eq('id_pelajaran', pelInfo.id);
    const selesai = new Set((hasilList || []).map((h) => h.nomor_latihan));
    let nextNomor: number | null = null;
    for (const l of uniqLat) {
      if (!selesai.has(l.nomor_latihan)) {
        nextNomor = l.nomor_latihan;
        break;
      }
    }
    const isCompleted = selesai.has(params.nomor_latihan);
    const isCurrent = nextNomor !== null && nextNomor === params.nomor_latihan;
    if (!isCompleted && !isCurrent) {
      return { data: null, error: 'Latihan ini masih terkunci' };
    }
  } catch (e) {
    console.error('Gating check failed:', e);
    // Jika terjadi error saat cek gating, amankan dengan menolak
    return { data: null, error: 'Gagal memverifikasi akses latihan' };
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

  // Validasi tambahan anti-cheat pada nilai
  try {
    const totalPossible =
      exercisesData?.reduce((s: number, it: any) => s + Number(it.points || 0), 0) ?? 0;
    const nilaiClamped = Math.max(0, Math.min(100, Number(params.nilai || 0)));
    // Jika nilai 100 padahal user belum menyelesaikan semua soal pada latihan ini, tolak
    if (nilaiClamped === 100 && totalPossible > 0) {
      const { data: latList } = await supabase
        .from('latihans')
        .select('id')
        .eq('id_pelajaran', params.id_pelajaran)
        .eq('nomor_latihan', params.nomor_latihan);
      const expectedCount = Array.isArray(latList) ? latList.length : 0;
      // Hitung attempt sebelumnya untuk latihan ini
      const { data: recent } = await supabase
        .from('hasil_latihans')
        .select('id')
        .eq('id_pengguna', penggunaData.id)
        .eq('id_pelajaran', params.id_pelajaran)
        .eq('nomor_latihan', params.nomor_latihan);
      const attemptCount = Array.isArray(recent) ? recent.length : 0;
      if (expectedCount > 0 && attemptCount === 0) {
        // Indikasi submit instan tanpa proses — tolak agar tidak dapat menebak
        return { data: null, error: 'Validasi jawaban gagal' };
      }
    }
  } catch (e) {
    // Jangan gagalkan proses jika validasi tambahan gagal, hanya log
    console.error('Post-validate nilai failed:', e);
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
