"use client";

import {
  IconFCrossMark,
  IconFRocket,
} from "react-fluentui-emoji/lib/flat";

import GameButton from "./game-button";

type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: string;
  autoHeight?: boolean;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: "blue" | "red" | "yellow";
  onButtonClick?: () => void;
  secondButtonText?: string;
  secondButtonIcon?: React.ReactNode;
  secondButtonVariant?: "blue" | "red" | "yellow"| "gray";
  onSecondButtonClick?: () => void;
  hideButton?: boolean;
  hideClose?: boolean;
};

export default function Modal({
  title,
  children,
  onClose,
  width = "w-[520px]",
  autoHeight = false,
  buttonText = "SIAP BELAJAR",
  buttonIcon,
  buttonVariant = "blue",
  onButtonClick,
  secondButtonText,
  secondButtonIcon,
  secondButtonVariant = "yellow",
  onSecondButtonClick,
  hideButton = false,
  hideClose = false,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* CONTAINER */}
      <div
        className={`
          relative
          ${width}
          max-w-[95vw]
          max-h-[85vh]

          rounded-[28px]
          bg-[#FFB236]

          px-4
          pt-4
          pb-16
        `}
      >
        {/* TITLE */}
        <div
          className="
            absolute
            -top-10
            left-1/2
            -translate-x-1/2

            bg-[#FFB236]

            px-10
            py-2

            rounded-t-[22px]

            whitespace-nowrap

            text-white
            font-black
            text-[24px]

            z-30
          "
        >
          {title.toUpperCase()}
        </div>

        {/* CLOSE */}
        {!hideClose && (
          <div
            className="
              absolute
              top-[-18px]
              right-[-10px]
              z-40
            "
          >
            <GameButton
              variant="red"
              size="lg"
              onClick={onClose}
              icon={
                <img
                  src="/imageAssets/sd/icon-crossmark.png"
                  className="w-8 h-10 ml-3"
                />
              }
            />
          </div>
        )}

        {/* CONTENT */}
        <div
          className={`
            rounded-[20px]
            bg-yellow-50

            px-8
            py-7

            ${
              autoHeight
                ? "min-h-[120px]"
                : "h-[70vh] overflow-y-auto"
            }

            custom-scroll
          `}
        >
          {children}
        </div>

        {/* BUTTON OVERLAY */}
        {!hideButton && (
        <div
          className="
            absolute
            left-1/2
            bottom-[30px]
            -translate-x-1/2

            flex
            items-center
            gap-4

            z-30
          "
        >
          <GameButton
            variant={buttonVariant}
            size="md"
            onClick={
              onButtonClick || onClose
            }
            icon={buttonIcon}
          >
            {buttonText}
          </GameButton>

          {secondButtonText && (
            <GameButton
              variant={secondButtonVariant}
              size="md"
              onClick={
                onSecondButtonClick ||
                onClose
              }
              icon={secondButtonIcon}
            >
              {secondButtonText}
            </GameButton>
          )}
        </div>
      )}
      </div>

      {/* SCROLLBAR */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 18px;
          height: 12px
        }

        .custom-scroll::-webkit-scrollbar-track {
          background:rgba(143, 143, 143, 0.36);
          border-radius: 14px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 1);
          border-radius: 14px;
        }
      `}</style>
    </div>
  );
}