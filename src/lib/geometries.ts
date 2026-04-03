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
      { type: 'translateY', value: ty }
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

    // Upper 4 (Points UP)
    faceTransforms[i + 1] = [
      { type: 'rotateY', value: ry },
      { type: 'rotateX', value: tilt },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[i + 1] = { x: -tilt, y: -ry };

    // Lower 4 (Points DOWN, Uses Negative Tilt instead of 180-Tilt)
    faceTransforms[i + 5] = [
      { type: 'rotateY', value: ry },
      { type: 'rotateX', value: -tilt },
      { type: 'rotateZ', value: 180 }, // Spin to point down
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[i + 5] = { x: tilt, y: -ry, z: 180 };
  }

  return { faceCount: 8, faceTransforms, viewRotations };
};

// Precise D10 (Pentagonal Trapezohedron)
const generateD10 = (): DieGeometry => {
  const r = 65;
  const tilt = 38.5; // Optimized pitch for standard CSS kites
  const ty = 15;     // Centroid offset to join points perfectly

  const faceTransforms: Record<number, TransformStep[]> = {};
  const viewRotations: Record<number, { x: number; y: number; z?: number }> = {};

  for (let i = 0; i < 5; i++) {
    const ry1 = i * 72;
    const ry2 = ry1 + 36;

    // Upper 5
    const faceUpper = i * 2 + 1;
    faceTransforms[faceUpper] = [
      { type: 'rotateY', value: ry1 },
      { type: 'rotateX', value: tilt },
      { type: 'translateY', value: -ty }, // Pushes face up to close the pole
      { type: 'translateZ', value: r }
    ];
    viewRotations[faceUpper] = { x: -tilt, y: -ry1 };

    // Lower 5
    const faceLower = i * 2 + 2;
    faceTransforms[faceLower] = [
      { type: 'rotateY', value: ry2 },
      { type: 'rotateX', value: -tilt },
      { type: 'rotateZ', value: 180 },    // Spin upside down to interlock
      { type: 'translateY', value: -ty }, // Local "up" acts as global down
      { type: 'translateZ', value: r }
    ];
    viewRotations[faceLower] = { x: tilt, y: -ry2, z: 180 };
  }

  return { faceCount: 10, faceTransforms, viewRotations };
};


// Precise D12 (Dodecahedron)
const generateD12 = (): DieGeometry => {
  const r = 68.819; // Mathematical inradius
  const tiltRing = 26.565;

  const faceTransforms: Record<number, TransformStep[]> = {};
  const viewRotations: Record<number, { x: number; y: number; z?: number }> = {};

  // Face 1: Top
  faceTransforms[1] = [
    { type: 'rotateX', value: 90 },
    { type: 'rotateZ', value: 180 }, // Spun to present flat edges to the upper ring
    { type: 'translateZ', value: r }
  ];
  viewRotations[1] = { x: -90, y: 0, z: 180 };

  // Face 2: Bottom
  faceTransforms[2] = [
    { type: 'rotateX', value: -90 },
    { type: 'rotateZ', value: 180 }, // Spun to present flat edges to the lower ring
    { type: 'translateZ', value: r }
  ];
  viewRotations[2] = { x: 90, y: 0, z: 180 };

  for (let i = 0; i < 5; i++) {
    const ry1 = i * 72;
    const ry2 = ry1 + 36;

    // Upper ring (3-7)
    faceTransforms[i + 3] = [
      { type: 'rotateY', value: ry1 },
      { type: 'rotateX', value: tiltRing },
      { type: 'rotateZ', value: 180 }, // Spin upside down to mate flat edge to the top face
      { type: 'translateZ', value: r }
    ];
    viewRotations[i + 3] = { x: -tiltRing, y: -ry1, z: 180 };

    // Lower ring (8-12)
    faceTransforms[i + 8] = [
      { type: 'rotateY', value: ry2 },
      { type: 'rotateX', value: -tiltRing },
      // No rotateZ needed here; they point UP naturally, putting flat edges down
      { type: 'translateZ', value: r }
    ];
    viewRotations[i + 8] = { x: tiltRing, y: -ry2 };
  }

  return { faceCount: 12, faceTransforms, viewRotations };
};

// Precise D20 (Icosahedron)
const generateD20 = (): DieGeometry => {
  const r = 75.57;
  const t1 = 52.622;
  const t2 = 10.812;
  const ty = -14.433;

  const faceTransforms: Record<number, TransformStep[]> = {};
  const viewRotations: Record<number, { x: number; y: number; z?: number }> = {};

  for (let i = 0; i < 5; i++) {
    const ry1 = i * 72;
    const ry2 = ry1 + 36;

    // Ring 1 (Top Pole)
    faceTransforms[i + 1] = [
      { type: 'rotateY', value: ry1 },
      { type: 'rotateX', value: t1 },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[i + 1] = { x: -t1, y: -ry1 };

    // Ring 2 (Upper Equator) - MUST share ry1 with Top Pole
    faceTransforms[i + 6] = [
      { type: 'rotateY', value: ry1 },
      { type: 'rotateX', value: t2 },
      { type: 'rotateZ', value: 180 },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[i + 6] = { x: -t2, y: -ry1, z: 180 };

    // Ring 3 (Lower Equator) - MUST share ry2 with Bottom Pole
    faceTransforms[i + 11] = [
      { type: 'rotateY', value: ry2 },
      { type: 'rotateX', value: -t2 },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[i + 11] = { x: t2, y: -ry2 };

    // Ring 4 (Bottom Pole)
    faceTransforms[i + 16] = [
      { type: 'rotateY', value: ry2 },
      { type: 'rotateX', value: -t1 },
      { type: 'rotateZ', value: 180 },
      { type: 'translateZ', value: r },
      { type: 'translateY', value: ty }
    ];
    viewRotations[i + 16] = { x: t1, y: -ry2, z: 180 };
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