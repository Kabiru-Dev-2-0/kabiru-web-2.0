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

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backHref) {
      router.push(backHref);
      return;
    }
    router.back();
  };

  return (
    <div className="left-0 w-full 
        fixed top-0 z-50 py-4 px-2 sm:px-6  backdrop-blur-sm
        md:absolute md:top-6 md:z-20 md:py-0 md:px-10 md:bg-transparent md:backdrop-blur-none md:shadow-none md:border-none
        transition-all duration-300">
      {/* CONTAINER */}
      <div className="max-w-[1200px] mx-auto flex flex-row items-center justify-between gap-1 sm:gap-4 w-full">
        
        {/* ================= LEFT SECTION ================= */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 w-auto">
          
          {/* BACK BUTTON */}
          {showBack && (
            <>
              {/* MOBILE */}
              <div className="flex md:hidden h-[50px] sm:h-[60px] items-center">
                <GameButton
                  onClick={handleBack}
                  variant="yellow"
                  className="!h-full aspect-square !w-auto !p-0 flex justify-center items-center"
                  icon={
                    <img src="/imageAssets/sd/icon-arrow-left-big.png" alt="back" className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0" />
                  }
                />
              </div>

              {/* DESKTOP */}
              <div className="hidden md:flex h-[60px] sm:h-[70px] items-center">
                <GameButton
                  onClick={handleBack}
                  variant="yellow"
                  size="lg"
                  className="!h-full"
                  icon={
                    <img src="/imageAssets/sd/icon-arrow-left-big.png" alt="back" className="w-8 h-8 object-contain shrink-0" />
                  }>
                  KEMBALI
                </GameButton>
              </div>
            </>
          )}

          {/* PROGRESS BAR */}
          {showProgress && (
            <div className="flex items-center w-[120px] sm:w-[200px] md:w-[300px] lg:w-[400px] xl:w-[500px]">
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

        {/* ================= RIGHT SECTION ================= */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 w-auto justify-center">
          
          {/* EXP BADGE */}
          <div className="h-[60px] sm:h-[70px] flex items-center">
            <ExpBadge value={exp} variant="light" size="lg" className="h-full" />
          </div>

          {/* PROFILE CARD */}
          <div className="h-[60px] sm:h-[70px] flex items-center">
            <ProfileCard name={name} level={level} avatar={avatar} variant="light" className="py-4 sm:py-5" />
          </div>
          
        </div>
      </div>
    </div>
  );
}