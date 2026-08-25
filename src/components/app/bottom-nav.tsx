"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
  external?: boolean;
};

type Props = {
  items: AppNavItem[];
  /** Slot optionnel à droite (ex. bouton « Plus ») */
  trailing?: React.ReactNode;
};

function isActive(pathname: string, item: AppNavItem) {
  if (item.match) return item.match(pathname);
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function AppBottomNav({ items, trailing }: Props) {
  const pathname = usePathname();

  return (
    <nav className="de-app-dock" aria-label="Navigation principale">
      <div className="de-app-dock-inner">
        {items.map((item) => {
          const Icon = item.icon;
          const active = !item.external && isActive(pathname, item);
          const className = `de-app-dock-link${active ? " de-app-dock-link--active" : ""}`;

          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                <Icon size={20} strokeWidth={1.75} aria-hidden />
                <span>{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={className}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={1.75} aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {trailing}
      </div>
    </nav>
  );
}
