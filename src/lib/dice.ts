import { DieType, TransformStep } from './types';
import { GEOMETRIES } from './geometries';

export class Die {
  private element: HTMLElement;
  private tumbleElement: HTMLElement;
  private resultElement: HTMLElement;
  private type: DieType;
  private size: number;
  private currentResult: number;

  constructor(type: DieType, container: HTMLElement, size: number = 200) {
    this.type = type;
    this.size = size;
    this.currentResult = 1;

    this.element = document.createElement('div');
    this.element.className = `dice-wrapper ${type}`;
    this.element.style.setProperty('--dice-size', `${size}px`);

    this.tumbleElement = document.createElement('div');
    this.tumbleElement.className = 'dice-tumble';

    this.resultElement = document.createElement('div');
    this.resultElement.className = 'dice-result';

    this.tumbleElement.appendChild(this.resultElement);
    this.element.appendChild(this.tumbleElement);
    container.appendChild(this.element);

    this.createFaces();
    this.setResult(1);
  }

  private createFaces() {
    const geometry = GEOMETRIES[this.type];

    // Scale factor to convert 0-100 coordinates to actual pixel size
    const scaleFactor = this.size / 200; // Since container is 200 and faceWidth is 100 in SCSS

    for (let i = 1; i <= geometry.faceCount; i++) {
      const face = document.createElement('div');
      face.className = 'die-face';
      face.setAttribute('data-face', i.toString());

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

      // Anti-aliasing seam patch
      transformString += ' scale(1.01)';

      face.style.transform = transformString;
      this.resultElement.appendChild(face);
    }
  }

  public async roll(): Promise<number> {
    const newResult = Math.floor(Math.random() * GEOMETRIES[this.type].faceCount) + 1;

    this.element.classList.add('is-rolling');

    // Wait for the animation duration (3s in SCSS, using 2.5s for snappy feel)
    await new Promise(resolve => setTimeout(resolve, 2500));

    this.element.classList.remove('is-rolling');

    // Determine if we need to wait for a transition
    const oldTransform = this.resultElement.style.transform;
    this.setResult(newResult);
    const newTransform = this.resultElement.style.transform;

    if (oldTransform === newTransform) {
      console.log(`[Die] Rolled same result (${newResult}). Skipping transition.`);
      return newResult;
    }

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

      // Fallback in case transitionend doesn't fire
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.resultElement.removeEventListener('transitionend', onEnd);
          console.warn(`[Die] transitionend timed out for result ${newResult}. Resolving anyway.`);
          resolve(newResult);
        }
      }, 800); // 0.6s transition + 0.2s buffer

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
      console.warn(`[Die] No rotation data for ${this.type} result ${result}.`);
      this.resultElement.style.transform = 'rotateX(0deg) rotateY(0deg)';
      return;
    }

    // Applying inverse view rotations to bring the face to front
    // Order: rotateZ (if any) -> rotateX -> rotateY
    let transform = '';
    if (rotation.z) transform += `rotateZ(${-rotation.z}deg) `;
    transform += `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;

    this.resultElement.style.transform = transform;
  }

  public get result(): number {
    return this.currentResult;
  }

  public remove() {
    this.element.remove();
  }
}
