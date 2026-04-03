import { DieType, DiceSettings } from './types';
import { GEOMETRIES } from './geometries';

export class Die {
  private element: HTMLElement;
  private tumbleElement: HTMLElement;
  private resultElement: HTMLElement;
  private type: DieType;
  private settings: DiceSettings;
  private currentResult: number;

  constructor(type: DieType, container: HTMLElement, settings: DiceSettings) {
    this.type = type;
    this.settings = { ...settings };
    this.currentResult = 1;

    this.element = document.createElement('div');
    this.element.className = `dice-wrapper ${type}`;
    
    this.tumbleElement = document.createElement('div');
    this.tumbleElement.className = 'dice-tumble';

    this.resultElement = document.createElement('div');
    this.resultElement.className = 'dice-result';

    this.tumbleElement.appendChild(this.resultElement);
    this.element.appendChild(this.tumbleElement);
    container.appendChild(this.element);

    this.applySettings();
    this.createFaces();
    this.setResult(1);
  }

  private createFaces() {
    // Clear existing faces if any (for dynamic updates if needed, though usually faces are created once)
    this.resultElement.innerHTML = '';
    
    const geometry = GEOMETRIES[this.type];
    const scaleFactor = this.settings.scale / 200;

    // Define polygon points for SVG (standardized 100x100)
    let points = '';
    switch (this.type) {
      case 'd4':
      case 'd8':
      case 'd20':
        points = '50,0 0,100 100,100';
        break;
      case 'd6':
        points = '0,0 100,0 100,100 0,100';
        break;
      case 'd10':
        points = '50,0 100,45 50,100 0,45';
        break;
      case 'd12':
        points = '50,0 100,38 81,100 19,100 0,38';
        break;
    }

    for (let i = 1; i <= geometry.faceCount; i++) {
        const face = document.createElement('div');
        face.className = 'die-face';
        face.setAttribute('data-face', i.toString());

        // Create the SVG face background
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('overflow', 'visible'); // Crucial for strokes and drop-shadows

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', points);
        polygon.classList.add('face-shape');
        
        svg.appendChild(polygon);
        face.appendChild(svg);

        const transforms = geometry.faceTransforms[i] || [];
      let transformString = '';

      for (const step of transforms) {
        const val = step.value;
        switch (step.type) {
          case 'rotateX': transformString += ` rotateX(${val}deg)`; break;
          case 'rotateY': transformString += ` rotateY(${val}deg)`; break;
          case 'rotateZ': transformString += ` rotateZ(${val}deg)`; break;
          case 'translateZ': transformString += ` translateZ(${val * scaleFactor}px)`; break;
          case 'translateY': transformString += ` translateY(${val * scaleFactor}px)`; break;
          case 'translateX': transformString += ` translateX(${val * scaleFactor}px)`; break;
          case 'scale': transformString += ` scale(${val})`; break;
        }
      }

      transformString += ' scale(1.01)';
      face.style.transform = transformString;
      this.resultElement.appendChild(face);
    }
  }

  public async roll(): Promise<number> {
    const newResult = Math.floor(Math.random() * GEOMETRIES[this.type].faceCount) + 1;

    if (this.settings.animation === 'none') {
      this.setResult(newResult);
      return newResult;
    }

    // Handle random animation if enabled
    if (this.settings.randomizeAnimation) {
      const animations = ['roll-standard', 'roll-chaotic', 'roll-float'];
      const randomAnim = animations[Math.floor(Math.random() * animations.length)];
      this.element.style.setProperty('--dice-animation-name', randomAnim);
    } else {
      this.element.style.setProperty('--dice-animation-name', `roll-${this.settings.animation}`);
    }

    this.element.classList.add('is-rolling');

    // Wait for the animation duration
    await new Promise(resolve => setTimeout(resolve, this.settings.speed * 1000));

    this.element.classList.remove('is-rolling');
    this.setResult(newResult);

    return new Promise(resolve => {
      let resolved = false;
      const onEnd = (e: TransitionEvent) => {
        if (e.target === this.resultElement && e.propertyName === 'transform') {
          if (!resolved) {
            resolved = true;
            this.resultElement.removeEventListener('transitionend', onEnd);
            resolve(newResult);
          }
        }
      };

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.resultElement.removeEventListener('transitionend', onEnd);
          resolve(newResult);
        }
      }, 800);

      this.resultElement.addEventListener('transitionend', (e) => {
        onEnd(e);
        if (resolved) clearTimeout(timeout);
      });
    });
  }

  public setResult(result: number) {
    this.currentResult = result;
    const geometry = GEOMETRIES[this.type];
    const rotation = geometry.viewRotations[result];

    if (!rotation) {
      this.resultElement.style.transform = 'rotateX(0deg) rotateY(0deg)';
      return;
    }

    let transform = '';
    if (rotation.z) transform += `rotateZ(${-rotation.z}deg) `;
    transform += `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;

    this.resultElement.style.transform = transform;
  }

  public updateSettings(settings: Partial<DiceSettings>) {
    const oldScale = this.settings.scale;
    this.settings = { ...this.settings, ...settings };
    
    this.applySettings();
    
    // If scale changed, we need to rebuild faces to adjust translateZ
    if (settings.scale !== undefined && settings.scale !== oldScale) {
      this.createFaces();
      this.setResult(this.currentResult);
    }
  }

  private applySettings() {
    this.element.style.setProperty('--dice-size', `${this.settings.scale}px`);
    this.element.style.setProperty('--dice-animation-duration', `${this.settings.speed}s`);
    
    // Theme class
    const themes = ['theme-glass', 'theme-solid', 'theme-neon'];
    this.element.classList.remove(...themes);
    this.element.classList.add(this.settings.theme);

    // Color overrides
    if (this.settings.baseColor) {
      this.element.style.setProperty('--dice-color', this.settings.baseColor);
      this.element.style.setProperty('--dice-color-glow', `${this.settings.baseColor}66`); // 40% alpha
      
      // Calculate a darker and brighter version if possible, or just use defaults
      // For simplicity, we just set the main ones
      this.element.style.setProperty('--dice-color-bright', this.settings.baseColor);
    }
  }

  public get result(): number {
    return this.currentResult;
  }

  public remove() {
    this.element.remove();
  }
}
