export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
export interface DiceSet {
  id?: string;
  type: DieType;
  count: number;
  label?: string;
}

export type AnimationType = 'standard' | 'chaotic' | 'float' | 'demo' | 'none';
export type LayoutMode = 'grid' | 'circle' | 'pool' | 'tray';

export interface DebugOptions {
  showHitboxes: boolean;
  showVectors: boolean;
  showBoundaries: boolean;
  showTraces: boolean;
  [key: string]: boolean;
}

export interface DiceSettings {
  theme: string;
  baseColor: string;
  secondaryColor?: string;
  textColor?: string;
  scale: number;
  animation: AnimationType;
  layoutMode: LayoutMode;
  randomizeAnimation: boolean;
  constantSpin: boolean;
  speed: number;
  bounciness: number;
  gravity: number;
  dragEnabled: boolean;
  customSymbols: boolean;
  faceLabels?: Record<number, string>;
  textScale?: number;
  debugOptions?: DebugOptions;
  showInstructions?: boolean;
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
  // Radius for hit box calculation (at 200px base scale)
  effectiveRadius: number;
  // Radius used for rolling distance calculations
  rollingRadius: number;
}

