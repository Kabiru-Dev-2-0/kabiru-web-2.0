"use client";

import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { ArrowLeft24Regular, ChevronLeftRegular, ChevronRightRegular } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function SDRegisterPage() {
  const [step, setStep] = useState<number>(0);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [savingEmail, setSavingEmail] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState<boolean>(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    const { data, error } = await supabase
      .from("data_penggunas_sd")
      .select(`id, email, username, password`)
      .eq("email", email.trim())
      .maybeSingle();

    if (error) {
      setEmailError("Terjadi kesalahan saat memeriksa email");
      return;
    }

    if (!data) {
      setEmailError("Email tidak ditemukan");
      return;
    }

    const alreadyRegistered = data.username?.trim() || data.password?.trim();
    if (alreadyRegistered) {
      setEmailError("Email ini sudah digunakan.");
      return;
    }

    setEmailError(null);
    setStep(1);
  }

  async function handleNextFromUsername() {
    const val = username.trim();

    if (val.length < 4 || val.length > 10 || val.includes(" ")) {
      setUsernameError("Gunakan 4–10 karakter");
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from("data_penggunas_sd")
      .select("id")
      .eq("username", val);

    if (data && data.length > 0) {
      setUsernameError("Username sudah digunakan");
      return;
    }

    setUsernameError(null);
    setStep(2);
  }

  async function handleFinish() {
    if (password.trim().length < 8) {
      setPasswordError("Kata sandi minimal 8 karakter.");
      return;
    }

    setPasswordError(null);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("data_penggunas_sd")
      .update({
        username,
        password,
        avatar: "/imageAssets/avatar/default.png",
        onboarding_completed: true,
        is_pengguna_baru: true,
      })
      .eq("email", email.trim())
      .select();

    if (error) return;

    localStorage.setItem("sd_user", JSON.stringify(data[0]));
    router.push("/game-selection");
  }

  const stepsTotal = 3;
  const canGoPrev = step > 0;
  const canGoNext =
    step < stepsTotal - 1 &&
    (step === 0
      ? !!email.trim()
      : step === 1
        ? username.trim().length >= 4 &&
          username.trim().length <= 10 &&
          !username.includes(" ")
        : password.trim().length >= 6);
  const canFinish = step === stepsTotal - 1;

  const primaryButtonStyle = {
    minHeight: "46px",
    backgroundColor: "#4281c7",
    color: "#fff",
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 4px 0 0 #205994",
  };

  return (
    <div className="min-h-screen bg-[#3674B5] flex flex-col">
      {/* Header */}
      <div className="w-full bg-white border-b border-[#E8E8E8] px-4 sm:px-8 lg:px-12 py-4">

        {/* MOBILE */}
        <div className="flex flex-col gap-4 sm:hidden">

          {/* Back */}
          <button
            onClick={() => router.push("/register")}
            className="
              flex
              items-center
              gap-2
              w-fit
              text-[#3674B5]
            "
          >
            <ArrowLeft24Regular className="w-6 h-6" />
            <span className="text-sm font-medium">
              Kembali ke Beranda
            </span>
          </button>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep((s) => (canGoPrev ? s - 1 : s))}
              disabled={!canGoPrev}
              className="w-5 h-5 flex items-center justify-center disabled:opacity-30"
            >
              <ChevronLeftRegular className="w-6 h-6 text-[#A1A1AA]" />
            </button>

            <div className="flex flex-1 gap-2 h-2.5">
              {Array.from({ length: stepsTotal }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-full transition-colors ${
                    idx <= step
                      ? "bg-[#3674B5]"
                      : "bg-[#E4E4E7]"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setStep((s) => (canGoNext ? s + 1 : s))}
              disabled={!canGoNext}
              className="w-5 h-5 flex items-center justify-center disabled:opacity-30"
            >
              <ChevronRightRegular className="w-6 h-6 text-[#A1A1AA]" />
            </button>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden sm:flex relative w-full items-center justify-center">

          <button
            onClick={() => router.push("/register")}
            className="
              absolute
              left-0
              flex
              items-center
              gap-2
              px-3
              py-2
              rounded-lg
              hover:bg-gray-100
              transition
            "
          >
            <ArrowLeft24Regular className="w-6 h-6 text-[#3674B5]" />

            <span className="font-medium text-[#3674B5]">
              Kembali ke Beranda
            </span>
          </button>

          <div className="flex items-center gap-8 w-full max-w-xl">
            <button
              onClick={() => setStep((s) => (canGoPrev ? s - 1 : s))}
              disabled={!canGoPrev}
              className="w-8 h-8 flex items-center justify-center disabled:opacity-30"
            >
              <ChevronLeftRegular className="w-8 h-8 text-[#A1A1AA]" />
            </button>

            <div className="flex flex-1 gap-2 h-2.5">
              {Array.from({ length: stepsTotal }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-full transition-colors ${
                    idx <= step
                      ? "bg-[#3674B5]"
                      : "bg-[#E4E4E7]"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setStep((s) => (canGoNext ? s + 1 : s))}
              disabled={!canGoNext}
              className="w-8 h-8 flex items-center justify-center disabled:opacity-30"
            >
              <ChevronRightRegular className="w-8 h-8 text-[#A1A1AA]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          <h1 className="text-center text-xl sm:text-2xl font-semibold text-white mb-6">
            Yuk lengkapi beberapa hal dulu!
          </h1>

          <Card className="border-2 border-[#E4E4E7] bg-white rounded-[18px] shadow-[0px_2px_0px_0px_rgba(228,228,231,1)] w-full">
            <CardBody className="px-4 py-5 sm:px-6 sm:py-6">
              {loading ? (
                <div className="text-center text-gray-500 py-8">Memuat...</div>
              ) : step === 0 ? (
                <div className="flex flex-col gap-4 w-full">
                  <label className="text-[#0B1215] font-medium text-sm sm:text-base">
                    Masukkan Email Yang Disediakan
                  </label>
                  <Input
                    radius="lg"
                    size="md"
                    classNames={{ inputWrapper: "bg-[#F4F4F5]" }}
                    value={email}
                    onValueChange={(v) => {
                      setEmail(v);
                      setEmailError(null);
                    }}
                    placeholder="email@kabiru.ai"
                    type="email"
                  />
                  {emailError && (
                    <span className="text-xs text-[#F31260]">{emailError}</span>
                  )}
                  <Button
                    className="w-full font-medium text-base sm:text-lg h-[46px] rounded-[12px]"
                    style={primaryButtonStyle}
                    isDisabled={!email.trim() || saving}
                    onPress={handleNextFromEmail}>
                    Lanjutkan
                  </Button>
                </div>
              ) : step === 1 ? (
                <div className="flex flex-col gap-4 w-full">
                  <label className="text-[#0B1215] font-medium text-sm sm:text-base">
                    Buat Username kamu
                  </label>
                  <Input
                    radius="lg"
                    size="md"
                    classNames={{ inputWrapper: "bg-[#F4F4F5]" }}
                    value={username}
                    onValueChange={(v) => {
                      setUsername(v);
                      setUsernameError(null);
                    }}
                    placeholder="contoh: budi123"
                  />
                  <span className="text-xs text-[#71717A]">
                    Gunakan 4–10 karakter.
                  </span>
                  {usernameError && (
                    <span className="text-xs text-[#F31260]">
                      {usernameError}
                    </span>
                  )}
                  <Button
                    className="w-full font-medium text-base sm:text-lg h-[46px] rounded-[12px]"
                    style={primaryButtonStyle}
                    isDisabled={
                      savingUsername ||
                      username.trim().length < 4 ||
                      username.trim().length > 10 ||
                      username.includes(" ")
                    }
                    onPress={handleNextFromUsername}>
                    Lanjutkan
                  </Button>
                </div>
              ) : step === 2 ? (
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex flex-col gap-1">
                      <label className="text-gray-900 font-medium text-sm sm:text-base">
                        Buat Kata Sandi Kamu
                      </label>
                      <span className="text-xs text-gray-700">
                          Gunakan 8 karakter.
                      </span>
                  </div>
                  <Input
                    radius="lg"
                    size="md"
                    type={showPassword ? "text" : "password"}
                    classNames={{
                      inputWrapper: "bg-[#F4F4F5]",
                    }}
                    value={password}
                    onValueChange={(v) => {
                      setPassword(v);
                      setPasswordError(null);
                    }}
                    placeholder="Minimal 8 karakter"
                  />
                  <Checkbox
                    size="sm"
                    isSelected={showPassword}
                    onValueChange={setShowPassword}
                    classNames={{
                      label: "text-[#4B5563] text-sm",
                    }}
                  >
                    Tampilkan kata sandi
                  </Checkbox>
                  {passwordError && (
                    <span className="text-xs text-[#F31260]">
                      {passwordError}
                    </span>
                  )}
                  <Button
                    className="w-full font-medium text-base sm:text-lg h-[46px] rounded-[12px]"
                    style={primaryButtonStyle}
                    isDisabled={!canFinish}
                    onPress={handleFinish}>
                    Selesai
                  </Button>
                </div>
              ) : null}
            </CardBody>
          </Card>

          {/* Step indicator text */}
          <p className="text-center text-white/70 text-xs sm:text-sm mt-4">
            Langkah {step + 1} dari {stepsTotal}
          </p>
        </div>
      </div>
    </div>
  );
}
