import { GoogleGenAI, Type } from "@google/genai";
import type { ProductAnalysis, InfographicAnalysis, BoxContentAnalysis, ProductAnglesAnalysis } from "../types";

let apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const getApiKey = () => apiKey;

const getAiClient = () => {
  if (!apiKey) throw new Error("API anahtarı ayarlanmadı.");
  return new GoogleGenAI({ apiKey });
};

// Analiz (text-only) için model
const ANALYSIS_MODEL = "gemini-3-pro-preview";
// Görsel üretim için model — Nano Banana 2
const IMAGE_GEN_MODEL = "gemini-3.1-flash-image-preview";

// Global image size setting
let globalImageSize = "2K";
export const setImageSize = (size: string) => { globalImageSize = size; };
export const getImageSize = () => globalImageSize;

const getInlineData = (base64String: string) => {
  const matches = base64String.match(/^data:([^;]*);base64,(.+)$/);
  if (matches) {
    let mimeType = matches[1];
    if (!mimeType || mimeType === "application/octet-stream" || !mimeType.startsWith("image/")) {
      mimeType = "image/jpeg";
    }
    return { mimeType, data: matches[2] };
  }
  return { mimeType: "image/jpeg", data: base64String };
};

export const analyzeProductPhotos = async (
  base64Images: string[],
  userContext?: string
): Promise<ProductAnalysis> => {
  const ai = getAiClient();

  const parts: any[] = [
    {
      text: `You are an expert product photographer specializing in children's books. Carefully study ALL provided reference images of the storybook and extract a precise product profile.

STEP 1 — BOOK TYPE: Identify what kind of book this is (personalized children's storybook, coloring book, educational book, fairy tale, etc.). Note the format (A4, square, etc.) and cover type (soft cover, hard cover).

STEP 2 — COVER ANALYSIS: Describe the cover illustration in detail:
  - Main character(s) and their appearance (3D cartoon, 2D illustration, photo-based)
  - Art style (Pixar/3D CGI, watercolor, flat illustration, etc.)
  - Color palette (dominant colors, accent colors)
  - Title text and its font style/color
  - Overall mood/theme (adventure, bedtime, funny, educational)

STEP 3 — INTERIOR PAGES: If interior pages are visible:
  - Illustration style consistency
  - Page layout (full-page illustration, text + image, etc.)
  - Color richness and print quality

STEP 4 — UNIQUE FEATURES: Note any special features:
  - Personalization (child's name/photo integrated)
  - Special finishes (glossy cover, matte pages)
  - Age group indicator
  - Series branding

STEP 5 — SCENE SELECTION: Based on the book's color palette and theme, select the most fitting product photography scene:
  - ADVENTURE/ACTION books → warm earthy tones, explorer props (compass, map, binoculars)
  - BEDTIME/DREAMY books → soft pastel environment, fairy lights, plush toys, cozy blankets
  - FUNNY/PLAYFUL books → bright colorful setting, confetti, toy blocks, crayons
  - NATURE/ANIMAL books → natural wood surface, small plants, animal figurines
  - EDUCATIONAL books → clean bright desk, pencils, globe, magnifying glass
  - PRINCESS/MAGICAL books → pink/purple pastels, sparkle, crown props, wand

STEP 6 — GENERATION PROMPT: Write a detailed generation prompt for product photography. The prompt MUST explicitly state:
  - Exact book description (cover art, size, type)
  - The chosen scene/environment from STEP 5
  - Specific props and decorations
  - Lighting style (warm/cool, directional/ambient)
  - The book must look like a REAL PRINTED PHYSICAL BOOK with visible page thickness and paper texture

Your output must be a JSON object.${userContext ? `\n\nIMPORTANT USER-PROVIDED INFORMATION:\n${userContext}` : ""}`
    }
  ];

  base64Images.forEach((b64) => {
    parts.push({ inlineData: getInlineData(b64) });
  });

  const response = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productCategory: { type: Type.STRING },
          marketingDescription: { type: Type.STRING },
          suggestedTitle: { type: Type.STRING },
          signatureDetails: { type: Type.STRING, description: "Complete product detail map: piece inventory, exact colors per piece, embroidery motif+position+color (or 'no embroidery'), edge treatment type+color, fabric surface character." },
          generationPrompt: { type: Type.STRING, description: "Full generation prompt that explicitly states all product details (pieces, colors, embroidery position, edge treatment) then describes a new high-end bedroom scene." },
          pieceInfo: { type: Type.STRING, description: "Detected piece list in Turkish, e.g. '1 nevresim, 1 çarşaf, 2 uyku yastığı kılıfı, 2 dekoratif nakışlı yastık kılıfı'. Count exactly what you see — could be a nevresim set, pike set, or any bedding combination. Do NOT assume a fixed set — detect from images." },
        },
        required: ["productCategory", "marketingDescription", "generationPrompt", "suggestedTitle", "signatureDetails", "pieceInfo"]
      }
    }
  });

  return JSON.parse(response.text!) as ProductAnalysis;
};

