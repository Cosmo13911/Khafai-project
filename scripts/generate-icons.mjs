import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const rootDir = process.cwd();
const svgPath = path.join(rootDir, "public", "logo.svg");
const outputDir = path.join(rootDir, "public", "icons");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generate() {
  console.log("Generating PWA icons from logo.svg...");

  const svgBuffer = fs.readFileSync(svgPath);

  // 1. Standard 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, "icon-192x192.png"));
  console.log("✓ Generated icon-192x192.png");

  // 2. Standard 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, "icon-512x512.png"));
  console.log("✓ Generated icon-512x512.png");

  // 3. Apple Touch Icon 180x180 (with background padding for iOS)
  const iosInnerSize = Math.round(180 * 0.75); // ~135px
  const iosInnerIcon = await sharp(svgBuffer).resize(iosInnerSize, iosInnerSize).toBuffer();
  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 248, g: 250, b: 252, alpha: 1 }, // slate-50
    },
  })
    .composite([{ input: iosInnerIcon, gravity: "center" }])
    .png()
    .toFile(path.join(outputDir, "apple-touch-icon.png"));
  console.log("✓ Generated apple-touch-icon.png");

  // 4. Maskable 192x192 (safe area 80%)
  const mask192Inner = Math.round(192 * 0.75); // 144px
  const inner192Buffer = await sharp(svgBuffer).resize(mask192Inner, mask192Inner).toBuffer();
  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 248, g: 250, b: 252, alpha: 1 },
    },
  })
    .composite([{ input: inner192Buffer, gravity: "center" }])
    .png()
    .toFile(path.join(outputDir, "icon-maskable-192x192.png"));
  console.log("✓ Generated icon-maskable-192x192.png");

  // 5. Maskable 512x512 (safe area 80%)
  const mask512Inner = Math.round(512 * 0.75); // 384px
  const inner512Buffer = await sharp(svgBuffer).resize(mask512Inner, mask512Inner).toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 248, g: 250, b: 252, alpha: 1 },
    },
  })
    .composite([{ input: inner512Buffer, gravity: "center" }])
    .png()
    .toFile(path.join(outputDir, "icon-maskable-512x512.png"));
  console.log("✓ Generated icon-maskable-512x512.png");

  // 6. Favicon 32x32 & 16x16
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, "favicon-32x32.png"));
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(outputDir, "favicon-16x16.png"));
  console.log("✓ Generated favicon 32x32 and 16x16");

  console.log("All PWA icons generated successfully!");
}

generate().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
