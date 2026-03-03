'use client';

import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Skeleton } from '@heroui/skeleton';
import { LearningPathVisual } from '@/components/learning-path-visual';
import { ArrowLeftRegular } from '@fluentui/react-icons';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CircularProgress } from '@heroui/progress';

interface Stage {
  id: number;
  nomor_latihan: number;
  unit_name: string;
  judul: string;
  status: 'completed' | 'current' | 'locked';
  progres: number;
}

export default function UnitsPage() {
  const params = useParams();
  const router = useRouter();
  const modulId = params.modul as string;

  const [sections, setSections] = useState<
    Array<{ bagian: number; judul: string; pelajaranId: number; stages: Stage[] }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [modulInfo, setModulInfo] = useState<{ judul: string } | null>(null);
  const [currentSection, setCurrentSection] = useState<{ bagian: number; judul: string } | null>(
    null,
  );
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const fetchData = async () => {
    setLoading(true);
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setError('Gagal mengambil data user. Harap login ulang.');
      setLoading(false);
      return;
    }

    // Modul title
    const { data: modulData } = await supabase
      .from('moduls')
      .select('judul')
      .eq('id', modulId)
      .single();
    if (modulData) setModulInfo({ judul: modulData.judul });

    // Get pengguna ID from penggunas table using auth UUID
    const { data: penggunaData, error: penggunaError } = await supabase
      .from('penggunas')
      .select('id')
      .eq('uuid', user.id)
      .single();
    if (penggunaError || !penggunaData) {
      setError('Data pengguna tidak ditemukan');
      setLoading(false);
      return;
    }

    // Ambil semua pelajaran (bagian) dalam modul
    const { data: allPelajarans } = await supabase
      .from('pelajarans')
      .select('id, judul, bagian')
      .eq('id_modul', modulId)
      .order('bagian', { ascending: true });

    let activeBagianByProgress: number | null = null;
    const hasilMap: Record<number, Array<{ nomor_latihan: number; nilai: number }>> = {};
    const latihansMap: Record<number, Array<{ nomor_latihan: number; unit_name: string }>> = {};

    if (allPelajarans && allPelajarans.length > 0) {
      for (const p of allPelajarans) {
        const { data: latList } = await supabase
          .from('latihans')
          .select('nomor_latihan, id_pelajaran, unit_name')
          .eq('id_pelajaran', p.id)
          .order('nomor_latihan', { ascending: true });
        const uniqLat = latList
          ? Array.from(new Map(latList.map((item) => [item.nomor_latihan, item])).values())
          : [];
        uniqLat.sort((a, b) => a.nomor_latihan - b.nomor_latihan);
        latihansMap[p.id] = uniqLat.map((l) => ({
          nomor_latihan: l.nomor_latihan,
          unit_name: l.unit_name || `Unit ${l.nomor_latihan}`,
        }));

        const { data: hasilList } = await supabase
          .from('hasil_latihans')
          .select('nomor_latihan, id_pelajaran, nilai')
          .eq('id_pengguna', penggunaData.id)
          .eq('id_pelajaran', p.id);
        hasilMap[p.id] = (hasilList || []).map((h) => ({
          nomor_latihan: h.nomor_latihan,
          nilai: h.nilai,
        }));
      }
      for (const p of allPelajarans) {
        const uniqLat = latihansMap[p.id] || [];
        const hasil = new Set((hasilMap[p.id] || []).map((h) => h.nomor_latihan));
        const hasIncomplete = uniqLat.some((lat) => !hasil.has(lat.nomor_latihan));
        if (hasIncomplete) {
          activeBagianByProgress = p.bagian;
          break;
        }
      }
    }
    if (!activeBagianByProgress && allPelajarans && allPelajarans.length > 0) {
      activeBagianByProgress = allPelajarans[0].bagian;
    }

    const builtSections: Array<{
      bagian: number;
      judul: string;
      pelajaranId: number;
      stages: Stage[];
    }> = [];
    if (allPelajarans && allPelajarans.length > 0) {
      for (const p of allPelajarans) {
        const uniqLat = latihansMap[p.id] || [];
        const hasil = hasilMap[p.id] || [];
        const bagianNum = p.bagian;

        let stagesForThis: Stage[] = [];
        if (activeBagianByProgress && bagianNum < activeBagianByProgress) {
          stagesForThis = uniqLat.map((lat) => {
            const ada = hasil.find((h) => h.nomor_latihan === lat.nomor_latihan);
            return {
              id: lat.nomor_latihan,
              nomor_latihan: lat.nomor_latihan,
              unit_name: lat.unit_name,
              judul: `Latihan ${lat.nomor_latihan}`,
              status: ada ? 'completed' : 'locked',
              progres: ada ? ada.nilai : 0,
            };
          });
        } else if (activeBagianByProgress && bagianNum === activeBagianByProgress) {
          stagesForThis = uniqLat.map((lat, idx) => {
            const ada = hasil.find((h) => h.nomor_latihan === lat.nomor_latihan);
            if (ada) {
              return {
                id: lat.nomor_latihan,
                nomor_latihan: lat.nomor_latihan,
                unit_name: lat.unit_name,
                judul: `Latihan ${lat.nomor_latihan}`,
                status: 'completed',
                progres: ada.nilai,
              };
            }
            const prev = idx > 0 ? uniqLat[idx - 1] : null;
            const prevDone = prev
              ? !!hasil.find((h) => h.nomor_latihan === prev.nomor_latihan)
              : true;
            const isCurrent = prevDone && !hasil.find((h) => h.nomor_latihan === lat.nomor_latihan);
            return {
              id: lat.nomor_latihan,
              nomor_latihan: lat.nomor_latihan,
              unit_name: lat.unit_name,
              judul: `Latihan ${lat.nomor_latihan}`,
              status: isCurrent ? 'current' : 'locked',
              progres: 0,
            };
          });
          let foundCurrent = false;
          stagesForThis = stagesForThis.map((s) => {
            if (s.status === 'current') {
              if (foundCurrent) {
                return { ...s, status: 'locked' };
              }
              foundCurrent = true;
              return s;
            }
            return s;
          });
        } else {
          stagesForThis = uniqLat.map((lat) => ({
            id: lat.nomor_latihan,
            nomor_latihan: lat.nomor_latihan,
            unit_name: lat.unit_name,
            judul: `Latihan ${lat.nomor_latihan}`,
            status: 'locked',
            progres: 0,
          }));
        }

        builtSections.push({
          bagian: p.bagian,
          judul: p.judul,
          pelajaranId: p.id,
          stages: stagesForThis,
        });
      }
    }

    setSections(builtSections);

    // Calculate overall progress
    const totalStages = Object.values(latihansMap).reduce((sum, arr) => sum + arr.length, 0);
    const completedStages = Object.keys(hasilMap).reduce(
      (sum, key) => sum + hasilMap[Number(key)].length,
      0,
    );
    const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
    setOverallProgress(progress);

    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [modulId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const b = visible.target.getAttribute('data-bagian');
          const j = visible.target.getAttribute('data-judul');
          if (b && j) {
            setCurrentSection({ bagian: parseInt(b), judul: j });
          }
        }
      },
      { threshold: [0.5] },
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const handleStageClick = (
    nomorLatihan: number,
    pelajaranId: number,
    bagian: number,
    secStages: Stage[],
  ) => {
    const stage = secStages.find((s) => s.id === nomorLatihan);
    if (stage && stage.status !== 'locked') {
      const target = `/belajar/${modulId}/${bagian}/quiz?id=${nomorLatihan}`;
      router.push(target);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 relative">
        <div className="px-6 sticky top-0 z-[20]">
          <div className="sticky bg-white p-2 top-0 w-[100%] z-[20]"></div>
          <Card className="border-2 border-[#E4E4E7] shadow-sm bg-white" radius="lg">
            <CardBody className="p-[14px_32px] gap-5">
              <div className="flex items-center gap-6">
                <Button
                  as={Link}
                  href={`/belajar/${modulId}`}
                  isIconOnly
                  variant="light"
                  color="primary"
                  size="lg"
                  className="min-w-0 w-8 h-8"
                >
                  <ArrowLeftRegular className="w-8 h-8 text-[#3674B5]" />
                </Button>
                <div className="flex-1 flex items-center gap-1 min-w-0">
                  <div className="flex-1 flex flex-col gap-2 min-w-0">
                    <Skeleton className="w-24 h-4 rounded-md" />
                    <Skeleton className="w-64 h-8 rounded-md" />
                  </div>
                  <Skeleton className="w-[72px] h-[72px] rounded-full" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="flex gap-6 p-6">
          <div className="flex-1">
            <Skeleton className="w-full h-[300px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6">
        <Card className="p-8 bg-white shadow-lg border-2 border-red-200" radius="lg">
          <CardBody className="flex flex-col items-center gap-4">
            <p className="text-lg font-semibold text-red-500">{error}</p>
            <Button color="primary" onClick={fetchData}>
              Coba Lagi
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div className="px-6 sticky top-0 z-[20]">
        <div className="sticky bg-white p-2 top-0 w-[100%] z-[20]"></div>
        <Card className="border-2 border-[#E4E4E7] shadow-sm bg-white" radius="lg">
          <CardBody className="p-[14px_32px] gap-5">
            <div className="flex items-center gap-6">
              <Button
                as={Link}
                href={`/belajar/${modulId}`}
                isIconOnly
                variant="light"
                color="primary"
                size="lg"
                className="min-w-0 w-8 h-8"
              >
                <ArrowLeftRegular className="w-8 h-8 text-[#3674B5]" />
              </Button>

              <div className="flex-1 flex items-center gap-1 min-w-0">
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <span className="text-lg font-medium text-[#A1A1AA]">
                    {currentSection ? `Bagian ${currentSection.bagian}` : 'Semua Bagian'}
                  </span>
                  <h1 className="text-2xl font-semibold text-[#3F3F46] truncate">
                    {currentSection?.judul || modulInfo?.judul || 'Modul'}
                  </h1>
                </div>

                <div className="relative w-[72px] h-[72px]">
                  <CircularProgress
                    aria-label="Percentage"
                    classNames={{
                      svg: 'w-20 h-20 drop-shadow-md',
                      indicator: 'stroke-[#F5A524]',
                      track: 'stroke-[#ffffff]/35',
                      value: 'text-md font-semibold text-[#F5A524]',
                    }}
                    showValueLabel={true}
                    strokeWidth={4}
                    value={overallProgress}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex gap-6 p-6">
        <div className="flex-1 flex flex-col gap-10">
          {(() => {
            let running = 0;
            const items = sections.map((sec, idx) => {
              const startIdx = running % 8;
              running += sec.stages.length;
              return { sec, idx, startIdx };
            });
            return items.map(({ sec, idx, startIdx }) => (
              <div
                key={`${sec.bagian}-${idx}`}
                className="flex flex-col gap-6"
                data-bagian={sec.bagian}
                data-judul={sec.judul}
                ref={(el) => {
                  sectionRefs.current[sec.bagian] = el;
                }}
              >
                {idx >= 0 && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 border-t border-[#3674B5]/40" />
                    <div className="text-center text-[#3F3F46]">
                      <div className="text-sm text-[#A1A1AA]">Bagian {sec.bagian}</div>
                      <div className="text-base font-medium">{sec.judul}</div>
                    </div>
                    <div className="flex-1 border-t border-[#3674B5]/40" />
                  </div>
                )}
                <LearningPathVisual
                  stages={sec.stages.map(({ id, nomor_latihan, unit_name, status }) => ({
                    id,
                    nomor_latihan,
                    unit_name,
                    status,
                  }))}
                  startIndex={startIdx}
                  onStageClick={(nomor) =>
                    handleStageClick(nomor, sec.pelajaranId, sec.bagian, sec.stages)
                  }
                />
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
