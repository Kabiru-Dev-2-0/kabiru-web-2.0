'use client';

import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Skeleton } from '@heroui/skeleton';
import { LearningPathVisual } from '@/components/learning-path-visual';
import { ArrowLeftRegular } from '@fluentui/react-icons';
import { useState, useEffect } from 'react';
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
  isEntry?: boolean;
}

export default function BagianPage() {
  const params = useParams();
  const router = useRouter();
  const bagian = params.bagian as string;
  const modulId = params.modul as string;

  const [pelajaran, setPelajaran] = useState<any>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [sections, setSections] = useState<Array<{ bagian: number; judul: string; pelajaranId: number; stages: Stage[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [hasCache, setHasCache] = useState<boolean>(false);
  const [activeBagian, setActiveBagian] = useState<number | null>(null);
  const fetchData = async () => {
    setLoading(!hasCache);
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

    // Fetch pelajaran berdasarkan bagian dan modul
    const { data: pelajaranData, error: errPelajaran } = await supabase
      .from('pelajarans')
      .select('id, judul, bagian')
      .eq('bagian', parseInt(bagian))
      .eq('id_modul', modulId)
      .single();

    if (errPelajaran || !pelajaranData) {
      setError('Pelajaran tidak ditemukan');
      setLoading(false);
      return;
    }

    setPelajaran(pelajaranData);

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

    const { data: latihansData, error: errLatihans } = await supabase
      .from('latihans') // Gunakan tabel latihans langsung
      .select('nomor_latihan, id_pelajaran, unit_name')
      .eq('id_pelajaran', pelajaranData.id)
      .order('nomor_latihan', { ascending: true });

    if (errLatihans) {
      console.error('Error fetching latihans:', errLatihans);
    }

    // Deduplicate latihans based on nomor_latihan to get unique Units
    const uniqueLatihans = latihansData
      ? Array.from(new Map(latihansData.map((item) => [item.nomor_latihan, item])).values())
      : [];

    // Sort by nomor_latihan just in case
    uniqueLatihans.sort((a, b) => a.nomor_latihan - b.nomor_latihan);

    // Fetch hasil latihan dari tabel hasil_latihans
    const { data: hasilLatihansData, error: errHasilLatihans } = await supabase
      .from('hasil_latihans')
      .select('id, nomor_latihan, nilai, created_at, id_pelajaran, id_pengguna')
      .eq('id_pengguna', penggunaData.id)
      .eq('id_pelajaran', pelajaranData.id)
      .order('created_at', { ascending: false });

    if (errHasilLatihans) {
      console.error('Error fetching hasil latihans:', errHasilLatihans);
    }

    // Map unique latihans to stages with status berdasarkan hasil_latihans
    const stagesWithStatus: Stage[] = uniqueLatihans.map((latihan, index) => {
      // Cari hasil latihan berdasarkan nomor_latihan
      const hasilLatihan = hasilLatihansData?.find(
        (hl) => hl.nomor_latihan === latihan.nomor_latihan,
      );

      let status: 'completed' | 'current' | 'locked' = 'locked';
      let progres = 0;

      if (hasilLatihan) {
        // Jika sudah ada hasil, berarti completed
        status = 'completed';
        progres = hasilLatihan.nilai;
      } else if (index === 0) {
        // Latihan pertama selalu available jika belum ada progress sama sekali
        // Tapi kita harus cek apakah latihan sebelumnya completed jika bukan yang pertama
        // Namun karena ini loop, index 0 adalah latihan pertama (nomor terkecil)
        status = 'current';
      } else {
        // Cek apakah latihan sebelumnya sudah selesai
        const prevLatihan = uniqueLatihans[index - 1];
        const prevHasil = hasilLatihansData?.find(
          (hl) => hl.nomor_latihan === prevLatihan.nomor_latihan,
        );

        if (prevHasil) {
          // Jika latihan sebelumnya sudah selesai, latihan ini available
          status = 'current';
        }
      }

      return {
        id: latihan.nomor_latihan, // Gunakan nomor_latihan sebagai ID stage
        nomor_latihan: latihan.nomor_latihan,
        unit_name: latihan.unit_name || `Unit ${latihan.nomor_latihan}`,
        judul: `Latihan ${latihan.nomor_latihan}`,
        status,
        progres,
      };
    });

    console.log('\n=== FINAL STAGES ===');
    console.log(stagesWithStatus);

    setStages(stagesWithStatus);

    // Ambil SEMUA pelajaran dalam modul (naik)
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
    setActiveBagian(activeBagianByProgress || null);

    const builtSections: Array<{ bagian: number; judul: string; pelajaranId: number; stages: Stage[] }> = [];
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
            const prevDone = prev ? !!hasil.find((h) => h.nomor_latihan === prev.nomor_latihan) : true;
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
          // Future sections: semuanya tetap locked, tanpa entry ▶
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
    const completedStages = stagesWithStatus.filter((s) => s.status === 'completed').length;
    const totalStages = stagesWithStatus.length;
    const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
    setOverallProgress(progress);

    setError(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `aizone.bagian.pelajaran.${modulId}.${bagian}.v2`,
          JSON.stringify(pelajaranData || null),
        );
        localStorage.setItem(
          `aizone.bagian.stages.${modulId}.${bagian}.v2`,
          JSON.stringify(stagesWithStatus || []),
        );
        localStorage.setItem(
          `aizone.bagian.overall.${modulId}.${bagian}.v2`,
          JSON.stringify(progress),
        );
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const pelStr = localStorage.getItem(`aizone.bagian.pelajaran.${modulId}.${bagian}.v2`);
        const stgStr = localStorage.getItem(`aizone.bagian.stages.${modulId}.${bagian}.v2`);
        const ovStr = localStorage.getItem(`aizone.bagian.overall.${modulId}.${bagian}.v2`);
        let used = false;
        if (pelStr) {
          try {
            const parsedPel = JSON.parse(pelStr);
            if (parsedPel) {
              setPelajaran(parsedPel);
              used = true;
            }
          } catch {}
        }
        if (stgStr) {
          try {
            const parsedStg = JSON.parse(stgStr);
            if (Array.isArray(parsedStg) && parsedStg.length > 0) {
              setStages(parsedStg);
              used = true;
            }
          } catch {}
        }
        if (ovStr) {
          try {
            const parsedOv = JSON.parse(ovStr);
            if (typeof parsedOv === 'number') {
              setOverallProgress(parsedOv);
              used = true;
            }
          } catch {}
        }
        if (used) {
          setHasCache(true);
          setError(null);
          setLoading(false);
        }
      }
    } catch {}
    fetchData();
  }, [bagian]);

  const handleStageClick = (nomorLatihan: number) => {
    const stage = stages.find((s) => s.id === nomorLatihan);
    if (stage && stage.status !== 'locked') {
      // Redirect to quiz page with nomor_latihan
      // Sertakan id_pelajaran agar quiz terfilter ke pelajaran yang dipilih
      const pelajaranId = pelajaran?.id;
      router.push(
        `/belajar/${modulId}/${bagian}/quiz?id=${nomorLatihan}${pelajaranId ? `&pelajaran=${pelajaranId}` : ''}`,
      );
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
                  <span className="text-lg font-medium text-[#A1A1AA]">Bagian {bagian}</span>
                  <h1 className="text-2xl font-semibold text-[#3F3F46] truncate">
                    {pelajaran?.judul}
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
            // Hitung startIndex agar pola node antar lesson nyambung
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
              >
                {idx > 0 && (
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
                    // Tampilkan ▶ hanya untuk unit pertama dari bagian AKTIF (berbeda dengan halaman saat ini)
                    // dan hanya jika unit tersebut memang 'current' (belum pernah dikerjakan).
                    isEntry:
                      Array.isArray(sec.stages) &&
                      sec.stages.length > 0 &&
                      id === sec.stages[0].id &&
                      status === 'current' &&
                      activeBagian != null &&
                      sec.bagian === activeBagian &&
                      Number(bagian) !== sec.bagian,
                  }))}
                  startIndex={startIdx}
                  onStageClick={(nomorLatihan, opts) => {
                    if (opts?.isEntry) {
                      // Pindah lesson (bagian) tanpa langsung buka quiz
                      router.push(`/belajar/${modulId}/${sec.bagian}`);
                      return;
                    }
                    // Klik normal: buka quiz untuk pelajaran section ini
                    if (sec && typeof sec.pelajaranId === 'number') {
                      router.push(
                        `/belajar/${modulId}/${sec.bagian}/quiz?id=${nomorLatihan}&pelajaran=${sec.pelajaranId}`,
                      );
                    } else {
                      // Fallback to current
                      const pelajaranId = pelajaran?.id;
                      router.push(
                        `/belajar/${modulId}/${bagian}/quiz?id=${nomorLatihan}${
                          pelajaranId ? `&pelajaran=${pelajaranId}` : ''
                        }`,
                      );
                    }
                  }}
                />
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
