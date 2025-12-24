'use client';

import { Link } from '@heroui/link';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import {
  BotRegular,
  BookRegular,
  TrophyRegular,
  PeopleRegular,
  ArrowRightRegular,
  DataPieRegular,
  LightbulbRegular,
  RocketRegular,
} from '@fluentui/react-icons';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FCFDFD] via-[#F0F4FF] to-[#F5F0FF]">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-[#E4E4E7] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <img src="/imageAssets/kabiru-logo.png" alt="KL" />
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-[#006FEE]">Kabiru</span>
              <span className="text-[#7828C8]"> Learn</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-base font-medium text-[#71717A] hover:text-[#006FEE]"
            >
              Masuk
            </Link>
            <Button
              as={Link}
              href="/register"
              color="primary"
              radius="full"
              size="md"
              className="font-semibold"
            >
              Daftar Gratis
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-6">
            <Chip
              color="secondary"
              variant="flat"
              className="w-fit"
              startContent={<RocketRegular className="w-4 h-4" />}
            >
              Platform Pembelajaran AI Interaktif
            </Chip>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Belajar{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006FEE] to-[#7828C8]">
                Artificial Intelligence
              </span>{' '}
              dengan Cara yang Menyenangkan
            </h1>

            <p className="text-xl text-[#71717A] leading-relaxed">
              Kuasai konsep AI, machine learning, dan teknologi masa depan melalui pembelajaran
              interaktif yang disesuaikan dengan kemampuan Anda.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                as={Link}
                href="/register"
                size="lg"
                radius="full"
                className="font-semibold bg-gradient-to-r from-[#006FEE] to-[#7828C8] text-white shadow-lg px-8"
                endContent={<ArrowRightRegular className="w-5 h-5" />}
              >
                Mulai Belajar Sekarang
              </Button>
              <Button
                as={Link}
                href="/login"
                size="lg"
                radius="full"
                variant="bordered"
                className="font-semibold border-2"
              >
                Lihat Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-[#006FEE]">10K+</span>
                <span className="text-sm text-[#71717A]">Pengguna Aktif</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-[#7828C8]">50+</span>
                <span className="text-sm text-[#71717A]">Modul Pembelajaran</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-[#17C964]">95%</span>
                <span className="text-sm text-[#71717A]">Tingkat Kepuasan</span>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            {/* <div className="w-full flex items-center justify-center backdrop-blur-sm">
              <img src="/imageAssets/motivational.png" className="w-120 h-120" alt="Hero" />
            </div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <Chip color="primary" variant="flat" className="mb-4">
            Fitur Unggulan
          </Chip>
          <h2 className="text-4xl font-bold mb-4">
            Mengapa Memilih <span className="text-[#7828C8]">Kabiru Learn</span>?
          </h2>
          <p className="text-lg text-[#71717A] max-w-2xl mx-auto">
            Platform pembelajaran yang dirancang khusus untuk membantu Anda menguasai AI dengan
            mudah dan efektif.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <Card
            className="border-2 border-[#E4E4E7] hover:border-[#006FEE] transition-all hover:shadow-lg"
            radius="lg"
          >
            <CardBody className="p-6 flex flex-col gap-4">
              <div className="w-14 h-14 bg-[#006FEE]/10 rounded-2xl flex items-center justify-center">
                <BookRegular className="w-7 h-7 text-[#006FEE]" />
              </div>
              <h3 className="text-xl font-bold">Materi Lengkap</h3>
              <p className="text-[#71717A]">
                Kurikulum terstruktur dari dasar hingga advanced dengan penjelasan yang mudah
                dipahami.
              </p>
            </CardBody>
          </Card>

          {/* Feature 2 */}
          <Card
            className="border-2 border-[#E4E4E7] hover:border-[#7828C8] transition-all hover:shadow-lg"
            radius="lg"
          >
            <CardBody className="p-6 flex flex-col gap-4">
              <div className="w-14 h-14 bg-[#7828C8]/10 rounded-2xl flex items-center justify-center">
                <BotRegular className="w-7 h-7 text-[#7828C8]" />
              </div>
              <h3 className="text-xl font-bold">AI Assistant</h3>
              <p className="text-[#71717A]">
                Belajar dengan bantuan AI yang memberikan feedback personal sesuai kemampuan Anda.
              </p>
            </CardBody>
          </Card>

          {/* Feature 3 */}
          <Card
            className="border-2 border-[#E4E4E7] hover:border-[#17C964] transition-all hover:shadow-lg"
            radius="lg"
          >
            <CardBody className="p-6 flex flex-col gap-4">
              <div className="w-14 h-14 bg-[#17C964]/10 rounded-2xl flex items-center justify-center">
                <DataPieRegular className="w-7 h-7 text-[#17C964]" />
              </div>
              <h3 className="text-xl font-bold">Progress Tracking</h3>
              <p className="text-[#71717A]">
                Monitor perkembangan belajar Anda dengan dashboard yang informatif dan detail.
              </p>
            </CardBody>
          </Card>

          {/* Feature 4 */}
          <Card
            className="border-2 border-[#E4E4E7] hover:border-[#F5A524] transition-all hover:shadow-lg"
            radius="lg"
          >
            <CardBody className="p-6 flex flex-col gap-4">
              <div className="w-14 h-14 bg-[#F5A524]/10 rounded-2xl flex items-center justify-center">
                <PeopleRegular className="w-7 h-7 text-[#F5A524]" />
              </div>
              <h3 className="text-xl font-bold">Komunitas Aktif</h3>
              <p className="text-[#71717A]">
                Bergabung dengan ribuan learner lainnya dan berkembang bersama.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-[#006FEE] to-[#7828C8] shadow-2xl" radius="lg">
          <CardBody className="p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-white">
              <h2 className="text-4xl font-bold mb-4">Siap Memulai Perjalanan AI Anda?</h2>
              <p className="text-xl opacity-90">
                Bergabunglah dengan ribuan learner yang sudah memulai perjalanan mereka di dunia AI.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                as={Link}
                href="/register"
                size="lg"
                radius="full"
                className="font-semibold bg-white text-[#006FEE] shadow-lg px-8"
                endContent={<ArrowRightRegular className="w-5 h-5" />}
              >
                Daftar Gratis Sekarang
              </Button>
              <p className="text-white/80 text-sm text-center">
                Gratis selamanya • Tidak perlu kartu kredit
              </p>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E4E4E7]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#006FEE] to-[#7828C8] rounded-lg flex items-center justify-center">
                <BotRegular className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">
                <span className="text-[#006FEE]">Kabiru</span>
                <span className="text-[#7828C8]"> Learn</span>
              </span>
            </div>
            <p className="text-[#71717A] text-sm">© 2025 Kabiru Learn. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="text-[#71717A] hover:text-[#006FEE] text-sm">
                Tentang Kami
              </Link>
              <Link href="#" className="text-[#71717A] hover:text-[#006FEE] text-sm">
                Kontak
              </Link>
              <Link href="#" className="text-[#71717A] hover:text-[#006FEE] text-sm">
                Privasi
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
