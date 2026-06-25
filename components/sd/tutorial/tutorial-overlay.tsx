"use client";

import { useEffect, useState } from "react";

import GameButton from "@/components/sd/game-button";
import TutorialBubble from "./tutorial-bubble";

type TutorialStep = {
  target: string;

  title: string;

  description: string;

  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right";
};

type Props = {
  steps: TutorialStep[];
  onClose: () => void;
};

export default function TutorialOverlay({
  steps,
  onClose,
}: Props) {
  const [currentStep, setCurrentStep] =
    useState(0);

  const [rect, setRect] =
    useState<DOMRect | null>(
      null
    );

  const step =
    steps[currentStep];

  useEffect(() => {
    if (!step) return;

    const element =
      document.querySelector(
        `[data-tutorial="${step.target}"]`
      );

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setTimeout(() => {
      setRect(
        element.getBoundingClientRect()
      );
    }, 300);
  }, [step]);

  if (!step || !rect)
    return null;
  
  function nextStep() {
    if (
      currentStep <
      steps.length - 1
    ) {
      setCurrentStep(
        (prev) => prev + 1
      );

      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-[99999]">
        {/* DARK LAYER */}
        <div
        className="
            fixed
            inset-0
            pointer-events-none
            z-[99998]
        "
        >
        <svg
            width="100%"
            height="100%"
            className="absolute inset-0"
        >
            <defs>
            <mask id="tutorial-mask">
                <rect
                width="100%"
                height="100%"
                fill="white"
                />

                <rect
                x={rect.left - 12}
                y={rect.top - 12}
                width={rect.width + 24}
                height={rect.height + 24}
                rx="24"
                fill="black"
                />
            </mask>
            </defs>

            <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.65)"
            mask="url(#tutorial-mask)"
            />
        </svg>

        {/* BORDER */}
        <div
            className="
            absolute
            border-[4px]
            border-white
            rounded-[24px]
            "
            style={{
            top: rect.top - 12,
            left: rect.left - 12,
            width: rect.width + 24,
            height: rect.height + 24,
            }}
        />
        </div>

        <TutorialBubble
        title={step.title}
        description={step.description}
        placement={step.placement}
        targetRect={rect}
        currentStep={currentStep + 1}
        totalSteps={steps.length}
        isLast={
            currentStep ===
            steps.length - 1
        }
        onNext={nextStep}
        onSkip={onClose}
        />
    </div>
    );
}