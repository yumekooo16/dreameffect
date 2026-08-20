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
  { href: PUBLIC_ROUTES.vehicles, label: "Véhicules", exact: false },
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 48);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <div className="de-motion-overlay">
            <button
              type="button"
              className="de-motion-overlay-backdrop"
              aria-label="Fermer le menu"
              tabIndex={-1}
              onClick={() => setMenuOpen(false)}
            />
            <nav id="public-mobile-drawer" className="de-motion-drawer" aria-label="Navigation mobile">
              {NAV_ITEMS.map(({ href, label, exact }) => {
                const active = isActive(pathname, href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`de-motion-drawer-link${active ? " de-motion-drawer-link--active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                  >
                    {label}
                  </Link>
                );
              })}
              <div className="de-motion-drawer-foot">
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
                <Link href={telHref()} className="de-btn de-btn-ghost" onClick={() => setMenuOpen(false)}>
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
      <header
        className={`de-motion-header${scrolled ? " de-motion-header--scrolled" : ""}${
          menuOpen ? " de-motion-header--open" : ""
        }`}
      >
        <div className="de-motion-header-inner de-public-container">
          <Link href={PUBLIC_ROUTES.home} className="de-motion-brand">
            <Image src="/logo.png" alt={SITE_NAME} width={32} height={32} priority />
            <span>{SITE_NAME}</span>
          </Link>

          <nav className="de-motion-nav" aria-label="Navigation principale">
            {NAV_ITEMS.map(({ href, label, exact }) => {
              const active = isActive(pathname, href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`de-motion-nav-link${active ? " de-motion-nav-link--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="de-motion-header-actions">
            <Link href={PUBLIC_ROUTES.contact} className="de-motion-header-cta">
              Contact
            </Link>
            <button
              type="button"
              className={`de-motion-menu-btn${menuOpen ? " is-open" : ""}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="public-mobile-drawer"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <span className="de-motion-menu-icon" aria-hidden>
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>
      {overlay}
    </>
  );
}
