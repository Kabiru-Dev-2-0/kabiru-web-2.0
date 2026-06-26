"use client";

import {
  DndContext,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

import {
  useEffect,
  useState,
} from "react";

type Props = {
  exercise: any;

  setCheckAnswer?: (
    fn: () => void
  ) => void;

  onAnswerResult?: (
    isCorrect: boolean
  ) => void;

  setResetExercise?: (
    fn: () => void
  ) => void;

  onStateChange?: (
    ready: boolean
  ) => void;
};

export default function DragDropExercise({
  exercise,
  setCheckAnswer,
  onAnswerResult,
  setResetExercise,
  onStateChange,
}: Props) {
  // =====================================
  // INITIAL STATE
  // =====================================
  const createInitialBuckets = () => {
    const initialBuckets: Record<
      string,
      string[]
    > = {};

    (
      exercise?.data?.buckets || []
    ).forEach((bucket: string) => {
      initialBuckets[bucket] = [];
    });

    return initialBuckets;
  };

  const [cards, setCards] =
    useState<string[]>(
      exercise?.data?.items || []
    );
  
  useEffect(() => {
    onStateChange?.(
      cards.length === 0
    );
  }, [cards]);

  const [bucketItems, setBucketItems] =
    useState<Record<string, string[]>>(
      createInitialBuckets()
    );

  // =====================================
  // RESET STATE WHEN EXERCISE CHANGED
  // =====================================
  function resetExercise() {
  setCards(
    exercise?.data?.items || []
  );

  setBucketItems(
    createInitialBuckets()
  );
}

  // =====================================
  // EXPOSE RESET TO PARENT
  // =====================================
  useEffect(() => {
    setResetExercise?.(
      () => resetExercise
    );
  }, [exercise]);

  // =====================================
  // REMOVE ITEM FROM ALL BUCKETS
  // =====================================
  function removeItemFromBuckets(
    draggedText: string,
    currentBuckets: Record<
      string,
      string[]
    >
  ) {
    const updatedBuckets = {
      ...currentBuckets,
    };

    Object.keys(updatedBuckets).forEach(
      (bucket) => {
        updatedBuckets[bucket] =
          updatedBuckets[bucket].filter(
            (item) =>
              item !== draggedText
          );
      }
    );

    return updatedBuckets;
  }

  // =====================================
  // DRAG END
  // =====================================
  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over) return;

    const draggedText =
      active.id as string;

    const dropTarget =
      over.id as string;

    // =========================
    // DROP TO BUCKET
    // =========================
    if (
      exercise.data.buckets.includes(
        dropTarget
      )
    ) {
      setCards((prev) =>
        prev.filter(
          (item) =>
            item !== draggedText
        )
      );

      setBucketItems((prev) => {
        const cleanedBuckets =
          removeItemFromBuckets(
            draggedText,
            prev
          );

        return {
          ...cleanedBuckets,

          [dropTarget]: [
            ...cleanedBuckets[
              dropTarget
            ],
            draggedText,
          ],
        };
      });
    }

    // =========================
    // RETURN TO CARD AREA
    // =========================
    if (dropTarget === "card-area") {
      setBucketItems((prev) =>
        removeItemFromBuckets(
          draggedText,
          prev
        )
      );

      setCards((prev) => {
        if (
          prev.includes(
            draggedText
          )
        ) {
          return prev;
        }

        return [
          ...prev,
          draggedText,
        ];
      });
    }
  }

  // =====================================
  // CHECK ANSWER
  // =====================================
  function checkAnswerInternal() {
  const correct =
    exercise?.data
      ?.correct_assignment;

  let isCorrect = true;

  Object.keys(correct).forEach(
    (bucket) => {
      const expected = [
        ...correct[bucket],
      ].sort();

      const actual = [
        ...(bucketItems[bucket] ||
          []),
      ].sort();

      if (
        JSON.stringify(expected) !==
        JSON.stringify(actual)
      ) {
        isCorrect = false;
      }
    }
  );

  onAnswerResult?.(
    isCorrect
  );
}

  // =====================================
  // SEND FUNCTION TO PARENT
  // =====================================
  useEffect(() => {
    if (setCheckAnswer) {
      setCheckAnswer(
        () => checkAnswerInternal
      );
    }
  }, [bucketItems]);

  return (
    <>
      <DndContext
        onDragEnd={handleDragEnd}
      >
        {/* ================= BUCKETS ================= */}
        <div 
        data-tutorial="bucket-area"
        className="grid grid-cols-2 gap-8 mb-8">
          {exercise.data.buckets.map(
            (
              bucket: string,
              index: number
            ) => (
              <DropArea
                key={bucket}
                id={bucket}
                title={bucket}
                items={
                  bucketItems[
                    bucket
                  ] || []
                }
                index={index}
              />
            )
          )}
        </div>

        {/* ================= CARDS ================= */}
        <CardArea>
          <div 
          data-tutorial="drag-item-area"
          className="flex flex-wrap justify-center gap-5 pb-32">
            {cards.map(
              (item: string, index: number) => (
                <DraggableCard
                  key={item}
                  id={item}
                  text={item}
                  isFirst={index === 0}
                />
              )
            )}
          </div>
        </CardArea>
      </DndContext>
    </>
  );
}

