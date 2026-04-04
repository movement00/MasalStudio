export interface ProductAnalysis {
  productCategory: string;
  marketingDescription: string;
  generationPrompt: string;
  suggestedTitle: string;
  signatureDetails: string;
  pieceInfo?: string;
}

export interface InfographicAnalysis {
  materialType: string;
  keyFeatures: string[];
  textOverlays: string[];
  generationPrompt: string;
  marketingHeadline: string;
}

export interface BoxContentAnalysis {
  itemsList: string[];
  generationPrompt: string;
}

export interface ProductAnglesAnalysis {
  productCategory: string;
  productFeatures: string;
  basePrompt: string;
}

export interface GeneratedImage {
  imageUrl: string;
  promptUsed: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
}

export type AppMode = 'pipeline' | 'photography' | 'infographic' | 'box-content' | 'angles' | 'social-media' | 'seo-content';
export type ProcessStep = 'idle' | 'analyzing' | 'selection' | 'generating' | 'done' | 'error' | 'pipeline-running' | 'pipeline-done' | 'social-media-running' | 'social-media-done';

export interface AngleOption {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}
