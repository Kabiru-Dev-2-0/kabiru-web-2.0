// components/peringkat-widget.tsx
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Progress } from '@heroui/progress';
import Link from 'next/link';
import { TrophyColor, StarColor, PawColor } from '@fluentui/react-icons';

interface PeringkatWidgetProps {
  rank?: number;
  href?: string;
  title?: string;
  missionTitle?: string;
  missionValue?: number;
  missionHref?: string;
  journeyTitle?: string;
  journeyLabel?: string;
  journeyValue?: number;
}

export function PeringkatWidget({
  rank = 17,
  href = '/peringkat',
  title = 'Peringkat',
  missionTitle = 'Dapatkan 10 XP',
  missionValue = 84,
  missionHref = '/tantangan',
  journeyTitle = 'Perjalananku',
  journeyLabel = 'Pemula',
  journeyValue = 30,
}: PeringkatWidgetProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-2 border-[#E4E4E7]" radius="lg">
        <CardBody className="p-[14px_18px_20px] gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-[#7828C8]">{title}</span>
            </div>
            <Button as={Link} href={href} color="primary" radius="full" size="sm" variant="light">
              Lihat Semua
            </Button>
          </div>

          <div className="flex items-center gap-2.5">
            <TrophyColor className="w-[42px] h-[42px]" />
            <div className="flex flex-col flex-1">
              <span className="text-base font-medium leading-6 text-black">Saat ini kamu di peringkat</span>
              <span className="text-base font-semibold leading-6 text-[#7828C8]">#{rank}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="border-2 border-[#E4E4E7]" radius="lg">
        <CardBody className="p-[14px_18px_20px] gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-[#F31260]">Misi Harian</span>
            </div>
            <Button as={Link} href={missionHref} color="primary" radius="full" size="sm" variant="light">
              Lihat Semua
            </Button>
          </div>

          <div className="flex items-center gap-2.5">
            <StarColor className="w-[42px] h-[42px]" />
            <Progress
              aria-label="Daily mission"
              classNames={{
                base: 'w-full',
                track: 'bg-[#E4E4E7]',
                indicator: 'bg-[#F5A524]',
                label: 'text-base font-medium leading-6 text-black',
                value: 'text-base font-medium leading-6 text-black',
              }}
              color="warning"
              label={missionTitle}
              maxValue={100}
              radius="full"
              showValueLabel
              size="md"
              value={missionValue}
              valueLabel={`${missionValue}%`}
            />
          </div>
        </CardBody>
      </Card>

      <Card className="border-2 border-[#E4E4E7]" radius="lg">
        <CardBody className="p-[14px_18px_20px] gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-[#17C964]">{journeyTitle}</span>
            </div>
            <Button isIconOnly color="primary" radius="full" size="sm" variant="light">
              →
            </Button>
          </div>

          <div className="flex items-center gap-2.5">
            <PawColor className="w-[42px] h-[42px]" />
            <Progress
              aria-label="Journey progress"
              classNames={{ base: 'w-full', label: 'text-base font-medium leading-6 text-black', track: 'bg-[#E4E4E7]', indicator: 'bg-[#F5A524]' }}
              color="warning"
              label={journeyLabel}
              maxValue={100}
              radius="full"
              size="md"
              value={journeyValue}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
