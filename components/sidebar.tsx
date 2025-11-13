'use client';

import { Button } from '@heroui/button';
import {
  AppsColor,
  BookOpenLightbulbColor,
  Diversity28Color,
  PuzzlePieceColor,
  TrophyColor,
  SettingsColor,
  ShareIosColor,
} from '@fluentui/react-icons';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: AppsColor,
    },
    {
      label: 'Belajar',
      href: '/belajar',
      icon: BookOpenLightbulbColor,
    },
    {
      label: 'Eksplorasi',
      href: '/eksplorasi',
      icon: Diversity28Color,
    },
    {
      label: 'Tantangan',
      href: '/tantangan',
      icon: PuzzlePieceColor,
    },
    {
      label: 'Papan Peringkat',
      href: '/peringkat',
      icon: TrophyColor,
    },
  ];

  const bottomNavItems = [
    {
      label: 'Pengaturan',
      href: '/pengaturan',
      icon: SettingsColor,
    },
    {
      label: 'Keluar Akun',
      href: '/logout',
      icon: ShareIosColor,
      danger: true,
    },
  ];

  return (
    <div className="h-full w-[306px] bg-white border-r border-[#E8E8E8] flex flex-col gap-8 p-6">
      {/* Logo */}
      <div className="flex justify-between items-center gap-[138px]">
        <div className="w-[140px] h-[42px] relative">
          {/* Placeholder for logo - you can replace with actual logo */}
          <div className="text-2xl font-bold text-primary">AIZONE</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col justify-between flex-1 gap-[22px]">
        {/* Main Navigation */}
        <div className="flex flex-col gap-[14px]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} prefetch scroll={false}>
                <Button
                  className={`w-full justify-start gap-2 h-auto py-0 px-5 min-h-[48px]`}
                  variant={isActive ? 'shadow' : 'light'}
                  color="primary"
                  size="lg"
                  radius="sm"
                  startContent={<Icon className="w-7 h-7" />}
                >
                  <span className="text-lg">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col gap-[14px]">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} prefetch scroll={false}>
                <Button
                  className="w-full justify-start gap-2 h-auto py-0 px-5 min-h-[48px]"
                  variant="light"
                  color={item.danger ? 'danger' : 'primary'}
                  size="lg"
                  radius="sm"
                  startContent={<Icon className="w-7 h-7" />}
                >
                  <span className="text-lg">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
