export type BodySize = 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large';
export type ExpressionPreset = 'default' | 'smiling' | 'angry' | 'horny' | 'custom';
export type HairstyleOption = 'default' | 'custom-text' | 'custom-image';
export type CameraAngle = 'auto' | 'front' | 'side' | 'back' | 'over-shoulder' | 'behind-close' | 'low-angle' | 'high-angle' | 'top-down' | 'dutch-angle' | 'custom';
export type AspectRatio = 'auto' | '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | '21:9' | '4:5' | '5:4' | '7:5' | '5:7' | 'custom';
export type AIModel = 'google/gemini-3-pro-image-preview' | 'google/gemini-2.5-flash-image';
export type LightingOption = 'auto' | 'natural' | 'studio' | 'golden-hour' | 'dramatic' | 'neon' | 'soft' | 'backlit' | 'candlelight' | 'moody';
export type DetailLevel = 'auto' | 'ultra' | 'high' | 'medium' | 'low';
export type PosePreset = 'none' | 'standing' | 'sitting' | 'lying-down' | 'kneeling' | 'crawling' | 'squatting' | 'leaning' | 'arched-back' | 'on-all-fours' | 'side-lying' | 'bent-over' | 'looking-back' | 'hands-and-knees' | 'custom';

export interface Prop {
  id: string;
  name: string;
  imageData: string | null;
  placement: string;
}

export interface CharacterConfig {
  id: string;
  label: string;
  faceImage: string | null;
  clothingImage: string | null;
  clothingText: string;
  poseReferenceImage: string | null;
  hairstyleOption: HairstyleOption;
  hairstyleText: string;
  hairstyleImage: string | null;
  chestSize: BodySize;
  buttSize: BodySize;
  stomachSize: BodySize;
  expressionPreset: ExpressionPreset;
  customExpression: string;
  actionPrompt: string;
  posePreset: PosePreset;
  props: Prop[];
}

export interface GenerationSettings {
  model: AIModel;
  aspectRatio: AspectRatio;
  customAspectRatio: string;
  cameraAngle: CameraAngle;
  customCameraAngle: string;
  backgroundImage: string | null;
  backgroundText: string;
  lighting: LightingOption;
  skinDetail: DetailLevel;
  eyeDetail: DetailLevel;
}

export interface GeneratedImage {
  id: string;
  imageData: string;
  prompt: string;
  characters: CharacterConfig[];
  settings: GenerationSettings;
  timestamp: number;
}

export function createDefaultCharacter(id: string, index: number): CharacterConfig {
  return {
    id,
    label: `Person ${index + 1}`,
    faceImage: null,
    clothingImage: null,
    clothingText: '',
    poseReferenceImage: null,
    hairstyleOption: 'default',
    hairstyleText: '',
    hairstyleImage: null,
    chestSize: 'medium',
    buttSize: 'medium',
    stomachSize: 'medium',
    expressionPreset: 'default',
    customExpression: '',
    actionPrompt: '',
    posePreset: 'none',
    props: [],
  };
}
