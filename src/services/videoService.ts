// Video generation from images using Canvas + MediaRecorder + FFmpeg for MP4

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegInstance.loaded) return ffmpegInstance;
  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

async function webmToMp4(webmBlob: Blob, onProgress?: (pct: number) => void): Promise<Blob> {
  onProgress?.(90);
  const ffmpeg = await getFFmpeg();
  const webmData = new Uint8Array(await webmBlob.arrayBuffer());
  await ffmpeg.writeFile("input.webm", webmData);
  onProgress?.(93);
  await ffmpeg.exec(["-i", "input.webm", "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "output.mp4"]);
  onProgress?.(98);
  const mp4Data = await ffmpeg.readFile("output.mp4");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Blob([(mp4Data as any).buffer ?? mp4Data], { type: "video/mp4" });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function recordCanvas(
  canvas: HTMLCanvasElement,
  fps: number,
  totalFrames: number,
  drawFrame: (frame: number, progress: number) => void,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9",
    videoBitsPerSecond: 8_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: "video/webm" }));
    };
    recorder.onerror = reject;
    recorder.start();

    let frame = 0;
    const render = () => {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }
      const progress = frame / totalFrames;
      onProgress?.(Math.round(progress * 85)); // 0-85% for recording, 85-100% for conversion
      drawFrame(frame, progress);
      frame++;
      requestAnimationFrame(render);
    };
    render();
  });
}

/**
 * Ken Burns Reveal Video — slow zoom-in/pan from hero image
 * Creates a 5-second MP4 video with smooth zoom toward center
 */
export async function generateKenBurnsVideo(
  imageBase64: string,
  durationSec: number = 5,
  onProgress?: (pct: number) => void
): Promise<string> {
  const img = await loadImage(imageBase64);
  const fps = 30;
  const totalFrames = durationSec * fps;

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d")!;

  const webmBlob = await recordCanvas(canvas, fps, totalFrames, (_frame, progress) => {
    const zoom = 1.0 + progress * 0.3;
    const panX = progress * 0.08;
    const panY = progress * 0.04;
    const sw = img.naturalWidth / zoom;
    const sh = img.naturalHeight / zoom;
    const sx = (img.naturalWidth - sw) * (0.3 + panX);
    const sy = (img.naturalHeight - sh) * (0.2 + panY);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  }, onProgress);

  const mp4Blob = await webmToMp4(webmBlob, onProgress);
  onProgress?.(100);
  return URL.createObjectURL(mp4Blob);
}

/**
 * Carousel/Slider Video — shows all pipeline images with smooth transitions
 * Each image shown for ~2.5 seconds with 0.5s crossfade, output as MP4
 */
export async function generateCarouselVideo(
  imageBase64List: string[],
  perImageSec: number = 3.5,
  transitionSec: number = 1.0,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (imageBase64List.length === 0) throw new Error("En az 1 görsel gerekli");

  const images = await Promise.all(imageBase64List.map(loadImage));
  const fps = 30;
  const totalDuration = imageBase64List.length * perImageSec;
  const totalFrames = Math.round(totalDuration * fps);

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d")!;

  const drawImageFill = (img: HTMLImageElement, alpha: number) => {
    ctx.globalAlpha = alpha;
    const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    ctx.drawImage(img, x, y, w, h);
  };

  const webmBlob = await recordCanvas(canvas, fps, totalFrames, (frameNum) => {
    const time = frameNum / fps;
    const imgIndex = Math.min(Math.floor(time / perImageSec), images.length - 1);
    const timeInSlide = time - imgIndex * perImageSec;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (timeInSlide > perImageSec - transitionSec && imgIndex < images.length - 1) {
      const fadeProgress = (timeInSlide - (perImageSec - transitionSec)) / transitionSec;
      drawImageFill(images[imgIndex], 1 - fadeProgress);
      drawImageFill(images[imgIndex + 1], fadeProgress);
    } else {
      drawImageFill(images[imgIndex], 1);
    }
    ctx.globalAlpha = 1;
  }, onProgress);

  const mp4Blob = await webmToMp4(webmBlob, onProgress);
  onProgress?.(100);
  return URL.createObjectURL(mp4Blob);
}
