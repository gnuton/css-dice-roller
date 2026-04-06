import { Die } from './dice';
import { DieType, DiceSettings } from './types';

export class DiceRoller {
  private dice: Die[] = [];
  private container: HTMLElement;
  private settings: DiceSettings;

  constructor(container: HTMLElement, initialScale: number = 110) {
    this.container = container;
    
    // Default system settings
    this.settings = {
      theme: 'theme-glass',
      baseColor: '#10b981',
      scale: initialScale,
      animation: 'standard',
      layoutMode: 'grid',
      randomizeAnimation: false,
      constantSpin: false,
      speed: 2.5,
      dragEnabled: false,
      textScale: 1.0
    };
  }

  public addDie(type: DieType, count: number = 1): Die[] {
    const newDice: Die[] = [];
    for (let i = 0; i < count; i++) {
        const die = new Die(type, this.container, this.settings);
        this.dice.push(die);
        newDice.push(die);
    }
    this.rearrange();
    return newDice;
  }

  public async rearrange() {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const count = this.dice.length;
    const dieSize = this.settings.scale;

    if (this.settings.layoutMode === 'grid') {
      this.container.style.display = 'flex';
      this.dice.forEach(die => die.resetPosition());
      return;
    }

    this.container.style.display = 'block';
    this.container.style.position = 'relative';

    if (this.settings.layoutMode === 'circle') {
      const radius = Math.min(rect.width, rect.height) * 0.35;
      this.dice.forEach((die, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius - dieSize / 2;
        const y = centerY + Math.sin(angle) * radius - dieSize / 2;
        die.setPosition(`${y}px`, `${x}px`);
      });
    } else if (this.settings.layoutMode === 'pool') {
      // Clustered "smart" scatter using a deterministic pseudo-random seed
      // to avoid jumping on resize.
      this.dice.forEach((die, i) => {
        // Use golden ratio for distribution or just a well-spaced spiral
        const phi = (1 + Math.sqrt(5)) / 2;
        const index = i + 1;
        const distanceScale = 0.6; // adjustment factor
        const radius = Math.sqrt(index) * dieSize * distanceScale;
        const angle = index * 2 * Math.PI / (phi * phi);
        
        const x = centerX + Math.cos(angle) * radius - dieSize / 2;
        const y = centerY + Math.sin(angle) * radius - dieSize / 2;
        
        // Add a slight tilt for "rolled" look
        const tiltX = (Math.sin(index * 13) * 10).toFixed(1);
        const tiltY = (Math.cos(index * 17) * 10).toFixed(1);
        die.setPosition(`${y}px`, `${x}px`, `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`);
      });
    }
  }

  public clear() {
    this.dice.forEach(die => {
      try {
        die.remove();
      } catch (e) {
        console.error('Error removing die:', e);
      }
    });
    this.dice = [];
    this.container.innerHTML = ''; // Absolute safety fallback
  }

  public async rollAll(): Promise<number[]> {
    if (this.dice.length === 0) return [];
    
    const promises = this.dice.map(die => die.roll());
    try {
      const results = await Promise.all(promises);
      // Optional: slight re-scatter after roll in pool mode? 
      // For now, keep it stable.
      return results;
    } catch (e) {
      console.error('Error rolling dice:', e);
      return this.dice.map(d => d.result);
    }
  }

  public updateSettings(newSettings: Partial<DiceSettings>) {
    const oldLayout = this.settings.layoutMode;
    const oldScale = this.settings.scale;

    this.settings = { ...this.settings, ...newSettings };
    this.dice.forEach(die => die.updateSettings(newSettings));

    if (this.settings.layoutMode !== oldLayout || this.settings.scale !== oldScale) {
        this.rearrange();
    }
  }

  public getSettings(): DiceSettings {
    return { ...this.settings };
  }

  public getDiceCount(): number {
    return this.dice.length;
  }
}
