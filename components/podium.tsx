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
}

const PodiumCard = ({ rank, name, exp, color, height }: PodiumCardProps) => {
  const colorClasses = {
    success: "bg-[#17C964] shadow-[0px_4px_6px_-2px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(23,201,100,0.4)]",
    warning: "bg-[#F5A524] shadow-[0px_4px_6px_-2px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(245,165,36,0.4)]",
    danger: "bg-[#F31260] shadow-[0px_4px_6px_-2px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(243,18,96,0.4)]",
  };

  const heightClasses = {
    tall: "pt-[60px] pb-[40px]",
    medium: "pt-[40px] pb-[20px]",
    short: "pt-[40px] pb-[20px]",
  };

  const heightOrder = {
    tall: 1,
    medium: 0,
    short: 2,
  };

  const trophyColor = {
    success: "#9E9E9E",
    warning: "#F5A524",
    danger: "#FF6E04",
  };

  const avatarBorder = {
    success: "border-4 border-[#17C964]",
    warning: "border-4 border-[#F5A524]",
    danger: "border-4 border-[#F31260]",
  };

  return (
    <div
      className="flex flex-col items-center gap-[8px]"
      style={{ order: heightOrder[height], width: "145px" }}
    >
      {/* Trophy & Avatar - positioned above card */}
      <div className="relative flex flex-col items-center -mb-[69px] z-10">
        {/* Trophy Icon */}
        <div className="relative w-[32px] h-[32px] mb-[10px] bg-white rounded-full flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M0.04 0L31.95 0C31.95 7.43 26.23 13.56 18.84 14.45V18.26H23.87V23.29H18.84V32H13.07V23.29H8.04V18.26H13.07V14.45C5.68 13.56 -0.04 7.43 0.04 0Z"
              fill={trophyColor[color]}
            />
          </svg>
          <span className="absolute text-xs text-center font-normal text-white" style={{ top: "1.28px" }}>
            {rank}
          </span>
        </div>
        {/* Avatar */}
        <Avatar
          src="/api/placeholder/56/56"
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
  firstPlace: { name: string; exp: number };
  secondPlace: { name: string; exp: number };
  thirdPlace: { name: string; exp: number };
}

export const Podium = ({ firstPlace, secondPlace, thirdPlace }: PodiumProps) => {
  return (
    <div className="flex justify-center items-end gap-[24px] h-[220px]">
      <PodiumCard
        rank={2}
        name={secondPlace.name}
        exp={secondPlace.exp}
        color="success"
        height="short"
      />
      <PodiumCard
        rank={1}
        name={firstPlace.name}
        exp={firstPlace.exp}
        color="warning"
        height="tall"
      />
      <PodiumCard
        rank={3}
        name={thirdPlace.name}
        exp={thirdPlace.exp}
        color="danger"
        height="short"
      />
    </div>
  );
};

