'use client';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Progress } from '@heroui/progress';
import { Skeleton } from '@heroui/skeleton';
import { MotivationalTooltip } from '@/components/motivational-tooltip';
import { ArrowLeftRegular, CheckmarkCircleColor, LockClosedColor } from '@fluentui/react-icons';
import { PeringkatWidget } from '@/components/peringkat-widget';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  calculateMultiplePelajaranProgress,
  getCompletedBagiansForModul,
} from '@/utils/supabase/progress-helpers';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function LatihanPage() {
  const params = useParams();
  const modulId = params.modul as string;
  const [moduls, setModuls] = useState<any[]>([]);
  const [pelajarans, setPelajarans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCache, setHasCache] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(!hasCache);
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setError('Gagal mengambil data user. Harap login ulang.');
      setPelajarans([]);
      setLoading(false);
      return;
    }

    // Get pengguna ID dari tabel penggunas
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

    // Fetch pelajarans untuk modul ini (data statis)
    const { data: pelajaranData, error: errPelajaran } = await supabase
      .from('pelajarans')
      .select('id, judul, bagian, id_modul')
      .eq('id_modul', modulId);

    if (errPelajaran) {
      setError('Gagal mengambil data pelajaran');
      setLoading(false);
      return;
    }

    // Ambil status per bagian via RPC baru dan terapkan gating:
    // - Bagian pertama: unlocked (progress) meskipun belum mulai
    // - Bagian n: unlocked (progress) jika bagian n-1 sudah 'done'
    const statusRows = await getCompletedBagiansForModul(
      supabase,
      Number(modulId),
      penggunaData.id
    );

    const statusByPelajaranId = new Map<
      number,
      { status: 'done' | 'progress' | 'locked'; progress: number; bagian: number }
    >();
    statusRows.forEach((r) => {
      statusByPelajaranId.set(r.id_pelajaran, {
        status: r.status,
        progress: r.progress,
        bagian: r.bagian,
      });
    });

    // Urutkan pelajarans berdasarkan bagian
    const sortedPelajarans = [...(pelajaranData || [])].sort((a, b) => a.bagian - b.bagian);

    let previousStatus: 'done' | 'progress' | 'locked' = 'locked';
    const pelajaransWithProgress = sortedPelajarans.map((pel, idx) => {
      const row = statusByPelajaranId.get(pel.id);
      const baseStatus: 'done' | 'progress' | 'locked' = row?.status ?? 'locked';
      let status: 'done' | 'progress' | 'locked' = baseStatus;

      // Gating rules
      if (idx === 0) {
        // Bagian pertama selalu unlocked jika masih locked
        if (status === 'locked') status = 'progress';
      } else {
        // Unlock jika bagian sebelumnya sudah selesai
        if (status === 'locked' && previousStatus === 'done') status = 'progress';
      }

      const progress = row?.progress ?? 0;
      const progressLabel =
        status === 'done' ? 'SELESAI!' : status === 'progress' ? `${progress}%` : 'DIKUNCI';

      // Update previousStatus untuk iterasi berikutnya (menggunakan status sebelum modifikasi tidak masuk akal; gunakan status final)
      previousStatus = status;

      return {
        ...pel,
        progress,
        status,
        progressLabel,
        average_nilai: 0,
        completed_count: 0,
        total_count: 0,
      };
    });

    const { data: modulData, error: errModul } = await supabase
      .from('moduls')
      .select('id, judul')
      .eq('id', modulId);

    if (errModul) {
      setError('Gagal mengambil data modul');
      setLoading(false);
      return;
    }

    setModuls(modulData);
    setPelajarans(pelajaransWithProgress);
    setError(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`aizone.modul.${modulId}.info`, JSON.stringify(modulData || []));
        localStorage.setItem(
          `aizone.pelajarans.${modulId}`,
          JSON.stringify(pelajaransWithProgress || [])
        );
      }
    } catch {}
    setLoading(false);
  }, [modulId]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const modStr = localStorage.getItem(`aizone.modul.${modulId}.info`);
        const pelStr = localStorage.getItem(`aizone.pelajarans.${modulId}`);
        let used = false;
        if (modStr) {
          try {
            const parsed = JSON.parse(modStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setModuls(parsed);
              used = true;
            }
          } catch {}
        }
        if (pelStr) {
          try {
            const parsed = JSON.parse(pelStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPelajarans(parsed);
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
  }, [modulId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Re-fetch ketika modulId berubah

  if (loading) {
    return (
      <div className="flex gap-8 p-6">
        <div className="flex-1 flex flex-col gap-8">
          <Card className="border-2 border-[#E4E4E7] shadow-sm bg-white w-full" radius="lg">
            <CardBody className="p-[14px_32px] gap-5">
              <div className="flex items-center gap-6">
                <div className="flex-1 flex items-center gap-1">
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="w-24 h-4 rounded-md" />
                    <Skeleton className="w-64 h-8 rounded-md" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex flex-col gap-5">
            {[1, 2, 3].map((k) => (
              <Card key={k} className="border-2 border-[#E4E4E7] shadow-sm bg-white" radius="lg">
                <CardBody className="p-5 gap-5 flex flex-row overflow-hidden justify-between">
                  <div className="flex flex-col gap-2 w-[60%] justify-between">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="w-28 h-4 rounded-md" />
                      <Skeleton className="w-64 h-6 rounded-md" />
                      <div className="flex flex-row gap-2 items-center">
                        <Skeleton className="flex-1 h-4 rounded-md" />
                        <Skeleton className="w-16 h-5 rounded-md" />
                      </div>
                    </div>
                    <Skeleton className="w-40 h-10 rounded-md" />
                  </div>
                  <div className="w-fit h-fit pointer-events-none">
                    <div className="relative w-[180px] h-[130px] px-2">
                      <Skeleton className="w-full h-full rounded-xl" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <div className="w-[300px] flex flex-col gap-6">
          <PeringkatWidget />
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
    <div className="flex gap-8 p-6">
      {/* Left Column */}
      <div className="flex-1 flex flex-col gap-8">
        {/* Learning Path Cards */}
        {/* Top Info Card */}
        <Card className="border-2 border-[#E4E4E7] shadow-sm bg-white w-full" radius="lg">
          <CardBody className="p-[14px_32px] gap-5">
            <div className="flex items-center gap-6">
              {/* Back Button */}
              {/* <Button
                as={Link}
                href={`/belajar`}
                isIconOnly
                variant="light"
                color="primary"
                size="lg"
                className="min-w-0 w-8 h-8"
              >
                <ArrowLeftRegular className="w-8 h-8 text-[#3674B5]" />
              </Button> */}

              {/* Title and Progress */}
              <div className="flex-1 flex items-center gap-1">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-lg font-medium text-[#A1A1AA]">Modul {modulId}</span>
                  <h1 className="text-2xl font-semibold text-[#3F3F46]">{moduls[0].judul}</h1>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <div className="flex flex-col gap-5">
          {pelajarans.map((bagian) => (
            <Card
              key={bagian.id}
              className={`border-2 border-[#E4E4E7] shadow-sm bg-white relative overflow-visible ${bagian.status === 'locked' ? 'opacity-50' : ''}`}
              radius="lg"
            >
              <CardBody className="p-5 gap-5 flex flex-row overflow-hidden justify-between">
                <div className="flex flex-col gap-2 w-[60%] justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-[#3F3F46] opacity-60 font-regular">
                        Bagian {bagian.bagian}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-lg text-[#52525B] font-semibold">{bagian.judul}</div>
                      {/* Status/Progress/Locked */}
                      {bagian.status === 'done' && (
                        <div className="flex items-center gap-1">
                          <CheckmarkCircleColor className="w-7 h-7" />
                          <span className="text-xl font-extrabold text-[#17C964]">
                            {bagian.progressLabel}
                          </span>
                        </div>
                      )}
                      {bagian.status === 'progress' && (
                        <div className="flex flex-row gap-2">
                          <Progress
                            value={bagian.progress}
                            color="warning"
                            size="lg"
                            radius="full"
                            classNames={{
                              label: 'text-lg text-[#52525B]',
                              value: 'text-lg text-[#52525B]',
                            }}
                          />
                          <p className="text-yellow-500 font-semibold">{bagian.progressLabel}</p>
                        </div>
                      )}
                      {bagian.status === 'locked' && (
                        <div className="flex items-center gap-1">
                          <LockClosedColor className="w-7 h-7" />
                          <span className="text-xl font-extrabold text-[#F5A524]">
                            {bagian.progressLabel}
                          </span>
                        </div>
                      )}
                      {bagian.status === 'belum' && (
                        <div className="flex items-center gap-1">
                          <LockClosedColor className="w-7 h-7" />
                          <span className="text-xl font-extrabold text-[#D4D4D8]">
                            {bagian.progressLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Action Button (optional adjust) */}
                  {bagian.status === 'done' && (
                    <Button
                      color="default"
                      radius="sm"
                      size="md"
                      className="bg-[#ffffff] text-[#2d5d94] border-1 font-semibold text-md px-4 py-2.5 rounded-xl hover:bg-[#ffffff] transition-colors w-fit"
                      style={{
                        boxShadow: '0px 3px 0px 0px #2d5d94',
                      }}
                      as={Link}
                      href={`/belajar/${modulId}/${bagian.bagian}`}
                    >
                      Pelajari Lagi
                    </Button>
                  )}
                  {bagian.status === 'progress' && (
                    <Button
                      color="default"
                      radius="sm"
                      size="md"
                      className="bg-[#ffffff] text-[#2d5d94] border-1 font-semibold text-md px-4 py-2.5 rounded-xl hover:bg-[#ffffff] transition-colors w-fit"
                      style={{
                        boxShadow: '0px 3px 0px 0px #2d5d94',
                      }}
                      as={Link}
                      href={`/belajar/${modulId}/${bagian.bagian}`}
                    >
                      Lanjutkan Belajar
                    </Button>
                  )}
                  {bagian.status === 'locked' && (
                    <Button
                      variant="faded"
                      // color="default"
                      // size="md"
                      // radius="sm"
                      // className="border-2 border-[#D4D4D8] py-4 w-fit drop-shadow-lg"
                      // color="default"
                      radius="sm"
                      size="md"
                      className="bg-[#a5a5a5] text-[#313131] border-1 border-[#313131] font-semibold text-md px-4 py-2.5 rounded-xl hover:bg-[#ffffff] transition-colors w-fit"
                      style={{
                        boxShadow: '0px 3px 0px 0px #313131',
                      }}
                      isDisabled
                    >
                      Lanjutkan Belajar
                    </Button>
                  )}
                  {bagian.status === 'belum' && (
                    <Button
                      variant="faded"
                      color="default"
                      size="md"
                      radius="sm"
                      className="border-2 border-[#D4D4D8] py-4 w-fit drop-shadow-lg"
                      isDisabled
                    >
                      Mulai Belajar
                    </Button>
                  )}
                </div>
                <div className="w-fit h-fit pointer-events-none">
                  <div className="relative w-full h-full px-2">
                    <MotivationalTooltip
                      message="Aku ingin mengenal lebih dalam tentang AI"
                      imageUrl={
                        bagian.status === 'done'
                          ? '/imageAssets/motivational.png'
                          : bagian.status === 'locked'
                            ? '/imageAssets/motivational.png'
                            : '/imageAssets/motivational.png'
                      }
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Column - Widgets */}
      <div className="w-[300px] flex flex-col gap-6">
        <PeringkatWidget />
        {/* Misi Harian Card */}
        <></>

        {/* Perjalananku Card */}
        <></>
      </div>
    </div>
  );
}
