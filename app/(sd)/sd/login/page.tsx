'use client';

import { Card, CardBody } from '@heroui/card';
import { Checkbox } from "@heroui/checkbox";
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useSDAuth } from '@/hooks/use-sd-auth';
import { ArrowLeft24Regular } from '@fluentui/react-icons';

export default function SDLoginPage() {
  useSDAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("sd_user");
    if (user) {
      router.replace("/map");
      return;
    }
    setLoading(false);
  }, [router]);

  async function handleLogin() {
    setSaving(true);
    setError("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("data_penggunas_sd")
      .select("*")
      .or(`email.eq.${login.trim()},username.eq.${login.trim()}`)
      .eq("password", password)
      .single();

    setSaving(false);

    if (error || !data) {
      setError("Username/email atau password salah");
      return;
    }

    localStorage.setItem("sd_user", JSON.stringify(data));
    router.push("/game-selection");
  }

  return (
    <div className="min-h-screen bg-[#3674B5] flex flex-col">
      {/* Header */}
      <div className="w-full h-[65px] bg-white border-b border-[#E8E8E8] px-4 sm:px-8 md:px-12">
        <div className="relative w-full h-full flex justify-center items-center">
        <button
                    onClick={() => router.push("/login")}
                    className="
                      absolute
                      left-0
                      top-1/2
                      -translate-y-1/2
        
                      flex
                      items-center
                      gap-2
        
                      px-3
                      py-2
        
                      rounded-base
                      md:rounded-lg
                      hover:bg-gray-100
                      transition
                    "
                  >
                    <ArrowLeft24Regular className="w-6 h-6 text-[#3674B5]" />
        
                    <span
                      className="
        
                        text-sm
                        md:text-base
        
                        font-medium
                        text-[#3674B5]
                      "
                    >
                      Kembali ke Beranda
                    </span>
                  </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center px-4 py-8 sm:py-10 md:py-12">
        <div className="w-full max-w-sm sm:max-w-md">
          <h1 className="text-center text-xl sm:text-2xl font-semibold text-white mb-6 sm:mb-8">
            Halo, Selamat Datang Kembali!
          </h1>

          <Card className="border-2 border-[#E4E4E7] bg-white rounded-[18px] shadow-[0px_2px_0px_0px_rgba(228,228,231,1)]">
            <CardBody className="px-4 sm:px-6 py-5 sm:py-6">
              {loading ? (
                <div className="text-center text-gray-500 py-4">
                  Memuat...
                </div>
              ) : (
                <div className="flex flex-col gap-4 w-full">
                  <label className="text-[#0B1215] font-medium text-sm sm:text-base">
                    Username atau Email
                  </label>

                  <Input
                    radius="lg"
                    size="md"
                    placeholder="Masukkan username atau email"
                    classNames={{
                      inputWrapper: "bg-[#F4F4F5]",
                    }}
                    value={login}
                    onValueChange={setLogin}
                  />

                  <label className="text-[#0B1215] font-medium text-sm sm:text-base">
                    Kata Sandi
                  </label>

                  <Input
                    type={showPassword ? "text" : "password"}
                    radius="lg"
                    size="md"
                    placeholder="Masukkan kata sandi"
                    classNames={{
                      inputWrapper: "bg-[#F4F4F5]",
                    }}
                    value={password}
                    onValueChange={setPassword}
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

                  {error && (
                    <span className="text-xs text-[#F31260]">
                      {error}
                    </span>
                  )}

                  <Button
                    className="w-full bg-[#4281c7] text-white font-medium text-base sm:text-lg h-[46px] rounded-[12px] flex items-center justify-center border-none mt-1"
                    style={{
                      minHeight: "46px",
                      backgroundColor: "#4281c7",
                      color: "#fff",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 0 0 #205994",
                    }}
                    isDisabled={!login.trim() || !password.trim() || saving}
                    onPress={handleLogin}
                  >
                    {saving ? "Memuat..." : "Masuk"}
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}