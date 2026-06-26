'use client';

import { Card, CardBody } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { ChevronLeftRegular, ChevronRightRegular, DismissRegular } from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SDRegisterPage() {
  const [step, setStep] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [savingEmail, setSavingEmail] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState<boolean>(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
    }, []);

  async function handleNextFromEmail() {
    const supabase = createClient();

    const { data, error } =
      await supabase
        .from("data_penggunas_sd")
        .select(`
          id,
          email,
          username,
          password
        `)
        .eq(
          "email",
          email.trim()
        )
        .maybeSingle();

    if (error) {
      setEmailError(
        "Terjadi kesalahan saat memeriksa email"
      );
      return;
    }

    if (!data) {
      setEmailError(
        "Email tidak ditemukan"
      );
      return;
    }

    const alreadyRegistered =
      data.username?.trim() ||
      data.password?.trim();

    if (alreadyRegistered) {
      setEmailError(
        "Email ini sudah digunakan."
      );
      return;
    }

    setEmailError(null);
    setStep(1);
  }

async function handleNextFromUsername() {
  const val =
    username.trim();

  if (
    val.length < 4 ||
    val.length > 10 ||
    val.includes(" ")
  ) {
    setUsernameError(
      "Gunakan 4–10 karakter tanpa spasi"
    );

    return;
  }

  const supabase =
    createClient();

  const { data } =
    await supabase
      .from("data_penggunas_sd")
      .select("id")
      .eq("username", val);

  if (
    data &&
    data.length > 0
  ) {
    setUsernameError(
      "Username sudah digunakan"
    );

    return;
  }

  setUsernameError(null);

  setStep(2);
}

async function handleFinish() {
  const supabase =
    createClient();

  const { data, error } =
    await supabase
      .from("data_penggunas_sd")
      .update({
        username,
        password,
        avatar:
          "/imageAssets/avatar/default.png",
        onboarding_completed:
          true,
        is_pengguna_baru:
          true,
      })
      .eq(
        "email",
        email.trim()
      )
      .select();

  if (error) return;

  localStorage.setItem(
    "sd_user",
    JSON.stringify(data[0])
  );
  router.push("/game-selection");
}

  const stepsTotal = 3;
  const canGoPrev = step > 0;
  const canGoNext =
    step < stepsTotal - 1 &&
    (
        step === 0
        ? !!email.trim()
            : step === 1
            ? username.trim().length >= 4 &&
                username.trim().length <= 10 &&
                !username.includes(" ")
                    : password.trim().length >= 6
    );
  const canFinish =
    step === stepsTotal - 1;

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

              {/* Progress Dots (3 langkah) */}
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
                      <label className="text-[#0B1215] font-medium">Masukkan Email Yang Disediakan</label>
                      <Input
                        radius="lg"
                        size="md"
                        classNames={{ inputWrapper: 'bg-[#F4F4F5]' }}
                        value={email}
                        onValueChange={setEmail}
                      />
                      {emailError ? (
                        <span className="text-xs text-[#F31260]">
                          {emailError}
                        </span>
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
                        isDisabled={!email.trim() || saving}
                        onPress={handleNextFromEmail}
                      >
                        Lanjutkan
                      </Button>
                    </div>
                  ) : step === 1 ? (
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
                  ) : step === 2 ? (
                    <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
                      <label className="text-[#0B1215] font-medium">Buat Kata Sandi Kamu</label>
                      <Input
                        radius="lg"
                        size="md"
                        classNames={{ inputWrapper: 'bg-[#F4F4F5]' }}
                        value={password}
                        onValueChange={(v) => {
                          setPassword(v);
                          setPasswordError(null);
                        }}
                      />
                      <span className="text-xs text-[#71717A]">
                        Gunakan 8 karakter tanpa spasi.
                      </span>
                      {passwordError ? (
                        <span className="text-xs text-[#F31260]">{passwordError}</span>
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
                        isDisabled={!canFinish}
                        onPress={handleFinish}
                      >
                        Selesai
                      </Button>
                    </div>
                  ): null}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}