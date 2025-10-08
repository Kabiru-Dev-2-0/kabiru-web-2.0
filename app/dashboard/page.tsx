"use client";

import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProgressCourseCard } from "@/components/progress-course-card";
import { Card, CardBody } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";

export default function DashboardPage() {
  return (
    <div className="flex h-screen w-full bg-[#FAFAFA]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-8 p-6">
            {/* Left Column */}
            <div className="flex-1 flex flex-col gap-8">
              {/* Tooltip Section */}
              <div className="flex items-center gap-2.5">
                {/* Character Image */}
                <div className="w-[155.25px] h-[200px] relative">
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-6xl">
                    🤖
                  </div>
                </div>

                {/* Tooltip */}
                <div className="relative">
                  <div className="bg-white rounded-xl p-6 shadow-2xl shadow-primary/20 max-w-md">
                    <p className="text-lg leading-7 text-black mb-4">
                      Hebat, kamu sudah memahami dasar logika dengan baik! 🎉
                      <br />
                      Tapi aku lihat kamu masih agak bingung di bagian looping dan efisiensi algoritma. Yuk, coba ulang latihan di bagian &apos;Simulasi Perulangan&apos;
                    </p>
                    <Button
                      color="default"
                      radius="sm"
                      size="md"
                      className="shadow-xl"
                    >
                      Belajar lagi
                    </Button>
                  </div>
                </div>
              </div>

              <Divider className="bg-[rgba(17,17,17,0.15)]" />

              {/* Sedang Dipelajari Section */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  <div className="text-4xl">📚</div>
                  <h2 className="text-2xl font-semibold leading-8 text-black">
                    Sedang dipelajari
                  </h2>
                </div>

                <div className="flex gap-5">
                  <ProgressCourseCard
                    category="Learning Path"
                    description="Lorem ipsum dolor sit lorem ipsum dolor sit amet."
                    icon="📊"
                    progress={5}
                    title="Logika dan Berpikir Komputasional"
                    total={20}
                  />
                  <ProgressCourseCard
                    category="Learning Path"
                    description="Lorem ipsum dolor sit lorem ipsum dolor sit amet."
                    icon="🧬"
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
                  <div className="text-4xl">🎓</div>
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
                      <div className="text-4xl">🤖</div>
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
                    <Button
                      color="primary"
                      radius="full"
                      size="sm"
                      variant="light"
                    >
                      Lihat Semua
                    </Button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-[42px]">🏆</div>
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
                    <Button
                      color="primary"
                      radius="full"
                      size="sm"
                      variant="light"
                    >
                      Lihat Semua
                    </Button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-[42px]">⭐</div>
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
                    <div className="text-[42px]">🐾</div>
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
      </div>
    </div>
  );
}

