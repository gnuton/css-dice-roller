import { describe, it, expect } from 'vitest';
import { GEOMETRIES } from './geometries';
import { DieType } from './types';

describe('GEOMETRIES', () => {
  const dieTypes: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

  it('should contain all supported die types', () => {
    dieTypes.forEach(type => {
      expect(GEOMETRIES).toHaveProperty(type);
    });
  });

  it('should have consistent face counts', () => {
    expect(GEOMETRIES.d4.faceCount).toBe(4);
    expect(GEOMETRIES.d6.faceCount).toBe(6);
    expect(GEOMETRIES.d8.faceCount).toBe(8);
    expect(GEOMETRIES.d10.faceCount).toBe(10);
    expect(GEOMETRIES.d12.faceCount).toBe(12);
    expect(GEOMETRIES.d20.faceCount).toBe(20);
  });

  it('should have transforms for every face', () => {
    dieTypes.forEach(type => {
      const { faceCount, faceTransforms } = GEOMETRIES[type];
      for (let i = 1; i <= faceCount; i++) {
        expect(faceTransforms).toHaveProperty(i.toString());
        expect(faceTransforms[i].length).toBeGreaterThan(0);
      }
    });
  });

  it('should have view rotations for every face', () => {
    dieTypes.forEach(type => {
      const { faceCount, viewRotations } = GEOMETRIES[type];
      for (let i = 1; i <= faceCount; i++) {
        expect(viewRotations).toHaveProperty(i.toString());
        expect(viewRotations[i]).toHaveProperty('x');
        expect(viewRotations[i]).toHaveProperty('y');
      }
    });
  });
});
