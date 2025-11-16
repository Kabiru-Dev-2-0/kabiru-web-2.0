"use client";
import { ProgressCourseCard } from "@/components/progress-course-card";
import { Card, CardBody } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
  BookStarColor,
  CertificateColor,
  DataPieColor,
  MoleculeColor,
  BotColor,
  TrophyColor,
  StarColor,
  PawColor,
} from "@fluentui/react-icons";
import { Tooltip } from "@heroui/tooltip";

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex gap-8 p-6">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Tooltip Section */}
          <div className="flex items-center gap-2.5 relative">
            <div className="flex flex-row items-center gap-4 w-full">
              <div className="w-fit h-full min-h[350px]  relative z-10">
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src="/imageAssets/agent-dashboard.png"
                    alt="Agent Dashboard"
                    className="object-contain h-fill w-auto"
                    style={{ aspectRatio: "155.25 / 200" }}
                  />
                </div>
              </div>

              {/* Tooltip utama */}
              <div className="relative">
                {/* Panah kiri atas */}
                <div
                  className="absolute -left-2 top-5 w-0 h-0 
                                    border-t-[10px] border-t-transparent 
                                    border-b-[10px] border-b-transparent 
                                    border-r-[10px] border-r-[#006FEE]"
                ></div>

                <div className="px-6 py-8 w-full flex flex-col gap-[18px] bg-[#006FEE] rounded-lg shadow-xl relative z-0">
                  <p className="text-lg leading-7 text-white">
                    Hebat, kamu sudah memahami dasar logika dengan baik! 🎉
                    <br />
                    Tapi aku lihat kamu masih agak bingung di bagian looping dan
                    efisiensi algoritma. Yuk, coba ulang latihan di bagian
                    'Simulasi Perulangan'
                  </p>
                  <Button
                    color="default"
                    radius="sm"
                    size="md"
                    className="bg-[#ffffff] text-[#2d5d94] font-semibold text-lg px-5 py-2.5 rounded-xl hover:bg-[#ffffff] transition-colors w-fit"
                    style={{
                      boxShadow: "0px 3px 0px 0px #E4E4E7",
                    }}
                  >
                    Belajar lagi
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Divider className="bg-[rgba(17,17,17,0.15)]" />

          {/* Sedang Dipelajari Section */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <BookStarColor className="w-10 h-10" />
              <h2 className="text-2xl font-semibold leading-8 text-black">
                Sedang dipelajari
              </h2>
            </div>

            <div className="flex gap-5">
              <ProgressCourseCard
                category="Learning Path"
                description="Lorem ipsum dolor sit lorem ipsum dolor sit amet."
                iconComponent={<DataPieColor className="w-10 h-10" />}
                progress={5}
                title="Logika dan Berpikir Komputasional"
                total={20}
              />
              <ProgressCourseCard
                category="Learning Path"
                description="Lorem ipsum dolor sit lorem ipsum dolor sit amet."
                iconComponent={<MoleculeColor className="w-10 h-10" />}
                progress={0}
                title="Dasar Algoritma dan Pemrograman"
                total={20}
              />
            </div>
          </div>

          <Divider className="bg-[rgba(17,17,17,0.15)]" />

          {/* Selesai Dipelajari Section */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <CertificateColor className="w-10 h-10" />
              <h2 className="text-2xl font-semibold leading-8 text-black">
                Selesai dipelajari
              </h2>
            </div>

            <Card
              className="w-[333px] border border-[#F4F4F5] shadow-sm"
              radius="lg"
            >
              <CardBody className="p-5 gap-[14px]">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <BotColor className="w-10 h-10" />
                  <div className="flex-1 flex flex-col">
                    <span className="text-base font-medium leading-6 text-[#71717A]">
                      Learning Path
                    </span>
                    <span className="text-lg font-bold leading-7 text-black">
                      Pengenalan Konsep AI
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm leading-5 text-[#11181C]">
                  Lorem ipsum dolor sit lorem ipsum dolor sit amet.
                </p>

                {/* Button */}
                <Button
                  color="primary"
                  radius="full"
                  size="sm"
                  className="px-3 h-8 w-fit"
                >
                  Ulas Materi
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[300px] flex flex-col gap-6">
          {/* Peringkat Card */}
          <Card className="border-2 border-[#E4E4E7]" radius="lg">
            <CardBody className="p-[14px_18px_20px] gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-[#7828C8]">
                    Peringkat
                  </span>
                </div>
                <Button color="primary" radius="full" size="sm" variant="light">
                  Lihat Semua
                </Button>
              </div>

              <div className="flex items-center gap-2.5">
                <TrophyColor className="w-[42px] h-[42px]" />
                <div className="flex flex-col flex-1">
                  <span className="text-base font-medium leading-6 text-black">
                    Saat ini kamu di peringkat
                  </span>
                  <span className="text-base font-semibold leading-6 text-[#7828C8]">
                    #17
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Misi Harian Card */}
          <Card className="border-2 border-[#E4E4E7]" radius="lg">
            <CardBody className="p-[14px_18px_20px] gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-[#F31260]">
                    Misi Harian
                  </span>
                </div>
                <Button color="primary" radius="full" size="sm" variant="light">
                  Lihat Semua
                </Button>
              </div>

              <div className="flex items-center gap-2.5">
                <StarColor className="w-[42px] h-[42px]" />
                <Progress
                  aria-label="Daily mission"
                  classNames={{
                    base: "w-full",
                    track: "bg-[#E4E4E7]",
                    indicator: "bg-[#F5A524]",
                    label: "text-base font-medium leading-6 text-black",
                    value: "text-base font-medium leading-6 text-black",
                  }}
                  color="warning"
                  label="Dapatkan 10 XP"
                  maxValue={100}
                  radius="full"
                  showValueLabel
                  size="md"
                  value={84}
                  valueLabel="84%"
                />
              </div>
            </CardBody>
          </Card>

          {/* Perjalananku Card */}
          <Card className="border-2 border-[#E4E4E7]" radius="lg">
            <CardBody className="p-[14px_18px_20px] gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-[#17C964]">
                    Perjalananku
                  </span>
                </div>
                <Button
                  isIconOnly
                  color="primary"
                  radius="full"
                  size="sm"
                  variant="light"
                >
                  →
                </Button>
              </div>

              <div className="flex items-center gap-2.5">
                <PawColor className="w-[42px] h-[42px]" />
                <Progress
                  aria-label="Journey progress"
                  classNames={{
                    base: "w-full",
                    track: "bg-[#E4E4E7]",
                    indicator: "bg-[#F5A524]",
                    label: "text-base font-medium leading-6 text-black",
                  }}
                  color="warning"
                  label="Pemula"
                  maxValue={100}
                  radius="full"
                  size="md"
                  value={45}
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
