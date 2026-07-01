"use client";

import TopHeader from "@/components/sd/lesson/top-header";
import Breadcrumb from "@/components/sd/breadcrumb";
import { Skeleton } from "@heroui/skeleton";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useSDAuth } from "@/hooks/use-sd-auth";
import GameButton from "@/components/sd/game-button";

type Modul = {
  id: number;
  judul: string;
};

type Lesson = {
  id: number;
  judul: string;
  deskripsi: string;
  bagian: number;
  id_modul: number;
  materi?: string;
};

export default function DetailLessonPage() {
  useSDAuth();
  const params = useParams();
  const router = useRouter();

  const supabase = createClient();

  const lessonId = Number(params.lessonId);

  // ================= PROFILE =================
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("sd_user");
    if (!savedUser) return;
    setUser(JSON.parse(savedUser));
  }, []);

  const [modul, setModul] = useState<Modul | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [totalExercises, setTotalExercises] = useState<number | null>(null);

  // =========================================
  // LOADING STATE — satu flag untuk semua fetch
  // =========================================
  const [loading, setLoading] = useState(true);

  const totalProgress =
    totalExercises !== null ? totalExercises + 1 : undefined;

  // =========================================
  // SHORT TEXT
  // =========================================
  // =====================================
  // SHORT TEXT
  // =====================================
  const shortText = (text?: string) => {
    if (!text) return "";

    const words = text.split(" ");

    if (words.length <= 2) return text;

    return `${words[0]} ${words[1]}...`;
  };

  // =========================================
  // FETCH LESSON
  // =========================================
  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);

      const { data: lessonData, error: lessonError } = await supabase
        .from("pelajarans_sd")
        .select("*")
        .eq("id", lessonId)
        .maybeSingle();

      if (lessonError) {
        console.error(lessonError);
        setLoading(false);
        return;
      }

      setLesson(lessonData);

      // FETCH TOTAL EXERCISES
      const { count } = await supabase
        .from("latihans_sd")
        .select("*", { count: "exact", head: true })
        .eq("id_pelajaran", lessonId);

      setTotalExercises(count || 0);

      // FETCH MODUL
      if (lessonData?.id_modul) {
        const { data: modulData } = await supabase
          .from("moduls_sd")
          .select("id, judul")
          .eq("id", lessonData.id_modul)
          .maybeSingle();

        setModul(modulData);
      }

      // Semua fetch selesai, baru loading false
      setLoading(false);
    };

    if (lessonId && !isNaN(lessonId)) {
      fetchLesson();
    }
  }, [lessonId]);

  // =========================================
  // FORMAT RENDER DETAIL MATERI PEMBAHASAN
  // =========================================
  const formattedMateri =
    lesson?.materi?.replace(/containerstyle="([^"]*)"/g, 'style="$1"') || "";

  // Handler back button
  const modulId = Number(params.modul);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ================= BACKGROUND ================= */}
      <img
        src="/imageAssets/sd/detail-lesson/background.png"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* ================= HEADER ================= */}
      <div className="relative z-30">
        <TopHeader
          name={user?.username || "Pemain"}
          level="Siswa"
          avatar={user?.avatar || "/imageAssets/avatar/default.png"}
          showProgress={totalProgress !== undefined}
          currentProgress={1}
          totalProgress={totalProgress || 1}
          exp={user?.exp || 0}
          onBack={() => router.push(`/sd/eksplorasi/${modulId}`)}
          showBack
        />
      </div>

      {/* ================= MAIN BOARD ================= */}
      <div
        className="
          absolute
          top-[16%]
          left-1/2
          -translate-x-1/2
          z-20
          w-[84%]
          h-[72%]
          rounded-[28px]
          border-[10px]
          border-[#F8B233]
          bg-[#015B4E]
          shadow-2xl
          overflow-hidden
        ">
        <div
          className="
            w-full h-full
            overflow-y-auto
            px-10 py-8
            custom-scroll
          ">
          {loading ? (
            // ================= SKELETON =================
            <div className="flex flex-col gap-5">
              {/* Skeleton judul */}
              <Skeleton className="rounded-xl w-2/5 h-5" />

              {/* Skeleton paragraf */}
              <div className="flex flex-col gap-3 mt-4">
                <Skeleton className="rounded-lg w-2/3 h-5" />
                <Skeleton className="rounded-lg w-4/5 h-5" />
              </div>

              {/* Skeleton block konten (gambar / video) */}
              <Skeleton className="rounded-2xl w-full h-52 mt-2" />

              {/* Skeleton paragraf kedua */}
              <div className="flex flex-col gap-3 mt-2">
                <Skeleton className="rounded-lg w-full h-5" />
                <Skeleton className="rounded-lg w-5/6 h-5" />
              </div>
            </div>
          ) : (
            // ================= KONTEN ASLI =================
            <>
              <h1
                className="
                  text-[#FFE08A]
                  text-[32px]
                  font-black
                  leading-tight
                  mb-8
                ">
                {lesson?.bagian}. {lesson?.judul}
              </h1>

              <div
                className="lesson-content text-white text-[20px] leading-[2]"
                dangerouslySetInnerHTML={{ __html: formattedMateri }}
              />
            </>
          )}
        </div>
      </div>

      {/* ================= BREADCRUMB ================= */}
      <div className="absolute bottom-8 left-18 px-6 md:px-10 z-30">
        <Breadcrumb
          items={[
            { label: "Beranda", href: "/map" },
            {
              label: shortText(modul?.judul),
              href: `/sd/eksplorasi/${params.modul}`,
            },
            { label: shortText(lesson?.judul) },
          ]}
        />
      </div>

      {/* ================= FLOATING PLAY BUTTON ================= */}
      <div className="absolute bottom-[8%] right-[8%] z-50">
        <GameButton
          disabled={loading || !lesson?.id}
          onClick={() => router.push(`/sd/latihan/${lesson?.id}`)}
          variant="green"
          size="lg"
          icon={
            <img
              src="/imageAssets/sd/icon-game.png"
              alt="check"
              className="w-10 h-10"
            />
          }>
          {" "}
          MULAI BERLATIH
        </GameButton>
      </div>

      {/* ================= STYLES ================= */}
      <style>{`
      /* ================= SCROLLBAR ================= */
      .custom-scroll::-webkit-scrollbar { width: 18px; }
      .custom-scroll::-webkit-scrollbar-track {
        background: rgba(232, 232, 232, 0.36);
        border-radius: 14px;
      }
      .custom-scroll::-webkit-scrollbar-thumb {
        background: white;
        border-radius: 14px;
      }

      /* ================= PARAGRAF ================= */
      .lesson-content p {
        font-size: 18px;
        font-weight: 450;
        margin: 0.25rem 0 1.5rem;
        line-height: 1.45;
        letter-spacing: 0.68px;
      }

      /* ================= ALIGNMENT ================= */
      .lesson-content [style*="text-align: center"] { text-align: center; }
      .lesson-content [style*="text-align: right"]  { text-align: right; }
      .lesson-content [style*="text-align: left"]   { text-align: left; }

      /* ================= HEADING ================= */
      .lesson-content h1 {
        font-size: 1.75rem;
        font-weight: 800;
        color: #FFE08A;
        margin-top: 1.75rem;
        margin-bottom: 0.4rem;
        line-height: 1.3;
      }

      .lesson-content h2 {
        font-size: 1.50rem;
        font-weight: 700;
        color: #E9D4FF;
        margin-top: 1.4rem;
        margin-bottom: 0.6rem;
        line-height: 1.3;
      }

      .lesson-content h3 {
        font-size: 1.1rem;
        font-weight: 700;
        color: #d4f5e9;
        margin-top: 1.1rem;
        margin-bottom: 0.3rem;
        line-height: 1.3;
      }

      /* ================= LIST ================= */
      .lesson-content ul,
      .lesson-content ol {
        padding-left: 0;       
        margin: 0.5rem 0 0.1rem 0;
        list-style: none;     
        counter-reset: list-counter;
      }

      .lesson-content ol > li {
        counter-increment: list-counter;
        display: grid;
        grid-template-columns: 1.75rem 1fr;
        gap: 0;
        margin: 0.3rem 0;
        line-height: 1.75;
      }

      .lesson-content ol > li::before {
        content: counter(list-counter) ".";
        font-weight: 700;
        color: #FFE08A;
        padding-top: 0.4rem;  
        align-self: start;
      }

      .lesson-content ul > li {
        display: grid;
        grid-template-columns: 1.5rem 1fr;
        gap: 0;
        margin: 0.3rem 0;
        line-height: 1.75;
      }

      .lesson-content ul > li::before {
        content: "•";
        font-weight: 900;
        color: #FFE08A;
        align-self: start;
        padding-top: 0.05rem;
      }

      .lesson-content li > ul,
      .lesson-content li > ol {
        margin: 0.2rem 0 0.2rem 0;
        grid-column: 2; 
      }

      /* ================= BLOCKQUOTE ================= */
      .lesson-content blockquote {
        border-left: 5px solid #FFE08A;
        padding: 0.6rem 1rem;
        margin: 1.25rem 0;
        color: #FFE08A;
        font-style: italic;
        background: rgba(255, 224, 138, 0.08);
        border-radius: 0 8px 8px 0;
      }

      /* ================= GAMBAR ================= */
      .lesson-content img {
        display: block;
        max-width: 90%;
        height: auto;
        margin-top: 2rem 0;
        border-radius: 16px;
      }

      /* ================= VIDEO / IFRAME ================= */
      .lesson-content iframe {
        display: block;
        width: 100%;
        max-width: 860px;
        height: 460px;
        border: none;
        border-radius: 16px;
        margin: 1.5rem auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      }

      /* ================= INLINE FORMAT ================= */
      .lesson-content strong { font-weight: 800; }
      .lesson-content em    { font-style: italic; }
      .lesson-content u     { text-decoration: underline; }

      .lesson-content code {
        font-family: monospace;
        background: rgba(255,255,255,0.12);
        padding: 0.15rem 0.4rem;
        border-radius: 4px;
        font-size: 0.9em;
      }

      .lesson-content pre {
        background: rgba(0,0,0,0.35);
        border-radius: 10px;
        padding: 1rem 1.25rem;
        margin: 1rem 0;
        overflow-x: auto;
        font-family: monospace;
        font-size: 0.9em;
        line-height: 1.6;
      }

      .lesson-content pre code {
        background: none;
        padding: 0;
      }

      /* ================= TABLE ================= */
      .lesson-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.25rem 0;
        font-size: 0.95em;
        border-radius: 10px;
        overflow: hidden;
      }

      .lesson-content th {
        background: rgba(255,224,138,0.25);
        color: #FFE08A;
        font-weight: 700;
        padding: 0.6rem 0.9rem;
        text-align: left;
        border-bottom: 2px solid rgba(255,224,138,0.4);
      }

      .lesson-content td {
        padding: 0.5rem 0.9rem;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        vertical-align: top;
      }

      .lesson-content tr:last-child td { border-bottom: none; }

      .lesson-content tr:nth-child(even) td {
        background: rgba(255,255,255,0.04);
      }

      /* ================= SPACER — heading pertama tidak perlu margin-top ================= */
      .lesson-content > h1:first-child,
      .lesson-content > h2:first-child,
      .lesson-content > h3:first-child {
        margin-top: 0;
      }
    `}</style>
    </div>
  );
}
