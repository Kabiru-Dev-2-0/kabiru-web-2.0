'use client';

import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';
import Image from 'next/image';
import Link from 'next/link';

interface LearningPathCardProps {
  nomor: number;
  title: string;
  description: string;
  modules: number;
  imageUrl?: string;
  icon: string;
  buttonText: string;
  progress?: number;
  isStarted?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const LearningPathCard = ({
  nomor,
  title,
  description,
  modules,
  imageUrl,
  icon,
  buttonText,
  progress,
  isStarted = false,
  href,
  onClick,
}: LearningPathCardProps) => {
  const iconIndex = ((nomor - 1) % 3) + 1;
  const imgSrc = `/imageAssets/modul-${iconIndex}.png`;
  return (
    <Card className="w-full border border-[#F4F4F5] shadow-sm bg-white max-w-[30%]" radius="lg">
      <CardBody className="p-4 gap-4">
        {/* Header Section */}
        {/* Image Section */}
        <div className="w-full h-[180px] rounded-lg flex items-center justify-center">
          <Image
            src={imgSrc}
            alt={`Modul ${nomor}`}
            width={180}
            height={180}
            className="object-contain h-full w-auto"
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-col gap-0.5 px-3 pt-3">
              <span className="text-xs font-bold leading-4 text-[#11181C] opacity-60">
                Modul {nomor}
              </span>
              <span className="text-xs font-medium leading-4 text-[#11181C] opacity-50">
                {modules} modul
              </span>
            </div>
            <h3 className="text-2xl font-bold leading-8 text-[#11181C] px-3">{title}</h3>
          </div>
          {/* Footer Section */}
          <div className="flex flex-col items-center justify-between gap-5 px-3 pb-3 pt-0 min-h-[7.7rem] text-wrap w-inherit">
            <p
              className="text-xs font-regular leading-4 text-[#7a7a7a] flex-1 text-justify w-full"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical' as any,
                WebkitLineClamp: 3 as any,
                overflow: 'hidden',
              }}
            >
              {description}
            </p>
            <Button
              as={href ? Link : undefined}
              href={href || undefined}
              scroll={false}
              prefetch
              onClick={onClick}
              color="default"
              radius="sm"
              size="md"
              className="bg-[#3674B5] text-[#ffffff] font-semibold text-lg px-5 py-2.5 rounded-xl hover:bg-[#2d5d94] transition-colors w-full"
              style={{
                boxShadow: '0px 3px 0px 0px #205994',
              }}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
