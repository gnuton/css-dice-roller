import { DiceSettings, DieType } from './types';
import { THEMES } from './themes';

export class UIController {
  private container: HTMLElement;
  private totalSumDisplay: HTMLElement | null;
  private resultsPopup: HTMLElement | null;
  private popupTimeout: number | null = null;

  constructor() {
    this.container = document.getElementById('dice-container')!;
    this.totalSumDisplay = document.getElementById('total-sum');
    this.resultsPopup = document.getElementById('results-popup');
    this.setupResultsDismissal();
  }

  public populateThemeSelect(currentTheme: string) {
    const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
    if (!themeSelect) return;

    const categories = [...new Set(THEMES.map(t => t.category))];
    themeSelect.innerHTML = '';

    for (const cat of categories) {
      const group = document.createElement('optgroup');
      group.label = cat;

      const catThemes = THEMES.filter(t => t.category === cat);
      for (const theme of catThemes) {
        const option = document.createElement('option');
        option.value = theme.id;
        option.textContent = theme.name;
        group.appendChild(option);
      }
      themeSelect.appendChild(group);
    }
    themeSelect.value = currentTheme;
  }

  public syncUI(settings: DiceSettings, activeCount: number, totalCount: number) {
    // Basic Pickers
    this.setInputValue('secondary-color-picker', settings.secondaryColor);
    this.setTextContent('secondary-color-value', settings.secondaryColor);
    this.setInputValue('text-color-picker', settings.textColor);
    this.setTextContent('text-color-value', settings.textColor);
    
    // Sliders
    this.setInputValue('scale-slider', settings.scale.toString());
    this.setTextContent('scale-value', settings.scale.toString());
    this.setInputValue('speed-slider', settings.speed.toString());
    this.setTextContent('speed-value', settings.speed.toFixed(1));
    this.setInputValue('bounciness-slider', settings.bounciness.toString());
    this.setTextContent('bounciness-value', settings.bounciness.toFixed(2));
    this.setInputValue('gravity-slider', settings.gravity.toString());
    this.setTextContent('gravity-value', settings.gravity.toFixed(1));
    this.setInputValue('text-scale-slider', (settings.textScale ?? 1.0).toString());
    this.setTextContent('text-scale-value', (settings.textScale ?? 1.0).toFixed(2));

    // Selects
    this.setSelectValue('animation-select', settings.animation);
    this.setSelectValue('layout-select', settings.layoutMode);
    
    // Toggles
    this.setCheckboxValue('constant-spin', settings.constantSpin);
    this.setCheckboxValue('random-animation', settings.randomizeAnimation);
    this.setCheckboxValue('drag-mode', settings.dragEnabled);
    this.setCheckboxValue('custom-symbols', settings.customSymbols);
    this.setCheckboxValue('show-instructions', settings.showInstructions ?? true);

    // Contextual disabling
    const animationSelect = document.getElementById('animation-select') as HTMLSelectElement;
    if (animationSelect) animationSelect.disabled = settings.layoutMode === 'tray';

    // Instructions
    this.updateInstructions(settings, activeCount, totalCount);

    // Debug
    this.setCheckboxValue('debug-hitboxes', settings.debugOptions?.showHitboxes ?? false);
    this.setCheckboxValue('debug-vectors', settings.debugOptions?.showVectors ?? false);
    this.setCheckboxValue('debug-boundaries', settings.debugOptions?.showBoundaries ?? false);
    this.setCheckboxValue('debug-traces', settings.debugOptions?.showTraces ?? false);

    // Dynamic Accent Color (for glows)
    if (this.container && settings.baseColor) {
      const hex = settings.baseColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      this.container.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
    }
  }

  private updateInstructions(settings: DiceSettings, activeCount: number, totalCount: number) {
    const instructionsEl = document.getElementById('tray-instructions');
    if (!instructionsEl) return;

    if (!settings.showInstructions || settings.layoutMode !== 'tray') {
      instructionsEl.classList.remove('visible');
      return;
    }

    const onShelf = totalCount - activeCount;
    const actions: string[] = [];
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const returnAction = isTouch ? 'Long-press' : 'RMB';

    if (onShelf > 0) {
      actions.push('Click shelf to roll');
    }
    
    if (activeCount > 0) {
      actions.push(`${returnAction} to return`);
      actions.push('Scoop to throw all');
    }

    if (actions.length === 0) {
      instructionsEl.textContent = 'Add dice from the sidebar';
    } else {
      instructionsEl.textContent = actions.join(' • ');
    }
    
    instructionsEl.classList.add('visible');
  }

  public showResultsPopup(results: number[]) {
    if (!this.resultsPopup || results.length === 0) return;

    const sum = results.reduce((a, b) => a + b, 0);
    this.resultsPopup.textContent = `${sum}`;
    
    if (this.popupTimeout) clearTimeout(this.popupTimeout);
    this.resultsPopup.classList.add('visible');

    this.popupTimeout = window.setTimeout(() => {
      this.hideResultsPopup();
    }, 3000);
  }

  public hideResultsPopup() {
    if (this.resultsPopup) {
      this.resultsPopup.classList.remove('visible');
      if (this.popupTimeout) {
        clearTimeout(this.popupTimeout);
        this.popupTimeout = null;
      }
    }
  }

  public updateResult(sum: number) {
    if (this.totalSumDisplay) {
      this.totalSumDisplay.textContent = sum.toString();
    }
  }

  public syncActiveDiceState(activeCount: number, totalCount: number, layoutMode: string) {
    const rollButton = document.getElementById('roll-all') as HTMLButtonElement;
    const testRollButton = document.getElementById('test-roll') as HTMLButtonElement;
    const clearButton = document.getElementById('clear') as HTMLButtonElement;
    const resultLabel = document.querySelector('#results-display .label');

    if (rollButton) rollButton.disabled = activeCount === 0;
    if (testRollButton) testRollButton.disabled = activeCount === 0 || layoutMode === 'tray';
    if (clearButton) clearButton.disabled = totalCount === 0;

    if (resultLabel) {
      resultLabel.textContent = totalCount === 0 ? 'Tray Empty' : `${activeCount} Dice Active`;
    }
  }

  private setupResultsDismissal() {
    document.addEventListener('pointerdown', (e) => {
      if (this.resultsPopup?.classList.contains('visible')) {
        if (!(e.target as HTMLElement).closest('#results-popup')) {
          this.hideResultsPopup();
        }
      }
    });
  }

  private setInputValue(id: string, value: string) {
    const el = document.getElementById(id) as HTMLInputElement;
    if (el) el.value = value;
  }

  private setCheckboxValue(id: string, value: boolean) {
    const el = document.getElementById(id) as HTMLInputElement;
    if (el) el.checked = value;
  }

  private setSelectValue(id: string, value: string) {
    const el = document.getElementById(id) as HTMLSelectElement;
    if (el) el.value = value;
  }

  private setTextContent(id: string, value: string) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }
}
