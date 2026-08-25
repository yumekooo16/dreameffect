"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/src/components/auth/sign-out-button";
import NotificationsBell from "./notifications-bell";

function titleForPath(pathname: string) {
  if (pathname.startsWith("/espace-proprietaire/profil")) return "Mon profil";
  if (pathname.startsWith("/espace-proprietaire/vehicule")) return "Véhicule";
  return "Espace propriétaire";
}

export default function OwnerHeader() {
  const pathname = usePathname();
  const pageTitle = titleForPath(pathname);

  return (
    <header className="de-header de-app-header">
      <div className="de-app-header-bar">
        <Link
          href="/espace-proprietaire"
          className="de-app-header-brand"
          aria-label="Espace propriétaire"
        >
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
            <span className="de-app-header-eyebrow">DreamEffect</span>
            <span className="de-app-header-title">{pageTitle}</span>
          </div>
        </Link>

        <div className="de-app-header-actions">
          <NotificationsBell />
          <SignOutButton className="de-btn de-btn-ghost de-app-header-signout text-xs" />
        </div>
      </div>
    </header>
  );
}
