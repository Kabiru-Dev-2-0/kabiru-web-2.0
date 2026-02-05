"use client";

import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import {
  SearchRegular,
  TrophyColor,
  DismissRegular,
  PawColor,
  EditRegular,
  Paw16Color,
  Person16Color,
  Flag16Color,
  Paw24Color,
  Molecule24Color,
  DesignIdeas24Color,
  GameChat20Color,
  BuildingGovernment24Color,
} from "@fluentui/react-icons";
import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { Skeleton } from "@heroui/skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Certificate16Color } from "@fluentui/react-icons";
import { Notebook16Color } from "@fluentui/react-icons";
import { Edit16Color } from "@fluentui/react-icons";

interface DashboardHeaderProps {
  searchPlaceholder?: string;
  initialUserName?: string;
  initialExp?: number;
  penggunaId?: number; // untuk Realtime subscription
}

export const DashboardHeader = ({
  searchPlaceholder = "Cari disini...",
  initialUserName,
  initialExp,
  penggunaId,
}: DashboardHeaderProps) => {
  const [exp, setExp] = useState<number>(initialExp ?? 0);
  const [userName, setUserName] = useState<string>(initialUserName ?? "");
  const [resolvedPenggunaId, setResolvedPenggunaId] = useState<number | null>(
    penggunaId ?? null
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    // Anggap loading jika tidak ada penggunaId SSR dan nama awal kosong
    !(typeof penggunaId === "number" && penggunaId > 0) && !initialUserName
  );
  const [trophies, setTrophies] = useState<{
    bronze: number;
    silver: number;
    gold: number;
  }>({
    bronze: 0,
    silver: 0,
    gold: 0,
  });
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "/imageAssets/avatar/default.png"
  );
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [isNamePickerOpen, setIsNamePickerOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [rankStat, setRankStat] = useState<number | null>(null);
  const [modulSelesai, setModulSelesai] = useState<number>(0);
  const [lessonsSelesai, setLessonsSelesai] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number | null>(null);
  const [isStreakLoading, setIsStreakLoading] = useState<boolean>(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const journeyLabel = useMemo(() => {
    if (exp < 1000) return "Newbie";
    if (exp < 2200) return "Learner";
    if (exp < 3600) return "Explorer";
    if (exp < 5200) return "Skilled";
    if (exp < 7000) return "Proficient";
    return "Proficient";
  }, [exp]);

  const expTier = useMemo(() => {
    if (exp < 1000) return { label: "Newbie", current: exp, max: 1000 };
    if (exp < 2200) return { label: "Learner", current: exp, max: 2200 };
    if (exp < 3600) return { label: "Explorer", current: exp, max: 3600 };
    if (exp < 5200) return { label: "Skilled", current: exp, max: 5200 };
    if (exp < 7000) return { label: "Proficient", current: exp, max: 7000 };
    return { label: "Proficient", current: exp, max: 7000 };
  }, [exp]);

  const levelIcons: Record<string, any> = {
    Newbie: Paw24Color,
    Learner: Molecule24Color,
    Explorer: DesignIdeas24Color,
    Skilled: GameChat20Color,
    Proficient: BuildingGovernment24Color,
  };

  const CurrentLevelIcon = levelIcons[journeyLabel] || Paw24Color;

  const nextLevelLabel = useMemo(() => {
    if (exp < 1000) return "Learner";
    if (exp < 2200) return "Explorer";
    if (exp < 3600) return "Skilled";
    if (exp < 5200) return "Proficient";
    return "Proficient";
  }, [exp]);

  const NextLevelIcon = levelIcons[nextLevelLabel] || BuildingGovernment24Color;

  // Prefill dari localStorage (client-only) agar cepat tampil tanpa menunggu fetch
  useEffect(() => {
    try {
      const lsName =
        typeof window !== "undefined"
          ? localStorage.getItem("aizone.userName")
          : null;
      const lsExpStr =
        typeof window !== "undefined"
          ? localStorage.getItem("aizone.exp")
          : null;
      const lsTrophy =
        typeof window !== "undefined"
          ? localStorage.getItem("aizone.trophy")
          : null;
      const lsAvatar =
        typeof window !== "undefined"
          ? localStorage.getItem("aizone.avatar")
          : null;
      const lsJL =
        typeof window !== "undefined"
          ? localStorage.getItem("aizone.journeyLabel")
          : null;
      if (lsName || lsExpStr) {
        if (lsName) setUserName(lsName);
        if (lsExpStr) {
          const parsed = Number(lsExpStr);
          if (!Number.isNaN(parsed)) setExp(parsed);
        }
        if (lsTrophy) {
          try {
            const parsedTrophy = JSON.parse(lsTrophy);
            setTrophies({
              bronze: Number(parsedTrophy?.bronze) || 0,
              silver: Number(parsedTrophy?.silver) || 0,
              gold: Number(parsedTrophy?.gold) || 0,
            });
          } catch {}
        }
        setIsLoading(false);
      }
      if (lsAvatar) setAvatarUrl(lsAvatar);
    } catch {}
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for custom exp-updated event (fallback if realtime doesn't work)
  useEffect(() => {
    const handleExpUpdate = (event: CustomEvent<{ exp: number }>) => {
      if (typeof event.detail?.exp === "number") {
        setExp(event.detail.exp);
        try {
          localStorage.setItem("aizone.exp", String(event.detail.exp));
        } catch {}
      }
    };

    window.addEventListener("exp-updated", handleExpUpdate as EventListener);

    return () => {
      window.removeEventListener(
        "exp-updated",
        handleExpUpdate as EventListener
      );
    };
  }, []);

  // Fallback fetch jika props SSR tidak diberikan
  useEffect(() => {
    async function loadExp() {
      if (
        initialUserName !== undefined &&
        initialUserName !== "" &&
        initialExp !== undefined &&
        penggunaId !== undefined
      ) {
        // Sudah ada data dari SSR, tidak perlu fetch awal
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) return;

        // Ambil pengguna id
        const { data: pengguna, error: penggunaError } = await supabase
          .from("penggunas")
          .select("id")
          .eq("uuid", user.id)
          .single();
        if (penggunaError || !pengguna) return;

        setResolvedPenggunaId(pengguna.id);

        // Ambil data pengguna (nama + exp total)
        const { data: expRow, error: expError } = await supabase
          .from("data_penggunas")
          .select("exp, username, avatar, current_streak")
          .eq("id_pengguna", pengguna.id)
          .single();
        if (expError || !expRow) return;

        setUserName(expRow?.username || "");
        setExp(expRow?.exp || 0);
        if (typeof expRow?.current_streak === "number") {
          setCurrentStreak(expRow.current_streak);
        } else {
          setCurrentStreak(0);
        }
        setIsStreakLoading(false);
        try {
          localStorage.setItem("aizone.userName", expRow?.username || "");
          localStorage.setItem("aizone.exp", String(expRow?.exp || 0));
        } catch {}
        const av =
          typeof expRow?.avatar === "string" && expRow.avatar
            ? expRow.avatar
            : "/imageAssets/avatar/default.png";
        setAvatarUrl(av);
        try {
          localStorage.setItem("aizone.avatar", av);
        } catch {}
        setIsLoading(false);
      } catch (e) {
        // ignore errors in header
        setIsLoading(false);
      }
    }
    loadExp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("aizone.journeyLabel", journeyLabel);
    } catch {}
  }, [journeyLabel]);

  useEffect(() => {
    const supabase = createClient();
    const idFor = penggunaId ?? resolvedPenggunaId;
    if (!idFor) return;
    (async () => {
      try {
        const { data: lb } = await supabase.rpc("get_leaderboard", {
          p_days_active: 30,
          p_bronze_weight: 1,
          p_silver_weight: 3,
          p_gold_weight: 6,
        });
        const me = (lb || []).find((r: any) => r.id_pengguna === idFor);
        if (me?.rank) setRankStat(Number(me.rank));

        const { data: vprog } = await supabase
          .from("v_tantangan_progress")
          .select("tipe, best_value")
          .eq("id_pengguna", idFor);
        const modulRow = (vprog || []).find(
          (r: any) => r.tipe === "modul_selesai"
        );
        if (modulRow?.best_value != null)
          setModulSelesai(Number(modulRow.best_value));

        const { data: hasil } = await supabase
          .from("hasil_latihans")
          .select("id_pelajaran, nomor_latihan")
          .eq("id_pengguna", idFor);
        const uniq = new Set<string>(
          (hasil || []).map((h: any) => `${h.id_pelajaran}-${h.nomor_latihan}`)
        );
        setLessonsSelesai(uniq.size);
      } catch {}
    })();
  }, [penggunaId, resolvedPenggunaId]);

  async function fetchTrophiesByUser(idFor: number) {
    const supabase = createClient();
    const { data } = await supabase
      .from("tantangan_pengguna")
      .select("badge_level")
      .eq("id_pengguna", idFor);
    const counts = { bronze: 0, silver: 0, gold: 0 };
    (data || []).forEach((row: any) => {
      if (row?.badge_level === "bronze") counts.bronze += 1;
      else if (row?.badge_level === "silver") counts.silver += 1;
      else if (row?.badge_level === "gold") counts.gold += 1;
    });
    setTrophies(counts);
    try {
      localStorage.setItem("aizone.trophy", JSON.stringify(counts));
    } catch {}
  }

  function getTodayJakartaDateString() {
    try {
      const todayStr = new Date().toLocaleString("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return todayStr; // YYYY-MM-DD
    } catch {
      // Fallback: gunakan tanggal lokal browser
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
  }

  function getPreviousJakartaDateString(dateStr: string) {
    const base = new Date(`${dateStr}T00:00:00+07:00`);
    if (Number.isNaN(base.getTime())) return dateStr;
    base.setDate(base.getDate() - 1);
    const y = base.getFullYear();
    const m = String(base.getMonth() + 1).padStart(2, "0");
    const d = String(base.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  async function fetchCurrentStreakByUser(idFor: number) {
    const supabase = createClient();
    setIsStreakLoading(true);
    try {
      // Baca current_streak dan last_streak_date dari data_penggunas
      const { data, error } = await supabase
        .from("data_penggunas")
        .select("current_streak, last_streak_date")
        .eq("id_pengguna", idFor)
        .single();

      if (error || !data) {
        setCurrentStreak(0);
        return;
      }

      const streak =
        typeof data?.current_streak === "number" ? data.current_streak : 0;
      const lastDate = data?.last_streak_date;

      // Jika belum pernah ada streak, set 0
      if (!lastDate) {
        setCurrentStreak(0);
        return;
      }

      // Validasi streak berdasarkan tanggal terakhir aktivitas (last_streak_date)
      // Aturan:
      // 1. Jika last_streak_date == HARI INI -> Streak aktif
      // 2. Jika last_streak_date == KEMARIN -> Streak masih aktif (belum putus)
      // 3. Jika last_streak_date < KEMARIN (gap >= 1 hari kosong) -> Streak putus (tampilkan 0)

      const today = getTodayJakartaDateString();
      const yesterday = getPreviousJakartaDateString(today);

      if (lastDate === today || lastDate === yesterday) {
        setCurrentStreak(streak);
      } else {
        // Streak putus secara visual (di database mungkin masih lama sampai user main lagi)
        setCurrentStreak(0);
      }
    } catch {
      setCurrentStreak(0);
    } finally {
      setIsStreakLoading(false);
    }
  }

  useEffect(() => {
    const idForRealtime = penggunaId ?? resolvedPenggunaId;
    if (!idForRealtime) return;
    fetchTrophiesByUser(idForRealtime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penggunaId, resolvedPenggunaId]);

  useEffect(() => {
    const idFor = penggunaId ?? resolvedPenggunaId;
    if (!idFor) return;
    fetchCurrentStreakByUser(idFor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penggunaId, resolvedPenggunaId]);

  // Realtime subscription untuk exp (UPDATE/INSERT pada data_penggunas)
  useEffect(() => {
    const supabase = createClient();
    const idForRealtime = penggunaId ?? resolvedPenggunaId;
    if (!idForRealtime) return;

    const channel = supabase
      .channel("exp-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "data_penggunas",
          filter: `id_pengguna=eq.${idForRealtime}`,
        },
        (payload) => {
          try {
            const newExp = (payload as any)?.new?.exp;
            const newName = (payload as any)?.new?.username;
            const newAvatar = (payload as any)?.new?.avatar;
            const newStreak = (payload as any)?.new?.current_streak;
            if (typeof newExp === "number") {
              setExp(newExp);
              // Setiap EXP berubah, refresh streak harian
              fetchCurrentStreakByUser(idForRealtime);
            }
            if (typeof newStreak === "number") {
              setCurrentStreak(newStreak);
            }
            if (typeof newName === "string") setUserName(newName);
            try {
              if (typeof newExp === "number")
                localStorage.setItem("aizone.exp", String(newExp));
              if (typeof newName === "string")
                localStorage.setItem("aizone.userName", newName);
            } catch {}
            if (typeof newAvatar === "string" && newAvatar) {
              setAvatarUrl(newAvatar);
              try {
                localStorage.setItem("aizone.avatar", newAvatar);
              } catch {}
            }
          } catch {}
        }
      )
      .subscribe();

    return () => {
      try {
        channel.unsubscribe();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penggunaId, resolvedPenggunaId]);

  useEffect(() => {
    const supabase = createClient();
    const idForRealtime = penggunaId ?? resolvedPenggunaId;
    if (!idForRealtime) return;

    const channel = supabase
      .channel("trophy-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tantangan_pengguna",
          filter: `id_pengguna=eq.${idForRealtime}`,
        },
        () => {
          fetchTrophiesByUser(idForRealtime);
        }
      )
      .subscribe();

    return () => {
      try {
        channel.unsubscribe();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penggunaId, resolvedPenggunaId]);

  return (
    <div className="flex justify-end w-full bg-white border-b border-[#E8E8E8] px-[22px] py-1">
      <div className="flex items-center gap-5">
        {/* Search Input */}
        {/* <div className="flex-1">
          <Input
            classNames={{
              base: 'w-full',
              input: 'text-sm',
              inputWrapper: 'h-auto py-2 px-3 border-none shadow-none bg-transparent',
            }}
            placeholder={searchPlaceholder}
            startContent={
              <SearchRegular className="w-[18px] h-[18px] text-default-400 pointer-events-none flex-shrink-0" />
            }
            type="search"
          />
        </div> */}

        <div className="flex items-center gap-4">
          {/* EXP */}
          <div className="flex items-center gap-1">
            <img
              src="/imageAssets/exp-icon.png"
              alt="EXP Icon"
              className="w-10 h-10 object-contain"
              style={{ display: "inline-block", verticalAlign: "middle" }}
            />
            <Skeleton isLoaded={!isLoading} className="rounded-md min-w-[56px]">
              <span className="text-2xl font-[800] text-[#006FEE]">{exp}</span>
            </Skeleton>
          </div>

          {/* STREAK */}
          <div className="flex items-center gap-1">
            <span
              className="text-3xl leading-none inline-flex items-center"
              aria-label="Streak"
            >
              🔥
            </span>
            <Skeleton
              isLoaded={!isLoading && !isStreakLoading}
              className="rounded-md min-w-[56px]"
            >
              <span className="text-2xl font-[800] text-[#F97316]">
                {currentStreak ?? 0}
              </span>
            </Skeleton>
          </div>
        </div>

        {/* Divider */}
        <Divider
          orientation="vertical"
          className="h-auto self-stretch bg-[rgba(17,17,17,0.15)]"
        />

        {/* User Info */}
        <div
          className="flex justify-end items-center gap-3 w-[315px] pr-6 cursor-pointer hover:bg-[#F4F4F5] rounded-xl px-2 py-1"
          onClick={() => setIsProfileOpen(true)}
          role="button"
          aria-label="Lihat profil"
        >
          <div className="flex flex-col items-end justify-center gap-0 px-0 py-[1px]">
            <Skeleton isLoaded={!isLoading} className="rounded-md">
              <span className="text-lg leading-7 text-[#11181C]">
                {userName || "Pengguna"}
              </span>
            </Skeleton>
            <div className="flex items-center justify-center gap-1">
              <CurrentLevelIcon className="w-5 h-5 text-[#F5A524]" />
              <Skeleton isLoaded={!isLoading} className="rounded-md">
                <span className="text-sm leading-5 text-[#F5A524]">
                  {journeyLabel}
                </span>
              </Skeleton>
            </div>
          </div>
          <Skeleton isLoaded={!isLoading} className="rounded-full w-10 h-10">
            <Avatar
              isBordered={false}
              radius="full"
              size="md"
              src={avatarUrl}
              className="w-10 h-10"
            />
          </Skeleton>
        </div>
      </div>
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsProfileOpen(false);
            }}
          >
            <motion.div
              className="w-[37rem] max-w-[92vw]"
              initial={{ y: -24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <Card radius="lg" className="bg-white shadow-2xl z-[60]">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2 h-fit">
                    <img
                      src="/imageAssets/fluent-color_person-24.svg"
                      alt="🤵‍♂️"
                    />
                    <span className="text-2xl font-semibold text-black">
                      Profil
                    </span>
                  </div>
                  <Button
                    isIconOnly
                    radius="full"
                    variant="light"
                    onPress={() => setIsProfileOpen(false)}
                  >
                    <DismissRegular className="w-6 h-6 text-[#71717A]" />
                  </Button>
                </div>
                <CardBody className="px-6 py-8 gap-5 border-[1px] border-[#c2c2c2]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      {/* Outer border container */}
                      <div
                        className="rounded-[14px] p-0 overflow-hidden"
                        style={{
                          background: "white",
                          boxShadow: "0 0 0 4px #3674B5",
                        }}
                      >
                        <Avatar
                          src={avatarUrl}
                          className="w-20 h-20 rounded-[18px] bg-white object-cover"
                        />
                      </div>
                      <Button
                        isIconOnly
                        radius="full"
                        size="sm"
                        variant="light"
                        className="absolute -right-3 -bottom-3 p-1 bg-[#E4E4E7]/70"
                        onPress={() => {
                          setSelectedAvatar(avatarUrl);
                          setIsAvatarPickerOpen(true);
                        }}
                      >
                        <Edit16Color className="w-5 h-5 text-[#3674B5]" />
                      </Button>
                    </div>
                    <div className="flex justify-center items-center gap-1">
                      <span className="text-xl font-semibold text-black ml-10">
                        {userName || "Pengguna"}
                      </span>
                      <Divider
                        orientation="vertical"
                        className="h-5 w-0.5 ml-2 bg-[#E4E4E7]"
                      />
                      <Button
                        isIconOnly
                        radius="full"
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setNameDraft(userName || "");
                          setIsNamePickerOpen(true);
                        }}
                      >
                        <Edit16Color className="w-fit h-auto" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <CurrentLevelIcon className="w-5 h-5 text-[#F5A524]" />
                      <span className="text-sm font-medium text-[#F5A524]">
                        {journeyLabel}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row w-full items-center gap-3 justify-between">
                      <div className="flex flex-col w-[90%] gap-3">
                        <span className="text-sm font-regular text-[#000000]">{`${expTier.current}/${expTier.max} EXP • ${expTier.label}`}</span>
                        <Progress
                          aria-label="EXP Progress"
                          value={expTier.current}
                          maxValue={expTier.max}
                          color="warning"
                          size="md"
                          radius="full"
                          classNames={{ track: "bg-[#E4E4E7]" }}
                        />
                      </div>
                      <div className="w-[5rem] flex flex-col gap-0 items-center">
                        <NextLevelIcon className="w-10 h-10 text-[#3674B5]" />
                        <p className="m-0 p-0 font-semibold text-[#cd00a7]">
                          {nextLevelLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Divider className="bg-[rgba(17,17,17,0.15)]" />
                  <div className="flex flex-col gap-3">
                    <span className="text-base font-semibold text-black">
                      Statistik
                    </span>
                    <div className="grid grid-cols-4 gap-3">
                      <Card
                        radius="lg"
                        className="border-transparent bg-gradient-to-br from-[#62c0ff] to-[#004c78] p-[2px] rounded-2xl"
                      >
                        <CardBody className="p-1 gap-0 items-center bg-white rounded-2xl">
                          <TrophyColor className="w-8 h-8 text-[#F5A524]" />
                          <span className="text-sm font-regular text-black">
                            Peringkat
                          </span>
                          <span className="text-lg font-bold text-[#030d68]">
                            {rankStat ?? 0}
                          </span>
                        </CardBody>
                      </Card>
                      <Card
                        radius="lg"
                        className="border-transparent bg-gradient-to-br from-[#62c0ff] to-[#004c78] p-[2px] rounded-2xl"
                      >
                        <CardBody className="p-1 gap-0 items-center bg-white rounded-2xl">
                          <span
                            className="text-3xl leading-none inline-flex items-center"
                            aria-label="Streak"
                          >
                            🔥
                          </span>
                          <span className="text-sm font-regular text-black">
                            Streak
                          </span>
                          <span className="text-lg font-bold text-[#030d68]">
                            {currentStreak ?? 0}
                          </span>
                        </CardBody>
                      </Card>
                      <Card
                        radius="lg"
                        className="border-transparent bg-gradient-to-br from-[#62c0ff] to-[#004c78] p-[2px] rounded-2xl"
                      >
                        <CardBody className="p-1 gap-0 items-center bg-white rounded-2xl">
                          <Certificate16Color className="w-8 h-8" />
                          <span className="text-sm font-regular text-black">
                            Modul Selesai
                          </span>
                          <span className="text-lg font-bold text-[#00074a]">
                            {modulSelesai}
                          </span>
                        </CardBody>
                      </Card>
                      <Card
                        radius="lg"
                        className="border-transparent bg-gradient-to-br from-[#62c0ff] to-[#004c78] p-[2px] rounded-2xl"
                      >
                        <CardBody className="p-1 gap-0 items-center bg-white rounded-2xl">
                          <Notebook16Color className="w-8 h-8" />
                          <span className="text-sm font-regular text-black">
                            Lesson Selesai
                          </span>
                          <span className="text-lg font-bold text-[#00074a]">
                            {lessonsSelesai}
                          </span>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                  
                  <Divider className="bg-[rgba(17,17,17,0.15)]" />
                  <div className="flex w-full">
                     <Button
                        className="w-full bg-[#FF4D4D] text-white font-medium text-[18px] leading-[46px] h-[46px] rounded-[12px] flex items-center justify-center border-none"
                        style={{
                          minHeight: "46px",
                          backgroundColor: "#FF4D4D",
                          color: "#fff",
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 0 0 #B30000",
                        }}
                        onPress={() => setIsDeleteModalOpen(true)}
                      >
                        Hapus Akun
                      </Button>
                  </div>

                </CardBody>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isNamePickerOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsNamePickerOpen(false);
            }}
          >
            <motion.div
              className="w-[480px] max-w-[92vw]"
              initial={{ y: -24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <Card radius="lg" className="bg-white shadow-2xl">
                <CardBody className="p-6 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-semibold text-black">
                      Edit Username
                    </span>
                    <Button
                      isIconOnly
                      radius="full"
                      variant="light"
                      onPress={() => setIsNamePickerOpen(false)}
                    >
                      <DismissRegular className="w-6 h-6 text-[#71717A]" />
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      value={nameDraft}
                      onValueChange={(v) => {
                        setNameDraft(v);
                        setNameError(null);
                      }}
                      radius="lg"
                      size="md"
                      classNames={{ inputWrapper: "bg-[#F4F4F5]" }}
                    />
                    <span className="text-xs text-[#71717A]">
                      Gunakan 4–10 karakter
                    </span>
                    {nameError ? (
                      <span className="text-xs text-[#F31260]">
                        {nameError}
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <Button
                      className="w-full bg-[#4281c7] text-white font-medium text-[18px] leading-[46px] h-[46px] rounded-[12px] flex items-center justify-center border-none"
                      style={{
                        minHeight: "46px",
                        backgroundColor: "#4281c7",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 0 0 #205994",
                      }}
                      isDisabled={
                        savingName ||
                        nameDraft.trim().length < 4 ||
                        nameDraft.trim().length > 10
                      }
                      onPress={async () => {
                        const val = nameDraft.trim();
                        if (val.length < 4 || val.length > 10) return;
                        setSavingName(true);
                        try {
                          const supabase = createClient();
                          let idFor = penggunaId ?? resolvedPenggunaId;
                          if (!idFor) {
                            const { data: auth } =
                              await supabase.auth.getUser();
                            const uid = auth?.user?.id;
                            if (uid) {
                              const { data: pengguna } = await supabase
                                .from("penggunas")
                                .select("id")
                                .eq("uuid", uid)
                                .single();
                              idFor = pengguna?.id ?? null;
                            }
                          }
                          if (idFor) {
                            const { data: conflicts } = await supabase
                              .from("data_penggunas")
                              .select("id_pengguna")
                              .eq("username", val)
                              .neq("id_pengguna", idFor as number)
                              .limit(1);
                            if (
                              Array.isArray(conflicts) &&
                              conflicts.length > 0
                            ) {
                              setNameError("Username sudah digunakan");
                              return;
                            }
                            await supabase
                              .from("data_penggunas")
                              .update({ username: val })
                              .eq("id_pengguna", idFor);
                          }
                          setUserName(val);
                          try {
                            localStorage.setItem("aizone.userName", val);
                          } catch {}
                          setIsNamePickerOpen(false);
                        } finally {
                          setSavingName(false);
                        }
                      }}
                    >
                      Konfirmasi
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAvatarPickerOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAvatarPickerOpen(false);
            }}
          >
            <motion.div
              className="w-[640px] max-w-[92vw]"
              initial={{ y: -24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <Card radius="lg" className="bg-white shadow-2xl">
                <CardBody className="p-6 gap-5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-semibold text-black">
                      Edit Profil
                    </span>
                    <Button
                      isIconOnly
                      radius="full"
                      variant="light"
                      onPress={() => setIsAvatarPickerOpen(false)}
                    >
                      <DismissRegular className="w-6 h-6 text-[#71717A]" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 gap-y-3 justify-between">
                    {[
                      "/imageAssets/avatar/default.png",
                      "/imageAssets/avatar/avatar-1.png",
                      "/imageAssets/avatar/avatar-2.png",
                      "/imageAssets/avatar/avatar-3.png",
                      "/imageAssets/avatar/avatar-4.png",
                      "/imageAssets/avatar/avatar-5.png",
                      "/imageAssets/avatar/avatar-6.png",
                      "/imageAssets/avatar/avatar-7.png",
                      "/imageAssets/avatar/avatar-8.png",
                      "/imageAssets/avatar/avatar-9.png",
                      "/imageAssets/avatar/avatar-10.png",
                      "/imageAssets/avatar/avatar-11.png",
                      "/imageAssets/avatar/avatar-12.png",
                      "/imageAssets/avatar/avatar-13.png",
                      "/imageAssets/avatar/avatar-14.png",
                      "/imageAssets/avatar/avatar-15.png",
                      "/imageAssets/avatar/avatar-16.png",
                      "/imageAssets/avatar/avatar-17.png",
                    ].map((src) => (
                      <button
                        key={src}
                        onClick={() => setSelectedAvatar(src)}
                        className={`rounded-xl border-4 p-0 transition shadow-sm overflow-hidden ${
                          (selectedAvatar || avatarUrl) === src
                            ? "border-[#3674B5] shadow-[0px_6px_0px_0px_#3674B5]"
                            : "border-[#E4E4E7]"
                        }`}
                        aria-label={src}
                      >
                        <img
                          src={src}
                          alt="avatar"
                          className="w-18 h-18 object-contain"
                        />
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Button
                      className="w-full bg-[#4281c7] text-white font-medium text-[18px] leading-[46px] h-[46px] rounded-[12px] flex items-center justify-center border-none"
                      style={{
                        minHeight: "46px",
                        backgroundColor: "#4281c7",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 0 0 #205994",
                      }}
                      isDisabled={savingAvatar}
                      onPress={async () => {
                        const chosen = selectedAvatar || avatarUrl;
                        setSavingAvatar(true);
                        try {
                          const supabase = createClient();
                          let idFor = penggunaId ?? resolvedPenggunaId;
                          if (!idFor) {
                            const { data: auth } =
                              await supabase.auth.getUser();
                            const uid = auth?.user?.id;
                            if (uid) {
                              const { data: pengguna } = await supabase
                                .from("penggunas")
                                .select("id")
                                .eq("uuid", uid)
                                .single();
                              idFor = pengguna?.id ?? null;
                            }
                          }
                          if (idFor) {
                            await supabase
                              .from("data_penggunas")
                              .update({ avatar: chosen })
                              .eq("id_pengguna", idFor);
                          }
                          setAvatarUrl(chosen);
                          try {
                            localStorage.setItem("aizone.avatar", chosen);
                          } catch {}
                          setIsAvatarPickerOpen(false);
                        } finally {
                          setSavingAvatar(false);
                        }
                      }}
                    >
                      Konfirmasi
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsDeleteModalOpen(false);
            }}
          >
            <motion.div
              className="w-[480px] max-w-[92vw]"
              initial={{ y: -24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <Card radius="lg" className="bg-white shadow-2xl">
                <CardBody className="p-6 gap-6">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-semibold text-black">
                      Konfirmasi Hapus
                    </span>
                    <Button
                      isIconOnly
                      radius="full"
                      variant="light"
                      onPress={() => setIsDeleteModalOpen(false)}
                    >
                      <DismissRegular className="w-6 h-6 text-[#71717A]" />
                    </Button>
                  </div>
                  
                  <p className="text-[#11181C] text-lg text-center">
                    akun yang di hapus tidak bisa di kembalikan. apakah kamu yakin ingin menghapusnya?
                  </p>

                  <div className="flex flex-col gap-3">
                    <Button
                      className="w-full bg-[#4281c7] text-white font-medium text-[18px] leading-[46px] h-[46px] rounded-[12px] flex items-center justify-center border-none"
                      style={{
                        minHeight: "46px",
                        backgroundColor: "#4281c7",
                        color: "#fff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 0 0 #205994",
                      }}
                      isLoading={isDeleting}
                      onPress={async () => {
                        setIsDeleting(true);
                        try {
                          const supabase = createClient();
                          
                          // Attempt to delete user via RPC
                          await supabase.rpc('delete_current_user');
                          
                          // Sign out and clear data
                          await supabase.auth.signOut();
                          try {
                            localStorage.clear();
                          } catch {}
                          
                          window.location.href = "/login";
                        } catch (e) {
                          console.error(e);
                          setIsDeleting(false);
                        }
                      }}
                    >
                      Ya
                    </Button>
                    
                    <Button
                      className="w-full bg-transparent text-[#71717A] font-medium text-[18px] leading-[46px] h-[46px] rounded-[12px] flex items-center justify-center border-2 border-[#E4E4E7]"
                      variant="bordered"
                      onPress={() => setIsDeleteModalOpen(false)}
                    >
                      Tidak
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
