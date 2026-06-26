"use client";

type Props = {
  current: number;
  total: number;
};

export default function ProgressBar({
  current,
  total,
}: Props) {
  // =========================
  // PERCENTAGE
  // =========================
  const percentage =
    total === 0
      ? 0
      : (current / total) * 100;

  // =========================
  // SAFE POSITION ROBOT
  // =========================
  const safePercentage =
    Math.min(
      Math.max(percentage, 6),
      94
    );

  return (
    <div
      className="
        flex
        items-center
        gap-4

        w-full
        max-w-[520px]
      "
    >
      {/* BAR */}
      <div
        className="
          relative

          flex-1
          h-[24px]

          rounded-full

          overflow-visible
        "
      >
        {/* BACKGROUND BAR */}
        <div
          className="
            absolute
            inset-0

            rounded-full

            bg-slate-200/50
          "
        />

        {/* GREEN FILL */}
        <div
          className="
            absolute
            left-0
            top-0

            h-full

            rounded-full

            bg-[#00B588]

            transition-all
            duration-500
          "
          style={{
            width: `${percentage}%`,
          }}
        />

        {/* ROBOT */}
        <div
          className="
            absolute
            top-1/2

            w-[58px]
            h-[58px]

            transition-all
            duration-500

            z-20
          "
          style={{
            left: `${safePercentage}%`,
            transform:
              "translate(-50%, -50%)",
          }}
        >
          <img
            src="/imageAssets/sd/robot-progress.png"
            alt="progress"
            className="
              w-full
              h-full
              object-contain
            "
          />
        </div>
      </div>

      {/* TEXT */}
      <div
        className="
          mr-8
          text-white
          font-black
          text-[20px]
          whitespace-nowrap
        "
      >
        {current}/{total}
      </div>
    </div>
  );
}