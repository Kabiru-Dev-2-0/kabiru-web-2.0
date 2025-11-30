'use client';

import { Card, CardBody } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { ChevronLeftRegular, ChevronRightRegular, DismissRegular } from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function PerkenalanPage() {
  const [step, setStep] = useState<number>(0);
  const [asalSekolah, setAsalSekolah] = useState<string>('');
  const [jenjang, setJenjang] = useState<number | null>(null);
  const [username, setUsername] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('/imageAssets/avatar/default.png');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) {
        router.replace('/login');
        return;
      }
      const { data: pengguna } = await supabase
        .from('penggunas')
        .select('id')
        .eq('uuid', user.id)
        .single();
      const penggunaId = pengguna?.id as number | undefined;
      if (!penggunaId) {
        setLoading(false);
        return;
      }
      const { data: row } = await supabase
        .from('data_penggunas')
        .select('asal_sekolah, jenjang, username, avatar, is_pengguna_baru')
        .eq('id_pengguna', penggunaId)
        .single();
      setAsalSekolah((row?.asal_sekolah as string) || '');
      setJenjang(typeof row?.jenjang === 'number' ? (row?.jenjang as number) : null);
      setUsername((row?.username as string) || '');
      const av =
        typeof row?.avatar === 'string' && row?.avatar
          ? (row?.avatar as string)
          : '/imageAssets/avatar/default.png';
      setAvatarUrl(av);
      setLoading(false);
    })();
  }, [router]);

  async function upsertField(partial: Record<string, any>) {
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
    const { data: existing } = await supabase
      .from('data_penggunas')
      .select('id')
      .eq('id_pengguna', penggunaId)
      .single();
    if (existing) {
      await supabase.from('data_penggunas').update(partial).eq('id_pengguna', penggunaId);
    } else {
      await supabase.from('data_penggunas').insert({ id_pengguna: penggunaId, ...partial });
    }
  }

  async function handleNextFromSchool() {
    if (!asalSekolah.trim()) return;
    setSaving(true);
    await upsertField({ asal_sekolah: asalSekolah.trim() });
    setSaving(false);
    setStep(1);
  }

  async function handleNextFromJenjang() {
    if (jenjang === null) return;
    setSaving(true);
    await upsertField({ jenjang });
    setSaving(false);
    setStep(2);
  }

  async function handleNextFromUsername() {
    const val = username.trim();
    if (val.length < 4 || val.length > 10 || val.includes(' ')) {
      setUsernameError('Gunakan 4–10 karakter tanpa spasi');
      return;
    }
    setSavingUsername(true);
    setUsernameError(null);
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) {
      setSavingUsername(false);
      return;
    }
    const { data: pengguna } = await supabase
      .from('penggunas')
      .select('id')
      .eq('uuid', user.id)
      .single();
    const penggunaId = pengguna?.id as number | undefined;
    if (!penggunaId) {
      setSavingUsername(false);
      return;
    }
    const { data: existing } = await supabase
      .from('data_penggunas')
      .select('id_pengguna')
      .eq('username', val)
      .neq('id_pengguna', penggunaId)
      .limit(1);
    if (Array.isArray(existing) && existing.length > 0) {
      setUsernameError('Username sudah digunakan');
      setSavingUsername(false);
      return;
    }
    await upsertField({ username: val });
    setSavingUsername(false);
    setStep(3);
  }

  async function handleFinish() {
    const chosen = selectedAvatar || avatarUrl;
    if (!chosen) return;
    setSaving(true);
    await upsertField({ avatar: chosen, is_pengguna_baru: false });
    setSaving(false);
    router.replace('/dashboard');
  }

  const stepsTotal = 4;
  const canGoPrev = step > 0;
  const canGoNext =
    step < stepsTotal - 1 &&
    (step === 0
      ? !!asalSekolah.trim()
      : step === 1
        ? jenjang !== null
        : step === 2
          ? username.trim().length >= 4 && username.trim().length <= 10 && !username.includes(' ')
          : !!(selectedAvatar || avatarUrl));
  const canFinish =
    step === stepsTotal - 1 && !!(selectedAvatar || avatarUrl) && !saving && !savingAvatar;

  const handleExit = () => {
    router.replace('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FCFDFD] flex flex-col">
      {/* Header seperti halaman quiz */}
      <div className="w-full bg-white border-b border-[#E8E8E8] px-12 py-4">
        <div className="flex items-center justify-center gap-5">
          <div className="w-[100px] flex items-center">
            <Button
              isIconOnly
              variant="light"
              radius="full"
              size="lg"
              className="min-w-0 w-8 h-8"
              onClick={handleExit}
            >
              <DismissRegular className="w-8 h-8 text-[#3674B5]" />
            </Button>
          </div>

          {/* Progress Section */}
          <div className="flex flex-col items-center justify-center gap-2.5 flex-1">
            <div className="flex items-center gap-8 w-[80%]">
              {/* Arrow Left */}
              <button
                onClick={() => setStep((s) => (canGoPrev ? s - 1 : s))}
                disabled={!canGoPrev}
                className="w-8 h-8 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeftRegular className="w-8 h-8 text-[#A1A1AA]" />
              </button>

              {/* Progress Dots (4 langkah) */}
              <div className="flex items-stretch justify-stretch gap-2.5 flex-1 h-2.5">
                {Array.from({ length: stepsTotal }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-full ${idx <= step ? 'bg-[#3674B5]' : 'bg-[#E4E4E7]'}`}
                  />
                ))}
              </div>

              {/* Arrow Right */}
              <button
                onClick={() => setStep((s) => (canGoNext ? s + 1 : s))}
                disabled={!canGoNext}
                className="w-8 h-8 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRightRegular className="w-8 h-8 text-[#A1A1AA]" />
              </button>
            </div>
          </div>

          {/* Counter */}
          <div className="flex items-center justify-end gap-2.5 w-[100px]">
            <p className="text-2xl font-semibold text-[#3674B5]">
              {step + 1}/{stepsTotal}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto h-full">
        <div className="flex justify-center px-0 py-6 h-[80vh]">
          <div className="flex gap-6 items-start w-[70%]">
            <div className="flex-1 w-full">
              <Card className="border-2 border-[#E4E4E7] bg-white rounded-[18px] shadow-[0px_2px_0px_0px_rgba(228,228,231,1)]">
                <CardBody className="px-6 py-8 flex flex-col gap-4">
                  <h1 className="text-center text-2xl font-semibold text-[#3674B5]">
                    Yuk lengkapi beberapa hal dulu!
                  </h1>
                  {loading ? (
                    <div className="text-center text-gray-500">Memuat...</div>
                  ) : step === 0 ? (
                    <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
                      <label className="text-[#0B1215] font-medium">Asal Sekolahmu di Mana?</label>
                      <Input
                        radius="lg"
                        size="md"
                        classNames={{ inputWrapper: 'bg-[#F4F4F5]' }}
                        value={asalSekolah}
                        onValueChange={setAsalSekolah}
                      />
                      <Button
                        color="primary"
                        radius="lg"
                        size="md"
                        className="w-full"
                        isDisabled={!asalSekolah.trim() || saving}
                        onPress={handleNextFromSchool}
                      >
                        Lanjutkan
                      </Button>
                    </div>
                  ) : step === 1 ? (
                    <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
                      <label className="text-[#0B1215] font-medium">
                        Kamu Saat Ini di Jenjang Apa?
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[10, 11, 12].map((k) => (
                          <Button
                            key={k}
                            variant={jenjang === k ? 'solid' : 'flat'}
                            color="primary"
                            radius="lg"
                            onPress={() => setJenjang(k)}
                          >
                            {`Kelas ${k}`}
                          </Button>
                        ))}
                      </div>
                      <Button
                        color="primary"
                        radius="lg"
                        size="md"
                        className="w-full"
                        isDisabled={jenjang === null || saving}
                        onPress={handleNextFromJenjang}
                      >
                        Lanjutkan
                      </Button>
                    </div>
                  ) : step === 2 ? (
                    <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
                      <label className="text-[#0B1215] font-medium">Buat Username kamu</label>
                      <Input
                        radius="lg"
                        size="md"
                        classNames={{ inputWrapper: 'bg-[#F4F4F5]' }}
                        value={username}
                        onValueChange={(v) => {
                          setUsername(v);
                          setUsernameError(null);
                        }}
                      />
                      <span className="text-xs text-[#71717A]">
                        Gunakan 4–10 karakter tanpa spasi.
                      </span>
                      {usernameError ? (
                        <span className="text-xs text-[#F31260]">{usernameError}</span>
                      ) : null}
                      <Button
                        color="primary"
                        radius="lg"
                        size="md"
                        className="w-full"
                        isDisabled={
                          savingUsername ||
                          username.trim().length < 4 ||
                          username.trim().length > 10 ||
                          username.includes(' ')
                        }
                        onPress={handleNextFromUsername}
                      >
                        Lanjutkan
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 max-w-xl mx-auto w-full">
                      <label className="text-[#0B1215] font-medium">Pilih Avatar Kamu</label>
                      <div className="flex flex-wrap gap-2 gap-y-3 justify-between">
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
                      <Button
                        color="primary"
                        radius="lg"
                        size="md"
                        className="w-full"
                        isDisabled={!canFinish}
                        onPress={handleFinish}
                      >
                        Selesai
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
