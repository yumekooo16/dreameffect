"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import {
  CONTACT_PHONE,
  CONTACT_WHATSAPP_URL,
  telHref,
} from "@/src/lib/public/contact";
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

export default function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const overlay =
    menuOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="de-maison-overlay">
            <button
              type="button"
              className="de-maison-overlay-backdrop"
              aria-label="Fermer le menu"
              tabIndex={-1}
              onClick={() => setMenuOpen(false)}
            />
            <nav
              id="public-mobile-drawer"
              className="de-maison-drawer"
              aria-label="Navigation mobile"
            >
              {NAV_ITEMS.map(({ href, label, exact }) => {
                const active = isActive(pathname, href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`de-maison-drawer-link${
                      active ? " de-maison-drawer-link--active" : ""
                    }`}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                  >
                    {label}
                  </Link>
                );
              })}
              <div className="de-maison-drawer-foot">
                <Link
                  href={CONTACT_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="de-btn de-btn-primary"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Ouvrir WhatsApp"
                >
                  <MessageCircle size={18} strokeWidth={1.75} aria-hidden />
                  WhatsApp
                </Link>
                <Link
                  href={telHref()}
                  className="de-btn de-btn-ghost"
                  onClick={() => setMenuOpen(false)}
                  aria-label={`Appeler le ${CONTACT_PHONE}`}
                >
                  <Phone size={18} strokeWidth={1.75} aria-hidden />
                  {CONTACT_PHONE}
                </Link>
              </div>
            </nav>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div className="de-maison-top">
        <Link href={PUBLIC_ROUTES.home} className="de-maison-top-brand">
          <Image src="/logo.png" alt={SITE_NAME} width={28} height={28} priority />
          <span>{SITE_NAME}</span>
        </Link>
        <button
          type="button"
          className="de-maison-menu-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="public-mobile-drawer"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span aria-hidden>{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      <nav className="de-dock" aria-label="Navigation principale">
        <div className="de-dock-inner">
          <Link href={PUBLIC_ROUTES.home} className="de-dock-brand">
            <Image src="/logo.png" alt="" width={26} height={26} />
            <span>{SITE_NAME}</span>
          </Link>

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

      {overlay}
    </>
  );
}
