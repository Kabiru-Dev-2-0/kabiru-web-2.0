"use client";

import { useEffect, useState, useRef } from "react";

import LevelHeader from "@/components/sd/map/level-header";
import { createClient } from "@/utils/supabase/client";
import { IconFTrophy, IconFWorldMap } from "react-fluentui-emoji/lib/flat";
import GameButton from "@/components/sd/game-button";
import Modal from "@/components/sd/modal";
import { useRouter } from "next/navigation";
import { useSDAuth } from "@/hooks/use-sd-auth";

export default function OnBoarding() {
  useSDAuth();
  const supabase = createClient();
  const router = useRouter();
  const [openHelp, setOpenHelp] = useState(false);

  // ================= PROFILE =================
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("sd_user");

    if (!savedUser) return;

    setUser(JSON.parse(savedUser));
  }, []);

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

              {/* ================= CONTENT ================= */}
              <div
                className="
                  absolute
                  inset-0
                  z-10
                  flex
                  flex-col
                  items-center
                  justify-center
                  p-4
                "
              >
                {/* LOGO */}
                <img
                  src="/imageAssets/sd/onboarding/logo.png"
                  alt="Detektif Logika"
                  className="
                    w-[320px]
                    sm:w-[220px]
                    md:w-[520px]
                    lg:w-[920px]
                    max-h-[35vh]
                    object-contain
                    mb-4
                    md:mb-8
                  "
                />

                {/* BUTTON MULAI */}
                <GameButton
                  onClick={() => router.push("/map")}
                  variant="yellow"
                  size="lg"
                  icon={
                    <img
                      src="/imageAssets/sd/icon-play-fill.png"
                      alt="play"
                      className="w-6 h-6 md:w-8 md:h-8"
                    />
                  }>
                  MULAI
                </GameButton>

                {/* BUTTONS */}
                <div
                  className="
                    mt-4
                    md:mt-8
                    flex
                    flex-col
                    sm:flex-row
                    items-center
                    gap-3
                    md:gap-4
                  ">
                  {/* SECONDARY BUTTONS */}
                  <GameButton
                    onClick={() => router.push("/game-selection")}
                    variant="blue"
                    size="lg"
                    icon={<IconFWorldMap className="w-7 h-7 md:w-9 md:h-9" />}>
                    MAP LAINNYA
                  </GameButton>
                  {/* TERTIARY BUTTONS */}
                  <GameButton
                    onClick={() => router.push("/sd/leaderboard")}
                    variant="green"
                    size="lg"
                    icon={<IconFTrophy className="w-7 h-7 md:w-9 md:h-9" />}>
                    PERINGKAT
                  </GameButton>
                </div>
              </div>
            </div>

            {/* ================= HELP (DIPINDAH KE SINI AGAR TIDAK KEPOTONG) ================= */}
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