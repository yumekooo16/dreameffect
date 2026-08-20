"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONTACT_WHATSAPP_URL } from "@/src/lib/public/contact";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

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

export default function PublicHeader() {
  const pathname = usePathname();

  return (
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
  );
}
