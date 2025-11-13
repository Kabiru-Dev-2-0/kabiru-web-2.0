'use client';
import { useState, useEffect } from 'react';
import ExerciseRenderer from '@/components/ExerciseRenderer';
import { fetchExercises, submitHasilLatihan } from './quizAction';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeftRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { createClient } from '@/utils/supabase/client';

export default function Quiz() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nomorLatihan = searchParams?.get('id');
  const pelajaranParam = searchParams?.get('pelajaran');
  const idPelajaran = pelajaranParam ? parseInt(pelajaranParam) : null;
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const { data, error } = await fetchExercises({
        id_pelajaran: idPelajaran ?? undefined,
        nomor_latihan: nomorLatihan ? parseInt(nomorLatihan) : undefined,
      });
      // Data sudah terfilter di server jika parameter disediakan; fallback ke filter client-side
      const filtered = (data || []).filter((ex: any) => {
        const matchNomor = nomorLatihan ? String(ex.nomor_latihan) === nomorLatihan : true;
        const matchPelajaran = idPelajaran ? ex.id_pelajaran === idPelajaran : true;
        return matchNomor && matchPelajaran;
      });
      setExercises(filtered);
      console.log(filtered);
      setIsLoading(false);
      if (error || filtered.length === 0) {
        setError('Gagal memuat soal. Silakan coba lagi.');
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomorLatihan, pelajaranParam]);

  const handlePrevious = () => {
    // Hanya bisa previous jika soal sebelumnya sudah dikerjakan
    if (currentIndex > 0 && completedExercises.has(currentIndex - 1)) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    // Hanya bisa next jika soal saat ini sudah selesai
    if (currentIndex < exercises.length - 1 && completedExercises.has(currentIndex)) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleExerciseComplete = (isCorrect: boolean) => {
    setCompletedExercises((prev) => new Set(prev).add(currentIndex));

    if (isCorrect) {
      setCorrectAnswers((prev) => new Set(prev).add(currentIndex));

      // Cek apakah ini soal terakhir
      if (currentIndex === exercises.length - 1) {
        // Hitung nilai
        const totalCorrect = correctAnswers.size + 1; // +1 untuk jawaban benar saat ini
        const totalPoints = exercises.reduce((sum, ex) => sum + (ex.points || 0), 0);
        const earnedPoints = exercises
          .filter((_, idx) => correctAnswers.has(idx) || idx === currentIndex)
          .reduce((sum, ex) => sum + (ex.points || 0), 0);

        const nilai = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

        // Submit hasil ke database
        submitHasilToDatabase(nilai);
      }
    }
  };

  const submitHasilToDatabase = async (nilai: number) => {
    try {
      if (!exercises.length) return;

      const idPelajaran = exercises[0].id_pelajaran;
      const nomorLatihanInt = nomorLatihan ? parseInt(nomorLatihan) : 1;
      const idLatihan = exercises[0].id;

      const result = await submitHasilLatihan({
        nilai,
        id_pelajaran: idPelajaran,
        nomor_latihan: nomorLatihanInt,
        id_latihan: idLatihan,
      });

      if (result.error) {
        console.error('Error submitting hasil:', result.error);
        alert('Gagal menyimpan hasil latihan. Silakan coba lagi.');
      } else {
        console.log('Hasil berhasil disimpan:', result.data);

        // Setelah hasil tersimpan, ambil EXP terbaru dan simpan ke localStorage
        try {
          const supabase = createClient();
          const { data: authData } = await supabase.auth.getUser();
          const user = authData?.user;
          if (user?.id) {
            const { data: pengguna } = await supabase
              .from('penggunas')
              .select('id')
              .eq('uuid', user.id)
              .single();

            if (pengguna?.id) {
              const { data: expRow } = await supabase
                .from('data_penggunas')
                .select('exp, nama_lengkap')
                .eq('id_pengguna', pengguna.id)
                .single();

              if (expRow) {
                try {
                  localStorage.setItem('aizone.exp', String(expRow.exp ?? 0));
                  if (typeof expRow.nama_lengkap === 'string') {
                    localStorage.setItem('aizone.userName', expRow.nama_lengkap);
                  }
                } catch {}
              }
            }
          }
        } catch (e) {
          // Abaikan error lokal; header akan tetap subscribe realtime bila di dashboard
        }

        alert(`Selamat! Latihan selesai dengan nilai: ${nilai}`);
        // Redirect ke dashboard setelah 2 detik
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting hasil:', error);
      alert('Terjadi kesalahan saat menyimpan hasil.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCFDFD] flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FCFDFD] flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFDFD] flex flex-col">
      {/* Header dengan Progress Bar - Sesuai Figma */}
      <div className="w-full bg-white border-b border-[#E8E8E8] px-12 py-4">
        <div className="flex items-center justify-center gap-5">
          {/* Logo/Icon Placeholder */}
          <div className="w-[100px]">
            <img src="/imageAssets/motivational.png" alt="Logo" className="w-full" />
          </div>

          {/* Progress Section */}
          <div className="flex flex-col items-center justify-center gap-2.5 flex-1">
            <div className="flex items-center gap-8 w-[840px]">
              {/* Arrow Left */}
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0 || !completedExercises.has(currentIndex - 1)}
                className="w-8 h-8 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeftRegular className="w-8 h-8 text-[#A1A1AA]" />
              </button>

              {/* Progress Dots */}
              <div className="flex items-stretch justify-stretch gap-2.5 flex-1 h-2.5">
                {exercises.map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-full ${
                      idx <= currentIndex ? 'bg-[#3674B5]' : 'bg-[#E4E4E7]'
                    }`}
                  />
                ))}
              </div>

              {/* Arrow Right */}
              <button
                onClick={handleNext}
                disabled={
                  currentIndex === exercises.length - 1 || !completedExercises.has(currentIndex)
                }
                className="w-8 h-8 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRightRegular className="w-8 h-8 text-[#A1A1AA]" />
              </button>
            </div>
          </div>

          {/* Counter */}
          <div className="flex items-center justify-end gap-2.5 w-[100px]">
            <p className="text-2xl font-semibold text-[#3674B5]">
              {currentIndex + 1}/{exercises.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-80 py-6">
          <ExerciseRenderer
            exercises={exercises}
            currentIndex={currentIndex}
            onNext={handleNext}
            onComplete={handleExerciseComplete}
          />
        </div>
      </div>
    </div>
  );
}
