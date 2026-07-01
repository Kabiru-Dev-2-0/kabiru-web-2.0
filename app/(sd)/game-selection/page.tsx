"use client";

import { useRouter } from "next/navigation";

import GameButton from "@/components/sd/game-button";
import { useSDAuth } from "@/hooks/use-sd-auth";

export default function GameSelectionPage() {
  useSDAuth();
  const router = useRouter();

  return (
    <div
      className="
        relative
        w-screen
        h-screen
        overflow-hidden

        flex
        flex-col
        items-center
      "
      style={{
        backgroundImage:
          "url('/imageAssets/sd/game-selection/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >

      {/* ================= TITLE ================= */}
      <div className="mt-24">
        <h1
          className="
            text-white
            text-[72px]
            font-black
            tracking-wide

            drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]
          "
        >
          PILIH MAP
        </h1>
      </div>

      {/* ================= MAPS ================= */}
      <div
        className="
          flex
        items-center
        justify-center
        gap-12

        mt-10
        "
      >
        {/* DETEKTIF LOGIKA */}
        <div
        className="
            relative

            w-[420px]
            h-[340px]

            overflow-hidden

            border-4
            border-white

            rounded-[32px]
        "
        >
          <img
            src="/imageAssets/sd/game-selection/thumbnail-1.png"
            alt="Detektif Logika"
            className="
              w-full
              h-full
              object-cover
              select-none
              rounded-xl
            "
            draggable={false}
          />

          <div
            className="
              absolute
              bottom-8
              left-1/2
              -translate-x-1/2
            "
          >
            <GameButton
              variant="yellow"
              size="md"
              onClick={() =>
                router.push("/onboarding")
              }
            >
              Mainkan
            </GameButton>
          </div>
        </div>

        {/* ISLAND LOGIC */}
        <div
          className="
            relative

            w-[420px]
            h-[340px]

            overflow-hidden

            border-4
            border-white

            rounded-[32px]

            grayscale
            opacity-80
        "
        >
          <img
            src="/imageAssets/sd/game-selection/thumbnail-2.png"
            alt="Island Logic"
            className="
              w-full
              h-full
              object-cover
              select-none
              rounded-xl
            "
            draggable={false}
          />

          <div
            className="
              absolute
              bottom-8
              left-1/2
              -translate-x-1/2
            "
          >
            <GameButton
              variant="yellow"
              size="md"
              disabled
            >
              Segera Hadir
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
}