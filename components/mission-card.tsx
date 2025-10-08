"use client";

import { Card, CardBody } from "@heroui/card";
import { Progress } from "@heroui/progress";
import React from "react";

interface MissionCardProps {
  icon: React.ReactNode;
  title: string;
  progress: number;
  total: number;
}

export const MissionCard = ({ icon, title, progress, total }: MissionCardProps) => {
  const progressPercent = Math.round((progress / total) * 100);
  
  return (
    <Card
      className="w-full border border-[rgba(145,158,171,0.24)] shadow-sm bg-white"
      radius="lg"
    >
      <CardBody className="p-[14px_18px_20px] gap-[14px]">
        <div className="flex items-center gap-[10px]">
          <div className="flex items-center justify-center w-[42px] h-[42px]">
            {icon}
          </div>
          <Progress
            value={progressPercent}
            color="warning"
            size="md"
            radius="full"
            label={title}
            showValueLabel
            valueLabel={`${progressPercent}%`}
            classNames={{
              base: "flex-1",
              label: "text-base font-medium text-black",
              value: "text-base font-normal text-black",
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

