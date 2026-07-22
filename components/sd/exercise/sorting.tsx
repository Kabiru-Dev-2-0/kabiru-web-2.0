"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  ReorderFilled,
} from "@fluentui/react-icons";

type ItemType = {
  id: number;
  text: string;
  label?: string;
};

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

export default function SortingExercise({
  exercise,
  setCheckAnswer,
  onAnswerResult,
  setResetExercise,
  onStateChange,
}: Props) {
  // =====================================
  // DATA
  // =====================================
  const initialItems: ItemType[] =
    exercise?.data?.items || [];

  const correctOrder: string[] =
    exercise?.data
      ?.correct_order || [];

useEffect(() => {
  onStateChange?.(
    JSON.stringify(
      initialItems
    ) !==
      JSON.stringify(
        correctOrder
      )
  );
}, [initialItems]);

  // =====================================
  // STATE
  // =====================================
  const [items, setItems] =
    useState<ItemType[]>([]);

  // =====================================
  // INIT / CHANGE EXERCISE
  // =====================================
  useEffect(() => {
    setItems(
      structuredClone(
        initialItems
      )
    );
  }, [exercise?.id]);

  // =====================================
  // REGISTER RESET
  // =====================================
  useEffect(() => {
    if (!setResetExercise)
      return;

    setResetExercise(
      () => () => {

        setItems(
          structuredClone(
            initialItems
          )
        );
      }
    );
  }, [
    setResetExercise,
    exercise?.id,
  ]);

  // =====================================
  // SENSOR
  // =====================================
  const sensors = useSensors(
    useSensor(
      PointerSensor,
      {
        activationConstraint:
          {
            distance: 4,
          },
      }
    )
  );

  // =====================================
  // DRAG END
  // =====================================
  function handleDragEnd(
    event: any
  ) {
    const {
      active,
      over,
    } = event;

    if (
      !over ||
      active.id === over.id
    ) {
      return;
    }

    const oldIndex =
      items.findIndex(
        (item) =>
          item.id === active.id
      );

    const newIndex =
      items.findIndex(
        (item) =>
          item.id === over.id
      );

    setItems((prev) =>
      arrayMove(
        prev,
        oldIndex,
        newIndex
      )
    );
  }

  // =====================================
  // CHECK ANSWER
  // =====================================
  function checkAnswerInternal() {
    const currentOrder =
      items.map(
        (item) => item.text
      );

    const isCorrect =
      JSON.stringify(
        currentOrder
      ) ===
      JSON.stringify(
        correctOrder
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
        () =>
          checkAnswerInternal
      );
    }
  }, [items]);

  return (
    <div className="pb-32">
      <DndContext
        sensors={sensors}
        collisionDetection={
          closestCenter
        }
        onDragEnd={
          handleDragEnd
        }
      >
        <SortableContext
          items={items.map(
            (item) => item.id
          )}
          strategy={
            verticalListSortingStrategy
          }
        >
          {/* ================= LIST ================= */}
          <div
            className="
              flex
              flex-col
              gap-3
              items-center
            "
          >
            {items.map(
              (
                item,
                index
              ) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  index={index}
                />
              )
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// =====================================
// SORTABLE ITEM
// =====================================
function SortableItem({
  item,
  index,
}: {
  item: ItemType;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform:
      CSS.Transform.toString(
        transform
      ),
    transition,
  };

  return (
    <div
      data-tutorial="sequence-items"
      ref={setNodeRef}
      style={style}
      className="
        w-full
        max-w-[860px]

        bg-white

        rounded-[12px]
        md:rounded-[20px]

        px-5
        py-2
        md:py-0

        flex
        items-center
        justify-between
        gap-5

        touch-none
      "
    >
      {/* ================= LEFT ================= */}
      <div
        className="
          flex
          items-center
          gap-5
        "
      >
        {/* LABEL TEXT */}
        <div className="flex items-center justify-center">
          <p className="text-[32px] md:text-[64px]">{item.label}</p>
        </div>

        {/* TEXT */}
        <div
          className="
            font-semibold
            text-[14px]
            md:text-[18px]
            text-gray-900
          "
        >
          {item.text}
        </div>
      </div>

      {/* ================= DRAG HANDLE ================= */}
      <button
        data-tutorial="sequence-area"
        {...attributes}
        {...listeners}
        className="
          shrink-0
          cursor-grab
        "
      >
        <ReorderFilled
          className="
            text-[30px]
            text-[#374151]
          "
        />
      </button>
    </div>
  );
}