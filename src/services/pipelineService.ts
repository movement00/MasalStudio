import { generateImageRaw, detectProductRegions } from "./geminiService";
import { cropRegion } from "../lib/cropRegion";

export interface PipelineShot {
  id: string;
  label: string;
  group: "A" | "B" | "C";
  description: string;
  promptBuilder: (generationPrompt: string, signatureDetails: string, pieceInfo: string, aspectRatio: string) => string;
  textFirst: boolean;
  focusRegion?: "pillow" | "embroidery" | "edge" | "pattern";
  enabled: boolean;
}

export interface PipelineResult {
  id: string;
  label: string;
  imageUrl: string | null;
  status: "pending" | "generating" | "done" | "error";
  error?: string;
}

export interface PipelineProgress {
  currentGroup: "A" | "B" | "C" | "done";
  currentShot: string;
  completedCount: number;
  totalCount: number;
  results: PipelineResult[];
}

// Scene decor sets for children's book product photography
const DECOR_SETS = [
  "colorful wooden toy blocks, a small stuffed teddy bear, scattered star-shaped confetti, and a cup of hot cocoa with marshmallows on a cozy knit blanket",
  "a set of colored pencils fanned out, a small potted succulent, rainbow washi tape rolls, and a child's drawing pinned to the background",
  "a plush unicorn toy, pastel-colored macarons on a plate, dried flower petals, and a string of fairy lights in soft bokeh",
  "a miniature globe, a magnifying glass, a compass, and a small stack of adventure books with a paper airplane",
  "a wooden toy train, alphabet letter blocks spelling 'MASAL', a jar of colorful candy, and a soft pastel ribbon",
  "a pair of tiny sneakers, a superhero cape draped casually, star stickers, and a glass of milk with a striped paper straw",
  "origami paper cranes in pastel colors, a small watercolor palette, paint brushes, and a child's name tag with a heart",
  "a kaleidoscope, a snow globe, a small music box, and scattered gold star confetti on a dreamy pastel surface",
];

let decorIndex = 0;
function resetDecorIndex(): void { decorIndex = 0; }
function nextDecorSet(): string {
  const set = DECOR_SETS[decorIndex % DECOR_SETS.length];
  decorIndex++;
  return set;
}

const BASE_INSTRUCTIONS = (prompt: string, ar: string, angleInstructions: string) => {
  const decor = nextDecorSet();
  return `Generate a completely new, high-end professional PRODUCT PHOTOGRAPH of a children's storybook based on the reference images provided.

    PRODUCT: ${prompt}

    CAMERA ANGLE & SCENE: ${angleInstructions}

    CRITICAL INSTRUCTIONS:
    - This is a CHILDREN'S ILLUSTRATED STORYBOOK — A4 sized, soft cover, colorful Pixar/3D cartoon style illustrations inside.
    - DO NOT just return the original image. You must generate a completely new scene and composition.
    - The book must look EXACTLY like the reference images — same cover art, same illustrations, same colors.
    - SCENE STYLING: Create a warm, inviting, child-friendly environment with these decor elements: ${decor}.
    - STRICTLY NO CGI/RENDER LOOK: The image MUST look like a genuine photograph taken with a DSLR camera. Natural soft lighting, realistic textures, shallow depth of field.
    - COMPOSITION: Optimize for ${ar} aspect ratio.
    - The book should look like a REAL PHYSICAL PRINTED BOOK — visible page thickness, slight paper texture, natural shadows.
    - DO NOT add any text, labels, or watermarks that are not on the original book.
    - NO PEOPLE: Do NOT include any humans, persons, figures, or body parts. Only the book and props.
    - WARM PASTEL COLOR PALETTE: The environment should feel magical, dreamy, and child-friendly.`;
}

