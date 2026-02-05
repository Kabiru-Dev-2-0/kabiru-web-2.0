"use client";
import { useEffect, useState } from "react";
import { MissionCard } from "@/components/mission-card";
import {
  StarColor,
  FlagColor,
  PaintBrushColor,
  TrophyColor,
} from "@fluentui/react-icons";
import { createClient } from "@/utils/supabase/client";
import { PeringkatWidget } from "@/components/peringkat-widget";
import { Card, CardBody } from "@heroui/card";
import { CheckmarkCircleColor } from "@fluentui/react-icons";
import { Button } from "@heroui/button";

type ChallengeRow = {
  tipe: "login_harian" | "quiz_beruntun" | "quiz_sempurna";
  judul: string;
  current_value: number;
  best_value: number;
  badge_level: "none" | "bronze" | "silver" | "gold";
  threshold_bronze: number;
  threshold_silver: number;
  threshold_gold: number;
};

type ClaimFlags = {
  tantangan1_isclaimed: boolean;
  tantangan2_isclaimed: boolean;
  tantangan3_isclaimed: boolean;
};

type IndividualClaimFlags = {
  login_claimed_bronze: boolean;
  login_claimed_silver: boolean;
  login_claimed_gold: boolean;
  quiz_claimed_bronze: boolean;
  quiz_claimed_silver: boolean;
  quiz_claimed_gold: boolean;
  modul_claimed_bronze: boolean;
  modul_claimed_silver: boolean;
  modul_claimed_gold: boolean;
};

function getGlobalStage(rows?: ChallengeRow[] | null) {
  if (!rows || rows.length === 0) return "bronze" as const;
  const allBronze = rows.every((r) => r.best_value >= r.threshold_bronze);
  const allSilver = rows.every((r) => r.best_value >= r.threshold_silver);
  const allGold = rows.every((r) => r.best_value >= r.threshold_gold);
  if (allGold) return "completed" as const;
  if (allSilver) return "gold" as const;
  if (allBronze) return "silver" as const;
  return "bronze" as const;
}

function getTierInfo(
  row: ChallengeRow | undefined,
  stage: "bronze" | "silver" | "gold" | "completed"
) {
  if (!row) return { tierLabel: "Bronze", progress: 0, total: 0 };
  const thresholds = {
    bronze: row.threshold_bronze,
    silver: row.threshold_silver,
    gold: row.threshold_gold,
  };
  const total = stage === "completed" ? row.threshold_gold : thresholds[stage];
  const isDone =
    stage === "completed"
      ? row.best_value >= row.threshold_gold
      : row.best_value >= total;
  const progress = isDone ? total : Math.min(row.current_value, total);
  const tierLabel = isDone
    ? "DONE"
    : stage === "bronze"
      ? "Bronze"
      : stage === "silver"
        ? "Silver"
        : "Gold";
  return { tierLabel, progress, total };
}

