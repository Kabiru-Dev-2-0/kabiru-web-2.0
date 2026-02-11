'use client';
import { useEffect, useState } from 'react';
import { ModulProgressCard } from '@/components/modul-progress-card';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Divider } from '@heroui/divider';
import { Skeleton } from '@heroui/skeleton';
import {
  BookStarColor,
  CertificateColor,
  DataPieColor,
  MoleculeColor,
  BotColor,
} from '@fluentui/react-icons';
import { PeringkatWidget } from '@/components/peringkat-widget';
import { createClient } from '@/utils/supabase/client';
import { getCompletedBagiansForModul } from '@/utils/supabase/progress-helpers';
import Link from 'next/link';

type Modul = { id: number; judul: string; deskripsi: string; nomor_modul: number };

export default function DashboardPage() {
  const [ongoingCourses, setOngoingCourses] = useState<
    Array<{
      id: number;
      title: string;
      description: string;
      progress: number;
      total: number;
      iconComponent: React.ReactNode;
      category: string;
    }>
  >([]);
  const [completedModules, setCompletedModules] = useState<Modul[]>([]);
  const [username, setUsername] = useState<string>('Teman');
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [hasAnyProgress, setHasAnyProgress] = useState<boolean>(false);
  const [selectedOngoing, setSelectedOngoing] = useState<{
    id: number;
    modulNumber: number;
    title: string;
    description: string;
    completedCount: number;
    totalCount: number;
  } | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string>('');

  useEffect(() => {
    async function fetchAiAdvice() {
      if (loadingData) return;

      const CACHE_KEY = 'dashboard_ai_advice';
      const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

      // Check local storage
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { adviceList, timestamp } = JSON.parse(cached);

          // Jika cache masih valid dan formatnya array
          if (
            Date.now() - timestamp < CACHE_DURATION &&
            Array.isArray(adviceList) &&
            adviceList.length > 0
          ) {
            // Pilih satu saran secara acak dari array
            const randomAdvice = adviceList[Math.floor(Math.random() * adviceList.length)];
            setAiAdvice(randomAdvice);
            return;
          }
        }
      } catch (e) {
        console.error('Error reading advice cache', e);
      }

      // If no cache or expired, fetch new advice
      try {
        // Only fetch if we have user data loaded (which we should if loadingData is false)
        // We pass the ongoing and completed courses we already have in state
        const res = await fetch('/api/dashboard-advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            ongoingCourses: ongoingCourses.map((c) => ({ title: c.title, progress: c.progress })),
            completedModules: completedModules.map((m) => ({ judul: m.judul })),
          }),
        });

        if (res.ok) {
          const { advice } = await res.json();
          // Pastikan advice adalah array
          const adviceList = Array.isArray(advice) ? advice : [advice];

          if (adviceList.length > 0) {
            // Simpan array saran ke cache
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                adviceList: adviceList,
                timestamp: Date.now(),
              }),
            );

            // Tampilkan satu saran random
            const randomAdvice = adviceList[Math.floor(Math.random() * adviceList.length)];
            setAiAdvice(randomAdvice);
          }
        }
      } catch (e) {
        console.error('Failed to fetch AI advice', e);
        // Fallback text if AI fails
        setAiAdvice(
          "Hebat, kamu sudah memahami dasar logika dengan baik! 🎉 Tapi aku lihat kamu masih agak bingung di bagian looping dan efisiensi algoritma. Yuk, coba ulang latihan di bagian 'Simulasi Perulangan'",
        );
      }
    }

    fetchAiAdvice();
  }, [loadingData, ongoingCourses, completedModules, username]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoadingData(true);
      const supabase = createClient();

      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;

        const { data: modulsData } = await supabase
          .from('moduls')
          .select('id, judul, deskripsi, nomor_modul')
          .order('nomor_modul', { ascending: true });
        const moduls = (modulsData || []) as Modul[];

        let penggunaId: number | undefined = undefined;
        if (user) {
          const { data: pengguna } = await supabase
            .from('penggunas')
            .select('id')
            .eq('uuid', user.id)
            .single();
          penggunaId = (pengguna?.id as number | undefined) ?? undefined;
        }
        const computePercentForModul = async (id: number): Promise<number> => {
          if (!penggunaId) return 0;
          const rows = await getCompletedBagiansForModul(supabase as any, id, penggunaId);
          const avg = rows.length
            ? Math.round(rows.reduce((acc, r) => acc + (r.progress || 0), 0) / rows.length)
            : 0;
          return avg;
        };

        let chosenId: number | undefined = undefined;
        if (penggunaId) {
          const { data: row } = await supabase
            .from('data_penggunas')
            .select('modul_dipilih, username')
            .eq('id_pengguna', penggunaId)
            .single();
          if (typeof row?.modul_dipilih === 'number') chosenId = row!.modul_dipilih as number;
          if (row?.username) setUsername(row.username);
        }

        const allPercents = await Promise.all(moduls.map((m) => computePercentForModul(m.id)));
        setHasAnyProgress(allPercents.some((p) => p > 0));

        if (chosenId) {
          const modul = moduls.find((m) => m.id === chosenId) || null;
          if (modul && penggunaId) {
            const rows = await getCompletedBagiansForModul(supabase as any, modul.id, penggunaId);
            const totalCount = rows.length;
            const completedCount = rows.filter((r) => r.status === 'done').length;
            setSelectedOngoing({
              id: modul.id,
              modulNumber: modul.nomor_modul,
              title: modul.judul,
              description: modul.deskripsi,
              completedCount,
              totalCount,
            });
          } else {
            setSelectedOngoing(null);
          }
        } else {
          setSelectedOngoing(null);
        }

        const targetIds = [chosenId, ...moduls.map((m) => m.id)]
          .filter((v, i, arr) => typeof v === 'number' && arr.indexOf(v) === i)
          .slice(0, 2) as number[];
        const ongoingRows = (
          await Promise.all(
            targetIds.map(async (id) => {
              const modul = moduls.find((m) => m.id === id)!;
              const percent = await computePercentForModul(id);
              return {
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
              };
            }),
          )
        ).filter((x) => typeof x.progress === 'number');

        const completedRows: Modul[] = (
          await Promise.all(
            moduls.map(async (m) => {
              if (!penggunaId) return null as any;
              const rows = await getCompletedBagiansForModul(supabase as any, m.id, penggunaId);
              if (rows.length > 0 && rows.every((r) => r.status === 'done')) return m;
              return null as any;
            }),
          )
        ).filter((x) => x !== null) as Modul[];

        setOngoingCourses(ongoingRows);
        setCompletedModules(completedRows);
      } catch {
      } finally {
        setLoadingData(false);
      }
    }
    loadDashboardData();
  }, []);
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex gap-8 p-6">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Tooltip Section */}
          <div className="flex items-center gap-2.5 relative">
            <div className="flex flex-row items-center gap-4 w-full">
              <div className="w-fit h-full min-h[350px]  relative z-10">
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src="/imageAssets/agent-dashboard.png"
                    alt="Agent Dashboard"
                    className="object-contain h-fill w-auto"
                    style={{ aspectRatio: '155.25 / 200' }}
                  />
                </div>
              </div>

              {/* Tooltip utama */}
              <div className="relative">
                {/* Panah kiri atas */}
                <div className="absolute -left-2 top-4 w-5 h-5 bg-[#3674B5] rotate-45 rounded-sm"></div>
                <div className="p-6 w-full flex flex-col gap-[18px] bg-[#3674B5] rounded-xl shadow-xl relative z-0">
                  {aiAdvice ? (
                    <p className="text-lg leading-7 text-white font-regular whitespace-pre-line">
                      {aiAdvice}
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-3/4 rounded-lg bg-white/20" />
                      <Skeleton className="h-4 w-full rounded-lg bg-white/20" />
                      <Skeleton className="h-4 w-5/6 rounded-lg bg-white/20" />
                    </div>
                  )}
                  <Button
                    as={Link}
                    href="/belajar"
                    color="default"
                    radius="sm"
                    size="md"
                    className="bg-[#ffffff] text-[#2d5d94] font-regular text-md px-3 py-2.5 rounded-xl hover:bg-[#ffffff] transition-colors w-fit"
                    style={{
                      boxShadow: '0px 3px 0px 0px #E4E4E7',
                    }}
                  >
                    Belajar lagi
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Divider className="bg-[rgba(17,17,17,0.15)]" />

          {/* Sedang Dipelajari Section */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <BookStarColor className="w-10 h-10" />
              <h2 className="text-2xl font-semibold leading-8 text-black">Sedang dipelajari</h2>
            </div>

            <div className="flex gap-5">
              {loadingData ? (
                <>
                  <div className="flex flex-col w-full gap-5">
                    <Card className="w-full border border-[#F4F4F5] shadow-sm" radius="lg">
                      <CardBody className="p-5 gap-[14px]">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded-lg" />
                          <div className="flex-1 flex flex-col gap-2">
                            <Skeleton className="w-24 h-4 rounded-md" />
                            <Skeleton className="w-40 h-6 rounded-md" />
                          </div>
                        </div>
                        <Skeleton className="w-7 h-4 rounded-md" />
                        <Skeleton className="w-full h-4 rounded-md" />
                        <Skeleton className="w-24 h-8 rounded-md self-end" />
                      </CardBody>
                    </Card>
                  </div>
                </>
              ) : (
                <>
                  {!hasAnyProgress ? (
                    <p className="text-sm leading-5 text-[#848484] w-full text-center py-8">
                      Belum ada modul yang kamu mulai.
                      <br />
                      Yuk, pilih topik pertama dan mulai petualangan belajarmu! 🚀
                    </p>
                  ) : (
                    <>
                      {selectedOngoing ? (
                        <ModulProgressCard
                          modulNumber={selectedOngoing.modulNumber}
                          title={selectedOngoing.title}
                          description={selectedOngoing.description}
                          completedCount={selectedOngoing.completedCount}
                          totalCount={selectedOngoing.totalCount}
                          href={`/belajar/${selectedOngoing.id}`}
                        />
                      ) : (
                        <Card className="w-[333px] border border-[#F4F4F5] shadow-sm" radius="lg">
                          <CardBody className="p-5 gap-[14px]">
                            <p className="text-sm leading-5 text-[#11181C]">
                              Belum ada progres modul.
                            </p>
                          </CardBody>
                        </Card>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <Divider className="bg-[rgba(17,17,17,0.15)]" />

          {/* Selesai Dipelajari Section */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <CertificateColor className="w-10 h-10" />
              <h2 className="text-2xl font-semibold leading-8 text-black">Selesai dipelajari</h2>
            </div>

            <div className="flex gap-5 flex-wrap">
              {completedModules.length > 0 ? (
                <>
                  {completedModules.map((m) => (
                    <Card
                      key={m.id}
                      className="w-[333px] border border-[#F4F4F5] shadow-sm"
                      radius="lg"
                    >
                      <CardBody className="p-5 gap-[14px]">
                        <div className="flex items-center gap-3">
                          <BotColor className="w-10 h-10" />
                          <div className="flex-1 flex flex-col">
                            <span className="text-base font-medium leading-6 text-[#71717A]">
                              Learning Path
                            </span>
                            <span className="text-lg font-bold leading-7 text-black">
                              {m.judul}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm leading-5 text-[#11181C]">{m.deskripsi}</p>
                        <Button
                          color="primary"
                          radius="full"
                          size="sm"
                          className="px-3 h-8 w-fit"
                          as={undefined}
                        >
                          Ulas Materi
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                </>
              ) : !loadingData ? (
                <p className="text-sm leading-5 text-[#848484] w-full text-center py-8">
                  Belum ada modul yang selesai.
                  <br />
                  Selesaikan satu modul untuk mulai mengumpulkan pencapaianmu! 🏅
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[300px] flex flex-col gap-6 justify-between items-start">
          {/* Peringkat Card */}
          <PeringkatWidget />
        </div>
      </div>
    </div>
  );
}
