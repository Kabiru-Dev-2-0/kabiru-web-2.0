'use client';
import { useEffect, useState } from 'react';
import { MissionCard } from '@/components/mission-card';
import { StarColor, FlagColor, PaintBrushColor } from '@fluentui/react-icons';
import { createClient } from '@/utils/supabase/client';
import { PeringkatWidget } from '@/components/peringkat-widget';
import { Card, CardBody } from '@heroui/card';
import { CheckmarkCircleColor } from '@fluentui/react-icons';
import { Button } from '@heroui/button';

type ChallengeRow = {
  tipe: 'login_harian' | 'quiz_beruntun' | 'quiz_sempurna';
  judul: string;
  current_value: number;
  best_value: number;
  badge_level: 'none' | 'bronze' | 'silver' | 'gold';
  threshold_bronze: number;
  threshold_silver: number;
  threshold_gold: number;
};

type ClaimFlags = {
  tantangan1_isclaimed: boolean;
  tantangan2_isclaimed: boolean;
  tantangan3_isclaimed: boolean;
};

function getGlobalStage(rows?: ChallengeRow[] | null) {
  if (!rows || rows.length === 0) return 'bronze' as const;
  const allBronze = rows.every((r) => r.best_value >= r.threshold_bronze);
  const allSilver = rows.every((r) => r.best_value >= r.threshold_silver);
  const allGold = rows.every((r) => r.best_value >= r.threshold_gold);
  if (allGold) return 'completed' as const;
  if (allSilver) return 'gold' as const;
  if (allBronze) return 'silver' as const;
  return 'bronze' as const;
}

function getTierInfo(
  row: ChallengeRow | undefined,
  stage: 'bronze' | 'silver' | 'gold' | 'completed'
) {
  if (!row) return { tierLabel: 'Bronze', progress: 0, total: 0 };
  const thresholds = {
    bronze: row.threshold_bronze,
    silver: row.threshold_silver,
    gold: row.threshold_gold,
  };
  const total = stage === 'completed' ? row.threshold_gold : thresholds[stage];
  const isDone =
    stage === 'completed' ? row.best_value >= row.threshold_gold : row.best_value >= total;
  const progress = isDone ? total : Math.min(row.current_value, total);
  const tierLabel = isDone
    ? 'DONE'
    : stage === 'bronze'
      ? 'Bronze'
      : stage === 'silver'
        ? 'Silver'
        : 'Gold';
  return { tierLabel, progress, total };
}

