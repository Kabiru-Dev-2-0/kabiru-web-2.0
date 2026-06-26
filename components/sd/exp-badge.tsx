"use client";

type Props = {
  value?: number;
  variant?: "default" | "light";
  className?: string;
  size?: "sm" | "md" | "lg"; 
  showLabel?: boolean;
};

export default function ExpBadge({
  value = 0,
  variant = "default",
  className = "",
  size = "md",
  showLabel = false,
}: Props) {
  const isLight = variant === "light";

  const sizes = {
    sm: {
      icon: "h-12 w-12 sm:h-14 sm:w-14",
      badge: "pl-12 pr-4 py-2.5",
      text: "text-base sm:text-lg",
      border: "border-[3px]",
    },
    md: {
      icon: "h-16 w-16 sm:h-18 sm:w-18 md:h-[78px] md:w-[78px]",
      badge: "pl-16 pr-5 py-3 sm:py-3.5",
      text: "text-lg sm:text-xl md:text-2xl",
      border: "border-[3px] sm:border-[4px]",
    },
    lg: {
      icon: "h-18 w-18 sm:h-[78px] sm:w-[78px] md:h-20 md:w-20",
      badge: "pl-18 pr-6 py-3.5 sm:py-4",
      text: "text-xl sm:text-2xl md:text-3xl",
      border: "border-[4px] sm:border-[4px] md:border-[5px]",
    },
  };

  const currentSize = sizes[size];

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* ICON */}
      <div className={`absolute -left-2 sm:-left-5 md:-left-4 z-20 ${currentSize.icon}`}>
        <img
          src="/imageAssets/sd/map/icon/icon-exp.png"
          alt="exp"
          className="h-full w-full object-contain drop-shadow-md"
        />
      </div>

      {/* BODY */}
      <div
        className={`
          relative flex items-center justify-end rounded-full
          ${currentSize.border}
          ${currentSize.badge}
          transition-all duration-200
          ${
            isLight
              ? "bg-slate-100 border-slate-100 text-gray-800"
              : "bg-[#4B2A6B]/90 border-white text-white"
          }
          backdrop-blur-sm
        `}
      >
        {/* Label */}
        {showLabel && (
          <span className="mr-2 text-xs sm:text-sm opacity-70">
            EXP
          </span>
        )}
        
        <span className={`font-black ${currentSize.text}`}>
          {value ?? 0}
        </span>
      </div>
    </div>
  );
}