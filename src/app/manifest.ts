import type { MetadataRoute } from "next";
import { pwaConfig } from "@/src/lib/pwa/config";

export default function manifest(): MetadataRoute.Manifest {
  const { icons } = pwaConfig;

  return {
    id: pwaConfig.manifestId,
    name: pwaConfig.name,
    short_name: pwaConfig.shortName,
    description: pwaConfig.description,
    start_url: pwaConfig.startUrl,
    scope: pwaConfig.scope,
    display: pwaConfig.display,
    orientation: pwaConfig.orientation,
    lang: pwaConfig.lang,
    dir: pwaConfig.dir,
    categories: [...pwaConfig.categories],
    background_color: pwaConfig.backgroundColor,
    theme_color: pwaConfig.themeColor,
    icons: [
      {
        src: icons.sizes["192"],
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: icons.sizes["512"],
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: icons.sizes.maskable,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: icons.sizes.apple,
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
