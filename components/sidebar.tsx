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
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';

export const Sidebar = () => {
  const pathname = usePathname();
  const [modulDipilih, setModulDipilih] = useState<number | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState<boolean>(false);

  useEffect(() => {
    const supabase = createClient();
    try {
      const ls = typeof window !== 'undefined' ? localStorage.getItem('aizone.modulDipilih') : null;
      if (ls) {
        const n = Number(ls);
        if (!Number.isNaN(n)) setModulDipilih(n);
      }
    } catch {}

    const fetch = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: penggunaData } = await supabase
        .from('penggunas')
        .select('id')
        .eq('uuid', user.id)
        .single();
      if (!penggunaData) return;

      const { data } = await supabase
        .from('data_penggunas')
        .select('modul_dipilih')
        .eq('id_pengguna', penggunaData.id)
        .single();

      const id = data?.modul_dipilih;
      if (typeof id === 'number') {
        setModulDipilih(id);
        try {
          localStorage.setItem('aizone.modulDipilih', String(id));
        } catch {}
      }
    };
    fetch();
  }, []);

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
          <img
            src="/imageAssets/LogoApp.png"
            alt="AIZONE Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col justify-between flex-1 gap-[22px]">
        {/* Main Navigation */}
        <div className="flex flex-col gap-[14px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const href =
              item.label === 'Belajar' && modulDipilih
                ? `/belajar/${modulDipilih}`
                : item.label === 'Eksplorasi' && modulDipilih
                  ? `/eksplorasi`
                  : item.href;
            const isActive =
              item.label === 'Belajar'
                ? pathname.startsWith('/belajar')
                : item.label === 'Eksplorasi'
                  ? pathname.startsWith('/eksplorasi')
                  : pathname === href;

            return (
              <Link key={item.href} href={href} prefetch scroll={false}>
                <Button
                  style={{
                    boxShadow: isActive ? '0px 3px 0px 0px #205994' : 'none',
                  }}
                  className={
                    isActive
                      ? 'w-full justify-start gap-2 h-auto py-0 px-5 min-h-[48px] bg-[#3674B5] text-[#ffffff] font-semibold text-lg rounded-xl'
                      : 'w-full justify-start gap-2 h-auto py-0 px-5 min-h-[48px] bg-white text-[#777777] font-regular text-lg rounded-xl'
                  }
                  size="md"
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
            if (item.danger) {
              return (
                <Button
                  key={item.href}
                  className={
                    'w-full justify-start gap-2 h-auto py-0 px-5 min-h-[48px] text-[#ff0000] font-semibold text-lg rounded-xl'
                  }
                  variant="light"
                  size="lg"
                  radius="sm"
                  startContent={<img src="/imageAssets/startContent.svg" alt="🤵‍♂️" />}
                  onClick={() => setIsLogoutOpen(true)}
                >
                  <span className="text-lg">{item.label}</span>
                </Button>
              );
            }

            return (
              <Link key={item.href} href={item.href} prefetch scroll={false}>
                <Button
                  className={
                    'w-full justify-start gap-2 h-auto py-0 px-5 min-h-[48px] text-[#777777] font-regular text-lg rounded-xl'
                  }
                  variant="light"
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
      {/* Logout Confirmation Modal */}
      <Modal isOpen={isLogoutOpen} onOpenChange={setIsLogoutOpen} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Konfirmasi Keluar Akun</ModalHeader>
              <ModalBody>
                <p className="text-[#11181C]">Anda yakin ingin keluar dari akun?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="danger"
                  onPress={async () => {
                    const supabase = createClient();
                    try {
                      await supabase.auth.signOut();
                    } catch {}
                    try {
                      const keys = [
                        'aizone.userName',
                        'aizone.exp',
                        'aizone.trophy',
                        'aizone.avatar',
                        'aizone.journeyLabel',
                        'aizone.journeyValue',
                        'aizone.rank',
                        'aizone.missions',
                        'aizone.modulDipilih',
                        'aizone.leaderboard.rows',
                        'aizone.leaderboard.currentUserId',
                      ];
                      keys.forEach((k) => {
                        try {
                          localStorage.removeItem(k);
                        } catch {}
                      });
                    } catch {}
                    try {
                      onClose();
                    } catch {}
                    try {
                      window.location.href = '/login';
                    } catch {}
                  }}
                >
                  Keluar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
