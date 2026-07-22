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
    <div className="pb-24 md:pb-32">
      {/* ================= PATTERN ================= */}
      <div
        data-tutorial="question-area"
        className="
          flex
          flex-col
          items-center
          gap-4 md:gap-5 mb-10 md:mb-16
        ">
        {pairs.map((pair: any, index: number) => (
          <div
            key={`${pair.left}-${index}`}
            className="
                flex
                items-center
                justify-center

                w-full

                gap-2
                sm:gap-4
                md:gap-6
                lg:gap-8
              ">
            {/* LEFT */}
            <div
              className="
                  w-[120px]
                  sm:w-[150px]
                  md:w-[180px]
                  lg:w-[220px]

                  h-[88px]sm:h-[96px]md:min-h-[76px]md:h-auto

                  flex
                  items-center
                  justify-center

                  px-3
                  sm:px-4
                  md:px-5
                  lg:px-6

                  py-3
                  md:py-4
                  lg:py-5

                  text-[14px]
                  sm:text-[15px]
                  md:text-[16px]
                  lg:text-[18px]

                  leading-snug
                  break-words

                  bg-purple-200

                  rounded-[16px]
                  md:rounded-[20px]

                  text-center

                  font-semibold
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
                  w-[120px]
                  sm:w-[150px]
                  md:w-[180px]
                  lg:w-[220px]

                  h-[88px]sm:h-[96px]md:min-h-[76px]md:h-auto

                  flex
                  items-center
                  justify-center

                  px-3
                  sm:px-4
                  md:px-5
                  lg:px-6

                  py-3
                  md:py-4
                  lg:py-5

                  text-[14px]
                  sm:text-[15px]
                  md:text-[16px]
                  lg:text-[18px]

                  leading-snug
                  break-words

                  bg-blue-200

                  rounded-[16px]
                  md:rounded-[20px]

                  text-center

                  font-semibold
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
            justify-center
            w-full
            gap-2
            sm:gap-4
            md:gap-6
            lg:gap-8
          ">
          {/* LEFT */}
          <div
            className="
              w-[120px]
                  sm:w-[150px]
                  md:w-[180px]
                  lg:w-[220px]

                  h-[88px]sm:h-[96px]md:min-h-[76px]md:h-auto

                  flex
                  items-center
                  justify-center

                  px-3
                  sm:px-4
                  md:px-5
                  lg:px-6

                  py-3
                  md:py-4
                  lg:py-5

                  text-[14px]
                  sm:text-[15px]
                  md:text-[16px]
                  lg:text-[18px]

                  leading-snug
                  break-words

                  bg-purple-200

                  rounded-[16px]
                  md:rounded-[20px]

                  text-center

                  font-semibold
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
              sm:text-[30px]
              md:text-[38px]
              lg:text-[48px]

              shrink-0
            ">
            →
          </div>

          {/* RIGHT */}
          <div
            className="
                  w-[120px]
                  sm:w-[150px]
                  md:w-[180px]
                  lg:w-[220px]

                  h-[88px]sm:h-[96px]md:min-h-[76px]md:h-auto

                  flex
                  items-center
                  justify-center

                  px-3
                  sm:px-4
                  md:px-5
                  lg:px-6

                  py-3
                  md:py-4
                  lg:py-5

                  text-[14px]
                  sm:text-[15px]
                  md:text-[16px]
                  lg:text-[18px]

                  leading-snug
                  break-words

                  bg-blue-200

                  rounded-[16px]
                  md:rounded-[20px]

                  text-center

                  font-semibold
                  text-gray-900
            ">
            {selectedAnswer || "..."}
          </div>
        </div>
      </div>

      {/* ================= OPTIONS ================= */}
      <div
        data-tutorial="answer-options"
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          lg:flex
          lg:flex-wrap

          justify-center

          gap-3
          md:gap-4
          lg:gap-5
        ">
        {options.map((option: any, index: number) => {
          const isSelected = selectedAnswer === option.text;

          return (
            <button
              key={`${option.id}-${index}`}
              onClick={() => setSelectedAnswer(option.text)}
              className={`
                w-full

                max-w-[300px]
                sm:max-w-[180px]
                md:max-w-[210px]
                lg:w-[230px]

                h-[66px]
                md:min-h-[76px]
                md:h-auto

                px-3
                sm:px-4
                md:px-5
                lg:px-6

                py-3
                md:py-5
                lg:py-7

                text-[13px]
                sm:text-[14px]
                md:text-[16px]
                lg:text-[18px]
                font-semibold
                rounded-[16px]
                md:rounded-[20px]

                leading-snug

                break-words

          ${isSelected ? "bg-[#FFB236] scale-105" : "bg-slate-50"}
        `}>
              <span className="mr-1 md:mr-2 font-black">{option.id}.</span>

              {option.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
