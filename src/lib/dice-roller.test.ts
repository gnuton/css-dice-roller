import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DiceRoller } from './dice-roller';
import { Die } from './dice';

describe('DiceRoller', () => {
  let container: HTMLElement;
  let roller: DiceRoller;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    roller = new DiceRoller(container, 100);
    
    // Mock the roll method as happy-dom doesn't support transitionend events
    vi.spyOn(Die.prototype, 'roll').mockImplementation(async function() {
        return 4; // Mock result
    });
  });

  it('should initialize with zero dice', () => {
    expect(roller.getDiceCount()).toBe(0);
  });

  it('should add a die correctly', () => {
    roller.addDie('d6');
    expect(roller.getDiceCount()).toBe(1);
    expect(container.querySelectorAll('.dice-wrapper.d6').length).toBe(1);
  });

  it('should add multiple dice', () => {
    roller.addDie('d4', 2);
    roller.addDie('d6', 1);
    expect(roller.getDiceCount()).toBe(3);
    expect(container.querySelectorAll('.dice-wrapper').length).toBe(3);
  });

  it('should clear all dice', () => {
    roller.addDie('d4');
    roller.addDie('d6');
    expect(roller.getDiceCount()).toBe(2);
    
    roller.clear();
    expect(roller.getDiceCount()).toBe(0);
    expect(container.querySelectorAll('.dice-wrapper').length).toBe(0);
  });

  it('should roll dice and return results', async () => {
    roller.addDie('d6', 2);
    
    // In a real scenario, we might want to mock the Math.random or the Die class
    // but for now, we just verify the return type.
    const results = await roller.rollAll();
    expect(results).toHaveLength(2);
    results.forEach(res => {
      expect(res).toBeGreaterThanOrEqual(1);
      expect(res).toBeLessThanOrEqual(6);
    });
  }, 10000); // Increase timeout for the 2.5s wait

  it('should return empty array when rolling no dice', async () => {
    const results = await roller.rollAll();
    expect(results).toEqual([]);
  });

  it('should allow batch updating settings', () => {
    roller.addDie('d6', 5);
    roller.updateSettings({ theme: 'theme-neon', scale: 120 });
    
    const elements = container.querySelectorAll('.dice-wrapper');
    elements.forEach(el => {
      const htmlEl = el as HTMLElement;
      expect(htmlEl.classList.contains('theme-neon')).toBe(true);
      expect(htmlEl.style.getPropertyValue('--dice-size')).toBe('120px');
    });
  });

  it('should not throw when adding 0 dice', () => {
    expect(() => roller.addDie('d20', 0)).not.toThrow();
    expect(roller.getDiceCount()).toBe(0);
  });

  it('should return current settings', () => {
    const settings = roller.getSettings();
    expect(settings.theme).toBe('theme-glass');
    expect(settings.scale).toBe(100);
    expect(settings.speed).toBe(2.5);
  });
});
