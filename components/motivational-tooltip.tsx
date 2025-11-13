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
    <div
      className={`relative flex flex-col-reverse items-center gap-4 w-fit`}
    >
      {imageUrl && (
        <div className="relative self-center">
          <Image
            src={imageUrl}
            alt="Motivational"
            width={position === "left" ? 187 : 100}
            height={position === "left" ? 246 : 100}
            className="object-contain"
          />
        </div>
      )}

      {/* Tooltip bubble */}
      <div className="relative">
        <Card
          className="bg-[#006FEE] shadow-[0px_4px_6px_-2px_rgba(0,0,0,0.05),0px_10px_15px_-3px_rgba(0,112,243,0.4)] max-w-[200px]"
          radius="lg"
        >
          <div className="p-[4px_12px]">
            <p className="text-bas text-sm text-white text-center whitespace-pre-line">
              {message}
            </p>
          </div>
        </Card>

        {/* Arrow bawah menunjuk ke robot */}
        <div
          className="absolute left-1/2 -bottom-1.8 -translate-x-1/2 w-0 h-0 
                     border-l-[8px] border-l-transparent 
                     border-r-[8px] border-r-transparent 
                     border-t-[8px] border-t-[#006FEE]"
          style={{
            filter:
              "drop-shadow(0px 0px 1px rgba(0,0,0,0.3)) drop-shadow(0px 2px 10px rgba(0,0,0,0.06)) drop-shadow(0px 0px 5px rgba(0,0,0,0.02))",
          }}
        />
      </div>
    </div>
  );
};
