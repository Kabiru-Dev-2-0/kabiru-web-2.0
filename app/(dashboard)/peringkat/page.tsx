'use client';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Podium } from '@/components/podium';
import { RankingCard } from '@/components/ranking-card';
import { MotivationalTooltip } from '@/components/motivational-tooltip';
import { StarColor, PawColor } from '@fluentui/react-icons';
import { Progress } from '@heroui/progress';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type LeaderboardRow = {
  id_pengguna: number;
  username: string;
  avatar: string | null;
  exp: number;
  bronze: number;
  silver: number;
  gold: number;
  score: number;
  rank: number;
};

export default function PeringkatPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: pengguna } = await supabase
            .from('penggunas')
            .select('id')
            .eq('uuid', user.id)
            .single();
          if (pengguna?.id) setCurrentUserId(pengguna.id);
        }

        const { data } = await supabase.rpc('get_leaderboard', {
          p_days_active: 30,
          p_bronze_weight: 1,
          p_silver_weight: 3,
          p_gold_weight: 6,
        });
        setRows((data || []) as LeaderboardRow[]);
      } catch {}
      setLoading(false);
    }
    loadLeaderboard();
  }, []);

  const top1 = rows.find((r) => r.rank === 1);
  const top2 = rows.find((r) => r.rank === 2);
  const top3 = rows.find((r) => r.rank === 3);

  const listRows = rows
    .filter((r) => r.rank > 3)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 7);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex gap-8 p-6">
        {/* Left Column */}
        <div className="flex-1 flex flex-col items-center gap-8">
          {/* Podium */}
          {top1 && top2 && top3 ? (
            <Podium
              secondPlace={{
                name: top2.username || 'Pengguna',
                exp: top2.score,
                avatarSrc: top2.avatar || undefined,
              }}
              firstPlace={{
                name: top1.username || 'Pengguna',
                exp: top1.score,
                avatarSrc: top1.avatar || undefined,
              }}
              thirdPlace={{
                name: top3.username || 'Pengguna',
                exp: top3.score,
                avatarSrc: top3.avatar || undefined,
              }}
            />
          ) : (
            <Podium
              secondPlace={{ name: '...', exp: 0 }}
              firstPlace={{ name: '...', exp: 0 }}
              thirdPlace={{ name: '...', exp: 0 }}
            />
          )}

          {/* Ranking List */}
          <div className="w-full flex flex-col gap-[14px]">
            {listRows.map((r) => (
              <RankingCard
                key={r.id_pengguna}
                rank={r.rank}
                name={r.username || 'Pengguna'}
                exp={r.score}
                trend={'up'}
                label={'POIN'}
                isCurrentUser={currentUserId === r.id_pengguna}
                avatarSrc={r.avatar || undefined}
              />
            ))}

            {currentUserId && rows.some((r) => r.id_pengguna === currentUserId) ? (
              <RankingCard
                rank={rows.find((x) => x.id_pengguna === currentUserId)!.rank}
                name={
                  (rows.find((x) => x.id_pengguna === currentUserId)!.username || 'Kamu') + ' (You)'
                }
                exp={rows.find((x) => x.id_pengguna === currentUserId)!.score}
                trend={'up'}
                label={'POIN'}
                isCurrentUser
                avatarSrc={rows.find((x) => x.id_pengguna === currentUserId)!.avatar || undefined}
              />
            ) : null}
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="w-[300px] flex flex-col gap-6">
          {/* Motivational Image with Tooltip */}
          <div className="flex flex-row items-center relative w-full h-[225px]">
            <div className="absolute right-26 top-22 -translate-x-1/4 px-4 py-2 w-[230px] flex gap-[18px] bg-[#006FEE] rounded-2xl shadow-xl z-10">
              {/* Tooltip Arrow - right top */}
              <div
                className="absolute top-4 -right-3 w-0 h-0"
                style={{
                  borderTop: '12px solid transparent',
                  borderBottom: '12px solid transparent',
                  borderLeft: '16px solid #006FEE',
                }}
              />
              <p className="text-lg leading-7 text-white">
                Selesaikan pelajaran untuk meningkatkan peringkatmu!
              </p>
            </div>
            <div className="flex w-full h-full justify-end items-end">
              <img
                src="/imageAssets/leaderboard-agent.png"
                alt="leaderboard"
                className="mt-[-24px] mb-2 max-w-[180px] w-auto h-[250px]"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Misi Harian Widget */}
          <Card className="border-2 border-[#E4E4E7] shadow-sm bg-white" radius="lg">
            <CardBody className="p-[14px_18px_20px] gap-5">
              <div className="flex items-center justify-center gap-2.5">
                <span className="text-2xl font-semibold text-[#F31260]">Misi Harian</span>
                <Button
                  variant="light"
                  color="primary"
                  size="sm"
                  radius="full"
                  className="min-w-0 h-8"
                >
                  Lihat Semua
                </Button>
              </div>
              <div className="flex items-center gap-2.5">
                <StarColor className="w-[42px] h-[42px]" />
                <Progress
                  value={84}
                  color="warning"
                  size="md"
                  radius="full"
                  label="Dapatkan 10 XP"
                  showValueLabel
                  valueLabel="84%"
                  classNames={{
                    base: 'flex-1',
                    label: 'text-base font-medium text-black',
                    value: 'text-base font-normal text-black',
                  }}
                />
              </div>
            </CardBody>
          </Card>

          {/* Perjalananku Widget */}
          <Card className="border-2 border-[#E4E4E7] shadow-sm bg-white" radius="lg">
            <CardBody className="p-[14px_18px_20px] gap-5">
              <div className="flex items-center justify-center gap-2.5">
                <span className="text-2xl font-semibold text-[#17C964]">Perjalananku</span>
                <Button
                  variant="light"
                  color="primary"
                  size="sm"
                  radius="full"
                  isIconOnly
                  className="min-w-0 w-8 h-8"
                >
                  →
                </Button>
              </div>
              <div className="flex items-center gap-2.5">
                <PawColor className="w-[42px] h-[42px]" />
                <Progress
                  value={30}
                  color="warning"
                  size="md"
                  radius="full"
                  label="Pemula"
                  classNames={{
                    base: 'flex-1',
                    label: 'text-base font-medium text-black',
                  }}
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
