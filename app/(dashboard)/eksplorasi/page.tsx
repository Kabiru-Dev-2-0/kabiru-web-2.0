'use client';
import { LearningPathCard } from '@/components/learning-path-card';
import { ProgressCourseCard } from '@/components/progress-course-card';
import { Tooltip } from '@heroui/tooltip';
import {
  BookStarColor,
  BookOpenLightbulbColor,
  DataPieColor,
  MoleculeColor,
} from '@fluentui/react-icons';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BelajarPage() {
  const [ongoingCourses, setOngoingCourses] = useState<
    Array<{ title: string; description: string; progress: number; total: number; iconComponent: React.ReactNode; category: string; id: number }>
  >([]);

  type Modul = { id: number; judul: string; deskripsi: string; nomor_modul: number };
  const [moduls, setModuls] = useState<Modul[]>([]);
  const [pelajarans, setPelajarans] = useState<Array<{ id: number; id_modul: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      setLoading(true);
      const { data: modulsData, error: modErr } = await supabase
        .from('moduls')
        .select('id, judul, deskripsi, nomor_modul')
        .order('nomor_modul', { ascending: true });
      if (modErr) {
        setError('Gagal mengambil data modul');
        setLoading(false);
        return;
      }
      setModuls(modulsData || []);
      const ids = (modulsData || []).map((m: any) => m.id);
      if (ids.length > 0) {
        const { data: pelData } = await supabase
          .from('pelajarans')
          .select('id, id_modul')
          .in('id_modul', ids);
        setPelajarans(pelData || []);
      }

      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (user) {
          const { data: pengguna } = await supabase
            .from('penggunas')
            .select('id')
            .eq('uuid', user.id)
            .single();
          const penggunaId = pengguna?.id as number | undefined;
          let courseRows: Array<{ title: string; description: string; progress: number; total: number; iconComponent: React.ReactNode; category: string; id: number }> = [];

          // Ambil modul_dipilih
          let chosenId: number | undefined = undefined;
          if (penggunaId) {
            const { data: row } = await supabase
              .from('data_penggunas')
              .select('modul_dipilih')
              .eq('id_pengguna', penggunaId)
              .single();
            if (typeof row?.modul_dipilih === 'number') chosenId = row!.modul_dipilih;
          }

          const targetIds = [chosenId, ...(modulsData || []).map((m: any) => m.id)].filter(
            (v, i, arr) => typeof v === 'number' && arr.indexOf(v) === i
          ) as number[];

          for (const id of targetIds.slice(0, 2)) {
            const modul = (modulsData || []).find((m: any) => m.id === id);
            if (!modul) continue;
            const pelIds = (pelajarans || [])
              .filter((p) => p.id_modul === id)
              .map((p) => p.id);

            let totalCount = 0;
            let completed = 0;
            if (pelIds.length > 0) {
              const { data: latihans } = await supabase
                .from('latihans')
                .select('id, id_pelajaran, nomor_latihan')
                .in('id_pelajaran', pelIds);
              totalCount = (latihans || []).length;

              if (penggunaId) {
                const { data: hasil } = await supabase
                  .from('hasil_latihans')
                  .select('id_pelajaran, nomor_latihan')
                  .eq('id_pengguna', penggunaId)
                  .in('id_pelajaran', pelIds);
                const set = new Set<string>();
                (hasil || []).forEach((h: any) => set.add(`${h.id_pelajaran}-${h.nomor_latihan}`));
                completed = set.size;
              }
            }

            courseRows.push({
              id,
              title: modul.judul,
              description: modul.deskripsi,
              progress: completed,
              total: Math.max(totalCount, 1),
              iconComponent: modul.nomor_modul % 2 ? (
                <DataPieColor className="w-10 h-10" />
              ) : (
                <MoleculeColor className="w-10 h-10" />
              ),
              category: 'Progres Kamu',
            });
          }
          setOngoingCourses(courseRows);
        }
      } catch {}

      setLoading(false);
    };
    load();
  }, []);

  const countsMap = useMemo(() => {
    const map: Record<number, number> = {};
    pelajarans.forEach((p) => {
      map[p.id_modul] = (map[p.id_modul] || 0) + 1;
    });
    return map;
  }, [pelajarans]);

  function getIcon(n: number) {
    const icons = ['🤖', '🧠', '💻', '📊', '🎯', '🚀'];
    return icons[(n - 1) % icons.length];
  }

  async function handleSelect(e: React.MouseEvent, id: number) {
    e.preventDefault();
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) {
      router.push('/login');
      return;
    }
    const { data: pengguna } = await supabase
      .from('penggunas')
      .select('id')
      .eq('uuid', user.id)
      .single();
    if (!pengguna) {
      return;
    }
    const { data: existing } = await supabase
      .from('data_penggunas')
      .select('id')
      .eq('id_pengguna', pengguna.id)
      .single();
    if (existing) {
      await supabase
        .from('data_penggunas')
        .update({ modul_dipilih: id })
        .eq('id_pengguna', pengguna.id);
    } else {
      await supabase.from('data_penggunas').insert({ id_pengguna: pengguna.id, modul_dipilih: id });
    }
    router.push(`/eksplorasi/${id}`);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex flex-col gap-8">
        {/* Lanjutkan Section */}
        <div className="flex gap-2.5 relative">
          {/* Left: Progres Kamu */}
          <div className="flex-1 bg-white rounded-[14px] p-[14px] flex flex-col gap-[14px]">
            <div className="flex items-center gap-2.5">
              <BookStarColor className="w-10 h-10" />
              <h2 className="text-2xl font-semibold leading-8 text-black">Progres Kamu</h2>
            </div>

            <div className="flex gap-[14px]">
              {ongoingCourses.map((course) => (
                <div key={course.id} className="w-[363px]">
                  <ProgressCourseCard
                    {...course}
                    href={`/eksplorasi/${course.id}`}
                    valueLabel={`${course.progress}/${course.total}`}
                    buttonText="Lanjutkan"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Path Section */}
        <div className="flex flex-col gap-[14px]">
          <div className="flex items-center gap-2.5">
            <BookOpenLightbulbColor className="w-10 h-10" />
            <h2 className="text-2xl font-semibold leading-8 text-black">Learning Path</h2>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {moduls.map((m) => (
              <LearningPathCard
                key={m.id}
                nomor={m.nomor_modul}
                title={m.judul}
                description={m.deskripsi}
                modules={countsMap[m.id] || 0}
                icon={getIcon(m.nomor_modul)}
                buttonText="Mulai Belajar"
                href={`/eksplorasi/${m.id}`}
                onClick={(e) => handleSelect(e, m.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
