/**
 * Génère les icônes PWA à partir de public/logo.png.
 * Usage : npm run generate-pwa-icons
 *
 * Pour remplacer les icônes :
 * 1. Remplacer public/logo.png (ou public/icons/source/logo.png)
 * 2. Relancer ce script
 */
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public");
const SOURCE = path.join(ROOT, "logo.png");
const ICONS_DIR = path.join(ROOT, "icons");
const SOURCE_DIR = path.join(ICONS_DIR, "source");

/** Fond sombre premium — aligné sur --bg (#09090b) */
const BACKGROUND = { r: 9, g: 9, b: 11, alpha: 1 };

type IconSpec = {
  name: string;
  size: number;
  maskable?: boolean;
};

const ICONS: IconSpec[] = [
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "maskable-icon-512x512.png", size: 512, maskable: true },
];

async function generateIcon(spec: IconSpec) {
  const output = path.join(ICONS_DIR, spec.name);

  if (spec.maskable) {
    const innerSize = Math.round(spec.size * 0.8);
    const padding = Math.round((spec.size - innerSize) / 2);
    const resized = await sharp(SOURCE)
      .resize(innerSize, innerSize, {
        fit: "contain",
        background: BACKGROUND,
      })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: spec.size,
        height: spec.size,
        channels: 4,
        background: BACKGROUND,
      },
    })
      .composite([{ input: resized, top: padding, left: padding }])
      .png()
      .toFile(output);
    return;
  }

  await sharp(SOURCE)
    .resize(spec.size, spec.size, {
      fit: "contain",
      background: BACKGROUND,
    })
    .png()
    .toFile(output);
}

async function main() {
  await mkdir(SOURCE_DIR, { recursive: true });
  await mkdir(ICONS_DIR, { recursive: true });
  await copyFile(SOURCE, path.join(SOURCE_DIR, "logo.png"));

  for (const spec of ICONS) {
    await generateIcon(spec);
    console.log(`✓ ${spec.name}`);
  }

  console.log("\nIcônes PWA générées dans public/icons/");
}

main().catch((error) => {
  console.error("Échec de la génération des icônes PWA:", error);
  process.exit(1);
});
