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
  DataTrending28Color,
  MegaphoneLoud28Color,
  BookOpenLightbulb32Color,
} from "@fluentui/react-icons";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#ffffff]">
      {/* STICKY HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white">
        <div className="w-full flex justify-center">
          <nav className="w-full max-w-[1440px] px-12 py-4 inline-flex justify-start items-center gap-8">
            {/* Logo */}
            <div className="flex justify-start items-start w-[250px]">
              <img
                className="w-36 h-10 object-contain"
                src="imageAssets/LogoApp.png"
                alt="AIZONE logo dummy"
              />
            </div>

            {/* Center navigation */}
            <div className="flex-1 hidden md:flex justify-center items-center gap-6">
              <button className="text-zinc-500 text-lg font-normal leading-7 hover:text-zinc-800">
                Beranda
              </button>
              <button className="text-zinc-500 text-lg font-normal leading-7 hover:text-zinc-800">
                Fitur
              </button>
              <button className="text-zinc-500 text-lg font-normal leading-7 hover:text-zinc-800">
                Tentang Kami
              </button>
            </div>

            {/* Right actions */}
            <div className="flex justify-end w-[250px] items-start gap-4">
              <Link
                href="/login"
                className="h-12 px-4 bg-zinc-100 rounded-xl flex items-center justify-center gap-2 text-zinc-500 text-lg font-medium leading-7 hover:bg-zinc-200"
              >
                Masuk
              </Link>
              <Button
                as={Link}
                href="/register"
                className="h-12 px-4 rounded-xl flex items-center justify-center gap-2 text-zinc-50 text-lg font-medium leading-7 bg-[#3674B5] hover:bg-[#285486]"
              >
                Daftar Gratis
              </Button>
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
      <section className="flex justify-center">
        <div className="w-full flex justify-center">
          <div className="relative w-full overflow-hidden rounded-[80px_0_80px_0] bg-gradient-to-br from-[#205994] to-[#27093F] px-6 md:px-12 lg:px-24 py-14 md:py-20 text-white flex flex-col items-center">
            <div className="flex w-full max-w-[1200px] flex-col gap-4 lg:gap-8 items-center">
              {/* Bagian kiri: penjelasan struktur pembelajaran */}
              <div className="flex flex-col lg:flex-row items-start justify-center gap-12 lg:gap-16 w-full">
                <div className="flex-1 space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left">
                  <p className="inline-flex items-center text-s md:text-m font-semibold tracking-[0.2em] text-[#FFDA2C] uppercase justify-center">
                    STRUKTUR PEMBELAJARAN
                  </p>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-snug">
                    Struktur Pembelajaran yang Membimbing Proses Belajar
                  </h2>
                  <p className="text-sm md:text-base text-white/85 max-w-xl mx-auto lg:mx-0">
                    Pembelajaran disusun dalam struktur yang jelas dan beberapa
                    tingkat agar kamu dapat belajar secara fokus tanpa merasa
                    kewalahan.
                  </p>

                  <div className="mt-4 flex flex-col gap-4 text-sm md:text-base text-white/85 items-center lg:items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-[36px] w-[36px] bg-[#F5A524] rounded-[100px] inline-flex flex-col justify-center items-center">
                        <span className="justify-center text-white text-l font-bold">
                          1
                        </span>
                      </div>
                      <p className="leading-relaxed">
                        Modul sebagai gambaran umum topik pembelajaran.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-[36px] w-[36px] bg-[#F5A524] rounded-[100px] inline-flex flex-col justify-center items-center">
                        <span className="justify-center text-white text-l font-bold">
                          2
                        </span>
                      </div>
                      <p className="leading-relaxed">
                        Lesson sebagai penjabaran materi yang dipelajari secara
                        berurutan.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-[36px] w-[36px] bg-[#F5A524] rounded-[100px] inline-flex flex-col justify-center items-center">
                        <span className="justify-center text-white text-l font-bold">
                          3
                        </span>
                      </div>
                      <p className="leading-relaxed">
                        Stage sebagai tahapan microlearning berisi materi
                        singkat dan latihan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bagian kanan: ilustrasi struktur pembelajaran */}
                <div className="w-full lg:w-[480px] xl:w-[520px] flex justify-center">
                  <Card className="bg-[#EBF1F8] rounded-3xl border-none shadow-[0_30px_80px_rgba(15,23,42,0.65)] flex items-center justify-center">
                    <CardBody className="p-6 md:p-8 flex items-center justify-center">
                      <img
                        src="imageAssets/landingpage/struktur-pembelajaran.png"
                        alt="Struktur pembelajaran Kabiru"
                        className="w-full h-auto object-contain"
                      />
                    </CardBody>
                  </Card>
                </div>
              </div>

              {/* Bagian bawah: apa yang bisa dipelajari di Kabiru */}
              <div className="flex flex-col gap-8 items-start w-full">
                <div className="max-w-2xl text-start">
                  <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-snug">
                    Apa yang Bisa <br className="hidden md:block" />
                    di Pelajari di Kabiru?
                  </h3>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-2xl">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-5">
                    <Chip
                      variant="solid"
                      className="flex-1 justify-center bg-[#205994] text-white rounded-full px-8 py-6 text-sm md:text-base font-medium"
                    >
                      Berpikir Komputasional
                    </Chip>
                    <Chip
                      variant="solid"
                      className="flex-1 justify-center bg-[#205994] text-white rounded-full px-8 py-6 text-sm md:text-base font-medium"
                    >
                      Literasi Digital
                    </Chip>
                    <Chip
                      variant="solid"
                      className="flex-1 justify-center bg-[#205994] text-white rounded-full px-8 py-6 text-sm md:text-base font-medium"
                    >
                      Algoritma Pemrograman
                    </Chip>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 md:gap-5">
                    <Chip
                      variant="solid"
                      className="flex-1 justify-center bg-[#205994] text-white rounded-full px-8 py-6 text-sm md:text-base font-medium"
                    >
                      Analisis Data
                    </Chip>
                    <Chip
                      variant="solid"
                      className="flex-1 justify-center bg-[#205994] text-white rounded-full px-8 py-6 text-sm md:text-base font-medium"
                    >
                      Literasi dan Etika Kecerdasan Artifisial
                    </Chip>
                    <Chip
                      variant="solid"
                      className="flex-1 justify-center bg-[#205994] text-white rounded-full px-8 py-6 text-sm md:text-base font-medium"
                    >
                      Pemanfaatan dan Pengembangan Kecerdasan Artifisial
                    </Chip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: BENEFIT */}
      <section className="flex justify-center bg-white">
        <div className="w-full max-w-[1440px] px-6 md:px-12 lg:px-28 py-16 lg:py-20 flex flex-col items-center gap-8">
          <div className="w-full flex flex-col items-center gap-10">
            <div className="w-full max-w-[990px] text-center">
              <span className="text-2xl md:text-4xl lg:text-5xl font-bold leading-[1.3] text-black">
                Apa{" "}
              </span>
              <span className="text-2xl md:text-4xl lg:text-5xl font-bold leading-[1.3] text-[#205994]">
                Benefit
              </span>
              <span className="text-2xl md:text-4xl lg:text-5xl font-bold leading-[1.3] text-black">
                {" "}
                yang Akan Kamu
                <br className="hidden md:block" />
                Dapatkan?
              </span>
            </div>

            <div className="w-full flex flex-col md:flex-row justify-start items-stretch gap-6">
              {/* Card 1 */}
              <div className="flex-1 p-8 md:p-10 bg-amber-100 rounded-[32px] md:rounded-[40px] inline-flex flex-col justify-start items-start gap-7 md:gap-9">
                <div className="p-4 bg-[#FFDA2C] rounded-[100px] inline-flex items-center justify-start">
                  <DataTrending28Color className="w-14 h-14 text-[#A855F7]" />
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="text-2xl md:text-3xl font-medium text-black leading-snug">
                    Progres
                    <br />
                    Terukur
                  </div>
                  <div className="text-sm md:text-lg font-normal text-black leading-7 md:leading-8">
                    Pantau perkembangan belajarmu melalui level, statistik
                    latihan, dan pencapaian.
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex-1 p-8 md:p-10 bg-amber-100 rounded-[32px] md:rounded-[40px] inline-flex flex-col justify-start items-start gap-7 md:gap-9">
                <div className="p-4 bg-[#FFDA2C] rounded-[100px] inline-flex items-center justify-start">
                  <MegaphoneLoud28Color className="w-14 h-14 text-[#A855F7]" />
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="text-2xl md:text-3xl font-medium text-black leading-snug">
                    Feedback &amp;
                    <br />
                    Rekomendasi
                  </div>
                  <div className="text-sm md:text-lg font-normal text-black leading-7 md:leading-8">
                    Dapatkan koreksi, penjelasan instan, dan saran materi dari
                    asisten AI.
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="flex-1 p-8 md:p-10 bg-amber-100 rounded-[32px] md:rounded-[40px] inline-flex flex-col justify-start items-start gap-7 md:gap-9">
                <div className="p-4 bg-[#FFDA2C] rounded-[100px] inline-flex items-center justify-start">
                  <BookOpenLightbulb32Color className="w-14 h-14 text-[#A855F7]" />
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="text-2xl md:text-3xl font-medium text-black leading-snug">
                    Konsistensi
                    <br />
                    Belajar
                  </div>
                  <div className="text-sm md:text-lg font-normal text-black leading-7 md:leading-8">
                    Kabiru membantumu membangun kebiasaan belajar yang rutin dan
                    berkelanjutan.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER (sesuai Figma) */}
      <section className="flex justify-center bg-white px-6 md:px-12 lg:px-28 py-12">
        <div className="w-full max-w-[1440px]">
          <div className="relative w-full rounded-[40px] p-6 md:p-10 text-white bg-gradient-to-r from-[#205994] to-[#1A0845] overflow-hidden">
            {/* Background image dengan opacity 20% */}
            <div
              className="absolute inset-0 bg-cover bg-no-repeat bg-center opacity-20"
              style={{
                backgroundImage:
                  "url(/imageAssets/landingpage/cta-banner-bg-6f5491.png)",
              }}
            />
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-4 md:gap-6 text-center px-2 md:px-6">
              <h2 className="font-bold text-2xl md:text-4xl lg:text-5xl leading-tight">
                Mulai Perjalanan Koding &amp; Kecerdasan Artifisial Bersama
                Kabiru
              </h2>
              <p className="text-sm md:text-base text-white/85 max-w-3xl leading-relaxed">
                Belajar lebih terarah, lebih seru, dan didukung asisten AI.
                Semua dalam satu platform.
              </p>
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
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#020617] text-white/70">
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-28 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">
            {/* Brand Section */}
            <div className="flex flex-col gap-4 max-w-md">
              <div className="flex items-center gap-3">
                
                <div className="flex flex-col">
                  <img src="imageAssets/LogoApp-white.png" alt="" className="h-12"/>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Platform pembelajaran koding dan kecerdasan artifisial yang
                dirancang untuk membantu kamu belajar secara bertahap,
                interaktif, dan menyenangkan.
              </p>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Navigasi */}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Navigasi
                </h4>
                <ul className="flex flex-col gap-3">
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      Beranda
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      Fitur
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      Tentang Kami
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Legal
                </h4>
                <ul className="flex flex-col gap-3">
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      Kebijakan Privasi
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      Syarat &amp; Ketentuan
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Social */}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Social
                </h4>
                <div className="flex items-center gap-3">
                  <Link
                    href="#"
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 18 18"
                      fill="none"
                      className="w-5 h-5 text-white"
                    >
                      <path
                        d="M10.159 16.5V9.75h2.25l.3-2.25h-2.55V6.451c0-.651.13-.901.84-.901h1.71V3.75H11.01c-2.05 0-2.601.962-2.601 2.581V7.5H6v2.25h2.409v6.75h1.75Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="#"
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 18 18"
                      fill="none"
                      className="w-5 h-5 text-white"
                    >
                      <path
                        d="M6.165 7.5H3.93v6.75h2.235V7.5ZM5.048 6.621c.753 0 1.216-.501 1.216-1.13-.013-.641-.463-1.13-1.202-1.13-.74 0-1.215.489-1.215 1.13 0 .629.462 1.13 1.189 1.13h.012ZM14.07 12.41v-2.686c0-1.356-.726-1.989-1.7-1.989-.782 0-1.131.432-1.328.735v-1.26H8.807c.03.835 0 6.04 0 6.04h2.236v-3.374c0-.181.013-.361.066-.49.146-.362.48-.736 1.04-.736.733 0 1.027.555 1.027 1.368v3.232H14.07Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="#"
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-colors"
                    aria-label="Twitter"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 18 18"
                      fill="none"
                      className="w-5 h-5 text-white"
                    >
                      <path
                        d="M15.637 6.581c.007.104.007.21.007.316 0 3.233-2.46 6.963-6.963 6.963v-.002A6.92 6.92 0 0 1 3 12.493a5.025 5.025 0 0 0 3.694-1.036 2.455 2.455 0 0 1-2.291-1.704c.377.074.765.06 1.126-.043A2.453 2.453 0 0 1 3.9 7.312v-.031a2.45 2.45 0 0 0 1.108.306A2.456 2.456 0 0 1 3.837 4.27c.427.242.91.388 1.426.405A6.96 6.96 0 0 0 9.05 4.988a2.457 2.457 0 0 1 4.18 2.236c.388-.077.755-.218 1.085-.413a2.464 2.464 0 0 1-1.079 1.356 4.927 4.927 0 0 0 1.407-.386 5.276 5.276 0 0 1-1.226 1.267Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/50 text-center md:text-left">
              © 2025 Kabiru Learn. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-xs text-white/50 hover:text-white/70 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-xs text-white/50 hover:text-white/70 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