export default function TantanganPage() {
  const [challenges, setChallenges] = useState<ChallengeRow[] | null>(null);
  const [penggunaId, setPenggunaId] = useState<number | null>(null);
  const [claimFlags, setClaimFlags] = useState<ClaimFlags | null>(null);
  const [individualClaimFlags, setIndividualClaimFlags] =
    useState<IndividualClaimFlags | null>(null);
  const [claimLoading, setClaimLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;
        const { data: pengguna } = await supabase
          .from("penggunas")
          .select("id")
          .eq("uuid", user.id)
          .single();
        const penggunaId = pengguna?.id as number | undefined;
        if (!penggunaId) return;
        setPenggunaId(penggunaId);

        const { data } = await supabase
          .from("v_tantangan_progress")
          .select(
            "tipe, judul, current_value, best_value, badge_level, threshold_bronze, threshold_silver, threshold_gold"
          )
          .eq("id_pengguna", penggunaId);

        const rows = Array.isArray(data) ? (data as ChallengeRow[]) : [];
        if (rows.length) setChallenges(rows);

        const { data: dp } = await supabase
          .from("data_penggunas")
          .select(
            "tantangan1_isclaimed, tantangan2_isclaimed, tantangan3_isclaimed"
          )
          .eq("id_pengguna", penggunaId)
          .single();
        if (dp) {
          setClaimFlags({
            tantangan1_isclaimed: !!dp.tantangan1_isclaimed,
            tantangan2_isclaimed: !!dp.tantangan2_isclaimed,
            tantangan3_isclaimed: !!dp.tantangan3_isclaimed,
          });
        }

        // Load individual claim flags from database
        const { data: claimsData } = await supabase
          .from("tantangan_claims")
          .select("tipe_tantangan, tier")
          .eq("id_pengguna", penggunaId);

        const flags: IndividualClaimFlags = {
          login_claimed_bronze: false,
          login_claimed_silver: false,
          login_claimed_gold: false,
          quiz_claimed_bronze: false,
          quiz_claimed_silver: false,
          quiz_claimed_gold: false,
          modul_claimed_bronze: false,
          modul_claimed_silver: false,
          modul_claimed_gold: false,
        };

        if (claimsData && Array.isArray(claimsData)) {
          claimsData.forEach(
            (claim: { tipe_tantangan: string; tier: string }) => {
              if (claim.tipe_tantangan === "login_harian") {
                if (claim.tier === "bronze") flags.login_claimed_bronze = true;
                if (claim.tier === "silver") flags.login_claimed_silver = true;
                if (claim.tier === "gold") flags.login_claimed_gold = true;
              }
              if (claim.tipe_tantangan === "quiz_beruntun") {
                if (claim.tier === "bronze") flags.quiz_claimed_bronze = true;
                if (claim.tier === "silver") flags.quiz_claimed_silver = true;
                if (claim.tier === "gold") flags.quiz_claimed_gold = true;
              }
              if (claim.tipe_tantangan === "quiz_sempurna") {
                if (claim.tier === "bronze") flags.modul_claimed_bronze = true;
                if (claim.tier === "silver") flags.modul_claimed_silver = true;
                if (claim.tier === "gold") flags.modul_claimed_gold = true;
              }
            }
          );
        }

        setIndividualClaimFlags(flags);

        await supabase
          .rpc("log_daily_login", { p_uuid: user.id })
          .match(() => {});
      } catch {}
    };
    load();
  }, []);

  const loginRow = challenges?.find((r) => r.tipe === "login_harian");
  const quizRow = challenges?.find((r) => r.tipe === "quiz_beruntun");
  const modulRow = challenges?.find((r) => r.tipe === "quiz_sempurna");
  const stage = getGlobalStage(challenges);
  const [viewStage, setViewStage] = useState<
    "bronze" | "silver" | "gold" | "completed"
  >("bronze");
  const loginTier = getTierInfo(loginRow, viewStage);
  const quizTier = getTierInfo(quizRow, viewStage);
  const modulTier = getTierInfo(modulRow, viewStage);

  // Determine if current stage is unlocked
  const isStageUnlocked = (st: "bronze" | "silver" | "gold") => {
    if (st === "bronze") return true;
    if (st === "silver") {
      const rows = [loginRow, quizRow, modulRow].filter(
        Boolean
      ) as ChallengeRow[];
      return rows.every((r) => r.best_value >= r.threshold_bronze);
    }
    if (st === "gold") {
      const rows = [loginRow, quizRow, modulRow].filter(
        Boolean
      ) as ChallengeRow[];
      return rows.every((r) => r.best_value >= r.threshold_silver);
    }
    return false;
  };

  const currentStageUnlocked =
    viewStage === "bronze" ||
    isStageUnlocked(viewStage === "completed" ? "gold" : viewStage);

  // Check if individual challenge is completed for current stage
  const isChallengeCompleted = (
    row: ChallengeRow | undefined,
    st: "bronze" | "silver" | "gold"
  ) => {
    if (!row) return false;
    const threshold =
      st === "bronze"
        ? row.threshold_bronze
        : st === "silver"
          ? row.threshold_silver
          : row.threshold_gold;
    return row.best_value >= threshold;
  };

  // Check if individual challenge is claimed for current stage
  const isChallengeClaimed = (
    challengeType: "login" | "quiz" | "modul",
    st: "bronze" | "silver" | "gold"
  ) => {
    if (!individualClaimFlags) return false;
    const key = `${challengeType}_claimed_${st}` as keyof IndividualClaimFlags;
    return !!individualClaimFlags[key];
  };

  // Get EXP reward for each challenge based on stage
  const getExpReward = (
    challengeType: "login" | "quiz" | "modul",
    st: "bronze" | "silver" | "gold"
  ) => {
    if (challengeType === "login") {
      return st === "bronze" ? 10 : st === "silver" ? 30 : 50;
    }
    if (challengeType === "quiz") {
      return st === "bronze" ? 30 : st === "silver" ? 70 : 100;
    }
    if (challengeType === "modul") {
      return st === "bronze" ? 50 : st === "silver" ? 100 : 150;
    }
    return 0;
  };

  const stageForClaim = viewStage === "completed" ? "gold" : viewStage;
  const isAllDoneForStage = (st: "bronze" | "silver" | "gold") => {
    const rows = [loginRow, quizRow, modulRow].filter(
      Boolean
    ) as ChallengeRow[];
    if (rows.length !== 3) return false;
    return rows.every((r) => {
      const threshold =
        st === "bronze"
          ? r.threshold_bronze
          : st === "silver"
            ? r.threshold_silver
            : r.threshold_gold;
      return r.best_value >= threshold;
    });
  };
  const isClaimedForStage = (st: "bronze" | "silver" | "gold") => {
    if (!claimFlags) return false;
    return st === "bronze"
      ? !!claimFlags.tantangan1_isclaimed
      : st === "silver"
        ? !!claimFlags.tantangan2_isclaimed
        : !!claimFlags.tantangan3_isclaimed;
  };
  const canClaim =
    isAllDoneForStage(stageForClaim) && !isClaimedForStage(stageForClaim);

  const handleIndividualClaim = async (
    challengeType: "login" | "quiz" | "modul",
    st: "bronze" | "silver" | "gold"
  ) => {
    if (!penggunaId) return;
    const claimKey = `${challengeType}_${st}`;
    setClaimLoading((prev) => ({ ...prev, [claimKey]: true }));

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("v_tantangan_progress")
        .select(
          "tipe, judul, current_value, best_value, badge_level, threshold_bronze, threshold_silver, threshold_gold"
        )
        .eq("id_pengguna", penggunaId);
      const rows = Array.isArray(data) ? (data as ChallengeRow[]) : [];

      const challengeMap = {
        login: "login_harian",
        quiz: "quiz_beruntun",
        modul: "quiz_sempurna",
      } as const;

      const row = rows.find((r) => r.tipe === challengeMap[challengeType]);
      if (!row) {
        setClaimLoading((prev) => ({ ...prev, [claimKey]: false }));
        return;
      }

      const threshold =
        st === "bronze"
          ? row.threshold_bronze
          : st === "silver"
            ? row.threshold_silver
            : row.threshold_gold;

      if (row.best_value < threshold) {
        setClaimLoading((prev) => ({ ...prev, [claimKey]: false }));
        return;
      }

      // Claim reward using database function (includes EXP grant)
      const expAmount = getExpReward(challengeType, st);
      const challengeTypeDb = challengeMap[challengeType];

      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (user?.id && expAmount > 0) {
          const { data: result, error: claimError } = await supabase.rpc(
            "claim_tantangan_reward",
            {
              p_uuid: user.id,
              p_tipe_tantangan: challengeTypeDb,
              p_tier: st,
              p_exp_amount: expAmount,
            }
          );

          if (claimError || !result?.success) {
            console.error(
              "Failed to claim reward:",
              claimError || result?.error
            );
            setClaimLoading((prev) => ({ ...prev, [claimKey]: false }));
            return;
          }

          // Update local claim flags
          setIndividualClaimFlags((prev) => {
            if (!prev) return prev;
            const key =
              `${challengeType}_claimed_${st}` as keyof IndividualClaimFlags;
            return { ...prev, [key]: true };
          });

          // Trigger EXP refresh in dashboard header
          // Method 1: Update localStorage (header reads from localStorage as fallback)
          try {
            const { data: expData } = await supabase
              .from("data_penggunas")
              .select("exp")
              .eq("id_pengguna", penggunaId)
              .single();
            if (expData?.exp !== undefined) {
              localStorage.setItem("aizone.exp", String(expData.exp));
              // Method 2: Dispatch custom event for header to listen
              window.dispatchEvent(
                new CustomEvent("exp-updated", {
                  detail: { exp: expData.exp },
                })
              );
            }
          } catch (expError) {
            // Ignore error, realtime subscription should handle it
            console.error("Error fetching updated EXP:", expError);
          }
        }
      } catch (error) {
        console.error("Error claiming reward:", error);
        setClaimLoading((prev) => ({ ...prev, [claimKey]: false }));
        return;
      }
    } finally {
      setClaimLoading((prev) => ({ ...prev, [claimKey]: false }));
    }
  };

  const handleClaim = async () => {
    if (!penggunaId) return;
    setClaimLoading((prev) => ({ ...prev, stage: true }));
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("v_tantangan_progress")
        .select(
          "tipe, judul, current_value, best_value, badge_level, threshold_bronze, threshold_silver, threshold_gold"
        )
        .eq("id_pengguna", penggunaId);
      const rows = Array.isArray(data) ? (data as ChallengeRow[]) : [];
      const lr = rows.find((r) => r.tipe === "login_harian");
      const qr = rows.find((r) => r.tipe === "quiz_beruntun");
      const mr = rows.find((r) => r.tipe === "quiz_sempurna");
      const valid =
        !!lr &&
        !!qr &&
        !!mr &&
        [lr, qr, mr].every((r) => {
          const threshold =
            stageForClaim === "bronze"
              ? r.threshold_bronze
              : stageForClaim === "silver"
                ? r.threshold_silver
                : r.threshold_gold;
          return r.best_value >= threshold;
        });
      if (!valid) {
        setClaimLoading((prev) => ({ ...prev, stage: false }));
        return;
      }
      const column =
        stageForClaim === "bronze"
          ? "tantangan1_isclaimed"
          : stageForClaim === "silver"
            ? "tantangan2_isclaimed"
            : "tantangan3_isclaimed";
      const { error } = await supabase
        .from("data_penggunas")
        .update({ [column]: true })
        .eq("id_pengguna", penggunaId);
      if (!error) {
        const amount =
          stageForClaim === "bronze"
            ? 200
            : stageForClaim === "silver"
              ? 300
              : 500;
        try {
          const { data: authData } = await supabase.auth.getUser();
          const user = authData?.user;
          if (user?.id) {
            await supabase
              .rpc("grant_exp_for_claim", { p_uuid: user.id, p_amount: amount })
              .match(() => {});
          }
        } catch {}
        setClaimFlags((prev) =>
          prev
            ? {
                ...prev,
                [column]: true,
              }
            : {
                tantangan1_isclaimed: column === "tantangan1_isclaimed",
                tantangan2_isclaimed: column === "tantangan2_isclaimed",
                tantangan3_isclaimed: column === "tantangan3_isclaimed",
              }
        );

        // Trigger EXP refresh in dashboard header
        try {
          const { data: expData } = await supabase
            .from("data_penggunas")
            .select("exp")
            .eq("id_pengguna", penggunaId)
            .single();
          if (expData?.exp !== undefined) {
            localStorage.setItem("aizone.exp", String(expData.exp));
            // Dispatch custom event for header to listen
            window.dispatchEvent(
              new CustomEvent("exp-updated", {
                detail: { exp: expData.exp },
              })
            );
          }
        } catch (expError) {
          // Ignore error, realtime subscription should handle it
          console.error("Error fetching updated EXP:", expError);
        }
      }
    } finally {
      setClaimLoading((prev) => ({ ...prev, stage: false }));
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex gap-8 p-6">
        <div className="flex-1 flex flex-col gap-8">
          <Card
            className="w-full border border-[rgba(145,158,171,0.24)] shadow-sm bg-white"
            radius="lg"
          >
            <CardBody className="p-5 gap-4">
              <div className="relative bg-[#F4F4F5] rounded-2xl flex px-3 py-2 gap-2">
                <button
                  type="button"
                  onClick={() => setViewStage("bronze")}
                  className={`flex-1 rounded-[14px] font-bold transition-all duration-200 ${
                    viewStage === "bronze"
                      ? "bg-[#3577B8] text-white shadow-[0_4px_0_#265C91]" // Colors & shadow match the image
                      : "bg-transparent text-[#3577B8] hover:bg-[#DCE4EE]"
                  }`}
                  style={{
                    fontFamily: "'Encode', sans-serif",
                    fontSize: 20,
                    paddingTop: 12,
                    paddingBottom: 12,
                  }}
                >
                  Tahap 1
                </button>
                <button
                  type="button"
                  onClick={() => setViewStage("silver")}
                  className={`flex-1 rounded-[14px] font-bold transition-all duration-200 ${
                    viewStage === "silver"
                      ? "bg-[#3577B8] text-white shadow-[0_4px_0_#265C91]"
                      : "bg-transparent text-[#3577B8] hover:bg-[#DCE4EE]"
                  }`}
                  style={{
                    fontFamily: "'Encode', sans-serif",
                    fontSize: 20,
                    paddingTop: 12,
                    paddingBottom: 12,
                  }}
                >
                  Tahap 2
                </button>
                <button
                  type="button"
                  onClick={() => setViewStage("gold")}
                  className={`flex-1 rounded-[14px] font-bold transition-all duration-200 ${
                    viewStage === "gold"
                      ? "bg-[#3577B8] text-white shadow-[0_4px_0_#265C91]"
                      : "bg-transparent text-[#3577B8] hover:bg-[#DCE4EE]"
                  }`}
                  style={{
                    fontFamily: "'Encode', sans-serif",
                    fontSize: 20,
                    paddingTop: 12,
                    paddingBottom: 12,
                  }}
                >
                  Tahap 3
                </button>
              </div>
              <div className="flex flex-col gap-5 mt-2">
                <MissionCard
                  icon={<StarColor className="w-[42px] h-[42px]" />}
                  title="Login harian"
                  progress={loginTier.progress}
                  total={loginTier.total || 7}
                  done={loginTier.tierLabel === "DONE"}
                  isClaimed={isChallengeClaimed(
                    "login",
                    viewStage === "completed" ? "gold" : viewStage
                  )}
                  expReward={getExpReward(
                    "login",
                    viewStage === "completed" ? "gold" : viewStage
                  )}
                  canClaim={
                    isChallengeCompleted(
                      loginRow,
                      viewStage === "completed" ? "gold" : viewStage
                    ) &&
                    !isChallengeClaimed(
                      "login",
                      viewStage === "completed" ? "gold" : viewStage
                    )
                  }
                  onClaim={() =>
                    handleIndividualClaim(
                      "login",
                      viewStage === "completed" ? "gold" : viewStage
                    )
                  }
                  isClaimLoading={
                    claimLoading[
                      `login_${viewStage === "completed" ? "gold" : viewStage}`
                    ] || false
                  }
                  isDisabled={!currentStageUnlocked}
                />
                <MissionCard
                  icon={<FlagColor className="w-[42px] h-[42px]" />}
                  title="Selesaikan unit pembelajaran"
                  progress={quizTier.progress}
                  total={quizTier.total || 7}
                  done={quizTier.tierLabel === "DONE"}
                  isClaimed={isChallengeClaimed(
                    "quiz",
                    viewStage === "completed" ? "gold" : viewStage
                  )}
                  expReward={getExpReward(
                    "quiz",
                    viewStage === "completed" ? "gold" : viewStage
                  )}
                  canClaim={
                    isChallengeCompleted(
                      quizRow,
                      viewStage === "completed" ? "gold" : viewStage
                    ) &&
                    !isChallengeClaimed(
                      "quiz",
                      viewStage === "completed" ? "gold" : viewStage
                    )
                  }
                  onClaim={() =>
                    handleIndividualClaim(
                      "quiz",
                      viewStage === "completed" ? "gold" : viewStage
                    )
                  }
                  isClaimLoading={
                    claimLoading[
                      `quiz_${viewStage === "completed" ? "gold" : viewStage}`
                    ] || false
                  }
                  isDisabled={!currentStageUnlocked}
                />
                <MissionCard
                  icon={<PaintBrushColor className="w-[42px] h-[42px]" />}
                  title="Kerjakan latihan soal tanpa salah"
                  progress={modulTier.progress}
                  total={modulTier.total || 3}
                  done={modulTier.tierLabel === "DONE"}
                  isClaimed={isChallengeClaimed(
                    "modul",
                    viewStage === "completed" ? "gold" : viewStage
                  )}
                  expReward={getExpReward(
                    "modul",
                    viewStage === "completed" ? "gold" : viewStage
                  )}
                  canClaim={
                    isChallengeCompleted(
                      modulRow,
                      viewStage === "completed" ? "gold" : viewStage
                    ) &&
                    !isChallengeClaimed(
                      "modul",
                      viewStage === "completed" ? "gold" : viewStage
                    )
                  }
                  onClaim={() =>
                    handleIndividualClaim(
                      "modul",
                      viewStage === "completed" ? "gold" : viewStage
                    )
                  }
                  isClaimLoading={
                    claimLoading[
                      `modul_${viewStage === "completed" ? "gold" : viewStage}`
                    ] || false
                  }
                  isDisabled={!currentStageUnlocked}
                />
                <MissionCard
                  icon={
                    <div className="w-[42px] h-[42px] flex items-center justify-center">
                      <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
                          fill="#06B6D4"
                        />
                        <path
                          d="M19.43 12.97C19.47 12.66 19.5 12.34 19.5 12C19.5 11.66 19.47 11.34 19.43 11.03L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.65 15.5 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.5 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.03C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.34 8.5 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.5 18.67 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97ZM12 15.5C10.067 15.5 8.5 13.933 8.5 12C8.5 10.067 10.067 8.5 12 8.5C13.933 8.5 15.5 10.067 15.5 12C15.5 13.933 13.933 15.5 12 15.5Z"
                          fill="#06B6D4"
                        />
                      </svg>
                    </div>
                  }
                  title="Selesaikan semua pada tahap ini"
                  progress={
                    [
                      isChallengeCompleted(
                        loginRow,
                        viewStage === "completed" ? "gold" : viewStage
                      ),
                      isChallengeCompleted(
                        quizRow,
                        viewStage === "completed" ? "gold" : viewStage
                      ),
                      isChallengeCompleted(
                        modulRow,
                        viewStage === "completed" ? "gold" : viewStage
                      ),
                    ].filter(Boolean).length
                  }
                  total={3}
                  done={isAllDoneForStage(
                    viewStage === "completed" ? "gold" : viewStage
                  )}
                  isClaimed={isClaimedForStage(
                    viewStage === "completed" ? "gold" : viewStage
                  )}
                  expReward={
                    viewStage === "bronze"
                      ? 100
                      : viewStage === "silver"
                        ? 150
                        : 200
                  }
                  canClaim={canClaim}
                  onClaim={handleClaim}
                  isClaimLoading={claimLoading.stage || false}
                  isDisabled={!currentStageUnlocked}
                />
              </div>
            </CardBody>
          </Card>

          {/* <div className="relative w-[270px] h-[250px]">
            <MotivationalTooltip
              message="Ayo selesaikan misi&#10;dan dapatkan hadiahmu!"
              imageUrl="/imageAssets/motivational.png"
              position="left"
            />
          </div> */}
        </div>

        {/* Right Column - Widgets */}
        <div className="w-[300px] flex flex-col gap-6">
          <PeringkatWidget
            displayedData={["peringkat", "misiHarian", "perjalanan"]}
          />
        </div>
      </div>
    </div>
  );
}
