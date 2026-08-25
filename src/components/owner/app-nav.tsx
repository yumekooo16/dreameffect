"use client";

import {
  Home,
  User,
  MessageCircle,
} from "lucide-react";
import AppBottomNav from "@/src/components/app/bottom-nav";
import { WHATSAPP_URL } from "@/src/lib/constants";

const OWNER_NAV = [
  {
    href: "/espace-proprietaire",
    label: "Accueil",
    icon: Home,
    match: (path: string) =>
      path === "/espace-proprietaire" ||
      path.startsWith("/espace-proprietaire/vehicule"),
  },
  {
    href: WHATSAPP_URL,
    label: "Contact",
    icon: MessageCircle,
    external: true,
  },
  {
    href: "/espace-proprietaire/profil",
    label: "Profil",
    icon: User,
    match: (path: string) => path.startsWith("/espace-proprietaire/profil"),
  },
] as const;

export default function OwnerAppNav() {
  return <AppBottomNav items={[...OWNER_NAV]} />;
}
