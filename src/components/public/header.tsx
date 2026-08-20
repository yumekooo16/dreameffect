"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONTACT_WHATSAPP_URL } from "@/src/lib/public/contact";
import { PUBLIC_ROUTES, SITE_NAME } from "@/src/lib/public/site";

const NAV_ITEMS = [
  { href: PUBLIC_ROUTES.home, label: "Accueil", exact: true },
  { href: PUBLIC_ROUTES.vehicles, label: "Flotte", exact: false },
  { href: PUBLIC_ROUTES.owners, label: "Propriétaires", exact: false },
  { href: PUBLIC_ROUTES.contact, label: "Contact", exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function TopHeader() {
  return (
    <header className="de-maison-header">
      <div className="de-maison-header-inner">
        <Link
          href={PUBLIC_ROUTES.home}
          className="de-maison-header-brand"
          aria-label={`${SITE_NAME} — Accueil`}
        >
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="de-maison-header-logo"
            priority
          />
        </Link>
      </div>
    </header>
  );
}

export default function PublicHeader() {
  const pathname = usePathname();
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  const header = <TopHeader />;

  return (
    <>
      {/* Header sur body = position:fixed ancrée au viewport, hors scroll page */}
      {portalRoot ? createPortal(header, portalRoot) : header}

      <nav className="de-dock" aria-label="Navigation principale">
        <div className="de-dock-inner">
          {NAV_ITEMS.map(({ href, label, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`de-dock-link${active ? " de-dock-link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}

          <Link
            href={CONTACT_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="de-dock-link de-dock-link--cta"
            aria-label="Ouvrir WhatsApp"
          >
            WhatsApp
          </Link>
        </div>
      </nav>
    </>
  );
}
