"use client";

import GameButton from "@/components/sd/game-button";

type Props = {
  title: string;

  description: string;

  currentStep: number;

  totalSteps: number;

  placement?: "top" | "bottom" | "left" | "right";

  targetRect: DOMRect;

  onNext: () => void;

  onSkip: () => void;

  isLast?: boolean;
};

export default function TutorialBubble({
  title,
  description,
  currentStep,
  totalSteps,
  placement = "bottom",
  targetRect,
  onNext,
  onSkip,
  isLast = false,
}: Props) {
  const bubbleWidth = 420;
  const bubbleHeight = 220;

  let top = 0;
  let left = 0;

  switch (placement) {
    case "top":
      top = targetRect.top - bubbleHeight - 20;

      left = targetRect.left + targetRect.width / 2 - bubbleWidth / 2;
      break;

    case "bottom":
      top = targetRect.bottom + 20;

      left = targetRect.left + targetRect.width / 2 - bubbleWidth / 2;
      break;

    case "left":
      top = targetRect.top + targetRect.height / 2 - bubbleHeight / 2;

      left = targetRect.left - bubbleWidth - 20;
      break;

    case "right":
      top = targetRect.top + targetRect.height / 2 - bubbleHeight / 2;

      left = targetRect.right + 20;
      break;
  }
  const margin = 20;

  left = Math.max(
    margin,
    Math.min(left, window.innerWidth - bubbleWidth - margin),
  );

  top = Math.max(
    margin,
    Math.min(top, window.innerHeight - bubbleHeight - margin),
  );
  return (
    <div
      className="
        fixed
        z-[100000]
      "
      style={{
        top,
        left,
        width: bubbleWidth,
      }}>
      <div
        className="
          bg-amber-500
          rounded-[24px]
          shadow-xl

          p-5
        ">
        {/* TITLE */}
        <h3
          className="
            text-white
            text-[20px]
            font-black
            mb-2
          ">
          {title}
        </h3>

        {/* DESC */}
        <p
          className="
            text-gray-100
            text-[16px]
            font-medium
            leading-relaxed
          ">
          {description}
        </p>

        {/* FOOTER */}
        <div
          className="
            mt-5

            flex
            items-center
            justify-between
          ">
          <span
            className="
              text-white
              font-bold
            ">
            {currentStep}/{totalSteps}
          </span>

          <div className="flex gap-2">
            <GameButton variant="gray" size="sm" onClick={onSkip}>
              Lewati
            </GameButton>

            <GameButton variant="blue" size="sm" onClick={onNext}>
              {isLast ? "Selesai" : "Selanjutnya"}
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
}
