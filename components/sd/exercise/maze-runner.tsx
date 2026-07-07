"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowRightFilled,
  ArrowLeftFilled,
  ArrowUpFilled,
  ArrowDownFilled,
} from "@fluentui/react-icons";

import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

type Position = {
  row: number;
  col: number;
};

type DecorationType = {
  row: number;
  col: number;
  type: string;
};

type LabelType = {
  row: number;
  col: number;
  text: string;
};

type Props = {
  exercise: any;

  setCheckAnswer?: (fn: () => void) => void;

  setResetExercise?: (fn: () => void) => void;

  onAnswerResult?: (isCorrect: boolean) => void;

  onStateChange?: (ready: boolean) => void;
};

type CommandType = "UP" | "DOWN" | "LEFT" | "RIGHT";

const COMMAND_CONFIG = {
  RIGHT: {
    label: "Kanan",
    icon: ArrowRightFilled,
    color: "text-[#4F46E5]",
  },

  LEFT: {
    label: "Kiri",
    icon: ArrowLeftFilled,
    color: "text-[#10B981]",
  },

  UP: {
    label: "Atas",
    icon: ArrowUpFilled,
    color: "text-[#3B82F6]",
  },

  DOWN: {
    label: "Bawah",
    icon: ArrowDownFilled,
    color: "text-[#F59E0B]",
  },
};

