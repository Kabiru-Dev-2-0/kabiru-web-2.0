"use client";
"use strict";
exports.__esModule = true;
var exp_badge_1 = require("@/components/sd/exp-badge");
var profile_card_1 = require("@/components/sd/profile-card");
var progress_bar_1 = require("@/components/sd/progress-bar");
var game_button_1 = require("@/components/sd/game-button");
var game_store_1 = require("@/store/game-store");
var navigation_1 = require("next/navigation");
function TopHeader(_a) {
    var name = _a.name, level = _a.level, avatar = _a.avatar, _b = _a.showBack, showBack = _b === void 0 ? false : _b, _c = _a.showProgress, showProgress = _c === void 0 ? false : _c, _d = _a.currentProgress, currentProgress = _d === void 0 ? 0 : _d, _e = _a.totalProgress, totalProgress = _e === void 0 ? 0 : _e;
    var router = navigation_1.useRouter();
    var exp = game_store_1.useGameStore(function (state) { return state.exp; });
    return (React.createElement("div", { className: "absolute top-6 left-0 w-full z-20 px-4 md:px-10" },
        React.createElement("div", { className: "max-w-[1200px] mx-auto flex items-center justify-between" },
            React.createElement("div", { className: "flex items-center gap-8" },
                showBack && (React.createElement("div", null,
                    React.createElement(game_button_1["default"], { onClick: function () { return router.back(); }, variant: "yellow", size: "lg", icon: React.createElement("img", { src: "/imageAssets/sd/icon-arrow-left-big.png", alt: "back", className: "\n                    w-8\n                    h-8\n                    object-contain\n                    shrink-0\n                " }), className: "py-4" }, " KEMBALI"))
                // <button
                //   onClick={() =>
                //     router.back()
                //   }
                //   className="
                //     flex
                //     items-center
                //     gap-3
                //     bg-gradient-to-r
                //     from-yellow-400
                //     to-orange-400
                //     text-white
                //     font-black
                //     h-40
                //     px-4
                //     rounded-full
                //     whitespace-nowrap
                //     cursor-pointer
                //     min-w-fit
                //   "
                // >
                //   {/* ICON */}
                //   <img
                //     src="/imageAssets/sd/icon-arrow-left-big.png"
                //     alt="back"
                //     className="
                //       w-8
                //       h-8
                //       object-contain
                //       shrink-0
                //     "
                //   />
                //   {/* TEXT */}
                //   <span className="text-2xl">
                //     KEMBALI
                //   </span>
                // </button>
                ),
                showProgress && (React.createElement("div", { className: "ml-12 w-[520px]" },
                    React.createElement(progress_bar_1["default"], { current: currentProgress, total: totalProgress })))),
            React.createElement("div", { className: "flex items-center gap-3 md:gap-5" },
                React.createElement(exp_badge_1["default"], { value: exp, variant: "light" }),
                React.createElement(profile_card_1["default"], { name: name, level: level, avatar: avatar, variant: "light" })))));
}
exports["default"] = TopHeader;
