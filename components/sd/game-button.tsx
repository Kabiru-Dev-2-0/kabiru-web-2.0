"use client";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;

  variant?: "green" | "blue" | "yellow" | "red" | "gray";

  size?: "sm" | "md" | "lg";

  className?: string;

  disabled?: boolean;
};

export default function GameButton({
  children,
  icon,
  onClick,
  variant = "green",
  size = "md",
  className = "",
  disabled = false,
  ...rest
}: Props) {
  const variantClasses = {
    green: "bg-gradient-to-r from-[#47E5A0] to-[#53A058]",

    blue: "bg-gradient-to-r from-[#3A63FF] to-[#3D8BFF]",

    yellow: "bg-gradient-to-r from-yellow-400 to-orange-400",

    red: "bg-gradient-to-r from-[#BC1C28] to-[#FF5040]",

    gray: "bg-gradient-to-r from-[#E9E9E9] to-[#FFFFFF]",
  };

  const isDisabled = disabled;

  const sizeClasses = {
    sm: {
      button: "px-5 py-2",
      text: "text-[16px]",
      icon: "w-5 h-5",
    },

    md: {
      button: "px-8 py-4",
      text: "text-[18px]",
      icon: "w-8 h-8",
    },

    lg: {
      button: "px-8 py-4",
      text: "text-[24px]",
      icon: "w-10 h-10",
    },
  };

  const textColor = isDisabled
  ? "text-gray-400"
  : variant === "gray"
  ? "text-gray-600"
  : "text-white";

  const isIconOnly = icon && !children;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      className={`
        flex
        items-center
        ${children ? "gap-3" : ""}
        ${isIconOnly ? "w-14 h-14" : sizeClasses[size].button}

        rounded-full

        font-black
        transition-all

        ${
          disabled
            ? "cursor-not-allowed"
            : "hover:scale-105 cursor-pointer"
        }

        ${disabled ? variantClasses.gray : variantClasses[variant]}
        ${className}
      `}>
      {icon && (
        <div
        className={`
          flex
          items-center
          justify-center
          shrink-0

          ${
            isDisabled
              ? "opacity-40"
              : variant === "gray"
              ? "text-gray-600"
              : ""
          }
        `}
      >
        {icon}
      </div>
      )}

      {children && (
        <span
          className={`
            ${textColor}

            font-black
            ${sizeClasses[size].text}
          `}>
          {children}
        </span>
      )}
    </button>
  );
}
