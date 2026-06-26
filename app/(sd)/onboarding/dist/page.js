"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var level_header_1 = require("@/components/sd/map/level-header");
var client_1 = require("@/utils/supabase/client");
var flat_1 = require("react-fluentui-emoji/lib/flat");
var game_button_1 = require("@/components/sd/game-button");
var modal_1 = require("@/components/sd/modal");
var navigation_1 = require("next/navigation");
function OnBoarding() {
    var supabase = client_1.createClient();
    var router = navigation_1.useRouter();
    var _a = react_1.useState(false), openHelp = _a[0], setOpenHelp = _a[1];
    return (React.createElement("main", { className: "relative h-screen w-screen bg-white overflow-hidden" },
        React.createElement("div", { className: "absolute inset-0 flex items-center justify-center" },
            React.createElement("div", { className: "relative h-full w-full flex items-center justify-center" },
                React.createElement("div", { className: "relative h-full max-h-screen aspect-[1512/888]" },
                    React.createElement("div", { className: "absolute inset-0 rounded-[32px] bg-white p-4 md:p-6" },
                        React.createElement("div", { className: "relative h-full w-full overflow-visible rounded-[28px]" },
                            React.createElement("img", { src: "/imageAssets/sd/map/background-map.png", alt: "background", className: "absolute inset-0 h-full w-full object-cover rounded-[28px]" }),
                            React.createElement(level_header_1["default"], { name: "Kaylaa", level: "Pemula", avatar: "/imageAssets/avatar/avatar-1.png" }),
                            React.createElement("div", { className: "pointer-events-none absolute -bottom-[40px] -left-[1px] w-[22%] min-w-[160px]" },
                                React.createElement("svg", { viewBox: "0 0 305 116", className: "w-full h-full" },
                                    React.createElement("path", { d: "M0 0 H260 Q305 0 305 60 V116 H0 Z", fill: "white" }))),
                            React.createElement("div", { className: "pointer-events-none absolute -bottom-[40px] -right-[1px] w-[22%] min-w-[160px]" },
                                React.createElement("svg", { viewBox: "0 0 305 116", className: "w-full h-full scale-x-[-1]" },
                                    React.createElement("path", { d: "M0 0 H260 Q305 0 305 60 V116 H0 Z", fill: "white" }))),
                            React.createElement("div", { className: "\n                            absolute\n                            inset-0\n                            z-10\n\n                            flex\n                            flex-col\n                            items-center\n                            justify-center\n                        " },
                                React.createElement("img", { src: "/imageAssets/sd/onboarding/logo.png", alt: "Detektif Logika", className: "\n                            w-[280px]\n                            md:w-[420px]\n                            lg:w-[720px]\n                            object-contain\n                            mb-8\n                            " }),
                                React.createElement(game_button_1["default"], { onClick: function () { return router.push("/map"); }, variant: "yellow", size: "lg", icon: React.createElement("img", { src: "/imageAssets/sd/icon-play-fill.png", alt: "play", className: "w-8 h-8" }) }, "MULAI"),
                                React.createElement("div", { className: "\n                            mt-8\n\n                            flex\n                            items-center\n                            gap-4\n                            " },
                                    React.createElement(game_button_1["default"], { variant: "blue", size: "md", icon: React.createElement(flat_1.IconFVideoGame, { size: 36 }) }, "BERMAIN"),
                                    React.createElement(game_button_1["default"], { variant: "green", size: "md", icon: React.createElement(flat_1.IconFTrophy, { size: 36 }) }, "PERINGKAT"))),
                            React.createElement("div", { onClick: function () { return setOpenHelp(true); }, className: "absolute bottom-4 left-4 z-20 flex items-center gap-2 cursor-pointer" },
                                React.createElement("img", { src: "/imageAssets/sd/map/icon/icon-ask-circle-super-mini.png", alt: "help", className: "w-8 h-8" }),
                                React.createElement("span", { className: "text-gray-700 font-semibold underline text-lg" }, "Petunjuk Belajar")),
                            React.createElement("div", { className: "absolute bottom-2 right-0 z-20 flex items-center gap-3" },
                                React.createElement("span", { className: "text-gray-600 text-lg font-medium" }, "Developed by"),
                                React.createElement("img", { src: "/imageAssets/sd/logo/logo-kabiru-biru.png", alt: "Kabiru", className: "h-12 object-contain" }))))))),
        openHelp && (React.createElement("div", { className: "absolute inset-0 bg-[#1F0234]/67 items-center justify-center", onClick: function () { return setOpenHelp(false); } },
            React.createElement(modal_1["default"], { title: "PETUNJUK BELAJAR", width: "w-[800px]", onClose: function () { return setOpenHelp(false); } },
                React.createElement("div", { className: "space-y-8" },
                    React.createElement("div", { className: "flex items-start gap-4" },
                        React.createElement("div", { className: "w-10\n    h-10\n\n    rounded-full\n\n    bg-amber-200\n\n    flex\n    items-center\n    justify-center\n\n    text-amber-500\n    font-black\n    text-xl\n\n    flex-shrink-0\n                " }, "1"),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("h3", { className: "\n                  text-amber-500\n                  font-black\n                  uppercase\n                  text-[18px]\n                  leading-[1.2]\n                  tracking-normal\n                  line-clamp-2\n                ", style: {
                                    fontFamily: "var(--font-lilita-one)"
                                } }, "Pilih materi yang tersedia"),
                            React.createElement("p", { className: "\n                  mt-2\n                  text-gray-800\n                  text-[16px]\n                  leading-[1.35]\n                  tracking-[0.05]\n                  font-normal\n                  line-clamp-3\n                " }, "Mulailah dari modul yang terbuka dan selesaikan setiap aktivitas belajar."),
                            React.createElement("div", { className: "mt-6\n\n    flex\n    justify-items-start\n    gap-12" },
                                React.createElement("div", { className: "flex flex-col items-center w-[160px]" },
                                    React.createElement("img", { src: "./imageAssets/sd/pb_opened.png", className: "w-42" }),
                                    React.createElement("p", { className: "mt-3\n    text-center\n\n    text-gray-800\n    text-[14px]\n    leading-[1.35]" }, "Modul yang terbuka")),
                                React.createElement("div", { className: "flex flex-col items-center w-[160px]" },
                                    React.createElement("img", { src: "./imageAssets/sd/pb_done.png", className: "w-42" }),
                                    React.createElement("p", { className: "mt-3\n    text-center\n\n    text-gray-800\n    text-[14px]\n    leading-[1.35]" }, "Modul sudah terselesaikan")),
                                React.createElement("div", { className: "flex flex-col items-center w-[160px]" },
                                    React.createElement("img", { src: "./imageAssets/sd/pb_locked.png", className: "w-42" }),
                                    React.createElement("p", { className: "mt-3\n    text-center\n\n    text-gray-800\n    text-[14px]\n    leading-[1.35]" }, "Modul masih terkunci"))))),
                    React.createElement("div", { className: "flex items-start gap-4" },
                        React.createElement("div", { className: "flex-shrink-0\n                w-[32px]\n                h-[32px]\n                rounded-full\n                bg-amber-200\n                flex\n                items-center\n                justify-center\n                text-amber-500\n                font-black\n                text-[18px]\n                " }, "2"),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("h3", { className: "\n                  text-amber-500\n                  font-black\n                  uppercase\n                  text-[18px]\n                  leading-[1.2]\n                  tracking-normal\n                  line-clamp-2\n                ", style: {
                                    fontFamily: "var(--font-lilita-one)"
                                } }, "EKSPLORASI MODUL dAN LATIHAN SOAL"),
                            React.createElement("div", { className: "mt-3 flex items-center gap-2" },
                                React.createElement("p", { className: "\n                  mt-2\n                  text-gray-800\n                  text-[16px]\n                  leading-[1.35]\n                  tracking-[0.05]\n                  font-normal\n                " }, "Kumpulkan"),
                                React.createElement("img", { src: "/imageAssets/sd/map/icon/icon-exp.png", className: "w-6 h-6" }),
                                React.createElement("p", { className: "\n                  mt-2\n                  text-gray-800\n                  text-[16px]\n                  leading-[1.35]\n                  tracking-[0.05]\n                  font-normal\n                " }, "EXP dengan menyelesaikan masing-masing soal.")))),
                    React.createElement("div", { className: "flex items-start gap-4" },
                        React.createElement("div", { className: "\n                  w-10\n                  h-10\n\n                  rounded-full\n\n                  bg-amber-200\n\n                  flex\n                  items-center\n                  justify-center\n\n                  text-amber-500\n                  font-black\n                  text-xl\n\n                  flex-shrink-0\n                " }, "3"),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("h3", { className: "\n                  text-amber-500\n                  font-black\n                  uppercase\n                  text-[18px]\n                  leading-[1.2]\n                  tracking-normal\n                  line-clamp-2\n                ", style: {
                                    fontFamily: "var(--font-lilita-one)"
                                } }, "Buka MODUL berikutnya"),
                            React.createElement("p", { className: "\n                  mt-2\n                  text-gray-800\n                  text-[16px]\n                  leading-[1.35]\n                  tracking-[0.05]\n                  font-normal\n                  line-clamp-3\n                " }, "Setelah modul selesai, kamu bisa melanjutkan ke modul berikutnya."))),
                    React.createElement("div", { className: "flex items-start gap-4" },
                        React.createElement("div", { className: "\n                  w-10\n                  h-10\n\n                  rounded-full\n\n                  bg-amber-200\n\n                  flex\n                  items-center\n                  justify-center\n\n                  text-amber-500\n                  font-black\n                  text-xl\n\n                  flex-shrink-0\n                " }, "4"),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("h3", { className: "\n                  text-amber-500\n                  font-black\n                  uppercase\n                  text-[18px]\n                  leading-[1.2]\n                  tracking-normal\n                  line-clamp-2\n                ", style: {
                                    fontFamily: "var(--font-lilita-one)"
                                } }, "EKSPLORASI MODUL dAN LATIHAN SOAL"),
                            React.createElement("p", { className: "\n                  mt-2\n                  text-gray-800\n                  text-[16px]\n                  leading-[1.35]\n                  tracking-[0.05]\n                  font-normal\n                  line-clamp-3\n                " }, "Semakin banyak belajar, semakin tinggi level dan peringkat yang bisa kamu dapatkan.")))))))));
}
exports["default"] = OnBoarding;
