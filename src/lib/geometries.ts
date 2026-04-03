import { DieType, DieGeometry, TransformStep } from './types';

// Simplified D6 (Hexahedron) Baseline
const generateD6 = (): DieGeometry => {
  const faceTransforms: Record<number, TransformStep[]> = {
    // Standard cube mapping
    1: [{ type: 'translateZ', value: 50 }], // Front
    2: [{ type: 'rotateY', value: 90 }, { type: 'translateZ', value: 50 }], // Right
    3: [{ type: 'rotateY', value: 180 }, { type: 'translateZ', value: 50 }], // Back
    4: [{ type: 'rotateY', value: 270 }, { type: 'translateZ', value: 50 }], // Left
    5: [{ type: 'rotateX', value: 90 }, { type: 'translateZ', value: 50 }], // Top
    6: [{ type: 'rotateX', value: -90 }, { type: 'translateZ', value: 50 }], // Bottom
  };
  const viewRotations: Record<number, { x: number; y: number }> = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: -90 },
    3: { x: 0, y: -180 },
    4: { x: 0, y: -270 },
    5: { x: -90, y: 0 },
    6: { x: 90, y: 0 },
  };
  return { faceCount: 6, faceTransforms, viewRotations };
};

// All other dice disabled for reset stabilization
const placeholder = (count: number): DieGeometry => ({
    faceCount: count,
    faceTransforms: {},
    viewRotations: {}
});

export const GEOMETRIES: Record<DieType, DieGeometry> = {
  d4: placeholder(4),
  d6: generateD6(),
  d8: placeholder(8),
  d10: placeholder(10),
  d12: placeholder(12),
  d20: placeholder(20),
};
