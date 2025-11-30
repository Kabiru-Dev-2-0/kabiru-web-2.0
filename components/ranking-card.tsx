"use client";

import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { ArrowUpRegular, ArrowDownRegular } from "@fluentui/react-icons";

interface RankingCardProps {
  rank: number;
  name: string;
  exp: number;
  trend: "up" | "down";
  isCurrentUser?: boolean;
  label?: string;
  avatarSrc?: string;
}

export const RankingCard = ({
  rank,
  name,
  exp,
  trend,
  isCurrentUser = false,
  label = 'EXP',
  avatarSrc,
}: RankingCardProps) => {
  // Style for isCurrentUser
  const isCurrentUserCardClass = isCurrentUser
    ? [
        "bg-white",
        "border-3 border-[#3674B5]",
        "shadow-[0px_6px_0px_0px_#3674B5]",
        "pl-2",
        "font-semibold",
      ].join(" ")
    : "bg-white border-2 border-[#E4E4E7] pl-4 font-semibold";

  // Badge for ranking for isCurrentUser
  const renderBadge = () => {
    if (isCurrentUser) {
      // badge warna E6F1FE, text #3674B5
      return (
        <span
          className="flex items-center justify-center rounded-full font-bold text-[#3674B5] bg-[#E6F1FE] w-[28px] h-[28px] border-none text-lg"
          style={{
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {rank}
        </span>
      );
    }
    // Default badge
    return (
      <Badge
        content={rank.toString()}
        size="lg"
        color="default"
        variant="flat"
        classNames={{
          badge:
            "flex items-center justify-center rounded-full text-[#71717A] bg-[#EEEEEF] w-[28px] h-[28px] border-none text-lg",
        }}
      >
        <div></div>
      </Badge>
    );
  };

  // Text color
  const nameTextClass = isCurrentUser ? "text-[#3674B5]" : "text-[#11181C]";
  const expValueClass = isCurrentUser ? "text-[#3674B5]" : "text-[#006FEE]";
  const expLabelClass = isCurrentUser
    ? "text-[#3674B5] opacity-60"
    : "text-[#D4D4D8]";

  // Card opacity logic
  const cardOpacity =
    !isCurrentUser && rank > 6
      ? rank === 7
        ? 0.7
        : rank === 8
          ? 0.5
          : 0.3
      : 1;

  return (
    <Card
      className={`w-full ${isCurrentUserCardClass} ${!isCurrentUser && "opacity-100"}`}
      radius="lg"
      style={{
        opacity: cardOpacity,
      }}
    >
      <CardBody className="p-0 flex-row items-center">
        {/* Ranking Badge */}
        <div className="flex items-center justify-center p-[14px] bg-white rounded-full">
          {renderBadge()}
        </div>

        {/* User Info */}
        <div className="flex-1 flex items-center justify-between gap-[32px] p-[8px_24px]">
          <div className="flex items-center gap-[24px]">
            <Avatar
              src={avatarSrc || '/imageAssets/avatar/default.png'}
              size="md"
              radius="full"
              classNames={{
                base: "w-[40px] h-[40px]",
              }}
            />
            <span className={`text-lg ${nameTextClass}`}>{name}</span>
          </div>

          {/* EXP & Trend */}
          <div className="flex items-center gap-[32px]">
            <div className="flex items-center gap-[8px]">
              <span className={`text-2xl font-extrabold ${expValueClass}`}>
                {exp}
              </span>
              <span className={`text-2xl font-extrabold ${expLabelClass}`}>
                {label}
              </span>
            </div>
            {trend === "up" ? (
              <ArrowUpRegular className="w-[24px] h-[24px] text-[#17C964]" />
            ) : (
              <ArrowDownRegular className="w-[24px] h-[24px] text-[#F31260]" />
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
