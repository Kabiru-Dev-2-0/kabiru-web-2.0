"use client";

import { useCallback } from "react";

interface StageModalProps {
  isOpen: boolean;
  nomorLatihan: number;
  unitNumber: string;
  bagianName: string;
  status?: "completed" | "current" | "locked";
  position?: { top: number; left: number };
  onClose: () => void;
  onStart: (nomorLatihan: number) => void;
}

export function StageModal({
  isOpen,
  nomorLatihan,
  unitNumber,
  bagianName,
  status = "current",
  position,
  onClose,
  onStart,
}: StageModalProps) {
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

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose();
    },
    [onClose],
  );

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
    e.preventDefault();
  }, []);

  if (!isOpen) return null;

  const modalStyle = position
    ? {
        position: "fixed" as const,
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }
    : {};

  return (
    <>
      {/* Transparent Backdrop - Only for closing when clicking outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleBackdropClick}
        onPointerDown={handleBackdropClick}
      />

      {/* Modal Content */}
      <div
        className="fixed rounded-2xl shadow-lg w-[300px] min-w-[200px] max-w-[350px] mx-4 z-50"
        style={modalStyle}
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
    </>
  );
}
