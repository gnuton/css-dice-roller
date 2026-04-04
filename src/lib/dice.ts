import { DieType, DiceSettings } from './types';
import { GEOMETRIES } from './geometries';

export class Die {
  private element: HTMLElement;
  private tumbleElement: HTMLElement;
  private resultElement: HTMLElement;
  private type: DieType;
  private settings: DiceSettings;
  private currentResult: number;
  private dragElement: HTMLElement;
  private manualRotation = { x: 0, y: 0 };
  private isDragging = false;
  private startPointerPos = { x: 0, y: 0 };
  private dragThreshold = 5; // px
  private hasExceededThreshold = false;

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

    this.dragElement = document.createElement('div');
    this.dragElement.className = 'dice-drag-container';
    this.dragElement.style.width = '100%';
    this.dragElement.style.height = '100%';
    this.dragElement.style.transformStyle = 'preserve-3d';

    this.tumbleElement.appendChild(this.resultElement);
    this.dragElement.appendChild(this.tumbleElement);
    this.element.appendChild(this.dragElement);
    container.appendChild(this.element);

    this.setupEvents();
    this.applySettings();
    this.createFaces();
    this.setResult(1);
  }

  private setupEvents() {
    this.element.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    // Global listeners for move/up to ensure capturing outside the element
    window.addEventListener('pointermove', this.handlePointerMove.bind(this));
    window.addEventListener('pointerup', this.handlePointerUp.bind(this));
  }

  private handlePointerDown(e: PointerEvent) {
    if (!this.settings.dragEnabled) return;
    
    this.isDragging = true;
    this.hasExceededThreshold = false;
    this.startPointerPos = { x: e.clientX, y: e.clientY };
    this.element.setPointerCapture(e.pointerId);
    
    // Disable transitions during drag for immediate feedback
    this.dragElement.style.transition = 'none';
    this.element.classList.add('is-dragging');
  }

  private handlePointerMove(e: PointerEvent) {
    if (!this.isDragging || !this.settings.dragEnabled) return;

    const deltaX = e.clientX - this.startPointerPos.x;
    const deltaY = e.clientY - this.startPointerPos.y;

    if (!this.hasExceededThreshold) {
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance > this.dragThreshold) {
        this.hasExceededThreshold = true;
      } else {
        return;
      }
    }

    // Sensitivity adjustment based on scale
    const sensitivity = 0.5 * (150 / this.settings.scale);
    this.manualRotation.y += deltaX * sensitivity;
    this.manualRotation.x -= deltaY * sensitivity;

    this.updateDragTransform();
    this.startPointerPos = { x: e.clientX, y: e.clientY };
  }

  private handlePointerUp() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.element.classList.remove('is-dragging');
    
    // Restore transitions (if we want them for future automated resets)
    this.dragElement.style.transition = '';
  }

  private updateDragTransform() {
    this.dragElement.style.transform = `rotateX(${this.manualRotation.x}deg) rotateY(${this.manualRotation.y}deg)`;
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
      case 'd12':
        points = '50,0 100,38.2 80.9,100 19.1,100 0,38.2';
        break;
    }

    for (let i = 1; i <= geometry.faceCount; i++) {
        const face = document.createElement('div');
        face.className = 'die-face';
        face.setAttribute('data-face', i.toString());

        const bg = document.createElement('div');
        bg.className = 'face-bg';
        face.appendChild(bg);

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

    if (this.settings.animation === 'demo') {
        // For demo, we use a fixed slow duration if not rolling normally
        this.element.style.setProperty('--dice-animation-duration', '10s');
    }

    this.element.classList.add('is-rolling');

    // Reset manual rotation when rolling for clarity
    if (this.manualRotation.x !== 0 || this.manualRotation.y !== 0) {
      this.manualRotation = { x: 0, y: 0 };
      this.dragElement.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      this.updateDragTransform();
    }

    // Wait for the animation duration
    await new Promise(resolve => setTimeout(resolve, this.settings.speed * 1000));

    // Don't remove class if we are in demo mode
    if (this.settings.animation !== 'demo') {
        this.element.classList.remove('is-rolling');
    }
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
    Array.from(this.element.classList).forEach(c => {
      if (c.startsWith('theme-')) this.element.classList.remove(c);
    });
    this.element.classList.add(this.settings.theme);

    // Update drag state look
    this.element.classList.toggle('drag-mode', this.settings.dragEnabled);
    if (!this.settings.dragEnabled) {
      this.manualRotation = { x: 0, y: 0 };
      this.updateDragTransform();
    }

    // Color overrides
    if (this.settings.baseColor) {
      this.element.style.setProperty('--dice-color', this.settings.baseColor);
      this.element.style.setProperty('--dice-color-glow', `${this.settings.baseColor}66`); // 40% alpha
      
      // We also set the variants to avoid green fallbacks from :root 
      // when a user overrides the main color
      this.element.style.setProperty('--dice-color-bright', this.settings.baseColor);
      this.element.style.setProperty('--dice-color-dark', this.settings.baseColor);
    }

    if (this.settings.secondaryColor) {
      this.element.style.setProperty('--dice-secondary-color', this.settings.secondaryColor);
    }

    if (this.settings.textColor) {
      this.element.style.setProperty('--dice-text-color', this.settings.textColor);
    }

    // Handle demo animation persistence
    if (this.settings.animation === 'demo') {
      this.element.style.setProperty('--dice-animation-name', 'roll-demo');
      this.element.style.setProperty('--dice-animation-duration', '10s');
      this.element.classList.add('is-rolling');
    } else {
      // If we switched away from demo, remove the rolling class (unless actually rolling, but applySettings is usually called when idle)
      this.element.classList.remove('is-rolling');
    }

    // Apply or remove spinning always class
    this.element.classList.toggle('is-spinning-always', !!this.settings.constantSpin);
  }

  public get result(): number {
    return this.currentResult;
  }

  public remove() {
    this.element.remove();
  }
}
