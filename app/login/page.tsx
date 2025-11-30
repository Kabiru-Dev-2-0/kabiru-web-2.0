'use client';

import { login } from './actions';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import { Divider } from '@heroui/divider';
import { Spinner } from '@heroui/spinner';
import {
  LockClosedRegular,
  MailRegular,
  PersonRegular,
  ArrowCircleRightRegular,
} from '@fluentui/react-icons';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await login(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          scopes: 'openid email profile',
        },
      });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#FCFDFD] relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-8 bg-white shadow-2xl" radius="lg">
            <CardBody className="flex flex-col items-center gap-4">
              <Spinner size="lg" color="primary" />
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg font-semibold text-black">Memproses...</p>
                <p className="text-sm text-[#71717A]">Mohon tunggu sebentar</p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      <div className="w-full max-w-md px-4">
        {/* Logo/Brand Section */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
            <PersonRegular className="w-10 h-10 text-[#006FEE]" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black">
              Selamat Datang di <span className="text-[#7828C8]">AI ZONE</span>
            </h1>
            <p className="text-base text-[#71717A] mt-2">
              Masuk untuk melanjutkan pembelajaran Anda
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-[#E4E4E7] shadow-lg" radius="lg">
          <CardHeader className="flex flex-col gap-2 px-6 pt-6 pb-4">
            <h2 className="text-2xl font-semibold text-black">Masuk</h2>
            <p className="text-sm text-[#71717A]">
              Silakan masukkan kredensial Anda untuk melanjutkan
            </p>
          </CardHeader>

          <Divider className="bg-[rgba(17,17,17,0.15)]" />

          <CardBody className="px-6 py-6">
            <form action={handleSubmit} className="flex flex-col gap-5">
              {/* Email Input */}
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="Masukkan email Anda"
                labelPlacement="outside"
                isRequired
                isDisabled={isLoading}
                startContent={<MailRegular className="w-5 h-5 text-[#71717A]" />}
                classNames={{
                  label: 'text-base font-medium text-black',
                  input: 'text-base',
                  inputWrapper:
                    'border-2 border-[#E4E4E7] hover:border-[#006FEE] focus-within:border-[#006FEE]',
                }}
                radius="lg"
                size="lg"
              />

              {/* Password Input */}
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="Masukkan password Anda"
                labelPlacement="outside"
                isRequired
                isDisabled={isLoading}
                startContent={<LockClosedRegular className="w-5 h-5 text-[#71717A]" />}
                classNames={{
                  label: 'text-base font-medium text-black',
                  input: 'text-base',
                  inputWrapper:
                    'border-2 border-[#E4E4E7] hover:border-[#006FEE] focus-within:border-[#006FEE]',
                }}
                radius="lg"
                size="lg"
              />

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link href="#" className="text-sm text-[#006FEE] hover:underline" size="sm">
                  Lupa password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                color="primary"
                radius="lg"
                size="lg"
                className="font-semibold text-base shadow-lg"
                isLoading={isLoading}
                isDisabled={isLoading}
                spinner={<Spinner size="sm" color="current" />}
                endContent={!isLoading && <ArrowCircleRightRegular className="w-5 h-5" />}
              >
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>

              {/* Divider with text */}
              <div className="flex items-center gap-4 my-2">
                <Divider className="flex-1 bg-[rgba(17,17,17,0.15)]" />
                <span className="text-sm text-[#71717A]">atau</span>
                <Divider className="flex-1 bg-[rgba(17,17,17,0.15)]" />
              </div>

              {/* Google Sign-In */}
              <Button
                type="button"
                variant="bordered"
                radius="lg"
                size="lg"
                className="font-semibold text-base"
                isDisabled={isLoading}
                onPress={handleGoogleLogin}
              >
                Masuk dengan Google
              </Button>

              {/* Register Link */}
              <div className="text-center">
                <span className="text-base text-[#71717A]">
                  Belum punya akun?{' '}
                  <Link
                    href="/register"
                    className="text-base text-[#7828C8] font-semibold hover:underline"
                  >
                    Daftar sekarang
                  </Link>
                </span>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Footer Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-[#71717A]">
            Dengan masuk, Anda menyetujui{' '}
            <Link href="#" className="text-sm text-[#006FEE] hover:underline">
              Syarat & Ketentuan
            </Link>{' '}
            dan{' '}
            <Link href="#" className="text-sm text-[#006FEE] hover:underline">
              Kebijakan Privasi
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
