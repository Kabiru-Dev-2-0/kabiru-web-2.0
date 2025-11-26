'use client';
// d:\Tugas Kuliah\Mahasiswa Semester 7\Skripsi\Coding\aizone-website\app\(dashboard)\eksplorasi\[modul]\page.tsx
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftRegular } from '@fluentui/react-icons';
import { getCompletedBagiansForModul } from '@/utils/supabase/progress-helpers';
import { PeringkatWidget } from '@/components/peringkat-widget';

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

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      setLoading(true);

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
        .select('id, judul, bagian, id_modul')
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
      setLoading(false);
    };
    load();
  }, [modulId]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Card className="p-8 bg-white shadow-lg" radius="lg">
          <CardBody className="flex flex-col items-center gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-lg font-semibold text-black">Memuat modul...</p>
          </CardBody>
        </Card>
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
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex flex-row w-full gap-8 justify-between">
        <div className="flex flex-col gap-8 w-[63%]">
          <Card className="border-2 border-[#E4E4E7] shadow-sm bg-white w-full" radius="lg">
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
                        <h1 className="text-2xl font-semibold text-white">{modul.judul}</h1>
                        <p className="text-white/90">{modul.deskripsi}</p>
                      </div>
                    </div>
                    <div className="relative w-[80px] h-[80px]">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="38"
                          cy="38"
                          r="30"
                          stroke="#ffffff40"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="38"
                          cy="38"
                          r="30"
                          stroke="#F5A524"
                          strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 29}`}
                          strokeDashoffset={`${(1 - overallProgress / 100) * (2 * Math.PI * 29)}`}
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold">{overallProgress}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="light"
                      color="primary"
                      radius="full"
                      size="sm"
                      className="mt-3 bg-white text-[#3674B5]"
                      onClick={async () => {
                        const supabase = createClient();
                        if (penggunaId) {
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
                        }
                      }}
                    >
                      Pelajari Materi Ini
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
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
                        <div className="text-[#A1A1AA] text-sm">Materi bagian {bagian.bagian}</div>
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
