"use client";
"use strict";
exports.__esModule = true;
function GameButton(_a) {
    var children = _a.children, icon = _a.icon, onClick = _a.onClick, _b = _a.variant, variant = _b === void 0 ? "green" : _b, _c = _a.size, size = _c === void 0 ? "md" : _c, _d = _a.className, className = _d === void 0 ? "" : _d;
    var variantClasses = {
        green: "bg-gradient-to-r from-[#47E5A0] to-[#53A058]",
        blue: "bg-gradient-to-r from-[#3A63FF] to-[#3D8BFF]",
        yellow: "bg-gradient-to-r from-yellow-400 to-orange-400",
        red: "bg-gradient-to-r from-[#BC1C28] to-[#FF5040]",
        gray: "bg-gradient-to-r from-[#E9E9E9] to-[#FFFFFF]"
    };
    var sizeClasses = {
        sm: {
            button: "px-5 py-2",
            text: "text-[16px]",
            icon: "w-5 h-5"
        },
        md: {
            button: "px-8 py-4",
            text: "text-[18px]",
            icon: "w-8 h-8"
        },
        lg: {
            button: "px-8 py-4",
            text: "text-[24px]",
            icon: "w-10 h-10"
        }
    };
    var isIconOnly = icon && !children;
    return (React.createElement("button", { onClick: onClick, className: "\n        flex\n        items-center\n        " + (children ? "gap-3" : "") + "\n        " + (isIconOnly
            ? "w-14 h-14"
            : sizeClasses[size].button) + "\n\n        rounded-full\n\n        text-white\n        font-black\n\n        hover:scale-105\n        transition-all\n\n        " + variantClasses[variant] + "\n        " + className + "\n      " },
        icon && (React.createElement("div", { className: "\n                    flex\n                    items-center\n                    justify-center\n                    leading-none\n                    shrink-0\n                    " }, icon)),
        children && (React.createElement("span", { className: "\n        text-white\n        font-black\n        " + sizeClasses[size].text + "\n        " }, children))));
}
exports["default"] = GameButton;
