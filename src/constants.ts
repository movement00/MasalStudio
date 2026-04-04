import type { AngleOption } from "./types";

export const MAX_FILES = 10;

export const ASPECT_RATIOS = [
  { label: "1:1", value: "1:1", icon: "square" },
  { label: "2:3", value: "2:3", icon: "portrait-tall" },
  { label: "3:4", value: "3:4", icon: "portrait" },
  { label: "4:3", value: "4:3", icon: "landscape" },
  { label: "9:16", value: "9:16", icon: "story" },
  { label: "16:9", value: "16:9", icon: "wide" },
];

export const ANGLE_OPTIONS: AngleOption[] = [
  {
    id: "cover_front",
    label: "Kapak (Ön Yüz)",
    prompt: "The children's storybook standing upright at slight angle, cover facing camera directly. Clean pastel background. Soft directional light from left. The cover illustration must be TACK SHARP and fully visible. Shot at f/5.6 with 85mm lens. Premium product photography.",
    icon: "camera",
  },
  {
    id: "open_pages",
    label: "Açık Sayfalar",
    prompt: "The book laying open showing a beautiful illustrated double-page spread. Camera at ~40° angle looking down. Pages slightly curling naturally. The 3D cartoon illustrations clearly visible. Warm reading-time lighting. Cozy props nearby (cushion, toy).",
    icon: "bed",
  },
  {
    id: "flatlay_props",
    label: "Flat-Lay + Props",
    prompt: "Perfectly overhead bird's-eye view. The book centered (cover up) on a pastel surface. Around it: colored pencils fanned out, star stickers, a small stuffed toy, confetti. Pinterest-style aesthetic. Even diffused lighting, no harsh shadows.",
    icon: "eye",
  },
  {
    id: "cover_detail",
    label: "Kapak Detay (Makro)",
    prompt: "Extreme close-up of the book cover illustration. The 3D cartoon character's face and details filling the frame. Paper/card texture visible. Shot at f/4 macro with shallow depth of field — tack sharp center, creamy bokeh edges. Side lighting to reveal print texture.",
    icon: "search",
  },
  {
    id: "lifestyle_cozy",
    label: "Yaşam Alanı (Rahat)",
    prompt: "The book on a cozy reading spot — a soft blanket, fairy lights in bokeh background, a warm mug nearby. Camera at eye level. The book slightly leaning, cover visible. Warm golden bedtime story atmosphere. Shot at f/2.8 for dreamy background separation.",
    icon: "home",
  },
  {
    id: "gift_wrap",
    label: "Hediye Konsepti",
    prompt: "The book presented as a gift — sitting on tissue paper with a beautiful ribbon, small confetti stars, a birthday card. The cover faces the camera. Bright, joyful, celebration atmosphere. Perfect for 'gift idea' marketing content.",
    icon: "arrow-up",
  },
];

export const PIECE_PRESETS = [
  {
    count: 0,
    label: "Otomatik",
    pieces: "",
  },
  {
    count: 1,
    label: "Tek Kitap",
    pieces: "1 kişiselleştirilmiş çocuk hikaye kitabı",
  },
  {
    count: 2,
    label: "2 Kitap",
    pieces: "2 farklı kişiselleştirilmiş çocuk hikaye kitabı",
  },
  {
    count: 3,
    label: "3 Kitap",
    pieces: "3 farklı kişiselleştirilmiş çocuk hikaye kitabı (koleksiyon set)",
  },
];

export const INFOGRAPHIC_OPTIONS: Record<string, { title: string; icon: string; options: string[] }> = {
  format: {
    title: "Kitap Formatı",
    icon: "thread",
    options: ["A4 Boyut", "Yumuşak Kapak", "Renkli Baskı", "Kaliteli Kağıt", "Parlak Kapak"],
  },
  personalization: {
    title: "Kişiselleştirme",
    icon: "sparkle",
    options: ["İsimle Kişisel", "Fotoğrafla 3D Karakter", "Yaşa Uygun İçerik", "Benzersiz Hikaye", "AI ile Üretildi"],
  },
  content: {
    title: "İçerik",
    icon: "palette",
    options: ["Pixar Kalitesi", "Eğitici İçerik", "Türkçe Hikaye", "Renkli İllüstrasyonlar", "Macera Dolu"],
  },
  audience: {
    title: "Hedef Kitle",
    icon: "wind",
    options: ["0-3 Yaş", "3-6 Yaş", "6-12 Yaş", "Doğum Günü Hediyesi", "Özel Gün Hediyesi"],
  },
  features: {
    title: "Özellikler",
    icon: "leaf",
    options: ["14 Hikaye Seçeneği", "Hızlı Teslimat", "Güvenli Ödeme", "Ücretsiz Kargo", "İade Garantisi"],
  },
};
