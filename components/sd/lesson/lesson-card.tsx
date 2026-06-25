"use client";

import Link from "next/link";

type Props = {
  nomor: number;
  title: string;
  description: string;
  image?: string;
  href: string;
};

export default function LessonCard({
  nomor,
  title,
  description,
  image,
  href,
}: Props) {
  return (
    <Link href={href}>
      <div
        className="
        w-[272px]
        md:w-[280px]
        lg:w-[300px]
        rounded-[28px]
        bg-slate-50
        overflow-hidden
        flex-shrink-0
        transition-all
        duration-300
        cursor-pointer
        group
        md:h-[382px]
      "
      >
        {/* ================= IMAGE ================= */}
        <div
          className="
          relative
          h-full
          md:h-[240px]
          overflow-hidden
          bg-[#EFEFEF]
        "
        >
          <img
            src={image || "/placeholder.png"}
            alt={title}
            className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-300
            ease-out
            group-hover:scale-110
          "
          />
        </div>

        {/* ================= CONTENT ================= */}
        <div className="px-5 py-5">
          <div className="flex items-start gap-4">
            {/* NUMBER */}
            <div
              className="
              flex-shrink-0
              w-[32px]
              h-[32px]
              rounded-full
              bg-gradient-to-br
              from-[#7BE495]
              to-[#31C96B]
              flex
              items-center
              justify-center
              text-white
              font-black
              text-[18px]
            "
            >
              {nomor}
            </div>

            {/* TEXT */}
            <div className="flex-1 min-w-0">
              {/* TITLE */}
              <h3
                className="
                text-[#1E293B]
                font-black
                uppercase
                text-[18px]
                leading-[1.2]
                tracking-normal
                line-clamp-2
              "
                style={{
                  fontFamily: "var(--font-lilita-one)",
                }}
              >
                {title}
              </h3>

              {/* DESCRIPTION */}
              <p
                className="
                mt-2
                text-[#667085]
                text-[14px]
                leading-[1.35]
                tracking-[0.05]
                font-normal
                line-clamp-3
              "
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}