// Sends a fully-formed prompt directly to the image model — no wrapper added.
// Use this when the caller already has a complete, self-contained prompt (e.g. pipeline shots).
export const generateImageRaw = async (
  fullPrompt: string,
  referenceImagesBase64: string[],
  aspectRatio: string = "1:1",
  textFirst: boolean = false
): Promise<string> => {
  const ai = getAiClient();

  const imageParts = referenceImagesBase64.map((b64) => ({
    inlineData: getInlineData(b64)
  }));
  const textPart = { text: fullPrompt };

  // textFirst: Model reads the instruction BEFORE seeing reference images.
  // This prevents the model from anchoring on "generate a full bed photo"
  // when we actually want a detail/macro/marketing shot.
  const parts: any[] = textFirst
    ? [textPart, ...imageParts]
    : [...imageParts, textPart];

  const response = await ai.models.generateContent({
    model: IMAGE_GEN_MODEL,
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: globalImageSize as any,
      },
    }
  });

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("Yanıt alınamadı.");
  const imagePart = candidate.content?.parts?.find((p: any) => p.inlineData);
  if (!imagePart?.inlineData) throw new Error("Görsel oluşturulamadı.");
  return `data:image/png;base64,${imagePart.inlineData.data}`;
};

export const generateProfessionalImage = async (
  prompt: string,
  referenceImagesBase64: string[],
  aspectRatio: string = "1:1"
): Promise<string> => {
  const ai = getAiClient();

  const parts: any[] = referenceImagesBase64.map((b64) => ({
    inlineData: getInlineData(b64)
  }));

  parts.push({
    text: `Generate a completely new, high-end professional PRODUCT PHOTOGRAPH of a children's storybook based on the reference images provided.

    PROMPT: ${prompt}

    CRITICAL INSTRUCTIONS:
    - This is a THIN, LIGHTWEIGHT SOFT-COVER children's storybook — A4 sized, like a cartoon magazine or activity book. NOT a hardcover. THIN flexible cover, ~20-30 pages. It should look THIN and FLEXIBLE, able to bend slightly like a magazine.
    - DO NOT just return the original image. You must generate a completely new scene and composition.
    - NEW ENVIRONMENT: Design a warm, child-friendly scene — a cozy reading nook, a pastel-colored desk, a soft blanket setup, or a playful kids' room corner. Include small props like colored pencils, toy figures, star stickers, or a stuffed animal.
    - STRICTLY NO CGI/RENDER LOOK: The image MUST look like a genuine photograph taken with a DSLR camera. Natural soft lighting, realistic paper textures, shallow depth of field.
    - COMPOSITION: Optimize for ${aspectRatio} aspect ratio.
    - PRODUCT ACCURACY: The book cover art and illustrations must match the reference images EXACTLY — same characters, same colors, same style.
    - NO PEOPLE: Do NOT include any humans, persons, figures, or body parts.
    - The book must look like a REAL THIN PRINTED BOOK — not a hardcover, not a thick novel.`
  });

  const response = await ai.models.generateContent({
    model: IMAGE_GEN_MODEL,
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: globalImageSize as any,
      },
    }
  });

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("Yanıt alınamadı.");

  const imagePart = candidate.content?.parts?.find((p: any) => p.inlineData);
  if (!imagePart?.inlineData) throw new Error("Görsel oluşturulamadı.");

  return `data:image/png;base64,${imagePart.inlineData.data}`;
};

