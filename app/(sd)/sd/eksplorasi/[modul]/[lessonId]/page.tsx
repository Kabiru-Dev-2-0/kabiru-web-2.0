"use client";

import TopHeader from "@/components/sd/lesson/top-header";
import Breadcrumb from "@/components/sd/breadcrumb";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useSDAuth } from "@/hooks/use-sd-auth";

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
  const totalProgress =
    totalExercises !== null ? totalExercises + 1 : undefined;

  // =========================================
  // SHORT TEXT
  // =========================================
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
      const { data: lessonData, error: lessonError } = await supabase
        .from("pelajarans_sd")
        .select("*")
        .eq("id", lessonId)
        .maybeSingle();

      if (lessonError) {
        console.error(lessonError);
        return;
      }

      setLesson(lessonData);

      // FETCH TOTAL EXERCISES
      const { count } = await supabase
        .from("latihans_sd")
        .select("*", {
          count: "exact",
          head: true,
        })
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ================= BACKGROUND ================= */}
      <img
        src="/imageAssets/sd/detail-lesson/background.png"
        alt="background"
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
        "
      />

      {/* ================= HEADER ================= */}
      <div className="relative z-30">
        <TopHeader
          name={user?.username || "Pemain"}
          level="Siswa"
          avatar={user?.avatar || "/imageAssets/avatar/default.png"}
          showBack
          showProgress={totalProgress !== undefined}
          currentProgress={1}
          totalProgress={totalProgress || 1}
          exp={user?.exp || 0}
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
        {/* ================= SCROLL AREA ================= */}
        <div
          className="
            w-full
            h-full

            overflow-y-auto

            px-10
            py-8

            custom-scroll
          ">
          {/* TITLE */}
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

          {/* ================= CONTENT ================= */}
          <div
            className="
              lesson-content

              text-white
              text-[20px]
              leading-[2]
            "
            dangerouslySetInnerHTML={{
              __html:
                formattedMateri ||
                `
                <p>
                  Loading...
                </p>
              `,
            }}
          />
        </div>
      </div>

      {/* ================= BREADCRUMB ================= */}
      <div
        className="
          absolute
          bottom-8
          left-18
          px-6 md:px-10
          z-30
        ">
        <Breadcrumb
          items={[
            {
              label: "Beranda",
              href: "/map",
            },
            {
              label: shortText(modul?.judul),
              href: `/sd/eksplorasi/${params.modul}`,
            },
            {
              label: shortText(lesson?.judul),
            },
          ]}
        />
      </div>

      {/* ================= FLOATING PLAY BUTTON ================= */}
      <div
        className="
        absolute
        bottom-[8%]
        right-[8%]

        z-50
      ">
        <button
          onClick={() => router.push(`/sd/latihan/${lesson?.id}`)}
          className="
          flex
          items-center
          gap-3

          rounded-full

          bg-gradient-to-r
          from-[#47E5A0]
          to-[#53A058]

          px-8
          py-4

          text-white
          font-black
          text-[24px]

          hover:scale-105
          transition-all
        ">
          <img
            src="/imageAssets/sd/icon-game.png"
            alt="game"
            className="w-10 h-10"
          />
          MULAI BERLATIH
        </button>
      </div>

      {/* ================= STYLES ================= */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 18px;
        }

        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(232, 232, 232, 0.36);
          border-radius: 14px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          background: white;
          border-radius: 14px;
        }

        .lesson-content p {
          margin: 0.5rem 0;
        }

        .lesson-content p[style*="text-align: center"] {
          text-align: center;
        }

        .lesson-content p[style*="text-align: right"] {
          text-align: right;
        }

        .lesson-content p[style*="text-align: left"] {
          text-align: left;
        }

        .lesson-content h1 {
          font-size: 2rem;
          font-weight: 800;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .lesson-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #ffffff;
        }

        .lesson-content h1[style*="text-align: center"],
        .lesson-content h2[style*="text-align: center"] {
          text-align: center;
        }

        .lesson-content h1[style*="text-align: right"],
        .lesson-content h2[style*="text-align: right"] {
          text-align: right;
        }

        .lesson-content h1[style*="text-align: left"],
        .lesson-content h2[style*="text-align: left"] {
          text-align: left;
        }

        .lesson-content ul {
          list-style-type: disc;
          padding-left: 2rem;
          margin: 0.5rem 0;
        }

        .lesson-content ol {
          list-style-type: decimal;
          padding-left: 2rem;
          margin: 0.5rem 0;
        }

        .lesson-content li {
          margin: 0.5rem 0;
        }

        .lesson-content blockquote {
          border-left: 6px solid #ffe08a;
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: #ffe08a;
          font-style: italic;
        }

        .lesson-content img {
          display: block;

          max-width: 100%;
          height: auto;

          margin-left: auto;
          margin-right: auto;

          border-radius: 20px;
        }

        .lesson-content iframe {
          width: 100%;
          max-width: 900px;

          height: 500px;

          border: none;
          border-radius: 20px;

          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .lesson-content strong {
          font-weight: 800;
        }

        .lesson-content em {
          font-style: italic;
        }

        .lesson-content u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
