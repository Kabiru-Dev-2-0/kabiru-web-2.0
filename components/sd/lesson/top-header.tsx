"use client";

import ExpBadge from "@/components/sd/exp-badge";
import ProfileCard from "@/components/sd/profile-card";
import ProgressBar from "@/components/sd/progress-bar";
import GameButton from "@/components/sd/game-button";

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
  onBack?: () => void;
  backHref?: string;
  showProgressNavigation?: boolean;
  onProgressPrevious?: () => void;
  onProgressNext?: () => void;
  progressPreviousDisabled?: boolean;
  progressNextDisabled?: boolean;
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
  onBack,
  backHref,
  showProgressNavigation = false,
  onProgressPrevious,
  onProgressNext,
  progressPreviousDisabled = false,
  progressNextDisabled = false,
}: Props) {
  const router = useRouter();

  return (
    <div className="absolute top-3 sm:top-4 md:top-6 left-0 w-full z-20 px-3 sm:px-6 md:px-10">
      {/* CONTAINER */}
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* LEFT SECTION */}
        <div className="flex flex-wrap items-center gap-8 sm:gap-12 md:gap-16 w-full sm:w-auto">
          {/* BACK BUTTON */}
          {showBack && (
            <GameButton
              onClick={() => {
                if (onBack) {
                  onBack();
                  return;
                }

                if (backHref) {
                  router.push(backHref);
                  return;
                }

                router.back();
              }}
              variant="yellow"
              size="lg"
              icon={
                <img
                  src="/imageAssets/sd/icon-arrow-left-big.png"
                  alt="back"
                  className="
                    w-5 h-5 sm:w-6 sm:h-6 md:w-10 md:h-10
                    object-contain shrink-0
                  "
                />
              }
              className="py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 text-sm sm:text-base md:text-lg">
              KEMBALI
            </GameButton>
          )}

          {/* PROGRESS BAR */}
          {showProgress && (
            <div className="w-full sm:w-[200px] md:w-[300px] lg:w-[400px] xl:w-[500px] flex-1 min-w-[120px]">
              <ProgressBar
                current={currentProgress}
                total={totalProgress}
                onPrev={onProgressPrevious}
                onNext={onProgressNext}
                canPrev={!progressPreviousDisabled}
                canNext={!progressNextDisabled}
                showChevrons={showProgressNavigation}
              />
            </div>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-end gap-1 sm:gap-2 md:gap-3 w-full sm:w-auto justify-end">
          {/* EXP BADGE */}
          <ExpBadge value={exp} variant="light" size="lg"/>

          {/* PROFILE CARD */}
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