export const analyzeInfographic = async (
  base64Images: string[]
): Promise<InfographicAnalysis> => {
  const ai = getAiClient();
  const parts: any[] = [{
    text: `You are an expert product photographer and marketing specialist. Study ALL reference images carefully and extract:
  1. PIECE INVENTORY: Every piece in the set with exact count.
  2. COLOR MAPPING: Base color and accent colors for each piece separately.
  3. EMBROIDERY/PATTERN: Motif shape, exact position on each piece, thread color. State "no embroidery" if absent.
  4. EDGE TREATMENT: Exact type (flat decorative strip / bias tape / piping / simple hem) and color. Do NOT confuse decorative strips with piping.
  5. FABRIC CHARACTER: Satin sheen, matte percale, textured linen, etc.
  6. ROOM/BACKGROUND CONTRAST: For infographic use a clean studio background. If product is white/light → use a slightly warm off-white or very light grey background for subtle contrast. If product is dark/bold → pure white background to make colors pop.
  Then create a generation prompt for a CLEAN, PERFECTLY IRONED, MINIMALIST studio setting — product impeccably neat, no wrinkles. The prompt MUST embed all exact product details (piece count, colors, embroidery position, edge treatment) so the AI reproduces the product accurately. Return JSON.`
  }];
  base64Images.forEach((b64) => parts.push({ inlineData: getInlineData(b64) }));

  const response = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          materialType: { type: Type.STRING },
          keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
          textOverlays: { type: Type.ARRAY, items: { type: Type.STRING } },
          generationPrompt: { type: Type.STRING },
          marketingHeadline: { type: Type.STRING }
        },
        required: ["materialType", "keyFeatures", "textOverlays", "generationPrompt", "marketingHeadline"]
      }
    }
  });
  return JSON.parse(response.text!) as InfographicAnalysis;
};

export const generateInfographicImage = async (
  prompt: string,
  referenceImagesBase64: string[],
  textOverlays: string[],
  aspectRatio: string = "1:1"
): Promise<string> => {
  const ai = getAiClient();
  const parts: any[] = referenceImagesBase64.map((b64) => ({ inlineData: getInlineData(b64) }));
  parts.push({
    text: `Generate a completely new, highly realistic image. ${prompt}

    Incorporate these text badges in a stylish, modern way: ${JSON.stringify(textOverlays)}.

    CRITICAL INSTRUCTIONS:
    - DO NOT just return the original image. Generate a completely new scene.
    - INFOGRAPHIC STYLE (CRITICAL): The product MUST be perfectly ironed, flawlessly neat, and symmetrically arranged. STRICTLY NO messy or wrinkled fabric.
    - BACKGROUND: Use a clean, minimalist, and brightly lit environment (like a modern, uncluttered studio or a very tidy, bright bedroom) so the text badges will be easily readable. Avoid heavy decor that distracts from the text.
    - COMPOSITION: Optimize perfectly for a ${aspectRatio} aspect ratio.
    - PRODUCT ACCURACY: The product must exactly match the reference images (color, material, precise sewing details).`
  });

  const response = await ai.models.generateContent({
    model: IMAGE_GEN_MODEL,
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: globalImageSize as any,
      },
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (!imagePart?.inlineData) throw new Error("Görsel oluşturulamadı.");
  return `data:image/png;base64,${imagePart.inlineData.data}`;
};

export const analyzeBoxContent = async (
  base64Images: string[],
  userContentDescription: string
): Promise<BoxContentAnalysis> => {
  const ai = getAiClient();
  const parts: any[] = [{
    text: `Create a knolling photography setup description. User list: ${userContentDescription}. Return JSON.`
  }];
  base64Images.forEach((b64) => parts.push({ inlineData: getInlineData(b64) }));

  const response = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          itemsList: { type: Type.ARRAY, items: { type: Type.STRING } },
          generationPrompt: { type: Type.STRING }
        },
        required: ["itemsList", "generationPrompt"]
      }
    }
  });
  return JSON.parse(response.text!) as BoxContentAnalysis;
};

