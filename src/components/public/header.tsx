"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16);
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
    setMenuOpen(false);
  }, [pathname]);

  const mobileMenu =
    menuOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="de-public-mobile-menu">
            <button
              type="button"
              className="de-public-mobile-overlay"
              aria-label="Fermer le menu"
              onClick={() => setMenuOpen(false)}
            />
            <nav
              id="public-mobile-drawer"
              className="de-public-mobile-drawer"
              aria-label="Navigation mobile"
            >
              <div className="de-public-mobile-drawer-top">
                <div>
                  <p className="de-public-mobile-drawer-eyebrow">Menu</p>
                  <p className="de-public-mobile-drawer-tagline">
                    Conciergerie automobile
                  </p>
                </div>
                <button
                  type="button"
                  className="de-public-mobile-drawer-close"
                  aria-label="Fermer le menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={22} />
                </button>
              </div>

              <div className="de-public-mobile-drawer-links">
                {NAV_ITEMS.map(({ href, label, exact, index }) => {
                  const active = isActive(pathname, href, exact);

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`de-public-mobile-drawer-link${
                        active ? " de-public-mobile-drawer-link--active" : ""
                      }`}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="de-public-mobile-drawer-index">{index}</span>
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="de-public-mobile-drawer-footer">
                <Link
                  href={PUBLIC_ROUTES.contact}
                  className="de-btn de-btn-primary de-public-mobile-drawer-cta"
                  onClick={() => setMenuOpen(false)}
                >
                  Nous contacter
                  <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden />
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
        className={`de-public-header${scrolled ? " de-public-header--scrolled" : ""}${
          menuOpen ? " de-public-header--menu-open" : ""
        }`}
      >
        <div className="de-public-header-bar de-public-container">
          {!menuOpen && (
            <Link href={PUBLIC_ROUTES.home} className="de-public-header-brand">
              <Image
                src="/logo.png"
                alt="DreΛm Effect"
                width={34}
                height={34}
                className="de-public-header-logo"
                priority
              />
              <span className="de-public-header-name de-wordmark">DreΛm Effect</span>
            </Link>
          )}

          <nav className="de-public-nav-desktop" aria-label="Navigation principale">
          {NAV_ITEMS.map(({ href, label, exact }) => {
            const active = isActive(pathname, href, exact);

            return (
              <Link
                key={href}
                href={href}
                className={`de-public-nav-link${
                  active ? " de-public-nav-link--active" : ""
                }`}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="de-public-header-actions">
          <Link
            href={PUBLIC_ROUTES.contact}
            className="de-public-nav-cta"
          >
            Nous contacter
            <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden />
          </Link>

          <button
            type="button"
            className="de-public-nav-toggle"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-drawer"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
      </header>
      {mobileMenu}
    </>
  );
}
