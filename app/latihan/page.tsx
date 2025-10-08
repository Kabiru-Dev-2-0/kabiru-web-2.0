"use client";

import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { MotivationalTooltip } from "@/components/motivational-tooltip";
import { CheckmarkCircleColor, LockClosedColor } from "@fluentui/react-icons";
import { TrophyColor, StarColor, PawColor } from "@fluentui/react-icons";

export default function LatihanPage() {
  return (
    <div className="flex h-screen w-full bg-[#FCFDFD]">
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
              {/* Learning Path Cards */}
              <div className="flex flex-col gap-5">
                {/* Card 1 - Selesai */}
                <Card
                  className="border-2 border-[#E4E4E7] shadow-sm bg-white relative overflow-visible"
                  radius="lg"
                >
                  <CardBody className="p-5 gap-5">
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-[#3F3F46] opacity-60">
                            Bagian 1
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-lg text-[#52525B]">
                            Pengenalan Kecerdasan Artifisial
                          </span>
                          <div className="flex items-center gap-1">
                            <CheckmarkCircleColor className="w-8 h-8" />
                            <span className="text-2xl font-extrabold text-[#17C964]">
                              SELESAI!
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        color="primary"
                        size="md"
                        radius="sm"
                        className="border-2 border-[#006FEE]"
                      >
                        Pelajari Lagi
                      </Button>
                    </div>
                    {/* Tooltip positioned absolutely */}
                    <div className="absolute -bottom-0 left-0 w-full h-[150px] pointer-events-none">
                      <div className="relative w-full h-full">
                        <MotivationalTooltip
                          message="Aku ingin mengenal&#10;lebih dalam tentang AI"
                          imageUrl="/api/placeholder/139/150"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Card 2 - In Progress */}
                <Card
                  className="border-2 border-[#E4E4E7] shadow-sm bg-white relative overflow-visible"
                  radius="lg"
                >
                  <CardBody className="p-5 gap-5">
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-[#3F3F46] opacity-60">
                            Bagian 2
                          </span>
                        </div>
                        <Progress
                          value={30}
                          color="warning"
                          size="lg"
                          radius="full"
                          label="Logika dan Berpikir Komputasional"
                          showValueLabel
                          valueLabel="3/10"
                          classNames={{
                            label: "text-lg text-[#52525B]",
                            value: "text-lg text-[#52525B]",
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        color="primary"
                        size="md"
                        radius="sm"
                        className="border-2 border-[#006FEE]"
                      >
                        Lanjutkan Belajar
                      </Button>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute -bottom-0 left-0 w-full h-[150px] pointer-events-none">
                      <div className="relative w-full h-full">
                        <MotivationalTooltip
                          message="Aku ingin mengenal&#10;lebih dalam tentang AI"
                          imageUrl="/api/placeholder/172/150"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Card 3 - Dikunci */}
                <Card
                  className="border-2 border-[#E4E4E7] shadow-sm bg-white relative overflow-visible"
                  radius="lg"
                >
                  <CardBody className="p-5 gap-5">
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-[#3F3F46] opacity-60">
                            Bagian 3
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-lg text-[#52525B]">
                            Dasar Algoritma dan Pemrograman
                          </span>
                          <div className="flex items-center gap-1">
                            <LockClosedColor className="w-8 h-8" />
                            <span className="text-2xl font-extrabold text-[#F5A524]">
                              DIKUNCI
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="faded"
                        color="default"
                        size="md"
                        radius="sm"
                        className="border-2 border-[#D4D4D8] opacity-50"
                        isDisabled
                      >
                        Lanjutkan Belajar
                      </Button>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute -bottom-0 left-0 w-full h-[150px] pointer-events-none">
                      <div className="relative w-full h-full">
                        <MotivationalTooltip
                          message="Aku ingin mengenal&#10;lebih dalam tentang AI"
                          imageUrl="/api/placeholder/168/150"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Card 4 - Dikunci */}
                <Card
                  className="border-2 border-[#E4E4E7] shadow-sm bg-white relative overflow-visible"
                  radius="lg"
                >
                  <CardBody className="p-5 gap-5">
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-[#3F3F46] opacity-60">
                            Bagian 4
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-lg text-[#52525B]">
                            Analisis Data untuk AI
                          </span>
                          <div className="flex items-center gap-1">
                            <LockClosedColor className="w-8 h-8" />
                            <span className="text-2xl font-extrabold text-[#F5A524]">
                              DIKUNCI
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="faded"
                        color="default"
                        size="md"
                        radius="sm"
                        className="border-2 border-[#D4D4D8] opacity-50"
                        isDisabled
                      >
                        Lanjutkan Belajar
                      </Button>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute -bottom-0 left-0 w-full h-[150px] pointer-events-none">
                      <div className="relative w-full h-full">
                        <MotivationalTooltip
                          message="Aku ingin mengenal&#10;lebih dalam tentang AI"
                          imageUrl="/api/placeholder/172/150"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* Right Column - Widgets */}
            <div className="w-[300px] flex flex-col gap-6">
              {/* Peringkat Widget */}
              <Card
                className="border-2 border-[#E4E4E7] shadow-sm bg-white"
                radius="lg"
              >
                <CardBody className="p-[14px_18px_20px] gap-5">
                  <div className="flex items-center justify-center gap-2.5">
                    <span className="text-2xl font-semibold text-[#7828C8]">
                      Peringkat
                    </span>
                    <Button
                      variant="light"
                      color="primary"
                      size="sm"
                      radius="full"
                      className="min-w-0 h-8"
                    >
                      Lihat Semua
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-2.5">
                    <TrophyColor className="w-[42px] h-[42px]" />
                    <div className="flex flex-col justify-center">
                      <span className="text-base font-medium text-black">
                        Saat ini kamu di peringkat
                      </span>
                      <span className="text-base font-semibold text-[#7828C8]">
                        #17
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Misi Harian Widget */}
              <Card
                className="border-2 border-[#E4E4E7] shadow-sm bg-white"
                radius="lg"
              >
                <CardBody className="p-[14px_18px_20px] gap-5">
                  <div className="flex items-center justify-center gap-2.5">
                    <span className="text-2xl font-semibold text-[#F31260]">
                      Misi Harian
                    </span>
                    <Button
                      variant="light"
                      color="primary"
                      size="sm"
                      radius="full"
                      className="min-w-0 h-8"
                    >
                      Lihat Semua
                    </Button>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <StarColor className="w-[42px] h-[42px]" />
                    <Progress
                      value={84}
                      color="warning"
                      size="md"
                      radius="full"
                      label="Dapatkan 10 XP"
                      showValueLabel
                      valueLabel="84%"
                      classNames={{
                        base: "flex-1",
                        label: "text-base font-medium text-black",
                        value: "text-base font-normal text-black",
                      }}
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Perjalananku Widget */}
              <Card
                className="border-2 border-[#E4E4E7] shadow-sm bg-white"
                radius="lg"
              >
                <CardBody className="p-[14px_18px_20px] gap-5">
                  <div className="flex items-center justify-center gap-2.5">
                    <span className="text-2xl font-semibold text-[#17C964]">
                      Perjalananku
                    </span>
                    <Button
                      variant="light"
                      color="primary"
                      size="sm"
                      radius="full"
                      isIconOnly
                      className="min-w-0 w-8 h-8"
                    >
                      →
                    </Button>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <PawColor className="w-[42px] h-[42px]" />
                    <Progress
                      value={30}
                      color="warning"
                      size="md"
                      radius="full"
                      label="Pemula"
                      classNames={{
                        base: "flex-1",
                        label: "text-base font-medium text-black",
                      }}
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

