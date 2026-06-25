'use client';

import { Card, CardBody } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useSDAuth } from '@/hooks/use-sd-auth';

export default function SDLoginPage() {
  useSDAuth();
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [login, setLogin] =
  useState("");

const [error, setError] =
  useState("");

const [loading, setLoading] =
  useState(true);

const [saving, setSaving] =
  useState(false);

  useEffect(() => {
    const user =
        localStorage.getItem(
        "sd_user"
        );

    if (user) {
        router.replace(
        "/map"
        );
        return;
    }

    setLoading(false);
    }, [router]);

  async function handleLogin() {
    setSaving(true);
    setError("");

    const supabase =
        createClient();

    const { data, error } =
        await supabase
        .from("data_penggunas_sd")
        .select("*")
        .or(
            `email.eq.${login.trim()},username.eq.${login.trim()}`
        )
        .eq(
            "password",
            password
        )
        .single();

    setSaving(false);

    if (error || !data) {
        setError(
        "Username/email atau password salah"
        );

        return;
    }

    localStorage.setItem(
        "sd_user",
        JSON.stringify(data)
    );

    router.push("/game-selection");
    }

  return (
    <div className="min-h-screen bg-[#FCFDFD] flex flex-col">
      {/* Header seperti halaman quiz */}
      <div className="w-full bg-white border-b border-[#E8E8E8] px-12 py-4">
        <div className="w-full flex justify-center">
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center overflow-y-auto h-full bg-[#3674B5]">
        <div className="flex justify-center items-center px-0 py-6 h-[80vh] w-full">
          <div className="flex justify-center items-center gap-6 w-[70%]">
            <div className="w-fit">
              <h1 className="text-center text-2xl font-semibold text-white mb-8">
                Halo, Selamat Datang Kembali!
              </h1>
              <Card className="border-2 border-[#E4E4E7] bg-white rounded-[18px] shadow-[0px_2px_0px_0px_rgba(228,228,231,1)]">
                <CardBody className="px-6 py-4 flex flex-col gap-4">
                  {loading ? (
                    <div className="text-center text-gray-500">
                        Memuat...
                    </div>
                    ) : (
                    <div
                        className="
                        flex
                        flex-col
                        gap-4
                        max-w-md
                        mx-auto
                        w-full
                        "
                    >
                        <label
                        className="
                            text-[#0B1215]
                            font-medium
                        "
                        >
                        Username atau Email
                        </label>

                        <Input
                        radius="lg"
                        size="md"
                        classNames={{
                            inputWrapper:
                            "bg-[#F4F4F5]",
                        }}
                        value={login}
                        onValueChange={setLogin}
                        />

                        <label
                        className="
                            text-[#0B1215]
                            font-medium
                        "
                        >
                        Kata Sandi
                        </label>

                        <Input
                        type="password"
                        radius="lg"
                        size="md"
                        classNames={{
                            inputWrapper:
                            "bg-[#F4F4F5]",
                        }}
                        value={password}
                        onValueChange={setPassword}
                        />

                        {error ? (
                        <span
                            className="
                            text-xs
                            text-[#F31260]
                            "
                        >
                            {error}
                        </span>
                        ) : null}

                        <Button
                        className="
                            w-full
                            bg-[#4281c7]
                            text-white
                            font-medium
                            text-[18px]
                            leading-[46px]
                            h-[46px]
                            rounded-[12px]
                            flex
                            items-center
                            justify-center
                            border-none
                        "
                        style={{
                            minHeight: "46px",
                            backgroundColor:
                            "#4281c7",
                            color: "#fff",
                            borderRadius: "12px",
                            border: "none",
                            boxShadow:
                            "0 4px 0 0 #205994",
                        }}
                        isDisabled={
                            !login.trim() ||
                            !password.trim() ||
                            saving
                        }
                        onPress={handleLogin}
                        >
                        Masuk
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