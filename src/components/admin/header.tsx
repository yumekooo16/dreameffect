"use client";

import Image from "next/image";
import SignOutButton from "@/src/components/auth/sign-out-button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  Users,
  Car,
  CalendarDays,
  Wrench,
  FileText,
  Wallet,
} from "lucide-react";
import NotificationsBell from "@/src/components/owner/notifications-bell";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    match: (path: string) => path === "/admin",
  },
  {
    href: "/admin/proprietaires",
    label: "Propriétaires",
    icon: Users,
    match: (path: string) => path.startsWith("/admin/proprietaires"),
  },
  {
    href: "/admin/vehicules",
    label: "Véhicules",
    icon: Car,
    match: (path: string) => path.startsWith("/admin/vehicules"),
  },
  {
    href: "/admin/reservations",
    label: "Réservations",
    icon: CalendarDays,
    match: (path: string) => path.startsWith("/admin/reservations"),
  },
  {
    href: "/admin/maintenance",
    label: "Maintenance",
    icon: Wrench,
    match: (path: string) => path.startsWith("/admin/maintenance"),
  },
  {
    href: "/admin/finance",
    label: "Finance",
    icon: Wallet,
    match: (path: string) => path.startsWith("/admin/finance"),
  },
  {
    href: "/admin/documents",
    label: "Documents",
    icon: FileText,
    match: (path: string) => path.startsWith("/admin/documents"),
  },
];

export default function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="de-header space-y-3">
      <div className="flex items-center justify-between gap-3 py-3 sm:py-4">
        <Link
          href="/admin"
          className="group flex min-w-0 items-center gap-2 sm:gap-3"
        >
          <Image
            src="/logo.png"
            alt="DreΛm Effect"
            width={40}
            height={40}
            className="shrink-0 rounded-xl object-contain transition group-hover:opacity-90"
            priority
          />
          <div className="min-w-0">
            <span className="de-display block truncate text-sm tracking-tight text-foreground">
              DreΛm Effect
            </span>
            <span className="text-xs de-muted">Administration</span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-[var(--blue-border)] px-3 py-1 text-xs font-medium text-[var(--blue-soft)] sm:inline-flex">
            <Shield size={14} strokeWidth={1.75} />
            Admin
          </span>
          <SignOutButton className="de-btn de-btn-ghost hidden text-xs sm:inline-flex" />
          <NotificationsBell />
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto pb-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);

          return (
            <Link
              key={href}
              href={href}
              className={`de-btn de-btn-tab inline-flex shrink-0 items-center gap-2 ${
                active ? "de-btn-tab--active" : "de-btn-tab--inactive"
              }`}
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
