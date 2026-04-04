import { GoogleGenAI } from "@google/genai";
import { getApiKey } from "./geminiService";

export interface SocialMediaShot {
  id: string;
  label: string;
  group: "A" | "B" | "C";
  groupLabel: string;
  aspectRatio: string;
  hasText: boolean;
  description: string;
  promptBuilder: (
    generationPrompt: string,
    signatureDetails: string,
    productName: string,
    brandName: string,
    logoBase64?: string
  ) => string;
}

export interface SocialMediaResult {
  id: string;
  label: string;
  aspectRatio: string;
  imageUrl: string | null;
  status: "pending" | "generating" | "done" | "error";
  error?: string;
}

export interface SocialMediaProgress {
  currentGroup: "A" | "B" | "C" | "done";
  currentShot: string;
  completedCount: number;
  totalCount: number;
  results: SocialMediaResult[];
}

export type SocialMediaCallback = (progress: SocialMediaProgress) => void;

// SM pipeline uses the PRO model for higher quality (same as BannerGenius)
const SM_IMAGE_MODEL = "gemini-3-pro-image-preview";

const getApiAspectRatio = (ratio: string): string => {
  if (ratio === "2:3" || ratio === "4:5") return "3:4";
  return ratio;
};

// Direct image generation using the PRO model
async function generateSmImage(
  prompt: string,
  referenceImages: string[],
  aspectRatio: string,
  textFirst: boolean
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const parts: any[] = [];

  if (textFirst) {
    parts.push({ text: prompt });
    for (const img of referenceImages.slice(0, 4)) {
      const matches = img.match(/^data:([^;]*);base64,(.+)$/);
      if (matches) {
        parts.push({ inlineData: { mimeType: matches[1] || "image/jpeg", data: matches[2] } });
      } else {
        parts.push({ inlineData: { mimeType: "image/jpeg", data: img } });
      }
    }
  } else {
    for (const img of referenceImages.slice(0, 4)) {
      const matches = img.match(/^data:([^;]*);base64,(.+)$/);
      if (matches) {
        parts.push({ inlineData: { mimeType: matches[1] || "image/jpeg", data: matches[2] } });
      } else {
        parts.push({ inlineData: { mimeType: "image/jpeg", data: img } });
      }
    }
    parts.push({ text: prompt });
  }

  const response = await ai.models.generateContent({
    model: SM_IMAGE_MODEL,
    contents: { parts },
    config: {
      responseModalities: ["IMAGE", "TEXT"],
      imageConfig: {
        aspectRatio: getApiAspectRatio(aspectRatio),
        imageSize: "1K",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Görsel oluşturulamadı.");
}

// ===== BANNER PROMPT — Luxury typography system based on Zara Home / RH research =====
const BANNER_PROMPT = (
  generationPrompt: string,
  signatureDetails: string,
  _productName: string,
  brandName: string,
  textInstructions: string,
  aspectRatio: string,
) => `You are creating a luxury bedding brand social media advertisement — the quality level of Zara Home, Restoration Hardware, and West Elm.

PRODUCT CONTEXT:
${generationPrompt}

PRODUCT DETAILS: ${signatureDetails}

═══ LUXURY DESIGN SYSTEM (FOLLOW EXACTLY) ═══

PHOTOGRAPHY:
- Product (bedding set) occupies 60-70% of the frame, beautifully styled on a bed.
- Warm natural window light (~4200K color temperature), soft directional shadows.
- Premium bedroom setting: light oak floors, warm plaster walls, linen curtains.
- Shot with a high-end camera: shallow-to-medium depth of field, cinematic bokeh.
- Composition optimized for ${aspectRatio} aspect ratio.

GRADIENT OVERLAY:
- Apply a SUBTLE warm gradient to create a text-safe zone.
- Gradient flows from fully transparent (product area) to a warm dark tone in the text area.
- Text zone color: warm charcoal (#2B1C10) or deep taupe (#443737) — NEVER pure black.
- Gradient opacity: 15-30% maximum — subtle and cinematic, NOT heavy or flat.
- The gradient should feel like natural shadow, not a digital overlay.

═══ TYPOGRAPHY SYSTEM (CRITICAL — THIS DEFINES QUALITY) ═══

HIERARCHY (exactly 3 levels):
1. HEADLINE: Elegant THIN SERIF typeface (like Playfair Display or Didot style).
   - Color: warm cream (#F4E1D2) or champagne (#E1D4C1) — NEVER pure white.
   - Weight: Regular to Light — NOT bold. Thin serifs are the luxury signal.
   - Wide letter-spacing for elegance.
   - Maximum 3-4 words.

2. SUBHEADLINE: Clean geometric SANS-SERIF (like Montserrat or Avenir style).
   - Color: muted warm tone (#C6AC8E) or dusty rose (#D5AA9F).
   - Weight: Light (300).
   - Slightly smaller than headline.
   - Wide letter-spacing (+50-100 tracking).

3. CTA / DETAIL: Same sans-serif, even smaller.
   - Color: same as subheadline but slightly more muted.
   - Uppercase with very wide letter-spacing.

TYPOGRAPHY RULES:
- ALL text MUST be in TURKISH.
- NEVER use pure black (#000000) or pure white (#FFFFFF) for text.
- NEVER use bold, heavy, or thick fonts — luxury = thin, elegant, restrained.
- NEVER use more than 2 font styles (one serif + one sans-serif).
- Text occupies maximum 20-30% of total image area — the rest is breathing room.
- Left-aligned text preferred. Minimum 10% margin from all edges.
- The typography should whisper luxury, not shout it.

WHAT MAKES IT LOOK CHEAP (AVOID ALL OF THESE):
- Thick/bold fonts, heavy drop shadows on text
- Pure black or pure white text colors
- Text covering more than 30% of the image
- Bright saturated accent colors clashing with the product
- Generic, template-looking layouts
- Multiple competing font weights or styles
- Text directly overlapping the product without gradient separation

${brandName ? `BRAND: "${brandName}" — display in ultra-thin, small sans-serif at bottom corner with very wide letter-spacing. Understated.` : ""}

TEXT CONTENT (IN TURKISH):
${textInstructions}

═══ FINAL QUALITY CHECK ═══
- The result must look like it was designed by a luxury brand's in-house creative team.
- Reference: Zara Home, Restoration Hardware, Parachute, Boll & Branch Instagram aesthetic.
- Product colors, embroidery, and textile details MUST match reference images EXACTLY.
- NO people. Add subtle grain/texture for premium depth (not sterile AI look).`;

// ===== LIFESTYLE PROMPT — editorial magazine quality =====
const LIFESTYLE_PROMPT = (
  generationPrompt: string,
  signatureDetails: string,
  sceneInstructions: string,
  aspectRatio: string
) => `Create an editorial lifestyle photograph for a luxury bedding brand — Zara Home or Restoration Hardware catalog quality.

PRODUCT CONTEXT:
${generationPrompt}

PRODUCT DETAILS: ${signatureDetails}

═══ PHOTOGRAPHY BRIEF ═══

SCENE: ${sceneInstructions}

CAMERA & TECHNICAL:
- Shot with Canon 5D Mark IV, natural window light (~4200K warm).
- Shallow-to-medium depth of field, cinematic bokeh on background elements.
- Color grading: warm, slightly desaturated, muted tonal palette.
- Palette reference: warm creams (#F5ECE6), dusty beige (#E1D4C1), soft taupe (#B2B0A1).
- Add subtle film grain (2-3%) for authentic, non-sterile feel.

COMPOSITION:
- Optimized for ${aspectRatio} aspect ratio.
- Rule of thirds. Generous negative space. Magazine editorial framing.
- The product must feel effortlessly styled — "lived-in luxury" not "showroom perfect."

═══ CRITICAL RULES ═══
- NO text, NO labels, NO watermarks on the image.
- Must look like a GENUINE photograph — NOT CGI or AI-generated.
- Product colors, embroidery, and textile details MUST match reference images EXACTLY.
- NO people. NO extra textile products not in references.
- The mood should make the viewer think "I want this bedroom."`;

export const SOCIAL_MEDIA_SHOTS: SocialMediaShot[] = [
  // ═══ GROUP A: Text Banner Visuals ═══
  {
    id: "sm_feed_banner",
    label: "Instagram Feed Banner",
    group: "A",
    groupLabel: "Yazılı Banner",
    aspectRatio: "3:4",
    hasText: true,
    description: "Ürün ismi + slogan + logo ile feed görseli",
    promptBuilder: (gp, sig, productName, brandName) =>
      BANNER_PROMPT(gp, sig, productName, brandName,
        `LEVEL 1 — HEADLINE (thin elegant serif, cream #F4E1D2): "${productName}"
LEVEL 2 — SUBHEADLINE (light sans-serif, wide letter-spacing, dusty rose #D5AA9F): A 2-3 word Turkish luxury phrase like "Eşsiz Konfor" or "Premium Dokunuş"
LAYOUT: "Editorial Left" pattern — text anchored to bottom-left third. Warm gradient (#2B1C10, 20% opacity) at bottom. Product fills upper 70%.`,
        "4:5"),
  },
  {
    id: "sm_story_banner",
    label: "Instagram Story Banner",
    group: "A",
    groupLabel: "Yazılı Banner",
    aspectRatio: "9:16",
    hasText: true,
    description: "Tam ekran story formatında tanıtım",
    promptBuilder: (gp, sig, productName, brandName) =>
      BANNER_PROMPT(gp, sig, productName, brandName,
        `Full-screen vertical story (9:16).
LEVEL 1 — HEADLINE (thin serif, champagne #E1D4C1, centered, top third): "${productName}"
LEVEL 2 — SUBHEADLINE (light sans-serif, ultra-wide tracking, uppercase, muted #C6AC8E): "YENİ KOLEKSİYON" or "PREMIUM KALİTE"
LEVEL 3 — CTA (tiny sans-serif, widest tracking, bottom 10%): "Keşfet →"
GRADIENT: Soft bottom-to-top warm gradient (#2B1C10) — 20% at bottom for CTA, transparent center.`,
        "9:16"),
  },
  {
    id: "sm_carousel_intro",
    label: "Carousel Kart 1 — Tanıtım",
    group: "A",
    groupLabel: "Yazılı Banner",
    aspectRatio: "3:4",
    hasText: true,
    description: "Carousel açılış kartı, ürün tanıtımı",
    promptBuilder: (gp, sig, productName, brandName) =>
      BANNER_PROMPT(gp, sig, productName, brandName,
        `Carousel opening card.
LEVEL 1 — HEADLINE (thin serif, cream #F4E1D2): "${productName}"
LEVEL 2 — FEATURES (light sans-serif, wide tracking, #C6AC8E, small):
  "✓ %100 Pamuk" and "✓ Nakışlı Tasarım" — max 2 lines, minimal text.
LAYOUT: "Split Frame" — left 35% has warm solid color block (#2B1C10, 90% opacity) with text, right 65% is edge-to-edge product photo. Clean separation.`,
        "4:5"),
  },

  // ═══ GROUP B: Aesthetic/Lifestyle (No Text) ═══
  {
    id: "sm_lifestyle",
    label: "Lifestyle Shot",
    group: "B",
    groupLabel: "Estetik Görsel",
    aspectRatio: "3:4",
    hasText: false,
    description: "Yaşam alanında ürün, yazısız",
    promptBuilder: (gp, sig) =>
      LIFESTYLE_PROMPT(gp, sig,
        `Warm, sun-filled Scandinavian-contemporary bedroom. The bed is the centerpiece with the product beautifully styled — duvet artfully turned back showing layers. Soft morning light through sheer curtains creating long, warm shadows. A coffee cup on the nightstand, a knit throw casually draped on a nearby chair. Light oak flooring, warm plaster walls. Inviting, aspirational "I want this bedroom" mood. Shot at f/4 with 50mm lens at a slight 3/4 angle from the foot of the bed.`,
        "4:5"),
  },
  {
    id: "sm_detail",
    label: "Detay Close-up",
    group: "B",
    groupLabel: "Estetik Görsel",
    aspectRatio: "1:1",
    hasText: false,
    description: "Doku ve kalite detay çekimi, yazısız",
    promptBuilder: (gp, sig) =>
      LIFESTYLE_PROMPT(gp, sig,
        `Extreme close-up macro photograph of the fabric texture and embroidery. Fill the ENTIRE frame with the textile surface — show individual thread structure, weave pattern, satin stitch sheen, and embroidery stitching in photorealistic detail. Shallow depth of field: tack-sharp center fading to creamy bokeh at edges. Side lighting at 30-45 degrees raking across the surface to reveal stitch depth and thread dimensionality. Background is out-of-focus bedding surface. Shot at f/4 with 100mm macro lens.`,
        "1:1"),
  },

  // ═══ GROUP C: Carousel Continuation ═══
  {
    id: "sm_carousel_angle",
    label: "Carousel Kart 2 — Açı",
    group: "C",
    groupLabel: "Carousel Devam",
    aspectRatio: "3:4",
    hasText: false,
    description: "Farklı açıdan ürün, yazısız",
    promptBuilder: (gp, sig) =>
      LIFESTYLE_PROMPT(gp, sig,
        `Low angle shot from the foot of the bed, near mattress height, looking UP toward the headboard. The duvet edge cascading over the foot of the bed is the closest element — showing fabric drape and weight beautifully. Dramatic yet warm natural lighting from a side window. Curved upholstered headboard partially visible. One nightstand with minimal decor. Shot at f/4 with 35mm lens for slight wide-angle drama. Fresh, different perspective that adds visual variety to the carousel set.`,
        "4:5"),
  },
  {
    id: "sm_carousel_cta",
    label: "Carousel Kart 3 — Kapanış",
    group: "C",
    groupLabel: "Carousel Devam",
    aspectRatio: "3:4",
    hasText: true,
    description: "Kapanış kartı, slogan + CTA",
    promptBuilder: (gp, sig, productName, brandName) =>
      BANNER_PROMPT(gp, sig, productName, brandName,
        `Carousel closing card — CTA focused.
LEVEL 1 — CTA HEADLINE (thin serif, large, cream #F4E1D2, centered): "Keşfet" — single word, maximum impact.
LEVEL 2 — PRODUCT NAME (light sans-serif, wide tracking, #C6AC8E, smaller): "${productName}"
LAYOUT: "Centered Minimal" — product fills background with 30% warm overlay (#2B1C10). Text perfectly centered. Maximum white space around text. The simplicity IS the luxury.`,
        "4:5"),
  },
];

export async function runSocialMediaPipeline(
  referenceImages: string[],
  generationPrompt: string,
  signatureDetails: string,
  productName: string,
  brandName: string,
  enabledShotIds: string[],
  logoBase64: string | undefined,
  onProgress: SocialMediaCallback
): Promise<SocialMediaResult[]> {
  const shots = SOCIAL_MEDIA_SHOTS.filter(s => enabledShotIds.includes(s.id));
  const results: SocialMediaResult[] = shots.map(s => ({
    id: s.id,
    label: s.label,
    aspectRatio: s.aspectRatio,
    imageUrl: null,
    status: "pending" as const,
  }));

  const report = (currentShot: string, group: "A" | "B" | "C" | "done") => {
    onProgress({
      currentGroup: group,
      currentShot,
      completedCount: results.filter(r => r.status === "done" || r.status === "error").length,
      totalCount: results.length,
      results: [...results],
    });
  };

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    results[i].status = "generating";
    report(shot.label, shot.group);

    try {
      const prompt = shot.promptBuilder(
        generationPrompt,
        signatureDetails,
        productName,
        brandName,
        logoBase64
      );

      // Use the SM-specific high-quality image generator
      const imageUrl = await generateSmImage(
        prompt,
        referenceImages,
        shot.aspectRatio,
        shot.hasText // textFirst for banner shots
      );

      results[i].imageUrl = imageUrl;
      results[i].status = "done";
    } catch (err: any) {
      results[i].status = "error";
      results[i].error = err.message || "Görsel oluşturulamadı";
    }

    report(shot.label, i < shots.length - 1 ? shots[i + 1].group : "done");
  }

  return results;
}
