"use client";

import { useEffect, useState } from "react";

type Props = {
  rank: number;
  previousRank?: number;
  name: string;
  exp: number;
  avatar: string;
  isCurrentUser?: boolean;
};

export default function CardLeaderboard({
  rank,
  previousRank,
  name,
  exp,
  avatar,
  isCurrentUser = false,
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

        rounded-[20px]

        px-8
        py-4

        transition-all
        duration-700

        ${
          animate
            ? "-translate-y-10 scale-105"
            : ""
        }

        ${
          isCurrentUser
            ? "bg-[#E8D9FF] shadow-[0_-8px_20px_rgba(0,0,0,0.20)]"
            : "bg-[#F7F3E6]"
        }
      `}
    >
      {/* RANK */}
      <div
        className={`
          w-[60px]
          h-[60px]

          rounded-full

          flex
          items-center
          justify-center

          font-black
          text-[24px]

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
          ml-8
          w-[60px]
          h-[60px]
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
          ml-8
          text-[#2A3042]
          font-black
          text-[22px]
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
          w-[90px]

          rounded-[16px]

          bg-[#EDEDED]

          py-3

          text-center

          text-[#FF9D00]
          font-black
          text-[22px]
        "
      >
        {exp}
      </div>
    </div>
  );
}