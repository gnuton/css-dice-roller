import { Die } from './dice';
import { DieType, DiceSettings, RollerEvents } from './types';
import { DiceTray } from './dice-tray';
import { EventEmitter } from './event-emitter';

export class DiceRoller {
  private dice: Die[] = [];
  private container: HTMLElement;
  private settings: DiceSettings;
  private tray: DiceTray | null = null;
  private events = new EventEmitter<RollerEvents>();

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
      bounciness: 0.6,
      gravity: 1,
      dragEnabled: false,
      customSymbols: false,
      textScale: 1.0,
      debugOptions: {
        showHitboxes: false,
        showVectors: false,
        showBoundaries: false,
        showTraces: false
      }
    };
  }

  /**
   * Subscribes to roller events.
   */
  public on<K extends keyof RollerEvents>(event: K, callback: (data: RollerEvents[K]) => void): void {
      this.events.on(event, callback);
  }

  /**
   * Unsubscribes from roller events.
   */
  public off<K extends keyof RollerEvents>(event: K, callback: (data: RollerEvents[K]) => void): void {
      this.events.off(event, callback);
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
    const isTray = this.settings.layoutMode === 'tray';
    document.body.classList.toggle('is-tray-active', isTray);

    if (isTray) {
        if (!this.tray) {
            this.tray = new DiceTray(this.container, this.settings);
            
            // Link tray events to roller events
            this.tray.onStateChange((active, total, isResultsView) => {
                this.events.emit('tray:state', { active, total, isResultsView });
            });
            this.tray.onRollComplete((results) => {
                this.events.emit('tray:roll-complete', { results });
            });
            this.tray.onInteractionStart(() => {
                this.events.emit('tray:interaction-start', undefined as any);
            });
            this.tray.onShake(() => {
                this.events.emit('tray:shake', undefined as any);
            });

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
      this.dice.forEach((die, i) => {
        const phi = (1 + Math.sqrt(5)) / 2;
        const index = i + 1;
        const distanceScale = 0.6; // adjustment factor
        const radius = Math.sqrt(index) * dieSize * distanceScale;
        const angle = index * 2 * Math.PI / (phi * phi);
        
        const x = centerX + Math.cos(angle) * radius - dieSize / 2;
        const y = centerY + Math.sin(angle) * radius - dieSize / 2;
        
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
    
    if (!this.tray) {
        this.container.innerHTML = '';
    }
  }

  public async rollAll(): Promise<number[]> {
    if (this.dice.length === 0) return [];
    
    this.events.emit('dice:roll-start', { dice: this.dice.map(d => d.typeName) });

    if (this.tray) {
        return this.tray.rollAll();
    }

    const promises = this.dice.map(die => die.roll());
    try {
      const results = await Promise.all(promises);
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

  // Deprecated individual callbacks - maintained for backward compatibility for now
  public onTrayStateChange(callback: (active: number, total: number, isResultsView: boolean) => void) {
      console.warn('onTrayStateChange is deprecated. Use .on("tray:state", ...) instead.');
      this.on('tray:state', (data) => callback(data.active, data.total, data.isResultsView));
  }

  public onTrayRollComplete(callback: (results: number[]) => void) {
      console.warn('onTrayRollComplete is deprecated. Use .on("tray:roll-complete", ...) instead.');
      this.on('tray:roll-complete', (data) => callback(data.results));
  }

  public onTrayInteractionStart(callback: () => void) {
      console.warn('onTrayInteractionStart is deprecated. Use .on("tray:interaction-start", ...) instead.');
      this.on('tray:interaction-start', () => callback());
  }

  public onTrayShake(callback: () => void) {
      console.warn('onTrayShake is deprecated. Use .on("tray:shake", ...) instead.');
      this.on('tray:shake', () => callback());
  }

  public getTrayActiveCount(): number {
    return this.tray?.getActiveCount() || 0;
  }

  /**
   * Requests permission to use device sensors (motion/shake) on mobile.
   * Internal logic automatically detects if permission is required (iOS).
   */
  public async requestTraySensorPermission(): Promise<boolean> {
      if (this.tray) {
          return this.tray.requestSensorPermission();
      }
      return true;
  }

  /**
   * Fully disposes of the roller, tray, and physics engine.
   * Ensures no memory leaks or orphan event listeners.
   */
  public dispose() {
      this.clear();
      if (this.tray) {
          this.tray.destroy();
          this.tray = null;
      }
      this.events.clear();
      this.dice = [];
  }
}