export default function MazeRunnerExercise({
  exercise,
  setCheckAnswer,
  setResetExercise,
  onAnswerResult,
  onStateChange,
}: Props) {
  // =====================================
  // DATA
  // =====================================
  const grid = exercise?.data?.grid || {
    rows: 3,
    cols: 3,
  };

  const start = exercise?.data?.start || {
    row: 0,
    col: 0,
  };

  const goal = exercise?.data?.goal || {
    row: 2,
    col: 2,
  };

  const walls: Position[] = exercise?.data?.walls || [];

  const decorations: DecorationType[] = exercise?.data?.decorations || [];

  const labels: LabelType[] = exercise?.data?.labels || [];

  const correctPath: CommandType[] = exercise?.data?.correct_path || [];

  const maxSteps = exercise?.data?.max_steps || correctPath.length;

  // =====================================
  // RESPONSIVE CELL SIZE
  // =====================================
  const cellSize = grid.cols >= 5 ? 95 : grid.cols === 4 ? 110 : 140;

  // =====================================
  // STATE
  // =====================================
  const [commands, setCommands] = useState<(CommandType | null)[]>(
    Array(maxSteps).fill(null),
  );

  const [robotPosition, setRobotPosition] = useState(start);

  const [isAnimating, setIsAnimating] = useState(false);

  // =====================================
  // RESET
  // =====================================
  useEffect(() => {
    setCommands(Array(maxSteps).fill(null));

    setRobotPosition(start);

    setIsAnimating(false);
  }, [exercise]);

  useEffect(() => {
    onStateChange?.(commands.every((command) => command !== null));
  }, [commands]);

  // =====================================
  // REMOVE COMMAND
  // =====================================
  function removeCommand(index: number) {
    if (isAnimating) return;

    const updated = [...commands];

    updated[index] = null;

    setCommands(updated);
  }

  // =====================================
  // DRAG END
  // =====================================
  function handleDragEnd(event: any) {
    if (isAnimating) return;

    const { active, over } = event;

    if (!over) return;

    if (!over.id.toString().startsWith("slot-")) return;

    const command = active.id as CommandType;

    const slotIndex = Number(over.id.toString().replace("slot-", ""));

    const updated = [...commands];

    updated[slotIndex] = command;

    setCommands(updated);
  }

  // =====================================
  // RESET EXERCISE
  // =====================================
  function resetExercise() {
    setCommands(Array(maxSteps).fill(null));

    setRobotPosition(start);

    setIsAnimating(false);
  }

  // =====================================
  // ANIMATE ROBOT
  // =====================================
  async function animateRobot() {
    setIsAnimating(true);

    let current = {
      row: start.row,
      col: start.col,
    };

    for (const command of commands) {
      if (!command) continue;

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (command === "RIGHT") {
        current = {
          ...current,
          col: current.col + 1,
        };
      }

      if (command === "LEFT") {
        current = {
          ...current,
          col: current.col - 1,
        };
      }

      if (command === "UP") {
        current = {
          ...current,
          row: current.row - 1,
        };
      }

      if (command === "DOWN") {
        current = {
          ...current,
          row: current.row + 1,
        };
      }

      setRobotPosition(current);
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    setIsAnimating(false);
  }

  // =====================================
  // CHECK ANSWER
  // =====================================
  async function checkAnswerInternal() {
    const correctPaths =
      exercise?.data?.correct_paths ||
      (exercise?.data?.correct_path ? [exercise.data.correct_path] : []);

    const filledCommands = commands.filter(Boolean);

    const isCorrect = correctPaths.some(
      (path: string[]) =>
        JSON.stringify(path) === JSON.stringify(filledCommands),
    );

    if (isCorrect) {
      await animateRobot();

      onAnswerResult?.(true);
    } else {
      resetExercise();

      onAnswerResult?.(false);
    }
  }

  // =====================================
  // REGISTER CHECK FUNCTION
  // =====================================
  useEffect(() => {
    if (setCheckAnswer) {
      setCheckAnswer(() => checkAnswerInternal);
    }
  }, [commands]);

  // =====================================
  // GRID CELLS
  // =====================================
  const cells = useMemo(() => {
    const arr = [];

    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        arr.push({
          row,
          col,
        });
      }
    }

    return arr;
  }, [grid]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="pb-32">
        <div
          className="
            flex
            items-start
            justify-center
            gap-14
            flex-wrap
          ">
          {/* ================= LEFT BOARD ================= */}
          <div
            data-tutorial="maze-board"
            className="
              grid
              rounded-[24px]
              overflow-hidden
              shrink-0
            "
            style={{
              gridTemplateColumns: `repeat(${grid.cols}, ${cellSize}px)`,
            }}>
            {cells.map((cell) => {
              const isGoal = cell.row === goal.row && cell.col === goal.col;

              const isWall = walls.some(
                (wall) => wall.row === cell.row && wall.col === cell.col,
              );

              const decoration = decorations.find(
                (item) => item.row === cell.row && item.col === cell.col,
              );

              const label = labels.find(
                (item) => item.row === cell.row && item.col === cell.col,
              );

              return (
                <div
                  key={`${cell.row}-${cell.col}`}
                  className="
                      border
                      border-[#B9AA84]

                      bg-[#F5E7C5]

                      flex
                      items-center
                      justify-center

                      relative

                      transition-all
                      duration-300
                    "
                  style={{
                    width: cellSize,
                    height: cellSize,
                  }}>
                  {/* ROBOT */}
                  {robotPosition.row === cell.row &&
                    robotPosition.col === cell.col && (
                      <div className="text-[90px]">🤖</div>
                    )}

                  {/* GOAL */}
                  {isGoal &&
                    !label &&
                    !(
                      robotPosition.row === cell.row &&
                      robotPosition.col === cell.col
                    ) && <div className="text-[90px]">🚩</div>}

                  {/* WALL */}
                  {!(
                    robotPosition.row === cell.row &&
                    robotPosition.col === cell.col
                  ) &&
                    !isGoal &&
                    isWall && <div className="text-[90px]">🚧</div>}

                  {/* TREE */}
                  {!(
                    robotPosition.row === cell.row &&
                    robotPosition.col === cell.col
                  ) &&
                    !isGoal &&
                    !isWall &&
                    decoration?.type === "tree" && (
                      <div className="text-[90px]">🌳</div>
                    )}

                  {/* ROCK */}
                  {!(
                    robotPosition.row === cell.row &&
                    robotPosition.col === cell.col
                  ) &&
                    !isGoal &&
                    !isWall &&
                    decoration?.type === "rock" && (
                      <div className="text-[90px]">🪨</div>
                    )}

                  {/* LABEL */}
                  {!(
                    robotPosition.row === cell.row &&
                    robotPosition.col === cell.col
                  ) &&
                    label && (
                      <div
                        className="
                            absolute
                            inset-0

                            flex
                            items-center
                            justify-center

                            px-2

                            text-center

                            font-bold
                            text-[14px]
                            leading-tight

                            text-[#1D1D1D]
                          ">
                        {label.text}
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {/* ================= RIGHT AREA ================= */}
          <div
            className="
              flex
              flex-col
              gap-8
            ">
            {/* ================= INSTRUCTION AREA ================= */}
            <div
              data-tutorial="instruction-list"
              className="
                relative
                mt-6

                bg-blue-200

                rounded-[34px]

                px-10
                py-10
              ">
              <div
                className="
                  absolute
                  -top-7
                  left-1/2
                  -translate-x-1/2

                  bg-blue-200

                  rounded-t-[16px]

                  px-6
                  py-2

                  font-black
                  text-[18px]
                  text-[#482A9A]
                ">
                AREA INSTRUKSI
              </div>

              <div
                className="
                  flex
                  gap-6
                  flex-wrap
                  justify-center
                ">
                {commands.map((command, index) => (
                  <InstructionSlot
                    key={index}
                    id={`slot-${index}`}
                    command={command}
                    onRemove={() => removeCommand(index)}
                  />
                ))}
              </div>
            </div>

            {/* ================= COMMAND AREA ================= */}
            <div
              data-tutorial="control-buttons"
              className="
                relative
                mt-6

                bg-purple-200

                rounded-[34px]

                px-10
                py-10
              ">
              <div
                className="
                  absolute
                  -top-7
                  left-1/2
                  -translate-x-1/2

                  w-max
                  whitespace-nowrap

                  bg-purple-200

                  rounded-t-[16px]

                  px-6
                  py-2

                  font-black
                  text-[18px]
                  text-[#A02ED6]
                ">
                BLOK KODE (SERET KE AREA INSTRUKSI)
              </div>

              <div
                className="
                  flex
                  gap-6
                  flex-wrap
                  justify-center
                ">
                {(Object.entries(COMMAND_CONFIG) as [CommandType, any][]).map(
                  ([value, config]) => (
                    <DraggableCommand
                      key={value}
                      command={value}
                      label={config.label}
                      Icon={config.icon}
                      color={config.color}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

// =====================================
// DRAGGABLE COMMAND
// =====================================
function DraggableCommand({ command, label, Icon, color }: any) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: command,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="
        w-[100px]

        rounded-[20px]

        bg-white

        px-4
        py-5

        flex
        flex-col
        items-center
        justify-center

        transition-all

        cursor-grab
        touch-none
      ">
      <Icon
        className={`
          text-[60px]

          ${color}
        `}
      />

      <div
        className="
          mt-1

          text-[18px]
          font-bold
          text-[#374151]
        ">
        {label}
      </div>
    </button>
  );
}

// =====================================
// INSTRUCTION SLOT
// =====================================
function InstructionSlot({ id, command, onRemove }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const config = command
    ? COMMAND_CONFIG[command as keyof typeof COMMAND_CONFIG]
    : null;

  const Icon = config?.icon;

  return (
    <button
      ref={setNodeRef}
      onClick={() => {
        if (command) {
          onRemove();
        }
      }}
      className={`
        w-[100px]
        h-[100px]

        rounded-[20px]

        bg-white

        flex
        items-center
        justify-center

        text-[52px]
        font-black
        text-[#9CA3AF]

        transition-all

        ${isOver ? "scale-105 ring-4 ring-blue-300" : ""}
      `}>
      {command && Icon ? (
        <Icon
          className={`
            text-[60px]

            ${config.color}
          `}
        />
      ) : (
        Number(id.replace("slot-", "")) + 1
      )}
    </button>
  );
}
