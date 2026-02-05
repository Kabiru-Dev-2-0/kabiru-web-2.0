"use client";

import { useState, useCallback, useMemo } from "react";
import { StageNode } from "./stage-node";
import { StageModal } from "./stage-modal";
import { MotivationalTooltip } from "./motivational-tooltip";
import Image from "next/image";

interface Stage {
  id: number;
  nomor_latihan: number;
  unit_name: string;
  status: "completed" | "current" | "locked";
}

interface LearningPathVisualProps {
  stages: Stage[];
  onStageClick: (stageId: number) => void;
}

interface ModalState {
  isOpen: boolean;
  nomorLatihan: number;
  unitName: string;
  status?: "completed" | "current" | "locked";
  position?: { top: number; left: number };
}

export function LearningPathVisual({
  stages,
  onStageClick,
}: LearningPathVisualProps) {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    nomorLatihan: 0,
    unitName: "",
  });

  const paddedStages = useMemo(() => {
    const stages_copy = [...stages];
    while (stages_copy.length < stages.length) { // Note: This logic seems to be intended to fill up to a certain number, but "stages_copy.length < stages.length" is never true if it starts as copy.
      // Assuming the intention is to fill at least 11 stages based on the layout usage (indices 0 to 9 used, so 10 items).
      // Actually the layout checks paddedStages[0]...paddedStages[9]. So at least 10 items.
      // The original code loop condition was likely buggy or I misread it.
      // "stages_copy.length < stages.length" - if stages has 5 items, copy has 5. 5 < 5 is false. Loop never runs.
      // If the user wants to keep original behavior (no padding if logic was broken), I should leave it.
      // But if I want to support "nomor_latihan", I should ensure properties exist.
      // I will keep the loop logic as is to avoid changing behavior I don't fully understand, but I must add properties to the push if it ever runs.
      // Wait, if the loop never runs, then paddedStages = stages.
      // So I just need to make sure 'stages' passed in has the props.
      stages_copy.push({
        id: stages_copy.length + 1,
        nomor_latihan: stages_copy.length + 1,
        unit_name: "Locked",
        status: "locked",
      });
    }
    return stages_copy;
  }, [stages]);

  const handleModalOpen = useCallback(
    (
      nomorLatihan: number,
      status?: "completed" | "current" | "locked",
      element?: HTMLElement,
      unitName?: string,
    ) => {
      let position = undefined;
      if (element) {
        const rect = element.getBoundingClientRect();
        position = {
          top: rect.bottom + 10, // 10px below the node
          left: rect.left + rect.width / 2, // centered horizontally on node
        };
      }
      setModalState({ isOpen: true, nomorLatihan, status, position, unitName: unitName || "" });
    },
    [],
  );

  const handleModalClose = useCallback(() => {
    setModalState({
      isOpen: false,
      nomorLatihan: 0,
      unitName: "",
      status: undefined,
      position: undefined,
    });
  }, []);

  const handleModalStart = useCallback(
    (nomorLatihan: number) => {
      setModalState({
        isOpen: false,
        nomorLatihan: 0,
        unitName: "",
        status: undefined,
        position: undefined,
      });
      // Find stage by nomor_latihan
      const stage = paddedStages.find(s => s.nomor_latihan === nomorLatihan);
      if (stage) {
        onStageClick(stage.id);
      }
    },
    [paddedStages, onStageClick],
  );

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
                  nomorLatihan={paddedStages[0].nomor_latihan}
                  status={paddedStages[0].status}
                  unitName={paddedStages[0].unit_name}
                  onModalOpen={handleModalOpen}
                  marginTop={0}
                />
              )}
              {paddedStages[1] && (
                <StageNode
                  nomorLatihan={paddedStages[1].nomor_latihan}
                  status={paddedStages[1].status}
                  unitName={paddedStages[1].unit_name}
                  onModalOpen={handleModalOpen}
                  marginTop={30}
                />
              )}
              {paddedStages[2] && (
                <StageNode
                  nomorLatihan={paddedStages[2].nomor_latihan}
                  status={paddedStages[2].status}
                  unitName={paddedStages[2].unit_name}
                  onModalOpen={handleModalOpen}
                  marginTop={60}
                />
              )}
            </div>
            {/* Row 2: Stage 4 */}
            <div className="flex flex-col items-start gap-y-12 self-end sm:mr-0 lg:mr-50">
              {paddedStages[3] && (
                <StageNode
                  nomorLatihan={paddedStages[3].nomor_latihan}
                  status={paddedStages[3].status}
                  unitName={paddedStages[3].unit_name}
                  onModalOpen={handleModalOpen}
                />
              )}
            </div>
            {/* Row 3: Stage 5, 6, 7 */}
            <div className="flex items-start gap-x-15">
              {paddedStages[6] && (
                <StageNode
                  nomorLatihan={paddedStages[6].nomor_latihan}
                  status={paddedStages[6].status}
                  unitName={paddedStages[6].unit_name}
                  onModalOpen={handleModalOpen}
                  marginTop={60}
                />
              )}
              {paddedStages[5] && (
                <StageNode
                  nomorLatihan={paddedStages[5].nomor_latihan}
                  status={paddedStages[5].status}
                  unitName={paddedStages[5].unit_name}
                  onModalOpen={handleModalOpen}
                  marginTop={30}
                />
              )}
              {paddedStages[4] && (
                <StageNode
                  nomorLatihan={paddedStages[4].nomor_latihan}
                  status={paddedStages[4].status}
                  unitName={paddedStages[4].unit_name}
                  onModalOpen={handleModalOpen}
                  marginTop={0}
                />
              )}
            </div>
            {/* Row 4: Stage 8 */}
            <div className="flex flex-col items-start gap-y-12 self-start sm:ml-0 lg:ml-50">
              {paddedStages[7] && (
                <StageNode
                  nomorLatihan={paddedStages[7].nomor_latihan}
                  status={paddedStages[7].status}
                  unitName={paddedStages[7].unit_name}
                  onModalOpen={handleModalOpen}
                />
              )}
            </div>
            {/* Row 5: Stage 9, 10, 11 */}
            <div className="flex items-start gap-x-15">
              {paddedStages[8] && (
                <StageNode
                  nomorLatihan={paddedStages[8].nomor_latihan}
                  status={paddedStages[8].status}
                  unitName={paddedStages[8].unit_name}
                  onModalOpen={handleModalOpen}
                  marginTop={0}
                />
              )}
              {paddedStages[9] && (
                <StageNode
                  nomorLatihan={paddedStages[9].nomor_latihan}
                  status={paddedStages[9].status}
                  unitName={paddedStages[9].unit_name}
                  onModalOpen={handleModalOpen}
                  marginTop={30}
                />
              )}
              <div className="mr-19"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal rendered at root level to avoid re-render issues */}
      <StageModal
        isOpen={modalState.isOpen}
        nomorLatihan={modalState.nomorLatihan}
        status={modalState.status}
        unitNumber={`Unit ${modalState.nomorLatihan}`}
        bagianName={modalState.unitName}
        position={modalState.position}
        onClose={handleModalClose}
        onStart={handleModalStart}
      />
    </div>
  );
}
