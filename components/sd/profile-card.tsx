"use client";

import { DoorArrowRight28Filled } from "@fluentui/react-icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "./modal";

type Props = {
  name: string;
  level: string;
  avatar: string;
  variant?: "default" | "light";
  className?: string; // Tambahkan className prop
  avatarSize?: "sm" | "md" | "lg"; // Opsi ukuran avatar
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

  // Ukuran avatar yang responsif
  const avatarSizes = {
    sm: "h-[60px] w-[60px] sm:h-[70px] sm:w-[70px]",
    md: "h-[64px] w-[64px] sm:h-[70px] sm:w-[70px] md:h-[80px] md:w-[80px]",
    lg: "h-[70px] w-[70px] sm:h-[80px] sm:w-[80px] md:h-[90px] md:w-[90px]",
  };

  // Ukuran padding untuk card
  const cardPadding = {
    sm: "pl-6 pr-[70px] py-1.5",
    md: "pl-7 pr-[80px] py-2.5",
    lg: "pl-8 pr-[90px] py-2.5",
  };

  function handleLogout() {
    localStorage.removeItem("sd_user");
    router.push("/");
  }

  return (
    <div className={`relative group ${className}`}>
      {/* PROFILE CARD */}
      <div
        className={`
          relative flex flex-col justify-center rounded-[40px]
          border-[3px] sm:border-[4px]
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

      {/* DROPDOWN */}
      <div
        className="
          absolute
          top-0
          right-0
          min-w-full
          opacity-0
          invisible
          group-hover:opacity-100
          group-hover:visible
          transition-all
          duration-200
          z-20
          border-slate-100
        ">
        <div
          className="
            overflow-hidden
            rounded-t-[40px]
            rounded-b-[16px]
            bg-slate-100
          ">
          {/* HEADER */}
          <div
            className={`
          relative flex flex-col justify-center rounded-[40px]
          border-[3px] sm:border-[4px]
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

          {/* ================= MODAL CONFIRM LOGOUT ================= */}
          {showConfirmModal && (
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
            </div>
          )}

          <button
            onClick={() => setShowConfirmModal(true)}
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
              hover:bg-red-50
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
