'use client';

import { useRouter } from 'next/navigation';

type ModuleNodeProps = {
  id_modul: number;
  title: string;
  image: string;
  state: 'done' | 'progress' | 'locked';
};

export default function ModuleNode({
  id_modul,
  title,
  image,
  state,
}: ModuleNodeProps) {
  const router = useRouter();

  const isDone = state === 'done';
  const isProgress = state === 'progress';
  const isLocked = state === 'locked';

  return (
    <div
      onClick={() => {
        if (!isLocked) {
          router.push(`/sd/eksplorasi/${id_modul}`);
        }
      }}
      className="
        flex flex-col items-center cursor-pointer 
        shrink-0 
        w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px]
        transition-all duration-300
        hover:scale-105 active:scale-95
      "
    >
      {/* ================= WRAPPER ================= */}
      <div className="relative flex items-center justify-center pt-6 sm:pt-8">

        {/* ================= NUMBER BADGE ================= */}
        <div
          className={`
            absolute top-1 sm:top-2
            w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] md:w-[50px] md:h-[50px]
            rounded-full flex items-center justify-center
            text-white font-bold 
            text-sm sm:text-base md:text-xl
            shadow-md z-10
            ${isLocked
              ? 'bg-gradient-to-br from-gray-300 to-gray-400'
              : 'bg-gradient-to-br from-yellow-300 to-orange-400'
            }
          `}
        >
          {id_modul}
        </div>

        {/* ================= CHECK ICON ================= */}
        {isDone && (
          <img
            src="/imageAssets/sd/map/icon/icon-check-circle-mini.png"
            alt="done"
            className="
              absolute 
              top-[32px] sm:top-[38px] md:top-[46px]
              w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] md:w-[24px] md:h-[24px]
              z-10
            "
          />
        )}

        {/* ================= CIRCLE ================= */}
        <div
          className={`
            w-[130px] h-[130px] 
            sm:w-[150px] sm:h-[150px] 
            md:w-[170px] md:h-[170px] 
            lg:w-[190px] lg:h-[190px]
            rounded-full flex items-center justify-center
            border-[6px] sm:border-[7px] md:border-[8px]
            shadow-md transition-all duration-300
            ${isDone
              ? 'border-green-400 bg-white'
              : isProgress
                ? 'border-yellow-400 bg-white'
                : 'border-gray-300 bg-gray-200'
            }
          `}
        >
          {/* IMAGE */}
          <img
            src={image || '/placeholder.png'}
            className={`
              w-[70%] h-[70%] sm:w-[75%] sm:h-[75%] md:w-[80%] md:h-[80%]
              object-contain transition-all duration-300
              ${isLocked ? 'grayscale opacity-60' : 'hover:scale-105'}
            `}
            alt={title}
          />

          {/* LOCK ICON */}
          {isLocked && (
            <img
              src="/imageAssets/sd/map/icon/icon-locked-circle-mini.png"
              alt="locked"
              className="
                absolute 
                w-[28px] h-[28px] 
                sm:w-[32px] sm:h-[32px] 
                md:w-[36px] md:h-[36px]
                opacity-90
              "
            />
          )}
        </div>
      </div>

      {/* ================= TITLE ================= */}
      <div
        className={`
          mt-2 sm:mt-3
          text-center font-semibold
          text-sm sm:text-base md:text-lg
          leading-tight
          h-[40px] sm:h-[44px] md:h-[48px]
          flex items-start justify-center
          px-1
          ${isLocked ? 'text-white/50' : 'text-white'}
        `}
      >
        <span className="line-clamp-2">{title}</span>
      </div>
    </div>
  );
}