// =====================================
// CARD AREA
// =====================================
function CardArea({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setNodeRef } =
    useDroppable({
      id: "card-area",
    });

  return (
    <div ref={setNodeRef}>
      {children}
    </div>
  );
}

// =====================================
// DRAGGABLE CARD
// =====================================
function DraggableCard({
  id,
  text,
  isFirst = false,
}: {
  id: string;
  text: string;
  isFirst?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      data-tutorial={
        isFirst
          ? "drag-item"
          : undefined
      }
      style={style}
      {...listeners}
      {...attributes}
      className="
       bg-slate-50 
       rounded-3xl 
       p-2 
       w-52
       h-24

       flex 
       items-center 
       justify-center

       text-center 
       font-bold 
       
       cursor-grab 
       touch-none
      "
    >
      {text}
    </div>
  );
}

function DraggableBucketItem({
  id,
  text,
}: {
  id: string;
  text: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="
        bg-slate-50

        rounded-2xl

        p-4

        font-bold
        text-[#1D1D1D]

        cursor-grab
        touch-none
      "
    >
      {text}
    </div>
  );
}

// =====================================
// DROP AREA
// =====================================
function DropArea({
  id,
  title,
  items,
  index,
}: {
  id: string;
  title: string;
  items: string[];
  index: number;
}) {
  const { setNodeRef, isOver } =
    useDroppable({
      id,
    });

  const isBlue =
    index % 2 === 1;

  return (
    <div
      ref={setNodeRef}
      data-tutorial={`bucket-${index}`}
      className="
        relative
        pt-8
      "
    >
      {/* ================= TAB TITLE ================= */}
      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2

          z-20
        "
      >
        <div
          className={`
            ${
              isBlue
                ? "bg-blue-200"
                : "bg-purple-200"
            }

            px-8
            py-3

            rounded-t-[20px]

            font-black
            text-[18px]

            ${
              isBlue
                ? "text-[#39218D]"
                : "text-[#8A2BE2]"
            }
          `}
        >
          {title.toUpperCase()}
        </div>
      </div>

      {/* ================= MAIN BOX ================= */}
      <div
        ref={setNodeRef}
        className={`
          ${
            isBlue
              ? "bg-blue-200"
              : "bg-purple-200"
          }

          min-h-[200px]

          rounded-[34px]

          p-4

          pt-8

          transition-all

          ${
            isOver
              ? "scale-[1.02] ring-4 ring-white/50"
              : ""
          }
        `}
      >
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <DraggableBucketItem
              key={item}
              id={item}
              text={item}
            />
          ))}
        </div>
      </div>
    </div>
  );
}