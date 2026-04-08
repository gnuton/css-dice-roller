import { DiceRoller } from './lib/dice-roller';
import { DieType, AnimationType } from './lib/types';
import { THEMES } from './lib/themes';
import './styles/index.css';
import './styles/dice.css';
import './styles/theme.css';

const container = document.getElementById('dice-container');
const totalSumDisplay = document.getElementById('total-sum');

if (!container || !totalSumDisplay) {
  throw new Error('Required DOM elements not found');
}

// ─── Default Settings ──────────────────────────────────────────
const DEFAULT_SETTINGS = {
  version: 1, // Schema version for settings persistence
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


// ─── Persistance ───────────────────────────────────────────────
const STORAGE_KEY = 'dice-roller-settings';

const loadSettings = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Invalidate settings if major schema version mismatch
      if (parsed.version !== DEFAULT_SETTINGS.version) {
        console.warn('Settings schema mismatch, resetting to defaults');
        return { ...DEFAULT_SETTINGS };
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      console.error('Failed to parse saved settings', e);
    }
  }
  return { ...DEFAULT_SETTINGS };
};

const saveSettings = (settings: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

let currentSettings = loadSettings();
const roller = new DiceRoller(container, currentSettings.scale);

// ─── UI Sync ───────────────────────────────────────────────────
const populateThemeSelect = () => {
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
};

const syncUI = () => {
  const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
  const secondaryColorPicker = document.getElementById('secondary-color-picker') as HTMLInputElement;
  const secondaryColorValue = document.getElementById('secondary-color-value');
  const textColorPicker = document.getElementById('text-color-picker') as HTMLInputElement;
  const textColorValue = document.getElementById('text-color-value');
  const scaleSlider = document.getElementById('scale-slider') as HTMLInputElement;
  const scaleValue = document.getElementById('scale-value');
  const animationSelect = document.getElementById('animation-select') as HTMLSelectElement;
  const constantSpinToggle = document.getElementById('constant-spin') as HTMLInputElement;
  const randomToggle = document.getElementById('random-animation') as HTMLInputElement;
  const dragToggle = document.getElementById('drag-mode') as HTMLInputElement;
  const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
  const speedValue = document.getElementById('speed-value');
  const customSymbolsToggle = document.getElementById('custom-symbols') as HTMLInputElement;
  const textScaleSlider = document.getElementById('text-scale-slider') as HTMLInputElement;
  const textScaleValue = document.getElementById('text-scale-value');
  const layoutSelect = document.getElementById('layout-select') as HTMLSelectElement;

  if (themeSelect) themeSelect.value = currentSettings.theme;
  if (secondaryColorPicker) {
    secondaryColorPicker.value = currentSettings.secondaryColor;
    if (secondaryColorValue) secondaryColorValue.textContent = currentSettings.secondaryColor;
  }
  if (textColorPicker) {
    textColorPicker.value = currentSettings.textColor;
    if (textColorValue) textColorValue.textContent = currentSettings.textColor;
  }
  if (scaleSlider) {
    scaleSlider.value = currentSettings.scale.toString();
    if (scaleValue) scaleValue.textContent = currentSettings.scale.toString();
  }
  if (animationSelect) animationSelect.value = currentSettings.animation;
  if (constantSpinToggle) constantSpinToggle.checked = currentSettings.constantSpin;
  if (randomToggle) randomToggle.checked = currentSettings.randomizeAnimation;
  if (dragToggle) dragToggle.checked = currentSettings.dragEnabled;
  if (speedSlider) {
    speedSlider.value = currentSettings.speed.toString();
    if (speedValue) speedValue.textContent = currentSettings.speed.toFixed(1);
  }
  if (customSymbolsToggle) customSymbolsToggle.checked = currentSettings.customSymbols;
  if (textScaleSlider) {
    textScaleSlider.value = (currentSettings.textScale ?? 1.0).toString();
    if (textScaleValue) textScaleValue.textContent = (currentSettings.textScale ?? 1.0).toFixed(2);
  }
  if (layoutSelect) {
    layoutSelect.value = currentSettings.layoutMode;
    
    // Disable animation selection in Physics Tray mode
    if (animationSelect) {
      animationSelect.disabled = currentSettings.layoutMode === 'tray';
    }
  }
  
  // Debug Toggles
  const hitboxesToggle = document.getElementById('debug-hitboxes') as HTMLInputElement;
  const vectorsToggle = document.getElementById('debug-vectors') as HTMLInputElement;
  const boundariesToggle = document.getElementById('debug-boundaries') as HTMLInputElement;
  const tracesToggle = document.getElementById('debug-traces') as HTMLInputElement;

  if (hitboxesToggle) hitboxesToggle.checked = currentSettings.debugOptions?.showHitboxes ?? false;
  if (vectorsToggle) vectorsToggle.checked = currentSettings.debugOptions?.showVectors ?? false;
  if (boundariesToggle) boundariesToggle.checked = currentSettings.debugOptions?.showBoundaries ?? false;
  if (tracesToggle) tracesToggle.checked = currentSettings.debugOptions?.showTraces ?? false;
  
  const instructionsToggle = document.getElementById('show-instructions') as HTMLInputElement;
  if (instructionsToggle) instructionsToggle.checked = currentSettings.showInstructions ?? true;

  const instructionsEl = document.getElementById('tray-instructions');
  if (instructionsEl) {
    instructionsEl.classList.toggle('visible', currentSettings.showInstructions && currentSettings.layoutMode === 'tray');
  }

  const faceLabels = currentSettings.customSymbols ? {
    1: '💀',
    2: '⚔️',
    3: '🛡️',
    4: '✨',
    5: '🔥',
    6: '<span style="font-size: 1.5em; filter: drop-shadow(0 0 5px gold)">👑</span>'
  } : undefined;

  roller.updateSettings({ ...currentSettings, faceLabels });
  syncActiveDiceState(0, roller.getDiceCount());
};

const syncActiveDiceState = (activeCount: number, totalCount: number) => {
  const rollButton = document.getElementById('roll-all') as HTMLButtonElement;
  const testRollButton = document.getElementById('test-roll') as HTMLButtonElement;
  const clearButton = document.getElementById('clear') as HTMLButtonElement;
  const resultLabel = document.querySelector('#results-display .label');
  const hasActive = activeCount > 0;
  const hasTotal = totalCount > 0;

  if (rollButton) rollButton.disabled = !hasActive;
  if (testRollButton) {
    testRollButton.disabled = !hasActive || currentSettings.layoutMode === 'tray';
  }
  if (clearButton) clearButton.disabled = !hasTotal;

  if (resultLabel) {
    resultLabel.textContent = totalCount === 0 ? 'Tray Empty' : `${activeCount} Dice Active`;
  }
};

// ─── Core Logic ────────────────────────────────────────────────
const addDie = (type: DieType) => {
  roller.addDie(type);
};

const rollAll = async () => {
  const rollButton = document.getElementById('roll-all') as HTMLButtonElement;
  if (rollButton) {
    rollButton.disabled = true;
    rollButton.textContent = 'Rolling...';
  }

  const results = await roller.rollAll();
  const sum = results.reduce((a: number, b: number) => a + b, 0);
  updateResult(sum);

  if (rollButton) {
    rollButton.disabled = false;
    rollButton.textContent = 'Roll All';
  }
};

const updateResult = (sum: number) => {
  if (totalSumDisplay) {
    totalSumDisplay.textContent = sum.toString();
  }
};

const clearAll = () => {
  roller.clear();
  updateResult(0);
};

// ─── UI Event Wiring ───────────────────────────────────────────

// Theme Selection
document.getElementById('theme-select')?.addEventListener('change', (e) => {
  const themeId = (e.target as HTMLSelectElement).value;
  currentSettings.theme = themeId;

  // Sync colors from theme definition
  const themeDef = THEMES.find(t => t.id === themeId);
  if (themeDef && themeDef.colors) {
    currentSettings.baseColor = themeDef.colors.primary;
    currentSettings.secondaryColor = themeDef.colors.secondary;
    currentSettings.textColor = themeDef.colors.text;
  }

  syncUI();
  saveSettings(currentSettings);
});

// Color picker removed per user request

// Secondary Color Picker
document.getElementById('secondary-color-picker')?.addEventListener('input', (e) => {
  const color = (e.target as HTMLInputElement).value;
  const colorValue = document.getElementById('secondary-color-value');
  if (colorValue) colorValue.textContent = color;
  currentSettings.secondaryColor = color;
  roller.updateSettings({ secondaryColor: color });
  saveSettings(currentSettings);
});

// Text Color Picker
document.getElementById('text-color-picker')?.addEventListener('input', (e) => {
  const color = (e.target as HTMLInputElement).value;
  const colorValue = document.getElementById('text-color-value');
  if (colorValue) colorValue.textContent = color;
  currentSettings.textColor = color;
  roller.updateSettings({ textColor: color });
  saveSettings(currentSettings);
});

// Scale Slider
document.getElementById('scale-slider')?.addEventListener('input', (e) => {
  const scale = parseInt((e.target as HTMLInputElement).value);
  const scaleValue = document.getElementById('scale-value');
  if (scaleValue) scaleValue.textContent = scale.toString();
  currentSettings.scale = scale;
  roller.updateSettings({ scale });
  saveSettings(currentSettings);
});

// Text Scale Slider
document.getElementById('text-scale-slider')?.addEventListener('input', (e) => {
  const textScale = parseFloat((e.target as HTMLInputElement).value);
  const textScaleValue = document.getElementById('text-scale-value');
  if (textScaleValue) textScaleValue.textContent = textScale.toFixed(2);
  currentSettings.textScale = textScale;
  roller.updateSettings({ textScale });
  saveSettings(currentSettings);
});

// Layout Selection
document.getElementById('layout-select')?.addEventListener('change', (e) => {
  currentSettings.layoutMode = (e.target as HTMLSelectElement).value as any;
  roller.updateSettings({ layoutMode: currentSettings.layoutMode });
  saveSettings(currentSettings);
  syncUI(); // Re-sync UI to update disabled states for animation settings
});

// Animation Selection
document.getElementById('animation-select')?.addEventListener('change', (e) => {
  currentSettings.animation = (e.target as HTMLSelectElement).value as AnimationType;
  roller.updateSettings({ animation: currentSettings.animation });
  saveSettings(currentSettings);
});

// Constant Spin Toggle
document.getElementById('constant-spin')?.addEventListener('change', (e) => {
  currentSettings.constantSpin = (e.target as HTMLInputElement).checked;
  roller.updateSettings({ constantSpin: currentSettings.constantSpin });
  saveSettings(currentSettings);
});

// Random Animation Toggle
document.getElementById('random-animation')?.addEventListener('change', (e) => {
  currentSettings.randomizeAnimation = (e.target as HTMLInputElement).checked;
  roller.updateSettings({ randomizeAnimation: currentSettings.randomizeAnimation });
  saveSettings(currentSettings);
});

// Drag Mode Toggle
document.getElementById('drag-mode')?.addEventListener('change', (e) => {
  currentSettings.dragEnabled = (e.target as HTMLInputElement).checked;
  roller.updateSettings({ dragEnabled: currentSettings.dragEnabled });
  saveSettings(currentSettings);
});

// Speed Slider
document.getElementById('speed-slider')?.addEventListener('input', (e) => {
  const speed = parseFloat((e.target as HTMLInputElement).value);
  const speedValue = document.getElementById('speed-value');
  if (speedValue) speedValue.textContent = speed.toFixed(1);
  currentSettings.speed = speed;
  roller.updateSettings({ speed });
  saveSettings(currentSettings);
});

// Custom Symbols Toggle
document.getElementById('custom-symbols')?.addEventListener('change', (e) => {
  currentSettings.customSymbols = (e.target as HTMLInputElement).checked;
  syncUI();
  saveSettings(currentSettings);
});

// Reset Settings
document.getElementById('reset-settings')?.addEventListener('click', () => {
  currentSettings = { ...DEFAULT_SETTINGS };
  saveSettings(currentSettings);
  syncUI();
});

// Debug Toggles wiring
document.getElementById('debug-hitboxes')?.addEventListener('change', (e) => {
  if (!currentSettings.debugOptions) currentSettings.debugOptions = {} as any;
  currentSettings.debugOptions.showHitboxes = (e.target as HTMLInputElement).checked;
  roller.updateSettings({ debugOptions: currentSettings.debugOptions });
  saveSettings(currentSettings);
});

document.getElementById('debug-vectors')?.addEventListener('change', (e) => {
  if (!currentSettings.debugOptions) currentSettings.debugOptions = {} as any;
  currentSettings.debugOptions.showVectors = (e.target as HTMLInputElement).checked;
  roller.updateSettings({ debugOptions: currentSettings.debugOptions });
  saveSettings(currentSettings);
});

document.getElementById('debug-boundaries')?.addEventListener('change', (e) => {
  if (!currentSettings.debugOptions) currentSettings.debugOptions = {} as any;
  currentSettings.debugOptions.showBoundaries = (e.target as HTMLInputElement).checked;
  roller.updateSettings({ debugOptions: currentSettings.debugOptions });
  saveSettings(currentSettings);
});

document.getElementById('debug-traces')?.addEventListener('change', (e) => {
  if (!currentSettings.debugOptions) currentSettings.debugOptions = {} as any;
  currentSettings.debugOptions.showTraces = (e.target as HTMLInputElement).checked;
  roller.updateSettings({ debugOptions: currentSettings.debugOptions });
  saveSettings(currentSettings);
});

document.getElementById('show-instructions')?.addEventListener('change', (e) => {
  currentSettings.showInstructions = (e.target as HTMLInputElement).checked;
  syncUI();
  saveSettings(currentSettings);
});

// Copy Install Command
document.getElementById('copy-install')?.addEventListener('click', () => {
  const code = 'npm i css-dice-roller';
  navigator.clipboard.writeText(code).then(() => {
    const el = document.getElementById('copy-install');
    if (el) {
      const original = el.innerHTML;
      el.style.borderColor = '#10b981';
      el.innerHTML = '<span class="label" style="color: #10b981">Copied to clipboard!</span><code>' + code + '</code>';
      setTimeout(() => {
        el.innerHTML = original;
        el.style.borderColor = '';
      }, 2000);
    }
  });
});

// ─── Dice Buttons ──────────────────────────────────────────────
document.getElementById('add-d4')?.addEventListener('click', () => addDie('d4'));
document.getElementById('add-d6')?.addEventListener('click', () => addDie('d6'));
document.getElementById('add-d8')?.addEventListener('click', () => addDie('d8'));
document.getElementById('add-d10')?.addEventListener('click', () => addDie('d10'));
document.getElementById('add-d12')?.addEventListener('click', () => addDie('d12'));
document.getElementById('add-d20')?.addEventListener('click', () => addDie('d20'));
document.getElementById('roll-all')?.addEventListener('click', rollAll);
document.getElementById('test-roll')?.addEventListener('click', rollAll);
document.getElementById('clear')?.addEventListener('click', clearAll);

// Sidebar Toggle Logic
const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const mainContent = document.querySelector('.main-content');

const toggleSidebar = () => {
  sidebar?.classList.toggle('sidebar-active');
};

sidebarToggle?.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleSidebar();
});

sidebarClose?.addEventListener('click', toggleSidebar);

// Close sidebar when clicking outside on mobile
mainContent?.addEventListener('click', () => {
  if (sidebar?.classList.contains('sidebar-active')) {
    sidebar.classList.remove('sidebar-active');
  }
});

// Initial setup
populateThemeSelect();
syncUI();
addDie('d20');

// Wire up active dice changes for Roll button state
roller.onTrayStateChange((active, total) => {
  syncActiveDiceState(active, total);
});

// ─── Version Indicator ──────────────────────────────────────────
const versionEl = document.getElementById('app-version');
const isGitHubPages = window.location.hostname.endsWith('github.io');
if (versionEl && (window as any).__APP_VERSION__ && isGitHubPages) {
  versionEl.textContent = `v${(window as any).__APP_VERSION__}`;
}

// Resize Observer for smart re-arrangement
const wrapper = document.getElementById('dice-container-wrapper');
if (wrapper) {
  const resizeObserver = new ResizeObserver(() => {
    roller.rearrange();
  });
  resizeObserver.observe(wrapper);
}


