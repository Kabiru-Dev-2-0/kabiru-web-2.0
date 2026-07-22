"use client";

import { useEffect, useState, useRef } from "react";

import LevelHeader from "@/components/sd/map/level-header";
import ModuleNode from "@/components/sd/map/module-node";

import { createClient } from "@/utils/supabase/client";
import Modal from "@/components/sd/modal";

type Module = {
  id: number;
  title: string;
  image: string;
  order: number;
};

export default function LevelMap() {
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [modules, setModules] = useState<Module[]>([]);
  const [openHelp, setOpenHelp] = useState(false);
  const [loading, setLoading] = useState(true);

  // ================= PROFILE =================
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("sd_user");
    if (!savedUser) return;
    setUser(JSON.parse(savedUser));
  }, []);

  // ================= FETCH DATA MODUL =================
  useEffect(() => {
    fetchModules();
  }, []);

  async function fetchModules() {
    try {
      const { data, error } = await supabase
        .from("moduls_sd")
        .select("*")
        .order("nomor_modul", { ascending: true });

      if (error) {
        console.log(error);
        return;
      }

      const mapped = (data || []).map((item: any) => ({
        id: item.id,
        title: item.judul,
        image: item.gambar || "/placeholder.png",
        order: item.nomor_modul || 1,
      }));

      setModules(mapped);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  // ================= FETCH DATA PROGRESS MODUL USER =================
  const [progressModules, setProgressModules] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    fetchProgress();

    const timeout = setTimeout(fetchProgress, 500);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchProgress();
      }
    };

    window.addEventListener("focus", fetchProgress);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("focus", fetchProgress);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  async function fetchProgress() {
    const { data, error } = await supabase
      .from("progress_modul_sd")
      .select("modul_id,is_completed,is_unlocked")
      .eq("pengguna_id", user.id)
      .order("modul_id", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setProgressModules([...(data ?? [])]);
  }

  function getModuleState(moduleId: number): "done" | "progress" | "locked" {
    const progress = progressModules.find(
      (item) => Number(item.modul_id) === Number(moduleId),
    );

    if (progress?.is_completed === true) {
      return "done";
    }

    if (progress?.is_unlocked === true) {
      return "progress";
    }

    if (moduleId === modules[0]?.id) {
      return "progress";
    }

    return "locked";
  }

  return (
    <main className="relative h-screen w-screen bg-white md:bg-white overflow-hidden">
      {/* ================= CENTER WRAPPER ================= */}
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 md:p-0">
        
        {/* ================= SCALE BOX ================= */}
        <div className="relative w-full h-full md:w-auto md:max-h-screen md:aspect-[1512/888] flex items-center justify-center">
          
          {/* ================= WHITE FRAME ================= */}
          <div className="absolute inset-0 rounded-[24px] md:rounded-[32px] bg-white p-2 sm:p-4 md:p-6">
            
            {/* ================= INNER CANVAS ================= */}
            <div className="relative h-full w-full overflow-hidden md:overflow-visible rounded-[18px] md:rounded-[28px]">
              
              {/* BACKGROUND */}
              <img
                src="/imageAssets/sd/map/background-map.png"
                alt="background"
                className="absolute inset-0 h-full w-full object-cover rounded-[18px] md:rounded-[28px]"
              />

              {/* HEADER */}
              <div className="absolute top-0 left-0 right-0 z-20">
                <LevelHeader
                  name={user?.username || "Pemain"}
                  level="Siswa"
                  avatar={user?.avatar || "/imageAssets/avatar/default.png"}
                  exp={user?.exp || 0}
                  backHref="/sd/onboarding"
                />
              </div>

              {/* ================= LEFT SHAPE ================= */}
              <div className="pointer-events-none absolute -bottom-[42px] md:-bottom-[40px] -left-[1px] w-[30%] md:w-[22%] min-w-[160px] md:min-w-[160px]">
                <svg viewBox="0 0 305 116" className="w-full h-full">
                  <path d="M0 0 H260 Q305 0 305 60 V116 H0 Z" fill="white" />
                </svg>
              </div>

              {/* ================= RIGHT SHAPE ================= */}
              <div className="pointer-events-none absolute -bottom-[42px] md:-bottom-[40px] -right-[1px] w-[30%] md:w-[22%] min-w-[160px] md:min-w-[160px]">
                <svg
                  viewBox="0 0 305 116"
                  className="w-full h-full scale-x-[-1]">
                  <path d="M0 0 H260 Q305 0 305 60 V116 H0 Z" fill="white" />
                </svg>
              </div>

              {/* ================= MODULE AREA ================= */}
              <div
                className="
                  absolute
                  inset-0
                  z-10
                  flex
                  flex-col
                  items-center
                  justify-center
                  pt-[120px]
                  pb-[40px]
                  sm:pt-[90px]
                  sm:pb-[64px]
                  md:top-[55%]
                  md:h-auto
                  md:-translate-y-[60%]
                  md:pt-0
                  md:pb-0
                ">
                {/* Horizontal scroll on desktop, vertical on mobile */}
                <div
                  className="
                    w-full
                    h-full
                    overflow-y-auto
                    overflow-x-hidden
                    md:overflow-x-auto
                    md:overflow-y-hidden
                    scrollbar-hide
                  ">
                  <div
                    ref={scrollRef}
                    className="
                      flex
                      flex-col
                      items-center
                      gap-6
                      px-3
                      py-4
                      sm:gap-8
                      sm:px-4
                      md:flex-row
                      md:items-center
                      md:gap-17
                      md:px-6
                      md:py-0
                      md:min-w-max
                    ">
                    {loading ? (
                      <p className="text-white text-lg sm:text-xl font-bold">
                        Memuat...
                      </p>
                    ) : modules.length === 0 ? (
                      <p className="text-white text-lg sm:text-xl font-bold">
                        Modul SD belum tersedia
                      </p>
                    ) : (
                      modules.map((mod, i) => {
                        const state = getModuleState(mod.id);

                        return (
                          <div
                            key={mod.id}
                            className="
                              flex
                              flex-col
                              items-center
                              gap-4
                              w-full
                              sm:gap-6
                              md:flex-row
                              md:justify-between
                              md:items-center
                              md:gap-17
                              md:w-auto
                              md:flex-shrink-0
                            ">
                            <ModuleNode
                              id_modul={mod.id}
                              title={mod.title}
                              image={mod.image}
                              state={state}
                            />

                            {/* Connector */}
                            {i !== modules.length - 1 && (
                              <>
                                {/* Mobile/Tablet */}
                                <div className="w-[12px] h-[60px] bg-white rounded-full md:hidden" />
                                {/* Desktop */}
                                <div className="hidden md:block w-[80px] lg:w-[120px] xl:w-[200px] h-[12px] bg-white rounded-full flex-shrink-0" />
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= HELP ================= */}
            <div
              onClick={() => setOpenHelp(true)}
              className="absolute bottom-[-8px] left-1 sm:bottom-2 sm:left-3 md:bottom-8 md:left-10 z-30 flex items-center gap-1 md:gap-2 cursor-pointer transition-all hover:scale-105">
              <img
                src="/imageAssets/sd/map/icon/icon-ask-circle-super-mini.png"
                alt="help"
                className="w-7 h-7 md:w-8 md:h-8"
              />
              <span className="text-gray-800 md:text-gray-700 text-[12px] font-semibold md:font-semibold underline text-sm md:text-lg sm:block">
                Petunjuk Belajar
              </span>
            </div>

            {/* ================= DEVELOPED BY ================= */}
            <div className="absolute bottom-[-8px] right-1 sm:bottom-2 sm:right-3 md:bottom-6 md:right-3 z-30 flex items-center gap-2 px-2 py-1">
              <span className="text-gray-800 md:text-gray-700 text-[10px] md:text-lg md:font-medium sm:block">
                Developed by
              </span>
              <img
                src="/imageAssets/sd/logo/logo-kabiru-biru.png"
                alt="Kabiru"
                className="h-6 md:h-12 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
            {openHelp && (
              <div
                className="
                  absolute
                  inset-0
                  z-50
                  bg-[#1F0234]/80
      
                  flex
                  items-center
                  justify-center
      
                  p-4
                "
                onClick={() => setOpenHelp(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full flex justify-center"
                >
                  <Modal
                    title="PETUNJUK BELAJAR"
                    width="lg:w-[800px]"
                    onClose={() => setOpenHelp(false)}
                  >
                    <div
                      className="
                        space-y-6
                        md:space-y-8
      
                        pr-1
                        md:pr-2
                      "
                    >
                      {/* ================= CONTENT 1 ================= */}
                      <div className="flex items-start gap-3 md:gap-4">
                        {/* NUMBER */}
                        <div
                          className="
                            flex-shrink-0
      
                            w-8 h-8
                            md:w-10 md:h-10
      
                            rounded-full
      
                            bg-amber-200
      
                            flex
                            items-center
                            justify-center
      
                            text-amber-500
                            font-black
      
                            text-lg
                            md:text-xl
                          "
                        >
                          1
                        </div>
      
                        <div className="flex-1 min-w-0">
                          <h3
                            className="
                              text-amber-500
                              font-black
                              uppercase
      
                              text-[16px]
                              md:text-[18px]
      
                              leading-tight
                            "
                            style={{
                              fontFamily: "var(--font-lilita-one)",
                            }}
                          >
                            Pilih Materi yang Tersedia
                          </h3>
      
                          <p
                            className="
                              mt-2
      
                              text-gray-800
      
                              text-[14px]
                              md:text-[16px]
      
                              leading-relaxed
                            "
                          >
                            Mulailah dari modul yang terbuka dan selesaikan setiap aktivitas belajar.
                          </p>
      
                          {/* IMAGE GRID */}
                          <div
                            className="
                              mt-5
      
                              grid
                              grid-cols-2
                              gap-4
      
                              sm:grid-cols-3
      
                              lg:flex
                              lg:justify-start
                              lg:gap-12
                            "
                          >
                            {/* OPEN */}
                            <div className="flex flex-col items-center">
                              <img
                                src="./imageAssets/sd/pb_opened.png"
                                className="
                                  w-16
                                  sm:w-20
                                  md:w-24
                                  lg:w-32
                                "
                              />
      
                              <p
                                className="
                                  mt-2
      
                                  text-center
      
                                  text-[12px]
                                  md:text-[14px]
      
                                  leading-snug
                                "
                              >
                                Modul yang terbuka
                              </p>
                            </div>
      
                            {/* DONE */}
                            <div className="flex flex-col items-center">
                              <img
                                src="./imageAssets/sd/pb_done.png"
                                className="
                                  w-16
                                  sm:w-20
                                  md:w-24
                                  lg:w-32
                                "
                              />
      
                              <p
                                className="
                                  mt-2
      
                                  text-center
      
                                  text-[12px]
                                  md:text-[14px]
      
                                  leading-snug
                                "
                              >
                                Modul sudah terselesaikan
                              </p>
                            </div>
      
                            {/* LOCKED */}
                            <div
                              className="
                                flex
                                flex-col
                                items-center
      
                                col-span-2
                                justify-self-center
      
                                sm:col-span-1
                              "
                            >
                              <img
                                src="./imageAssets/sd/pb_locked.png"
                                className="
                                  w-16
                                  sm:w-20
                                  md:w-24
                                  lg:w-32
                                "
                              />
      
                              <p
                                className="
                                  mt-2
      
                                  text-center
      
                                  text-[12px]
                                  md:text-[14px]
      
                                  leading-snug
                                "
                              >
                                Modul masih terkunci
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
      
                      {/* ================= CONTENT 2 ================= */}
                      <div className="flex items-start gap-3 md:gap-4">
                        <div
                          className="
                            flex-shrink-0
      
                            w-8 h-8
                            md:w-10 md:h-10
      
                            rounded-full
      
                            bg-amber-200
      
                            flex
                            items-center
                            justify-center
      
                            text-amber-500
                            font-black
      
                            text-lg
                            md:text-xl
                          "
                        >
                          2
                        </div>
      
                        <div className="flex-1 min-w-0">
                          <h3
                            className="
                              text-amber-500
                              font-black
                              uppercase
      
                              text-[16px]
                              md:text-[18px]
      
                              leading-tight
                            "
                            style={{
                              fontFamily: "var(--font-lilita-one)",
                            }}
                          >
                            Eksplorasi Modul dan Latihan Soal
                          </h3>
      
                          <div
                            className="
                              mt-2
      
                              flex
                              flex-wrap
                              items-center
      
                              gap-2
                            "
                          >
                            <span className="text-[14px] md:text-[16px]">
                              Kumpulkan
                            </span>
      
                            <img
                              src="/imageAssets/sd/map/icon/icon-exp.png"
                              className="
                                w-5 h-5
                                md:w-6 md:h-6
                              "
                            />
      
                            <span className="text-[14px] md:text-[16px]">
                              EXP dengan menyelesaikan masing-masing soal.
                            </span>
                          </div>
                        </div>
                      </div>
      
                      {/* ================= CONTENT 3 ================= */}
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-500 font-black text-lg md:text-xl flex-shrink-0">
                          3
                        </div>
      
                        <div className="flex-1">
                          <h3
                            className="
                              text-amber-500
                              font-black
                              uppercase
      
                              text-[16px]
                              md:text-[18px]
      
                              leading-tight
                            "
                            style={{
                              fontFamily: "var(--font-lilita-one)",
                            }}
                          >
                            Buka Modul Berikutnya
                          </h3>
      
                          <p
                            className="
                              mt-2
      
                              text-[14px]
                              md:text-[16px]
      
                              leading-relaxed
                            "
                          >
                            Setelah modul selesai, kamu bisa melanjutkan ke modul berikutnya.
                          </p>
                        </div>
                      </div>
      
                      {/* ================= CONTENT 4 ================= */}
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-500 font-black text-lg md:text-xl flex-shrink-0">
                          4
                        </div>
      
                        <div className="flex-1">
                          <h3
                            className="
                              text-amber-500
                              font-black
                              uppercase
      
                              text-[16px]
                              md:text-[18px]
      
                              leading-tight
                            "
                            style={{
                              fontFamily: "var(--font-lilita-one)",
                            }}
                          >
                            Tingkatkan Level dan Peringkat
                          </h3>
      
                          <p
                            className="
                              mt-2
      
                              text-[14px]
                              md:text-[16px]
      
                              leading-relaxed
                            "
                          >
                            Semakin banyak belajar, semakin tinggi level dan peringkat yang bisa kamu dapatkan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Modal>
                </div>
              </div>
            )}
    </main>
  );
}