export const PIPELINE_SHOTS: PipelineShot[] = [
  // ═══ GROUP A: Product Scenes — book in environment ═══
  {
    id: "hero_cover",
    label: "Hero Shot (Kapak)",
    group: "A",
    description: "Kitap kapağı öne bakacak şekilde, premium ürün çekimi",
    textFirst: false,
    enabled: true,
    promptBuilder: (gp, _sig, _pi, ar) => BASE_INSTRUCTIONS(gp, ar,
      `Hero product shot. The closed book stands slightly angled (15-20°) on a soft pastel surface, cover facing the camera. Camera at ~30° elevation, 3/4 view. The book cover illustration must be CLEARLY VISIBLE and SHARP. Warm directional light from the left creating gentle shadows. Background is soft bokeh with warm tones. This is the MAIN e-commerce listing image.`
    ),
  },
  {
    id: "open_book_spread",
    label: "Açık Kitap (İç Sayfalar)",
    group: "A",
    description: "Kitap açık, iç sayfalar ve illüstrasyonlar görünür",
    textFirst: false,
    enabled: true,
    promptBuilder: (gp, _sig, _pi, ar) => BASE_INSTRUCTIONS(gp, ar,
      `The book is OPEN, laying flat or slightly propped, showing a beautiful illustrated double-page spread. The 3D cartoon illustrations on the pages must be clearly visible. Camera looking down at ~45° angle. Pages should look like real printed paper with slight curl. Warm reading-time atmosphere.`
    ),
  },
  {
    id: "lifestyle_reading",
    label: "Yaşam Alanı (Okuma Köşesi)",
    group: "A",
    description: "Sıcak bir okuma ortamında kitap",
    textFirst: false,
    enabled: true,
    promptBuilder: (gp, _sig, _pi, ar) => BASE_INSTRUCTIONS(gp, ar,
      `The book on a cozy reading nook — a soft blanket, plush cushions, warm fairy lights in the background. Camera at eye level, the book slightly leaning against a cushion with cover visible. Warm golden ambient light like bedtime story time. Dreamy, magical atmosphere. Shallow depth of field — book sharp, background creamy bokeh.`
    ),
  },
  {
    id: "gift_presentation",
    label: "Hediye Sunumu",
    group: "A",
    description: "Doğum günü hediyesi konseptinde",
    textFirst: false,
    enabled: true,
    promptBuilder: (gp, _sig, _pi, ar) => BASE_INSTRUCTIONS(gp, ar,
      `The book presented as a GIFT — sitting on tissue paper inside a beautiful gift box, with a satin ribbon beside it. Scattered confetti stars and a small birthday card visible. The book cover faces the camera. Premium gift-giving moment. Bright, joyful lighting. This should make parents want to buy it as a birthday present.`
    ),
  },

  // ═══ GROUP B: Detail Shots — close-ups ═══
  {
    id: "cover_closeup",
    label: "Kapak Detay (Yakın Çekim)",
    group: "B",
    description: "Kapak illüstrasyonunun makro çekimi",
    textFirst: true,
    focusRegion: "embroidery",
    enabled: true,
    promptBuilder: (_gp, sig, _pi, ar) =>
`Close-up photograph of the children's book cover illustration.

BOOK DETAILS: ${sig}

Fill the frame with the book cover — the 3D cartoon character and artwork must be TACK SHARP. Show the paper/card stock texture and print quality. Side lighting to reveal surface texture.
Camera at slight angle to show cover thickness. ${ar} aspect ratio.`,
  },
  {
    id: "page_detail",
    label: "Sayfa Detay (İllüstrasyon)",
    group: "B",
    description: "İç sayfa illüstrasyonuna yakın çekim",
    textFirst: true,
    focusRegion: "pattern",
    enabled: true,
    promptBuilder: (_gp, sig, _pi, ar) =>
`Close-up photograph of an open page inside the children's storybook.

BOOK DETAILS: ${sig}

Show the beautiful 3D cartoon illustration on the page in extreme detail. The printed colors must be vibrant and sharp. Show paper texture — real printed book feel. Slight page curl at edges. Warm soft lighting.
${ar} aspect ratio.`,
  },
  {
    id: "spine_thickness",
    label: "Kitap Sırtı / Kalınlık",
    group: "B",
    description: "Kitabın kalınlığını ve sırtını gösteren açı",
    textFirst: true,
    focusRegion: "edge",
    enabled: true,
    promptBuilder: (_gp, sig, _pi, ar) =>
`Side view photograph showing the SPINE and THICKNESS of the children's storybook.

BOOK DETAILS: ${sig}

Camera at book-height level, looking at the spine. Show the page edges (multiple colorful pages stacked). The cover wrapping around the spine should be visible. This demonstrates the book is a real, substantial physical product — not just a few pages.
Clean background, studio lighting. ${ar} aspect ratio.`,
  },

  // ═══ GROUP C: Marketing & Infographic ═══
  {
    id: "flatlay_creative",
    label: "Flat-Lay (Yaratıcı Düzen)",
    group: "C",
    description: "Kuşbakışı — kitap + kalemler + oyuncaklar",
    textFirst: true,
    enabled: true,
    promptBuilder: (_gp, sig, pieceInfo, ar) =>
`Overhead flat-lay product photograph of a children's storybook.

BOOK DETAILS: ${sig}
CONTENTS: ${pieceInfo}

LAYOUT: The book (cover facing up) centered on a clean pastel surface. Around it, artfully arranged:
- Colored pencils/crayons fanned out
- Small star stickers and confetti
- A tiny toy figure or stuffed animal
- A cup of milk/cocoa (optional)

STYLE: Pinterest-worthy, Instagram mom aesthetic. Clean, bright, joyful.
Even overhead lighting, no harsh shadows. Pastel background (mint, blush pink, soft yellow, or lavender).
${ar} aspect ratio.`,
  },
  {
    id: "collection_display",
    label: "Koleksiyon Görünümü",
    group: "C",
    description: "Birden fazla kitap yan yana — seri hissi",
    textFirst: true,
    enabled: true,
    promptBuilder: (_gp, sig, _pi, ar) =>
`Product photograph showing MULTIPLE copies of the same children's storybook arranged together.

BOOK DETAILS: ${sig}

Show 3-4 copies of the book: one standing upright (cover facing camera), one laying flat showing the cover, one slightly open showing pages. Arranged on a pastel surface with small toy props.
This gives the impression of a POPULAR, COLLECTIBLE book series. Bright, commercial product photography. Professional studio lighting.
${ar} aspect ratio.`,
  },
  {
    id: "infographic_features",
    label: "İnfografik (Özellikler)",
    group: "C",
    description: "Türkçe özellik etiketleri ile ürün tanıtım görseli",
    textFirst: true,
    enabled: true,
    promptBuilder: (_gp, sig, pieceInfo, ar) =>
`Premium e-commerce infographic photograph for a personalized children's storybook.

BOOK DETAILS: ${sig}
CONTENTS: ${pieceInfo}

LAYOUT: The book centered, cover facing camera, on a clean bright background. Around it, 4-5 elegant callout badges connected by thin lines:

BADGE SUGGESTIONS (ALL IN TURKISH):
- "Kişiselleştirilmiş Hikaye" → points to cover character
- "Pixar Kalitesinde Çizimler" → points to illustration
- "A4 Boyut" → points to book size
- "0-12 Yaş" → general badge
- "${pieceInfo || "14 Farklı Hikaye"}" → bottom badge

Badge style: Rounded rectangle, white background, subtle shadow, clean sans-serif font, pastel colored accents.
ALL text must be in TURKISH with correct characters.
${ar} aspect ratio.`,
  },
];

