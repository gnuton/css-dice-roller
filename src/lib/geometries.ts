import { DieType, DieGeometry, TransformStep } from './types';

// Precise D4 (Tetrahedron)
const generateD4 = (): DieGeometry => {
  const r = 20.412;
  const tilt = 19.471;
  const ty = -14.433;

  const faceTransforms: Record<number, TransformStep[]> = {
    4: [
      { type: 'rotateX', value: -90 },
      { type: 'rotateZ', value: 180 },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty } // Moved to end (Local alignment)
    ],
    1: [{ type: 'rotateY', value: 0 }, { type: 'rotateX', value: tilt }, { type: 'translateZ', value: r }, { type: 'translateY', value: ty }],
    2: [{ type: 'rotateY', value: 120 }, { type: 'rotateX', value: tilt }, { type: 'translateZ', value: r }, { type: 'translateY', value: ty }],
    3: [{ type: 'rotateY', value: 240 }, { type: 'rotateX', value: tilt }, { type: 'translateZ', value: r }, { type: 'translateY', value: ty }],
  };

  const viewRotations: Record<number, { x: number; y: number; z?: number }> = {
    4: { x: 90, y: 0, z: 180 },
    1: { x: -tilt, y: 0 },
    2: { x: -tilt, y: -120 },
    3: { x: -tilt, y: -240 },
  };

  return { faceCount: 4, faceTransforms, viewRotations };
};

