'use client';

import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/spinner';
import { LearningPathVisual } from '@/components/learning-path-visual';
import { ArrowLeftRegular } from '@fluentui/react-icons';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stage {
  id: number;
  judul: string;
  status: 'completed' | 'current' | 'locked';
  progres: number;
}

export default function BagianPage() {
  const params = useParams();
  const router = useRouter();
  const bagian = params.bagian as string;
  const modulId = params.modul as string;

  const [pelajaran, setPelajaran] = useState<any>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
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

    // Fetch pelajaran berdasarkan bagian
    const { data: pelajaranData, error: errPelajaran } = await supabase
      .from('pelajarans')
      .select('id, judul, bagian')
      .eq('bagian', parseInt(bagian))
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
      .from('latihans_view') // Gunakan nama view sebagai nama tabel
      .select('nomor_latihan, id_pelajaran')
      .eq('id_pelajaran', pelajaranData.id);

    if (errLatihans) {
      console.error('Error fetching latihans:', errLatihans);
    } else {
      console.log('Latihans Data:', latihansData);
    }

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

    console.log('=== QUERY PARAMETERS ===');
    console.log('Pengguna ID:', penggunaData.id);
    console.log('Pelajaran ID:', pelajaranData.id);
    console.log('Bagian:', bagian);

    // Debug: Log data untuk analisis
    console.log('=== DEBUG DATA ===');
    console.log('Latihans Data:', latihansData);
    console.log('Hasil Latihans Data:', hasilLatihansData);

    // Map latihans to stages with status berdasarkan hasil_latihans
    const stagesWithStatus: Stage[] = (latihansData || []).map((latihan, index) => {
      // Cari hasil latihan berdasarkan nomor_latihan
      const hasilLatihan = hasilLatihansData?.find(
        (hl) => hl.nomor_latihan === latihan.nomor_latihan
      );

      let status: 'completed' | 'current' | 'locked' = 'locked';
      let progres = 0;

      console.log(`\nLatihan ${latihan.nomor_latihan} (index ${index}):`);
      console.log('  - hasilLatihan:', hasilLatihan);

      if (hasilLatihan) {
        // Jika sudah ada hasil, berarti completed
        status = 'completed';
        progres = hasilLatihan.nilai;
        console.log('  - Status: COMPLETED');
      } else if (index === 0) {
        // Latihan pertama selalu available
        status = 'current';
        console.log('  - Status: CURRENT (first)');
      } else {
        // Cek apakah latihan sebelumnya sudah selesai
        const prevLatihan = latihansData?.[index - 1];
        const prevHasil = hasilLatihansData?.find(
          (hl) => hl.nomor_latihan === prevLatihan?.nomor_latihan
        );

        console.log(`  - Checking prev latihan ${prevLatihan?.nomor_latihan}:`, prevHasil);

        if (prevHasil) {
          // Jika latihan sebelumnya sudah selesai, latihan ini available
          status = 'current';
          console.log('  - Status: CURRENT (prev completed)');
        } else {
          console.log('  - Status: LOCKED');
        }
      }

      return {
        id: latihan.nomor_latihan, // Gunakan nomor_latihan sebagai ID
        judul: `Latihan ${latihan.nomor_latihan}`,
        status,
        progres,
      };
    });

    console.log('\n=== FINAL STAGES ===');
    console.log(stagesWithStatus);

    setStages(stagesWithStatus);

    // Calculate overall progress
    const completedStages = stagesWithStatus.filter((s) => s.status === 'completed').length;
    const totalStages = stagesWithStatus.length;
    const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
    setOverallProgress(progress);

    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [bagian]);

  const handleStageClick = (nomorLatihan: number) => {
    const stage = stages.find((s) => s.id === nomorLatihan);
    if (stage && stage.status !== 'locked') {
      // Redirect to quiz page with nomor_latihan
      // Sertakan id_pelajaran agar quiz terfilter ke pelajaran yang dipilih
      const pelajaranId = pelajaran?.id;
      router.push(
        `/belajar/${modulId}/${bagian}/quiz?id=${nomorLatihan}${pelajaranId ? `&pelajaran=${pelajaranId}` : ''}`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Card className="p-8 bg-white shadow-lg" radius="lg">
          <CardBody className="flex flex-col items-center gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-lg font-semibold text-black">Memuat latihan...</p>
          </CardBody>
        </Card>
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
    <div className="flex-1 overflow-y-auto">
      {/* Top Info Card */}
      <Card
        className="mx-6 mt-6 border-2 border-[#E4E4E7] shadow-sm bg-white sm:w-[60vw] lg:w-[70vw] absolute z-999"
        radius="lg"
      >
        <CardBody className="p-[14px_32px] gap-5">
          <div className="flex items-center gap-6">
            {/* Back Button */}
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

            {/* Title and Progress */}
            <div className="flex-1 flex items-center gap-1">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-lg font-medium text-[#A1A1AA]">Bagian {bagian}</span>
                <h1 className="text-2xl font-semibold text-[#3F3F46]">{pelajaran?.judul}</h1>
              </div>

              {/* Circular Progress */}
              <div className="relative w-[72px] h-[72px]">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle cx="36" cy="36" r="32" stroke="#D9D9D9" strokeWidth="8" fill="none" />
                  {/* Progress circle */}
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    stroke="#FF921F"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - overallProgress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-bold text-[#FF921F]">{overallProgress}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Content with Learning Path and Widgets */}
      <div className="py-10 w-full bg-[#FCFDFD] fixed z-800"></div>
      <div className="flex gap-6 p-6 mt-[100px]">
        {/* Learning Path Visual */}
        <div className="flex-1">
          <LearningPathVisual stages={stages} onStageClick={handleStageClick} />
        </div>
      </div>
    </div>
  );
}