export type PipelineCallback = (progress: PipelineProgress) => void;
export type LogCallback = (message: string) => void;

export async function runPipeline(
  referenceImagesBase64: string[],
  generationPrompt: string,
  signatureDetails: string,
  aspectRatio: string,
  enabledShotIds: string[],
  userNotes: string,
  pieceInfo: string,
  onProgress: PipelineCallback,
  onLog?: LogCallback
): Promise<PipelineResult[]> {
  resetDecorIndex();
  const log = onLog || (() => {});
  const shots = PIPELINE_SHOTS.filter((s) => enabledShotIds.includes(s.id));

  const results: PipelineResult[] = shots.map((s) => ({
    id: s.id,
    label: s.label,
    imageUrl: null,
    status: "pending" as const,
  }));

  const updateProgress = (group: "A" | "B" | "C" | "done", shotId: string) => {
    onProgress({
      currentGroup: group,
      currentShot: shotId,
      completedCount: results.filter((r) => r.status === "done").length,
      totalCount: results.length,
      results: [...results],
    });
  };

  const userContext = userNotes
    ? `\n\nCONTEXT FROM USER (for accuracy only, do NOT render as text): ${userNotes}`
    : "";
  let fullGenerationPrompt = generationPrompt + userContext;
  let fullSignatureDetails = signatureDetails + userContext;

  // ── Region detection: crop cover/illustration/spine areas ──
  const needsRegions = shots.some(s => s.focusRegion);
  const croppedRegions: Record<string, string> = {};

  if (needsRegions) {
    try {
      log("🔍 Bölge tespiti başladı — kapak, illüstrasyon, sırt aranıyor...");
      const detected = await detectProductRegions(referenceImagesBase64);
      const foundRegions = Object.keys(detected).filter(k => (detected as any)[k]);
      log(`📐 ${foundRegions.length} bölge bulundu: ${foundRegions.join(", ") || "yok"}`);
      for (const [key, region] of Object.entries(detected)) {
        if (region && region.imageIndex < referenceImagesBase64.length) {
          try {
            log(`✂️ ${key} bölgesi kırpılıyor...`);
            croppedRegions[key] = await cropRegion(
              referenceImagesBase64[region.imageIndex],
              { x: region.x, y: region.y, w: region.w, h: region.h }
            );
          } catch { /* skip failed crop */ }
        }
      }
    } catch { /* region detection failed */ }
  }

  if (Object.keys(croppedRegions).length > 0) {
    log(`🎯 ${Object.keys(croppedRegions).length} detay crop'u referans görsellere eklenecek`);
  }

  // Sequential generation
  for (const shot of shots) {
    const idx = results.findIndex((r) => r.id === shot.id);
    results[idx].status = "generating";
    updateProgress(shot.group, shot.id);
    log(`🖼️ [${idx + 1}/${shots.length}] ${shot.label} üretiliyor...`);

    try {
      const prompt = shot.promptBuilder(fullGenerationPrompt, fullSignatureDetails, pieceInfo, aspectRatio);

      let refs = referenceImagesBase64;
      if (shot.focusRegion && croppedRegions[shot.focusRegion]) {
        refs = [croppedRegions[shot.focusRegion], ...referenceImagesBase64];
        log(`   → ${shot.focusRegion} crop'u referansa eklendi`);
      }

      const imageUrl = await generateImageRaw(prompt, refs, aspectRatio, shot.textFirst);
      results[idx].imageUrl = imageUrl;
      results[idx].status = "done";
      log(`✅ ${shot.label} tamamlandı`);
    } catch (err: any) {
      results[idx].status = "error";
      results[idx].error = err.message || "Üretim hatası";
      log(`❌ ${shot.label} hata: ${err.message}`);
    }
    updateProgress(shot.group, shot.id);
  }

  updateProgress("done", "");
  return results;
}
