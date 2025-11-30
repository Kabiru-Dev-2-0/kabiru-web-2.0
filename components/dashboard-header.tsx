'use client';

import { Input } from '@heroui/input';
import { Avatar } from '@heroui/avatar';
import { Divider } from '@heroui/divider';
import {
  SearchRegular,
  TrophyColor,
  DismissRegular,
  PawColor,
  EditRegular,
} from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Progress } from '@heroui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Certificate16Color } from '@fluentui/react-icons';
import { Notebook16Color } from '@fluentui/react-icons';

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
  const [trophies, setTrophies] = useState<{ bronze: number; silver: number; gold: number }>({
    bronze: 0,
    silver: 0,
    gold: 0,
  });
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('/imageAssets/avatar/default.png');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [isNamePickerOpen, setIsNamePickerOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Prefill dari localStorage (client-only) agar cepat tampil tanpa menunggu fetch
  useEffect(() => {
    try {
      const lsName = typeof window !== 'undefined' ? localStorage.getItem('aizone.userName') : null;
      const lsExpStr = typeof window !== 'undefined' ? localStorage.getItem('aizone.exp') : null;
      const lsTrophy = typeof window !== 'undefined' ? localStorage.getItem('aizone.trophy') : null;
      const lsAvatar = typeof window !== 'undefined' ? localStorage.getItem('aizone.avatar') : null;
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
          .select('exp, username, avatar')
          .eq('id_pengguna', pengguna.id)
          .single();
        if (expError || !expRow) return;

        setUserName(expRow?.username || '');
        setExp(expRow?.exp || 0);
        try {
          localStorage.setItem('aizone.userName', expRow?.username || '');
          localStorage.setItem('aizone.exp', String(expRow?.exp || 0));
        } catch {}
        const av =
          typeof expRow?.avatar === 'string' && expRow.avatar
            ? expRow.avatar
            : '/imageAssets/avatar/default.png';
        setAvatarUrl(av);
        try {
          localStorage.setItem('aizone.avatar', av);
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

  async function fetchTrophiesByUser(idFor: number) {
    const supabase = createClient();
    const { data } = await supabase
      .from('tantangan_pengguna')
      .select('badge_level')
      .eq('id_pengguna', idFor);
    const counts = { bronze: 0, silver: 0, gold: 0 };
    (data || []).forEach((row: any) => {
      if (row?.badge_level === 'bronze') counts.bronze += 1;
      else if (row?.badge_level === 'silver') counts.silver += 1;
      else if (row?.badge_level === 'gold') counts.gold += 1;
    });
    setTrophies(counts);
    try {
      localStorage.setItem('aizone.trophy', JSON.stringify(counts));
    } catch {}
  }

  useEffect(() => {
    const idForRealtime = penggunaId ?? resolvedPenggunaId;
    if (!idForRealtime) return;
    fetchTrophiesByUser(idForRealtime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [penggunaId, resolvedPenggunaId]);

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
            const newName = (payload as any)?.new?.username;
            const newAvatar = (payload as any)?.new?.avatar;
            if (typeof newExp === 'number') setExp(newExp);
            if (typeof newName === 'string') setUserName(newName);
            try {
              if (typeof newExp === 'number') localStorage.setItem('aizone.exp', String(newExp));
              if (typeof newName === 'string') localStorage.setItem('aizone.userName', newName);
            } catch {}
            if (typeof newAvatar === 'string' && newAvatar) {
              setAvatarUrl(newAvatar);
              try {
                localStorage.setItem('aizone.avatar', newAvatar);
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
      .channel('trophy-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tantangan_pengguna',
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
    <div className="flex justify-end w-full bg-white border-b border-[#E8E8E8] px-[22px] py-4">
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
              alt="Trophy Icon"
              className="w-10 h-10 md:w-10 md:h-10 object-contain mr-1"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            />
            <span className="text-2xl font-[800] text-[#006FEE]">{isLoading ? '...' : exp}</span>
          </div>

          {/* Trophy */}
          <div className="flex items-center gap-3">
            {mounted ? (
              <>
                <div className="flex items-center gap-1">
                  <TrophyColor className="w-7 h-7 text-[#CD7F32]" />
                  <span className="text-xl font-[800] text-[#CD7F32]">{trophies.bronze}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrophyColor className="w-7 h-7 text-[#C0C0C0]" />
                  <span className="text-xl font-[800] text-[#C0C0C0]">{trophies.silver}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrophyColor className="w-7 h-7 text-[#FFD700]" />
                  <span className="text-xl font-[800] text-[#FFD700]">{trophies.gold}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <TrophyColor className="w-7 h-7 text-[#A1A1AA]" />
                <span className="text-xl font-[800] text-[#A1A1AA]">...</span>
              </div>
            )}
          </div>

          {/* Badge */}
          <div className="flex items-center gap-1">
            <img
              src="/imageAssets/badge-icon.png"
              alt="Trophy Icon"
              className="w-10 h-10 md:w-7 md:h-7 object-contain mr-1"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            />
            <span className="text-2xl font-[800] text-[#7828C8]">
              {trophies.bronze + trophies.silver + trophies.gold}
            </span>
          </div>
        </div>

        {/* Divider */}
        <Divider orientation="vertical" className="h-auto self-stretch bg-[rgba(17,17,17,0.15)]" />

        {/* User Info */}
        <div
          className="flex justify-end items-center gap-3 w-[315px] pr-6 cursor-pointer hover:bg-[#F4F4F5] rounded-xl px-2 py-1"
          onClick={() => setIsProfileOpen(true)}
          role="button"
          aria-label="Lihat profil"
        >
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
            src={avatarUrl}
            className="w-10 h-10"
          />
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
              className="w-[720px] max-w-[92vw]"
              initial={{ y: -24, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 24, scale: 0.98, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              <Card radius="lg" className="bg-white shadow-2xl z-[60]">
                <CardBody className="p-6 gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#006FEE]" />
                      <span className="text-2xl font-semibold text-black">Profil</span>
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
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <Avatar src={avatarUrl} className="w-20 h-20" />
                      <Button
                        isIconOnly
                        radius="full"
                        size="sm"
                        variant="light"
                        className="absolute -right-3 -bottom-3"
                        onPress={() => {
                          setSelectedAvatar(avatarUrl);
                          setIsAvatarPickerOpen(true);
                        }}
                      >
                        <EditRegular className="w-5 h-5 text-[#3674B5]" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-black">
                        {userName || 'Pengguna'}
                      </span>
                      <Button
                        isIconOnly
                        radius="full"
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setNameDraft(userName || '');
                          setIsNamePickerOpen(true);
                        }}
                      >
                        <EditRegular className="w-5 h-5 text-[#3674B5]" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <PawColor className="w-5 h-5 text-[#F5A524]" />
                      <span className="text-sm font-medium text-[#F5A524]">Pemula</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#71717A]">{`${Math.min(exp % 2000, 2000)}/${2000} EXP`}</span>
                    <Progress
                      aria-label="EXP Progress"
                      value={Math.min(exp % 2000, 2000)}
                      maxValue={2000}
                      color="warning"
                      size="md"
                      radius="full"
                      classNames={{ track: 'bg-[#E4E4E7]' }}
                    />
                  </div>
                  <Divider className="bg-[rgba(17,17,17,0.15)]" />
                  <div className="flex flex-col gap-3">
                    <span className="text-base font-semibold text-black">Statistik</span>
                    <div className="grid grid-cols-4 gap-3">
                      <Card radius="lg" className="border-2 border-[#E4E4E7]">
                        <CardBody className="p-3 gap-2 items-center">
                          <TrophyColor className="w-6 h-6 text-[#F5A524]" />
                          <span className="text-sm font-semibold text-black">Peringkat</span>
                          <span className="text-lg font-bold text-[#7828C8]">17</span>
                        </CardBody>
                      </Card>
                      <Card radius="lg" className="border-2 border-[#E4E4E7]">
                        <CardBody className="p-3 gap-2 items-center">
                          <img src="/imageAssets/badge-icon.png" className="w-6 h-6" alt="Badge" />
                          <span className="text-sm font-semibold text-black">Badge</span>
                          <span className="text-lg font-bold text-[#7828C8]">
                            {trophies.bronze + trophies.silver + trophies.gold}
                          </span>
                        </CardBody>
                      </Card>
                      <Card radius="lg" className="border-2 border-[#E4E4E7]">
                        <CardBody className="p-3 gap-2 items-center">
                          <Certificate16Color className="w-6 h-6 text-[#7828C8]" />
                          <span className="text-sm font-semibold text-black">Modul Selesai</span>
                          <span className="text-lg font-bold text-[#7828C8]">1</span>
                        </CardBody>
                      </Card>
                      <Card radius="lg" className="border-2 border-[#E4E4E7]">
                        <CardBody className="p-3 gap-2 items-center">
                          <Notebook16Color className="w-6 h-6 text-[#7828C8]" />
                          <span className="text-sm font-semibold text-black">Lesson Selesai</span>
                          <span className="text-lg font-bold text-[#7828C8]">13</span>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="text-base font-semibold text-black">Koleksi Penghargaan</span>
                    <div className="grid grid-cols-6 gap-2">
                      <div className="w-12 h-12 rounded-lg border-2 border-[#E4E4E7] flex items-center justify-center">
                        <TrophyColor className="w-7 h-7 text-[#CD7F32]" />
                      </div>
                      <div className="w-12 h-12 rounded-lg border-2 border-[#E4E4E7] flex items-center justify-center">
                        <TrophyColor className="w-7 h-7 text-[#C0C0C0]" />
                      </div>
                      <div className="w-12 h-12 rounded-lg border-2 border-[#E4E4E7] flex items-center justify-center">
                        <TrophyColor className="w-7 h-7 text-[#FFD700]" />
                      </div>
                      <div className="w-12 h-12 rounded-lg border-2 border-[#E4E4E7] flex items-center justify-center">
                        <TrophyColor className="w-7 h-7 text-[#3674B5]" />
                      </div>
                      <div className="w-12 h-12 rounded-lg border-2 border-[#E4E4E7] flex items-center justify-center">
                        <TrophyColor className="w-7 h-7 text-[#17C964]" />
                      </div>
                      <div className="w-12 h-12 rounded-lg border-2 border-[#E4E4E7] flex items-center justify-center">
                        <TrophyColor className="w-7 h-7 text-[#F31260]" />
                      </div>
                    </div>
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
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              <Card radius="lg" className="bg-white shadow-2xl">
                <CardBody className="p-6 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-semibold text-black">Edit Nickname</span>
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
                      classNames={{ inputWrapper: 'bg-[#F4F4F5]' }}
                    />
                    <span className="text-xs text-[#71717A]">Gunakan 4–10 karakter</span>
                    {nameError ? <span className="text-xs text-[#F31260]">{nameError}</span> : null}
                  </div>
                  <div>
                    <Button
                      color="primary"
                      radius="lg"
                      size="md"
                      className="w-full"
                      isDisabled={
                        savingName || nameDraft.trim().length < 4 || nameDraft.trim().length > 10
                      }
                      onPress={async () => {
                        const val = nameDraft.trim();
                        if (val.length < 4 || val.length > 10) return;
                        setSavingName(true);
                        try {
                          const supabase = createClient();
                          let idFor = penggunaId ?? resolvedPenggunaId;
                          if (!idFor) {
                            const { data: auth } = await supabase.auth.getUser();
                            const uid = auth?.user?.id;
                            if (uid) {
                              const { data: pengguna } = await supabase
                                .from('penggunas')
                                .select('id')
                                .eq('uuid', uid)
                                .single();
                              idFor = pengguna?.id ?? null;
                            }
                          }
                          if (idFor) {
                            const { data: conflicts } = await supabase
                              .from('data_penggunas')
                              .select('id_pengguna')
                              .eq('username', val)
                              .neq('id_pengguna', idFor as number)
                              .limit(1);
                            if (Array.isArray(conflicts) && conflicts.length > 0) {
                              setNameError('Username sudah digunakan');
                              return;
                            }
                            await supabase
                              .from('data_penggunas')
                              .update({ username: val })
                              .eq('id_pengguna', idFor);
                          }
                          setUserName(val);
                          try {
                            localStorage.setItem('aizone.userName', val);
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
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              <Card radius="lg" className="bg-white shadow-2xl">
                <CardBody className="p-6 gap-5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-semibold text-black">Edit Profil</span>
                    <Button
                      isIconOnly
                      radius="full"
                      variant="light"
                      onPress={() => setIsAvatarPickerOpen(false)}
                    >
                      <DismissRegular className="w-6 h-6 text-[#71717A]" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 gap-y-3 justify-between">
                    {[
                      '/imageAssets/avatar/default.png',
                      '/imageAssets/avatar/avatar-1.png',
                      '/imageAssets/avatar/avatar-2.png',
                      '/imageAssets/avatar/avatar-3.png',
                      '/imageAssets/avatar/avatar-4.png',
                      '/imageAssets/avatar/avatar-5.png',
                      '/imageAssets/avatar/avatar-6.png',
                      '/imageAssets/avatar/avatar-7.png',
                      '/imageAssets/avatar/avatar-8.png',
                      '/imageAssets/avatar/avatar-9.png',
                      '/imageAssets/avatar/avatar-10.png',
                      '/imageAssets/avatar/avatar-11.png',
                      '/imageAssets/avatar/avatar-12.png',
                      '/imageAssets/avatar/avatar-13.png',
                      '/imageAssets/avatar/avatar-14.png',
                      '/imageAssets/avatar/avatar-15.png',
                      '/imageAssets/avatar/avatar-16.png',
                      '/imageAssets/avatar/avatar-17.png',
                    ].map((src) => (
                      <button
                        key={src}
                        onClick={() => setSelectedAvatar(src)}
                        className={`rounded-xl border-5 p-2 transition shadow-sm ${
                          (selectedAvatar || avatarUrl) === src
                            ? 'border-[#3674B5] shadow-[0px_6px_0px_0px_#3674B5]'
                            : 'border-[#E4E4E7]'
                        }`}
                        aria-label={src}
                      >
                        <img src={src} alt="avatar" className="w-16 h-16 object-contain" />
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Button
                      color="primary"
                      radius="lg"
                      size="md"
                      className="w-full"
                      isDisabled={savingAvatar}
                      onPress={async () => {
                        const chosen = selectedAvatar || avatarUrl;
                        setSavingAvatar(true);
                        try {
                          const supabase = createClient();
                          let idFor = penggunaId ?? resolvedPenggunaId;
                          if (!idFor) {
                            const { data: auth } = await supabase.auth.getUser();
                            const uid = auth?.user?.id;
                            if (uid) {
                              const { data: pengguna } = await supabase
                                .from('penggunas')
                                .select('id')
                                .eq('uuid', uid)
                                .single();
                              idFor = pengguna?.id ?? null;
                            }
                          }
                          if (idFor) {
                            await supabase
                              .from('data_penggunas')
                              .update({ avatar: chosen })
                              .eq('id_pengguna', idFor);
                          }
                          setAvatarUrl(chosen);
                          try {
                            localStorage.setItem('aizone.avatar', chosen);
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
    </div>
  );
};
