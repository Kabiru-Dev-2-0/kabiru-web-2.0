"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var level_header_1 = require("@/components/sd/map/level-header");
var module_node_1 = require("@/components/sd/map/module-node");
var client_1 = require("@/utils/supabase/client");
var modal_1 = require("@/components/sd/modal");
function LevelMap() {
    var supabase = client_1.createClient();
    var scrollRef = react_1.useRef(null);
    var _a = react_1.useState([]), modules = _a[0], setModules = _a[1];
    var _b = react_1.useState(false), openHelp = _b[0], setOpenHelp = _b[1];
    var _c = react_1.useState(true), loading = _c[0], setLoading = _c[1];
    // ================= FETCH =================
    react_1.useEffect(function () {
        fetchModules();
    }, []);
    function fetchModules() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, mapped, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, supabase
                                .from("moduls")
                                .select("*")
                                .eq("jenjang", "sd")
                                .order("nomor_modul", {
                                ascending: true
                            })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            console.log(error);
                            return [2 /*return*/];
                        }
                        mapped = (data || []).map(function (item) { return ({
                            id: item.id,
                            title: item.judul,
                            image: item.gambar || "/placeholder.png",
                            order: item.nomor_modul || 1
                        }); });
                        setModules(mapped);
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _b.sent();
                        console.log(err_1);
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    var userProgress = 0;
    return (React.createElement("main", { className: "relative h-screen w-screen bg-white overflow-hidden" },
        React.createElement("div", { className: "absolute inset-0 flex items-center justify-center" },
            React.createElement("div", { className: "relative h-full w-full flex items-center justify-center" },
                React.createElement("div", { className: "relative h-full max-h-screen aspect-[1512/888]" },
                    React.createElement("div", { className: "absolute inset-0 rounded-[32px] bg-white p-4 md:p-6" },
                        React.createElement("div", { className: "relative h-full w-full overflow-visible rounded-[28px]" },
                            React.createElement("img", { src: "/imageAssets/sd/map/background-map.png", alt: "background", className: "absolute inset-0 h-full w-full object-cover rounded-[28px]" }),
                            React.createElement(level_header_1["default"], { name: "Kaylaa", level: "Pemula", avatar: "/imageAssets/avatar/avatar-1.png" }),
                            React.createElement("div", { className: "absolute left-0 top-[50%] w-full -translate-y-[60%]" },
                                React.createElement("div", { className: "w-full overflow-x-auto overflow-y-hidden scrollbar-hide" },
                                    React.createElement("div", { ref: scrollRef, className: "flex items-center gap-16 px-8 min-w-max" }, loading ? (React.createElement("p", { className: "text-white text-xl font-bold" }, "Loading...")) : modules.length === 0 ? (React.createElement("p", { className: "text-white text-xl font-bold" }, "Modul SD belum tersedia")) : (modules.map(function (mod, i) {
                                        var state = i < userProgress
                                            ? "done"
                                            : i === userProgress
                                                ? "progress"
                                                : "locked";
                                        return (React.createElement("div", { key: mod.id, className: "flex items-center gap-10" },
                                            React.createElement(module_node_1["default"], { id_modul: mod.id, title: mod.title, image: mod.image, state: state }),
                                            i !== modules.length - 1 && (React.createElement("div", { className: "w-[82px] h-[12px] bg-white rounded-full" }))));
                                    }))))),
                            React.createElement("div", { className: "pointer-events-none absolute -bottom-[40px] -left-[1px] w-[22%] min-w-[160px]" },
                                React.createElement("svg", { viewBox: "0 0 305 116", className: "w-full h-full" },
                                    React.createElement("path", { d: "M0 0 H260 Q305 0 305 60 V116 H0 Z", fill: "white" }))),
                            React.createElement("div", { className: "pointer-events-none absolute -bottom-[40px] -right-[1px] w-[22%] min-w-[160px]" },
                                React.createElement("svg", { viewBox: "0 0 305 116", className: "w-full h-full scale-x-[-1]" },
                                    React.createElement("path", { d: "M0 0 H260 Q305 0 305 60 V116 H0 Z", fill: "white" }))),
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
                        React.createElement("div", { className: "w-10\n          h-10\n      \n          rounded-full\n      \n          bg-amber-200\n      \n          flex\n          items-center\n          justify-center\n      \n          text-amber-500\n          font-black\n          text-xl\n      \n          flex-shrink-0\n                      " }, "1"),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("h3", { className: "\n                        text-amber-500\n                        font-black\n                        uppercase\n                        text-[18px]\n                        leading-[1.2]\n                        tracking-normal\n                        line-clamp-2\n                      ", style: {
                                    fontFamily: "var(--font-lilita-one)"
                                } }, "Pilih materi yang tersedia"),
                            React.createElement("p", { className: "\n                        mt-2\n                        text-gray-800\n                        text-[16px]\n                        leading-[1.35]\n                        tracking-[0.05]\n                        font-normal\n                        line-clamp-3\n                      " }, "Mulailah dari modul yang terbuka dan selesaikan setiap aktivitas belajar."),
                            React.createElement("div", { className: "mt-6\n      \n          flex\n          justify-items-start\n          gap-12" },
                                React.createElement("div", { className: "flex flex-col items-center w-[160px]" },
                                    React.createElement("img", { src: "./imageAssets/sd/pb_opened.png", className: "w-42" }),
                                    React.createElement("p", { className: "mt-3\n          text-center\n      \n          text-gray-800\n          text-[14px]\n          leading-[1.35]" }, "Modul yang terbuka")),
                                React.createElement("div", { className: "flex flex-col items-center w-[160px]" },
                                    React.createElement("img", { src: "./imageAssets/sd/pb_done.png", className: "w-42" }),
                                    React.createElement("p", { className: "mt-3\n          text-center\n      \n          text-gray-800\n          text-[14px]\n          leading-[1.35]" }, "Modul sudah terselesaikan")),
                                React.createElement("div", { className: "flex flex-col items-center w-[160px]" },
                                    React.createElement("img", { src: "./imageAssets/sd/pb_locked.png", className: "w-42" }),
                                    React.createElement("p", { className: "mt-3\n          text-center\n      \n          text-gray-800\n          text-[14px]\n          leading-[1.35]" }, "Modul masih terkunci"))))),
                    React.createElement("div", { className: "flex items-start gap-4" },
                        React.createElement("div", { className: "flex-shrink-0\n                      w-[32px]\n                      h-[32px]\n                      rounded-full\n                      bg-amber-200\n                      flex\n                      items-center\n                      justify-center\n                      text-amber-500\n                      font-black\n                      text-[18px]\n                      " }, "2"),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("h3", { className: "\n                        text-amber-500\n                        font-black\n                        uppercase\n                        text-[18px]\n                        leading-[1.2]\n                        tracking-normal\n                        line-clamp-2\n                      ", style: {
                                    fontFamily: "var(--font-lilita-one)"
                                } }, "EKSPLORASI MODUL dAN LATIHAN SOAL"),
                            React.createElement("div", { className: "mt-3 flex items-center gap-2" },
                                React.createElement("p", { className: "\n                        mt-2\n                        text-gray-800\n                        text-[16px]\n                        leading-[1.35]\n                        tracking-[0.05]\n                        font-normal\n                      " }, "Kumpulkan"),
                                React.createElement("img", { src: "/imageAssets/sd/map/icon/icon-exp.png", className: "w-6 h-6" }),
                                React.createElement("p", { className: "\n                        mt-2\n                        text-gray-800\n                        text-[16px]\n                        leading-[1.35]\n                        tracking-[0.05]\n                        font-normal\n                      " }, "EXP dengan menyelesaikan masing-masing soal.")))),
                    React.createElement("div", { className: "flex items-start gap-4" },
                        React.createElement("div", { className: "\n                        w-10\n                        h-10\n      \n                        rounded-full\n      \n                        bg-amber-200\n      \n                        flex\n                        items-center\n                        justify-center\n      \n                        text-amber-500\n                        font-black\n                        text-xl\n      \n                        flex-shrink-0\n                      " }, "3"),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("h3", { className: "\n                        text-amber-500\n                        font-black\n                        uppercase\n                        text-[18px]\n                        leading-[1.2]\n                        tracking-normal\n                        line-clamp-2\n                      ", style: {
                                    fontFamily: "var(--font-lilita-one)"
                                } }, "Buka MODUL berikutnya"),
                            React.createElement("p", { className: "\n                        mt-2\n                        text-gray-800\n                        text-[16px]\n                        leading-[1.35]\n                        tracking-[0.05]\n                        font-normal\n                        line-clamp-3\n                      " }, "Setelah modul selesai, kamu bisa melanjutkan ke modul berikutnya."))),
                    React.createElement("div", { className: "flex items-start gap-4" },
                        React.createElement("div", { className: "\n                        w-10\n                        h-10\n      \n                        rounded-full\n      \n                        bg-amber-200\n      \n                        flex\n                        items-center\n                        justify-center\n      \n                        text-amber-500\n                        font-black\n                        text-xl\n      \n                        flex-shrink-0\n                      " }, "4"),
                        React.createElement("div", { className: "flex-1 min-w-0" },
                            React.createElement("h3", { className: "\n                        text-amber-500\n                        font-black\n                        uppercase\n                        text-[18px]\n                        leading-[1.2]\n                        tracking-normal\n                        line-clamp-2\n                      ", style: {
                                    fontFamily: "var(--font-lilita-one)"
                                } }, "EKSPLORASI MODUL dAN LATIHAN SOAL"),
                            React.createElement("p", { className: "\n                        mt-2\n                        text-gray-800\n                        text-[16px]\n                        leading-[1.35]\n                        tracking-[0.05]\n                        font-normal\n                        line-clamp-3\n                      " }, "Semakin banyak belajar, semakin tinggi level dan peringkat yang bisa kamu dapatkan.")))))))));
}
exports["default"] = LevelMap;
