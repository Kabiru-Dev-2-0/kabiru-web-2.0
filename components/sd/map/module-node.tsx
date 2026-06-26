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
      className="flex flex-col items-center cursor-pointer shrink-0 w-[160px]"
    >
      {/* ================= WRAPPER ================= */}
      <div className="relative flex items-center justify-center pt-8">

        {/* ================= NUMBER BADGE ================= */}
        <div
          className={`
            absolute
            top-2
            w-[50px]
            h-[50px]
            rounded-full
            flex items-center justify-center
            text-white font-bold text-xl
            shadow-md
            z-10
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
            className="absolute top-[46px] w-[24px] h-[24px] z-10"
          />
        )}

        {/* ================= CIRCLE ================= */}
        <div
          className={`
            w-[180px]
            h-[180px]
            rounded-full
            flex items-center justify-center
            border-[8px]
            shadow-md
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
              w-[80%]
              h-[80%]
              object-contain
              ${isLocked ? 'grayscale opacity-60' : ''}
            `}
            alt={title}
          />

          {/* LOCK ICON */}
          {isLocked && (
            <img
              src="/imageAssets/sd/map/icon/icon-locked-circle-mini.png"
              alt="locked"
              className="absolute w-[36px] h-[36px] opacity-90"
            />
          )}
        </div>
      </div>

      {/* ================= TITLE ================= */}
      <div
        className={`
          mt-2
          text-center
          font-semibold
          text-lg
          leading-tight
          text-white

          h-[48px]
          flex items-start justify-center
          ${isLocked ? 'text-white/50' : 'text-white'}
        `}
      >
        {title}
      </div>
    </div>
  );
}