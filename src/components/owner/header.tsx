"use client";

import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import SignOutButton from "@/src/components/auth/sign-out-button";
import NotificationsBell from "./notifications-bell";
import { WHATSAPP_URL } from "@/src/lib/constants";

export default function OwnerHeader() {
  return (
    <header className="de-header">
      <div className="flex items-center justify-between gap-3 py-3 sm:py-4">
        <Link
          href="/espace-proprietaire"
          className="flex min-w-0 items-center gap-2 sm:gap-3 group"
        >
          <Image
            src="/logo.png"
            alt="DreamEffect"
            width={40}
            height={40}
            className="shrink-0 rounded-xl object-contain transition group-hover:opacity-90"
            priority
          />
          <div className="min-w-0">
            <span className="de-display block truncate text-sm tracking-tight text-foreground">
              DreamEffect
            </span>
            <span className="text-xs de-muted">Espace propriétaire</span>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="de-btn de-btn-ghost hidden sm:inline-flex"
          >
            Contact
          </a>
          <Link
            href="/espace-proprietaire/profil"
            aria-label="Mon profil"
            className="de-notifications-trigger flex h-10 w-10 items-center justify-center"
          >
            <User size={18} strokeWidth={1.75} />
          </Link>
          <NotificationsBell />
          <SignOutButton className="de-btn de-btn-ghost hidden text-xs sm:inline-flex" />
        </div>
      </div>
    </header>
  );
}
