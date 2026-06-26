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
    1: "h-[420px]",
    2: "h-[250px]",
    3: "h-[190px]",
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
      <div className="relative mb-3">
        {rank === 1 && (
            <IconFCrown
                size={72}
                className="
                absolute
                -top-12
                left-1/2
                -translate-x-1/2">
            </IconFCrown>
        )}

        <div
          className="
            w-[120px]
            h-[120px]

            rounded-full

            border-[4px]
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
          text-[28px]
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
          text-[20px]

          mb-5
        ">
        <img src="/imageAssets/sd/map/icon/icon-exp.png" className="w-6 h-6" />

        {exp}
      </div>

      {/* PODIUM */}
      <div
        className={`
          w-[220px]
          ${podiumHeight[rank]}

          bg-gradient-to-b
          from-[#FFD83D]
          to-[#FFA500]

          flex
          items-center
          justify-center

          text-white
          font-black
          text-[90px]
        `}>
        {podiumNumber[rank]}
      </div>
    </div>
  );
}
