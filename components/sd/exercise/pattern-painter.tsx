"use client";

import { useEffect, useState } from "react";

type Props = {
  exercise: any;

  setCheckAnswer?: (fn: () => void) => void;

  setResetExercise?: (fn: () => void) => void;

  onAnswerResult?: (
    isCorrect: boolean
  ) => void;

  onStateChange?: (
    ready: boolean
  ) => void;
};

export default function PatternPainterExercise({
  exercise,
  setCheckAnswer,
  setResetExercise,
  onAnswerResult,
  onStateChange,
}: Props) {
  // =====================================
  // DATA
  // =====================================
  const pairs = exercise?.data?.pairs || [];

  const options = exercise?.data?.options || [];

  const correctAnswer = exercise?.data?.correct_answer;

  // =====================================
  // STATE
  // =====================================
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  useEffect(() => {
  onStateChange?.(
    !!selectedAnswer
  );
}, [selectedAnswer]);

  // =====================================
  // RESET WHEN EXERCISE CHANGED
  // =====================================
  useEffect(() => {
    if (!setResetExercise) return;

    const resetFn = () => {
      setSelectedAnswer(null);
    };

    setResetExercise(() => resetFn);
  }, [setResetExercise]);


  // =====================================
  // CHECK ANSWER
  // =====================================
    function checkAnswerInternal() {
        const isCorrect =
            selectedAnswer ===
            correctAnswer;
        
        onAnswerResult?.(
            isCorrect
        );
    }

  // =====================================
  // SEND CHECK FUNCTION
  // =====================================
  useEffect(() => {
    if (setCheckAnswer) {
      setCheckAnswer(() => checkAnswerInternal);
    }
  }, [selectedAnswer, correctAnswer]);

  return (
    <div className="pb-32">
      {/* ================= PATTERN ================= */}
      <div
        data-tutorial="question-area"
        className="
          flex
          flex-col
          items-center
          gap-5
          mb-16
        ">
        {pairs.map((pair: any, index: number) => (
          <div
            key={`${pair.left}-${index}`}
            className="
                flex
                items-center
                gap-8
              ">
            {/* LEFT */}
            <div
              className="
                  w-[220px]

                  bg-purple-200

                  rounded-[20px]

                  py-5
                  px-6

                  text-center

                  font-semibold
                  text-[18px]
                  text-gray-900
                ">
              {pair.left}
            </div>

            {/* ARROW */}
            <div
              className="
                  text-white
                  text-[48px]
                  font-bold
                ">
              →
            </div>

            {/* RIGHT */}
            <div
              className="
                  w-[220px]

                  bg-blue-200

                  rounded-[20px]

                  py-5
                  px-6

                  text-center

                  font-semibold
                  text-[18px]
                  text-gray-900
                ">
              {pair.right}
            </div>
          </div>
        ))}

        {/* ================= LAST ROW ================= */}
        <div
          className="
            flex
            items-center
            gap-8
          ">
          {/* LEFT */}
          <div
            className="
              w-[220px]

              bg-purple-200

              rounded-[20px]

              py-5
              px-6

              text-center

              font-semibold
              text-[18px]
              text-gray-900
            ">
            {exercise?.data?.question_left}
          </div>

          {/* ARROW */}
          <div
            className="
              text-white
              text-[48px]
              font-bold
            ">
            →
          </div>

          {/* RIGHT */}
          <div
            className="
              w-[220px]

              bg-blue-200

              rounded-[20px]

              py-5
              px-6

              text-center

              font-bold
              text-[18px]
              text-[#1D1D1D]
            ">
            {selectedAnswer || "..."}
          </div>
        </div>
      </div>

      {/* ================= OPTIONS ================= */}
      <div
        data-tutorial="answer-options"
        className="
          flex
          justify-center
          gap-5
          flex-wrap
        ">
        {options.map((option: any, index: number) => {
          const isSelected = selectedAnswer === option.text;

          return (
            <button
              key={`${option.id}-${index}`}
              onClick={() => setSelectedAnswer(option.text)}
              className={`
          w-[230px]

          rounded-[20px]

          px-6
          py-7

          text-center

          font-bold

          transition-all

          ${isSelected ? "bg-[#FFB236] scale-105" : "bg-slate-50"}
        `}>
              <span className="mr-2">{option.id}.</span>

              {option.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
