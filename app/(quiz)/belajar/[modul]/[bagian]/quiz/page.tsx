'use client';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect, useRef } from 'react';
import ExerciseRenderer, { FooterWithRobot } from '@/components/exercise-renderer';
import { fetchExercises, submitHasilLatihan } from './quizAction';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import {
  ChevronLeftRegular,
  ChevronRightRegular,
  SendRegular,
  DismissRegular,
  BotSparkle16Color,
  MaximizeRegular,
  SquareMultipleRegular,
  SubtractRegular,
  ReadingModeMobileRegular,
} from '@fluentui/react-icons';
import WorkflowTracker, { WorkflowState } from '@/components/ai/WorkflowTracker';
import InlineWorkflowTracker from '@/components/ai/InlineWorkflowTracker';
import TypingText from '@/components/ai/TypingText';
import StoryCanvas from '@/components/ai/StoryCanvas';
import MermaidRenderer from '@/components/ai/MermaidRenderer'; // Added
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
  const [earnedExp, setEarnedExp] = useState<number>(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [wrongPrompts, setWrongPrompts] = useState<string[]>([]);
  const [finalAdvice, setFinalAdvice] = useState('');
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [, setPolicyViolations] = useState(0);

  // Chat overlay state
  // Chat overlay state
  const [selectedPelajaranId, setSelectedPelajaranId] = useState<number | null>(null);
  const [modulTitle, setModulTitle] = useState<string>('');
  const [pelajaranTitle, setPelajaranTitle] = useState<string>('');
  const [chatOpen, setChatOpen] = useState(false);
  const [isChatMaximized, setIsChatMaximized] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: 'Halo, aku asistenmu, apakah kamu butuh bantuan?' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAsking, chatOpen]);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);

  // Basic client-side anti-cheat hardening
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeydown = (e: KeyboardEvent) => {
      // Block common devtools/inspect shortcuts
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && ['U', 'S', 'P'].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const handleVisibility = () => {
      if (document.hidden) {
        setPolicyViolations((v) => v + 1);
      }
    };
    const devtoolsCheck = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 120;
      if (widthThreshold || heightThreshold) {
        setPolicyViolations((v) => v + 1);
      }
    };
    const interval = window.setInterval(devtoolsCheck, 1500);

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeydown as any, true);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeydown as any, true);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleVisibility);
    };
  }, []);

  useEffect(() => {
    async function fetchTitles() {
      const supabase = createClient();
      if (modulParam) {
        const { data } = await supabase
          .from('moduls')
          .select('judul')
          .eq('id', modulParam)
          .single();
        if (data) setModulTitle(data.judul);
      }
      if (modulParam && bagianParam) {
        const { data } = await supabase
          .from('pelajarans')
          .select('judul')
          .eq('id_modul', modulParam)
          .eq('bagian', bagianParam)
          .single();
        if (data) setPelajaranTitle(data.judul);
      }
    }
    fetchTitles();
  }, [modulParam, bagianParam]);

  // Mock Workflow State
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentStage: 'idle',
    activeWriters: [],
    canvas: null,
    generatedImages: [],
    draftDiagram: '',
    metrics: { quality_score: 0, revision_count: 0 },
    agentOutputs: {},
  });

  // agentOutputs: { } // This line seems to be a copy-paste error from the original document, removing it.
  const [workflowMode, setWorkflowMode] = useState<'STORY' | 'QA'>('QA');
  // const [sessionId, setSessionId] = useState<string | null>(null);

  // Load Chat History - DISABLED for now
  /*
  useEffect(() => {
    async function loadHistory() {
        try {
            const res = await fetch('/api/chat/history');
            if (res.ok) {
                const data = await res.json();
                if (data.sessionId) setSessionId(data.sessionId);
                if (Array.isArray(data.messages) && data.messages.length > 0) {
                    const mapped = data.messages.map((m: any) => ({
                        role: m.role,
                        text: m.content
                    }));
                    setChatMessages(mapped);
                }
            }
        } catch (e) {
            console.error("Failed to load chat history", e);
        }
    }
    loadHistory();
  }, []);
 
  const saveMessage = async (role: 'user' | 'ai', text: string) => {
      try {
          await fetch('/api/chat/history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  role,
                  content: text,
                  sessionId
              })
          });
      } catch (e) {
          console.error("Failed to save message", e);
      }
  };
  */

  const sanitizeAllowedHtml = (html: string) => {
    return html
      .replace(/<\/(?:script|style|iframe|object|embed|link|meta)[^>]*>/gi, '')
      .replace(/<(?:script|style|iframe|object|embed|link|meta)[^>]*>/gi, '')
      .replace(/on[a-zA-Z]+\s*=\s*("[^"]*"|'[^']*')/gi, '')
      .replace(/javascript:/gi, '');
  };

  // Guard akses: blokir jika bagian/latihan masih dikunci
  useEffect(() => {
    async function guardAccess() {
      if (!modulParam || !bagianParam) return;
      const supabase = createClient();
      const reqNomor = nomorLatihan ? parseInt(nomorLatihan) : undefined;
      // Auth -> id_pengguna
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace(modulParam ? `/belajar/${modulParam}/units` : '/belajar');
        return;
      }
      const { data: pengguna } = await supabase
        .from('penggunas')
        .select('id')
        .eq('uuid', user.id)
        .single();
      if (!pengguna?.id) {
        router.replace('/belajar');
        return;
      }
      // Tentukan id_pelajaran yang benar berdasarkan route (modul & bagian)
      const { data: pel } = await supabase
        .from('pelajarans')
        .select('id')
        .eq('id_modul', modulParam)
        .eq('bagian', bagianParam)
        .single();
      const routePelajaranId = pel?.id ?? null;
      if (!routePelajaranId) {
        router.replace(`/belajar/${modulParam}/units`);
        return;
      }
      setSelectedPelajaranId(routePelajaranId);
      // Hitung activeBagianByProgress
      const { data: allPelajarans } = await supabase
        .from('pelajarans')
        .select('id, bagian')
        .eq('id_modul', modulParam)
        .order('bagian', { ascending: true });
      let activeBagianByProgress: number | null = null;
      if (allPelajarans && allPelajarans.length > 0) {
        for (const p of allPelajarans) {
          const { data: latList } = await supabase
            .from('latihans')
            .select('nomor_latihan')
            .eq('id_pelajaran', p.id)
            .order('nomor_latihan', { ascending: true });
          const uniqLat = latList
            ? Array.from(new Map(latList.map((item) => [item.nomor_latihan, item])).values())
            : [];
          uniqLat.sort((a: any, b: any) => a.nomor_latihan - b.nomor_latihan);
          const { data: hasilList } = await supabase
            .from('hasil_latihans')
            .select('nomor_latihan')
            .eq('id_pengguna', pengguna.id)
            .eq('id_pelajaran', p.id);
          const selesai = new Set((hasilList || []).map((h) => h.nomor_latihan));
          const hasIncomplete = uniqLat.some((l: any) => !selesai.has(l.nomor_latihan));
          if (hasIncomplete) {
            activeBagianByProgress = p.bagian;
            break;
          }
        }
        if (!activeBagianByProgress) {
          activeBagianByProgress = allPelajarans[0].bagian;
        }
      }
      const reqBagian = parseInt(String(bagianParam));
      if (activeBagianByProgress && reqBagian > activeBagianByProgress) {
        router.replace(`/belajar/${modulParam}/units`);
        return;
      }
      // Cek allowed nomor_latihan di pelajaran ini: semua yang sudah selesai + next yang belum
      const { data: latList } = await supabase
        .from('latihans')
        .select('nomor_latihan')
        .eq('id_pelajaran', routePelajaranId)
        .order('nomor_latihan', { ascending: true });
      const uniqLat = latList
        ? Array.from(new Map(latList.map((item) => [item.nomor_latihan, item])).values())
        : [];
      uniqLat.sort((a: any, b: any) => a.nomor_latihan - b.nomor_latihan);
      const { data: hasilList } = await supabase
        .from('hasil_latihans')
        .select('nomor_latihan')
        .eq('id_pengguna', pengguna.id)
        .eq('id_pelajaran', routePelajaranId);
      const selesai = new Set((hasilList || []).map((h) => h.nomor_latihan));
      let nextNomor: number | null = null;
      for (const l of uniqLat) {
        if (!selesai.has(l.nomor_latihan)) {
          nextNomor = l.nomor_latihan;
          break;
        }
      }
      // Jika reqNomor tidak ada (misal langsung /quiz tanpa id), biarkan lanjut
      if (typeof reqNomor === 'number') {
        const isCompleted = selesai.has(reqNomor);
        const isCurrent = nextNomor === null ? false : nextNomor === reqNomor;
        if (!isCompleted && !isCurrent) {
          // Redirect ke nomor yang diizinkan
          const target = `/belajar/${modulParam}/units`;
          router.replace(target);
          return;
        }
      }
    }
    guardAccess();
  }, [modulParam, bagianParam, nomorLatihan]);

  const getQuizContext = (exercise: any) => {
    if (!exercise) return '';
    const t = exercise.type;
    let ctx = '';
    if (t === 'multiple_choice') {
      const opts = Array.isArray(exercise?.data?.options) ? exercise.data.options.join(', ') : '';
      ctx = `Jenis: Pilihan Ganda\nPrompt: ${exercise?.prompt || ''}\nPertanyaan: ${exercise?.pertanyaan || exercise?.data?.question || ''}\nPilihan: ${opts}`;
    } else if (t === 'fill_in_the_blank') {
      const opts = Array.isArray(exercise?.data?.options) ? exercise.data.options.join(', ') : '';
      const tpl = typeof exercise?.template_code === 'string' ? exercise.template_code : '';
      ctx = `Jenis: Isian\nPrompt: ${exercise?.prompt || ''}\nTemplate:\n${tpl}\nPilihan: ${opts}`;
    } else if (t === 'guessing') {
      const code = typeof exercise?.data?.code === 'string' ? exercise.data.code : '';
      ctx = `Jenis: Menebak Output\nPrompt: ${exercise?.prompt || ''}\nKode:\n${code}`;
    } else if (t === 'drag_and_drop') {
      const items = Array.isArray(exercise?.data?.items) ? exercise.data.items.join(', ') : '';
      const buckets = Array.isArray(exercise?.data?.buckets)
        ? exercise.data.buckets.join(', ')
        : '';
      ctx = `Jenis: Kelompokkan\nPrompt: ${exercise?.prompt || ''}\nItems: ${items}\nKategori: ${buckets}`;
    } else if (t === 'sorting') {
      const q = exercise?.pertanyaan || exercise?.data?.question || '';
      const lines = Array.isArray(exercise?.data?.code_lines)
        ? exercise.data.code_lines.join(' | ')
        : '';
      ctx = `Jenis: Mengurutkan\nPrompt: ${exercise?.prompt || ''}\nPertanyaan: ${q}\nItems: ${lines}`;
    } else if (t === 'checkbox') {
      const opts = Array.isArray(exercise?.data?.options) ? exercise.data.options.join(', ') : '';
      ctx = `Jenis: Pilihan Ganda (Checkbox)\nPrompt: ${exercise?.prompt || ''}\nPertanyaan: ${exercise?.pertanyaan || exercise?.data?.question || ''}\nPilihan: ${opts}`;
    } else {
      ctx = `Prompt: ${exercise?.prompt || ''}`;
    }
    return ctx;
  };

  // Real Story Agent Runner - connects to Skripsi backend via SSE
  const runStoryWorkflow = async (userPrompt: string) => {
    setWorkflowMode('STORY');
    setIsChatMaximized(true); // Auto maximize for story

    // Reset workflow state - starts empty, steps appear as they are encountered
    setWorkflowState({
      currentStage: 'planning',
      activeWriters: [],
      canvas: null,
      generatedImages: [],
      draftDiagram: '',
      diagramTitle: '',
      storyTitle: 'Sedang Membuat Cerita...',
      metrics: { quality_score: 0, revision_count: 0 },
      agentOutputs: {
        planning: {
          title: 'Perencanaan',
          content: 'Memulai perencanaan cerita...',
          status: 'running',
        },
      },
    });

    // Add placeholder message for AI to trigger the unified UI
    setChatMessages((prev) => [...prev, { role: 'ai', text: '' }]);
    setIsAsking(false); // Hide the generic "thinking" bubble immediately

    try {
      // Enrich prompt with learning context
      const currentExercise = exercises[currentIndex];
      const context = getQuizContext(currentExercise);

      const enrichedPrompt = `
[Learning Context]
Modul: ${modulTitle || modulParam || 'Umum'}
Bagian: ${pelajaranTitle || bagianParam || 'Umum'}

[User Prompt]
${userPrompt}

[Instruksi Format]
Jika user tidak menentukan panjang atau gaya secara spesifik, gunakan panduan berikut:
- Wajib buat cerita pendek sekitar 3 paragraf (100-500 kata).
- User berusia 14 tahun keatas jenjang sma/smk-kuliah.
- Gunakan Analogi atau Studi Kasus yang relevan dengan materi.
- Utamakan topik yang diminta user.

[Exercise Details]
${context}
`.trim();

      const response = await fetch('/api/ai/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: enrichedPrompt,
          target_age: '15-18',
          language: 'Indonesian',
          story_length: 'medium',
        }),
      });

      if (!response.ok) {
        // Try to get detailed error from response
        let errorDetails = response.statusText;
        try {
          const errorJson = await response.json();
          errorDetails = errorJson.details || errorJson.error || response.statusText;
        } catch {
          /* ignore parse error */
        }
        throw new Error(errorDetails);
      }
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalStory = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            const eventType = line.replace('event:', '').trim();
            // Map SSE event to workflow stage
            const eventToStage: Record<string, string> = {
              'RISET::MULAI': 'research',
              'RISET::MENEMUKAN_INFORMASI': 'research',
              'PERENCANA::MULAI': 'planning',
              'PERENCANA::MERINCIKAN': 'planning',
              'PENULIS::MULAI': 'writing',
              'PENULIS::SELESAI': 'writing',
              'KRITIK::MULAI': 'critique',
              'KRITIK::MENGEVALUASI': 'critique',
              'WORKFLOW::SELESAI': 'finalize',
            };
            const stage = eventToStage[eventType] || null;
            if (stage) {
              setWorkflowState((prev) => ({ ...prev, currentStage: stage }));
            }
          } else if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.replace('data:', '').trim());

              // Update agent outputs based on event data
              if (data.agent === 'research') {
                setWorkflowState((prev) => ({
                  ...prev,
                  agentOutputs: {
                    ...prev.agentOutputs,
                    research: {
                      title: 'Riset',
                      content:
                        data.status === 'done'
                          ? `Riset selesai (${data.chars || 0} karakter)`
                          : 'Sedang meneliti...',
                      status: data.status === 'done' ? 'completed' : 'running',
                    },
                  },
                }));
              } else if (data.agent === 'planning') {
                setWorkflowState((prev) => ({
                  ...prev,
                  agentOutputs: {
                    ...prev.agentOutputs,
                    planning: {
                      title: 'Perencanaan',
                      content:
                        data.status === 'done'
                          ? `${data.characters || 0} karakter dibuat`
                          : 'Menyusun rencana...',
                      status: data.status === 'done' ? 'completed' : 'running',
                    },
                  },
                }));
              } else if (data.agent === 'writer_text') {
                setWorkflowState((prev) => ({
                  ...prev,
                  agentOutputs: {
                    ...prev.agentOutputs,
                    writing: {
                      title: 'Penulisan',
                      content:
                        data.status === 'done'
                          ? `Draft selesai (${data.words || 0} kata)`
                          : 'Menulis cerita...',
                      status: data.status === 'done' ? 'completed' : 'running',
                    },
                  },
                }));

                // Capture story title if available
                const apiTitle = data.draft_title || data.title || data.story_title;
                if (apiTitle) {
                  setWorkflowState((prev) => ({
                    ...prev,
                    storyTitle: apiTitle,
                  }));
                }
              } else if (data.agent === 'critique') {
                setWorkflowState((prev) => ({
                  ...prev,
                  metrics: {
                    quality_score: data.quality_score || 0,
                    revision_count: prev.metrics.revision_count,
                  },
                  agentOutputs: {
                    ...prev.agentOutputs,
                    critique: {
                      title: 'Evaluasi',
                      content:
                        data.status === 'done'
                          ? `Skor: ${data.quality_score || 0} - ${data.decision || 'OK'}`
                          : 'Mengevaluasi...',
                      status: data.status === 'done' ? 'completed' : 'running',
                    },
                  },
                }));
              }

              // Handle final workflow completion
              if (data.final_story) {
                finalStory = data.final_story;

                // Content-based title extraction (simple fallback)
                let extractedTitle = 'Cerita Selesai Dibuat';
                const firstLine = finalStory.trim().split('\n')[0];
                if (firstLine && (firstLine.startsWith('#') || firstLine.length < 100)) {
                  extractedTitle = firstLine.replace(/^#+\s*/, '').trim();
                }

                // Check title again in final data
                const finalApiTitle = data.draft_title || data.title || data.story_title;

                setWorkflowState((prev) => ({
                  ...prev,
                  currentStage: 'finalize',
                  metrics: {
                    quality_score: data.quality_score || prev.metrics.quality_score,
                    revision_count: data.revision_count || 0,
                  },
                  draftDiagram: data.draft_diagram || '',
                  diagramTitle:
                    data.diagram_title ||
                    finalApiTitle ||
                    prev.storyTitle ||
                    extractedTitle ||
                    'Cerita Selesai Dibuat',
                  storyTitle:
                    finalApiTitle || prev.storyTitle || extractedTitle || 'Cerita Selesai Dibuat',
                  generatedImages: data.generated_images || [],
                  finalStory: finalStory,
                  agentOutputs: {
                    ...prev.agentOutputs,
                    finalize: {
                      title: extractedTitle,
                      content: `Selesai dalam ${data.elapsed_time || 0}s`,
                      status: 'completed',
                    },
                  },
                }));
                setIsCanvasOpen(true);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }

      // Add final story to chat by UPDATING the last placeholder message
      // Note: We pass raw markdown because ReactMarkdown handles it.

      setChatMessages((msgs) => {
        const newMsgs = [...msgs];
        if (newMsgs.length > 0) {
          // Instead of full story, just show success message
          newMsgs[newMsgs.length - 1] = {
            ...newMsgs[newMsgs.length - 1],
            text: 'Cerita berhasil dibuat! Silakan cek di panel sebelah kanan.',
          };
        }
        return newMsgs;
      });
    } catch (error: any) {
      console.error('Story Workflow Error:', error);
      setWorkflowState((prev) => ({
        ...prev,
        agentOutputs: {
          ...prev.agentOutputs,
          finalize: { title: 'Gagal', content: error?.message || 'Error', status: 'failed' },
        },
      }));
      // Update the placeholder with error message
      setChatMessages((msgs) => {
        const newMsgs = [...msgs];
        if (newMsgs.length > 0) {
          newMsgs[newMsgs.length - 1] = {
            ...newMsgs[newMsgs.length - 1],
            text: `Maaf, terjadi kesalahan: ${error?.message || 'Tidak dapat terhubung ke server'}`,
          };
        }
        return newMsgs;
      });
    }
  };

  const handleSendMessage = async () => {
    const content = chatInput.trim();
    if (!content || isAsking) return;
    setChatMessages((msgs) => [...msgs, { role: 'user', text: content }]);
    setChatInput('');
    setIsAsking(true);

    // saveMessage('user', content);

    try {
      // 1. Classify Intent
      let intent = 'QA';
      try {
        const clsRes = await fetch('/api/ai/classify-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content }),
        });
        if (clsRes.ok) {
          const clsData = await clsRes.json();
          intent = clsData.intent || 'QA';
        }
      } catch (e) {
        console.error(e);
      }

      if (intent === 'STORY') {
        await runStoryWorkflow(content);
        setIsAsking(false);
        return;
      }

      // QA Workflow (RAG)
      setWorkflowMode('QA');

      // Step 1: Analyzing
      setWorkflowState((prev) => ({
        ...prev,
        currentStage: 'analyzing',
        agentOutputs: {
          analyzing: {
            title: 'Analisis',
            content: 'Memahami pertanyaan pengguna...',
            status: 'running',
          },
        },
      }));
      await new Promise((r) => setTimeout(r, 600));
      setWorkflowState((prev) => ({
        ...prev,
        agentOutputs: {
          ...prev.agentOutputs,
          analyzing: { title: 'Analisis', content: 'Analisis selesai.', status: 'completed' },
          searching: {
            title: 'Pencarian',
            content: 'Mencari dokumen terkait...',
            status: 'running',
          },
        },
      }));

      const ex = exercises[currentIndex];
      const quizContext = getQuizContext(ex);

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

      // Step 2: Search Completed
      setWorkflowState((prev) => ({
        ...prev,
        agentOutputs: {
          ...prev.agentOutputs,
          searching: { title: 'Pencarian', content: 'Dokumen ditemukan.', status: 'completed' },
          generating: { title: 'Generasi', content: 'Menyusun jawaban...', status: 'running' },
        },
      }));

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = `Terjadi kesalahan: ${data.error || res.statusText}`;
        setChatMessages((msgs) => {
          setTypingMessageIndex(msgs.length); // Index of the new message
          return [...msgs, { role: 'ai', text: errMsg }];
        });
        // saveMessage('ai', errMsg);
        setWorkflowState((prev) => ({
          ...prev,
          agentOutputs: {
            ...prev.agentOutputs,
            generating: { title: 'Generasi', content: 'Gagal.', status: 'failed' },
          },
        }));
      } else {
        const data = await res.json();
        const safe = typeof data.answer === 'string' ? sanitizeAllowedHtml(data.answer) : '';
        setChatMessages((msgs) => {
          setTypingMessageIndex(msgs.length); // Index of the new message
          return [...msgs, { role: 'ai', text: safe }];
        });
        // saveMessage('ai', safe);
        setWorkflowState((prev) => ({
          ...prev,
          agentOutputs: {
            ...prev.agentOutputs,
            generating: { title: 'Generasi', content: 'Jawaban terkirim.', status: 'completed' },
          },
        }));
      }
    } catch (e: any) {
      const netErr = `Terjadi kesalahan jaringan: ${e?.message || 'Unknown error'}`;
      setChatMessages((msgs) => {
        setTypingMessageIndex(msgs.length); // Index of the new message
        return [...msgs, { role: 'ai', text: netErr }];
      });
      // saveMessage('ai', netErr);
    } finally {
      setIsAsking(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      if (!modulParam || !bagianParam) return;
      if (!selectedPelajaranId) return;
      try {
        setIsLoading(true);
        const { data, error } = await fetchExercises({
          id_pelajaran: selectedPelajaranId,
          nomor_latihan: nomorLatihan ? parseInt(nomorLatihan) : undefined,
        });
        // Seeded shuffle for options/items to reduce answer sharing
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const seedBase =
          (user?.id || '') + ':' + String(selectedPelajaranId) + ':' + String(nomorLatihan || '');
        const seeded = (data || []).map((ex: any) => {
          const hash = Array.from(seedBase + ':' + String(ex.id)).reduce(
            (acc, ch) => acc + ch.charCodeAt(0),
            0,
          );
          const rand = (n: number) => {
            // Mulberry32-like
            let t = (hash + n) >>> 0;
            t += 0x6d2b79f5;
            t = Math.imul(t ^ (t >>> 15), 1 | t);
            t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
          };
          const shuffle = (arr: any[]) => {
            const a = Array.isArray(arr) ? [...arr] : [];
            for (let i = a.length - 1; i > 0; i--) {
              const j = Math.floor(rand(i) * (i + 1));
              [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
          };
          if (ex?.data) {
            const d = { ...ex.data };
            if (Array.isArray(d.options)) d.options = shuffle(d.options);
            if (Array.isArray(d.items)) d.items = shuffle(d.items);
            if (Array.isArray(d.code_lines)) d.code_lines = shuffle(d.code_lines);
            // never include long explanations if present
            delete (d as any).explanation;
            delete (d as any).rationale;
            delete (d as any).solution_text;
            return { ...ex, data: d };
          }
          return ex;
        });
        const filtered = (seeded || []).filter((ex: any) => {
          const matchNomor = nomorLatihan ? String(ex.nomor_latihan) === nomorLatihan : true;
          const matchPelajaran = ex.id_pelajaran === selectedPelajaranId;
          return matchNomor && matchPelajaran;
        });
        setExercises(filtered);
        setIsLoading(false);
        if (error || filtered.length === 0) {
          setError('Gagal memuat soal. Silakan coba lagi.');
        }
      } catch {
        setIsLoading(false);
        setError('Gagal memuat soal. Silakan coba lagi.');
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomorLatihan, selectedPelajaranId]);

  const handlePrevious = () => {
    // Hanya bisa previous jika soal sebelumnya sudah dikerjakan
    if (currentIndex > 0 && completedExercises.has(currentIndex - 1)) {
      try {
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
      } catch {}
      try {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      } catch {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      }
      setCurrentIndex(currentIndex - 1);
      setChatMessages([{ role: 'ai', text: 'Halo, aku asistenmu, apakah kamu butuh bantuan?' }]);
      setChatInput('');
      setIsAsking(false);
    }
  };

  const handleNext = () => {
    // Hanya bisa next jika soal saat ini sudah selesai
    if (currentIndex < exercises.length - 1 && completedExercises.has(currentIndex)) {
      try {
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
      } catch {}
      try {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      } catch {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      }
      setCurrentIndex(currentIndex + 1);
      setChatMessages([{ role: 'ai', text: 'Halo, aku asistenmu, apakah kamu butuh bantuan?' }]);
      setChatInput('');
      setIsAsking(false);
    }
  };

  const handleAgentClick = () => {
    setChatOpen(true);
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleWrong = (prompt: string) => {
    setWrongAttempts((prev) => prev + 1);
    if (prompt) {
      setWrongPrompts((prev) => [...prev, prompt]);
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
    if (modulParam) {
      router.replace(`/belajar/${modulParam}/units`);
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
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      if (!exercises.length) {
        isSubmittingRef.current = false;
        return;
      }

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
        isSubmittingRef.current = false;
      } else {
        setEarnedExp((result as any).earnedExp ?? 0);

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
      isSubmittingRef.current = false;
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
        <motion.img
          src="/imageAssets/winner.png"
          alt="Agent"
          className="w-[260px] h-auto mb-6"
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <p className="text-[40px] leading-[48px] font-bold text-[#3674B5]">+{earnedExp} EXP</p>
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

        {!(wrongPrompts.length > 0) ? (
          <p className="mt-3 text-lg text-[#3F3F46] text-center w-[80%]">
            Kamu berhasil menyelesaikan soal tanpa ada yang salah. Ayo semangat dan lanjutkan lagi
            perjalanan belajarmu!
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
            // Clear dashboard advice cache so it regenerates with new progress
            if (typeof window !== 'undefined') {
              localStorage.removeItem('dashboard_ai_advice');
            }

            if (modulParam) {
              router.push(`/belajar/${modulParam}/units`);
            } else {
              router.push('/belajar');
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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto py-20">
        <div className="flex justify-center px-0 py-6 min-h-[calc(100vh-180px)] pb-28">
          <motion.div
            className="flex gap-6 items-start w-full max-w-6xl mx-auto"
            initial={false}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Backdrop for maximized view */}
            <AnimatePresence>
              {chatOpen && isChatMaximized && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
                  onClick={() => setIsChatMaximized(false)}
                />
              )}
            </AnimatePresence>

            {/* Chat Panel - Flex Item */}
            <AnimatePresence>
              {chatOpen && (
                <motion.div
                  className={
                    isChatMaximized
                      ? 'fixed inset-0 m-auto z-[9999]'
                      : 'w-[35%] min-w-[340px] flex-shrink-0 h-[94%]'
                  }
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={
                    isChatMaximized
                      ? {
                          opacity: 1,
                          width: '90vw',
                          height: '85vh',
                          borderRadius: '24px',
                          scale: 1,
                        }
                      : {
                          opacity: 1,
                          width: '340px',
                          height: '550px',
                          borderRadius: '18px',
                          scale: 1,
                        }
                  }
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  layout
                >
                  <div className="flex h-full w-full gap-4">
                    <div
                      className={`${isChatMaximized && workflowMode === 'STORY' && isCanvasOpen ? 'w-[400px] flex-shrink-0' : 'w-full'} h-full transition-all duration-300`}
                    >
                      <Card
                        className={`border-2 border-[#E4E4E7] bg-white shadow-[0px_2px_0px_0px_rgba(228,228,231,1)] h-full ${isChatMaximized ? 'rounded-[24px]' : 'rounded-[18px]'}`}
                        radius="lg"
                      >
                        <CardBody className="px-0 py-0 flex flex-col h-full overflow-hidden">
                          {/* Header */}
                          <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 bg-white border-b border-[#E4E4E7] z-50">
                            <div className="flex items-center gap-2">
                              <BotSparkle16Color className="w-7 h-7 text-[#3674B5]" />
                              <span className="text-base font-semibold text-[#3674B5]">
                                AI Chat
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setIsChatMaximized(!isChatMaximized)}
                                className="text-sm font-semibold text-[#A1A1AA] hover:text-[#3674B5] cursor-pointer"
                                type="button"
                              >
                                {isChatMaximized ? (
                                  <SquareMultipleRegular className="w-5 h-5" />
                                ) : (
                                  <MaximizeRegular className="w-5 h-5" />
                                )}
                              </button>
                              {/* Canvas Toggle */}
                              {/* Canvas Toggle Removed */}
                              <button
                                onClick={() => setChatOpen(false)}
                                className="text-sm font-semibold text-[#A1A1AA] hover:text-[#3674B5] cursor-pointer"
                                type="button"
                              >
                                <SubtractRegular className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Messages Area */}
                          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0">
                            {chatMessages.map((m, idx) => (
                              <div
                                key={idx}
                                className={`flex ${m.role === 'ai' ? 'items-start gap-2' : 'justify-end'}`}
                              >
                                {m.role === 'ai' && (
                                  <img
                                    src="/imageAssets/bot-profile.png"
                                    alt="AI"
                                    className="w-8 h-8 mt-1 rounded-full"
                                  />
                                )}
                                <div className="relative mx-1 max-w-[85%]">
                                  {/* Unified Bubble for Story Workflow */}
                                  {m.role === 'ai' &&
                                  workflowMode === 'STORY' &&
                                  idx === chatMessages.length - 1 &&
                                  workflowState.currentStage !== 'idle' ? (
                                    <div className="bg-[#205994] text-white border-none rounded-[18px] overflow-hidden shadow-[0px_2px_0px_0px_rgba(32,89,148,1)]">
                                      {/* Top: Workflow Tracker (Collapsible) */}
                                      <div className="border-b border-white/20">
                                        <InlineWorkflowTracker state={workflowState} />
                                      </div>

                                      {/* Bottom: Result/Content */}
                                      <div className="px-4 py-3">
                                        {/* Story Assets: Images and Diagram - Moved UP */}
                                        {/* Story Assets: Images and Diagram - Moved to StoryCanvas */}
                                        {/* (Rendering Removed) */}

                                        {typingMessageIndex === idx ? (
                                          <div className="prose prose-sm prose-invert max-w-none">
                                            <TypingText
                                              text={m.text}
                                              speed={1}
                                              onComplete={() => setTypingMessageIndex(null)}
                                            />
                                          </div>
                                        ) : m.text ? (
                                          <div className="prose prose-sm prose-invert max-w-none">
                                            <ReactMarkdown>{m.text}</ReactMarkdown>
                                          </div>
                                        ) : (
                                          <span className="italic text-white/70">
                                            Menunggu hasil...
                                          </span>
                                        )}

                                        {/* Story Result Card */}
                                        {workflowState.finalStory && (
                                          <div className="mt-4 pt-4 border-t border-white/10">
                                            <button
                                              onClick={() => setIsCanvasOpen(!isCanvasOpen)}
                                              className="w-full text-left bg-gradient-to-r from-white/10 to-transparent hover:from-white/20 hover:to-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 rounded-xl p-4 flex items-center gap-4 group active:scale-[0.98] backdrop-blur-sm shadow-lg overflow-hidden relative"
                                            >
                                              {/* Decorative Glow */}
                                              <div className="absolute -left-10 -top-10 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-400/30 transition-colors duration-500" />

                                              <div className="relative w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner border border-white/5">
                                                {isCanvasOpen ? (
                                                  <ReadingModeMobileRegular className="w-6 h-6 text-blue-200" />
                                                ) : (
                                                  <div className="relative">
                                                    <ReadingModeMobileRegular className="w-6 h-6 text-blue-200" />
                                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse border border-[#205994]" />
                                                  </div>
                                                )}
                                              </div>
                                              <div className="relative flex-1">
                                                <h4 className="font-bold text-white text-md tracking-wide group-hover:text-blue-100 transition-colors">
                                                  {workflowState.storyTitle ||
                                                    workflowState.diagramTitle ||
                                                    'Cerita Selesai Dibuat'}
                                                </h4>
                                                <p className="text-white/60 text-xs mt-1 group-hover:text-white/80 transition-colors font-medium">
                                                  {isCanvasOpen
                                                    ? 'Klik untuk menutup cerita'
                                                    : 'Klik untuk membaca cerita lengkap'}
                                                </p>
                                              </div>
                                              <div
                                                className={`relative ml-auto w-8 h-8 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors ${isCanvasOpen ? 'rotate-90' : 'rotate-0'} transition-transform duration-300`}
                                              >
                                                <ChevronRightRegular className="w-5 h-5 text-white/50 group-hover:text-white" />
                                              </div>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    /* Standard Bubble */
                                    <div
                                      className={`rounded-[18px] px-4 py-3 text-sm leading-[1.55em] ${
                                        m.role === 'ai'
                                          ? 'bg-[#205994] text-white shadow-[0px_2px_0px_0px_rgba(32,89,148,1)] overflow-x-auto'
                                          : 'bg-[#F5A524] text-white shadow-[0px_2px_0px_0px_rgba(245,165,36,1)]'
                                      }`}
                                    >
                                      {m.role === 'ai' ? (
                                        typingMessageIndex === idx ? (
                                          <TypingText
                                            text={m.text}
                                            speed={1}
                                            onComplete={() => setTypingMessageIndex(null)}
                                          />
                                        ) : (
                                          <span dangerouslySetInnerHTML={{ __html: m.text }} />
                                        )
                                      ) : (
                                        m.text
                                      )}
                                    </div>
                                  )}

                                  {/* Tail Decoration (only for standard bubbles or custom handling needed?) */}
                                  {!(
                                    m.role === 'ai' &&
                                    workflowMode === 'STORY' &&
                                    idx === chatMessages.length - 1
                                  ) &&
                                    (m.role === 'ai' ? (
                                      <div className="absolute -left-1 top-4 w-3 h-3 bg-[#205994] rotate-45 rounded-sm"></div>
                                    ) : (
                                      <div className="absolute -right-1 top-4 w-3 h-3 bg-[#F5A524] rotate-45 rounded-sm"></div>
                                    ))}
                                </div>
                              </div>
                            ))}
                            {/* Loading indicator - AI is thinking */}
                            {isAsking && (
                              <div className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2">
                                <img
                                  src="/imageAssets/bot-profile.png"
                                  alt="AI"
                                  className="w-8 h-8 mt-1 rounded-full"
                                />
                                <div className="relative mx-1">
                                  <div className="rounded-[18px] px-4 py-3 bg-[#205994] text-white shadow-[0px_2px_0px_0px_rgba(32,89,148,1)]">
                                    <span className="inline-flex gap-1">
                                      <span
                                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                                        style={{ animationDelay: '0ms' }}
                                      ></span>
                                      <span
                                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                                        style={{ animationDelay: '150ms' }}
                                      ></span>
                                      <span
                                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                                        style={{ animationDelay: '300ms' }}
                                      ></span>
                                    </span>
                                  </div>
                                  <div className="absolute -left-1 top-4 w-3 h-3 bg-[#205994] rotate-45 rounded-sm"></div>
                                </div>
                              </div>
                            )}
                            <div ref={chatEndRef} />
                          </div>

                          {/* Input Footer */}
                          <div className="flex-shrink-0 flex items-center gap-3 w-full px-4 py-3 bg-white border-t border-gray-100">
                            <div className="flex-1">
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
                            </div>
                            <button
                              type="button"
                              onClick={handleSendMessage}
                              disabled={isAsking || !chatInput.trim()}
                              className="flex-shrink-0 rounded-full w-[46px] h-[46px] flex items-center justify-center bg-white border-2 border-[#E4E4E7] hover:border-[#3674B5] disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Kirim"
                            >
                              <SendRegular className="w-4 h-4 text-[#3674B5]" />
                            </button>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                    {isChatMaximized && workflowMode === 'STORY' && isCanvasOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1 h-full min-w-0"
                      >
                        <StoryCanvas
                          content={workflowState.finalStory || ''}
                          title={
                            workflowState.storyTitle ||
                            workflowState.diagramTitle ||
                            'Generated Story'
                          }
                          onClose={() => setIsCanvasOpen(false)}
                          images={workflowState.generatedImages.map((img) => ({
                            url: img.base64_data
                              ? `data:image/png;base64,${img.base64_data}`
                              : img.file_path || '',
                            alt: img.prompt_used || 'Generated Image',
                          }))}
                          diagram={workflowState.draftDiagram}
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content Panel - Takes remaining space */}
            <motion.div
              className="flex-1 min-w-0"
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
