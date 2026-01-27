"use client";

import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Bot24Color,
  BookRegular,
  TrophyRegular,
  PeopleRegular,
  ArrowRightRegular,
  DataPieRegular,
  LightbulbRegular,
  Lightbulb24Color,
  RocketRegular,
  Receipt28Regular,
  Drafts24Color,
  BotSparkle24Color,
  Receipt24Color,
} from "@fluentui/react-icons";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#ffffff]">
      {/* STICKY HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white">
        <div className="w-full flex justify-center">
          <nav className="w-full max-w-[1440px] px-12 py-4 inline-flex justify-start items-center gap-8">
            {/* Logo */}
            <div className="flex items-center">
              <img
                className="w-36 h-10 object-contain"
                src="imageAssets/logo-header.png"
                alt="AIZONE logo dummy"
              />
            </div>

            {/* Center navigation */}
            <div className="flex-1 hidden md:flex justify-center items-center gap-6">
              <button className="text-zinc-500 text-lg font-medium leading-7 hover:text-zinc-800">
                Beranda
              </button>
              <button className="text-zinc-500 text-lg font-medium leading-7 hover:text-zinc-800">
                Fitur
              </button>
              <button className="text-zinc-500 text-lg font-medium leading-7 hover:text-zinc-800">
                Tentang Kami
              </button>
            </div>

            {/* Right actions */}
            <div className="flex justify-start items-center gap-3.5">
              <Link
                href="/login"
                className="h-12 px-5 bg-zinc-100 rounded-xl flex items-center justify-center gap-2 text-zinc-500 text-lg font-medium leading-7 hover:bg-zinc-200"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="h-12 px-5 rounded-xl flex items-center justify-center gap-2 text-zinc-50 text-lg font-medium leading-7 bg-[#3674B5] hover:bg-[#285486]"
              >
                Daftar Gratis
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-21 flex justify-center">
        <div className="relative w-full h-[820px] md:h-[1262px]">
          {/* Gradient + image background */}
          <div className="relative top-0 left-0 w-full h-[600px] md:h-[1005px] rounded-[40px] md:rounded-[80px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#205994] via-[#3B307C] to-[#490653]" />
            <img
              className="absolute inset-0 m-auto w-full h-full object-cover"
              style={{
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                maxWidth: "100%",
                maxHeight: "100%",
              }}
              src="imageAssets/hero-background-pallete.png"
              alt="Hero background palette"
            />
          </div>

          {/* Main hero content + preview card */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[90px] md:top-[115px] w-full max-w-[1080px] flex flex-col items-center gap-10 md:gap-20">
            {/* Copy + CTA */}
            <div className="w-full flex flex-col items-center gap-7">
              <div className="w-full flex flex-col items-center gap-6 text-center">
                <h1 className="max-w-4xl text-3xl md:text-5xl lg:text-6xl font-bold leading-snug md:leading-[72px] lg:leading-[80px] text-white">
                  Belajar{" "}
                  <span className="text-yellow-400">
                    Koding &amp; Kecerdasan Artifisial
                  </span>{" "}
                  dengan Cara Baru yang Lebih Seru
                </h1>
                <p className="max-w-3xl text-white text-sm md:text-lg leading-relaxed md:leading-8">
                  Kabiru menyajikan pembelajaran koding dan kecerdasan
                  artifisial secara bertahap dan terstruktur, dilengkapi latihan
                  interaktif, gamifikasi, dan asisten AI yang mendampingi proses
                  belajar di setiap tahap.
                </p>
              </div>

              <Button
                as={Link}
                href="/register"
                radius="lg"
                size="lg"
                className="px-4 py-4 md:px-8 bg-[#F5A524] text-white text-base md:text-xl font-semibold rounded-2xl shadow-[0px_3px_0px_0px_rgba(196,132,29,1.00)] outline outline-1 outline-offset-[-1px] outline-[#C4841D] hover:bg-[#CA8A04]"
              >
                Coba Sekarang
              </Button>
            </div>

            {/* Preview card */}
            <div className="w-full relative bg-zinc-100 rounded-[24px] md:rounded-[30px] overflow-hidden shadow-[0_6px_36px_0_rgba(20,20,20,0.15)] flex items-center justify-center">
              <img
                className="w-auto h-[380px] md:h-[670px] object-contain"
                src="imageAssets/landingpage/preview-hero.png"
                alt="Preview hero dummy"
                style={{ maxWidth: "100%" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: MENGAPA KABIRU */}
      <section className="flex justify-center bg-white pt-24">
        <div className="w-full max-w-[1440px] px-6 md:px-16 lg:px-28 py-16 lg:py-20 flex flex-col items-start gap-14 lg:gap-20">
          {/* Heading + description */}
          <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-10">
            <h2 className="lg:w-[500px] text-2xl md:text-4xl lg:text-5xl font-bold leading-snug lg:leading-[75.51px] text-black">
              Mengapa <span className="text-[#205994]">Kabiru</span> Cocok untuk
              Belajar Koding dan KA
            </h2>
            <p className="lg:w-[473px] text-base md:text-lg text-black leading-relaxed md:leading-8">
              Kabiru dirancang untuk kamu yang ingin belajar koding dan AI
              secara bertahap, ringan, dan konsisten tanpa harus membaca materi
              panjang.
            </p>
          </div>

          {/* Cards grid */}
          <div className="flex flex-col items-start gap-10">
            {/* Row 1 */}
            <div className="w-full max-w-[1216px] flex flex-col md:flex-row justify-start items-stretch gap-6 lg:gap-10">
              {/* Card 1 */}
              <div className="flex-1 p-8 lg:p-10 bg-cyan-600/10 rounded-[24px] lg:rounded-[30px] flex flex-col items-start gap-5">
                <div className="p-4 bg-[#205994] rounded-[100px] inline-flex items-center justify-start">
                  <Receipt24Color className="w-7 h-7 text-[#FACC15]" />
                </div>
                <h3 className="text-xl lg:text-2xl font-extrabold font-['Raleway'] leading-8 text-black">
                  Microlearning yang Ringkas
                </h3>
                <p className="text-sm md:text-base leading-5 text-black">
                  Materi disajikan dalam potongan kecil dan fokus, sehingga
                  mudah dipahami dan tidak melelahkan.
                </p>
              </div>

              {/* Card 2 */}
              <div className="flex-1 p-8 lg:p-10 bg-cyan-600/10 rounded-[24px] lg:rounded-[30px] flex flex-col items-start gap-5">
                <div className="p-4 bg-[#205994] rounded-[100px] inline-flex items-center justify-start">
                  <Drafts24Color className="w-7 h-7 text-[#38BDF8]" />
                </div>
                <h3 className="text-xl lg:text-2xl font-extrabold font-['Raleway'] leading-8 text-black">
                  Drill &amp; Practice di Setiap Unit
                </h3>
                <p className="text-sm md:text-base leading-5 text-black">
                  Setelah mini teori, kamu langsung mengerjakan latihan untuk
                  memperkuat pemahaman.
                </p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="w-full max-w-[1216px] flex flex-col md:flex-row justify-start items-stretch gap-6 lg:gap-10">
              {/* Card 3 */}
              <div className="flex-1 p-8 lg:p-10 bg-cyan-600/10 rounded-[24px] lg:rounded-[30px] flex flex-col items-start gap-5">
                <div className="p-4 bg-[#205994] rounded-[100px] inline-flex items-center justify-start">
                  <Lightbulb24Color className="w-7 h-7 text-[#FACC15]" />
                </div>
                <h3 className="text-xl lg:text-2xl font-extrabold font-['Raleway'] leading-8 text-black">
                  Beragam Tipe Soal Interaktif
                </h3>
                <p className="text-sm md:text-base leading-5 text-black">
                  Pilihan ganda, drag &amp; drop, sorting, dan fill in the blank
                  untuk menjaga proses belajar tetap aktif dan tidak
                  membosankan.
                </p>
              </div>

              {/* Card 4 */}
              <div className="flex-1 p-8 lg:p-10 bg-cyan-600/10 rounded-[24px] lg:rounded-[30px] flex flex-col items-start gap-5">
                <div className="p-4 bg-[#205994] rounded-[100px] inline-flex items-center justify-start">
                  <BotSparkle24Color className="w-7 h-7 text-[#A855F7]" />
                </div>
                <h3 className="text-xl lg:text-2xl font-extrabold font-['Raleway'] leading-8 text-black">
                  Asisten AI Siap Membantu
                </h3>
                <p className="text-sm md:text-base leading-5 text-black">
                  Asisten AI membantumu memahami konsep, mencari kesalahan kode,
                  dan memberi saran belajar sesuai kebutuhanmu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: PENGALAMAN BELAJAR */}
      <section className="flex justify-center bg-white">
        <div className="w-full max-w-[1440px] px-6 md:px-16 lg:px-28 py-16 lg:py-20 flex flex-col items-center gap-16 lg:gap-24">
          {/* Heading */}
          <div className="w-full flex flex-col items-center gap-1 text-center">
            <h2 className="max-w-[990px] text-2xl md:text-4xl lg:text-5xl font-bold leading-tight md:leading-[56px] lg:leading-[72px]">
              <span className="text-[#205994]">Pengalaman Belajar</span>
              <span className="text-black">
                {" "}
                Lebih Efektif, Terarah, dan Menyenangkan
              </span>
            </h2>
            <p className="mt-4 text-sm md:text-lg text-black leading-relaxed md:leading-8 max-w-[900px]">
              Kabiru menggabungkan pembelajaran terstruktur, gamifikasi, dan
              kecerdasan artifisial untuk menciptakan pengalaman belajar yang
              relevan dengan kebutuhan masa kini.
            </p>
          </div>

          {/* Rows */}
          <div className="w-full flex flex-col justify-start items-center gap-16 lg:gap-24">
            {/* Row 1 */}
            <div className="w-full inline-flex flex-col lg:flex-row justify-start items-center gap-10 lg:gap-12">
              <div className="flex justify-center lg:justify-start w-full lg:w-auto">
                <img
                  className="w-[320px] h-[294px] md:w-[480px] md:h-[441px] lg:w-[600px] lg:h-[551px] object-cover rounded-2xl"
                  src="imageAssets/landingpage/preview1.png"
                  alt="Pengalaman belajar 1"
                />
              </div>
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-7 mt-8 lg:mt-0">
                <div className="flex flex-col justify-start items-start gap-5">
                  <h3 className="text-2xl md:text-4xl lg:text-5xl font-semibold capitalize leading-snug lg:leading-[72px] text-black">
                    Belajar sedikit demi sedikit dengan fokus yang jelas
                  </h3>
                  <p className="max-w-[555.71px] text-sm md:text-lg text-zinc-500 leading-relaxed md:leading-8">
                    Setiap materi dipecah menjadi unit kecil berisi inti konsep
                    yang langsung diikuti latihan, sehingga belajar terasa
                    ringan, tidak melelahkan, dan mudah dilakukan setiap hari.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="w-full inline-flex flex-col lg:flex-row justify-start items-center gap-10 lg:gap-12">
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-7 order-2 lg:order-1 mt-8 lg:mt-0">
                <div className="flex flex-col justify-start items-start gap-5">
                  <h3 className="text-2xl md:text-4xl lg:text-5xl font-semibold capitalize leading-snug lg:leading-[72px] text-black">
                    Belajar aktif lewat praktik, bukan hanya membaca
                  </h3>
                  <p className="max-w-[555.71px] text-sm md:text-lg text-zinc-500 leading-relaxed md:leading-8">
                    Kamu akan mengerjakan berbagai tipe soal seperti pilihan
                    ganda, drag &amp; drop, sorting, dan isian untuk memperkuat
                    pemahaman di setiap unit pembelajaran.
                  </p>
                </div>
              </div>
              <div className="flex justify-center lg:justify-start w-full lg:w-auto order-1 lg:order-2">
                <img
                  className="w-[320px] h-[249px] md:w-[480px] md:h-[373px] lg:w-[600px] lg:h-[466px] object-cover rounded-2xl"
                  src="imageAssets/landingpage/preview2.png"
                  alt="Pengalaman belajar 2"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="w-full inline-flex flex-col lg:flex-row justify-start items-center gap-10 lg:gap-12">
              <div className="flex justify-center lg:justify-start w-full lg:w-auto">
                <img
                  className="w-[320px] h-[255px] md:w-[480px] md:h-[383px] lg:w-[600px] lg:h-[478px] object-cover rounded-2xl"
                  src="imageAssets/landingpage/preview3.png"
                  alt="Pengalaman belajar 3"
                />
              </div>
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-7 mt-8 lg:mt-0">
                <div className="flex flex-col justify-start items-start gap-5">
                  <h3 className="text-2xl md:text-4xl lg:text-5xl font-semibold capitalize leading-snug lg:leading-[72px] text-black">
                    Gamifikasi yang membangun motivasi belajar
                  </h3>
                  <p className="max-w-[555.71px] text-sm md:text-lg text-zinc-500 leading-relaxed md:leading-8">
                    Kabiru menggunakan EXP, level, streak, tantangan, dan
                    leaderboard untuk membuat proses belajar lebih seru
                    sekaligus mendorong konsistensi. Setiap latihan yang kamu
                    selesaikan langsung tercatat sebagai progres.
                  </p>
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="w-full inline-flex flex-col lg:flex-row justify-start items-center gap-10 lg:gap-12">
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-7 order-2 lg:order-1 mt-8 lg:mt-0">
                <div className="flex flex-col justify-start items-start gap-5">
                  <h3 className="text-2xl md:text-4xl lg:text-5xl font-semibold capitalize leading-snug lg:leading-[72px] text-black">
                    Pendamping Pintar Selama Proses Belajar
                  </h3>
                  <p className="max-w-[555.71px] text-sm md:text-lg text-zinc-500 leading-relaxed md:leading-8">
                    Kamu bisa langsung bertanya ke asisten AI saat mengerjakan
                    soal. Setelah sesi latihan, asisten AI memberikan ringkasan
                    hasil, menunjukkan kesalahan, dan bagian yang masih perlu
                    ditingkatkan.
                  </p>
                </div>
              </div>
              <div className="flex justify-center lg:justify-start w-full lg:w-auto order-1 lg:order-2">
                <img
                  className="w-[320px] h-[245px] md:w-[480px] md:h-[351px] lg:w-[600px] lg:h-[458px] object-cover rounded-2xl"
                  src="imageAssets/landingpage/preview4.png"
                  alt="Pengalaman belajar 4"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: STRUKTUR PEMBELAJARAN */}
      <section className="mt-10 bg-gradient-to-br from-[#020617] via-[#020617] to-[#111827] text-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.05fr,1.1fr] gap-10 items-center">
          <div className="space-y-5">
            <p className="text-xs font-semibold text-cyan-300 uppercase tracking-[0.2em]">
              STRUKTUR PEMBELAJARAN
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">
              Struktur Pembelajaran yang Membimbing Proses Belajar
            </h2>
            <p className="text-sm md:text-base text-white/70">
              Setiap langkah sudah diatur dari pengenalan konsep, latihan
              mandiri, sampai proyek mini sehingga kamu tidak bingung harus
              mulai dari mana.
            </p>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-emerald-400" />
                <p>
                  Jalur belajar bertahap dari pemula hingga siap membangun
                  proyek sederhana.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-sky-400" />
                <p>
                  Setiap modul memiliki tujuan yang jelas dan ringkasan materi.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-violet-400" />
                <p>
                  Rangkuman dan refleksi di akhir bagian untuk menguatkan
                  pemahaman.
                </p>
              </div>
            </div>
          </div>

          <div>
            <Card className="bg-white/5 border border-white/10 rounded-3xl shadow-[0_30px_80px_rgba(15,23,42,0.9)]">
              <CardBody className="p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="h-6 w-28 rounded-full bg-white/10" />
                  <div className="flex gap-2">
                    <span className="h-2 w-10 rounded-full bg-emerald-400/60" />
                    <span className="h-2 w-10 rounded-full bg-sky-400/50" />
                    <span className="h-2 w-10 rounded-full bg-violet-400/50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-white/10 h-24 flex flex-col justify-between p-3 text-[11px]"
                    >
                      <div className="h-3 w-12 rounded-full bg-white/30" />
                      <div className="space-y-1">
                        <div className="h-2 w-20 rounded-full bg-white/10" />
                        <div className="h-2 w-16 rounded-full bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-white/60">
                  <span>Dummy grid modul belajar</span>
                  <span>Struktur jalur belajar terlihat jelas</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION: BENEFIT */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-[#6366F1] uppercase tracking-[0.2em]">
            BENEFIT
          </p>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold text-[#020617]">
            Apa Benefit yang Akan Kamu Dapatkan?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          <Card className="border-none rounded-2xl shadow-md bg-[#FDFDFE]">
            <CardBody className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
                <DataPieRegular className="w-5 h-5 text-[#6366F1]" />
              </div>
              <h3 className="text-base font-semibold text-[#020617]">
                Progres Terukur
              </h3>
              <p className="text-sm text-[#6B7280]">
                Setiap langkah, nilai quiz, dan penyelesaian modul tercatat rapi
                sehingga kamu bisa melihat perkembanganmu.
              </p>
            </CardBody>
          </Card>

          <Card className="border-none rounded-2xl shadow-md bg-[#FDFDFE]">
            <CardBody className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ECFDF3] flex items-center justify-center">
                <LightbulbRegular className="w-5 h-5 text-[#16A34A]" />
              </div>
              <h3 className="text-base font-semibold text-[#020617]">
                Feedback &amp; Rekomendasi
              </h3>
              <p className="text-sm text-[#6B7280]">
                Dapatkan umpan balik otomatis dan rekomendasi materi berikutnya
                berdasarkan aktivitas belajarmu.
              </p>
            </CardBody>
          </Card>

          <Card className="border-none rounded-2xl shadow-md bg-[#FDFDFE]">
            <CardBody className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] flex items-center justify-center">
                <TrophyRegular className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h3 className="text-base font-semibold text-[#020617]">
                Konsistensi Belajar
              </h3>
              <p className="text-sm text-[#6B7280]">
                Sistem pengingat dan gamifikasi membantu kamu tetap konsisten
                membangun kebiasaan belajar.
              </p>
            </CardBody>
          </Card>
        </div>

        {/* FINAL CTA BANNER */}
        <Card className="bg-gradient-to-r from-[#111827] via-[#1D283A] to-[#111827] rounded-3xl text-white shadow-xl border-none">
          <CardBody className="px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold">
                Mulai Perjalanan Koding &amp; Kecerdasan Artifisial Bersama
                Kabiru
              </h2>
              <p className="text-sm md:text-base text-white/70">
                Daftar sekarang dan rasakan pengalaman belajar yang lebih
                terarah, interaktif, dan menyenangkan.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button
                as={Link}
                href="/register"
                size="md"
                radius="full"
                className="font-semibold bg-white text-[#111827] shadow-lg px-8"
                endContent={<RocketRegular className="w-4 h-4" />}
              >
                Daftar Gratis
              </Button>
              <p className="text-[11px] text-white/60">
                Tanpa biaya bulanan • Bisa dibatalkan kapan saja
              </p>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#020617] text-white/70">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Bot24Color className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">
                Kabiru Learn
              </span>
              <span className="text-[11px] text-white/50">
                Belajar koding &amp; KA lebih seru
              </span>
            </div>
          </div>

          <p className="text-xs text-center md:text-right">
            © 2025 Kabiru Learn. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </main>
  );
}
