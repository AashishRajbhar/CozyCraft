export type ActiveView = 
  | 'dashboard' 
  | 'text-to-voice' 
  | 'file-converter' 
  | 'bg-remover' 
  | 'qr-code' 
  | 'barcode-reader';

export type NavTab = 'studio' | 'favorites' | 'recents';

export type ToolCategory = 'all' | 'audio' | 'images' | 'converters' | 'utilities';

export interface ToolItem {
  id: string;
  view: ActiveView;
  title: string;
  description: string;
  tag: string;
  category: ToolCategory;
  accentColor: 'lavender' | 'sage' | 'peach';
  footerTag: string;
  iconName: string;
  isFavorite?: boolean;
}

export interface DoneWorkItem {
  id: string;
  name: string;
  status: 'Ready' | 'Processing' | 'Completed';
  categoryText: string;
  sizeText: string;
  timeAgoText: string;
  iconType: 'pdf' | 'audio' | 'image' | 'video' | 'qr' | 'barcode';
  accentColor: 'lavender' | 'sage' | 'peach';
  hasPreview?: boolean;
  downloadUrl?: string;
  previewData?: {
    title: string;
    type: string;
    details: string;
    duration?: string;
    audioUrl?: string;
  };
}

export interface VoicePersona {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  letter: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  gender: 'female' | 'male' | 'neutral';
  defaultPitch: number;
  defaultRate: number;
  whisperSupport: boolean;
}

export interface AudioGeneration {
  id: string;
  fileName: string;
  personaName: string;
  durationText: string;
  durationSeconds: number;
  sizeText: string;
  format: 'mp3' | 'wav';
  text: string;
  timestamp: string;
  audioBlobUrl?: string;
}
