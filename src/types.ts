export type LanguageMode = 'en' | 'ur' | 'both';

export type ScreenId =
  | 'home'
  | 'coloring'
  | 'alphabet'
  | 'numbers'
  | 'animals'
  | 'fruits'
  | 'quiz'
  | 'gallery'
  | 'rewards'
  | 'settings';

export type ColoringCategory = 'All' | 'Animals' | 'Fruits' | 'Vehicles' | 'Birds';

export type PaletteName = 'Rainbow' | 'Pastel' | 'Nature';

export interface GalleryItem {
  id: number;
  titleEn: string;
  titleUr: string;
  dataUrl: string;
  createdAt: string;
}

export interface AppState {
  stars: number;
  sound: boolean;
  voice: boolean;
  lang: LanguageMode;
  gallery: GalleryItem[];
  selectedPalette: PaletteName;
  selectedColor: string;
  selectedTemplateId: string;
}

export interface ColoringRegion {
  id: string;
  tag: 'path' | 'circle' | 'ellipse' | 'rect' | 'polygon';
  attrs: Record<string, string | number>;
  suggestedColor: string;
}

export interface ColoringDetail {
  tag: 'path' | 'circle' | 'ellipse' | 'rect' | 'polygon' | 'line';
  attrs: Record<string, string | number>;
}

export interface ColoringTemplate {
  id: string;
  category: Exclude<ColoringCategory, 'All'>;
  titleEn: string;
  titleUr: string;
  emoji: string;
  starsRequired: number;
  regions: ColoringRegion[];
  details: ColoringDetail[];
}

export interface AlphabetItem {
  letter: string;
  wordEn: string;
  wordUr: string;
  emoji: string;
  accent: string;
}

export interface NumberItem {
  num: number;
  en: string;
  ur: string;
  emoji: string;
}

export interface AnimalItem {
  nameEn: string;
  nameUr: string;
  sound: string;
  soundUr: string;
  emoji: string;
  bgFrom: string;
  bgTo: string;
}

export interface FruitItem {
  nameEn: string;
  nameUr: string;
  colorEn: string;
  colorUr: string;
  emoji: string;
  bgFrom: string;
  bgTo: string;
}

export interface QuizOption {
  id: string;
  labelEn: string;
  labelUr: string;
  emoji?: string;
}

export interface QuizQuestion {
  id: string;
  promptEn: string;
  promptUr: string;
  options: QuizOption[];
  correctIndex: number;
}

export interface TrophyItem {
  id: string;
  titleEn: string;
  titleUr: string;
  descEn: string;
  descUr: string;
  icon: string;
  starsRequired: number;
}

export interface CelebrationData {
  titleEn: string;
  titleUr: string;
  messageEn: string;
  messageUr: string;
  starsAdded?: number;
  icon?: string;
}

declare global {
  interface Window {
    AndroidBridge?: {
      speak?: (text: string, langCode: string) => void;
      stopSpeaking?: () => void;
      vibrate?: (ms: number) => void;
      saveArtwork?: (base64Png: string, filename: string) => boolean;
      saveImageToDevice?: (base64Png: string, filename: string) => boolean;
    };
    handleHardwareBack?: () => boolean;
    handleAndroidBack?: () => boolean;
  }
}
