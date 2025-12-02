'use client';

import { Card, CardBody } from '@heroui/card';
import { Progress } from '@heroui/progress';
import { Button } from '@heroui/button';
import Link from 'next/link';

interface ProgressCourseCardProps {
  title: string;
  description: string;
  progress: number;
  total: number;
  icon?: string;
  iconComponent?: React.ReactNode;
  category?: string;
  valueLabel?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  buttonText?: string;
}

export const ProgressCourseCard = ({
  title,
  description,
  progress,
  total,
  icon,
  iconComponent,
  category = 'Learning Path',
  valueLabel,
  href,
  onClick,
  buttonText,
}: ProgressCourseCardProps) => {
  const progressPercent = Math.round((progress / total) * 100);

  return (
    <Card className="w-full border border-[#F4F4F5] shadow-sm" radius="lg">
      <CardBody className="p-5 gap-[14px]">
        {/* Header */}
        <div className="flex items-center gap-3">
          {iconComponent ? (
            <div className="flex items-center justify-center">{iconComponent}</div>
          ) : (
            <div className="text-4xl">{icon}</div>
          )}
          <div className="flex-1 flex flex-col">
            <span className="text-base font-medium leading-6 text-[#71717A]">{category}</span>
            <span className="text-lg font-bold leading-7 text-black">{title}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-2">
          <Progress
            aria-label="Course progress"
            classNames={{
              base: 'w-full',
              track: 'bg-[#E4E4E7]',
              indicator: 'bg-[#006FEE]',
              label: 'text-sm text-[#11181C]',
              value: 'text-sm text-[#11181C]',
            }}
            color="primary"
            label={`${progressPercent}%`}
            maxValue={100}
            radius="full"
            showValueLabel
            size="sm"
            value={progressPercent}
            valueLabel={valueLabel ?? `${progress}/${total}`}
          />
        </div>

        {/* Description and Button */}
        <div className="flex items-end justify-between gap-[14px]">
          <p className="text-sm leading-5 text-[#11181C] flex-1">{description}</p>
          <Button
            as={href ? Link : undefined}
            href={href || undefined}
            scroll={false}
            prefetch
            onClick={onClick}
            color="default"
            radius="sm"
            size="md"
            className="bg-[#3674B5] text-[#ffffff] font-semibold text-lg px-5 py-2.5 rounded-xl hover:bg-[#2d5d94] transition-colors w-fit"
            style={{
              boxShadow: '0px 3px 0px 0px #205994',
            }}
          >
            {buttonText || 'Lanjutkan'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