export const generateBoxContentImage = async (
  prompt: string,
  referenceImagesBase64: string[],
  itemsList: string[],
  aspectRatio: string = "1:1"
): Promise<string> => {
  const ai = getAiClient();
  const parts: any[] = referenceImagesBase64.map((b64) => ({ inlineData: getInlineData(b64) }));
  parts.push({
    text: `Generate a new knolling layout image. ${prompt}
Items: ${itemsList.join(", ")}. DO NOT return original. Product must match references exactly. Optimize for ${aspectRatio}.`
  });

  const response = await ai.models.generateContent({
    model: IMAGE_GEN_MODEL,
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: globalImageSize as any,
      },
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (!imagePart?.inlineData) throw new Error("Görsel oluşturulamadı.");
  return `data:image/png;base64,${imagePart.inlineData.data}`;
};

export const analyzeProductAngles = async (
  base64Images: string[]
): Promise<ProductAnglesAnalysis> => {
  const ai = getAiClient();
  const parts: any[] = [{
    text: `You are an expert product photographer and textile specialist. Study ALL reference images carefully and extract:
      1. PIECE INVENTORY: Every piece with exact count.
      2. COLOR MAPPING: Base color and accent colors per piece.
      3. EMBROIDERY/PATTERN: Motif shape, exact position on each piece, thread color. State "no embroidery" if none.
      4. EDGE TREATMENT: Exact type (flat decorative strip / bias tape / piping / simple hem) and color. CRITICAL: Do NOT confuse decorative strips with piping.
      5. FABRIC CHARACTER: Glossy satin, matte percale, textured, etc.
      6. ROOM ATMOSPHERE: Select a room style that maximizes contrast with the product color. WHITE/LIGHT products → dark walls, deep wood, rich textures (product pops against dark). PASTEL products → warm neutrals, oak, linen. DARK/BOLD products → light neutral room, bright natural light. EARTH TONES → organic materials, warm plaster, rattan.
      Create a base prompt embedding ALL these exact details including the chosen room atmosphere. The prompt must produce authentic, highly realistic DSLR shots — no CGI look.
      Output JSON.`
  }];
  base64Images.forEach((b64) => parts.push({ inlineData: getInlineData(b64) }));

  const response = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productCategory: { type: Type.STRING },
          productFeatures: { type: Type.STRING },
          basePrompt: { type: Type.STRING }
        },
        required: ["productCategory", "productFeatures", "basePrompt"]
      }
    }
  });
  return JSON.parse(response.text!) as ProductAnglesAnalysis;
};

