"use client";

import Image from "next/image";
import SignOutButton from "@/src/components/auth/sign-out-button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Car,
  CalendarDays,
  Wrench,
  FileText,
  Wallet,
  MessageSquare,
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
    href: "/admin/contacts",
    label: "Contacts",
    icon: MessageSquare,
    match: (path: string) => path.startsWith("/admin/contacts"),
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

function titleForPath(pathname: string) {
  const match = NAV_ITEMS.find((item) => item.match(pathname));
  return match?.label ?? "Administration";
}

export default function AdminHeader() {
  const pathname = usePathname();
  const pageTitle = titleForPath(pathname);

  return (
    <header className="de-header de-app-header">
      <div className="de-app-header-bar">
        <Link href="/admin" className="de-app-header-brand" aria-label="Administration">
          <Image
            src="/logo-de.png"
            alt=""
            width={36}
            height={36}
            className="de-app-header-logo"
            priority
            unoptimized
          />
          <div className="de-app-header-titles">
            <span className="de-app-header-eyebrow">Administration</span>
            <span className="de-app-header-title">{pageTitle}</span>
          </div>
        </Link>

        <div className="de-app-header-actions">
          <NotificationsBell />
          <SignOutButton className="de-btn de-btn-ghost de-app-header-signout text-xs" />
        </div>
      </div>

      <nav className="de-app-header-tabs" aria-label="Sections admin">
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
