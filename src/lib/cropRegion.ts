/**
 * Client-side image cropping utility.
 * Takes a base64 image and a bounding box (percentage-based),
 * returns a new base64 image of just that region.
 */

export interface BoundingBox {
  /** Left edge as percentage (0-100) of image width */
  x: number;
  /** Top edge as percentage (0-100) of image height */
  y: number;
  /** Width as percentage (0-100) of image width */
  w: number;
  /** Height as percentage (0-100) of image height */
  h: number;
}

export interface RegionMap {
  /** Which reference image index (0-based) contains this region */
  imageIndex: number;
  /** Bounding box in percentage coordinates */
  box: BoundingBox;
}

export interface DetectedRegions {
  pillow?: RegionMap;
  embroidery?: RegionMap;
  edge?: RegionMap;
}

/**
 * Crops a region from a base64 image using Canvas API.
 * @param base64Image - Full base64 data URL (data:image/...;base64,...)
 * @param box - Bounding box in percentage coordinates
 * @param outputSize - Target output size in pixels (square crop expanded to this)
 * @returns Promise<string> - Cropped base64 data URL
 */
export function cropRegion(
  base64Image: string,
  box: BoundingBox,
  outputSize: number = 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas context unavailable")); return; }

        // Convert percentage to pixels
        const sx = Math.round((box.x / 100) * img.naturalWidth);
        const sy = Math.round((box.y / 100) * img.naturalHeight);
        const sw = Math.round((box.w / 100) * img.naturalWidth);
        const sh = Math.round((box.h / 100) * img.naturalHeight);

        // Output canvas — maintain aspect ratio but cap at outputSize
        const scale = Math.min(outputSize / sw, outputSize / sh, 1);
        canvas.width = Math.round(sw * scale);
        canvas.height = Math.round(sh * scale);

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load image for cropping"));
    img.src = base64Image;
  });
}

/**
 * Crops multiple regions from reference images.
 * Returns a map of region name → cropped base64 image.
 */
export async function cropDetectedRegions(
  referenceImages: string[],
  regions: DetectedRegions
): Promise<{ pillow?: string; embroidery?: string; edge?: string }> {
  const result: { pillow?: string; embroidery?: string; edge?: string } = {};

  for (const [key, region] of Object.entries(regions)) {
    if (!region || region.imageIndex >= referenceImages.length) continue;
    try {
      const cropped = await cropRegion(referenceImages[region.imageIndex], region.box);
      (result as any)[key] = cropped;
    } catch {
      // Skip failed crops — will use full reference images as fallback
    }
  }

  return result;
}
