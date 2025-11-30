"use client";

import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import React from "react";

interface PodiumCardProps {
  rank: number;
  name: string;
  exp: number;
  color: "success" | "warning" | "danger";
  height: "tall" | "medium" | "short";
  avatarSrc?: string;
}

const trophyImages: Record<number, string> = {
  1: "/imageAssets/rank-1.png",
  2: "/imageAssets/rank-2.png",
  3: "/imageAssets/rank-3.png",
};

const PodiumCard = ({ rank, name, exp, color, height, avatarSrc }: PodiumCardProps) => {
  const colorClasses = {
    success: "bg-[#17C964] shadow-[0px_4px_6px_-2px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(23,201,100,0.4)]",
    warning: "bg-[#F5A524] shadow-[0px_4px_6px_-2px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(245,165,36,0.4)]",
    danger: "bg-[#F31260] shadow-[0px_4px_6px_-2px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(243,18,96,0.4)]",
  };

  const heightClasses = {
    tall: "pt-[60px] pb-[40px]",
    medium: "pt-[40px] pb-[20px]", // not used in this context
    short: "pt-[40px] pb-[20px]",
  };

  const avatarBorder = {
    success: "border-4 border-[#17C964]",
    warning: "border-4 border-[#F5A524]",
    danger: "border-4 border-[#F31260]",
  };

  // Pilih gambar trophy sesuai rank, kalau di luar 1-3 fallback ke null (tidak tampil)
  const trophyImgSrc = trophyImages[rank] || null;

  // Atur top offset avatar sesuai rank/height agar nempel pada kotaknya
  // Rank 1 (tall): avatar lebih floating (seperti semula)
  // Rank 2 & 3 (short): avatar lebih nempel ke kotak, lebih rendah letaknya
  let avatarContainerClass =
    "flex flex-col items-center z-10";
  let avatarContainerStyle: React.CSSProperties = { left: 0, right: 0, marginLeft: "auto", marginRight: "auto" };

  if (height === "tall") {
    // Rank 1
    avatarContainerClass += " absolute bottom-52 -mb-[69px]";
    // 'top-22' = lebih tinggi, -mb-[69px] jaga jarak ke kontainer card
  } else if (height === "short") {
    // Rank 2 & 3
    avatarContainerClass += " absolute bottom-36 -mb-[40px]";
    // top-[86px] lebih rendah biar avatar nempel ke kartu, -mb-[40px] agar tidak negatif terlalu jauh
    // angka px top disesuaikan supaya nempel dengan card
  } else {
    avatarContainerClass += " absolute bottom-52 -mb-[69px]";
  }

  return (
    <div
      className="flex flex-col items-center gap-[8px] relative"
      style={{ width: "145px" }}
    >
      {/* Trophy & Avatar - positioned above card */}
      <div className={avatarContainerClass} style={avatarContainerStyle}>
        {/* Trophy Icon pakai gambar */}
        {trophyImgSrc && (
          <div className="relative w-[42px] h-[42px] mb-[6px] flex items-center justify-center">
            <img
              src={trophyImgSrc}
              alt={`Trophy ${rank}`}
              className="w-[42px] h-[42px] object-contain"
            />
            {/* Removed rank number, only trophy image is shown */}
          </div>
        )}
        {/* Avatar */}
        <Avatar
          src={avatarSrc || "/imageAssets/avatar/default.png"}
          size="lg"
          radius="full"
          classNames={{
            base: `w-[56px] h-[56px] ${avatarBorder[color]} ring-2 ring-white`,
          }}
        />
      </div>

      {/* Card */}
      <Card
        className={`w-full ${colorClasses[color]}`}
        radius="lg"
      >
        <CardBody className={`${heightClasses[height]} flex flex-col items-center gap-[8px]`}>
          <span className="text-lg text-white text-center">{name}</span>
          {rank === 1 ? (
            <div className="flex items-center justify-center gap-[10px]">
              <span className="text-2xl font-extrabold text-white">{exp}</span>
            </div>
          ) : (
            <span className="text-2xl font-extrabold text-white">{exp}</span>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

interface PodiumProps {
  secondPlace: { name: string; exp: number; avatarSrc?: string };
  firstPlace: { name: string; exp: number; avatarSrc?: string };
  thirdPlace: { name: string; exp: number; avatarSrc?: string };
}

export const Podium = ({ firstPlace, secondPlace, thirdPlace }: PodiumProps) => {
  // Susun array untuk pemesanan podium:
  // Tall/Tinggi (biasanya juara 1) di tengah
  // Short/Medium di kiri (2) dan kanan (3)
  // Urutannya: [kiri, tengah, kanan] = [2, 1, 3]
  const podiums = [
    {
      ...secondPlace,
      rank: 2,
      color: "success" as const,
      height: "short" as const,
    },
    {
      ...firstPlace,
      rank: 1,
      color: "warning" as const,
      height: "tall" as const,
    },
    {
      ...thirdPlace,
      rank: 3,
      color: "danger" as const,
      height: "short" as const,
    }
  ];

  return (
    <div className="flex justify-center items-end gap-[24px] h-[240px]">
      {podiums.map((p, idx) => (
        <PodiumCard
          key={p.rank}
          rank={p.rank}
          name={p.name}
          exp={p.exp}
          color={p.color}
          height={p.height}
          avatarSrc={p.avatarSrc}
        />
      ))}
    </div>
  );
};
