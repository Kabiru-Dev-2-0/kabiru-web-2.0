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
        min-h-screen
        overflow-x-hidden
        overflow-y-auto

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
      <div
        className="
          mt-10
          sm:mt-14
          md:mt-20
          lg:mt-24
        "
      >
        <h1
          className="
            text-white
            font-black
            tracking-wide
            drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]
            text-center

            text-[34px]
            sm:text-[44px]
            md:text-[60px]
            lg:text-[72px]
          "
        >
          PILIH MAP
        </h1>
      </div>

      {/* ================= MAPS ================= */}
      <div
        className="
          flex
          flex-row
          items-center
          justify-center
          flex-wrap

          gap-5
          sm:gap-7
          md:gap-10
          lg:gap-12

          mt-8
          sm:mt-10
          md:mt-12

          px-5
          pb-10
        "
      >
        {/* DETEKTIF LOGIKA */}
        <div
          className="
            relative
            overflow-hidden
            border-4
            border-white
            rounded-[24px]
            sm:rounded-[28px]
            md:rounded-[32px]
            flex-shrink-0
          "
          style={{
            width: "clamp(260px, 42vw, 420px)",
            aspectRatio: "1.25 / 1",
          }}
        >
          <img
            src="/imageAssets/sd/game-selection/thumbnail-1.png"
            alt="Detektif Logika"
            className="w-full h-full object-cover select-none"
            draggable={false}
          />

          <div
            className="
              absolute
              bottom-4
              sm:bottom-5
              md:bottom-7
              left-1/2
              -translate-x-1/2
            "
          >
            <GameButton
              variant="yellow"
              size="sm"
              className="
                whitespace-nowrap
                px-6 py-2
                sm:px-7 sm:py-2.5
                md:px-8 md:py-3
              "
              style={{
                fontSize: "clamp(14px, 1.5vw, 18px)",
              }}
              onClick={() => router.push("/onboarding")}
            >
              Mainkan
            </GameButton>
          </div>
        </div>

        {/* ISLAND LOGIC */}
        <div
          className="
            relative
            overflow-hidden
            border-4
            border-white
            rounded-[24px]
            sm:rounded-[28px]
            md:rounded-[32px]
            flex-shrink-0
            grayscale
            opacity-80
          "
          style={{
            width: "clamp(260px, 42vw, 420px)",
            aspectRatio: "1.25 / 1",
          }}
        >
          <img
            src="/imageAssets/sd/game-selection/thumbnail-2.png"
            alt="Island Logic"
            className="w-full h-full object-cover select-none"
            draggable={false}
          />

          <div
            className="
              absolute
              bottom-4
              sm:bottom-5
              md:bottom-7
              left-1/2
              -translate-x-1/2
            "
          >
            <GameButton
              variant="yellow"
              size="sm"
              className="
                whitespace-nowrap
                px-6 py-2
                sm:px-7 sm:py-2.5
                md:px-8 md:py-3
              "
              style={{
                fontSize: "clamp(14px, 1.5vw, 18px)",
              }}
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