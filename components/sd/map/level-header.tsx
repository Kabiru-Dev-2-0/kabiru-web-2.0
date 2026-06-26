"use client";

import ExpBadge from "@/components/sd/exp-badge";
import ProfileCard from "@/components/sd/profile-card";

import { useGameStore } from "@/store/game-store";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  name: string;

  level: string;

  avatar: string;

  exp: number;

  showBack?: boolean;
};

export default function TopHeader({
  name,
  level,
  avatar,
  exp,
  showBack = false,
}: Props) {
  const router = useRouter();

  return (
    <div className="absolute top-6 left-0 w-full z-20 px-4 md:px-10">
      {/* CONTAINER */}
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        {/* LEFT */}
        {showBack && (
          <button
            onClick={() =>
              router.back()
            }
            className="
                        flex items-center gap-3
                        bg-gradient-to-r from-yellow-400 to-orange-400
                        text-white font-black
                        px-4 md:px-6
                        py-2 md:py-5
                        rounded-full
                        whitespace-nowrap
                        cursor-pointer
                        "
          >
            {/* ICON */}
            <img
              src="/imageAssets/sd/icon-arrow-left-big.png"
              alt="back"
              className="w-4 h-4 md:w-8 md:h-8 object-contain"
            />

            {/* TEXT */}
            <span className="text-2xl md:text-2xl">
              KEMBALI
            </span>
          </button>
        )}
        {/* EXP */}
          <ExpBadge
            value={exp}
            variant="default"
          />

        {/* RIGHT */}
        <div className="flex items-center gap-3 md:gap-5">
          <ProfileCard
            name={name}
            level={level}
            avatar={avatar}
            variant="default"
          />
        </div>
      </div>
    </div>
  );
}