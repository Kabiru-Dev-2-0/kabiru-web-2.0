"use client";

import {
  useEffect,
  useState,
} from "react";

type StepType = {
  id: number;
  text: string;
};

type Props = {
  exercise: any;

  setCheckAnswer?: (
    fn: () => void
  ) => void;

  setResetExercise?: (
    fn: () => void
  ) => void;

  onAnswerResult?: (
    isCorrect: boolean
  ) => void;

  onStateChange?: (
    ready: boolean
  ) => void;
};

export default function CodeDebuggerExercise({
  exercise,
  setCheckAnswer,
  setResetExercise,
  onAnswerResult,
  onStateChange,
}: Props) {
  // =====================================
  // DATA
  // =====================================
  const steps: StepType[] =
    exercise?.data?.steps || [];

  const correctRemovedIds: number[] =
    exercise?.data
      ?.correct_removed_ids || [];

  // =====================================
  // STATE
  // =====================================
  const [
    selectedIds,
    setSelectedIds,
  ] = useState<number[]>([]);

  const [
    removedIds,
    setRemovedIds,
  ] = useState<number[]>([]);

  useEffect(() => {
    onStateChange?.(
      removedIds.length > 0
    );
  }, [removedIds]);

  // =====================================
  // RESET
  // =====================================
  useEffect(() => {
    const reset = () => {
      setSelectedIds([]);
      setRemovedIds([]);
    };

    setResetExercise?.(() => reset);
  }, [setResetExercise]);

  // =====================================
  // TOGGLE STEP
  // =====================================
  function toggleStep(
    id: number
  ) {
    // tidak bisa pilih step yang sudah dihapus
    if (removedIds.includes(id)) {
      return;
    }

    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter(
          (item) => item !== id
        );
      }

      return [...prev, id];
    });
  }

  // =====================================
  // REMOVE SELECTED
  // =====================================
  function handleRemove() {
    if (
      selectedIds.length === 0
    ) {
      return;
    }

    setRemovedIds((prev) => [
      ...prev,
      ...selectedIds,
    ]);

    // reset selection
    setSelectedIds([]);
  }

  // =====================================
  // CHECK ANSWER
  // =====================================
  function checkAnswerInternal() {
    const sortedRemoved = [
      ...removedIds,
    ].sort((a, b) => a - b);

    const sortedCorrect = [
      ...correctRemovedIds,
    ].sort((a, b) => a - b);

    const isCorrect =
      JSON.stringify(
        sortedRemoved
      ) ===
      JSON.stringify(
        sortedCorrect
      );

    onAnswerResult?.(
      isCorrect
    );
  }

  // =====================================
  // REGISTER CHECK FUNCTION
  // =====================================
  useEffect(() => {
    if (setCheckAnswer) {
      setCheckAnswer(
        () => checkAnswerInternal
      );
    }
  }, [removedIds]);

  // =====================================
  // FILTER VISIBLE STEPS
  // =====================================
  const visibleSteps =
    steps.filter(
      (step) =>
        !removedIds.includes(
          step.id
        )
    );

  return (
    <div className="pb-32">
      {/* ================= STEPS ================= */}
      <div
        data-tutorial="step-list"
        className="
          flex
          flex-col
          gap-4
          items-center
        "
      >
        {visibleSteps.map(
          (
            step: StepType,
            index: number
          ) => {
            const isSelected =
              selectedIds.includes(
                step.id
              );

            return (
              <button
                key={step.id}
                onClick={() =>
                  toggleStep(step.id)
                }
                className={`
                  w-full
                  max-w-[1000px]

                  rounded-[12px]

                  px-6
                  py-4

                  flex
                  items-center

                  text-left

                  transition-all

                  ${
                    isSelected
                      ? "bg-rose-50 border-[6px] border-rose-800"
                      : "bg-white"
                  }
                `}
              >
                {/* NUMBER */}
                <div
                  className="
                    font-bold
                    text-[14px]
                    md:text-[20px]
                    text-[#1D1D1D]

                    min-w-[28px]
                  "
                >
                  {index + 1}.
                </div>

                {/* TEXT */}
                <div
                  className="
                    font-semibold
                    text-[14px]
                    md:text-[20px]
                    text-gray-900
                  "
                >
                  {step.text}
                </div>
              </button>
            );
          }
        )}
      </div>

      {/* ================= BUTTON LABEL ================= */}
      <div
        data-tutorial="remove-button"
        className="
          flex
          flex-col
          items-center

          mt-8
        "
      >
        <button
          onClick={handleRemove}
          disabled={
            selectedIds.length === 0
          }
          className={`
            bg-rose-800

            rounded-[12px]

            px-16
            py-4

            font-semibold
            tracking-wide
            text-[16px]
            md:text-[20px]
            text-white

            ${
              selectedIds.length === 0
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
          `}
        >
          Hapus
        </button>

        <div
          className="
            mt-4

            text-gray-300
            text-[14px]
            md:text-[16px]
          "
        >
          *(Klik untuk menghapus langkah)
        </div>
      </div>
    </div>
  );
}