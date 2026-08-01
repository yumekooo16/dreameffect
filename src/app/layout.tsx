import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { ServiceWorkerRegister } from "@/src/components/pwa/service-worker-register";
import { pwaConfig } from "@/src/lib/pwa/config";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: pwaConfig.themeColor,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: pwaConfig.name,
    template: `%s | ${pwaConfig.shortName}`,
  },
  description:
    "DreamEffect — location de véhicules haut de gamme et gestion pour propriétaires. Réservation simple, suivi rigoureux, véhicules entretenus.",
  applicationName: pwaConfig.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: pwaConfig.shortName,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: pwaConfig.icons.sizes.favicon32,
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: pwaConfig.icons.sizes["192"],
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: pwaConfig.icons.sizes["512"],
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: pwaConfig.icons.sizes.apple,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className="bg-background text-foreground antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
