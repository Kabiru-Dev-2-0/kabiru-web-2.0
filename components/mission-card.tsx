'use client';

import { Card, CardBody } from '@heroui/card';
import { Progress } from '@heroui/progress';
import { CheckmarkCircleColor } from '@fluentui/react-icons';
import { Button } from '@heroui/button';
import React from 'react';

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
        isDisabled ? 'opacity-50' : ''
      }`}
      radius="lg"
    >
      <CardBody className="p-[14px_18px_20px]">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex items-center justify-center w-[42px] h-[42px] flex-shrink-0">{icon}</div>

          {/* Title and Progress */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <span className="text-base font-medium text-black">{title}</span>
            {isClaimed ? (
              <div className="flex items-center gap-2">
                <CheckmarkCircleColor className="w-5 h-5 text-[#17C964] flex-shrink-0" />
                <span className="text-base font-semibold text-[#17C964]">SELESAI!</span>
              </div>
            ) : done ? (
              <div className="flex items-center gap-2">
                <Progress
                  value={100}
                  color="warning"
                  size="md"
                  radius="full"
                  classNames={{
                    base: 'flex-1',
                    track: 'bg-[#E5E7EB]',
                    indicator: 'bg-[#F97316]',
                  }}
                />
                <span className="text-sm font-normal text-black whitespace-nowrap">{fractionLabel}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Progress
                  value={progressPercent}
                  color="warning"
                  size="md"
                  radius="full"
                  classNames={{
                    base: 'flex-1',
                    track: 'bg-[#E5E7EB]',
                    indicator: 'bg-[#F97316]',
                  }}
                />
                <span className="text-sm font-normal text-black whitespace-nowrap">{fractionLabel}</span>
              </div>
            )}
          </div>

          {/* EXP Reward */}
          {expReward > 0 && (
            <div className="flex-shrink-0">
              <span className="text-base font-medium text-[#006FEE]">+{expReward} EXP</span>
            </div>
          )}

          {/* Claim Button */}
          {!isClaimed && (
            <div className="flex-shrink-0">
              <Button
                color="primary"
                size="sm"
                radius="md"
                className={`font-semibold ${
                  canClaim && !isDisabled
                    ? 'bg-[#006FEE] text-white'
                    : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                }`}
                isDisabled={!canClaim || isDisabled || isClaimLoading}
                isLoading={isClaimLoading}
                onPress={onClaim}
              >
                Terima
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