// Simplified D6 (Hexahedron)
const generateD6 = (): DieGeometry => {
  const faceTransforms: Record<number, TransformStep[]> = {
    1: [{ type: 'rotateY', value: 0 }, { type: 'rotateX', value: 0 }, { type: 'translateZ', value: 50 }],
    2: [{ type: 'rotateY', value: 90 }, { type: 'translateZ', value: 50 }],
    3: [{ type: 'rotateY', value: 180 }, { type: 'translateZ', value: 50 }],
    4: [{ type: 'rotateY', value: 270 }, { type: 'translateZ', value: 50 }],
    5: [{ type: 'rotateX', value: 90 }, { type: 'translateZ', value: 50 }],
    6: [{ type: 'rotateX', value: -90 }, { type: 'translateZ', value: 50 }],
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

// Precise D8 (Octahedron)
const generateD8 = (): DieGeometry => {
  const r = 40.825;
  const tilt = 35.264;
  const ty = -14.433;

  const faceTransforms: Record<number, TransformStep[]> = {};
  const viewRotations: Record<number, { x: number; y: number; z?: number }> = {};

  for (let i = 0; i < 4; i++) {
    const ry = i * 90;

    // Upper 4
    faceTransforms[i + 1] = [
      { type: 'rotateY', value: ry },
      { type: 'rotateX', value: tilt },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[i + 1] = { x: -tilt, y: -ry };

    // Lower 4
    faceTransforms[i + 5] = [
      { type: 'rotateY', value: ry },
      { type: 'rotateX', value: 180 - tilt },
      { type: 'rotateZ', value: 180 },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[i + 5] = { x: -(180 - tilt), y: -ry, z: 180 };
  }

  return { faceCount: 8, faceTransforms, viewRotations };
};

// Precise D10 (Pentagonal Trapezohedron)
const generateD10 = (): DieGeometry => {
  const r = 47.5;
  const tilt = 53.0;
  const ty = -10;

  const faceTransforms: Record<number, TransformStep[]> = {};
  const viewRotations: Record<number, { x: number; y: number; z?: number }> = {};

  for (let i = 0; i < 5; i++) {
    const ry = i * 72;

    // Upper 5
    const faceUpper = i * 2 + 1;
    faceTransforms[faceUpper] = [
      { type: 'rotateY', value: ry },
      { type: 'rotateX', value: tilt },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[faceUpper] = { x: -tilt, y: -ry };

    // Lower 5
    const ry_low = ry + 36;
    const faceLower = i * 2 + 2;
    faceTransforms[faceLower] = [
      { type: 'rotateY', value: ry_low },
      { type: 'rotateX', value: 180 - tilt },
      { type: 'rotateZ', value: 180 },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[faceLower] = { x: -(180 - tilt), y: -ry_low, z: 180 };
  }

  return { faceCount: 10, faceTransforms, viewRotations };
};

// Precise D12 (Dodecahedron)
const generateD12 = (): DieGeometry => {
  const r = 55.67;
  const tiltRing = 26.565;

  const faceTransforms: Record<number, TransformStep[]> = {};
  const viewRotations: Record<number, { x: number; y: number; z?: number }> = {};

  // Top
  faceTransforms[1] = [{ type: 'rotateX', value: 90 }, { type: 'translateZ', value: r }];
  viewRotations[1] = { x: -90, y: 0 };

  // Bottom
  faceTransforms[2] = [
    { type: 'rotateX', value: -90 },
    { type: 'rotateZ', value: 180 },
    { type: 'translateZ', value: r }
  ];
  viewRotations[2] = { x: 90, y: 0, z: 180 };

  for (let i = 0; i < 5; i++) {
    const ry = i * 72;

    // Upper ring
    faceTransforms[i + 3] = [
      { type: 'rotateY', value: ry },
      { type: 'rotateX', value: tiltRing },
      { type: 'translateZ', value: r }
    ];
    viewRotations[i + 3] = { x: -tiltRing, y: -ry };

    // Lower ring
    const ry_low = ry + 36;
    faceTransforms[i + 8] = [
      { type: 'rotateY', value: ry_low },
      { type: 'rotateX', value: 180 - tiltRing },
      { type: 'rotateZ', value: 180 },
      { type: 'translateZ', value: r }
    ];
    viewRotations[i + 8] = { x: -(180 - tiltRing), y: -ry_low, z: 180 };
  }

  return { faceCount: 12, faceTransforms, viewRotations };
};

// Precise D20 (Icosahedron)
// Precise D20 (Icosahedron)
const generateD20 = (): DieGeometry => {
  const r = 75.57;
  // CSS rotateX measures from the horizontal plane, not the vertical pole.
  // Using the complements of 37.378 and 79.188:
  const t1 = 52.622;
  const t2 = 10.812;
  const ty = -14.433;

  const faceTransforms: Record<number, TransformStep[]> = {};
  const viewRotations: Record<number, { x: number; y: number; z?: number }> = {};

  for (let i = 0; i < 5; i++) {
    const ry = i * 72;
    const ry2 = ry + 36;

    // Ring 1 (Top Pole)
    faceTransforms[i + 1] = [
      { type: 'rotateY', value: ry },
      { type: 'rotateX', value: t1 },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[i + 1] = { x: -t1, y: -ry };

    // Ring 2 (Upper Equator)
    faceTransforms[i + 6] = [
      { type: 'rotateY', value: ry2 },
      { type: 'rotateX', value: t2 },
      { type: 'rotateZ', value: 180 },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[i + 6] = { x: -t2, y: -ry2, z: 180 };

    // Ring 3 (Lower Equator)
    faceTransforms[i + 11] = [
      { type: 'rotateY', value: ry },
      { type: 'rotateX', value: 180 - t2 },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[i + 11] = { x: -(180 - t2), y: -ry };

    // Ring 4 (Bottom Pole)
    faceTransforms[i + 16] = [
      { type: 'rotateY', value: ry2 },
      { type: 'rotateX', value: 180 - t1 },
      { type: 'rotateZ', value: 180 },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[i + 16] = { x: -(180 - t1), y: -ry2, z: 180 };
  }

  return { faceCount: 20, faceTransforms, viewRotations };
};

export const GEOMETRIES: Record<DieType, DieGeometry> = {
  d4: generateD4(),
  d6: generateD6(),
  d8: generateD8(),
  d10: generateD10(),
  d12: generateD12(),
  d20: generateD20(),
};