export const generateProductAngleImage = async (
  basePrompt: string,
  referenceImagesBase64: string[],
  angleConfig: { id: string; label: string; prompt: string },
  aspectRatio: string = "1:1"
): Promise<string> => {
  const ai = getAiClient();
  const parts: any[] = referenceImagesBase64.map((b64) => ({ inlineData: getInlineData(b64) }));
  parts.push({
    text: `Generate a completely new image. ${basePrompt} \n\n
    CAMERA ANGLE: ${angleConfig.prompt}

    CRITICAL INSTRUCTIONS:
    - DO NOT just return the original image. You must generate a new image from the specified camera angle.
    - ANGLE PRIORITY: You MUST strictly follow the CAMERA ANGLE instruction above. Adapt the environment to fit this specific angle (e.g., a macro shot shouldn't show the whole room, a birds-eye view should show the floor).
    - NEW ARCHITECTURE & REALISM: Design a completely new, AUTHENTIC background and furniture. STRICTLY NO CGI/3D render look. It must look like a genuine, cozy, high-end photograph. Avoid fake/fantastical backgrounds. Use believable interior design.
    - COMPOSITION: Optimize the placement and framing perfectly for a ${aspectRatio} aspect ratio.
    - PRODUCT ACCURACY: Ensure the product itself resembles the reference images perfectly, paying attention to exact textile details, sewing, and decorative elements.
    - High quality, authentic studio photography.`
  });

  const response = await ai.models.generateContent({
    model: IMAGE_GEN_MODEL,
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: globalImageSize as any,
      },
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (!imagePart?.inlineData) throw new Error("Görsel üretilemedi.");
  return `data:image/png;base64,${imagePart.inlineData.data}`;
};

export const reviseGeneratedImage = async (
  currentImageBase64: string,
  instruction: string,
  aspectRatio: string = "1:1",
  referenceImageBase64?: string
): Promise<string> => {
  const ai = getAiClient();
  const parts: any[] = [{ inlineData: getInlineData(currentImageBase64) }];
  if (referenceImageBase64) parts.push({ inlineData: getInlineData(referenceImageBase64) });

  parts.push({
    text: `Edit the image according to this instruction: ${instruction}.
    Maintain the overall style and quality.`
  });

  const response = await ai.models.generateContent({
    model: IMAGE_GEN_MODEL,
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: globalImageSize as any,
      },
    }
  });

  const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (!imagePart?.inlineData) throw new Error("Revizyon başarısız.");
  return `data:image/png;base64,${imagePart.inlineData.data}`;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// ══════════════════════════════════════════════
// Detail Control Agent — analyze cropped regions for micro-details
// ══════════════════════════════════════════════

export interface DetailAnalysis {
  pillow?: string;
  embroidery?: string;
  edge?: string;
  pattern?: string;
}

export const analyzeDetailCrops = async (
  croppedRegions: Record<string, string>
): Promise<DetailAnalysis> => {
  const ai = getAiClient();
  const result: DetailAnalysis = {};

  const regionPrompts: Record<string, string> = {
    embroidery: `You are examining a CLOSE-UP crop of embroidery/pattern on a bedding product. Describe with EXTREME precision:
- Exact motif shape (leaf, flower, geometric, abstract — be very specific)
- Number of motifs visible and their arrangement (scattered, clustered, border, centered)
- Thread color(s) and any color gradients
- Stitch type (satin stitch, chain stitch, cross stitch, etc.)
- Thread thickness (fine/medium/heavy)
- Direction of stitching
- Whether the embroidery is raised/3D or flat
- Symmetry or asymmetry of the design
- Any gaps, spacing between motifs
Write a single dense paragraph. Be specific enough that someone could recreate this embroidery exactly.`,

    edge: `You are examining a CLOSE-UP crop of the edge/border treatment on a bedding product. Describe with EXTREME precision:
- Exact type: piping (raised cord inside), flat decorative strip, bias tape, simple hem, ruffled edge, or other
- Width of the edge treatment in approximate mm
- Color(s) of the edge — is it same as fabric or contrasting?
- Stitching visible? Single line, double line, zigzag?
- Is it sewn on top of the fabric or folded over the edge?
- Texture difference from main fabric (shinier, matte, different weave?)
- Corner treatment (mitered, rounded, overlapped?)
Write a single dense paragraph. Be specific enough that someone could recreate this edge treatment exactly.`,

    pattern: `You are examining a CLOSE-UP crop of a FABRIC PATTERN on a bedding product (pike, jacquard, printed, woven). Describe with EXTREME precision:
- Pattern type: jacquard weave, quilted/pike texture, printed, embossed, or other
- Exact motif shapes (geometric diamonds, leaves, flowers, abstract, damask, etc.)
- Pattern repeat size (approximate cm)
- Pattern arrangement (grid, diagonal, scattered, bordered)
- Texture depth: is the pattern raised/3D (jacquard/pike) or flat (printed)?
- Color variations within the pattern (tone-on-tone, contrasting, gradient)
- Background texture between motifs (smooth, ribbed, waffle, honeycomb)
- Overall surface feel (matte, slight sheen, glossy)
Write a single dense paragraph. Be specific enough that someone could recreate this exact fabric pattern.`,

    pillow: `You are examining a CLOSE-UP crop of a decorative pillowcase from a bedding set. Describe with EXTREME precision:
- Overall shape and stuffing level (flat, medium, very plump)
- Main fabric color and texture
- Any embroidery: exact motif, position on pillowcase face, thread color
- Edge/border treatment on the pillowcase
- Any flange, ruffle, or decorative trim
- How the opening/closure side looks if visible
- Fabric sheen (matte, slight sheen, satin glossy)
Write a single dense paragraph. Be specific enough that someone could recreate this pillowcase exactly.`,
  };

  for (const [key, cropBase64] of Object.entries(croppedRegions)) {
    const promptText = regionPrompts[key];
    if (!promptText) continue;

    try {
      const parts: any[] = [
        { inlineData: getInlineData(cropBase64) },
        { text: promptText }
      ];

      const response = await ai.models.generateContent({
        model: ANALYSIS_MODEL,
        contents: { parts },
      });

      const text = response.text;
      if (text) {
        (result as any)[key] = text;
      }
    } catch {
      // Skip failed analysis
    }
  }

  return result;
};

