import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Die } from './dice';
import { DiceSettings } from './types';

describe('Die', () => {
  let container: HTMLElement;
  const defaultSettings: DiceSettings = {
    theme: 'theme-glass',
    scale: 100,
    speed: 1,
    animation: 'standard',
    randomizeAnimation: false,
    constantSpin: false,
    dragEnabled: true,
    baseColor: '#ff0000',
    layoutMode: 'grid'
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('should initialize correctly for all die types', () => {
    const types = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const;
    types.forEach(type => {
      const die = new Die(type, container, defaultSettings);
      expect(die).toBeDefined();
      expect(container.querySelector(`.dice-wrapper.${type}`)).not.toBeNull();
      expect(die.result).toBe(1);
    });
  });
  
  it('should throw an error for unsupported die types', () => {
    expect(() => new Die('d100' as any, container, defaultSettings)).toThrow('Unsupported die type: d100');
  });

  it('should apply initial settings correctly', () => {
    new Die('d6', container, defaultSettings);
    const element = container.querySelector('.dice-wrapper') as HTMLElement;
    
    expect(element.style.getPropertyValue('--dice-size')).toBe('100px');
    expect(element.style.getPropertyValue('--dice-animation-duration')).toBe('1s');
    expect(element.classList.contains('theme-glass')).toBe(true);
    expect(element.style.getPropertyValue('--dice-color')).toBe('#ff0000');
  });

  it('should update settings correctly', () => {
    const die = new Die('d6', container, defaultSettings);
    const element = container.querySelector('.dice-wrapper') as HTMLElement;

    die.updateSettings({ theme: 'theme-solid', scale: 150 });

    expect(element.classList.contains('theme-solid')).toBe(true);
    expect(element.classList.contains('theme-glass')).toBe(false);
    expect(element.style.getPropertyValue('--dice-size')).toBe('150px');
  });

  it('should rebuild faces on scale change', () => {
    const die = new Die('d6', container, defaultSettings);
    const resultElement = container.querySelector('.dice-result') as HTMLElement;
    
    // Initial faces
    const initialFaces = Array.from(resultElement.querySelectorAll('.die-face'));
    const initialTransforms = initialFaces.map(f => (f as HTMLElement).style.transform);

    die.updateSettings({ scale: 200 });

    const newFaces = Array.from(resultElement.querySelectorAll('.die-face'));
    const newTransforms = newFaces.map(f => (f as HTMLElement).style.transform);

    expect(newTransforms).not.toEqual(initialTransforms);
  });

  it('should set result correctly', () => {
    const die = new Die('d6', container, defaultSettings);
    die.setResult(3);
    expect(die.result).toBe(3);
    
    const resultElement = container.querySelector('.dice-result') as HTMLElement;
    // For D6 face 3, rotation is { x: 0, y: -180 }
    expect(resultElement.style.transform).toContain('rotateX(0deg)');
    expect(resultElement.style.transform).toContain('rotateY(-180deg)');
  });

  it('should handle removal', () => {
    const die = new Die('d6', container, defaultSettings);
    expect(container.children.length).toBe(1);
    die.remove();
    expect(container.children.length).toBe(0);
  });

  it('should enable/disable drag mode', () => {
    const die = new Die('d6', container, defaultSettings);
    const element = container.querySelector('.dice-wrapper') as HTMLElement;
    
    expect(element.classList.contains('drag-mode')).toBe(true);
    
    die.updateSettings({ dragEnabled: false });
    expect(element.classList.contains('drag-mode')).toBe(false);
  });

  it('should roll instantly when animation is none', async () => {
    const die = new Die('d6', container, { ...defaultSettings, animation: 'none' });
    const result = await die.roll();
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(6);
    expect(die.result).toBe(result);
  });

  it('should handle roll animation', async () => {
    vi.useFakeTimers();
    const die = new Die('d6', container, { ...defaultSettings, speed: 1, randomizeAnimation: true });
    
    // Start roll
    const rollPromise = die.roll();
    
    expect(container.querySelector('.is-rolling')).not.toBeNull();
    
    // Advance timers for the main roll duration (1s) + the timeout fallback (0.8s)
    await vi.advanceTimersByTimeAsync(1800);
    
    const result = await rollPromise;
    expect(result).toBeGreaterThanOrEqual(1);
    expect(container.querySelector('.is-rolling')).toBeNull();
    
    vi.useRealTimers();
  });

  it('should render custom face labels', () => {
    const faceLabels = { 1: 'ONE', 6: '<span class="icon">★</span>' };
    new Die('d6', container, { ...defaultSettings, faceLabels });

    const face1 = container.querySelector('.die-face[data-face="1"] .face-content') as HTMLElement;
    const face6 = container.querySelector('.die-face[data-face="6"] .face-content') as HTMLElement;
    const face2 = container.querySelector('.die-face[data-face="2"] .face-content') as HTMLElement;

    expect(face1.textContent).toBe('ONE');
    expect(face6.innerHTML).toBe('<span class="icon">★</span>');
    // Default fallback
    expect(face2.textContent).toBe('2');
  });

  it('should update face labels dynamically without rebuilding', () => {
    const die = new Die('d6', container, defaultSettings);
    const face1 = container.querySelector('.die-face[data-face="1"] .face-content') as HTMLElement;
    
    expect(face1.textContent).toBe('1');

    die.updateSettings({ faceLabels: { 1: 'NEW' } });
    
    expect(face1.textContent).toBe('NEW');
  });
});
