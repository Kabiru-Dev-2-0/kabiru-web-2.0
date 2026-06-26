"use client";

import { useEffect, useState, useRef } from "react";

import LevelHeader from "@/components/sd/map/level-header";
import ModuleNode from "@/components/sd/map/module-node";
import { useGameStore } from "@/store/game-store";

import { createClient } from "@/utils/supabase/client";
import Modal from "@/components/sd/modal";
import { IconFRocket } from "react-fluentui-emoji/lib/flat";

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
  }, [user]);

  async function fetchProgress() {
    const { data } = await supabase
      .from("progress_modul_sd")
      .select("*")
      .eq("pengguna_id", user.id);

    setProgressModules(data || []);
  }

  function getModuleState(moduleId: number): "done" | "progress" | "locked" {
    const progress = progressModules.find((p) => p.modul_id === moduleId);

    if (moduleId === modules[0]?.id && !progress) {
      return "progress";
    }

    if (progress?.is_completed) return "done";
    if (progress?.is_unlocked) return "progress";
    return "locked";
  }

  return (
    <main className="relative min-h-screen w-screen bg-white overflow-hidden">
      {/* ================= CENTER WRAPPER ================= */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* ================= SCALE BOX ================= */}
        <div className="relative h-full w-full flex items-center justify-center">
          {/* ================= CANVAS ================= */}
          <div className="relative h-full w-full md:max-h-screen md:aspect-[1512/888] md:w-auto">
            {/* ================= WHITE FRAME ================= */}
            <div className="absolute inset-0 rounded-none md:rounded-[32px] bg-white p-2 sm:p-4 md:p-6">
              {/* ================= INNER CANVAS ================= */}
              <div className="relative h-full w-full overflow-visible rounded-none md:rounded-[28px]">
                {/* BACKGROUND */}
                <img
                  src="/imageAssets/sd/map/background-map.png"
                  alt="background"
                  className="absolute inset-0 h-full w-full object-cover rounded-none md:rounded-[28px]"
                />

                {/* HEADER - dengan padding yang konsisten */}
                <LevelHeader
                  name={user?.username || "Pemain"}
                  level="Siswa"
                  avatar={user?.avatar || "/imageAssets/avatar/default.png"}
                  exp={user?.exp || 0}
                />

                {/* ================= MODULE AREA ================= */}
                <div className="
                  absolute
                  left-0
                  top-0
                  w-full
                  h-full
                  flex
                  items-center
                  justify-center
                  pt-[80px]
                  pb-[60px]
                  sm:pt-[90px]
                  sm:pb-[64px]
                  md:top-[50%]
                  md:h-auto
                  md:-translate-y-[60%]
                  md:pt-0
                  md:pb-0
                ">
                  {/* Horizontal scroll on desktop, vertical on mobile */}
                  <div className="
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
                      "
                    >
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
                              "
                            >
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

                {/* ================= LEFT SHAPE ================= */}
                <div className="pointer-events-none absolute -bottom-[40px] -left-[1px] w-[22%] min-w-[120px] md:min-w-[160px] hidden md:block">
                  <svg viewBox="0 0 305 116" className="w-full h-full">
                    <path d="M0 0 H260 Q305 0 305 60 V116 H0 Z" fill="white" />
                  </svg>
                </div>

                {/* ================= RIGHT SHAPE ================= */}
                <div className="pointer-events-none absolute -bottom-[40px] -right-[1px] w-[22%] min-w-[120px] md:min-w-[160px] hidden md:block">
                  <svg
                    viewBox="0 0 305 116"
                    className="w-full h-full scale-x-[-1]"
                  >
                    <path d="M0 0 H260 Q305 0 305 60 V116 H0 Z" fill="white" />
                  </svg>
                </div>

                {/* ================= HELP ================= */}
                <div
                  onClick={() => setOpenHelp(true)}
                  className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 flex items-center gap-1 sm:gap-2 cursor-pointer"
                >
                  <img
                    src="/imageAssets/sd/map/icon/icon-ask-circle-super-mini.png"
                    alt="help"
                    className="w-6 h-6 sm:w-8 sm:h-8"
                  />
                  <span className="text-gray-700 font-semibold underline text-sm sm:text-lg">
                    Petunjuk Belajar
                  </span>
                </div>

                {/* ================= DEVELOPED BY ================= */}
                <div className="absolute bottom-2 right-0 z-20 flex items-center gap-1 sm:gap-3">
                  <span className="text-gray-600 text-sm sm:text-lg font-medium">
                    Developed by
                  </span>
                  <img
                    src="/imageAssets/sd/logo/logo-kabiru-biru.png"
                    alt="Kabiru"
                    className="h-8 sm:h-12 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {openHelp && (
        <div
          className="absolute inset-0 bg-[#1F0234]/67 flex items-center justify-center p-4 sm:p-6 z-50"
          onClick={() => setOpenHelp(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg sm:max-w-xl md:max-w-[800px]">
            <Modal
              title="PETUNJUK BELAJAR"
              width="w-full"
              buttonIcon={<IconFRocket size={30} />}
              onClose={() => setOpenHelp(false)}
            >
              <div className="space-y-6 sm:space-y-8 overflow-y-auto max-h-[60vh] sm:max-h-[70vh] pr-1">
                {/* Content 1 */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-500 font-black text-lg sm:text-xl flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-amber-500 font-black uppercase text-[16px] sm:text-[18px] leading-[1.2]"
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      Pilih materi yang tersedia
                    </h3>
                    <p className="mt-2 text-gray-800 text-[14px] sm:text-[16px] leading-[1.35]">
                      Mulailah dari modul yang terbuka dan selesaikan setiap
                      aktivitas belajar.
                    </p>
                    {/* Images: wrap on mobile, row on larger */}
                    <div className="mt-4 sm:mt-6 flex flex-wrap sm:flex-nowrap justify-start gap-6 sm:gap-12">
                      {[
                        { src: "./imageAssets/sd/pb_opened.png", label: "Modul yang terbuka" },
                        { src: "./imageAssets/sd/pb_done.png", label: "Modul sudah terselesaikan" },
                        { src: "./imageAssets/sd/pb_locked.png", label: "Modul masih terkunci" },
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col items-center w-[100px] sm:w-[160px]">
                          <img src={item.src} className="w-24 sm:w-42" alt={item.label} />
                          <p className="mt-2 sm:mt-3 text-center text-gray-800 text-[12px] sm:text-[14px] leading-[1.35]">
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content 2 */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-500 font-black text-lg sm:text-xl flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-amber-500 font-black uppercase text-[16px] sm:text-[18px] leading-[1.2]"
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      EKSPLORASI MODUL DAN LATIHAN SOAL
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <p className="text-gray-800 text-[14px] sm:text-[16px] leading-[1.35]">
                        Kumpulkan
                      </p>
                      <img
                        src="/imageAssets/sd/map/icon/icon-exp.png"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        alt="EXP"
                      />
                      <p className="text-gray-800 text-[14px] sm:text-[16px] leading-[1.35]">
                        EXP dengan menyelesaikan masing-masing soal.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content 3 */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-500 font-black text-lg sm:text-xl flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-amber-500 font-black uppercase text-[16px] sm:text-[18px] leading-[1.2]"
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      Buka MODUL berikutnya
                    </h3>
                    <p className="mt-2 text-gray-800 text-[14px] sm:text-[16px] leading-[1.35]">
                      Setelah modul selesai, kamu bisa melanjutkan ke modul
                      berikutnya.
                    </p>
                  </div>
                </div>

                {/* Content 4 */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-500 font-black text-lg sm:text-xl flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-amber-500 font-black uppercase text-[16px] sm:text-[18px] leading-[1.2]"
                      style={{ fontFamily: "var(--font-lilita-one)" }}
                    >
                      EKSPLORASI MODUL DAN LATIHAN SOAL
                    </h3>
                    <p className="mt-2 text-gray-800 text-[14px] sm:text-[16px] leading-[1.35]">
                      Semakin banyak belajar, semakin tinggi level dan peringkat
                      yang bisa kamu dapatkan.
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