'use client';

import { signup } from '../login/actions';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { LockClosedRegular, MailRegular, PersonAddRegular, CheckmarkCircleRegular } from '@fluentui/react-icons';
import { useState } from 'react';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await signup(formData);
    } finally {
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
              <Spinner size="lg" color="secondary" className="text-[#7828C8]" />
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg font-semibold text-black">Membuat Akun...</p>
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
            <PersonAddRegular className="w-10 h-10 text-[#7828C8]" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black">
              Bergabung dengan <span className="text-[#7828C8]">AI ZONE</span>
            </h1>
            <p className="text-base text-[#71717A] mt-2">
              Mulai perjalanan belajar AI Anda hari ini
            </p>
          </div>
        </div>

        {/* Register Card */}
        <Card className="border-2 border-[#E4E4E7] shadow-lg" radius="lg">
          <CardHeader className="flex flex-col gap-2 px-6 pt-6 pb-4">
            <h2 className="text-2xl font-semibold text-black">Daftar Akun Baru</h2>
            <p className="text-sm text-[#71717A]">
              Buat akun untuk mengakses semua fitur pembelajaran
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
                startContent={
                  <MailRegular className="w-5 h-5 text-[#71717A]" />
                }
                classNames={{
                  label: "text-base font-medium text-black",
                  input: "text-base",
                  inputWrapper: "border-2 border-[#E4E4E7] hover:border-[#7828C8] focus-within:border-[#7828C8]",
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
                placeholder="Buat password (min. 6 karakter)"
                labelPlacement="outside"
                isRequired
                isDisabled={isLoading}
                startContent={
                  <LockClosedRegular className="w-5 h-5 text-[#71717A]" />
                }
                classNames={{
                  label: "text-base font-medium text-black",
                  input: "text-base",
                  inputWrapper: "border-2 border-[#E4E4E7] hover:border-[#7828C8] focus-within:border-[#7828C8]",
                }}
                radius="lg"
                size="lg"
              />

              {/* Register Button */}
              <Button
                type="submit"
                className="font-semibold text-base shadow-lg bg-[#7828C8] text-white"
                radius="lg"
                size="lg"
                isLoading={isLoading}
                isDisabled={isLoading}
                spinner={
                  <Spinner size="sm" color="current" />
                }
                endContent={
                  !isLoading && <CheckmarkCircleRegular className="w-5 h-5" />
                }
              >
                {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
              </Button>

              {/* Divider with text */}
              <div className="flex items-center gap-4 my-2">
                <Divider className="flex-1 bg-[rgba(17,17,17,0.15)]" />
                <span className="text-sm text-[#71717A]">atau</span>
                <Divider className="flex-1 bg-[rgba(17,17,17,0.15)]" />
              </div>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-base text-[#71717A]">
                  Sudah punya akun?{" "}
                  <Link
                    href="/login"
                    className="text-base text-[#006FEE] font-semibold hover:underline"
                  >
                    Masuk di sini
                  </Link>
                </span>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Footer Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-[#71717A]">
            Dengan mendaftar, Anda menyetujui{" "}
            <Link href="#" className="text-sm text-[#006FEE] hover:underline">
              Syarat & Ketentuan
            </Link>{" "}
            dan{" "}
            <Link href="#" className="text-sm text-[#006FEE] hover:underline">
              Kebijakan Privasi
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
