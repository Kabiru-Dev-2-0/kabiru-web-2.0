"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";

import PodiumStage from "@/components/sd/leaderboard/podium-stage";
import CardLeaderboard from "@/components/sd/leaderboard/card-leaderboard";
import GameButton from "@/components/sd/game-button";

type Props = {
  onClose: () => void;
};

type LeaderboardUser = {
  rank: number;
  name: string;
  exp: number;
  avatar: string;
  isCurrentUser: boolean;
};

const supabase = createClient();

export default function LeaderBoard({ onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUserRef = useRef<HTMLDivElement>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUsername, setCurrentUsername] = useState("");

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("sd_user");

    if (user) {
      const parsed = JSON.parse(user);
      setCurrentUsername(parsed.username);
    }
  }, []);

  useEffect(() => {
    if (currentUsername) {
      loadLeaderboard();
    }
  }, [currentUsername]);

  const currentUser = leaderboard.find((item) => item.isCurrentUser);

  const currentUserVisible = leaderboard
    .slice(3, 13)
    .some((item) => item.isCurrentUser);

  {
    /* AUTO SCROLL CURRENT USER */
  }
  useEffect(() => {
    if (!currentUserVisible) return;
    if (!scrollRef.current || !currentUserRef.current) return;

    const container = scrollRef.current;
    const target = currentUserRef.current;

    container.scrollTo({
      top:
        target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2,
      behavior: "smooth",
    });
  }, [leaderboard, currentUserVisible]);

  async function loadLeaderboard() {
    const { data, error } = await supabase
      .from("data_penggunas_sd")
      .select(
        `
          id,
          nama_panggilan,
          username,
          avatar,
          exp
        `,
      )
      .order("exp", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    const mapped = (data ?? []).map((user, index) => ({
      rank: index + 1,

      name: user.nama_panggilan || user.username || "Pemain",

      exp: user.exp ?? 0,

      avatar: user.avatar || "/imageAssets/avatar/default.png",

      isCurrentUser: user.username === currentUsername,
    }));

    setLeaderboard(mapped);
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-y-auto overflow-x-hidden lg:overflow-hidden custom-scrollbar">
      {/* BACKGROUND */}
      <img
        src="/imageAssets/sd/map/background-map.png"
        alt="background"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      {/* CLOSE */}
      <div
        className="
          fixed
          top-4 right-4
          sm:top-6 sm:right-6
          lg:top-8 lg:right-8
          z-50
        ">
        <GameButton
          variant="red"
          size="lg"
          onClick={onClose}
          icon={
            <img
              src="/imageAssets/sd/icon-crossmark.png"
              className="w-6 h-8 sm:w-8 sm:h-10"
            />
          }
        />
      </div>

      {/* CONTENT */}
      <div
        className="
          relative
          z-10

          min-h-[100dvh]
          w-full

          flex
          flex-col
          lg:flex-row

          items-center
          lg:items-end

          justify-start
          lg:justify-between

          gap-0

          px-4
          sm:px-8
          lg:px-12

          py-24
          md:py-8
        "
      >
        {/* PODIUM */}
        <div
          className="
            order-1
            lg:order-1

            flex
            items-end
            justify-center

            w-full
            lg:w-auto

            scale-[0.72]
            sm:scale-[0.86]
            lg:scale-100

            origin-top
            lg:origin-bottom

            -mb-32
            lg:mb-0
          ">
          {leaderboard[1] && (
            <PodiumStage
              rank={2}
              name={leaderboard[1].name}
              exp={leaderboard[1].exp}
              avatar={leaderboard[1].avatar}
              delay={200}
            />
          )}

          {leaderboard[0] && (
            <PodiumStage
              rank={1}
              name={leaderboard[0].name}
              exp={leaderboard[0].exp}
              avatar={leaderboard[0].avatar}
              delay={0}
            />
          )}

          {leaderboard[2] && (
            <PodiumStage
              rank={3}
              name={leaderboard[2].name}
              exp={leaderboard[2].exp}
              avatar={leaderboard[2].avatar}
              delay={400}
            />
          )}
        </div>

        {/* PANEL */}
        <div
          className="
            order-2
            lg:order-2

            relative

            w-full
            max-w-[620px]
            lg:w-[600px]

            h-[520px]
            sm:h-[560px]
            lg:h-[660px]

            bg-white

            rounded-[24px]
            lg:rounded-[32px]

            pt-[56px]
            sm:pt-[64px]
            lg:pt-[80px]

            px-4
            sm:px-5

            pb-5

            mt-2
            lg:mt-0

            shadow-xl
          ">
          {/* TITLE */}
          <div
            className="
              absolute
              top-[-40px]
              sm:top-[-58px]
              lg:top-[-70px]
              left-1/2
              -translate-x-1/2
              z-20
              w-[380px]
              sm:w-[380px]
              lg:w-[640px]
            ">
            <img
              src="/imageAssets/sd/leaderboard/title-ribbon.png"
              className="w-full"
            />
          </div>

          {/* HEADER */}
          <div
            className="
              grid
              grid-cols-[70px_1fr_80px]
              sm:grid-cols-[90px_1fr_100px]
              lg:grid-cols-[120px_1fr_120px]
              bg-slate-100
              rounded-[14px]
              lg:rounded-[18px]
              px-3
              sm:px-5
              lg:px-6
              py-2
              sm:py-3
              mb-3
              sm:mb-4
            ">
            <div
              className="
                text-center
                font-black
                text-gray-400
                text-[14px]
                sm:text-[18px]
                lg:text-[24px]
              ">
              PERINGKAT
            </div>

            <div
              className="
                text-center
                font-black
                text-[#9095A4]
                text-[13px]
                sm:text-[17px]
                lg:text-[22px]
              ">
              NAMA
            </div>

            <div className="flex justify-center items-center gap-1 sm:gap-2">
              <img
                src="/imageAssets/sd/map/icon/icon-exp.png"
                className="w-4 sm:w-5 lg:w-6"
              />

              <div
                className="
                  text-center
                  font-black
                  text-[#9095A4]
                  text-[13px]
                  sm:text-[17px]
                  lg:text-[22px]
                ">
                EXP
              </div>
            </div>
          </div>

          {/* SCROLL LIST */}
          <div
            ref={scrollRef}
            className="
              absolute
              top-[105px]
              sm:top-[125px]
              lg:top-[145px]
              left-4
              right-4
              sm:left-5
              sm:right-5

              overflow-y-auto
              flex
              flex-col
              gap-2
              sm:gap-3
              pr-1
              sm:pr-2
              pb-6
              sm:pb-8
              custom-scrollbar
            "
            style={{
              bottom: currentUserVisible ? 16 : 88,
            }}>
            {leaderboard.slice(3, 13).map((player) => (
              <div
                key={player.rank}
                ref={player.isCurrentUser ? currentUserRef : undefined}>
                <CardLeaderboard
                  rank={player.rank}
                  name={player.name}
                  exp={player.exp}
                  avatar={player.avatar}
                  isCurrentUser={player.isCurrentUser}
                  noShadow={player.isCurrentUser}
                />
              </div>
            ))}
          </div>

          {/* FIXED CURRENT USER */}
          {currentUser && !currentUserVisible && (
            <div
              className="
                absolute
                left-4
                right-4
                sm:left-5
                sm:right-5
                bottom-4
                sm:bottom-5
              ">
              <CardLeaderboard
                rank={currentUser.rank}
                name={currentUser.name}
                exp={currentUser.exp}
                avatar={currentUser.avatar}
                isCurrentUser
                noShadow={false}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
}