// ══════════════════════════════════════════════
// Region detection — find pillow/embroidery/edge areas in reference images
// ══════════════════════════════════════════════

export interface RegionBox {
  imageIndex: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DetectedRegionsResult {
  pillow?: RegionBox;
  embroidery?: RegionBox;
  edge?: RegionBox;
  pattern?: RegionBox;
}

export const detectProductRegions = async (
  base64Images: string[]
): Promise<DetectedRegionsResult> => {
  const ai = getAiClient();

  const parts: any[] = [
    {
      text: `You are analyzing product photographs of a bedding set. For each region below, find the BEST reference image that shows it most clearly and return the bounding box coordinates as percentages (0-100).

Find these regions:
1. PILLOW — The decorative pillowcase that has embroidery or pattern. Find the single best pillow visible across all images. Return the bounding box that tightly frames just that one pillow.
2. EMBROIDERY — The embroidery, pattern, or textile detail area. Find the image where the embroidery/pattern is most visible and closest. Return a tight bounding box around JUST the embroidery motif area.
3. EDGE — The edge treatment (piping, bias tape, decorative strip, border, fringe/tassel). Find the image where the edge/border detail is most visible. Return a tight bounding box around just the edge area.
4. PATTERN — The fabric surface pattern (jacquard weave, pike/quilted texture, printed pattern, damask). Find the image where the fabric pattern/texture is most visible and closest. Return a tight bounding box around an area that clearly shows the repeating pattern. This is DIFFERENT from embroidery — this is the woven/printed pattern IN the fabric itself.

For each region, return:
- imageIndex: which image (0-based index) shows this best
- x: left edge as percentage of image width (0-100)
- y: top edge as percentage of image height (0-100)
- w: width as percentage of image width (0-100)
- h: height as percentage of image height (0-100)

If a region is not clearly visible in any image, omit it from the response.
Images are numbered starting from 0 in the order provided.`
    }
  ];

  base64Images.forEach((b64) => {
    parts.push({ inlineData: getInlineData(b64) });
  });

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pillow: {
              type: Type.OBJECT,
              properties: {
                imageIndex: { type: Type.NUMBER },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                w: { type: Type.NUMBER },
                h: { type: Type.NUMBER },
              },
            },
            embroidery: {
              type: Type.OBJECT,
              properties: {
                imageIndex: { type: Type.NUMBER },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                w: { type: Type.NUMBER },
                h: { type: Type.NUMBER },
              },
            },
            edge: {
              type: Type.OBJECT,
              properties: {
                imageIndex: { type: Type.NUMBER },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                w: { type: Type.NUMBER },
                h: { type: Type.NUMBER },
              },
            },
            pattern: {
              type: Type.OBJECT,
              properties: {
                imageIndex: { type: Type.NUMBER },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                w: { type: Type.NUMBER },
                h: { type: Type.NUMBER },
              },
            },
          },
        },
      },
    });

    return JSON.parse(response.text!) as DetectedRegionsResult;
  } catch {
    // If region detection fails, return empty — pipeline will use full references
    return {};
  }
};
