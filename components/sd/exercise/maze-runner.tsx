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
  // DATA

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

  // RESPONSIVE CELL SIZE
  const [cellSize, setCellSize] = useState(140);

  useEffect(() => {
    function updateCellSize() {
      const width = window.innerWidth;

      if (width < 640) {
        setCellSize(grid.cols >= 5 ? 52 : grid.cols === 4 ? 68 : 90);
      } else if (width < 1024) {
        setCellSize(grid.cols >= 5 ? 72 : grid.cols === 4 ? 90 : 115);
      } else {
        setCellSize(grid.cols >= 5 ? 95 : grid.cols === 4 ? 110 : 140);
      }
    }

    updateCellSize();
    window.addEventListener("resize", updateCellSize);
    return () => window.removeEventListener("resize", updateCellSize);
  }, [grid.cols]);

  // STATE
  const [commands, setCommands] = useState<(CommandType | null)[]>(
    Array(maxSteps).fill(null),
  );

  const [robotPosition, setRobotPosition] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  // RESET

  useEffect(() => {
    setCommands(Array(maxSteps).fill(null));
    setRobotPosition(start);
    setIsAnimating(false);
  }, [exercise]);

  useEffect(() => {
    onStateChange?.(commands.every((command) => command !== null));
  }, [commands]);

  // REMOVE COMMAND
  function removeCommand(index: number) {
    if (isAnimating) return;

    const updated = [...commands];

    updated[index] = null;

    setCommands(updated);
  }

  // DRAG END
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

  // RESET EXERCISE
  function resetExercise() {
    setCommands(Array(maxSteps).fill(null));
    setRobotPosition(start);
    setIsAnimating(false);
  }

  // ANIMATE ROBOT
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

  // CHECK ANSWER
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

  // REGISTER CHECK FUNCTION
  useEffect(() => {
    if (setCheckAnswer) {
      setCheckAnswer(() => checkAnswerInternal);
    }
  }, [commands]);

  // GRID CELLS
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
      <div className="pb-24 md:pb-32">
        <div
          className="
            flex
            flex-col
            lg:flex-row

            items-center
            lg:items-start

            justify-center

            gap-6
            md:gap-10
            lg:gap-14
          ">
          {/*  LEFT BOARD  */}
          <div
            data-tutorial="maze-board"
            className="
              grid
              rounded-[16px]
              md:rounded-[20px]
              lg:rounded-[24px]
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
                      <div className="text-[42px] sm:text-[56px] md:text-[70px] lg:text-[90px]">
                        🤖
                      </div>
                    )}

                  {/* GOAL */}
                  {isGoal &&
                    !label &&
                    !(
                      robotPosition.row === cell.row &&
                      robotPosition.col === cell.col
                    ) && (
                      <div className="text-[42px] sm:text-[56px] md:text-[70px] lg:text-[90px]">
                        🚩
                      </div>
                    )}

                  {/* WALL */}
                  {!(
                    robotPosition.row === cell.row &&
                    robotPosition.col === cell.col
                  ) &&
                    !isGoal &&
                    isWall && (
                      <div className="text-[42px] sm:text-[56px] md:text-[70px] lg:text-[90px]">
                        🚧
                      </div>
                    )}

                  {/* TREE */}
                  {!(
                    robotPosition.row === cell.row &&
                    robotPosition.col === cell.col
                  ) &&
                    !isGoal &&
                    !isWall &&
                    decoration?.type === "tree" && (
                      <div className="text-[42px] sm:text-[56px] md:text-[70px] lg:text-[90px]">
                        🌳
                      </div>
                    )}

                  {/* ROCK */}
                  {!(
                    robotPosition.row === cell.row &&
                    robotPosition.col === cell.col
                  ) &&
                    !isGoal &&
                    !isWall &&
                    decoration?.type === "rock" && (
                      <div className="text-[42px] sm:text-[56px] md:text-[70px] lg:text-[90px]">
                        🪨
                      </div>
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
                            text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px]
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

          {/*  RIGHT AREA  */}
          <div
            className="
              flex
              flex-col
              gap-8
            ">
            {/*  INSTRUCTION AREA  */}
            <div
              data-tutorial="instruction-list"
              className="
                relative
                mt-6

                bg-blue-200

                rounded-[18px]
                md:rounded-[24px]
                lg:rounded-[34px]

                px-4
                py-5

                md:px-6
                md:py-6

                lg:px-10
                lg:py-10
              ">
              <div
                className="
                  absolute
                  -top-7
                  left-1/2
                  -translate-x-1/2

                  bg-blue-200

                  rounded-t-[16px]
                  py-2

                  font-black
                  text-[13px] sm:text-[15px] md:text-[16px] lg:text-[18px] px-4 md:px-6
                  text-[#482A9A]
                ">
                AREA INSTRUKSI
              </div>

              <div
                className="
                  flex
                  gap-2
                  sm:gap-3
                  md:gap-5
                  lg:gap-6
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

            {/*  COMMAND AREA  */}
            <div
              data-tutorial="control-buttons"
              className="
                relative
                mt-6

                bg-purple-200
                rounded-[18px]
                md:rounded-[24px]
                lg:rounded-[34px]

                px-4
                py-5

                md:px-6
                md:py-6

                lg:px-10
                lg:py-10
              ">
              <div
                className="
                  absolute
                  -top-8
                  left-1/2
                  -translate-x-1/2

                  bg-purple-200

                  w-max
                  whitespace-nowrap

                  rounded-t-[16px]
                  py-0
                  md:py-2

                  font-black
                  text-[13px] sm:text-[15px] md:text-[16px] lg:text-[18px] px-4 md:px-6
                  text-center
                  text-[#A02ED6]
                ">
                <div className="font-black text-[13px] md:text-[18px] text-[#A02ED6]">
                  BLOK KODE
                </div>
                <div className="text-[10px] md:hidden font-semibold text-[#A02ED6]">
                  Seret ke Area Instruksi
                </div>
                <div className="hidden md:block text-[18px] font-black text-[#A02ED6]">
                  (SERET KE AREA INSTRUKSI)
                </div>
              </div>

              <div
                className="
                  flex
                  gap-2
                  md:gap-6
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

// DRAGGABLE COMMAND

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
        w-[58px]
        sm:w-[82px]
        md:w-[90px]
        lg:w-[100px]

        rounded-[14px]
        md:rounded-[20px]
        lg:rounded-[24px]

        bg-white

        px-4

        py-3
        md:py-4
        lg:py-5

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
          text-[34px] sm:text-[36px] md:text-[50px] lg:text-[60px]

          ${color}
        `}
      />

      <div
        className="
          mt-1

          text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px]
          font-bold
          text-[#374151]
        ">
        {label}
      </div>
    </button>
  );
}

// INSTRUCTION SLOT
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
        w-[42px]
        h-[42px]

        sm:w-[72px]
        sm:h-[72px]

        md:w-[82px]
        md:h-[82px]

        lg:w-[100px]
        lg:h-[100px]

        rounded-[20px]

        bg-white

        flex
        items-center
        justify-center

        text-[14px] sm:text-[42px] md:text-[52px] lg:text-[60px]
        font-black
        text-[#9CA3AF]

        transition-all

        ${isOver ? "scale-105 ring-4 ring-blue-300" : ""}
      `}>
      {command && Icon ? (
        <Icon
          className={`
            text-[24px] sm:text-[32px] md:text-[50px] lg:text-[60px]

            ${config.color}
          `}
        />
      ) : (
        Number(id.replace("slot-", "")) + 1
      )}
    </button>
  );
}
