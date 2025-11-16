'use client';
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { useRouter } from 'next/navigation';

interface Modul {
  id: number;
  judul: string;
  deskripsi: string;
  nomor_modul: number;
}

export default function BelajarPage() {
  const [moduls, setModuls] = useState<Modul[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchModuls() {
      setLoading(true);
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: penggunaData } = await supabase
          .from('penggunas')
          .select('id')
          .eq('uuid', user.id)
          .single();

        if (penggunaData) {
          const { data } = await supabase
            .from('data_penggunas')
            .select('modul_dipilih')
            .eq('id_pengguna', penggunaData.id)
            .single();

          const id = data?.modul_dipilih;
          if (typeof id === 'number') {
            router.replace(`/belajar/${id}`);
            setLoading(false);
            return;
          }
        }
      }

      const { data: modulsData, error: errModuls } = await supabase
        .from('moduls')
        .select('id, judul, deskripsi, nomor_modul')
        .order('nomor_modul', { ascending: true });

      if (errModuls) {
        setError('Gagal mengambil data modul');
        setLoading(false);
        return;
      }

      setModuls(modulsData);
      setLoading(false);
    }

    fetchModuls();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-semibold text-[#3F3F46] mb-4">Modul Pembelajaran</h1>
        <div className="flex flex-col">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-sm border-2 border-[#E4E4E7] bg-white animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 bg-[#E4E4E7] rounded" />
              </CardHeader>
              <CardBody>
                <div className="h-4 w-full bg-[#E4E4E7] rounded mb-2" />
                <div className="h-4 w-5/6 bg-[#E4E4E7] rounded" />
              </CardBody>
              <CardFooter>
                <div className="h-10 w-32 bg-[#E4E4E7] rounded" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <h1 className="text-3xl font-semibold text-[#3F3F46] mb-4">Modul Pembelajaran</h1>
        <Card className="shadow-sm border-2 border-red-300 bg-white">
          <CardBody>
            <p className="text-[#F31260] font-medium">{error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="text-3xl font-semibold text-[#3F3F46] mb-4">Modul Pembelajaran</h1>
      <div className="flex flex-col gap-6">
        {moduls.map((modul) => (
          <Card key={modul.id} className="shadow-sm border-2 border-[#E4E4E7] bg-white">
            <CardHeader>
              <h2 className="text-xl font-semibold text-[#3F3F46]">
                Modul {modul.nomor_modul}: {modul.judul}
              </h2>
            </CardHeader>
            <CardBody>
              <p className="text-[#A1A1AA]">{modul.deskripsi}</p>
            </CardBody>
            <CardFooter>
              {/* Gunakan Link client-side langsung pada Button untuk transisi halus */}
              <Button
                as={Link}
                href={`/belajar/${modul.id}`}
                scroll={false}
                prefetch
                color="primary"
                variant="solid"
              >
                Lihat Selengkapnya
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
