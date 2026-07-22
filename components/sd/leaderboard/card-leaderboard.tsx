"use client";

import { useEffect, useState } from "react";

type Props = {
  rank: number;
  previousRank?: number;
  name: string;
  exp: number;
  avatar: string;
  isCurrentUser?: boolean;
  noShadow?: boolean;
};

export default function CardLeaderboard({
  rank,
  previousRank,
  name,
  exp,
  avatar,
  isCurrentUser = false,
  noShadow = false,
}: Props) {
  const [animate, setAnimate] =
    useState(false);

  useEffect(() => {
    if (
      previousRank &&
      previousRank > rank
    ) {
      setAnimate(true);

      const timer =
        setTimeout(() => {
          setAnimate(false);
        }, 1500);

      return () =>
        clearTimeout(timer);
    }
  }, [rank, previousRank]);

  return (
    <div
      className={`
        flex
        items-center

        rounded-[16px]
        sm:rounded-[18px]
        lg:rounded-[20px]

        px-3
        sm:px-5
        lg:px-8

        py-3
        sm:py-4

        transition-all
        duration-700

        ${
          animate
            ? "-translate-y-4 lg:-translate-y-10 scale-105"
            : ""
        }

        ${
          isCurrentUser
          ? `bg-[#E8D9FF] ${
              noShadow
                ? ""
                : "shadow-[0_-8px_20px_rgba(0,0,0,0.20)]"
            }`
          : "bg-[#F7F3E6]"
        }
      `}
    >
      {/* RANK */}
      <div
        className={`
          w-[42px]
          h-[42px]

          sm:w-[52px]
          sm:h-[52px]

          lg:w-[60px]
          lg:h-[60px]

          text-[18px]
          sm:text-[22px]
          lg:text-[24px]

          shrink-0

          rounded-full

          flex
          items-center
          justify-center

          font-black

          ${
            isCurrentUser
              ? "bg-[#D5B5FF] text-[#8E3CFF]"
              : "bg-[#FFE27A] text-[#FF9D00]"
          }
        `}
      >
        {rank}
      </div>

      {/* AVATAR */}
      <div
        className="
          ml-3
          sm:ml-5
          lg:ml-8

          w-[42px]
          h-[42px]

          sm:w-[52px]
          sm:h-[52px]

          lg:w-[60px]
          lg:h-[60px]

          shrink-0
          rounded-full
          overflow-hidden
        "
      >
        <img
          src={avatar}
          className="
            w-full
            h-full
            object-cover
          "
        />
      </div>

      {/* NAME */}
      <div
        className="
          flex-1
          text-[#2A3042]
          font-black
          ml-3
          sm:ml-5
          lg:ml-8

          text-[16px]
          sm:text-[18px]
          lg:text-[22px]

          leading-tight
          truncate
        "
      >
        {name}

        {isCurrentUser &&
          " (Kamu)"}
      </div>

      {/* EXP */}
      <div
        className="
          w-[56px]
          sm:w-[72px]
          lg:w-[90px]

          rounded-[10px]
          sm:rounded-[12px]
          lg:rounded-[16px]

          py-2
          sm:py-2.5
          lg:py-3

          text-[14px]
          sm:text-[18px]
          lg:text-[22px]

          shrink-0

          bg-[#EDEDED]

          text-center

          text-[#FF9D00]
          font-black
        "
      >
        {exp}
      </div>
    </div>
  );
}