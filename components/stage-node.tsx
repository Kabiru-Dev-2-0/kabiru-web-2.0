"use client";

import { useRef, useCallback } from "react";
import { CheckmarkFilled } from "@fluentui/react-icons";
import { LockClosedFilled } from "@fluentui/react-icons";

interface StageNodeProps {
  nomorLatihan: number;
  status: "completed" | "current" | "locked";
  onClick?: () => void;
  onStartClick?: () => void;
  onModalOpen?: (
    nomorLatihan: number,
    status?: "completed" | "current" | "locked",
    element?: HTMLElement,
    unitName?: string,
  ) => void;
  size?: "normal" | "large";
  marginTop?: number;
  unitName?: string;
  bagianName?: string;
}

export function StageNode({
  nomorLatihan,
  status,
  onClick,
  onStartClick,
  onModalOpen,
  size = "normal",
  marginTop = 0,
  unitName,
  bagianName = "Bagian",
}: StageNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const displayUnitName = unitName || `Unit ${nomorLatihan}`;

  const handleNodeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (status !== "locked") {
        if (onModalOpen) {
          onModalOpen(nomorLatihan, status, nodeRef.current || undefined, displayUnitName);
        }
      }
    },
    [status, nomorLatihan, onModalOpen, displayUnitName],
  );
  const getStageColors = () => {
    switch (status) {
      case "completed":
        return {
          fill: "#3674B5",
          stroke: "#205994",
          dropShadow: "#205994",
          cursor: "cursor-pointer hover:scale-105",
        };
      case "current":
        return {
          fill: "#F5A524",
          stroke: "#C4841D",
          dropShadow: "#C4841D",
          cursor: "cursor-pointer hover:scale-105",
        };
      case "locked":
        return {
          fill: "#A1A1AA",
          stroke: "#71717A",
          dropShadow: "#71717A",
          cursor: "cursor-not-allowed opacity-70",
        };
    }
  };

  const colors = getStageColors();
  const sizeValue = size === "large" ? 90 : 80;
  const iconSize = size === "large" ? "w-14 h-14" : "w-12 h-12";
  const textSize = size === "large" ? "text-[42px]" : "text-[36px]";
  const marginTopStyle = marginTop ? { marginTop: `${marginTop}px` } : {};

  return (
    <div
      ref={nodeRef}
      className={`relative ${colors.cursor} transition-all duration-300 ease-out flex-shrink-0`}
      onClick={handleNodeClick}
      style={{
        width: `${sizeValue}px`,
        height: `${sizeValue}px`,
        ...marginTopStyle,
      }}
    >
      <svg
        width={sizeValue}
        height={sizeValue}
        viewBox="0 0 70 81"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
        style={{
          filter: `drop-shadow(0 4px 0 ${colors.dropShadow})`,
        }}
      >
        <defs>
          <filter
            id={`filter_${status}_${nomorLatihan}`}
            x="0"
            y="0"
            width="69.282"
            height="80.2871"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values={
                status === "locked"
                  ? "0 0 0 0 0.443137 0 0 0 0 0.443137 0 0 0 0 0.478431 0 0 0 1 0"
                  : status === "completed"
                    ? "0 0 0 0 0.125491 0 0 0 0 0.349020 0 0 0 0 0.580393 0 0 0 1 0"
                    : "0 0 0 0 0.768627 0 0 0 0 0.517647 0 0 0 0 0.113725 0 0 0 1 0"
              }
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow"
              result="shape"
            />
          </filter>
        </defs>
        <g filter={`url(#filter_${status}_${nomorLatihan})`}>
          <path
            d="M28.641 1.60766C32.3538 -0.535937 36.9282 -0.535938 40.641 1.60766L63.282 14.6795C66.9948 16.823 69.282 20.7846 69.282 25.0718V51.2154C69.282 55.5025 66.9948 59.4641 63.282 61.6077L40.641 74.6795C36.9282 76.823 32.3538 76.823 28.641 74.6795L5.99997 61.6077C2.28716 59.4641 -2.67029e-05 55.5025 -2.67029e-05 51.2154V25.0718C-2.67029e-05 20.7846 2.28716 16.823 5.99997 14.6795L28.641 1.60766Z"
            fill={colors.fill}
          />
          <path
            d="M29.141 2.47363C32.5444 0.508688 36.7376 0.508688 40.141 2.47363L62.7816 15.5459C66.1849 17.5108 68.2814 21.1415 68.2816 25.0713V51.2158C68.2814 55.1456 66.1849 58.7763 62.7816 60.7412L40.141 73.8135C36.7376 75.7784 32.5444 75.7784 29.141 73.8135L6.50037 60.7412C3.09709 58.7763 1.00053 55.1456 1.00037 51.2158V25.0713C1.00053 21.1415 3.09709 17.5108 6.50037 15.5459L29.141 2.47363Z"
            stroke={colors.stroke}
            strokeWidth="2"
          />
        </g>
      </svg>

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {status === "completed" && (
          <img
            src="/imageAssets/fluent-color_checkmark-circle-48.svg"
            alt="checkmark"
            className="${iconSize} text-white drop-shadow-xl"
          />
        )}
        {status === "locked" && (
          <LockClosedFilled
            className={`${iconSize} text-white drop-shadow-lg`}
          />
        )}
        {status === "current" && (
          <span
            className={`${textSize} font-extrabold text-white drop-shadow-lg`}
          >
            {nomorLatihan}
          </span>
        )}
      </div>

      {/* Modal Backdrop */}
      {/* Modal dipindahkan ke parent component untuk menghindari re-render issues */}
    </div>
  );
}
