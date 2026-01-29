'use client';
import { useState, useEffect } from 'react';
import ExerciseRenderer, { FooterWithRobot } from '@/components/exercise-renderer';
import { fetchExercises, submitHasilLatihan } from './quizAction';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import {
  ChevronLeftRegular,
  ChevronRightRegular,
  SendRegular,
  DismissRegular,
  BotSparkle16Color,
} from '@fluentui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';

export default function Quiz() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const modulParam = params?.modul as string | undefined;
  const bagianParam = params?.bagian as string | undefined;
  const nomorLatihan = searchParams?.get('id');
  const pelajaranParam = searchParams?.get('pelajaran');
  const idPelajaran = pelajaranParam ? parseInt(pelajaranParam) : null;
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());
  const [footerProps, setFooterProps] = useState<{
    onSubmit: () => void;
    feedback: string;
    isCorrect: boolean;
  }>({ onSubmit: () => {}, feedback: '', isCorrect: false });
  const [isCompletedView, setIsCompletedView] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalExp, setFinalExp] = useState<number | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [wrongPrompts, setWrongPrompts] = useState<string[]>([]);
  const [finalAdvice, setFinalAdvice] = useState('');
  const [adviceLoading, setAdviceLoading] = useState(false);

  // Chat overlay state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: 'Halo, aku asistenmu, apakah kamu butuh bantuan?' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const sanitizeAllowedHtml = (html: string) => {
    return html
      .replace(/<\/(?:script|style|iframe|object|embed|link|meta)[^>]*>/gi, '')
      .replace(/<(?:script|style|iframe|object|embed|link|meta)[^>]*>/gi, '')
      .replace(/on[a-zA-Z]+\s*=\s*("[^"]*"|'[^']*')/gi, '')
      .replace(/javascript:/gi, '');
  };

  const handleAgentClick = () => setChatOpen(true);
  const handleWrong = (prompt: string) => {
    setWrongAttempts((n) => n + 1);
    setWrongPrompts((prev) => (prev.includes(prompt) ? prev : [...prev, prompt]));
  };
  const handleSendMessage = async () => {
    const content = chatInput.trim();
    if (!content || isAsking) return;
    setChatMessages((msgs) => [...msgs, { role: 'user', text: content }]);
    setChatInput('');
    setIsAsking(true);
    try {
      const ex = exercises[currentIndex];
      let quizContext = '';
      if (ex) {
        const t = ex.type;
        if (t === 'multiple_choice') {
          const opts = Array.isArray(ex?.data?.options) ? ex.data.options.join(', ') : '';
          quizContext = `Jenis: Pilihan Ganda\nPrompt: ${ex?.prompt || ''}\nPertanyaan: ${ex?.data?.question || ''}\nPilihan: ${opts}`;
        } else if (t === 'fill_in_the_blank') {
          const opts = Array.isArray(ex?.data?.options) ? ex.data.options.join(', ') : '';
          const tpl = typeof ex?.template_code === 'string' ? ex.template_code : '';
          quizContext = `Jenis: Isian\nPrompt: ${ex?.prompt || ''}\nTemplate:\n${tpl}\nPilihan: ${opts}`;
        } else if (t === 'guessing') {
          const code = typeof ex?.data?.code === 'string' ? ex.data.code : '';
          quizContext = `Jenis: Menebak Output\nPrompt: ${ex?.prompt || ''}\nKode:\n${code}`;
        } else if (t === 'drag_and_drop') {
          const items = Array.isArray(ex?.data?.items) ? ex.data.items.join(', ') : '';
          const buckets = Array.isArray(ex?.data?.buckets) ? ex.data.buckets.join(', ') : '';
          quizContext = `Jenis: Kelompokkan\nPrompt: ${ex?.prompt || ''}\nItems: ${items}\nKategori: ${buckets}`;
        } else if (t === 'sorting') {
          const q = ex?.data?.question || '';
          const lines = Array.isArray(ex?.data?.code_lines) ? ex.data.code_lines.join(' | ') : '';
          quizContext = `Jenis: Mengurutkan\nPrompt: ${ex?.prompt || ''}\nPertanyaan: ${q}\nItems: ${lines}`;
        } else if (t === 'checkbox') {
          const opts = Array.isArray(ex?.data?.options) ? ex.data.options.join(', ') : '';
          quizContext = `Jenis: Pilihan Ganda (Checkbox)\nPrompt: ${ex?.prompt || ''}\nPertanyaan: ${ex?.data?.question || ''}\nPilihan: ${opts}`;
        } else {
          quizContext = `Prompt: ${ex?.prompt || ''}`;
        }
      }
      const historyToSend = [...chatMessages, { role: 'user', text: content }].slice(-8);
      const res = await fetch('/api/ask-to-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: content,
          top_k: 4,
          quiz_context: quizContext,
          history: historyToSend,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setChatMessages((msgs) => [
          ...msgs,
          { role: 'ai', text: `Terjadi kesalahan: ${data.error || res.statusText}` },
        ]);
      } else {
        const data = await res.json();
        const safe = typeof data.answer === 'string' ? sanitizeAllowedHtml(data.answer) : '';
        setChatMessages((msgs) => [...msgs, { role: 'ai', text: safe }]);
      }
    } catch (e: any) {
      setChatMessages((msgs) => [
        ...msgs,
        { role: 'ai', text: `Terjadi kesalahan jaringan: ${e?.message || 'Unknown error'}` },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

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
      setChatMessages([{ role: 'ai', text: 'Halo, aku asistenmu, apakah kamu butuh bantuan?' }]);
      setChatInput('');
      setIsAsking(false);
    }
  };

  const handleNext = () => {
    // Hanya bisa next jika soal saat ini sudah selesai
    if (currentIndex < exercises.length - 1 && completedExercises.has(currentIndex)) {
      setCurrentIndex(currentIndex + 1);
      setChatMessages([{ role: 'ai', text: 'Halo, aku asistenmu, apakah kamu butuh bantuan?' }]);
      setChatInput('');
      setIsAsking(false);
    }
  };

  const handleExit = async () => {
    const supabase = createClient();
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (user) {
        await supabase.rpc('reset_quiz_streak', { p_uuid: user.id }).match(() => {});
      }
    } catch {}
    if (modulParam && bagianParam) {
      router.replace(`/belajar/${modulParam}/${bagianParam}`);
    } else if (modulParam) {
      router.replace(`/belajar/${modulParam}`);
    } else {
      router.replace('/belajar');
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
                  setFinalExp(expRow.exp ?? 0);
                } catch {}
              }
            }
          }
        } catch (e) {
          // Abaikan error lokal; header akan tetap subscribe realtime bila di dashboard
        }
        setFinalScore(nilai);
        setIsCompletedView(true);
        try {
          if (wrongPrompts.length > 0) {
            setAdviceLoading(true);
            const res = await fetch('/api/advice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                wrong_prompts: wrongPrompts,
                modul: modulParam,
                bagian: bagianParam,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              const text = typeof data.answer === 'string' ? data.answer : '';
              setFinalAdvice(text);
            } else {
              setFinalAdvice('');
            }
          }
        } catch {
        } finally {
          setAdviceLoading(false);
        }
        try {
          const supabase = createClient();
          const { data: authData } = await supabase.auth.getUser();
          const user = authData?.user;
          if (user?.id && wrongPrompts.length <= 0) {
            await supabase
              .rpc('update_quiz_sempurna_completion_challenge', { p_uuid: user.id })
              .match(() => {});
          }
        } catch {}
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

  if (isCompletedView) {
    return (
      <div className="min-h-screen bg-[#FCFDFD] flex flex-col items-center justify-center w-full gap-1">
        <img src="/imageAssets/winner.png" alt="Agent" className="w-[260px] h-auto mb-6" />
        <p className="text-[40px] leading-[48px] font-bold text-[#3674B5]">+100 EXP</p>
        {wrongPrompts.length <= 0 ? (
          <p className="text-3xl leading-[48px] font-bold text-[#000000]">
            Hebat! Kamu berhasil menyelesaikannya!
          </p>
        ) : null}
        {wrongPrompts.length > 0 ? (
          <p className="text-3xl leading-[48px] font-bold text-[#000000]">
            Hebat! Namun kamu salah menjawab beberapa soal!
          </p>
        ) : null}

        {!(wrongPrompts.length > 0 && finalAdvice) ? (
          <p className="mt-3 text-lg text-[#3F3F46] text-center w-[80%]">
            Hebat! Kamu menjawab semua soal dengan benar. Pertahankan!
          </p>
        ) : null}
        {wrongPrompts.length > 0 ? (
          finalAdvice ? (
            <p className="mt-3 text-lg text-[#3F3F46] text-center w-[80%]">{finalAdvice}</p>
          ) : adviceLoading ? (
            <p className="mt-3 text-lg text-[#71717A] text-center w-[80%]">
              Menyusun saran singkat…
            </p>
          ) : null
        ) : null}
        <Button
          className="mt-6 bg-[#3674B5] text-white px-6"
          radius="md"
          isDisabled={adviceLoading}
          onPress={() => {
            if (modulParam && bagianParam) {
              router.push(`/belajar/${modulParam}/${bagianParam}`);
            } else {
              router.back();
            }
          }}
        >
          Lanjutkan
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFDFD] flex flex-col">
      {/* Header dengan Progress Bar - Fixed */}
      <div className="w-full bg-white border-b border-[#E8E8E8] px-12 py-4 fixed top-0 left-0 right-0 z-999">
        <div className="flex items-center justify-center gap-5">
          <div className="w-[100px] flex items-center">
            <Button
              isIconOnly
              variant="light"
              radius="full"
              size="lg"
              className="min-w-0 w-8 h-8"
              onClick={handleExit}
            >
              <DismissRegular className="w-8 h-8 text-[#3674B5]" />
            </Button>
          </div>

          {/* Progress Section */}
          <div className="flex flex-col items-center justify-center gap-2.5 flex-1">
            <div className="flex items-center gap-8 w-[80%]">
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
      <div className="flex-1 overflow-y-auto py-20">
        <div className="flex justify-center px-0 py-6 min-h-[calc(100vh-180px)] pb-28">
          <motion.div
            className="flex gap-6 items-start"
            animate={{ width: chatOpen ? '80%' : '70%' }}
            initial={false}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <AnimatePresence>
              {chatOpen && (
                <motion.div
                  className="w-[30%] min-w-[340px] flex-shrink-0 h-[94%]"
                  initial={{ opacity: 0, x: -540, y: 200, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -540, y: 200, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  layout
                >
                  <Card
                    className="border-2 border-[#E4E4E7] bg-white rounded-[18px] shadow-[0px_2px_0px_0px_rgba(228,228,231,1)] h-[60vh]"
                    radius="lg"
                  >
                    <CardBody className="px-4 py-10 flex flex-col gap-4">
                      <div className="flex items-center justify-between px-4 py-4 absolute top-0 left-0 w-full z-99 bg-white border-b-1 border-[#E4E4E7]">
                        <div className="flex items-center gap-2">
                          <BotSparkle16Color className="w-7 h-7 text-[#3674B5]" />
                          <span className="text-base font-semibold text-[#3674B5]">AI Chat</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setChatOpen(false)}
                            className="text-sm font-semibold text-[#A1A1AA] hover:text-[#3674B5] cursor-pointer"
                            type="button"
                          >
                            <div className="w-5 h-1 rounded-full bg-[#a1a1a1]"></div>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4 h-[100%] pt-6 pb-8 overflow-y-auto pr-1 overflow-x-hidden">
                        {chatMessages.map((m, idx) => (
                          <div
                            key={idx}
                            className={`flex ${m.role === 'ai' ? 'items-start gap-2' : 'justify-end'}`}
                          >
                            {m.role === 'ai' && (
                              <img
                                src="/imageAssets/bot-profile.png"
                                alt="AI"
                                className="w-12 h-12 mt-1 rounded-full"
                              />
                            )}
                            <div className="relative mx-1">
                              <div
                                className={`rounded-[18px] px-4 py-3 max-w-[280px] text-sm leading-[1.55em] ${
                                  m.role === 'ai'
                                    ? 'bg-[#205994] text-white shadow-[0px_2px_0px_0px_rgba(32,89,148,1)] overflow-x-auto'
                                    : 'bg-[#F5A524] text-white shadow-[0px_2px_0px_0px_rgba(245,165,36,1)]'
                                }`}
                                dangerouslySetInnerHTML={
                                  m.role === 'ai' ? { __html: m.text } : undefined
                                }
                              >
                                {m.role !== 'ai' ? m.text : null}
                              </div>
                              {m.role === 'ai' ? (
                                <div className="absolute -left-1 top-4 w-3 h-3 bg-[#205994] rotate-45 rounded-sm"></div>
                              ) : (
                                <div className="absolute -right-1 top-4 w-3 h-3 bg-[#F5A524] rotate-45 rounded-sm"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 absolute bottom-0 left-0 w-full px-4 bg-white z-99 py-3">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ketik pesanmu disini..."
                          classNames={{
                            inputWrapper:
                              'border-2 border-[#E4E4E7] rounded-[16px] h-[46px] bg-[#FAFAFA]',
                            input: 'text-base',
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleSendMessage}
                          disabled={isAsking || !chatInput.trim()}
                          className="rounded-full w-[46px] h-[46px] flex items-center justify-center bg-white border-2 border-[#E4E4E7] hover:border-[#3674B5] disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Kirim"
                        >
                          <SendRegular className="w-4 h-4 text-[#3674B5]" />
                        </button>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="flex-1 w-full"
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <ExerciseRenderer
                exercises={exercises}
                currentIndex={currentIndex}
                onNext={handleNext}
                onComplete={handleExerciseComplete}
                onAgentClick={handleAgentClick}
                onFooterPropsChange={setFooterProps}
                onWrong={handleWrong}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
      <FooterWithRobot
        onSubmit={footerProps.onSubmit}
        feedback={footerProps.feedback}
        isCorrect={footerProps.isCorrect}
        showNextButton={currentIndex < exercises.length - 1}
        onNext={handleNext}
        onAgentClick={handleAgentClick}
      />
    </div>
  );
}
