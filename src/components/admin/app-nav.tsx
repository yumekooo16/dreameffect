"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  Wallet,
  Ellipsis,
  Users,
  MessageSquare,
  Wrench,
  FileText,
  X,
  LogOut,
} from "lucide-react";
import AppBottomNav from "@/src/components/app/bottom-nav";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";

const PRIMARY = [
  {
    href: "/admin",
    label: "Accueil",
    icon: LayoutDashboard,
    match: (path: string) => path === "/admin",
  },
  {
    href: "/admin/vehicules",
    label: "Véhicules",
    icon: Car,
    match: (path: string) => path.startsWith("/admin/vehicules"),
  },
  {
    href: "/admin/reservations",
    label: "Résas",
    icon: CalendarDays,
    match: (path: string) => path.startsWith("/admin/reservations"),
  },
  {
    href: "/admin/finance",
    label: "Finance",
    icon: Wallet,
    match: (path: string) => path.startsWith("/admin/finance"),
  },
] as const;

const MORE_ITEMS = [
  {
    href: "/admin/proprietaires",
    label: "Propriétaires",
    icon: Users,
    match: (path: string) => path.startsWith("/admin/proprietaires"),
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
    href: "/admin/documents",
    label: "Documents",
    icon: FileText,
    match: (path: string) => path.startsWith("/admin/documents"),
  },
] as const;

export default function AdminAppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = MORE_ITEMS.some((item) => item.match(pathname));

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {moreOpen && (
        <div className="de-app-sheet" role="dialog" aria-modal="true" aria-label="Plus">
          <button
            type="button"
            className="de-app-sheet__backdrop"
            aria-label="Fermer"
            onClick={() => setMoreOpen(false)}
          />
          <div className="de-app-sheet__panel">
            <div className="de-app-sheet__header">
              <p className="de-app-sheet__title">Plus</p>
              <button
                type="button"
                className="de-app-sheet__close"
                onClick={() => setMoreOpen(false)}
                aria-label="Fermer"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>
            <ul className="de-app-sheet__list">
              {MORE_ITEMS.map(({ href, label, icon: Icon, match }) => {
                const active = match(pathname);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`de-app-sheet__item${active ? " de-app-sheet__item--active" : ""}`}
                      onClick={() => setMoreOpen(false)}
                    >
                      <Icon size={18} strokeWidth={1.75} aria-hidden />
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  className="de-app-sheet__item de-app-sheet__item--danger"
                  onClick={handleSignOut}
                >
                  <LogOut size={18} strokeWidth={1.75} aria-hidden />
                  <span>Déconnexion</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      <AppBottomNav
        items={[...PRIMARY]}
        trailing={
          <button
            type="button"
            className={`de-app-dock-link${moreActive || moreOpen ? " de-app-dock-link--active" : ""}`}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            onClick={() => setMoreOpen((open) => !open)}
          >
            <Ellipsis size={20} strokeWidth={1.75} aria-hidden />
            <span>Plus</span>
          </button>
        }
      />
    </>
  );
}
