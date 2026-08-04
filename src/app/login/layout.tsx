import type { Metadata } from "next";
import { buildPageMetadata } from "@/src/lib/public/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Connexion",
  description: "Connexion à l'espace DreamEffect (administration et propriétaires).",
  path: "/login",
  noIndex: true,
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
