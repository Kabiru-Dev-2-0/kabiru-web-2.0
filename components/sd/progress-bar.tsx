"use client";

type Props = {
  current: number;
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  showChevrons?: boolean;
};

export default function ProgressBar({
  current,
  total,
  onPrev,
  onNext,
  canPrev = false,
  canNext = false,
  showChevrons = false,
}: Props) {
  const percentage = total === 0 ? 0 : (current / total) * 100;

  const safePercentage = Math.min(Math.max(percentage, 6), 94);

  return (
    <div className="flex items-center gap-2 w-full max-w-[520px]">
      {/* CHEVRON KIRI */}
      {showChevrons && (
        <button
          onClick={canPrev ? onPrev : undefined}
          disabled={!canPrev}
          className={`
            flex-shrink-0
            w-9 h-9
            rounded-full
            flex items-center justify-center
            transition-all duration-200
            ${
              canPrev
                ? "bg-white/30 hover:bg-white/50 cursor-pointer"
                : "bg-white/10 cursor-not-allowed opacity-40"
            }
          `}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 12L6 8L10 4"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* BAR */}
      <div className="relative flex-1 h-[24px] rounded-full overflow-visible">
        {/* BACKGROUND BAR */}
        <div className="absolute inset-0 rounded-full bg-slate-200/50" />

        {/* GREEN FILL */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#00B588] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />

        {/* ROBOT */}
        <div
          className="absolute top-1/2 w-[58px] h-[58px] transition-all duration-500 z-20"
          style={{
            left: `${safePercentage}%`,
            transform: "translate(-50%, -50%)",
          }}>
          <img
            src="/imageAssets/sd/robot-progress.png"
            alt="progress"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* TEXT */}
      <div className="text-white font-black text-[20px] whitespace-nowrap">
        {current}/{total}
      </div>

      {/* CHEVRON KANAN */}
      {showChevrons && (
        <button
          onClick={canNext ? onNext : undefined}
          disabled={!canNext}
          className={`
            flex-shrink-0
            w-9 h-9
            rounded-full
            flex items-center justify-center
            transition-all duration-200
            ${
              canNext
                ? "bg-white/30 hover:bg-white/50 cursor-pointer"
                : "bg-white/10 cursor-not-allowed opacity-40"
            }
          `}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 4L10 8L6 12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
