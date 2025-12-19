'use client';

import { Card, CardBody } from '@heroui/card';
import { Progress } from '@heroui/progress';
import { CheckmarkCircleColor } from '@fluentui/react-icons';
import React from 'react';

interface MissionCardProps {
  icon: React.ReactNode;
  title: string;
  progress: number;
  total: number;
  done?: boolean;
}

export const MissionCard = ({ icon, title, progress, total, done }: MissionCardProps) => {
  const fractionLabel = `${progress}/${total}`;

  return (
    <Card className="w-full border border-[rgba(145,158,171,0.24)] shadow-sm bg-white" radius="lg">
      <CardBody className="p-[14px_18px_20px] gap-[14px]">
        <div className="flex items-center gap-[10px]">
          <div className="flex items-center justify-center w-[42px] h-[42px]">{icon}</div>
          {done ? (
            <div className="flex items-center gap-1">
              <CheckmarkCircleColor className="w-7 h-7" />
              <span className="text-xl font-extrabold text-[#17C964]">{fractionLabel}</span>
            </div>
          ) : (
            <Progress
              value={Math.round((progress / total) * 100)}
              color="warning"
              size="md"
              radius="full"
              label={title}
              showValueLabel
              valueLabel={fractionLabel}
              classNames={{
                base: 'flex-1',
                label: 'text-base font-medium text-black',
                value: 'text-base font-normal text-black',
              }}
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
};
