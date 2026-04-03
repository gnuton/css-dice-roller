import { DiceRoller } from './lib/dice-roller';
import { DieType, AnimationType } from './lib/types';
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
  theme: 'theme-glass',
  baseColor: '#10b981',
  scale: 110,
  animation: 'standard' as AnimationType,
  randomizeAnimation: false,
  dragEnabled: false,
  speed: 2.5,
};

// ─── Persistance ───────────────────────────────────────────────
const STORAGE_KEY = 'dice-roller-settings';

const loadSettings = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
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
const syncUI = () => {
  const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
  const colorPicker = document.getElementById('color-picker') as HTMLInputElement;
  const colorValue = document.getElementById('color-value');
  const scaleSlider = document.getElementById('scale-slider') as HTMLInputElement;
  const scaleValue = document.getElementById('scale-value');
  const animationSelect = document.getElementById('animation-select') as HTMLSelectElement;
  const randomToggle = document.getElementById('random-animation') as HTMLInputElement;
  const dragToggle = document.getElementById('drag-mode') as HTMLInputElement;
  const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
  const speedValue = document.getElementById('speed-value');

  if (themeSelect) themeSelect.value = currentSettings.theme;
  if (colorPicker) {
    colorPicker.value = currentSettings.baseColor;
    if (colorValue) colorValue.textContent = currentSettings.baseColor;
  }
  if (scaleSlider) {
    scaleSlider.value = currentSettings.scale.toString();
    if (scaleValue) scaleValue.textContent = currentSettings.scale.toString();
  }
  if (animationSelect) animationSelect.value = currentSettings.animation;
  if (randomToggle) randomToggle.checked = currentSettings.randomizeAnimation;
  if (dragToggle) dragToggle.checked = currentSettings.dragEnabled;
  if (speedSlider) {
    speedSlider.value = currentSettings.speed.toString();
    if (speedValue) speedValue.textContent = currentSettings.speed.toFixed(1);
  }

  roller.updateSettings(currentSettings);
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
  const sum = results.reduce((a, b) => a + b, 0);
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
  currentSettings.theme = (e.target as HTMLSelectElement).value;
  roller.updateSettings({ theme: currentSettings.theme });
  saveSettings(currentSettings);
});

// Color Picker
document.getElementById('color-picker')?.addEventListener('input', (e) => {
  const color = (e.target as HTMLInputElement).value;
  const colorValue = document.getElementById('color-value');
  if (colorValue) colorValue.textContent = color;
  currentSettings.baseColor = color;
  roller.updateSettings({ baseColor: color });
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

// Animation Selection
document.getElementById('animation-select')?.addEventListener('change', (e) => {
  currentSettings.animation = (e.target as HTMLSelectElement).value as AnimationType;
  roller.updateSettings({ animation: currentSettings.animation });
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

// Reset Settings
document.getElementById('reset-settings')?.addEventListener('click', () => {
  currentSettings = { ...DEFAULT_SETTINGS };
  saveSettings(currentSettings);
  syncUI();
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
document.getElementById('add-d12')?.addEventListener('click', () => addDie('d12'));
document.getElementById('add-d20')?.addEventListener('click', () => addDie('d20'));
document.getElementById('roll-all')?.addEventListener('click', rollAll);
document.getElementById('clear')?.addEventListener('click', clearAll);

// Initial setup
syncUI();
addDie('d20');


