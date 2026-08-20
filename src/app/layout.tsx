import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ServiceWorkerRegister } from "@/src/components/pwa/service-worker-register";
import { StandaloneRedirect } from "@/src/components/pwa/standalone-redirect";
import { pwaConfig } from "@/src/lib/pwa/config";
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from "@/src/lib/public/seo";
import { SITE_NAME, SITE_URL } from "@/src/lib/public/site";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: pwaConfig.themeColor,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Location véhicules haut de gamme`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: pwaConfig.name,
  metadataBase: new URL(SITE_URL),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        <StandaloneRedirect />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
