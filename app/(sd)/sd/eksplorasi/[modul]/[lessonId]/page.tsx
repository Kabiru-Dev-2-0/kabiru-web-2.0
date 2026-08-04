"use client";

import TopHeader from "@/components/sd/lesson/top-header";
import Breadcrumb from "@/components/sd/breadcrumb";
import { Skeleton } from "@heroui/skeleton";
import ProgressBar from "@/components/sd/progress-bar";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useSDAuth } from "@/hooks/use-sd-auth";
import GameButton from "@/components/sd/game-button";

type Modul = { id: number; judul: string };
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
  const modulId = Number(params.modul);

  const [user, setUser] = useState<any>(null);
  const [modul, setModul] = useState<Modul | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [totalExercises, setTotalExercises] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("sd_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      const { data: lessonData } = await supabase
        .from("pelajarans_sd")
        .select("*")
        .eq("id", lessonId)
        .maybeSingle();
      setLesson(lessonData);

      const { count } = await supabase
        .from("latihans_sd")
        .select("*", { count: "exact", head: true })
        .eq("id_pelajaran", lessonId);
      setTotalExercises(count || 0);

      if (lessonData?.id_modul) {
        const { data: modulData } = await supabase
          .from("moduls_sd")
          .select("id, judul")
          .eq("id", lessonData.id_modul)
          .maybeSingle();
        setModul(modulData);
      }
      setLoading(false);
    };
    if (lessonId && !isNaN(lessonId)) fetchLesson();
  }, [lessonId]);

  const formattedMateri =
    lesson?.materi?.replace(/containerstyle="([^"]*)"/g, 'style="$1"') || "";
  const shortText = (text?: string) =>
    text
      ? text.split(" ").length <= 2
        ? text
        : `${text.split(" ")[0]} ${text.split(" ")[1]}...`
      : "";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src="/imageAssets/sd/detail-lesson/background.png"
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <TopHeader
        name={user?.username || "Pemain"}
        level="Siswa"
        avatar={user?.avatar || "/imageAssets/avatar/default.png"}
        exp={user?.exp || 0}
        onBack={() => router.push(`/sd/eksplorasi/${modulId}`)}
        showBack
      />

      {/* PROGRESS BAR */}
      <div className="relative z-20 pt-4 sm:pt-24 md:pt-12 px-4 md:px-10 max-w-[1200px] mx-auto flex md:justify-center">
        <div className="w-full absolute md:static top-[16vh] left-0 px-4 md:px-0 md:w-[400px] z-40">
          <ProgressBar current={1} total={(totalExercises || 0) + 1} />
        </div>
      </div>

      <div
        className="relative z-10 mx-auto mt-44 md:mt-10 w-[90%] md:w-[80%]
          h-[68vh] md:h-[72vh] rounded-[28px] border-[10px] border-[#F8B233] bg-[#015B4E] shadow-2xl overflow-x-hidden">
        <div className="w-full h-full overflow-y-auto px-6 py-6 md:px-10 md:py-8 custom-scroll">
          {loading ? (
            <div className="flex flex-col gap-5">
              <Skeleton className="rounded-xl w-2/5 h-5" />
              <Skeleton className="rounded-2xl w-full h-52 mt-2" />
            </div>
          ) : (
            <>
              <h1 className="text-[#FFE08A] text-[24px] md:text-[32px] font-black leading-tight mb-6">
                {lesson?.bagian}. {lesson?.judul}
              </h1>
              <div
                className="lesson-content text-white text-[18px] md:text-[20px] leading-[1.8]"
                dangerouslySetInnerHTML={{ __html: formattedMateri }}
              />
            </>
          )}
        </div>
      </div>

      <div className="absolute hidden md:block md:bottom-12 left-6 md:left-38 z-10">
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

      <div className="absolute bottom-4 md:bottom-18 right-4 md:right-36 z-50">
        <GameButton
          disabled={loading || !lesson?.id}
          onClick={() => router.push(`/sd/latihan/${lesson?.id}`)}
          variant="green"
          size="lg"
          icon={
            <img
              src="/imageAssets/sd/icon-game.png"
              alt="play"
              className="w-8 h-8"
            />
          }>
          MULAI BERLATIH
        </GameButton>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 12px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: white; border-radius: 10px; }
        .lesson-content p { margin-bottom: 1.5rem; }
      `}</style>
    </div>
  );
}
