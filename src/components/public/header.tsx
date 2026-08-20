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
  { href: PUBLIC_ROUTES.home, label: "Accueil", exact: true, index: "01" },
  { href: PUBLIC_ROUTES.vehicles, label: "Véhicules", exact: false, index: "02" },
  { href: PUBLIC_ROUTES.owners, label: "Propriétaires", exact: false, index: "03" },
  { href: PUBLIC_ROUTES.contact, label: "Contact", exact: false, index: "04" },
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
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const overlay =
    menuOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="de-atelier-overlay">
            <button
              type="button"
              className="de-atelier-overlay-backdrop"
              aria-label="Fermer le menu"
              tabIndex={-1}
              onClick={() => setMenuOpen(false)}
            />
            <nav
              id="public-mobile-drawer"
              className="de-atelier-drawer"
              aria-label="Navigation mobile"
            >
              {NAV_ITEMS.map(({ href, label, exact, index }) => {
                const active = isActive(pathname, href, exact);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`de-atelier-drawer-link${
                      active ? " de-atelier-drawer-link--active" : ""
                    }`}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="de-atelier-drawer-num">{index}</span>
                    <span>{label}</span>
                  </Link>
                );
              })}

              <div className="de-atelier-drawer-foot">
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
      <aside className="de-rail" aria-label="Navigation principale">
        <Link href={PUBLIC_ROUTES.home} className="de-rail-brand">
          <Image
            src="/logo.png"
            alt={SITE_NAME}
            width={36}
            height={36}
            className="de-rail-logo"
            priority
          />
          <span className="de-rail-name">{SITE_NAME}</span>
        </Link>

        <nav className="de-rail-nav">
          {NAV_ITEMS.map(({ href, label, exact, index }) => {
            const active = isActive(pathname, href, exact);

            return (
              <Link
                key={href}
                href={href}
                className={`de-rail-link${active ? " de-rail-link--active" : ""}`}
                aria-current={active ? "page" : undefined}
                title={label}
              >
                <span className="de-rail-num">{index}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="de-rail-foot">
          <Link href={PUBLIC_ROUTES.contact} className="de-rail-contact">
            Contact
          </Link>
        </div>
      </aside>

      <div className="de-mobile-bar">
        <Link href={PUBLIC_ROUTES.home} className="de-mobile-brand">
          <Image
            src="/logo.png"
            alt={SITE_NAME}
            width={28}
            height={28}
            className="de-rail-logo"
            priority
          />
          <span>{SITE_NAME}</span>
        </Link>

        <button
          type="button"
          className={`de-mobile-menu-btn${menuOpen ? " is-open" : ""}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="public-mobile-drawer"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span className="de-menu-lines" aria-hidden>
            <span />
            <span />
          </span>
          Menu
        </button>
      </div>

      {overlay}
    </>
  );
}
