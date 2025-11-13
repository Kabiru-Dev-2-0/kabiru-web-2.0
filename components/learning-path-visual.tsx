"use client";

import { StageNode } from "./stage-node";
import { MotivationalTooltip } from "./motivational-tooltip";
import Image from "next/image";

interface Stage {
  id: number;
  status: "completed" | "current" | "locked";
}

interface LearningPathVisualProps {
  stages: Stage[];
  onStageClick: (stageId: number) => void;
}

export function LearningPathVisual({ stages, onStageClick }: LearningPathVisualProps) {
  // Ensure we have enough stages (pad with locked if needed)
  const paddedStages = [...stages];
  while (paddedStages.length < stages.length) {
    paddedStages.push({
      id: paddedStages.length + 1,
      status: "locked"
    });
  }

  return (
    <div className="relative w-full flex justify-center items-start py-8 px-6 min-h-screen">
      {/* Background gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-b from-transparent to-[#FCFDFD] pointer-events-none z-0" />
      
      {/* Main container with left character and center stages */}
      <div className="relative flex gap-8 w-full max-w-[900px] z-10 justify-center">
        {/* Center - Hexagonal learning path */}
        <div className="flex flex-col gap-7 w-full items-center">
          <div className="flex flex-col items-center gap-16 pt-8 h-fit w-full">
            {/* Row 1: Stage 1, 2, 3 */}
            <div className="flex items-start gap-x-15">
              {paddedStages[0] && (
                <StageNode
                  stageNumber={1}
                  status={paddedStages[0].status}
                  onClick={() => onStageClick(paddedStages[0].id)}
                  marginTop={0}
                />
              )}
              {paddedStages[1] && (
                <StageNode
                  stageNumber={2}
                  status={paddedStages[1].status}
                  onClick={() => onStageClick(paddedStages[1].id)}
                  marginTop={30}
                />
              )}
              {paddedStages[2] && (
                <StageNode
                  stageNumber={3}
                  status={paddedStages[2].status}
                  onClick={() => onStageClick(paddedStages[2].id)}
                  marginTop={60}
                />
              )}
            </div>
            {/* Row 2: Stage 4 */}
            <div className="flex flex-col items-start gap-y-12 self-end sm:mr-0 lg:mr-50">
              {paddedStages[3] && (
                <StageNode
                  stageNumber={4}
                  status={paddedStages[3].status}
                  onClick={() => onStageClick(paddedStages[3].id)}
                />
              )}
            </div>
            {/* Row 3: Stage 5, 6, 7 */}
            <div className="flex items-start gap-x-15">
              {paddedStages[4] && (
                <StageNode
                  stageNumber={5}
                  status={paddedStages[4].status}
                  onClick={() => onStageClick(paddedStages[4].id)}
                  marginTop={60}
                />
              )}
              {paddedStages[5] && (
                <StageNode
                  stageNumber={6}
                  status={paddedStages[5].status}
                  onClick={() => onStageClick(paddedStages[5].id)}
                  marginTop={30}
                />
              )}
              {paddedStages[6] && (
                <StageNode
                  stageNumber={7}
                  status={paddedStages[6].status}
                  onClick={() => onStageClick(paddedStages[6].id)}
                  marginTop={0}
                />
              )}
            </div>
            {/* Row 4: Stage 8 */}
            <div className="flex flex-col items-start gap-y-12 self-start sm:ml-0 lg:ml-50">
              {paddedStages[7] && (
                <StageNode
                  stageNumber={8}
                  status={paddedStages[7].status}
                  onClick={() => onStageClick(paddedStages[7].id)}
                />
              )}
            </div>
            {/* Row 5: Stage 9, 10, 11 */}
            <div className="flex items-start gap-x-15">
              {paddedStages[8] && (
                <StageNode
                  stageNumber={9}
                  status={paddedStages[8].status}
                  onClick={() => onStageClick(paddedStages[8].id)}
                  marginTop={0}
                />
              )}
              {paddedStages[9] && (
                <StageNode
                  stageNumber={10}
                  status={paddedStages[9].status}
                  onClick={() => onStageClick(paddedStages[9].id)}
                  marginTop={30}
                />
              )}
              <div className="mr-19"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

