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

  {/* AUTO SCROLL CURRENT USER */}
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
  }, [leaderboard]);

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
    console.log("ERROR:", error);

    const mapped = (data ?? []).map((user, index) => ({
      rank: index + 1,

      name: user.nama_panggilan || user.username || "Pemain",

      exp: user.exp ?? 0,

      avatar: user.avatar || "/imageAssets/avatar/default.png",

      isCurrentUser: user.username === currentUsername,
    }));

    setLeaderboard(mapped);
  }

  const currentUser = leaderboard.find((item) => item.isCurrentUser);

  const currentUserVisible = leaderboard
    .slice(3, 13)
    .some((item) => item.isCurrentUser);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* BACKGROUND */}
      <img
        src="/imageAssets/sd/map/background-map.png"
        alt="background"
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
        "
      />

      {/* CLOSE */}
      <div
        className="
          absolute
          top-8
          right-8
          z-50
        ">
        <GameButton
          variant="red"
          size="lg"
          onClick={onClose}
          icon={
            <img
              src="/imageAssets/sd/icon-crossmark.png"
              className="w-8 h-10 ml-3"
            />
          }
        />
      </div>

      {/* CONTENT */}
      <div
        className="
          relative
          z-10

          h-full
          w-full

          flex
          items-end
          justify-between

          px-12
          py-8
        ">
        {/* PODIUM */}
        <div
          className="
            flex
            items-end
            justify-center
            gap-0
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
          relative

          w-[600px]
          h-[660px]

          bg-white

          rounded-[32px]

          pt-[80px]
          px-5
          pb-5

          shadow-xl
        ">
          {/* TITLE */}
          <div
            className="
              absolute
              top-[-70px]
              left-1/2
              -translate-x-1/2
              z-20
            ">
            <img
              src="/imageAssets/sd/leaderboard/title-ribbon.png"
              className="w-[640px] max-w-none"
            />
          </div>

          {/* HEADER */}
          <div
            className="
              grid
              grid-cols-[120px_1fr_120px]
              bg-slate-100
              rounded-[18px]
              px-6
              py-3
              mb-4
            ">
            <div
              className="
                text-center
                font-black
                text-gray-400
                text-[24px]
              ">
              PERINGKAT
            </div>

            <div
              className="
                text-center
                font-black
                text-[#9095A4]
                text-[22px]
              ">
              NAMA
            </div>

            <div className="flex justify-center items-center gap-2">
              <img
                src="/imageAssets/sd/map/icon/icon-exp.png"
                className="w-6"
              />

              <div
                className="
                  text-center
                  font-black
                  text-[#9095A4]
                  text-[22px]
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
              top-[145px]
              left-5
              right-5

              overflow-y-auto
              flex
              flex-col
              gap-3
              pr-2
              pb-8
              custom-scrollbar
            "
            style={{
              bottom: currentUserVisible ? 20 : 95,
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

                  left-5
                  right-5
                  bottom-5
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
          width: 12px;
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
