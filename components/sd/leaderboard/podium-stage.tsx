"use client";

import { useEffect, useState } from "react";
import { IconFCrown } from "react-fluentui-emoji/lib/flat";

type Props = {
  rank: 1 | 2 | 3;

  name: string;

  exp: number;

  avatar: string;

  delay?: number;
};

export default function PodiumStage({
  rank,
  name,
  exp,
  avatar,
  delay = 0,
}: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const podiumHeight = {
    1: "h-[260px] sm:h-[300px] lg:h-[420px]",
    2: "h-[180px] sm:h-[180px] lg:h-[250px]",
    3: "h-[140px] sm:h-[150px] lg:h-[190px]",
  };

  const podiumNumber = {
    1: "1",
    2: "2",
    3: "3",
  };

  return (
    <div
      className={`
        flex
        flex-col
        items-center

        transition-all
        duration-700

        ${show ? "translate-y-0 opacity-100" : "translate-y-[300px] opacity-0"}
      `}>
      {/* AVATAR */}
      <div className="relative mb-2 sm:mb-3 lg:mb-4">
        {rank === 1 && (
            <IconFCrown
                size={72}
                className="
                absolute
                -top-14
                sm:-top-9
                lg:-top-12
                left-1/2
                -translate-x-1/2
                w-10
                h-10
                sm:w-14
                sm:h-14
                lg:w-[72px]
                lg:h-[72px]">
            </IconFCrown>
        )}

        <div
          className="
            w-[86px]
            h-[86px]

            sm:w-[90px]
            sm:h-[90px]

            lg:w-[120px]
            lg:h-[120px]

            border-[3px]
            lg:border-[4px]

            rounded-full
            border-white

            overflow-hidden
          ">
          <img
            src={avatar}
            className="
              w-full
              h-full
              object-cover
            "
          />
        </div>
      </div>

      {/* NAME */}
      <div
        className="
          text-white
          font-black
          text-[20px] sm:text-[22px] lg:text-[28px]
        ">
        {name}
      </div>

      {/* EXP */}
      <div
        className="
          flex
          items-center
          gap-2

          text-[#FFCC29]
          font-black
          text-[16px]
          sm:text-[18px]
          lg:text-[20px]

          mb-3
          sm:mb-4
          lg:mb-5
        ">
        <img 
          src="/imageAssets/sd/map/icon/icon-exp.png" 
          className="
          w-4 h-4
          sm:w-5 sm:h-5
          lg:w-6 lg:h-6
          " />

        {exp}
      </div>

      {/* PODIUM */}
      <div
        className={`
          w-[120px]
          sm:w-[160px]
          lg:w-[220px]
          ${podiumHeight[rank]}

          bg-gradient-to-b
          from-[#FFD83D]
          to-[#FFA500]

          flex
          items-center
          justify-center

          text-white
          font-black
          text-[48px]
          sm:text-[64px]
          lg:text-[90px]
        `}>
        {podiumNumber[rank]}
      </div>
    </div>
  );
}
