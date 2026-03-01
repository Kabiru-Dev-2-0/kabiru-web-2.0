"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { StageNode } from "./stage-node";
import { StageModal, type RectData } from "./stage-modal";
import { MotivationalTooltip } from "./motivational-tooltip";
import Image from "next/image";

interface Stage {
  id: number;
  nomor_latihan: number;
  unit_name: string;
  status: "completed" | "current" | "locked";
  isEntry?: boolean;
}

interface LearningPathVisualProps {
  stages: Stage[];
  onStageClick: (stageId: number, opts?: { isEntry?: boolean }) => void;
  startIndex?: number;
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
  startIndex = 0,
}: LearningPathVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledRef = useRef(false);
  const MAX_NODES = 100;
  const NODE_SIZE = 80; // mengikuti default StageNode "normal"
  // Pola posisi untuk 8 node pertama (koordinat absolut relatif ke container)
  // Nilai di bawah meniru pola zig-zag pada desain:
  // baris1: 3 node naik, baris2: 1 node kanan, baris3: 3 node turun, baris4: 1 node kiri
  const PATTERN: Array<{ x: number; y: number }> = [
    { x: 0, y: 0 },     // 1
    { x: 150, y: 30 },  // 2
    { x: 300, y: 60 },  // 3
    { x: 400, y: 170 },  // 4 (kanan)
    { x: 300, y: 310 }, // 5
    { x: 150, y: 350 }, // 6
    { x: 0, y: 380 },   // 7
    { x: -90, y: 520 } // 8 (kiri)
  ];
  // Hitung tinggi blok dinamis berdasarkan rentang pola + padding kecil agar tidak terlalu jauh
  const PATTERN_TOP = Math.min(...PATTERN.map((p) => p.y));
  const PATTERN_BOTTOM = Math.max(...PATTERN.map((p) => p.y));
  const PATTERN_SPAN = (PATTERN_BOTTOM - PATTERN_TOP) + NODE_SIZE; // termasuk tinggi node terakhir
  const BLOCK_GAP = 40; // jarak antar lesson
  const BLOCK_HEIGHT = PATTERN_SPAN + BLOCK_GAP;
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    nomorLatihan: 0,
    unitName: "",
  });

  // Batasi maksimum 100 node
  const displayedStages = useMemo(() => stages.slice(0, MAX_NODES), [stages]);

  const handleModalOpen = useCallback(
    (
      nomorLatihan: number,
      status?: "completed" | "current" | "locked",
      element?: HTMLElement,
      unitName?: string,
    ) => {
      const st = displayedStages.find((s) => s.nomor_latihan === nomorLatihan);
      if (st?.isEntry && status !== "locked") {
        onStageClick(nomorLatihan, { isEntry: true });
        return;
      }
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
    [displayedStages, onStageClick],
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
      const stage = displayedStages.find((s) => s.nomor_latihan === nomorLatihan);
      if (stage) {
        onStageClick(stage.id);
      }
    },
    [displayedStages, onStageClick],
  );

  const { minTop, maxTop } = useMemo(() => {
    let minT = Number.POSITIVE_INFINITY;
    let maxT = 0;
    for (let i = 0; i < displayedStages.length; i++) {
      const effectiveIndex = startIndex + i;
      const patternIndex = effectiveIndex % PATTERN.length;
      const blockIndex = Math.floor(effectiveIndex / PATTERN.length);
      const top = PATTERN[patternIndex].y + blockIndex * BLOCK_HEIGHT;
      if (top < minT) minT = top;
      if (top > maxT) maxT = top;
    }
    if (!Number.isFinite(minT)) minT = 0;
    return { minTop: minT, maxTop: maxT };
  }, [displayedStages.length, startIndex, PATTERN, BLOCK_HEIGHT]);
  const containerHeight = Math.max(maxTop - minTop + NODE_SIZE + 8, NODE_SIZE);
  const containerWidth = 600; // lebar tetap agar posisi statis (tanpa center/space-between)

  useEffect(() => {
    if (!hasScrolledRef.current && currentNodeRef.current) {
      hasScrolledRef.current = true;
      try {
        currentNodeRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      } catch {}
    }
  }, [displayedStages]);

  return (
    <div
      ref={containerRef}
      className="relative w-full py-8 px-4 flex justify-center"
    >
      {/* Container posisi statis (tanpa center/space-between) */}
      <div
        className="relative"
        style={{
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {displayedStages.map((stage, index) => {
          const effectiveIndex = startIndex + index;
          const patternIndex = effectiveIndex % PATTERN.length;
          const blockIndex = Math.floor(effectiveIndex / PATTERN.length);
          const pos = PATTERN[patternIndex];
          const left = pos.x + 80; // offset kiri dasar agar tidak mepet
          const top = (pos.y + blockIndex * BLOCK_HEIGHT) - minTop; // normalize agar nge-hug
          return (
            <div
              key={stage.id}
              className="absolute"
              ref={stage.status === "current" ? currentNodeRef : undefined}
              style={{ left: `${left}px`, top: `${top}px`, width: `${NODE_SIZE}px`, height: `${NODE_SIZE}px` }}
            >
              <StageNode
                nomorLatihan={stage.nomor_latihan}
                status={stage.status}
                unitName={stage.unit_name}
                showPlayIcon={!!stage.isEntry}
                onModalOpen={handleModalOpen}
              />
            </div>
          );
        })}
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
