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
        <div className="w-full flex justify-center">
          {/* Progress Section */}
          <div className="flex flex-col items-center justify-center gap-2.5 max-w-xl w-full">
            <div className="flex items-center gap-8 w-full justify-center">
              {/* Arrow Left */}
              <button
                onClick={() => setStep((s) => (canGoPrev ? s - 1 : s))}
                disabled={!canGoPrev}
                className="w-8 h-8 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeftRegular className="w-8 h-8 text-[#A1A1AA]" />
              </button>

              {/* Progress Dots (4 langkah) */}
              <div className="flex items-stretch justify-stretch gap-2 flex-1 h-2.5 max-w-[500px] w-full">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center overflow-y-auto h-full bg-[#3674B5]">
        <div className="flex justify-center items-center px-0 py-6 h-[80vh] w-full">
          <div className="flex justify-center items-center gap-6 w-[70%]">
            <div className="w-fit">
              <h1 className="text-center text-2xl font-semibold text-white mb-8">
                Yuk lengkapi beberapa hal dulu!
              </h1>
              <Card className="border-2 border-[#E4E4E7] bg-white rounded-[18px] shadow-[0px_2px_0px_0px_rgba(228,228,231,1)]">
                <CardBody className="px-6 py-4 flex flex-col gap-4">
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
                        className="w-full bg-[#4281c7] text-white font-medium text-[18px] leading-[46px] h-[46px] rounded-[12px] flex items-center justify-center border-none"
                        style={{
                          minHeight: '46px',
                          backgroundColor: '#4281c7',
                          color: '#fff',
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 0 0 #205994',
                        }}
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
                            onPress={() => setJenjang(k)}
                            className={`w-full text-center text-[18px] font-normal shadow-none border-2 px-6 py-6 ${
                              jenjang === k
                                ? 'bg-white border-[#3674B5] text-[#44444F] outline-none ring-0'
                                : 'bg-white border-[#3674B5] text-[#44444F] opacity-50'
                            }`}
                            style={{
                              boxShadow: jenjang === k ? '0 4px 0 0 #3674B5' : '0 4px 0 0 #C2DCF3',
                              borderRadius: '18px',
                            }}
                          >
                            {`Kelas ${k}`}
                          </Button>
                        ))}
                        <Button
                          onPress={() => setJenjang(0)}
                          className={`w-full text-center text-[18px] font-normal shadow-none border-2 px-6 py-6 ${
                            jenjang === 0
                              ? 'bg-white border-[#3674B5] text-[#44444F] outline-none ring-0'
                              : 'bg-white border-[#3674B5] text-[#44444F] opacity-50'
                          }`}
                          style={{
                            boxShadow: jenjang === 0 ? '0 4px 0 0 #3674B5' : '0 4px 0 0 #C2DCF3',
                            borderRadius: '18px',
                          }}
                        >
                          Lainnya
                        </Button>
                      </div>
                      <Button
                        className="w-full bg-[#4281c7] text-white font-medium text-[18px] leading-[46px] h-[46px] rounded-[12px] flex items-center justify-center border-none"
                        style={{
                          minHeight: '46px',
                          backgroundColor: '#4281c7',
                          color: '#fff',
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 0 0 #205994',
                        }}
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
                        className="w-full bg-[#4281c7] text-white font-medium text-[18px] leading-[46px] h-[46px] rounded-[12px] flex items-center justify-center border-none"
                        style={{
                          minHeight: '46px',
                          backgroundColor: '#4281c7',
                          color: '#fff',
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 0 0 #205994',
                        }}
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
                    <div className="flex flex-col gap-4 max-w-[480px] mx-auto w-full items-center justify-center">
                      <label className="text-[#0B1215] font-medium">Pilih Avatar Kamu</label>
                      <div className="flex flex-wrap gap-2 gap-y-2 justify-center">
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
                            className={`rounded-xl border-4 p-0 transition shadow-sm overflow-hidden ${
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
                        className="w-full bg-[#4281c7] text-white font-medium text-[18px] leading-[46px] h-[46px] rounded-[12px] flex items-center justify-center border-none"
                        style={{
                          minHeight: '46px',
                          backgroundColor: '#4281c7',
                          color: '#fff',
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 0 0 #205994',
                        }}
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
