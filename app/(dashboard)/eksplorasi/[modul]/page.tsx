'use client';
// d:\Tugas Kuliah\Mahasiswa Semester 7\Skripsi\Coding\aizone-website\app\(dashboard)\eksplorasi\[modul]\page.tsx
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Skeleton } from '@heroui/skeleton';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftRegular } from '@fluentui/react-icons';
import { getCompletedBagiansForModul } from '@/utils/supabase/progress-helpers';
import { PeringkatWidget } from '@/components/peringkat-widget';
import { CircularProgress } from '@heroui/progress';

interface Modul {
  id: number;
  judul: string;
  deskripsi: string;
  nomor_modul: number;
}
interface Pelajaran {
  id: number;
  judul: string;
  bagian: number;
  id_modul: number;
  deskripsi?: string;
}

export default function EksplorasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const modulId = Number(params.modul as string);
  const [modul, setModul] = useState<Modul | null>(null);
  const [pelajarans, setPelajarans] = useState<Pelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [penggunaId, setPenggunaId] = useState<number | undefined>(undefined);
  const [hasCache, setHasCache] = useState<boolean>(false);

  const selectModul = useCallback(async () => {
    if (!penggunaId || !modul) return;
    const supabase = createClient();
    const { data: existing } = await supabase
      .from('data_penggunas')
      .select('id')
      .eq('id_pengguna', penggunaId)
      .single();
    if (existing) {
      await supabase
        .from('data_penggunas')
        .update({ modul_dipilih: modul.id })
        .eq('id_pengguna', penggunaId);
    } else {
      await supabase
        .from('data_penggunas')
        .insert({ id_pengguna: penggunaId, modul_dipilih: modul.id });
    }
  }, [penggunaId, modul]);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      setLoading(!hasCache);

      const { data: mod, error: errMod } = await supabase
        .from('moduls')
        .select('id, judul, deskripsi, nomor_modul')
        .eq('id', modulId)
        .single();
      if (errMod || !mod) {
        setError('Gagal mengambil data modul');
        setLoading(false);
        return;
      }
      setModul(mod);

      const { data: pelajaransData, error: errPel } = await supabase
        .from('pelajarans')
        .select('id, judul, bagian, id_modul, deskripsi')
        .eq('id_modul', modulId)
        .order('bagian', { ascending: true });
      if (errPel) {
        setError('Gagal mengambil data pelajaran');
        setLoading(false);
        return;
      }
      setPelajarans(pelajaransData || []);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (user) {
        const { data: pengguna } = await supabase
          .from('penggunas')
          .select('id')
          .eq('uuid', user.id)
          .single();
        if (pengguna?.id) {
          setPenggunaId(pengguna.id);
          const bagians = await getCompletedBagiansForModul(supabase as any, modulId, pengguna.id);
          const avg = bagians.length
            ? Math.round(bagians.reduce((acc, r) => acc + (r.progress || 0), 0) / bagians.length)
            : 0;
          setOverallProgress(avg);
        }
      }

      setError(null);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`aizone.eksplorasi.modul.${modulId}.v2`, JSON.stringify(mod || null));
          localStorage.setItem(
            `aizone.eksplorasi.pelajarans.${modulId}.v2`,
            JSON.stringify(pelajaransData || [])
          );
          localStorage.setItem(
            `aizone.eksplorasi.overall.${modulId}.v2`,
            JSON.stringify(
              typeof overallProgress === 'number' && !Number.isNaN(overallProgress)
                ? overallProgress
                : 0
            )
          );
        }
      } catch {}
      setLoading(false);
    };
    try {
      if (typeof window !== 'undefined') {
        const modStr = localStorage.getItem(`aizone.eksplorasi.modul.${modulId}.v2`);
        const pelStr = localStorage.getItem(`aizone.eksplorasi.pelajarans.${modulId}.v2`);
        const ovStr = localStorage.getItem(`aizone.eksplorasi.overall.${modulId}.v2`);
        let used = false;
        if (modStr) {
          try {
            const parsedMod = JSON.parse(modStr);
            if (parsedMod) {
              setModul(parsedMod);
              used = true;
            }
          } catch {}
        }
        if (pelStr) {
          try {
            const parsedPel = JSON.parse(pelStr);
            if (Array.isArray(parsedPel) && parsedPel.length > 0) {
              setPelajarans(parsedPel);
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
    load();
  }, [modulId]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-8 p-6">
          <div className="flex-1 flex flex-col gap-8">
            <Card className="shadow-sm w-full" radius="lg">
              <CardBody className="p-0 m-0">
                <div className="flex items-center gap-6">
                  <div className="flex-1 bg-[#3674B5] rounded-xl p-6 flex flex-col items-start justify-between">
                    <div className="flex items-start justify-between gap-6 w-full">
                      <div className="flex items-center gap-2">
                        <Button
                          as={Link}
                          href={`/eksplorasi`}
                          isIconOnly
                          variant="light"
                          color="primary"
                          size="lg"
                          className="min-w-0 w-8 h-8"
                        >
                          <ArrowLeftRegular className="w-8 h-8 text-[#ffffff] text-bold" />
                        </Button>
                        <div>
                          <Skeleton className="w-48 h-8 rounded-md" />
                          <Skeleton className="w-64 h-5 rounded-md mt-2" />
                        </div>
                      </div>
                      <Skeleton className="w-[80px] h-[80px] rounded-full" />
                    </div>
                    <Skeleton className="w-40 h-10 rounded-md mt-3" />
                  </div>
                </div>
              </CardBody>
            </Card>
            <div className="flex gap-8">
              <div className="flex-1 flex flex-col gap-4">
                {[1, 2, 3].map((k) => (
                  <Card
                    key={k}
                    className="border-2 border-[#E4E4E7] shadow-sm bg-white"
                    radius="lg"
                  >
                    <CardBody className="p-5 flex flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex flex-col gap-2">
                          <Skeleton className="w-40 h-6 rounded-md" />
                          <Skeleton className="w-32 h-4 rounded-md" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <div className="w-[300px] flex flex-col gap-6">
            <PeringkatWidget />
          </div>
        </div>
      </div>
    );
  }

  if (error || !modul) {
    return (
      <div className="p-6">
        <Card className="border-2 border-red-300 bg-white" radius="lg">
          <CardBody className="p-6">
            <p className="text-[#F31260] font-medium">{error || 'Modul tidak ditemukan'}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex gap-8 p-6">
        <div className="flex-1 flex flex-col gap-8">
          <div className="w-full p-8 bg-[#3674B5] rounded-2xl shadow-[0px_6px_0px_0px_#205994] outline outline-2 outline-offset-[-2px] outline-sky-800 inline-flex justify-start items-start gap-5">
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-5">
              <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
                <div className="self-stretch flex flex-col justify-start items-start">
                  <div className="self-stretch inline-flex justify-center items-center gap-2.5">
                    <Button
                      as={Link}
                      href={`/eksplorasi`}
                      isIconOnly
                      variant="light"
                      className="min-w-0 w-8 h-8 p-0 data-[hover=true]:bg-transparent"
                    >
                      <ArrowLeftRegular className="w-8 h-8 text-white font-bold" />
                    </Button>
                    <div className="flex-1 justify-center text-white text-2xl font-bold font-sans leading-8">
                      {modul.judul}
                    </div>
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-2.5">
                  <div className="flex-1 justify-center text-white text-base font-medium font-sans leading-6">
                    {modul.deskripsi}
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-center items-start gap-2.5">
                <Button
                  as={Link}
                  href={`/belajar/${modul.id}`}
                  scroll={false}
                  prefetch
                  onClick={selectModul}
                  className="h-10 px-4 bg-white rounded-xl shadow-[0px_3px_0px_0px_rgba(228,228,231,1.00)] outline outline-1 outline-offset-[-1px] outline-zinc-200 inline-flex justify-center items-center gap-2"
                >
                  <div className="justify-center text-[#3674B5] text-sm font-semibold font-sans leading-5">
                    Pelajari Materi Ini
                  </div>
                </Button>
              </div>
            </div>
            <div className="w-28 h-28 relative flex items-center justify-center">
              <CircularProgress
                aria-label="Percentage"
                classNames={{
                  svg: 'w-28 h-28 drop-shadow-md',
                  indicator: 'stroke-[#F5A524]',
                  track: 'stroke-[#ffffff]/35',
                  value: 'text-lg font-semibold text-white',
                }}
                showValueLabel={true}
                strokeWidth={4}
                value={overallProgress}
              />
            </div>
          </div>
          <div className="flex gap-8">
            <div className="flex-1 flex flex-col gap-4">
              {pelajarans.map((bagian) => (
                <Card
                  key={bagian.id}
                  className="border-2 border-[#E4E4E7] shadow-sm bg-white"
                  radius="lg"
                >
                  <CardBody className="p-5 flex flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-[#E4E4E7] flex items-center justify-center">
                        <span className="text-xl font-bold">
                          {String(bagian.bagian).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-xl font-semibold text-[#3F3F46]">{bagian.judul}</div>
                        <div className="text-[#A1A1AA] text-sm">
                          {bagian.deskripsi || `Materi bagian ${bagian.bagian}`}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <div className="w-[300px] flex flex-col gap-6">
          <PeringkatWidget />
        </div>
      </div>
    </div>
  );
}
