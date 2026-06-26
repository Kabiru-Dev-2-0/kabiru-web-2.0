"use client";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center flex-wrap text-white">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center">
            {/* ITEM */}
            {item.href && !isLast ? (
              <a
                href={item.href}
                className="
                  text-white/70
                  hover:text-white
                  transition-colors
                  text-sm md:text-base
                  font-normal
                "
              >
                {item.label}
              </a>
            ) : (
              <span
                className={`
                  text-sm md:text-base
                  ${
                    isLast
                      ? "font-extrabold text-white"
                      : "font-semibold text-white/70"
                  }
                `}
              >
                {item.label}
              </span>
            )}

            {/* SEPARATOR */}
            {!isLast && (
              <span className="mx-2 md:mx-3 text-white/80 text-sm md:text-base">
                /
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}