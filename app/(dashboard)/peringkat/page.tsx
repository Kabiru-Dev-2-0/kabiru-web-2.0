'use client';
import { Card, CardBody } from '@heroui/card';
import { Podium } from '@/components/podium';
import { RankingCard } from '@/components/ranking-card';
import { Skeleton } from '@heroui/skeleton';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PeringkatWidget } from '@/components/peringkat-widget';
import { motion, AnimatePresence } from 'framer-motion';

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
  streak: number;
  last_activity: string;
};

export default function PeringkatPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasCache, setHasCache] = useState<boolean>(false);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(!hasCache);
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
          if (pengguna?.id) {
            setCurrentUserId(pengguna.id);
            try {
              localStorage.setItem('aizone.leaderboard.currentUserId', String(pengguna.id));
            } catch {}
          }
        }

        const { data } = await supabase.rpc('get_leaderboard', {
          p_bronze_weight: 1,
          p_silver_weight: 3,
          p_gold_weight: 6,
        });
        setRows((data || []) as LeaderboardRow[]);
        try {
          localStorage.setItem('aizone.leaderboard.rows', JSON.stringify(data || []));
        } catch {}
      } catch {}
      setLoading(false);
    }
    try {
      const lsRows =
        typeof window !== 'undefined' ? localStorage.getItem('aizone.leaderboard.rows') : null;
      const lsUid =
        typeof window !== 'undefined'
          ? localStorage.getItem('aizone.leaderboard.currentUserId')
          : null;
      let used = false;
      if (lsRows) {
        try {
          const parsed = JSON.parse(lsRows);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRows(parsed as LeaderboardRow[]);
            used = true;
          }
        } catch {}
      }
      if (lsUid) {
        const uid = Number(lsUid);
        if (!Number.isNaN(uid)) {
          setCurrentUserId(uid);
          used = true;
        }
      }
      if (used) {
        setHasCache(true);
        setLoading(false);
      }
    } catch {}
    loadLeaderboard();
  }, []);

  const top1 = rows.find((r) => r.rank === 1);
  const top2 = rows.find((r) => r.rank === 2);
  const top3 = rows.find((r) => r.rank === 3);

  const displayedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => a.rank - b.rank);
    const top10 = sorted.filter((r) => r.rank <= 10);
    const currentUserRow = sorted.find((r) => r.id_pengguna === currentUserId);
    
    // Jika user tidak ada di top 20, tambahkan di bawah
    if (currentUserRow && currentUserRow.rank > 10) {
      return [...top10, currentUserRow];
    }
    
    return top10;
  }, [rows, currentUserId]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex gap-8 p-6">
        {/* Left Column */}
        <div className="flex-1 flex flex-col items-center gap-8">
          {loading ? (
            <>
              <Card className="w-[700px] border-2 border-[#E4E4E7]" radius="lg">
                <CardBody className="p-6">
                  <div className="w-full flex justify-center">
                    <Skeleton className="w-[360px] h-[190px] rounded-xl" />
                  </div>
                </CardBody>
              </Card>
              <div className="w-full flex flex-col gap-[14px]">
                {[...Array(7)].map((_, i) => (
                  <Card key={i} className="w-full border-2 border-[#E4E4E7]" radius="lg">
                    <CardBody className="p-4 flex flex-row items-center gap-4">
                      <Skeleton className="w-10 rounded-full" />
                      <div className="flex-1 flex flex-row gap-2">
                        <Skeleton className="w-40 h-5 rounded-md" />
                        <Skeleton className="w-24 h-4 rounded-md" />
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
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
                <AnimatePresence mode='popLayout'>
                  {displayedRows.map((r) => (
                    <motion.div
                      key={r.id_pengguna}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RankingCard
                        rank={r.rank}
                        name={r.username || 'Pengguna'}
                        exp={r.score}
                        label={'EXP'}
                        isCurrentUser={currentUserId === r.id_pengguna}
                        avatarSrc={r.avatar || undefined}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Widgets */}
        <div className="w-[300px] flex flex-col gap-6">
          {/* Motivational Image with Tooltip */}
          <div className="flex flex-row items-center relative w-full h-[225px]">
            <div className="absolute right-26 top-22 -translate-x-1/4 px-4 py-2 w-[230px] flex gap-[18px] bg-[#3674B5] rounded-2xl shadow-xl z-10">
              {/* Tooltip Arrow - right top */}
              <div
                className="absolute top-4 -right-3 w-0 h-0"
                style={{
                  borderTop: '12px solid transparent',
                  borderBottom: '12px solid transparent',
                  borderLeft: '16px solid #3674B5',
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

          <PeringkatWidget displayedData={['misiHarian', 'perjalanan']} />
        </div>
      </div>
    </div>
  );
}
