export type ImageSize = "1K" | "2K" | "4K";

export type ImageStyle = 
  | "watercolor"
  | "claymation"
  | "crayon"
  | "digital_art"
  | "storybook_sketch";

export type VoiceName = "Kore" | "Puck" | "Charon" | "Fenrir" | "Zephyr";

export type VoiceTone = "cheerful" | "calm_bedtime" | "dramatic_adventure" | "silly_playful";

export interface StoryPage {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
  imageUrl?: string;
  audioBase64?: string;
  isGeneratingImage?: boolean;
  isGeneratingAudio?: boolean;
}

export interface Story {
  id: string;
  title: string;
  subtitle?: string;
  targetAge: string; // e.g. "3-5", "6-8", "9-12"
  genre: string; // "Adventure", "Fantasy", "Bedtime", "Animals", "Space"
  mainCharacter: string;
  coverImageUrl?: string;
  pages: StoryPage[];
  createdAt: number;
  themeColor?: string;
}

export type ChatRole = "buddy" | "hero" | "guide";

export type ChatModel = "gemini-3.1-flash-lite" | "gemini-3.5-flash" | "gemini-3.1-pro-preview";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: number;
  modelUsed?: string;
}

export interface GenerateStoryRequest {
  topic: string;
  targetAge: string;
  genre: string;
  mainCharacter: string;
  pageCount: number;
  imageStyle?: ImageStyle;
  imageSize?: ImageSize;
}

export interface GenerateImageRequest {
  prompt: string;
  imageSize: ImageSize;
  style?: ImageStyle;
  characterDescription?: string;
}

export interface GenerateTTSRequest {
  text: string;
  voiceName: VoiceName;
  tone?: VoiceTone;
}

export interface ChatRequest {
  messages: { role: "user" | "model"; content: string }[];
  chatRole: ChatRole;
  chatModel: ChatModel;
  storyContext?: {
    title: string;
    mainCharacter: string;
    summary: string;
    currentPageText?: string;
  };
}
