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
    const savedUser =
      localStorage.getItem("sd_user");

    if (!savedUser) return;

    setUser(JSON.parse(savedUser));
  }, []);

  // ================= FETCH DATA MODDUL =================
  useEffect(() => {
    fetchModules();
  }, []);

  async function fetchModules() {
  try {
    const { data, error } = await supabase
      .from("moduls_sd")
      .select("*")
      .order("nomor_modul", {
        ascending: true,
      });

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
const [progressModules,
 setProgressModules] =
 useState<any[]>([]);

useEffect(() => {
  if (!user) return;

  fetchProgress();
}, [user]);

async function fetchProgress() {
  const { data } =
    await supabase
      .from("progress_modul_sd")
      .select("*")
      .eq(
        "pengguna_id",
        user.id
      );

  setProgressModules(
    data || []
  );
}

function getModuleState(
 moduleId: number
):
 "done"
 | "progress"
 | "locked" {

 const progress =
  progressModules.find(
   p =>
    p.modul_id ===
    moduleId
  );

 // fallback modul pertama
 if (
   moduleId === modules[0]?.id &&
   !progress
 ) {
   return "progress";
 }

 if (
  progress?.is_completed
 ) {
  return "done";
 }

 if (
  progress?.is_unlocked
 ) {
  return "progress";
 }

 return "locked";
}

  return (
    <main className="relative h-screen w-screen bg-white overflow-hidden">
      {/* ================= CENTER WRAPPER ================= */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* ================= SCALE BOX ================= */}
        <div className="relative h-full w-full flex items-center justify-center">
          {/* ================= CANVAS ================= */}
          <div className="relative h-full max-h-screen aspect-[1512/888]">
            {/* ================= WHITE FRAME ================= */}
            <div className="absolute inset-0 rounded-[32px] bg-white p-4 md:p-6">
              {/* ================= INNER CANVAS ================= */}
              <div className="relative h-full w-full overflow-visible rounded-[28px]">
                {/* BACKGROUND */}
                <img
                  src="/imageAssets/sd/map/background-map.png"
                  alt="background"
                  className="absolute inset-0 h-full w-full object-cover rounded-[28px]"
                />

                {/* HEADER */}
                <LevelHeader
                  name={
                    user?.username ||
                    "Pemain"
                  }
                  level="Siswa"
                  avatar={
                    user?.avatar ||
                    "/imageAssets/avatar/default.png"
                  }
                  exp={user?.exp || 0}
                />

                {/* ================= MODULE AREA ================= */}
                <div className="absolute left-0 top-[50%] w-full -translate-y-[60%]">
                  <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
                    <div
                      ref={scrollRef}
                      className="flex items-center gap-16 px-8 min-w-max"
                    >
                      {loading ? (
                        <p className="text-white text-xl font-bold">
                          Memuat...
                        </p>
                      ) : modules.length === 0 ? (
                        <p className="text-white text-xl font-bold">
                          Modul SD belum tersedia
                        </p>
                      ) : (
                        modules.map((mod, i) => {
                          const state =
                            getModuleState(
                              mod.id
                            );

                          return (
                            <div
                              key={mod.id}
                              className="flex justify-between items-center gap-10 w-full px-4"
                            >
                              <ModuleNode
                                id_modul={mod.id}
                                title={mod.title}
                                image={mod.image}
                                state={state}
                              />

                              {i !== modules.length - 1 && (
                                <div className="w-[200px] h-[12px] bg-white rounded-full" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* ================= LEFT SHAPE ================= */}
                <div className="pointer-events-none absolute -bottom-[40px] -left-[1px] w-[22%] min-w-[160px]">
                  <svg viewBox="0 0 305 116" className="w-full h-full">
                    <path
                      d="M0 0 H260 Q305 0 305 60 V116 H0 Z"
                      fill="white"
                    />
                  </svg>
                </div>

                {/* ================= RIGHT SHAPE ================= */}
                <div className="pointer-events-none absolute -bottom-[40px] -right-[1px] w-[22%] min-w-[160px]">
                  <svg
                    viewBox="0 0 305 116"
                    className="w-full h-full scale-x-[-1]"
                  >
                    <path
                      d="M0 0 H260 Q305 0 305 60 V116 H0 Z"
                      fill="white"
                    />
                  </svg>
                </div>

                {/* ================= HELP ================= */}
                <div
                  onClick={() => setOpenHelp(true)}
                  className="absolute bottom-4 left-4 z-20 flex items-center gap-2 cursor-pointer"
                >
                  <img
                    src="/imageAssets/sd/map/icon/icon-ask-circle-super-mini.png"
                    alt="help"
                    className="w-8 h-8"
                  />

                  <span className="text-gray-700 font-semibold underline text-lg">
                    Petunjuk Belajar
                  </span>
                </div>

                {/* ================= DEVELOPED BY ================= */}
                <div className="absolute bottom-2 right-0 z-20 flex items-center gap-3">
                  <span className="text-gray-600 text-lg font-medium">
                    Developed by
                  </span>

                  <img
                    src="/imageAssets/sd/logo/logo-kabiru-biru.png"
                    alt="Kabiru"
                    className="h-12 object-contain"
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
                className="absolute inset-0 bg-[#1F0234]/67 items-center justify-center"
                onClick={() => setOpenHelp(false)}>
                {/* Modal */}
                <Modal
                  title="PETUNJUK BELAJAR"
                  width="w-[800px]"
                  buttonIcon={<IconFRocket size={30} />}
                  onClose={() => setOpenHelp(false)}>
                  <div className="space-y-8">
                    {/* Content */}
                    <div className="flex items-start gap-4">
                      {/* Number */}
                      <div
                        className="w-10
                        h-10
                    
                        rounded-full
                    
                        bg-amber-200
                    
                        flex
                        items-center
                        justify-center
                    
                        text-amber-500
                        font-black
                        text-xl
                    
                        flex-shrink-0
                      ">
                        1
                      </div>
                      {/* TEXT */}
                      <div className="flex-1 min-w-0">
                        {/* TITLE */}
                        <h3
                          className="
                        text-amber-500
                        font-black
                        uppercase
                        text-[18px]
                        leading-[1.2]
                        tracking-normal
                        line-clamp-2
                      "
                          style={{
                            fontFamily: "var(--font-lilita-one)",
                          }}>
                          Pilih materi yang tersedia
                        </h3>
      
                        {/* DESCRIPTION */}
                        <p
                          className="
                        mt-2
                        text-gray-800
                        text-[16px]
                        leading-[1.35]
                        tracking-[0.05]
                        font-normal
                        line-clamp-3
                      ">
                          Mulailah dari modul yang terbuka dan selesaikan setiap
                          aktivitas belajar.
                        </p>
                        {/* IMAGE */}
                        <div
                          className="mt-6
                          flex
                          justify-items-start
                          gap-12">
                          <div className="flex flex-col items-center w-[160px]">
                            <img
                              src="./imageAssets/sd/pb_opened.png"
                              className="w-42"
                            />
                            <p
                              className="mt-3
                              text-center
                          
                              text-gray-800
                              text-[14px]
                              leading-[1.35]">
                              Modul yang terbuka
                            </p>
                          </div>
                          <div className="flex flex-col items-center w-[160px]">
                            <img
                              src="./imageAssets/sd/pb_done.png"
                              className="w-42"
                            />
                            <p
                              className="mt-3
          text-center
      
          text-gray-800
          text-[14px]
          leading-[1.35]">
                              Modul sudah terselesaikan
                            </p>
                          </div>
                          <div className="flex flex-col items-center w-[160px]">
                            <img
                              src="./imageAssets/sd/pb_locked.png"
                              className="w-42"
                            />
                            <p
                              className="mt-3
          text-center
      
          text-gray-800
          text-[14px]
          leading-[1.35]">
                              Modul masih terkunci
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Content 2 */}
                    <div className="flex items-start gap-4">
                      {/* Number */}
                      <div
                        className="flex-shrink-0
                      w-[32px]
                      h-[32px]
                      rounded-full
                      bg-amber-200
                      flex
                      items-center
                      justify-center
                      text-amber-500
                      font-black
                      text-[18px]
                      ">
                        2
                      </div>
                      {/* TEXT */}
                      <div className="flex-1 min-w-0">
                        {/* TITLE */}
                        <h3
                          className="
                        text-amber-500
                        font-black
                        uppercase
                        text-[18px]
                        leading-[1.2]
                        tracking-normal
                        line-clamp-2
                      "
                          style={{
                            fontFamily: "var(--font-lilita-one)",
                          }}>
                          EKSPLORASI MODUL dAN LATIHAN SOAL
                        </h3>
      
                        <div className="mt-3 flex items-center gap-2">
                          {/* DESCRIPTION */}
                          <p
                            className="
                        mt-2
                        text-gray-800
                        text-[16px]
                        leading-[1.35]
                        tracking-[0.05]
                        font-normal
                      ">
                            Kumpulkan
                          </p>
                          <img
                            src="/imageAssets/sd/map/icon/icon-exp.png"
                            className="w-6 h-6"
                          />
                          <p
                            className="
                        mt-2
                        text-gray-800
                        text-[16px]
                        leading-[1.35]
                        tracking-[0.05]
                        font-normal
                      ">
                            EXP dengan menyelesaikan masing-masing soal.
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Content 3 */}
                    <div className="flex items-start gap-4">
                      {/* Number */}
                      <div
                        className="
                        w-10
                        h-10
      
                        rounded-full
      
                        bg-amber-200
      
                        flex
                        items-center
                        justify-center
      
                        text-amber-500
                        font-black
                        text-xl
      
                        flex-shrink-0
                      ">
                        3
                      </div>
                      {/* TEXT */}
                      <div className="flex-1 min-w-0">
                        {/* TITLE */}
                        <h3
                          className="
                        text-amber-500
                        font-black
                        uppercase
                        text-[18px]
                        leading-[1.2]
                        tracking-normal
                        line-clamp-2
                      "
                          style={{
                            fontFamily: "var(--font-lilita-one)",
                          }}>
                          Buka MODUL berikutnya
                        </h3>
      
                        {/* DESCRIPTION */}
                        <p
                          className="
                        mt-2
                        text-gray-800
                        text-[16px]
                        leading-[1.35]
                        tracking-[0.05]
                        font-normal
                        line-clamp-3
                      ">
                          Setelah modul selesai, kamu bisa melanjutkan ke modul
                          berikutnya.
                        </p>
                      </div>
                    </div>
                    {/* Content 4 */}
                    <div className="flex items-start gap-4">
                      {/* Number */}
                      <div
                        className="
                        w-10
                        h-10
      
                        rounded-full
      
                        bg-amber-200
      
                        flex
                        items-center
                        justify-center
      
                        text-amber-500
                        font-black
                        text-xl
      
                        flex-shrink-0
                      ">
                        4
                      </div>
                      {/* TEXT */}
                      <div className="flex-1 min-w-0">
                        {/* TITLE */}
                        <h3
                          className="
                        text-amber-500
                        font-black
                        uppercase
                        text-[18px]
                        leading-[1.2]
                        tracking-normal
                        line-clamp-2
                      "
                          style={{
                            fontFamily: "var(--font-lilita-one)",
                          }}>
                          EKSPLORASI MODUL DAN LATIHAN SOAL
                        </h3>
      
                        {/* DESCRIPTION */}
                        <p
                          className="
                        mt-2
                        text-gray-800
                        text-[16px]
                        leading-[1.35]
                        tracking-[0.05]
                        font-normal
                        line-clamp-3
                      ">
                          Semakin banyak belajar, semakin tinggi level dan peringkat
                          yang bisa kamu dapatkan.
                        </p>
                      </div>
                    </div>
                  </div>
                </Modal>
              </div>
            )}
    </main>
  );
}