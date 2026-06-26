"use client";

import {
  CardUi24Filled,
  DoorArrowLeft24Filled,
  DoorArrowRight20Regular,
  DoorArrowRight28Filled,
  Person24Filled,
  Person28Filled,
} from "@fluentui/react-icons";
import { color } from "framer-motion";
import {
  IconFPersonDefault,
  IconFTrophy,
  IconFWorldMap,
} from "react-fluentui-emoji/lib/flat";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "./modal";

type Props = {
  name: string;
  level: string;
  avatar: string;
  variant?: "default" | "light";
};

export default function ProfileCard({
  name,
  level,
  avatar,
  variant = "default",
}: Props) {
  const isLight = variant === "light";
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  function handleLogout() {
    localStorage.removeItem("sd_user");

    router.push("/");
  }

  return (
    <div className="relative group">
      {/* PROFILE CARD */}
      <div
        className={`
          relative flex flex-col justify-center rounded-[40px]
          border-[4px] pl-8 pr-[90px] py-2
          ${
            isLight
              ? "bg-slate-100 border-slate-100 text-gray-800"
              : "bg-[#4F4F4F]/50 border-white text-white"
          }
        `}>
        <p className="text-right text-lg font-black uppercase whitespace-nowrap">
          {name}
        </p>

        <div className="mt-0 flex items-center justify-end gap-2 text-orange-400">
          <span>📚</span>

          <span className="text-sm font-bold whitespace-nowrap">{level}</span>
        </div>

        {/* AVATAR */}
        <div className="absolute right-0 top-1/2 z-30 -translate-y-1/2 translate-x-[1%]">
          <div className="h-[80px] w-[80px] overflow-hidden rounded-full border-[5px] border-white bg-white">
            <img src={avatar} className="h-full w-full object-cover" />
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
              border-[4px] pl-8 pr-[90px] py-2
              ${
                isLight
                  ? "bg-slate-100 border-slate-100 text-gray-800"
                  : "bg-[#4F4F4F]/50 border-slate-100 text-white"
              }
              `}>
            <p className="text-right text-lg font-black uppercase whitespace-nowrap">
              {name}
            </p>

            <div className="mt-0 flex items-center justify-end gap-2 text-orange-400">
              <span>📚</span>

              <span className="text-sm font-bold whitespace-nowrap">
                {level}
              </span>
            </div>

            {/* AVATAR */}
            <div className="absolute right-0 top-1/2 z-30 -translate-y-1/2 translate-x-[1%]">
              <div className="h-[80px] w-[80px] overflow-hidden rounded-full border-[5px] border-white bg-white">
                <img src={avatar} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          {/*  */}
          {/* <button
            className="
              w-full
              flex
              items-center
              gap-2

              px-5
              py-4

              text-left
              text-gray-700
              font-semibold
              text-base

              border-b
              border-slate-300

              hover:bg-slate-200
            ">
            <Person24Filled
              style={{
                color: "#9C6CFE",
              }}></Person24Filled>
            Ubah Avatar
          </button> */}

          {/* <button
            className="
              w-full
              flex
              items-center
              gap-2

              px-5
              py-4

              text-left
              text-gray-700
              font-semibold
              text-base

              border-b
              border-slate-300

              hover:bg-slate-200
            ">
              <CardUi24Filled
              style={{
                color: "#8CD0FF",
              }}></CardUi24Filled>
            Ubah Nama
          </button> */}

          {/* ================= MODAL CONFIRM LOGOUT ================= */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-[9999] bg-[#1F0234]/67 items-center justify-center">
              {/* Modal */}
              <Modal
              title="Apakah Kamu Yakin?"
              width="w-[500px]"

              autoHeight

              buttonText="Keluar"
              buttonVariant="red"
              onButtonClick={handleLogout}

              secondButtonText="Batal"
              secondButtonVariant="gray"
              
              onSecondButtonClick={() =>
                setShowConfirmModal(false)
              }

              onClose={() =>
                setShowConfirmModal(false)
              }
            >
              <div className="py-8">
                <p
                  className="
                    text-center
                    text-[20px]
                    font-bold
                    text-[#1E293B]
                  "
                >
                  Apakah kamu yakin untuk
                  Keluar Akun?
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

              px-5
              py-4

              text-left
              font-semibold
              text-base

              text-rose-700

              hover:bg-red-50
            ">
            <DoorArrowRight28Filled
              style={{
                color: "#C70036",
              }}></DoorArrowRight28Filled>
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
