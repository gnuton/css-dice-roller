import { DiceSettings, AnimationType } from './types';

export const DEFAULT_SETTINGS: DiceSettings = {
  theme: 'theme-glass',
  baseColor: '#10b981',
  secondaryColor: '#064e3b',
  textColor: '#ffffff',
  scale: 110,
  animation: 'standard' as AnimationType,
  layoutMode: 'tray' as any,
  randomizeAnimation: false,
  constantSpin: false,
  dragEnabled: false,
  speed: 2.5,
  bounciness: 0.6,
  gravity: 1.0,
  customSymbols: false,
  textScale: 1.0,
  debugOptions: {
    showHitboxes: false,
    showVectors: false,
    showBoundaries: false,
    showTraces: false,
  },
  showInstructions: true
};

const STORAGE_KEY = 'dice-roller-settings';
const SCHEMA_VERSION = 1;

export class SettingsManager {
  public static load(): DiceSettings {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Schema version check (using any for transition)
        if ((parsed as any).version !== SCHEMA_VERSION && (parsed as any).version !== undefined) {
          console.warn('Settings schema mismatch, resetting to defaults');
          return { ...DEFAULT_SETTINGS };
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
    return { ...DEFAULT_SETTINGS };
  }

  public static save(settings: DiceSettings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...settings,
        version: SCHEMA_VERSION
    }));
  }
}
