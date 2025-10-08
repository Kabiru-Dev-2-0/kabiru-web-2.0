"use client";

import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { MissionCard } from "@/components/mission-card";
import { MotivationalTooltip } from "@/components/motivational-tooltip";
import { TrophyColor, StarColor, FlagColor, PaintBrushColor, PawColor } from "@fluentui/react-icons";
import { Progress } from "@heroui/progress";

export default function TantanganPage() {
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
              {/* Misi Harian Section */}
              <div className="flex flex-col gap-5">
                <MissionCard
                  icon={<StarColor className="w-[42px] h-[42px]" />}
                  title="Selesaikan 1 simulasi (10XP)"
                  progress={32}
                  total={100}
                />
                <MissionCard
                  icon={<FlagColor className="w-[42px] h-[42px]" />}
                  title="Selesaikan 1 Modul (10 berlian)"
                  progress={0}
                  total={100}
                />
                <MissionCard
                  icon={<PaintBrushColor className="w-[42px] h-[42px]" />}
                  title="Kerjakan 1 Latihan (5 berlian)"
                  progress={0}
                  total={100}
                />
              </div>

              {/* Motivational Image with Tooltip */}
              <div className="relative w-[270px] h-[250px]">
                <MotivationalTooltip
                  message="Ayo selesaikan misi&#10;dan dapatkan hadiahmu!"
                  imageUrl="/api/placeholder/187/246"
                  position="left"
                />
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