export default function TantanganPage() {
  const [challenges, setChallenges] = useState<ChallengeRow[] | null>(null);
  const [penggunaId, setPenggunaId] = useState<number | null>(null);
  const [claimFlags, setClaimFlags] = useState<ClaimFlags | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);

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
        setPenggunaId(penggunaId);

        const { data } = await supabase
          .from('v_tantangan_progress')
          .select(
            'tipe, judul, current_value, best_value, badge_level, threshold_bronze, threshold_silver, threshold_gold'
          )
          .eq('id_pengguna', penggunaId);

        const rows = Array.isArray(data) ? (data as ChallengeRow[]) : [];
        if (rows.length) setChallenges(rows);

        const { data: dp } = await supabase
          .from('data_penggunas')
          .select('tantangan1_isclaimed, tantangan2_isclaimed, tantangan3_isclaimed')
          .eq('id_pengguna', penggunaId)
          .single();
        if (dp) {
          setClaimFlags({
            tantangan1_isclaimed: !!dp.tantangan1_isclaimed,
            tantangan2_isclaimed: !!dp.tantangan2_isclaimed,
            tantangan3_isclaimed: !!dp.tantangan3_isclaimed,
          });
        }

        await supabase.rpc('log_daily_login', { p_uuid: user.id }).match(() => {});
      } catch {}
    };
    load();
  }, []);

  const loginRow = challenges?.find((r) => r.tipe === 'login_harian');
  const quizRow = challenges?.find((r) => r.tipe === 'quiz_beruntun');
  const modulRow = challenges?.find((r) => r.tipe === 'quiz_sempurna');
  const stage = getGlobalStage(challenges);
  const [viewStage, setViewStage] = useState<'bronze' | 'silver' | 'gold' | 'completed'>('bronze');
  const loginTier = getTierInfo(loginRow, viewStage);
  const quizTier = getTierInfo(quizRow, viewStage);
  const modulTier = getTierInfo(modulRow, viewStage);

  const stageForClaim = viewStage === 'completed' ? 'gold' : viewStage;
  const isAllDoneForStage = (st: 'bronze' | 'silver' | 'gold') => {
    const rows = [loginRow, quizRow, modulRow].filter(Boolean) as ChallengeRow[];
    if (rows.length !== 3) return false;
    return rows.every((r) => {
      const threshold =
        st === 'bronze'
          ? r.threshold_bronze
          : st === 'silver'
            ? r.threshold_silver
            : r.threshold_gold;
      return r.best_value >= threshold;
    });
  };
  const isClaimedForStage = (st: 'bronze' | 'silver' | 'gold') => {
    if (!claimFlags) return false;
    return st === 'bronze'
      ? !!claimFlags.tantangan1_isclaimed
      : st === 'silver'
        ? !!claimFlags.tantangan2_isclaimed
        : !!claimFlags.tantangan3_isclaimed;
  };
  const canClaim = isAllDoneForStage(stageForClaim) && !isClaimedForStage(stageForClaim);

  const handleClaim = async () => {
    if (!penggunaId) return;
    setClaimLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('v_tantangan_progress')
        .select(
          'tipe, judul, current_value, best_value, badge_level, threshold_bronze, threshold_silver, threshold_gold'
        )
        .eq('id_pengguna', penggunaId);
      const rows = Array.isArray(data) ? (data as ChallengeRow[]) : [];
      const lr = rows.find((r) => r.tipe === 'login_harian');
      const qr = rows.find((r) => r.tipe === 'quiz_beruntun');
      const mr = rows.find((r) => r.tipe === 'quiz_sempurna');
      const valid =
        !!lr &&
        !!qr &&
        !!mr &&
        [lr, qr, mr].every((r) => {
          const threshold =
            stageForClaim === 'bronze'
              ? r.threshold_bronze
              : stageForClaim === 'silver'
                ? r.threshold_silver
                : r.threshold_gold;
          return r.best_value >= threshold;
        });
      if (!valid) {
        setClaimLoading(false);
        return;
      }
      const column =
        stageForClaim === 'bronze'
          ? 'tantangan1_isclaimed'
          : stageForClaim === 'silver'
            ? 'tantangan2_isclaimed'
            : 'tantangan3_isclaimed';
      const { error } = await supabase
        .from('data_penggunas')
        .update({ [column]: true })
        .eq('id_pengguna', penggunaId);
      if (!error) {
        const amount = stageForClaim === 'bronze' ? 200 : stageForClaim === 'silver' ? 300 : 500;
        try {
          const { data: authData } = await supabase.auth.getUser();
          const user = authData?.user;
          if (user?.id) {
            await supabase
              .rpc('grant_exp_for_claim', { p_uuid: user.id, p_amount: amount })
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
                tantangan1_isclaimed: column === 'tantangan1_isclaimed',
                tantangan2_isclaimed: column === 'tantangan2_isclaimed',
                tantangan3_isclaimed: column === 'tantangan3_isclaimed',
              }
        );
      }
    } finally {
      setClaimLoading(false);
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
              {(() => {
                const stageIndex =
                  stage === 'bronze' ? 0 : stage === 'silver' ? 1 : stage === 'gold' ? 2 : 3;
                const viewIndex =
                  viewStage === 'bronze'
                    ? 0
                    : viewStage === 'silver'
                      ? 1
                      : viewStage === 'gold'
                        ? 2
                        : 3;
                const nodeClass = (idx: number) =>
                  stageIndex > idx
                    ? 'bg-[#17C964]'
                    : stageIndex === idx
                      ? 'bg-[#17C964]'
                      : 'bg-[#E5E7EB]';
                const lineClass = (idx: number) =>
                  stageIndex > idx ? 'bg-[#17C964]' : 'bg-[#E5E7EB]';
                const labelClass = (idx: number) =>
                  viewIndex === idx
                    ? 'text-[#17C964] font-semibold cursor-pointer'
                    : 'text-[#9CA3AF] cursor-pointer';
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className={`w-3 h-3 rounded-full ${nodeClass(0)}`}
                        onClick={() => setViewStage('bronze')}
                        aria-label="Bronze"
                      />
                      <div className={`h-[2px] flex-1 ${lineClass(0)}`} />
                      <button
                        type="button"
                        className={`w-3 h-3 rounded-full ${nodeClass(1)}`}
                        onClick={() => setViewStage('silver')}
                        aria-label="Silver"
                      />
                      <div className={`h-[2px] flex-1 ${lineClass(1)}`} />
                      <button
                        type="button"
                        className={`w-3 h-3 rounded-full ${nodeClass(2)}`}
                        onClick={() => setViewStage('gold')}
                        aria-label="Gold"
                      />
                      {stage === 'completed' && (
                        <button
                          type="button"
                          onClick={() => setViewStage('completed')}
                          aria-label="Selesai"
                        >
                          <CheckmarkCircleColor className="w-6 h-6 text-[#17C964]" />
                        </button>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className={labelClass(0)} onClick={() => setViewStage('bronze')}>
                        Bronze
                      </span>
                      <span className={labelClass(1)} onClick={() => setViewStage('silver')}>
                        Silver
                      </span>
                      <span className={labelClass(2)} onClick={() => setViewStage('gold')}>
                        {stage === 'completed' ? 'Selesai' : 'Gold'}
                      </span>
                    </div>
                  </>
                );
              })()}
              <div className="flex flex-col gap-5 mt-2">
                <MissionCard
                  icon={<StarColor className="w-[42px] h-[42px]" />}
                  title={`Login Harian — Tingkat ${loginTier.tierLabel}`}
                  progress={loginTier.progress}
                  total={loginTier.total || 7}
                  done={loginTier.tierLabel === 'DONE'}
                />
                <span className="text-sm text-[#71717A]">
                  Tingkat saat ini: {loginTier.tierLabel}
                </span>
                <MissionCard
                  icon={<FlagColor className="w-[42px] h-[42px]" />}
                  title={`Quiz Beruntun — Tingkat ${quizTier.tierLabel}`}
                  progress={quizTier.progress}
                  total={quizTier.total || 7}
                  done={quizTier.tierLabel === 'DONE'}
                />
                <span className="text-sm text-[#71717A]">
                  Tingkat saat ini: {quizTier.tierLabel}
                </span>
                <MissionCard
                  icon={<PaintBrushColor className="w-[42px] h-[42px]" />}
                  title={`Quiz Sempurna — Tingkat ${modulTier.tierLabel}`}
                  progress={modulTier.progress}
                  total={modulTier.total || 3}
                  done={modulTier.tierLabel === 'DONE'}
                />
                <span className="text-sm text-[#71717A]">
                  Tingkat saat ini: {modulTier.tierLabel}
                </span>
              </div>
              {canClaim && (
                <div className="flex justify-end mt-2">
                  <Button
                    color="default"
                    radius="sm"
                    size="md"
                    className="bg-[#ffffff] text-[#2d5d94] border-1 font-semibold text-md px-4 py-2.5 rounded-xl hover:bg-[#ffffff] transition-colors w-fit"
                    style={{
                      boxShadow: '0px 3px 0px 0px #2d5d94',
                    }}
                    isDisabled={claimLoading}
                    onPress={handleClaim}
                  >
                    Terima Hadiah
                  </Button>
                </div>
              )}
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
          <PeringkatWidget displayedData={['peringkat', 'perjalanan']} />
        </div>
      </div>
    </div>
  );
}
