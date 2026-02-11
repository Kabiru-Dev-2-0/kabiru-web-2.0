"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export interface RectData {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

interface StageModalProps {
  isOpen: boolean;
  nomorLatihan: number;
  unitNumber: string;
  bagianName: string;
  status?: "completed" | "current" | "locked";
  triggerRect?: RectData | null;
  containerRect?: RectData | null;
  onClose: () => void;
  onStart: (nomorLatihan: number) => void;
}

export function StageModal({
  isOpen,
  nomorLatihan,
  unitNumber,
  bagianName,
  status = "current",
  triggerRect,
  containerRect,
  onClose,
  onStart,
}: StageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const getStatusColors = (status: "completed" | "current" | "locked") => {
    switch (status) {
      case "completed":
        return {
          bgColor: "#3674B5",
          shadowColor: "rgba(32, 89, 148, 1.00)",
        };
      case "current":
        return {
          bgColor: "#F5A524",
          shadowColor: "rgba(196, 132, 29, 1.00)",
        };
      case "locked":
        return {
          bgColor: "#A1A1AA",
          shadowColor: "rgba(113, 113, 122, 1.00)",
        };
    }
  };

  const colors = getStatusColors(status);

  // Handle outside click to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Use capture phase to ensure we catch it before other handlers if needed,
    // but bubbling is usually fine.
    // However, we want to allow scrolling (wheel/touchmove) on the background,
    // which this doesn't block.
    // We only want to close on CLICK/TAP on background.
    // Using mousedown allows scrolling on mobile (as touch-drag doesn't fire mousedown).
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleStartClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onStart(nomorLatihan);
    },
    [nomorLatihan, onStart],
  );

  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // e.preventDefault(); // Don't prevent default, might break text selection etc.
  }, []);

  // Smart positioning logic
  useLayoutEffect(() => {
    if (isOpen && triggerRect && containerRect && modalRef.current) {
      const modalHeight = modalRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Determine space
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      // Default to bottom
      let isTop = false;

      // If strict space constraint below, and enough space above, flip to top
      // OR if the node is in the bottom 30% of screen, prefer top
      if (
        (spaceBelow < modalHeight + 20 && spaceAbove > modalHeight + 20) ||
        (triggerRect.bottom > viewportHeight * 0.7 && spaceAbove > modalHeight + 20)
      ) {
        isTop = true;
      }

      let top = 0;
      // Center horizontally relative to trigger
      const left = triggerRect.left - containerRect.left + triggerRect.width / 2;

      if (isTop) {
        top = triggerRect.top - containerRect.top - modalHeight - 10;
      } else {
        top = triggerRect.bottom - containerRect.top + 10;
      }

      setCoords({ top, left });
      setIsVisible(true);
    } else {
        setIsVisible(false);
    }
  }, [isOpen, triggerRect, containerRect]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute z-11 rounded-2xl shadow-lg w-[300px] min-w-[200px] max-w-[350px]"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        transform: "translateX(-50%)",
        opacity: isVisible ? 1 : 0, // Prevent flicker before positioning
        transition: "opacity 0.1s ease-in-out",
      }}
      onClick={handleModalClick}
      onPointerDown={handleModalClick}
    >
      <div
        className="w-full rounded-2xl p-5 flex flex-col gap-5"
        style={{
          backgroundColor: colors.bgColor,
          boxShadow: `0px 4px 0px 0px ${colors.shadowColor}`,
        }}
      >
        <div className="flex flex-col gap-3.5 w-full">
          <div className="flex flex-col gap-1">
            <div className="text-white text-sm font-normal font-['Encode_Sans']">
              {unitNumber}
            </div>
            <div className="text-white text-lg font-semibold font-['Encode_Sans']">
              {bagianName}
            </div>
          </div>
          <button
            onClick={handleStartClick}
            type="button"
            className="w-full px-3 py-2 bg-white rounded-[10px] outline outline-1 outline-offset-[-1px] outline-cyan-600 inline-flex justify-center items-center gap-2 hover:bg-blue-50 active:scale-95 transition-colors duration-100 cursor-pointer"
            style={{
              boxShadow: `0px 4px 0px 0px ${colors.shadowColor}`,
            }}
          >
            <svg
              className="w-6 h-6 text-cyan-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-cyan-600 text-sm font-semibold font-['Encode_Sans'] leading-5">
              Mulai
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
