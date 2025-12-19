'use client';
import { LearningPathCard } from '@/components/learning-path-card';
import { Skeleton } from '@heroui/skeleton';
import {
  BookStarColor,
  BookOpenLightbulbColor,
  DataPieColor,
  MoleculeColor,
} from '@fluentui/react-icons';
import { createClient } from '@/utils/supabase/client';
import { getCompletedBagiansForModul } from '@/utils/supabase/progress-helpers';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BelajarPage() {
  const [ongoingCourses, setOngoingCourses] = useState<
    Array<{
      title: string;
      description: string;
      progress: number;
      total: number;
      iconComponent: React.ReactNode;
      category: string;
      id: number;
      modulNumber: number;
      completedCount: number;
      totalCount: number;
    }>
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
          let courseRows: Array<{
            title: string;
            description: string;
            progress: number;
            total: number;
            iconComponent: React.ReactNode;
            category: string;
            id: number;
            modulNumber: number;
            completedCount: number;
            totalCount: number;
          }> = [];

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
            let percent = 0;
            let totalCount = 0;
            let completedCount = 0;
            if (penggunaId) {
              const rows = await getCompletedBagiansForModul(supabase as any, id, penggunaId);
              totalCount = rows.length;
              completedCount = rows.filter((r) => r.status === 'done').length;
              percent = rows.length
                ? Math.round(rows.reduce((acc, r) => acc + (r.progress || 0), 0) / rows.length)
                : 0;
            }

            courseRows.push({
              id,
              title: modul.judul,
              description: modul.deskripsi,
              progress: percent,
              total: 100,
              iconComponent:
                modul.nomor_modul % 2 ? (
                  <DataPieColor className="w-10 h-10" />
                ) : (
                  <MoleculeColor className="w-10 h-10" />
                ),
              category: 'Progres Kamu',
              modulNumber: modul.nomor_modul,
              completedCount,
              totalCount,
            });
          }
          courseRows = courseRows.sort((a, b) => a.modulNumber - b.modulNumber);
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
        <div className="flex gap-2.5 justify-start items-start relative">
          {/* Progres Kamu */}
          <div className="flex-1 bg-white rounded-[14px] flex flex-col gap-[14px]">
            <div className="flex items-center gap-2.5">
              <BookStarColor className="w-10 h-10" />
              <h2 className="text-2xl font-semibold leading-8 text-black">Progres Kamu</h2>
            </div>

            <div className="flex gap-5">
              {loading ? (
                <>
                  <div className="w-[47%]">
                    <Skeleton className="h-36 w-full rounded-[14px]" />
                  </div>
                  <div className="w-[47%]">
                    <Skeleton className="h-36 w-full rounded-[14px]" />
                  </div>
                </>
              ) : (
                ongoingCourses.map((course) => (
                  <div key={course.id} className="w-[47%]">
                    <div className="w-full border border-[#E4E4E7] rounded-[14px] bg-white shadow-sm p-4 flex flex-col gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-[#71717A]">Modul {course.modulNumber}</span>
                        <span className="text-lg font-semibold text-[#0B1215]">{course.title}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#71717A]">{course.progress}%</span>
                        <span className="text-sm text-[#71717A]">
                          {course.completedCount}/{course.totalCount}
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-[#E4E4E7] rounded-full overflow-hidden">
                        <div
                          className="h-1.5 bg-[#3674B5]"
                          style={{ width: `${Math.max(0, Math.min(100, course.progress))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Learning Path Section */}
        <div className="flex flex-col gap-[14px]">
          <div className="flex items-center gap-2.5">
            <BookOpenLightbulbColor className="w-10 h-10" />
            <h2 className="text-2xl font-semibold leading-8 text-black">Learning Path</h2>
          </div>

          <div className="flex gap-5">
            {loading ? (
              <>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-full max-w-[30%]">
                    <Skeleton className="h-40 w-full rounded-lg" />
                  </div>
                ))}
              </>
            ) : (
              moduls.map((m) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
