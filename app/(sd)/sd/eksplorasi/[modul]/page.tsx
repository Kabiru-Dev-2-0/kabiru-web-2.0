"use client";

import TopHeader from "@/components/sd/lesson/top-header";
import LessonCard from "@/components/sd/lesson/lesson-card";
import Breadcrumb from "@/components/sd/breadcrumb";

import { useEffect, useState, useRef } from "react";
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

  // ================= SCROLL =================
  const scrollRight = () => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: 320,
      behavior: "smooth",
    });
  };

  const scrollLeft = () => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: -320,
      behavior: "smooth",
    });
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
        // ================= MODUL =================
        const { data: modulData, error: modulError } = await supabase
          .from("moduls_sd")
          .select("*")
          .eq("id", modulId)
          .single();

        console.log("MODUL DATA:", modulData);
        console.log("MODUL ERROR:", modulError);

        if (modulError || !modulData) {
          setModul(null);
          setLessons([]);
          return;
        }

        setModul(modulData);

        // ================= LESSON =================
        const { data: lessonData, error: lessonError } = await supabase
          .from("pelajarans_sd")
          .select("id, judul, deskripsi, bagian, gambar")
          .eq("id_modul", modulData.id)
          .eq("jenjang", "sd")
          .order("bagian", {
            ascending: true,
          });

        console.log("LESSON DATA:", lessonData);
        console.log("LESSON ERROR:", lessonError);

        if (lessonError) {
          setLessons([]);
          return;
        }

        // ================= MAPPING =================
        const mappedLessons: Lesson[] = (lessonData || []).map(
          (item: any) => ({
            id: item.id,
            judul: item.judul,
            deskripsi: item.deskripsi,
            bagian: item.bagian,
            image: item.gambar,
          })
        );

        console.log("MAPPED LESSONS:", mappedLessons);

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

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* ================= HEADER ================= */}
      <TopHeader
        name={user?.username || "Pemain"}
                        level="Siswa"
                        avatar={user?.avatar || "/imageAssets/avatar/default.png"}
        showBack
        exp={user?.exp || 0}
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
            <p className="mt-8 text-gray-400">
              Memuat Konten...
            </p>
          ) : lessons.length === 0 ? (
            <p className="mt-8 text-gray-400">
              Memuat...
            </p>
          ) : (
            <div className="relative mt-10">
              {/* ================= LEFT BUTTON ================= */}
              <button
                onClick={scrollLeft}
                className="
                  hidden md:flex
                  absolute
                  left-0
                  top-1/2
                  -translate-y-1/2
                  -translate-x-1/2
                  z-20

                  w-12
                  h-12
                  rounded-full

                  items-center
                  justify-center

                  bg-gradient-to-br
                  from-yellow-400
                  to-orange-400

                  shadow-lg
                "
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
                className="
                  flex
                  gap-4 md:gap-6
                  overflow-x-auto
                  no-scrollbar
                  scroll-smooth
                  pb-4
                "
              >
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="
                      min-w-[260px]
                      md:min-w-[300px]
                      flex-shrink-0
                    "
                  >
                    <LessonCard
                      nomor={lesson.bagian}
                      title={lesson.judul}
                      description={lesson.deskripsi}
                      image={
                        lesson.image ||
                        "/imageAssets/placeholder.png"
                      }
                      href={`/sd/eksplorasi/${modulId}/${lesson.id}`}
                    />
                  </div>
                ))}
              </div>

              {/* ================= RIGHT BUTTON ================= */}
              <button
                onClick={scrollRight}
                className="
                  hidden md:flex
                  absolute
                  right-0
                  top-1/2
                  -translate-y-1/2
                  translate-x-1/2
                  z-20

                  w-12
                  h-12
                  rounded-full

                  items-center
                  justify-center

                  bg-gradient-to-br
                  from-yellow-400
                  to-orange-400

                  shadow-lg
                "
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
        className="
            absolute
            right-6
            bottom-0
            w-[100px]
            md:w-[220px]
            object-contain
          "
      />
      {/* ================= FOOTER ================= */}
      <footer
        className="
          relative
          mt-8
          w-full
          bg-[#5534F7]
          min-h-[80px]
          overflow-hidden
        "
      >
        <div
          className="
            max-w-[1400px]
            mx-auto
            px-6 md:px-10
            py-6
            ml-18

            flex
            items-center
            justify-between
          "
        >
          <Breadcrumb
            items={[
              {
                label: "Beranda",
                href: "/map",
              },
              {
                label: modul?.judul || "Modul",
              },
            ]}
          />
        </div>
      </footer>
    </div>
  );
}