'use client';
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

  const handleGithubLogin = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo },
      });
    } catch {
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
    <div className="min-h-screen bg-[#FCFDFD] flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center overflow-y-auto h-full bg-[#3674B5]">
        <div className="flex justify-center items-center px-0 py-6 h-[80vh] w-full">
          <div className="flex justify-center items-center gap-6 w-[100%]">
            <div className="w-[60%]">
              <Card className="border-2 border-[#E4E4E7] bg-white rounded-[18px] shadow-[0px_2px_0px_0px_rgba(228,228,231,1)]">
                <CardBody className="p-8 flex flex-col gap-4">
                  <main className="flex flex-row items-center justify-center gap-4 flex-wrap w-full min-h-[60vh]">
                    <div>
                      <img
                        src="/imageAssets/strategy.png"
                        alt="Login Illustration"
                        className="sm:w-100 sm:h-100 h-40 w-40 object-contain"
                      />
                    </div>
                    <section className="flex flex-col gap-10 items-center justify-center text-center w-[50%]">
                      <div className="flex flex-col gap-2 items-center justify-center">
                        <h2 className="text-3xl font-semibold text-[#3674B5]">
                          Daftar & Mulai Petualanganmu!
                        </h2>
                        <p className="text-base text-[#71717A]">
                          Belajar Koding dan Kecerdasan Artifisial dengan seru tanpa ribet. Yuk buat
                          akunmu dan mulai eksplor!
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="bordered"
                        radius="lg"
                        size="lg"
                        className="font-semibold text-base px-10 text-[#838383] border-1 border-[#3674B5] shadow-xs shadow-[#3674B5]"
                        isDisabled={isLoading}
                        onPress={handleGoogleLogin}
                      >
                        <img
                          src="/imageAssets/google.svg"
                          alt="Google Icon"
                          className="w-6 h-6 object-contain"
                        />
                        Daftar dengan Google
                      </Button>
                      {/* GitHub OAuth - hanya tampil saat development lokal */}
                      {process.env.NODE_ENV === 'development' && <Button
                        type="button"
                        variant="bordered"
                        radius="lg"
                        size="lg"
                        className="font-semibold text-base px-10 text-[#838383] border-1 border-[#3674B5] shadow-xs shadow-[#3674B5]"
                        isDisabled={isLoading}
                        onPress={handleGithubLogin}
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                        </svg>
                        Daftar dengan GitHub
                      </Button>}
                      <div className="text-center">
                        <span className="text-base text-[#71717A]">
                          Sudah punya akun?{' '}
                          <Link
                            href="/login"
                            className="text-base text-[#000000] font-semibold hover:underline"
                          >
                            Masuk
                          </Link>
                        </span>
                      </div>
                    </section>
                  </main>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
    // <main className="flex flex-col items-center justify-center min-h-screen bg-[#FCFDFD] relative">
    //   {/* Loading Overlay */}
    //   {isLoading && (
    //     <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
    //       <Card className="p-8 bg-white shadow-2xl" radius="lg">
    //         <CardBody className="flex flex-col items-center gap-4">
    //           <Spinner size="lg" color="primary" />
    //           <div className="flex flex-col items-center gap-2">
    //             <p className="text-lg font-semibold text-black">Memproses...</p>
    //             <p className="text-sm text-[#71717A]">Mohon tunggu sebentar</p>
    //           </div>
    //         </CardBody>
    //       </Card>
    //     </div>
    //   )}

    //   <div className="w-full max-w-md px-4">
    //     {/* Logo/Brand Section */}
    //     <div className="flex flex-col items-center gap-4 mb-8">
    //       <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
    //         <PersonRegular className="w-10 h-10 text-[#006FEE]" />
    //       </div>
    //       <div className="text-center">
    //         <h1 className="text-3xl font-bold text-black">
    //           Selamat Datang di <span className="text-[#7828C8]">AI ZONE</span>
    //         </h1>
    //         <p className="text-base text-[#71717A] mt-2">
    //           Masuk untuk melanjutkan pembelajaran Anda
    //         </p>
    //       </div>
    //     </div>

    //     {/* Login Card */}
    //     <Card className="border-2 border-[#E4E4E7] shadow-lg" radius="lg">
    //       <CardHeader className="flex flex-col gap-2 px-6 pt-6 pb-4">
    //         <h2 className="text-2xl font-semibold text-black">Masuk</h2>
    //         <p className="text-sm text-[#71717A]">
    //           Silakan masukkan kredensial Anda untuk melanjutkan
    //         </p>
    //       </CardHeader>

    //       <Divider className="bg-[rgba(17,17,17,0.15)]" />

    //       <CardBody className="px-6 py-6">
    //         <form action={handleSubmit} className="flex flex-col gap-5">
    //           {/* Email Input */}
    //           <Input
    //             id="email"
    //             name="email"
    //             type="email"
    //             label="Email"
    //             placeholder="Masukkan email Anda"
    //             labelPlacement="outside"
    //             isRequired
    //             isDisabled={isLoading}
    //             startContent={<MailRegular className="w-5 h-5 text-[#71717A]" />}
    //             classNames={{
    //               label: 'text-base font-medium text-black',
    //               input: 'text-base',
    //               inputWrapper:
    //                 'border-2 border-[#E4E4E7] hover:border-[#006FEE] focus-within:border-[#006FEE]',
    //             }}
    //             radius="lg"
    //             size="lg"
    //           />

    //           {/* Password Input */}
    //           <Input
    //             id="password"
    //             name="password"
    //             type="password"
    //             label="Password"
    //             placeholder="Masukkan password Anda"
    //             labelPlacement="outside"
    //             isRequired
    //             isDisabled={isLoading}
    //             startContent={<LockClosedRegular className="w-5 h-5 text-[#71717A]" />}
    //             classNames={{
    //               label: 'text-base font-medium text-black',
    //               input: 'text-base',
    //               inputWrapper:
    //                 'border-2 border-[#E4E4E7] hover:border-[#006FEE] focus-within:border-[#006FEE]',
    //             }}
    //             radius="lg"
    //             size="lg"
    //           />

    //           {/* Forgot Password Link */}
    //           <div className="flex justify-end">
    //             <Link href="#" className="text-sm text-[#006FEE] hover:underline" size="sm">
    //               Lupa password?
    //             </Link>
    //           </div>

    //           {/* Login Button */}
    //           <Button
    //             type="submit"
    //             color="primary"
    //             radius="lg"
    //             size="lg"
    //             className="font-semibold text-base shadow-lg"
    //             isLoading={isLoading}
    //             isDisabled={isLoading}
    //             spinner={<Spinner size="sm" color="current" />}
    //             endContent={!isLoading && <ArrowCircleRightRegular className="w-5 h-5" />}
    //           >
    //             {isLoading ? 'Memproses...' : 'Masuk'}
    //           </Button>

    //           {/* Divider with text */}
    //           <div className="flex items-center gap-4 my-2">
    //             <Divider className="flex-1 bg-[rgba(17,17,17,0.15)]" />
    //             <span className="text-sm text-[#71717A]">atau</span>
    //             <Divider className="flex-1 bg-[rgba(17,17,17,0.15)]" />
    //           </div>

    //           {/* Google Sign-In */}
    //           <Button
    //             type="button"
    //             variant="bordered"
    //             radius="lg"
    //             size="lg"
    //             className="font-semibold text-base"
    //             isDisabled={isLoading}
    //             onPress={handleGoogleLogin}
    //           >
    //             Masuk dengan Google
    //           </Button>

    //           {/* Register Link */}
    //           <div className="text-center">
    //             <span className="text-base text-[#71717A]">
    //               Belum punya akun?{' '}
    //               <Link
    //                 href="/register"
    //                 className="text-base text-[#7828C8] font-semibold hover:underline"
    //               >
    //                 Daftar sekarang
    //               </Link>
    //             </span>
    //           </div>
    //         </form>
    //       </CardBody>
    //     </Card>

    //     {/* Footer Text */}
    //     <div className="text-center mt-6">
    //       <p className="text-sm text-[#71717A]">
    //         Dengan masuk, Anda menyetujui{' '}
    //         <Link href="#" className="text-sm text-[#006FEE] hover:underline">
    //           Syarat & Ketentuan
    //         </Link>{' '}
    //         dan{' '}
    //         <Link href="#" className="text-sm text-[#006FEE] hover:underline">
    //           Kebijakan Privasi
    //         </Link>
    //       </p>
    //     </div>
    //   </div>
    // </main>
  );
}
