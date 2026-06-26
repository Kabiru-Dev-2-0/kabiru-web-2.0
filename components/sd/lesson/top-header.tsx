"use client";

import ExpBadge from "@/components/sd/exp-badge";
import ProfileCard from "@/components/sd/profile-card";
import ProgressBar from "@/components/sd/progress-bar";
import GameButton from "@/components/sd/game-button";

import { useGameStore } from "@/store/game-store";

import { useRouter } from "next/navigation";

type Props = {
  name: string;

  level: string;

  avatar: string;

  exp: number;

  showBack?: boolean;

  showProgress?: boolean;

  currentProgress?: number;

  totalProgress?: number;
};

export default function TopHeader({
  name,
  level,
  avatar,
  exp,
  showBack = false,
  showProgress = false,
  currentProgress = 0,

  totalProgress = 0,
}: Props) {
  const router = useRouter();

  return (
    <div className="absolute top-6 left-0 w-full z-20 px-4 md:px-10">
      {/* CONTAINER */}
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-8">
          {showBack && (
            <div>
            <GameButton 
              onClick={() => router.back()}
              variant="yellow"
              size="lg"
              icon={
                <img 
                  src="/imageAssets/sd/icon-arrow-left-big.png"
                  alt="back"
                  className="
                    w-8
                    h-8
                    object-contain
                    shrink-0
                "
                />
              }
              className="py-4"
            > KEMBALI
            </GameButton>
            </div>
          )}


        {/* RIGHT */}
          {/* PROGRESS */}
          {showProgress && (
            <div className="ml-12 w-[520px]">
              <ProgressBar
                current={
                  currentProgress
                }
                total={
                  totalProgress
                }
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 md:gap-5">
          {/* EXP */}
          <ExpBadge
            value={exp}
            variant="light"
          />

          {/* PROFILE */}
          <ProfileCard
            name={name}
            level={level}
            avatar={avatar}
            variant="light"
          />
        </div>
      </div>
    </div>
  );
}