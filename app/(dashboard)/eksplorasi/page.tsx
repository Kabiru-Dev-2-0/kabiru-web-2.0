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
import { useRouter, useSearchParams } from 'next/navigation';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';

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

  type Modul = {
    id: number;
    judul: string;
    deskripsi: string;
    nomor_modul: number;
    gambar?: string;
  };
  const [moduls, setModuls] = useState<Modul[]>([]);
  const [pelajarans, setPelajarans] = useState<Array<{ id: number; id_modul: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showChooseModuleModal, setShowChooseModuleModal] = useState(false);

  useEffect(() => {
    const from = searchParams.get('from');
    const info = searchParams.get('info');
    if (from === 'belajar' && info === 'pilih_modul') {
      setShowChooseModuleModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      setLoading(true);
      const { data: modulsData, error: modErr } = await supabase
        .from('moduls')
        .select('*')
        .order('nomor_modul', { ascending: true });
      if (modErr) {
        setError('Gagal mengambil data modul');
        setLoading(false);
        return;
      }
      // Client-side filter: if the rows include a `jenjang` column, only keep jenjang === 'sma'
      let fetchedModuls = (modulsData || []) as any[];
      if (
        fetchedModuls.length > 0 &&
        Object.prototype.hasOwnProperty.call(fetchedModuls[0], 'jenjang')
      ) {
        fetchedModuls = fetchedModuls.filter((m: any) => {
          const j = typeof m?.jenjang === 'string' ? m.jenjang.toLowerCase() : '';
          return j === 'sma';
        });
      }
      setModuls(fetchedModuls);
      const ids = fetchedModuls.map((m: any) => m.id);
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

          // Ambil histori 3 modul terakhir yang diklik dari localStorage
          let recentIds: number[] = [];
          try {
            const raw =
              typeof window !== 'undefined' ? localStorage.getItem('aizone.recentModules') : null;
            if (raw) {
              const arr = JSON.parse(raw) as Array<{ id: number; ts: number }>;
              if (Array.isArray(arr)) {
                // Filter hanya modul yang masih ada, ambil id unik, pilih 3 terakhir secara ascending waktu
                const valid = arr
                  .filter(
                    (x) =>
                      typeof x?.id === 'number' &&
                      (modulsData || []).some((m: any) => m.id === x.id),
                  )
                  .sort((a, b) => a.ts - b.ts);
                const last3 = valid.slice(-3);
                recentIds = last3.map((x) => x.id);
              }
            }
          } catch {}

          // Jika belum ada histori, fallback: gunakan modul_dipilih jika ada
          if (recentIds.length === 0) {
            if (penggunaId) {
              const { data: row } = await supabase
                .from('data_penggunas')
                .select('modul_dipilih')
                .eq('id_pengguna', penggunaId)
                .single();
              if (typeof row?.modul_dipilih === 'number') {
                recentIds = [row.modul_dipilih];
              }
            }
          }

          // Loop berdasarkan urutan recentIds (ascending by time), maksimal 3
          for (const id of recentIds) {
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
          // Jika belum ada histori sama sekali, biarkan kosong → akan tampil pesan "belum ada progres"
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
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('aizone.recentModules');
        let arr: Array<{ id: number; ts: number }> = [];
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) arr = parsed.filter((x) => typeof x?.id === 'number');
          } catch {}
        }
        arr = arr.filter((x) => x.id !== id);
        arr.push({ id, ts: Date.now() });
        // Batasi panjang history agar tidak membengkak
        if (arr.length > 20) {
          arr = arr.slice(-20);
        }
        localStorage.setItem('aizone.recentModules', JSON.stringify(arr));
      }
    } catch {}
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
      <Modal
        isOpen={showChooseModuleModal}
        onOpenChange={(open) => {
          setShowChooseModuleModal(open);
          if (!open) {
            router.replace('/eksplorasi');
          }
        }}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Pilih Modul Terlebih Dahulu</ModalHeader>
              <ModalBody>
                <p className="text-[#11181C]">
                  Kamu belum memilih modul belajar. Silakan pilih salah satu modul di bawah untuk
                  memulai proses belajar.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  style={{
                    boxShadow: '0px 3px 0px 0px #205994',
                  }}
                  className="w-fit justify-start gap-2 h-auto py-0 px-5 min-h-[48px] bg-[#3674B5] text-[#ffffff] font-semibold text-lg rounded-xl"
                  size="md"
                  onPress={onClose}
                >
                  Mengerti
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col gap-8">
        {/* Lanjutkan Section */}
        <div className="w-full relative">
          {/* Progres Kamu */}
          <div className="w-full rounded-[14px] bg-white flex flex-col gap-[14px]">
            <div className="flex items-center gap-2.5">
              <BookStarColor className="w-10 h-10" />
              <h2 className="text-2xl font-semibold leading-8 text-black">Progres Kamu</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {loading ? (
                <>
                  <div className="w-full">
                    <Skeleton className="h-36 w-full rounded-[14px]" />
                  </div>
                  <div className="w-full">
                    <Skeleton className="h-36 w-full rounded-[14px]" />
                  </div>
                  <div className="w-full">
                    <Skeleton className="h-36 w-full rounded-[14px]" />
                  </div>
                </>
              ) : ongoingCourses.length === 0 ? (
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <div className="w-full flex items-center justify-center py-10">
                    <p className="text-m text-[#71717A] text-center">
                      Belum ada progres belajar. <br />
                      Yuk, pilih topik pertama dan mulai petualangan belajarmu! 🚀
                    </p>
                  </div>
                </div>
              ) : (
                ongoingCourses.slice(-3).map((course) => (
                  <div key={course.id} className="w-full">
                    <div className="w-full border border-[#E4E4E7] rounded-[14px] shadow-sm p-4 flex flex-col gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-[#71717A]">Modul {course.modulNumber}</span>
                        <button
                          onClick={(e) => handleSelect(e, course.id)}
                          className="text-left text-lg font-semibold text-[#0B1215] hover:underline focus:outline-none cursor-pointer"
                          aria-label={`Buka modul ${course.title}`}
                        >
                          {course.title}
                        </button>
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
            <h2 className="text-2xl font-semibold leading-8 text-black">Modul Belajar</h2>
          </div>

          <div className="flex flex-wrap gap-5 w-full">
            {loading ? (
              <>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-full md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] 2xl:w-[calc((100%-3.75rem)/4)]"
                  >
                    <Skeleton className="h-[400px] w-full rounded-lg" />
                  </div>
                ))}
              </>
            ) : (
              moduls.map((m) => (
                <div
                  key={m.id}
                  className="w-full md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] 2xl:w-[calc((100%-3.75rem)/4)]"
                >
                  <LearningPathCard
                    nomor={m.nomor_modul}
                    title={m.judul}
                    description={m.deskripsi}
                    modules={countsMap[m.id] || 0}
                    imageUrl={m.gambar}
                    icon={getIcon(m.nomor_modul)}
                    buttonText="Mulai Belajar"
                    href={`/eksplorasi/${m.id}`}
                    onClick={(e) => handleSelect(e, m.id)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
