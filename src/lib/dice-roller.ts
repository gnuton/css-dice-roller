import { Die } from './dice';
import { DieType, DiceSettings } from './types';
import { DiceTray } from './dice-tray';

export class DiceRoller {
  private dice: Die[] = [];
  private container: HTMLElement;
  private settings: DiceSettings;
  private tray: DiceTray | null = null;

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
        
        if (this.tray) {
            this.tray.addDie(die);
        }
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

    // Handle Tray Mode Transition
    if (this.settings.layoutMode === 'tray') {
        if (!this.tray) {
            this.tray = new DiceTray(this.container, this.settings);
            this.dice.forEach(die => this.tray?.addDie(die));
        }
        return;
    } else if (this.tray) {
        // Destroy tray and return dice to main container
        this.tray.destroy();
        this.tray = null;
        this.container.innerHTML = '';
        this.dice.forEach(die => {
            this.container.appendChild(die.domElement);
            die.resetPosition();
        });
    }

    if (this.settings.layoutMode === 'grid') {
      this.container.classList.remove('dice-tray-container'); // Safety cleanup
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
    if (this.tray) {
        this.tray.clear();
    }
    this.dice.forEach(die => {
      try {
        die.remove();
      } catch (e) {
        console.error('Error removing die:', e);
      }
    });
    this.dice = [];
    
    // Only clear innerHTML if we're not in tray mode
    // (Tray layout must persist between clears)
    if (!this.tray) {
        this.container.innerHTML = '';
    }
  }

  public async rollAll(): Promise<number[]> {
    if (this.dice.length === 0) return [];
    
    if (this.tray) {
        return this.tray.rollAll();
    }

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
    
    if (this.tray) {
        this.tray.updateSettings(newSettings);
    }

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

  public onTrayStateChange(callback: (active: number, total: number) => void) {
    if (this.tray) {
        this.tray.onStateChange(callback);
    }
  }

  public onTrayRollComplete(callback: (results: number[]) => void) {
    if (this.tray) {
        this.tray.onRollComplete(callback);
    }
  }

  public onTrayInteractionStart(callback: () => void) {
    if (this.tray) {
        this.tray.onInteractionStart(callback);
    }
  }

  public getTrayActiveCount(): number {
    return this.tray?.getActiveCount() || 0;
  }
}
