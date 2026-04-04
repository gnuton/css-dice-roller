export type DieType = 'd4' | 'd6' | 'd8' | 'd12' | 'd20';

export type AnimationType = 'standard' | 'chaotic' | 'float' | 'demo' | 'none';

export interface DiceSettings {
  theme: string;
  baseColor: string;
  secondaryColor?: string;
  textColor?: string;
  scale: number;
  animation: AnimationType;
  randomizeAnimation: boolean;
  constantSpin: boolean;
  speed: number;
  dragEnabled: boolean;
  faceLabels?: Record<number, string>;
}

export interface TransformStep {
  type: 'rotateX' | 'rotateY' | 'rotateZ' | 'translateZ' | 'translateY' | 'translateX' | 'scale';
  value: number;
}

export interface DieGeometry {
  faceCount: number;
  // Positioning faces in 3D space
  faceTransforms: Record<number, TransformStep[]>;
  // Bringing a specific face to front
  viewRotations: Record<number, { x: number; y: number; z?: number }>;
}
