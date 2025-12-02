'use client';
// components/peringkat-widget.tsx
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Progress } from '@heroui/progress';
import Link from 'next/link';
import { TrophyColor, StarColor, PawColor } from '@fluentui/react-icons';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Skeleton } from '@heroui/skeleton';

interface PeringkatWidgetProps {
  rank?: number;
  href?: string;
  title?: string;
  missionTitle?: string;
  missionValue?: number;
  missionHref?: string;
  missions?: Array<{ title: string; value: number }>;
  journeyTitle?: string;
  journeyLabel?: string;
  journeyValue?: number;
  displayedData?: Array<'peringkat' | 'misiHarian' | 'perjalanan'>;
}

export function PeringkatWidget({
  rank,
  href = '/peringkat',
  title = 'Peringkat',
  missionTitle = 'Dapatkan 10 XP',
  missionValue = 84,
  missionHref = '/tantangan',
  missions,
  journeyTitle = 'Perjalananku',
  journeyLabel = 'Pemula',
  journeyValue = 30,
  displayedData = ['peringkat', 'misiHarian', 'perjalanan'],
}: PeringkatWidgetProps) {
  const [missionIndex, setMissionIndex] = useState(0);
  const [localRank, setLocalRank] = useState<number | undefined>(rank);
  const [localMissions, setLocalMissions] = useState<Array<{ title: string; value: number }>>(
    missions || []
  );
  const [localJourneyLabel, setLocalJourneyLabel] = useState<string>(journeyLabel);
  const [localJourneyValue, setLocalJourneyValue] = useState<number>(journeyValue);
  const [isLoadingWidget, setIsLoadingWidget] = useState<boolean>(true);
  const sectionsSet = useMemo(() => new Set(displayedData), [displayedData]);
  const hasMissions = localMissions.length > 0;
  const currentMission = useMemo(() => {
    if (hasMissions) return localMissions[missionIndex % localMissions.length];
    return { title: missionTitle, value: missionValue };
  }, [localMissions, missionIndex, hasMissions, missionTitle, missionValue]);

  const getTierInfo = (row?: any) => {
    if (!row)
      return { tierLabel: 'Bronze', progress: 0, total: 1 } as {
        tierLabel: string;
        progress: number;
        total: number;
      };
    const b = row.threshold_bronze as number | null;
    const s = row.threshold_silver as number | null;
    const g = row.threshold_gold as number | null;
    let tier: 'bronze' | 'silver' | 'gold' | 'completed';
    if (typeof row.best_value === 'number' && g != null && row.best_value >= g) tier = 'completed';
    else if (typeof row.best_value === 'number' && s != null && row.best_value >= s) tier = 'gold';
    else if (typeof row.best_value === 'number' && b != null && row.best_value >= b)
      tier = 'silver';
    else tier = 'bronze';
    const totalBase =
      tier === 'bronze'
        ? (b ?? s ?? g ?? 1)
        : tier === 'silver'
          ? (s ?? g ?? b ?? 1)
          : (g ?? s ?? b ?? 1);
    const total = totalBase || 1;
    const progress = tier === 'completed' ? total : Math.min(Number(row.current_value ?? 0), total);
    const tierLabel =
      tier === 'completed'
        ? 'Gold (Selesai)'
        : tier === 'bronze'
          ? 'Bronze'
          : tier === 'silver'
            ? 'Silver'
            : 'Gold';
    return { tierLabel, progress, total };
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
      if (sectionsSet.has('peringkat')) {
        const lsRank = typeof window !== 'undefined' ? localStorage.getItem('aizone.rank') : null;
        if (lsRank) {
          const n = Number(lsRank);
          if (!Number.isNaN(n)) {
            setLocalRank(n);
            hasAnyCache = true;
          }
        }
      }
      if (sectionsSet.has('misiHarian')) {
        const lsMissions =
          typeof window !== 'undefined' ? localStorage.getItem('aizone.missions') : null;
        if (lsMissions) {
          try {
            const parsed = JSON.parse(lsMissions);
            if (Array.isArray(parsed)) {
              setLocalMissions(parsed);
              hasAnyCache = true;
            }
          } catch {}
        }
      }
      if (sectionsSet.has('perjalanan')) {
        const lsJL =
          typeof window !== 'undefined' ? localStorage.getItem('aizone.journeyLabel') : null;
        const lsJV =
          typeof window !== 'undefined' ? localStorage.getItem('aizone.journeyValue') : null;
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
          .from('penggunas')
          .select('id')
          .eq('uuid', user.id)
          .single();
        const penggunaId = pengguna?.id as number | undefined;
        if (!penggunaId) return;

        if (sectionsSet.has('peringkat')) {
          const { data: leaderboard } = await supabase.rpc('get_leaderboard', {
            p_days_active: 30,
            p_bronze_weight: 1,
            p_silver_weight: 3,
            p_gold_weight: 6,
          });
          const myRow = (leaderboard || []).find((r: any) => r.id_pengguna === penggunaId);
          if (myRow?.rank) {
            setLocalRank(myRow.rank as number);
            try {
              localStorage.setItem('aizone.rank', String(myRow.rank));
            } catch {}
          }
        }

        if (sectionsSet.has('perjalanan')) {
          const { data: expRow } = await supabase
            .from('data_penggunas')
            .select('exp')
            .eq('id_pengguna', penggunaId)
            .single();
          if (expRow && typeof expRow.exp === 'number') {
            const expNum = expRow.exp as number;
            let jl = 'Pemula';
            let jv = 0;
            if (expNum < 1000) {
              jl = 'Pemula';
              jv = Math.round(Math.max(0, Math.min(100, (expNum / 1000) * 100)));
            } else if (expNum >= 1000 && expNum < 3000) {
              jl = 'Mahir';
              jv = Math.round(Math.max(0, Math.min(100, ((expNum - 1000) / 2000) * 100)));
            } else {
              jl = 'Ahli';
              jv = 100;
            }
            setLocalJourneyLabel(jl);
            setLocalJourneyValue(jv);
            try {
              localStorage.setItem('aizone.journeyLabel', jl);
              localStorage.setItem('aizone.journeyValue', String(jv));
            } catch {}
          }
        }

        if (sectionsSet.has('misiHarian')) {
          if (localMissions.length === 0) {
            const { data: vprog } = await supabase
              .from('v_tantangan_progress')
              .select(
                'tipe, judul, current_value, threshold_bronze, threshold_silver, threshold_gold, best_value'
              )
              .eq('id_pengguna', penggunaId);
            const missionRows = (vprog || []).map((r: any) => {
              const { tierLabel, progress, total } = getTierInfo(r);
              const percent = Math.max(
                0,
                Math.min(100, Math.round((progress * 100) / (total || 1)))
              );
              return { title: `${r.judul} — Tingkat ${tierLabel}`, value: percent };
            });
            const sliced = missionRows.slice(0, 3);
            setLocalMissions(sliced);
            try {
              localStorage.setItem('aizone.missions', JSON.stringify(sliced));
            } catch {}
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
      {sectionsSet.has('peringkat') ? (
        <Card className="border-2 border-[#E4E4E7]" radius="lg">
          <CardBody className="p-[14px_18px_20px] gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-[#7828C8]">{title}</span>
              </div>
              <Button as={Link} href={href} color="primary" radius="full" size="sm" variant="light">
                Lihat Semua
              </Button>
            </div>

            <div className="flex items-center gap-2.5">
              <TrophyColor className="w-[42px] h-[42px]" />
              <div className="flex flex-col flex-1">
                <span className="text-base font-medium leading-6 text-black">
                  Saat ini kamu di peringkat
                </span>
                <Skeleton
                  isLoaded={!isLoadingWidget && typeof localRank === 'number'}
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

      {sectionsSet.has('misiHarian') ? (
        <Card className="border-2 border-[#E4E4E7]" radius="lg">
          <CardBody className="p-[14px_18px_20px] gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-[#F31260]">Misi Harian</span>
              </div>
              <Button
                as={Link}
                href={missionHref}
                color="primary"
                radius="full"
                size="sm"
                variant="light"
              >
                Lihat Semua
              </Button>
            </div>

            <AnimatePresence mode="wait">
              <Skeleton isLoaded={!isLoadingWidget && hasMissions} className="rounded-md w-full">
                <motion.div
                  key={`${currentMission.title}-${currentMission.value}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  className="flex items-center gap-2.5"
                >
                  <StarColor className="w-[42px] h-[42px]" />
                  <Progress
                    aria-label="Daily mission"
                    classNames={{
                      base: 'w-full',
                      track: 'bg-[#E4E4E7]',
                      indicator: 'bg-[#F5A524]',
                      label: 'text-base font-medium leading-6 text-black',
                      value: 'text-base font-medium leading-6 text-black',
                    }}
                    color="warning"
                    label={currentMission.title}
                    maxValue={100}
                    radius="full"
                    showValueLabel
                    size="md"
                    value={currentMission.value}
                    valueLabel={`${currentMission.value}%`}
                  />
                </motion.div>
              </Skeleton>
            </AnimatePresence>
          </CardBody>
        </Card>
      ) : null}

      {sectionsSet.has('perjalanan') ? (
        <Card className="border-2 border-[#E4E4E7]" radius="lg">
          <CardBody className="p-[14px_18px_20px] gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-[#17C964]">{journeyTitle}</span>
              </div>
              <Button isIconOnly color="primary" radius="full" size="sm" variant="light">
                →
              </Button>
            </div>

            <div className="flex items-center gap-2.5">
              <PawColor className="w-[42px] h-[42px]" />
              <Skeleton isLoaded={!isLoadingWidget} className="rounded-md w-full">
                <Progress
                  aria-label="Journey progress"
                  classNames={{
                    base: 'w-full',
                    label: 'text-base font-medium leading-6 text-black',
                    track: 'bg-[#E4E4E7]',
                    indicator: 'bg-[#F5A524]',
                  }}
                  color="warning"
                  // label={journeyLabel}
                  maxValue={100}
                  radius="full"
                  size="md"
                  label={localJourneyLabel}
                  value={localJourneyValue}
                />
              </Skeleton>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
