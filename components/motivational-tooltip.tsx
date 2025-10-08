"use client";

import { Card } from "@heroui/card";
import Image from "next/image";

interface MotivationalTooltipProps {
  message: string;
  imageUrl?: string;
  position?: "left" | "right";
}

export const MotivationalTooltip = ({
  message,
  imageUrl,
  position = "right",
}: MotivationalTooltipProps) => {
  return (
    <div className={`relative ${position === "left" ? "flex flex-row-reverse" : "flex"} items-start gap-4`}>
      {imageUrl && (
        <div className="relative">
          <Image
            src={imageUrl}
            alt="Motivational"
            width={position === "left" ? 187 : 196}
            height={position === "left" ? 246 : 225}
            className="object-contain"
          />
        </div>
      )}
      <div className={`relative ${position === "left" ? "mr-auto" : "ml-auto"}`}>
        <Card
          className="bg-[#006FEE] shadow-[0px_4px_6px_-2px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(0,112,243,0.4)] max-w-[250px]"
          radius="lg"
        >
          <div className="p-[4px_12px]">
            <p className="text-base text-white text-center whitespace-pre-line">
              {message}
            </p>
          </div>
        </Card>
        {/* Arrow */}
        <div
          className={`absolute ${
            position === "left"
              ? "left-full -translate-x-1/2"
              : "right-full translate-x-1/2"
          } top-[36px] w-0 h-0 border-[7px] border-transparent ${
            position === "left"
              ? "border-l-[#006FEE]"
              : "border-r-[#006FEE]"
          }`}
          style={{
            filter: "drop-shadow(0px 0px 1px rgba(0,0,0,0.3)) drop-shadow(0px 2px 10px rgba(0,0,0,0.06)) drop-shadow(0px 0px 5px rgba(0,0,0,0.02))",
          }}
        />
      </div>
    </div>
  );
};

