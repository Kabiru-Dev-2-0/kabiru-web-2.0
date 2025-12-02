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
  return (
    <Card className="w-full border border-[#F4F4F5] shadow-sm bg-white" radius="lg">
      <CardBody className="p-4 gap-4">
        {/* Header Section */}
        {/* Image Section */}
        <div className="w-full h-[230px] bg-gradient-to-br from-blue-400 to-teal-500 rounded-lg flex items-center justify-center text-8xl">
          {icon}
        </div>
        <div className="flex flex-col gap-0.5 px-3 pt-3">
          <span className="text-xs font-bold leading-4 text-[#11181C] opacity-60">
            Modul {nomor}
          </span>
          <span className="text-xs font-medium leading-4 text-[#11181C] opacity-50">
            {modules} modul
          </span>
        </div>

        <h3 className="text-2xl font-bold leading-8 text-[#11181C] px-3">{title}</h3>

        {/* Footer Section */}
        <div className="flex flex-col items-center justify-between gap-2 px-3 pb-3 pt-0">
          <p className="text-xs font-medium leading-4 text-[#11181C] flex-1">{description}</p>
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
      </CardBody>
    </Card>
  );
};
