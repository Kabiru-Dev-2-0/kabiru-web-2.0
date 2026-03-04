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
  const imgSrc = imageUrl || `/imageAssets/modul-${iconIndex}.png`;
  return (
    <Card className="w-full border border-[#F4F4F5] shadow-sm bg-white" radius="lg">
      <CardBody className="p-4 gap-4">
        {/* Header Section */}
        {/* Image Section */}
        <div className="w-full h-[180px] relative rounded-lg overflow-hidden">
          <Image src={imgSrc} alt={`Modul ${nomor}`} fill className="object-cover" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-col gap-0.5 px-3 pt-3">
              <span className="text-xs font-bold leading-4 text-[#11181C] opacity-60">
                Modul {nomor}
              </span>
              <span className="text-xs font-medium leading-4 text-[#11181C] opacity-50">
                {modules} lesson
              </span>
            </div>
            <h3 className="text-2xl font-bold leading-8 text-[#11181C] px-3 min-h-[4.4rem] overflow-hidden">
              {title}
            </h3>
          </div>
          {/* Footer Section */}
          <div className="flex flex-col items-center justify-between gap-5 px-3 pb-3 pt-0 min-h-[7.7rem] text-wrap w-inherit">
            <p
              className="text-s font-regular leading-4 text-[#7a7a7a] flex-1 text-left w-full"
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
