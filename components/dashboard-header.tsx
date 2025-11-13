'use client';

import { Input } from '@heroui/input';
import { Avatar } from '@heroui/avatar';
import { Divider } from '@heroui/divider';
import { SearchRegular } from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface DashboardHeaderProps {
  searchPlaceholder?: string;
  initialUserName?: string;
  initialExp?: number;
  penggunaId?: number; // untuk Realtime subscription
}

export const DashboardHeader = ({
  searchPlaceholder = 'Cari disini...',
  initialUserName,
  initialExp,
  penggunaId,
}: DashboardHeaderProps) => {
  const [exp, setExp] = useState<number>(initialExp ?? 0);
  const [userName, setUserName] = useState<string>(initialUserName ?? '');
  const [resolvedPenggunaId, setResolvedPenggunaId] = useState<number | null>(penggunaId ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(
    // Anggap loading jika tidak ada penggunaId SSR dan nama awal kosong
    !(typeof penggunaId === 'number' && penggunaId > 0) && !initialUserName
  );

  // Prefill dari localStorage (client-only) agar cepat tampil tanpa menunggu fetch
  useEffect(() => {
    try {
      const lsName = typeof window !== 'undefined' ? localStorage.getItem('aizone.userName') : null;
      const lsExpStr = typeof window !== 'undefined' ? localStorage.getItem('aizone.exp') : null;
      if (lsName || lsExpStr) {
        if (lsName) setUserName(lsName);
        if (lsExpStr) {
          const parsed = Number(lsExpStr);
          if (!Number.isNaN(parsed)) setExp(parsed);
        }
        setIsLoading(false);
      }
    } catch {}
  }, []);

  // Fallback fetch jika props SSR tidak diberikan
  useEffect(() => {
    async function loadExp() {
      if (
        initialUserName !== undefined &&
        initialUserName !== '' &&
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
          .from('penggunas')
          .select('id')
          .eq('uuid', user.id)
          .single();
        if (penggunaError || !pengguna) return;

        setResolvedPenggunaId(pengguna.id);

        // Ambil data pengguna (nama + exp total)
        const { data: expRow, error: expError } = await supabase
          .from('data_penggunas')
          .select('exp, nama_lengkap')
          .eq('id_pengguna', pengguna.id)
          .single();
        if (expError || !expRow) return;

        setUserName(expRow?.nama_lengkap || '');
        setExp(expRow?.exp || 0);
        try {
          localStorage.setItem('aizone.userName', expRow?.nama_lengkap || '');
          localStorage.setItem('aizone.exp', String(expRow?.exp || 0));
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

  // Realtime subscription untuk exp (UPDATE/INSERT pada data_penggunas)
  useEffect(() => {
    const supabase = createClient();
    const idForRealtime = penggunaId ?? resolvedPenggunaId;
    if (!idForRealtime) return;

    const channel = supabase
      .channel('exp-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'data_penggunas',
          filter: `id_pengguna=eq.${idForRealtime}`,
        },
        (payload) => {
          try {
            const newExp = (payload as any)?.new?.exp;
            const newName = (payload as any)?.new?.nama_lengkap;
            if (typeof newExp === 'number') setExp(newExp);
            if (typeof newName === 'string') setUserName(newName);
            try {
              if (typeof newExp === 'number') localStorage.setItem('aizone.exp', String(newExp));
              if (typeof newName === 'string') localStorage.setItem('aizone.userName', newName);
            } catch {}
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

  return (
    <div className="w-full bg-white border-b border-[#E8E8E8] px-[22px] py-4">
      <div className="flex items-center gap-5">
        {/* Search Input */}
        <div className="flex-1">
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
        </div>

        {/* EXP */}
        <div className="flex items-center gap-1">
          <span className="text-2xl font-[800] bg-gradient-to-r from-[#6ADCFC] via-[#5B71E0] to-[#8F5ED7] bg-clip-text text-transparent">
            EXP
          </span>
          <span className="text-2xl font-[800] text-[#006FEE]">{isLoading ? '...' : exp}</span>
        </div>

        {/* Trophy */}
        <div className="flex items-center gap-1">
          <div className="w-7 h-7">
            {/* Trophy Icon - using emoji as placeholder */}
            🏆
          </div>
          <span className="text-2xl font-[800] text-[#F5A524]">10</span>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-1">
          <div className="w-7 h-7">
            {/* Ribbon Icon - using emoji as placeholder */}
            🎖️
          </div>
          <span className="text-2xl font-[800] text-[#7828C8]">4</span>
        </div>

        {/* Divider */}
        <Divider orientation="vertical" className="h-auto self-stretch bg-[rgba(17,17,17,0.15)]" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end justify-center gap-0 px-0 py-[1px]">
            <span className="text-lg leading-7 text-[#11181C]">
              {isLoading ? '...' : userName || 'Pengguna'}
            </span>
            <div className="flex items-center justify-center gap-1">
              <div className="w-[18px] h-[18px]">
                {/* Paw Icon - using emoji as placeholder */}
                🐾
              </div>
              <span className="text-sm leading-5 text-[#F5A524]">Pemula</span>
            </div>
          </div>
          <Avatar
            isBordered={false}
            radius="full"
            size="md"
            src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
            className="w-10 h-10"
          />
        </div>
      </div>
    </div>
  );
};
