"use client";
"use strict";
exports.__esModule = true;
var flat_1 = require("react-fluentui-emoji/lib/flat");
var game_button_1 = require("./game-button");
function Modal(_a) {
    var title = _a.title, children = _a.children, onClose = _a.onClose, _b = _a.width, width = _b === void 0 ? "w-[520px]" : _b;
    return (React.createElement("div", { className: "fixed inset-0 z-[999] flex items-center justify-center" },
        React.createElement("div", { className: "\n          relative\n          " + width + "\n          max-w-[95vw]\n          max-h-[85vh]\n\n          rounded-[28px]\n          bg-[#FFB236]\n\n          px-4\n          pt-4\n          pb-16\n        " },
            React.createElement("div", { className: "\n            absolute\n            -top-10\n            left-1/2\n            -translate-x-1/2\n\n            bg-[#FFB236]\n\n            px-10\n            py-2\n\n            rounded-t-[22px]\n\n            whitespace-nowrap\n\n            text-white\n            font-black\n            text-[24px]\n\n            z-30\n          " }, title.toUpperCase()),
            React.createElement("div", { className: "\n            absolute\n            top-[-18px]\n            right-[-10px]\n\n            z-40\n          " },
                React.createElement(game_button_1["default"], { variant: "red", size: "lg", onClick: onClose, icon: React.createElement("img", { src: "./imageAssets/sd/icon-crossmark.png", className: "w-8 h-10 ml-3" }) })),
            React.createElement("div", { className: "\n            rounded-[20px]\n            bg-yellow-50\n\n            px-8\n            py-7\n            pb-16\n\n            h-[70vh]\n            overflow-y-auto\n\n            custom-scroll\n          " }, children),
            React.createElement("div", { className: "\n            absolute\n            left-1/2\n            bottom-[30px]\n            -translate-x-1/2\n\n            z-30\n          " },
                React.createElement(game_button_1["default"], { variant: "blue", size: "lg", onClick: onClose, icon: React.createElement(flat_1.IconFRocket, { size: 30 }) }, "SIAP BELAJAR"))),
        React.createElement("style", null, "\n        .custom-scroll::-webkit-scrollbar {\n          width: 18px;\n          height: 12px\n        }\n\n        .custom-scroll::-webkit-scrollbar-track {\n          background:rgba(143, 143, 143, 0.36);\n          border-radius: 14px;\n        }\n\n        .custom-scroll::-webkit-scrollbar-thumb {\n          background: rgba(255, 255, 255, 1);\n          border-radius: 14px;\n        }\n      ")));
}
exports["default"] = Modal;
