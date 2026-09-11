import type { NextConfig } from "next";

function getSupabaseHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;

  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  /** Inclure le PDF avocat officiel pour le remplissage serveur. */
  outputFileTracingIncludes: {
    "/admin/reservations/[id]": [
      "./contracts/templates/contrat-location-dreameffect-v2.pdf",
    ],
    "/*": ["./contracts/templates/contrat-location-dreameffect-v2.pdf"],
  },
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname }]
        : []),
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["recharts", "react-day-picker"],
    /** Doit couvrir les uploads photo admin (FormData + middleware/proxy). */
    proxyClientMaxBodySize: "10mb",
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  /** Redirections permanentes — ajouter ici les anciennes URLs au fil du temps. */
  async redirects() {
    return [
      {
        source: "/vehicules/bmw-serie-2-gran-coupe-de8ce43a",
        destination: "/vehicules/bmw-serie-2-gran-coupe",
        permanent: true,
      },
      {
        source: "/cookies",
        destination: "/politique-de-confidentialite",
        permanent: true,
      },
      // Auth : ne PAS rediriger apex → www. Les invitations Supabase
      // renvoient #access_token=… ; une 308/301 supprime le fragment et
      // Safari/iOS échoue (« impossible d'ouvrir la page ») ou perd la session.
      {
        source: "/",
        has: [{ type: "host", value: "dreameffect.fr" }],
        destination: "https://www.dreameffect.fr/",
        permanent: true,
      },
      {
        source: "/:path((?!auth/).+)",
        has: [{ type: "host", value: "dreameffect.fr" }],
        destination: "https://www.dreameffect.fr/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
