'use client';

import { Card, CardBody } from '@heroui/card';
import { Avatar } from '@heroui/avatar';
import { Badge } from '@heroui/badge';
import { ArrowUpRegular, ArrowDownRegular } from '@fluentui/react-icons';

interface RankingCardProps {
  rank: number;
  name: string;
  exp: number;
  trend: 'up' | 'down';
  isCurrentUser?: boolean;
}

export const RankingCard = ({
  rank,
  name,
  exp,
  trend,
  isCurrentUser = false,
}: RankingCardProps) => {
  return (
    <Card
      className={`w-full border-2 border-[#E4E4E7] ${
        isCurrentUser
          ? 'bg-[#006FEE] shadow-[0px_10px_10px_-5px_rgba(0,112,243,0.4),0px_20px_25px_-5px_rgba(0,112,243,0.2)]'
          : 'bg-white'
      } ${!isCurrentUser && 'opacity-100'}`}
      radius="lg"
      style={{
        opacity: rank > 6 && !isCurrentUser ? (rank === 7 ? 0.7 : rank === 8 ? 0.5 : 0.3) : 1,
      }}
    >
      <CardBody className="p-0 flex-row items-center">
        {/* Ranking Badge */}
        <div className="flex items-center justify-center p-[14px] bg-white">
          <Badge
            content={rank.toString()}
            size="lg"
            color="default"
            variant={isCurrentUser ? 'solid' : 'flat'}
            classNames={{
              badge: `${
                isCurrentUser
                  ? 'bg-[#E6F1FE] text-black border-2 border-[#F5A524]'
                  : 'bg-[rgba(212,212,216,0.4)] text-[#71717A]'
              } w-[28px] h-[28px] flex items-center justify-center`,
            }}
          />
        </div>

        {/* User Info */}
        <div className="flex-1 flex items-center justify-between gap-[32px] p-[8px_24px]">
          <div className="flex items-center gap-[24px]">
            <Avatar
              src="/api/placeholder/40/40"
              size="md"
              radius="full"
              classNames={{
                base: 'w-[40px] h-[40px]',
              }}
            />
            <span className={`text-lg ${isCurrentUser ? 'text-white' : 'text-[#11181C]'}`}>
              {name}
            </span>
          </div>

          {/* EXP & Trend */}
          <div className="flex items-center gap-[32px]">
            <div className="flex items-center gap-[8px]">
              <span
                className={`text-2xl font-extrabold ${
                  isCurrentUser ? 'text-white' : 'text-[#006FEE]'
                }`}
              >
                {exp}
              </span>
              <span
                className={`text-2xl font-extrabold ${
                  isCurrentUser ? 'text-[rgba(255,255,255,0.6)]' : 'text-[#D4D4D8]'
                }`}
              >
                EXP
              </span>
            </div>
            {trend === 'up' ? (
              <ArrowUpRegular className="w-[24px] h-[24px] text-[#17C964]" />
            ) : (
              <ArrowDownRegular className="w-[24px] h-[24px] text-[#F31260]" />
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
