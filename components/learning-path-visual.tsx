"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { StageNode } from "./stage-node";
import { StageModal, type RectData } from "./stage-modal";
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
  triggerRect?: RectData | null;
  containerRect?: RectData | null;
}

export function LearningPathVisual({
  stages,
  onStageClick,
}: LearningPathVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    nomorLatihan: 0,
    unitName: "",
  });

  const paddedStages = useMemo(() => {
    const stages_copy = [...stages];
    while (stages_copy.length < stages.length) {
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
      let triggerRect: RectData | null = null;
      let containerRect: RectData | null = null;

      if (element && containerRef.current) {
        const tRect = element.getBoundingClientRect();
        const cRect = containerRef.current.getBoundingClientRect();

        triggerRect = {
          top: tRect.top,
          bottom: tRect.bottom,
          left: tRect.left,
          right: tRect.right,
          width: tRect.width,
          height: tRect.height,
        } as RectData;
        containerRect = {
          top: cRect.top,
          bottom: cRect.bottom,
          left: cRect.left,
          right: cRect.right,
          width: cRect.width,
          height: cRect.height,
        } as RectData;
      }
      setModalState({
        isOpen: true,
        nomorLatihan,
        status,
        unitName: unitName || "",
        triggerRect,
        containerRect,
      });
    },
    [],
  );

  const handleModalClose = useCallback(() => {
    setModalState({
      isOpen: false,
      nomorLatihan: 0,
      unitName: "",
      status: undefined,
      triggerRect: undefined,
      containerRect: undefined,
    });
  }, []);

  const handleModalStart = useCallback(
    (nomorLatihan: number) => {
      setModalState({
        isOpen: false,
        nomorLatihan: 0,
        unitName: "",
        status: undefined,
        triggerRect: undefined,
        containerRect: undefined,
      });
      // Find stage by nomor_latihan
      const stage = paddedStages.find((s) => s.nomor_latihan === nomorLatihan);
      if (stage) {
        onStageClick(stage.id);
      }
    },
    [paddedStages, onStageClick],
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full flex justify-center items-start py-8 px-6 min-h-screen"
    >
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
        triggerRect={modalState.triggerRect}
        containerRect={modalState.containerRect}
        onClose={handleModalClose}
        onStart={handleModalStart}
      />
    </div>
  );
}
