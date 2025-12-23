"use client";

import { Card, CardBody } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { CheckmarkCircleColor } from "@fluentui/react-icons";
import React from "react";

interface MissionCardProps {
  icon: React.ReactNode;
  title: string;
  progress: number;
  total: number;
  done?: boolean;
  isClaimed?: boolean;
  expReward?: number;
  canClaim?: boolean;
  onClaim?: () => void;
  isClaimLoading?: boolean;
  isDisabled?: boolean;
}

export const MissionCard = ({
  icon,
  title,
  progress,
  total,
  done = false,
  isClaimed = false,
  expReward = 0,
  canClaim = false,
  onClaim,
  isClaimLoading = false,
  isDisabled = false,
}: MissionCardProps) => {
  const fractionLabel = `${progress}/${total}`;
  const progressPercent = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <Card
      className={`w-full border border-[rgba(145,158,171,0.24)] shadow-sm bg-white ${
        isDisabled ? "opacity-50" : ""
      }`}
      radius="lg"
    >
      <CardBody className="p-[14px_18px_20px]">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex items-center justify-center w-[42px] h-[42px] flex-shrink-0">
            {icon}
          </div>

          {/* Title and Progress */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <span className="text-base font-medium text-black">{title}</span>
            {isClaimed ? (
              <div className="flex items-center gap-2">
                <CheckmarkCircleColor className="w-5 h-5 text-[#17C964] flex-shrink-0" />
                <span className="text-base font-semibold text-[#17C964]">
                  SELESAI!
                </span>
              </div>
            ) : done ? (
              <div className="flex items-center gap-2">
                <Progress
                  value={100}
                  color="warning"
                  size="md"
                  radius="full"
                  classNames={{
                    base: "flex-1",
                    track: "bg-[#E5E7EB]",
                    indicator: "bg-[#F97316]",
                  }}
                />
                <span className="text-sm font-normal text-black whitespace-nowrap ml-1">
                  {fractionLabel}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Progress
                  value={progressPercent}
                  color="warning"
                  size="md"
                  radius="full"
                  classNames={{
                    base: "flex-1",
                    track: "bg-[#E5E7EB]",
                    indicator: "bg-[#F97316]",
                  }}
                />
                <span className="text-sm font-normal text-black whitespace-nowrap ml-1">
                  {fractionLabel}
                </span>
              </div>
            )}
          </div>

          {/* EXP Reward */}
          {expReward > 0 && (
            <div className="flex-shrink-0 mr-3">
              <span
                className="font-bold text-[#3674B5]"
                style={{ fontSize: 20 }}
              >
                +{expReward} EXP
              </span>
            </div>
          )}

          {/* Claim Button */}
          {!isClaimed && (
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={onClaim}
                disabled={!canClaim || isDisabled || isClaimLoading}
                className={`rounded-[10px] font-bold transition-all duration-200 ${
                  canClaim && !isDisabled
                    ? "bg-[#3577B8] text-white shadow-[0_3px_0_#265C91] hover:shadow-[0_2px_0_#265C91] active:shadow-[0_1px_0_#265C91] active:translate-y-[1px]"
                    : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                }`}
                style={{
                  fontFamily: "'Encode', sans-serif",
                  fontSize: 14,
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 16,
                  paddingRight: 16,
                }}
              >
                {isClaimLoading ? "Loading..." : "Terima"}
              </button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
