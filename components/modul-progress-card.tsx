'use client';

import { Card, CardBody } from '@heroui/card';
import { Progress } from '@heroui/progress';
import { Button } from '@heroui/button';
import Link from 'next/link';

interface ModulProgressCardProps {
  modulNumber: number;
  title: string;
  description: string;
  completedCount: number;
  totalCount: number;
  href: string;
}

export const ModulProgressCard = ({
  modulNumber,
  title,
  description,
  completedCount,
  totalCount,
  href,
}: ModulProgressCardProps) => {
  const percent = totalCount > 0 ? Math.round((completedCount * 100) / totalCount) : 0;

  return (
    <Card className="w-full border border-[#F4F4F5] shadow-sm" radius="lg">
      <CardBody className="p-5 gap-[14px]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-base font-medium leading-6 text-[#71717A]">
              Modul {modulNumber}
            </span>
            <span className="text-lg font-bold leading-7 text-black">{title}</span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <Progress
                value={percent}
                color="warning"
                size="lg"
                radius="full"
                classNames={{
                  label: 'text-lg text-[#52525B]',
                  value: 'text-lg text-[#52525B]',
                }}
              />
              <p className="text-yellow-500 font-semibold">{`${completedCount}/${totalCount}`}</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-[14px]">
            <Button
              as={Link}
              href={href}
              scroll={false}
              prefetch
              color="default"
              radius="sm"
              size="md"
              style={{
                boxShadow: '0px 3px 0px 0px #205994',
              }}
              className={
                'justify-start h-auto py-2 px-4 bg-[#ffffff] text-[#3674B5] border-[1.5px] border-[#3674B5] font-semibold text-sm rounded-xl'
              }
            >
              Lanjutkan Belajar
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ModulProgressCard;
