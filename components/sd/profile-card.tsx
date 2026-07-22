"use client";

import { DoorArrowRight28Filled } from "@fluentui/react-icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Modal from "./modal";
import { IconFTrophy } from "react-fluentui-emoji/lib/flat";
import LeaderBoard from "./leaderboard/leaderboard";

type Props = {
  name: string;
  level: string;
  avatar: string;
  variant?: "default" | "light";
  className?: string;
  avatarSize?: "sm" | "md" | "lg";
};

export default function ProfileCard({
  name,
  level,
  avatar,
  variant = "default",
  className = "",
  avatarSize = "md",
}: Props) {
  const isLight = variant === "light";
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // === STATE KLIK DROPDOWN ===
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ukuran avatar
  const avatarSizes = {
    sm: "h-[60px] w-[60px] sm:h-[70px] sm:w-[70px]",
    md: "h-[64px] w-[64px] sm:h-[70px] sm:w-[70px] md:h-[80px] md:w-[80px]",
    lg: "h-[70px] w-[70px] sm:h-[80px] sm:w-[80px] md:h-[90px] md:w-[90px]",
  };

  // Ukuran padding untuk card
  const cardPadding = {
    sm: "pl-5  pr-[50px] md:pr-[70px] py-1.5",
    md: "pl-6  pr-[60px] md:pr-[80px] py-2.5",
    lg: "pl-7  pr-[70px] md:pr-[90px] py-2.5",
  };

  function handleLogout() {
    localStorage.removeItem("sd_user");
    router.push("/");
  }

  return (
    <div className={`relative group ${className}`}>
      {/* ================= MODAL CONFIRM LOGOUT (PORTAL) ================= */}
      {mounted &&
        showConfirmModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-[#1F0234]/67 flex items-center justify-center p-4">
            <Modal
              title="Apakah Kamu Yakin?"
              width="w-full max-w-[500px]"
              autoHeight
              buttonText="Keluar"
              buttonVariant="red"
              onButtonClick={handleLogout}
              secondButtonText="Batal"
              secondButtonVariant="gray"
              onSecondButtonClick={() => setShowConfirmModal(false)}
              onClose={() => setShowConfirmModal(false)}>
              <div className="py-6 sm:py-8 px-2">
                <p
                  className="
                        text-center
                        text-[18px] sm:text-[20px]
                        font-bold
                        text-[#1E293B]
                      ">
                  Apakah kamu yakin untuk Keluar Akun?
                </p>
              </div>
            </Modal>
          </div>,
          document.body,
        )}

      {/* ================= LEADERBOARD (PORTAL) ================= */}
      {mounted &&
        showLeaderboard &&
        createPortal(
          <div className="fixed inset-0 z-[9999]">
            <LeaderBoard onClose={() => setShowLeaderboard(false)} />
          </div>,
          document.body,
        )}

      {/* === INVISIBLE OVERLAY UNTUK MENUTUP DROPDOWN DI MOBILE JIKA DIKLIK LUAR === */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-[15] md:hidden"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* PROFILE CARD */}
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`
          relative flex flex-col justify-center rounded-[40px]
          border-[3px] sm:border-[4px]
          ${cardPadding[avatarSize]}
          transition-all duration-200 cursor-pointer z-20
          ${
            isLight
              ? "bg-slate-100 border-slate-100 text-gray-800"
              : "bg-[#4F4F4F]/50 border-white text-white"
          }
        `}>
        <p className="text-right mr-1 text-base sm:text-lg md:text-xl font-black uppercase whitespace-nowrap">
          {name}
        </p>

        <div className="mt-0 mr-1 flex items-center justify-end gap-1 sm:gap-2 text-orange-400">
          <span className="text-sm sm:text-base">📚</span>
          <span className="text-xs sm:text-sm md:text-base font-bold whitespace-nowrap">
            {level}
          </span>
        </div>

        {/* AVATAR */}
        <div className="absolute right-[-3px] top-1/2 z-30 -translate-y-1/2 translate-x-[2%] sm:translate-x-[1%]">
          <div
            className={`
              overflow-hidden rounded-full 
              border-[3px] sm:border-[4px] md:border-[5px] 
              border-white bg-white
              ${avatarSizes[avatarSize]}
            `}>
            <img
              src={avatar}
              className="h-full w-full object-cover"
              alt={name}
            />
          </div>
        </div>
      </div>

      {/* DROPDOWN */}
      <div
        className={`
          absolute
          right-0
          min-w-full

          ${
            isLight
              ? "top-4 md:top-5"
              : "top-0"
          }

          transition-all
          duration-200
          z-30
          border-slate-100

          ${
            isDropdownOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          }

          md:group-hover:opacity-100
          md:group-hover:visible
        `}>
        <div
          className="
            overflow-hidden
            rounded-t-[40px]
            rounded-b-[16px]
            bg-slate-100
          ">
          {/* HEADER (Bisa diklik lagi untuk menutup menu) */}
          <div
            onClick={() => setIsDropdownOpen(false)}
            className={`
          relative flex flex-col justify-center rounded-[40px]
          border-[3px] sm:border-[4px] cursor-pointer
          ${cardPadding[avatarSize]}
          transition-all duration-200
          ${
            isLight
              ? "bg-slate-100 border-slate-100 text-gray-800"
              : "bg-[#4F4F4F]/50 border-white text-white"
          }
        `}>
            <p className="text-right mr-1 text-base sm:text-lg md:text-xl font-black uppercase whitespace-nowrap">
              {name}
            </p>

            <div className="mt-0 mr-1 flex items-center justify-end gap-1 sm:gap-2 text-orange-400">
              <span className="text-sm sm:text-base">📚</span>
              <span className="text-xs sm:text-sm md:text-base font-bold whitespace-nowrap">
                {level}
              </span>
            </div>

            {/* AVATAR */}
            <div className="absolute right-[-3px] top-1/2 z-30 -translate-y-1/2 translate-x-[2%] sm:translate-x-[1%]">
              <div
                className={`
              overflow-hidden rounded-full 
              border-[3px] sm:border-[4px] md:border-[5px] 
              border-white bg-white
              ${avatarSizes[avatarSize]}
            `}>
                <img
                  src={avatar}
                  className="h-full w-full object-cover"
                  alt={name}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setShowLeaderboard(true);
              setIsDropdownOpen(false); // Tutup dropdown setelah ditekan
            }}
            className="
              w-full
              flex
              items-center
              gap-2
              px-4 sm:px-5
              py-3 sm:py-4
              text-left
              font-semibold
              text-sm sm:text-base
              text-gray-800
              hover:bg-amber-100
              transition-colors
              duration-200
            ">
            <IconFTrophy size={24}></IconFTrophy>
            Peringkat
          </button>

          <button
            onClick={() => {
              setShowConfirmModal(true);
              setIsDropdownOpen(false); // Tutup dropdown setelah ditekan
            }}
            className="
              w-full
              flex
              items-center
              gap-2
              px-4 sm:px-5
              py-3 sm:py-4
              text-left
              font-semibold
              text-sm sm:text-base
              text-rose-700
              hover:bg-red-100
              transition-colors
              duration-200
            ">
            <DoorArrowRight28Filled
              style={{ color: "#C70036" }}
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}