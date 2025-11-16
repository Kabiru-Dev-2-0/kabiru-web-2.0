"use client";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Podium } from "@/components/podium";
import { RankingCard } from "@/components/ranking-card";
import { MotivationalTooltip } from "@/components/motivational-tooltip";
import { StarColor, PawColor } from "@fluentui/react-icons";
import { Progress } from "@heroui/progress";

export default function PeringkatPage() {
  const rankings = [
    { rank: 4, name: "Annisa Isnaini Tsaniya", exp: 945, trend: "up" as const },
    {
      rank: 5,
      name: "Annisa Isnaini Tsaniya",
      exp: 921,
      trend: "down" as const,
    },
    {
      rank: 6,
      name: "Annisa Isnaini Tsaniya",
      exp: 894,
      trend: "down" as const,
    },
    { rank: 7, name: "Annisa Isnaini Tsaniya", exp: 743, trend: "up" as const },
    { rank: 8, name: "Annisa Isnaini Tsaniya", exp: 634, trend: "up" as const },
    {
      rank: 9,
      name: "Annisa Isnaini Tsaniya",
      exp: 423,
      trend: "down" as const,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex gap-8 p-6">
        {/* Left Column */}
        <div className="flex-1 flex flex-col items-center gap-8">
          {/* Podium */}
          <Podium
            secondPlace={{ name: "Isnaini", exp: 1256 }}
            firstPlace={{ name: "Annisa", exp: 2732 }}
            thirdPlace={{ name: "Tsaniya", exp: 1034 }}
          />

          {/* Ranking List */}
          <div className="w-full flex flex-col gap-[14px]">
            {rankings.map((ranking) => (
              <RankingCard
                key={ranking.rank}
                rank={ranking.rank}
                name={ranking.name}
                exp={ranking.exp}
                trend={ranking.trend}
              />
            ))}

            {/* Current User - Rank 17 */}
            <RankingCard
              rank={17}
              name="Annisa Isnaini Tsaniya (You)"
              exp={126}
              trend="up"
              isCurrentUser
            />
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="w-[300px] flex flex-col gap-6">
          {/* Motivational Image with Tooltip */}
          <div className="flex flex-row items-center relative w-full h-[225px]">
            <div className="absolute right-26 top-22 -translate-x-1/4 px-4 py-2 w-[230px] flex gap-[18px] bg-[#006FEE] rounded-2xl shadow-xl z-10">
              {/* Tooltip Arrow - right top */}
              <div
                className="absolute top-4 -right-3 w-0 h-0"
                style={{
                  borderTop: "12px solid transparent",
                  borderBottom: "12px solid transparent",
                  borderLeft: "16px solid #006FEE",
                }}
              />
              <p className="text-lg leading-7 text-white">
                Selesaikan pelajaran untuk meningkatkan peringkatmu!
              </p>
            </div>
            <div className="flex w-full h-full justify-end items-end">
              <img
                src="/imageAssets/leaderboard-agent.png"
                alt="leaderboard"
                className="mt-[-24px] mb-2 max-w-[180px] w-auto h-[250px]"
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>

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
  );
}
