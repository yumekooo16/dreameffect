/**
 * Génère l'image Open Graph 1200×630 à partir du logo.
 * Usage : npx tsx scripts/generate-og-image.ts
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public");
const SOURCE = path.join(ROOT, "logo.png");
const OUTPUT = path.join(ROOT, "og.png");

const WIDTH = 1200;
const HEIGHT = 630;
const BACKGROUND = { r: 9, g: 9, b: 11, alpha: 1 };

async function main() {
  await mkdir(ROOT, { recursive: true });

  const logoSize = 168;
  const logo = await sharp(SOURCE)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: BACKGROUND,
    })
    .png()
    .toBuffer();

  const title = Buffer.from(
    `<svg width="${WIDTH}" height="120" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="48" text-anchor="middle" fill="#fafafa" font-size="44" font-family="ui-sans-serif, Helvetica, Arial, sans-serif" font-weight="600">DreamEffect</text>
      <text x="50%" y="96" text-anchor="middle" fill="#b4b4bc" font-size="22" font-family="ui-sans-serif, Helvetica, Arial, sans-serif">Location de véhicules haut de gamme</text>
    </svg>`
  );

  await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([
      { input: logo, top: Math.round((HEIGHT - logoSize) / 2) - 56, left: Math.round((WIDTH - logoSize) / 2) },
      { input: title, top: HEIGHT - 168, left: 0 },
    ])
    .png()
    .toFile(OUTPUT);

  console.log(`✓ ${OUTPUT} (${WIDTH}×${HEIGHT})`);
}

main().catch((error) => {
  console.error("Échec de la génération OG :", error);
  process.exit(1);
});
