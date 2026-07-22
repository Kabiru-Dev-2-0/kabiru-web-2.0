"use client";

import { Check, X } from "lucide-react";
import { useEffect } from "react";

type AnswerFeedbackProps = {
  open: boolean;
  status: "correct" | "wrong";
  duration?: number;
  onFinish?: () => void;
};

export default function AnswerFeedback({
  open,
  status,
  duration = 1500,
  onFinish,
}: AnswerFeedbackProps) {
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onFinish?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [open, duration, onFinish]);

  if (!open) return null;

  const isCorrect = status === "correct";

  return (
    <div
      className="
        absolute inset-0 z-50
        flex items-center justify-center
        animate-in fade-in duration-300
      "
    >
      {/* Overlay */}
      <div
        className={`
          absolute inset-0
          ${
            isCorrect
              ? "bg-emerald-950/85"
              : "bg-red-950/85"
          }
        `}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center">
        {/* Icon */}
        <div className="mb-6">
          {isCorrect ? (
            <Check
              size={120}
              strokeWidth={5}
              className="text-white"
            />
          ) : (
            <X
              size={120}
              strokeWidth={5}
              className="text-white"
            />
          )}
        </div>

        {/* Title */}
        <h2
          className="
            text-white
            text-3xl
            md:text-6xl
            font-black
            tracking-wide
            drop-shadow-lg
          "
        >
          {isCorrect ? "YEAYYY" : "SALAH!"}
        </h2>

        {/* Description */}
        <p
          className="
            mt-2
            text-center
            text-white/90
            text-base
            md:text-lg
          "
        >
          {isCorrect
            ? "Selamat! Jawaban kamu benar."
            : "Jawaban kamu belum tepat. Yuk, coba lagi!"}
        </p>
      </div>
    </div>
  );
}