"use client";

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
  secondButtonVariant?: "blue" | "red" | "yellow" | "gray";
  onSecondButtonClick?: () => void;
  hideButton?: boolean;
  hideClose?: boolean;
};

export default function Modal({
  title,
  children,
  onClose,
  width = "lg:w-[520px]",
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
    <div
      className="
        fixed
        inset-0
        z-[999]

        overflow-y-auto

        flex
        justify-center

        px-4
        py-8
      "
    >
      <div
        className="
          my-auto
          flex
          items-center
          justify-center
          w-[100%]
          md:w-[60%]
        "
      >
        {/* CONTAINER */}
        <div
          className={`
            relative

            w-[95vw]
            max-w-[420px]
            sm:max-w-[500px]
            lg:max-w-none
            ${width}

            rounded-[22px]
            lg:rounded-[28px]

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
              -top-8
              lg:-top-10

              left-1/2
              -translate-x-1/2

              bg-[#FFB236]

              px-6
              lg:px-10

              py-2

              rounded-t-[18px]
              lg:rounded-t-[22px]

              whitespace-nowrap

              text-white
              font-black

              text-[18px]
              sm:text-[22px]
              lg:text-[24px]

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
                top-[-14px]
                right-[-8px]
                lg:top-[-18px]
                lg:right-[-10px]
                z-40
              "
            >
              <GameButton
                variant="red"
                size="lg"
                onClick={onClose}
                className="scale-75 sm:scale-90 lg:scale-100"
                icon={
                  <img
                    src="/imageAssets/sd/icon-crossmark.png"
                    className="w-6 h-7 lg:w-8 lg:h-10 ml-0"
                  />
                }
              />
            </div>
          )}

          {/* CONTENT */}
          <div
            className={`
              rounded-[16px]
              lg:rounded-[20px]

              bg-yellow-50

              px-4
              sm:px-6
              lg:px-8

              pt-4
              sm:pt-5
              lg:pt-7

              pb-4
              sm:pb-4
              lg:pb-6

              ${
                autoHeight
                  ? "min-h-[140px]"
                  : `
                    h-[min(62vh,520px)]
                    sm:h-[min(65vh,560px)]
                    lg:h-[70vh]
                  `
              }

              overflow-y-auto
              overflow-x-hidden

              [-webkit-overflow-scrolling:touch]

              custom-scroll
            `}
          >
            {children}
          </div>

          {/* BUTTON */}
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
                onClick={onButtonClick || onClose}
                icon={buttonIcon}
              >
                {buttonText}
              </GameButton>

              {secondButtonText && (
                <GameButton
                  variant={secondButtonVariant}
                  size="md"
                  onClick={onSecondButtonClick || onClose}
                  icon={secondButtonIcon}
                >
                  {secondButtonText}
                </GameButton>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 18px;
        }

        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(143,143,143,.36);
          border-radius: 14px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          background: white;
          border-radius: 14px;
        }
      `}</style>
    </div>
  );
}