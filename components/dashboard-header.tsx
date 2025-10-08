"use client";

import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { SearchRegular } from "@fluentui/react-icons";

interface DashboardHeaderProps {
  searchPlaceholder?: string;
}

export const DashboardHeader = ({ searchPlaceholder = "Cari disini..." }: DashboardHeaderProps) => {
  return (
    <div className="w-full bg-white border-b border-[#E8E8E8] px-[22px] py-4">
      <div className="flex items-center gap-5">
        {/* Search Input */}
        <div className="flex-1">
          <Input
            classNames={{
              base: "w-full",
              input: "text-sm",
              inputWrapper: "h-auto py-2 px-3 border-none shadow-none bg-transparent",
            }}
            placeholder={searchPlaceholder}
            startContent={
              <SearchRegular className="w-[18px] h-[18px] text-default-400 pointer-events-none flex-shrink-0" />
            }
            type="search"
          />
        </div>

        {/* EXP */}
        <div className="flex items-center gap-1">
          <span className="text-2xl font-[800] bg-gradient-to-r from-[#6ADCFC] via-[#5B71E0] to-[#8F5ED7] bg-clip-text text-transparent">
            EXP
          </span>
          <span className="text-2xl font-[800] text-[#006FEE]">126</span>
        </div>

        {/* Trophy */}
        <div className="flex items-center gap-1">
          <div className="w-7 h-7">
            {/* Trophy Icon - using emoji as placeholder */}
            🏆
          </div>
          <span className="text-2xl font-[800] text-[#F5A524]">10</span>
        </div>

        {/* Badge */}
        <div className="flex items-center gap-1">
          <div className="w-7 h-7">
            {/* Ribbon Icon - using emoji as placeholder */}
            🎖️
          </div>
          <span className="text-2xl font-[800] text-[#7828C8]">4</span>
        </div>

        {/* Divider */}
        <Divider orientation="vertical" className="h-auto self-stretch bg-[rgba(17,17,17,0.15)]" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end justify-center gap-0 px-0 py-[1px]">
            <span className="text-lg leading-7 text-[#11181C]">Annisa Isnaini Tsaniya</span>
            <div className="flex items-center justify-center gap-1">
              <div className="w-[18px] h-[18px]">
                {/* Paw Icon - using emoji as placeholder */}
                🐾
              </div>
              <span className="text-sm leading-5 text-[#F5A524]">Pemula</span>
            </div>
          </div>
          <Avatar
            isBordered={false}
            radius="full"
            size="md"
            src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
            className="w-10 h-10"
          />
        </div>
      </div>
    </div>
  );
};

