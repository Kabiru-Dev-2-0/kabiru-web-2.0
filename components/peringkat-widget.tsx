"use client";
// components/peringkat-widget.tsx
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import Link from "next/link";
import {
  TrophyColor,
  StarColor,
  PawColor,
  MoleculeFilled,
  DesignIdeasFilled,
  GameChatFilled,
  BuildingGovernmentFilled,
  FlagColor,
  PaintBrushColor,
  Paw24Color,
  Molecule24Color,
  DesignIdeas24Color,
  GameChat20Color,
  BuildingGovernment24Color,
} from "@fluentui/react-icons";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@heroui/skeleton";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";

interface MissionPreviewItem {
  title: string;
  current: number;
  total: number;
}

interface PeringkatWidgetProps {
  rank?: number;
  href?: string;
  title?: string;
  missionTitle?: string;
  missionValue?: number;
  missionHref?: string;
  missions?: MissionPreviewItem[];
  journeyTitle?: string;
  journeyLabel?: string;
  journeyValue?: number;
  displayedData?: Array<"peringkat" | "misiHarian" | "perjalanan">;
}

export function PeringkatWidget({
  rank,
  href = "/peringkat",
  title = "Peringkat",
  missionTitle = "Dapatkan 10 XP",
  missionValue = 84,
  missionHref = "/tantangan",
  missions,
  journeyTitle = "Perjalananku",
  journeyLabel = "Pemula",
  journeyValue = 30,
  displayedData = ["peringkat", "misiHarian", "perjalanan"],
}: PeringkatWidgetProps) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [localRank, setLocalRank] = useState<number | undefined>(rank);
  const [localMissions, setLocalMissions] = useState<MissionPreviewItem[]>(
    missions || []
  );
  const [localJourneyLabel, setLocalJourneyLabel] =
    useState<string>(journeyLabel);
  const [localJourneyValue, setLocalJourneyValue] =
    useState<number>(journeyValue);
  const [localJourneyMax, setLocalJourneyMax] = useState<number>(100);
  const [isLoadingWidget, setIsLoadingWidget] = useState<boolean>(true);
  const [isJourneyLevelsOpen, setIsJourneyLevelsOpen] =
    useState<boolean>(false);
  const journeyLevels = useMemo(
    () => [
      {
        key: "newbie",
        label: "Newbie",
        min: 0,
        max: 1000,
        desc: "Mulai perjalananmu dari dasar-dasar komunikasi.",
        icon: Paw24Color,
      },
      {
        key: "learner",
        label: "Learner",
        min: 1000,
        max: 2200,
        desc: "Mulai nyaman belajar dan berlatih secara konsisten.",
        icon: Molecule24Color,
      },
      {
        key: "explorer",
        label: "Explorer",
        min: 2200,
        max: 3600,
        desc: "Mengeksplorasi lebih banyak topik dan situasi.",
        icon: DesignIdeas24Color,
      },
      {
        key: "skilled",
        label: "Skilled",
        min: 3600,
        max: 5200,
        desc: "Kemampuan makin terasah dan terasa natural.",
        icon: GameChat20Color,
      },
      {
        key: "proficient",
        label: "Proficient",
        min: 5200,
        max: null,
        desc: "Sudah sangat mahir dan siap tantangan lanjutan.",
        icon: BuildingGovernment24Color,
      },
    ],
    []
  );
  const sectionsSet = useMemo(() => new Set(displayedData), [displayedData]);
  const hasMissions = localMissions.length > 0;
  const currentMission = useMemo(() => {
    if (hasMissions) return localMissions[missionIndex % localMissions.length];
    return {
      title: missionTitle,
      current: missionValue,
      total: 100,
    };
  }, [localMissions, missionIndex, hasMissions, missionTitle, missionValue]);

  const getGlobalStage = (rows?: any[] | null) => {
    if (!rows || rows.length === 0) return "bronze" as const;
    const allBronze = rows.every(
      (r) =>
        typeof r.best_value === "number" &&
        typeof r.threshold_bronze === "number" &&
        r.best_value >= r.threshold_bronze
    );
    const allSilver = rows.every(
      (r) =>
        typeof r.best_value === "number" &&
        typeof r.threshold_silver === "number" &&
        r.best_value >= r.threshold_silver
    );
    const allGold = rows.every(
      (r) =>
        typeof r.best_value === "number" &&
        typeof r.threshold_gold === "number" &&
        r.best_value >= r.threshold_gold
    );
    if (allGold) return "completed" as const;
    if (allSilver) return "gold" as const;
    if (allBronze) return "silver" as const;
    return "bronze" as const;
  };

  const getTierInfoForStage = (
    row: any | undefined,
    stage: "bronze" | "silver" | "gold" | "completed"
  ) => {
    if (!row) return { tierLabel: "Bronze", progress: 0, total: 0 };
    const thresholds = {
      bronze: row.threshold_bronze as number,
      silver: row.threshold_silver as number,
      gold: row.threshold_gold as number,
    };
    const total =
      stage === "completed" ? thresholds.gold : (thresholds[stage] ?? 0);
    if (
      !total ||
      typeof row.best_value !== "number" ||
      typeof row.current_value !== "number"
    ) {
      return { tierLabel: "Bronze", progress: 0, total: 0 };
    }
    const isDone =
      stage === "completed"
        ? row.best_value >= thresholds.gold
        : row.best_value >= total;
    const progress = isDone ? total : Math.min(row.current_value, total);
    const tierLabel =
      isDone && stage === "completed"
        ? "DONE"
        : stage === "bronze"
          ? "Bronze"
          : stage === "silver"
            ? "Silver"
            : "Gold";
    return { tierLabel, progress, total };
  };

  const getExpTier = (expNum: number) => {
    if (expNum < 1000) return { label: "Newbie", current: expNum, max: 1000 };
    if (expNum < 2200) return { label: "Learner", current: expNum, max: 2200 };
    if (expNum < 3600) return { label: "Explorer", current: expNum, max: 3600 };
    if (expNum < 5200) return { label: "Skilled", current: expNum, max: 5200 };
    if (expNum < 7000)
      return { label: "Proficient", current: expNum, max: 7000 };
    return { label: "Proficient", current: expNum, max: 7000 };
  };

  useEffect(() => {
    setLocalRank(rank);
  }, [rank]);
  useEffect(() => {
    if (missions) setLocalMissions(missions);
  }, [missions]);
  useEffect(() => {
    setLocalJourneyLabel(journeyLabel);
  }, [journeyLabel]);
  useEffect(() => {
    setLocalJourneyValue(journeyValue);
  }, [journeyValue]);

  useEffect(() => {
    try {
      let hasAnyCache = false;
      if (sectionsSet.has("peringkat")) {
        const lsRank =
          typeof window !== "undefined"
            ? localStorage.getItem("aizone.rank")
            : null;
        if (lsRank) {
          const n = Number(lsRank);
          if (!Number.isNaN(n)) {
            setLocalRank(n);
            hasAnyCache = true;
          }
        }
      }
      if (sectionsSet.has("misiHarian")) {
        const lsMissions =
          typeof window !== "undefined"
            ? localStorage.getItem("aizone.missions")
            : null;
        if (lsMissions) {
          try {
            const parsed = JSON.parse(lsMissions);
            if (Array.isArray(parsed)) {
              const upgraded: MissionPreviewItem[] = parsed.map((m: any) => ({
                title: String(m.title ?? "Misi"),
                current:
                  typeof m.current === "number"
                    ? m.current
                    : typeof m.value === "number"
                      ? m.value
                      : 0,
                total:
                  typeof m.total === "number"
                    ? m.total
                    : typeof m.max === "number"
                      ? m.max
                      : 100,
              }));
              setLocalMissions(upgraded);
              hasAnyCache = true;
            }
          } catch {}
        }
      }
      if (sectionsSet.has("perjalanan")) {
        const lsExpStr =
          typeof window !== "undefined"
            ? localStorage.getItem("aizone.exp")
            : null;
        if (lsExpStr) {
          const expNum = Number(lsExpStr);
          if (!Number.isNaN(expNum)) {
            const tier = getExpTier(expNum);
            setLocalJourneyLabel(tier.label);
            setLocalJourneyValue(tier.current);
            setLocalJourneyMax(tier.max);
            hasAnyCache = true;
          }
        } else {
          const lsJL =
            typeof window !== "undefined"
              ? localStorage.getItem("aizone.journeyLabel")
              : null;
          const lsJV =
            typeof window !== "undefined"
              ? localStorage.getItem("aizone.journeyValue")
              : null;
          if (lsJL) {
            setLocalJourneyLabel(lsJL);
            hasAnyCache = true;
          }
          if (lsJV) {
            const v = Number(lsJV);
            if (!Number.isNaN(v)) {
              setLocalJourneyValue(v);
              hasAnyCache = true;
            }
          }
        }
      }
      if (hasAnyCache) setIsLoadingWidget(false);
    } catch {}
  }, []);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) return;
        const { data: pengguna } = await supabase
          .from("penggunas")
          .select("id")
          .eq("uuid", user.id)
          .single();
        const penggunaId = pengguna?.id as number | undefined;
        if (!penggunaId) return;

        if (sectionsSet.has("peringkat")) {
          const { data: leaderboard } = await supabase.rpc("get_leaderboard", {
            p_days_active: 30,
            p_bronze_weight: 1,
            p_silver_weight: 3,
            p_gold_weight: 6,
          });
          const myRow = (leaderboard || []).find(
            (r: any) => r.id_pengguna === penggunaId
          );
          if (myRow?.rank) {
            setLocalRank(myRow.rank as number);
            try {
              localStorage.setItem("aizone.rank", String(myRow.rank));
            } catch {}
          }
        }

        if (sectionsSet.has("perjalanan")) {
          const { data: expRow } = await supabase
            .from("data_penggunas")
            .select("exp")
            .eq("id_pengguna", penggunaId)
            .single();
          if (expRow && typeof expRow.exp === "number") {
            const expNum = expRow.exp as number;
            const tier = getExpTier(expNum);
            setLocalJourneyLabel(tier.label);
            setLocalJourneyValue(tier.current);
            setLocalJourneyMax(tier.max);
            try {
              localStorage.setItem("aizone.journeyLabel", tier.label);
              localStorage.setItem("aizone.exp", String(expNum));
            } catch {}
          }
        }

        if (sectionsSet.has("misiHarian")) {
          if (localMissions.length === 0) {
            const { data: vprog } = await supabase
              .from("v_tantangan_progress")
              .select(
                "tipe, judul, current_value, threshold_bronze, threshold_silver, threshold_gold, best_value"
              )
              .eq("id_pengguna", penggunaId);
            const rows = Array.isArray(vprog) ? (vprog as any[]) : [];
            if (rows.length > 0) {
              const globalStage = getGlobalStage(rows);
              const stageForDisplay =
                globalStage === "completed" ? ("gold" as const) : globalStage;

              const typeOrder: Record<string, number> = {
                login_harian: 0,
                quiz_beruntun: 1,
                quiz_sempurna: 2,
              };

              const orderedRows = rows.slice().sort((a, b) => {
                const aOrder = typeOrder[a.tipe as string] ?? 99;
                const bOrder = typeOrder[b.tipe as string] ?? 99;
                return aOrder - bOrder;
              });

              const missionRows: MissionPreviewItem[] = orderedRows.map(
                (r: any) => {
                  const { progress, total } = getTierInfoForStage(
                    r,
                    stageForDisplay
                  );
                  const titleMap: Record<string, string> = {
                    login_harian: "Login harian",
                    quiz_beruntun: "Kerjakan latihan soal tanpa salah",
                    quiz_sempurna: "Selesaikan unit pembelajaran",
                  };
                  const fallbackTitle = (r.judul as string) ?? "Misi";
                  const title = titleMap[r.tipe as string] ?? fallbackTitle;
                  return {
                    title,
                    current: progress,
                    total,
                  };
                }
              );

              const sliced = missionRows.slice(0, 3);
              setLocalMissions(sliced);
              try {
                localStorage.setItem("aizone.missions", JSON.stringify(sliced));
              } catch {}
            }
          }
        }
      } catch {}
      setIsLoadingWidget(false);
    })();
  }, []);

  useEffect(() => {
    if (!hasMissions) return;
    const id = setInterval(() => {
      setMissionIndex((i) => (i + 1) % localMissions.length);
    }, 4000);
    return () => clearInterval(id);
  }, [hasMissions, localMissions.length]);

  return (
    <div className="flex flex-col gap-6">
      {sectionsSet.has("peringkat") ? (
        <Card className="border-2 border-[#E4E4E7]" radius="lg">
          <CardBody className="p-[14px_18px_20px] gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-[#7828C8]">
                  {title}
                </span>
              </div>
              <Button
                as={Link}
                href={href}
                variant="light"
                className="text-[#3674B5] cursor-pointer border-none outline-none shadow-none bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent m-0 p-0"
                style={{
                  color: "#3674B5",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  padding: 0,
                  margin: 0,
                }}
              >
                lihat semua
              </Button>
            </div>

            <div className="flex items-center gap-2.5">
              <TrophyColor className="w-[42px] h-[42px]" />
              <div className="flex flex-col flex-1">
                <span className="text-base font-medium leading-6 text-black">
                  Saat ini kamu di peringkat
                </span>
                <Skeleton
                  isLoaded={!isLoadingWidget && typeof localRank === "number"}
                  className="rounded-md w-12"
                >
                  <span className="text-base font-semibold leading-6 text-[#7828C8]">
                    #{localRank ?? rank}
                  </span>
                </Skeleton>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {sectionsSet.has("misiHarian") ? (
        <Card className="border-2 border-[#E4E4E7]" radius="lg">
          <CardBody className="p-[14px_18px_20px] gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-[#F31260]">
                  Tantangan
                </span>
              </div>
              <Button
                as={Link}
                href={missionHref}
                variant="light"
                className="text-[#3674B5] cursor-pointer border-none outline-none shadow-none bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent m-0 p-0"
                style={{
                  color: "#3674B5",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  padding: 0,
                  margin: 0,
                }}
              >
                lihat semua
              </Button>
            </div>

            <Skeleton
              isLoaded={!isLoadingWidget && hasMissions}
              className="rounded-md w-full"
            >
              <div className="flex flex-col gap-3">
                {(hasMissions ? localMissions : [currentMission])
                  .slice(0, 3)
                  .map((m, idx) => (
                    <div
                      key={`${m.title}-${m.current}-${m.total}-${idx}`}
                      className="flex items-center gap-2.5"
                    >
                      {idx === 0 ? (
                        <StarColor className="w-[42px] h-[42px]" />
                      ) : idx === 1 ? (
                        <FlagColor className="w-[42px] h-[42px]" />
                      ) : (
                        <PaintBrushColor className="w-[42px] h-[42px]" />
                      )}
                      <Progress
                        aria-label="Daily mission"
                        classNames={{
                          base: "w-full",
                          track: "bg-[#E4E4E7]",
                          indicator: "bg-[#F5A524]",
                          label: "text-base font-medium leading-6 text-black",
                          value: "text-base font-medium leading-6 text-black",
                        }}
                        color="warning"
                        label={m.title}
                        maxValue={m.total}
                        radius="full"
                        showValueLabel
                        size="md"
                        value={m.current}
                        valueLabel={`${m.current}/${m.total}`}
                      />
                    </div>
                  ))}
              </div>
            </Skeleton>
          </CardBody>
        </Card>
      ) : null}

      {sectionsSet.has("perjalanan") ? (
        <Card className="border-2 border-[#E4E4E7]" radius="lg">
          <CardBody className="p-[14px_18px_20px] gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-[#17C964]">
                  {journeyTitle}
                </span>
              </div>
              <Button
                variant="light"
                className="text-[#3674B5] cursor-pointer border-none outline-none shadow-none bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent m-0 p-0"
                style={{
                  color: "#3674B5",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  padding: 0,
                  margin: 0,
                }}
                onPress={() => setIsJourneyLevelsOpen(true)}
              >
                lihat semua
              </Button>
            </div>

            <div className="flex items-center gap-2.5">
              <PawColor className="w-[42px] h-[42px]" />
              <Skeleton
                isLoaded={!isLoadingWidget}
                className="rounded-md w-full"
              >
                <Progress
                  aria-label="Journey progress"
                  classNames={{
                    base: "w-full",
                    label: "text-base font-medium leading-6 text-black",
                    track: "bg-[#E4E4E7]",
                    indicator: "bg-[#F5A524]",
                  }}
                  color="warning"
                  label={localJourneyLabel}
                  maxValue={localJourneyMax}
                  radius="full"
                  size="md"
                  // label={localJourneyLabel}
                  value={localJourneyValue}
                />
              </Skeleton>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* Journey Levels Modal */}
      <Modal
        isOpen={isJourneyLevelsOpen}
        onOpenChange={setIsJourneyLevelsOpen}
        placement="center"
        backdrop="blur"
        size="lg"
      >
        <ModalContent className="max-w-[720px] w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Level Perjalanan
              </ModalHeader>
              <ModalBody className="max-h-[70vh] overflow-y-auto">
                <div className="flex flex-col gap-3">
                  {journeyLevels.map((lvl) => {
                    const Icon = lvl.icon;
                    const exp = localJourneyValue;
                    const min = lvl.min;
                    const max = lvl.max ?? Math.max(exp, min + 1);
                    const raw =
                      max === null || max <= min
                        ? 1
                        : (exp - min) / (max - min);
                    const clamped = Math.min(1, Math.max(0, raw));
                    const percent = Math.round(clamped * 100);
                    const rangeLabel =
                      lvl.max == null
                        ? `${lvl.min}+ XP`
                        : `${lvl.min} - ${lvl.max - 1} XP`;
                    const isActive =
                      exp >= lvl.min && (lvl.max == null || exp < lvl.max);

                    return (
                      <div
                        key={lvl.key}
                        className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 ${
                          isActive
                            ? "border-[#F5A524] bg-white"
                            : "border-[#E5E7EB] bg-white"
                        }`}
                      >
                        {/* Header: icon + title + range */}
                        <div className="flex items-center gap-3">
                          <Icon className="w-[32px] h-[32px]" />
                          <div className="flex-1 flex items-start justify-between gap-3">
                            <span className="text-xl font-bold text-[#F5A524] leading-tight">
                              {lvl.label}
                            </span>
                            <span className="text-lg font-semibold text-[#6B7280] leading-tight">
                              {rangeLabel}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {lvl.desc ? (
                          <p className="text-md text-[#111827] leading-snug">
                            {lvl.desc}
                          </p>
                        ) : null}

                        {/* Progress bar + percentage */}
                        <div className="flex items-center gap-3">
                          <Progress
                            aria-label={`${lvl.label} progress`}
                            classNames={{
                              base: "w-full",
                              track: "bg-[#E5E7EB]",
                              indicator: "bg-[#F5A524]",
                            }}
                            maxValue={100}
                            radius="full"
                            size="md"
                            value={percent}
                            showValueLabel={false}
                          />
                          <span className="text-lg font-semibold text-[#111827]">
                            {percent}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
