'use client';
import { useEffect, useState } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { MissionCard } from '@/components/mission-card';
import { MotivationalTooltip } from '@/components/motivational-tooltip';
import {
  TrophyColor,
  StarColor,
  FlagColor,
  PaintBrushColor,
  PawColor,
} from '@fluentui/react-icons';
import { Progress } from '@heroui/progress';
import { createClient } from '@/utils/supabase/client';
import { PeringkatWidget } from '@/components/peringkat-widget';

type ChallengeRow = {
  tipe: 'login_harian' | 'quiz_beruntun' | 'modul_selesai';
  judul: string;
  current_value: number;
  best_value: number;
  badge_level: 'none' | 'bronze' | 'silver' | 'gold';
  threshold_bronze: number;
  threshold_silver: number;
  threshold_gold: number;
};

function getTierInfo(row?: ChallengeRow) {
  if (!row) return { tierLabel: 'Bronze', progress: 0, total: 0 };
  const b = row.threshold_bronze;
  const s = row.threshold_silver;
  const g = row.threshold_gold;
  let tier: 'bronze' | 'silver' | 'gold' | 'completed';
  if (row.best_value >= g) tier = 'completed';
  else if (row.best_value >= s) tier = 'gold';
  else if (row.best_value >= b) tier = 'silver';
  else tier = 'bronze';
  const total = tier === 'bronze' ? b : tier === 'silver' ? s : g;
  const progress = tier === 'completed' ? total : Math.min(row.current_value, total);
  const tierLabel =
    tier === 'completed'
      ? 'Gold (Selesai)'
      : tier === 'bronze'
        ? 'Bronze'
        : tier === 'silver'
          ? 'Silver'
          : 'Gold';
  return { tierLabel, progress, total };
}

export default function TantanganPage() {
  const [challenges, setChallenges] = useState<ChallengeRow[] | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;
        const { data: pengguna } = await supabase
          .from('penggunas')
          .select('id')
          .eq('uuid', user.id)
          .single();
        const penggunaId = pengguna?.id as number | undefined;
        if (!penggunaId) return;

        const { data } = await supabase
          .from('v_tantangan_progress')
          .select(
            'tipe, judul, current_value, best_value, badge_level, threshold_bronze, threshold_silver, threshold_gold'
          )
          .eq('id_pengguna', penggunaId);

        const rows = Array.isArray(data) ? (data as ChallengeRow[]) : [];
        if (rows.length) setChallenges(rows);

        await supabase.rpc('log_daily_login', { p_uuid: user.id }).match(() => {});
      } catch {}
    };
    load();
  }, []);

  const loginRow = challenges?.find((r) => r.tipe === 'login_harian');
  const quizRow = challenges?.find((r) => r.tipe === 'quiz_beruntun');
  const modulRow = challenges?.find((r) => r.tipe === 'modul_selesai');
  const loginTier = getTierInfo(loginRow);
  const quizTier = getTierInfo(quizRow);
  const modulTier = getTierInfo(modulRow);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex gap-8 p-6">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Misi Harian Section */}
          <div className="flex flex-col gap-5">
            <MissionCard
              icon={<StarColor className="w-[42px] h-[42px]" />}
              title={`Login Harian — Tingkat ${loginTier.tierLabel}`}
              progress={loginTier.progress}
              total={loginTier.total || 7}
            />
            <span className="text-sm text-[#71717A]">Tingkat saat ini: {loginTier.tierLabel}</span>
            <MissionCard
              icon={<FlagColor className="w-[42px] h-[42px]" />}
              title={`Quiz Beruntun — Tingkat ${quizTier.tierLabel}`}
              progress={quizTier.progress}
              total={quizTier.total || 7}
            />
            <span className="text-sm text-[#71717A]">Tingkat saat ini: {quizTier.tierLabel}</span>
            <MissionCard
              icon={<PaintBrushColor className="w-[42px] h-[42px]" />}
              title={`Modul Selesai — Tingkat ${modulTier.tierLabel}`}
              progress={modulTier.progress}
              total={modulTier.total || 3}
            />
            <span className="text-sm text-[#71717A]">Tingkat saat ini: {modulTier.tierLabel}</span>
          </div>

          {/* Motivational Image with Tooltip */}
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
          <PeringkatWidget displayedData={['peringkat', 'perjalanan']} />
        </div>
      </div>
    </div>
  );
}
