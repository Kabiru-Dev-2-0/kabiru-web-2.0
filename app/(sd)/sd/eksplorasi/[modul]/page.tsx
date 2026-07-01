"use client";

import TopHeader from "@/components/sd/lesson/top-header";
import LessonCard from "@/components/sd/lesson/lesson-card";
import Breadcrumb from "@/components/sd/breadcrumb";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useSDAuth } from "@/hooks/use-sd-auth";

type Modul = {
  id: number;
  judul: string;
  deskripsi: string;
  nomor_modul: number;
  jenjang: string;
};

type Lesson = {
  id: number;
  judul: string;
  deskripsi: string;
  bagian: number;
  image: string | null;
};

export default function ListSubModulPage() {
  useSDAuth();
  const params = useParams();
  const supabase = createClient();

  const modulId = Number(params?.modul);

  const [modul, setModul] = useState<Modul | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= PROFILE =================
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("sd_user");
    if (!savedUser) return;
    setUser(JSON.parse(savedUser));
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);
  useEffect(() => {
    const id = setTimeout(updateScrollState, 0);
    return () => clearTimeout(id);
  }, [lessons, updateScrollState]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;

      // Mousepad geser horizontal
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      // Mouse wheel ubah vertical menjadi horizontal
      e.preventDefault();

      el.scrollBy({
        left: e.deltaY,
        behavior: "smooth",
      });
    };

    el.addEventListener("wheel", onWheel, {
      passive: false,
    });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [lessons]);

  // ================= SCROLL BUTTONS =================
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  };

  // ================= FETCH DATA =================
  useEffect(() => {
    if (!modulId || isNaN(modulId)) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        const { data: modulData, error: modulError } = await supabase
          .from("moduls_sd")
          .select("*")
          .eq("id", modulId)
          .single();

        if (modulError || !modulData) {
          setModul(null);
          setLessons([]);
          return;
        }

        setModul(modulData);

        const { data: lessonData, error: lessonError } = await supabase
          .from("pelajarans_sd")
          .select("id, judul, deskripsi, bagian, gambar")
          .eq("id_modul", modulData.id)
          .eq("jenjang", "sd")
          .order("bagian", { ascending: true });

        if (lessonError) {
          setLessons([]);
          return;
        }

        const mappedLessons: Lesson[] = (lessonData || []).map((item: any) => ({
          id: item.id,
          judul: item.judul,
          deskripsi: item.deskripsi,
          bagian: item.bagian,
          image: item.gambar,
        }));

        setLessons(mappedLessons);
      } catch (err) {
        console.error("UNEXPECTED ERROR:", err);
        setModul(null);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [modulId]);

  // ================= ARROW BUTTON STYLE =================
  const arrowActiveClass = `
    bg-gradient-to-br from-yellow-400 to-orange-400
    shadow-lg cursor-pointer
  `;
  const arrowInactiveClass = `
    bg-gray-200 cursor-not-allowed
  `;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* ================= HEADER ================= */}
      <TopHeader
        name={user?.username || "Pemain"}
        level="Siswa"
        avatar={user?.avatar || "/imageAssets/avatar/default.png"}
        exp={user?.exp || 0}
        backHref="/map"
        showBack
      />

      {/* ================= CONTENT ================= */}
      <main className="flex-1 pt-28 md:pt-32 px-4 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          {/* ================= TITLE ================= */}
          <h1 className="mt-4 md:mt-6 font-bold text-[#FEA203] text-xl md:text-2xl leading-tight">
            {modul?.judul || "Memuat..."}
          </h1>

          {/* ================= DESCRIPTION ================= */}
          <p className="mt-1 md:mt-2 text-gray-500 tracking-[0.3] text-sm md:text-base leading-relaxed max-w-[900px] md:h-[52px]">
            {modul?.deskripsi || "Memuat Konten..."}
          </p>

          {/* ================= LOADING ================= */}
          {loading ? (
            <p className="mt-8 text-gray-400">Memuat Konten...</p>
          ) : lessons.length === 0 ? (
            <p className="mt-8 text-gray-400">Belum ada pelajaran.</p>
          ) : (
            <div className="relative mt-10">
              {/* ================= LEFT BUTTON ================= */}
              <button
                onClick={canScrollLeft ? scrollLeft : undefined}
                disabled={!canScrollLeft}
                className={`
                  hidden md:flex
                  absolute left-0 top-1/2
                  -translate-y-1/2 -translate-x-1/2
                  z-20 w-12 h-12 rounded-full
                  items-center justify-center
                  transition-all duration-200
                  ${canScrollLeft ? arrowActiveClass : arrowInactiveClass}
                `}
              >
                <img
                  src="/imageAssets/sd/icon-arrow-left-big.png"
                  alt="left"
                  className="w-5 h-5"
                />
              </button>

              {/* ================= LIST ================= */}
              <div
                ref={scrollRef}
                onScroll={updateScrollState}
                className="
                  flex
                  gap-2 md:gap-0
                  overflow-x-auto
                  no-scrollbar
                  scroll-smooth
                  pb-4
                "
              >
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="min-w-[260px] md:min-w-[300px] flex-shrink-0"
                  >
                    <LessonCard
                      nomor={lesson.bagian}
                      title={lesson.judul}
                      description={lesson.deskripsi}
                      image={lesson.image || "/imageAssets/placeholder.png"}
                      href={`/sd/eksplorasi/${modulId}/${lesson.id}`}
                    />
                  </div>
                ))}
              </div>

              {/* ================= RIGHT BUTTON ================= */}
              <button
                onClick={canScrollRight ? scrollRight : undefined}
                disabled={!canScrollRight}
                className={`
                  hidden md:flex
                  absolute right-0 top-1/2
                  -translate-y-1/2 translate-x-1/2
                  z-20 w-12 h-12 rounded-full
                  items-center justify-center
                  transition-all duration-200
                  ${canScrollRight ? arrowActiveClass : arrowInactiveClass}
                `}
              >
                <img
                  src="/imageAssets/sd/icon-arrow-right-big.png"
                  alt="right"
                  className="w-5 h-5"
                />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ================= ROBOT ================= */}
      <img
        src="/imageAssets/sd/robot-list-lesson.png"
        alt="robot"
        className="absolute right-6 bottom-0 w-[100px] md:w-[220px] object-contain"
      />

      {/* ================= FOOTER ================= */}
      <footer className="relative mt-8 w-full bg-[#5534F7] min-h-[80px] overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 ml-18 flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: "Beranda", href: "/map" },
              { label: modul?.judul || "Modul" },
            ]}
          />
        </div>
      </footer>
    </div>
  );
}