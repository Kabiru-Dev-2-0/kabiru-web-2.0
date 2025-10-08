"use client";

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import Image from "next/image";

interface LearningPathCardProps {
  title: string;
  description: string;
  modules: number;
  imageUrl?: string;
  icon: string;
  buttonText: string;
  progress?: number;
  isStarted?: boolean;
}

export const LearningPathCard = ({
  title,
  description,
  modules,
  imageUrl,
  icon,
  buttonText,
  progress,
  isStarted = false,
}: LearningPathCardProps) => {
  return (
    <Card
      className="w-full border border-[#F4F4F5] shadow-sm bg-white"
      radius="lg"
    >
      <CardBody className="p-4 gap-4">
        {/* Header Section */}
        <div className="flex flex-col gap-0.5 px-3 pt-3">
          <span className="text-xs font-bold leading-4 text-[#11181C] opacity-60">
            Learning Path
          </span>
          <span className="text-xs font-medium leading-4 text-[#11181C] opacity-50">
            {modules} modul
          </span>
        </div>

        <h3 className="text-2xl font-bold leading-8 text-[#11181C] px-3">
          {title}
        </h3>

        {/* Image Section */}
        <div className="w-full h-[230px] bg-gradient-to-br from-blue-400 to-teal-500 rounded-lg flex items-center justify-center text-8xl">
          {icon}
        </div>

        {/* Footer Section */}
        <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-0 border-t border-[rgba(17,17,17,0.15)]">
          <p className="text-xs font-medium leading-4 text-[#11181C] flex-1">
            {description}
          </p>
          <Button
            color="primary"
            radius="full"
            size="sm"
            className="px-3 h-8"
          >
            {buttonText}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

