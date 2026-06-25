"use client";

type Props = {
  value?: number;
  variant?: "default" | "light";
};

export default function ExpBadge({
  value = 0,
  variant = "default",
}: Props) {
  const isLight = variant === "light";

  return (
    <div className="relative flex items-center">
      {/* ICON */}
      <div className="absolute -left-6 z-20 h-16 w-16 md:h-20 md:w-20">
        <img
          src="/imageAssets/sd/map/icon/icon-exp.png"
          alt="exp"
          className="h-full w-full object-contain"
        />
      </div>

      {/* BODY */}
      <div
        className={`
          relative flex items-center justify-end rounded-full
          border-[4px] pl-16 pr-6 py-4
          ${
            isLight
              ? "bg-slate-100 border-slate-100 text-gray-800"
              : "bg-[#4B2A6B] border-white text-white"
          }
        `}
      >
        <span className="text-lg font-black md:text-2xl">
          {value ?? 0}
        </span>
      </div>
    </div>
  );
}