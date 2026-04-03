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

const roller = new DiceRoller(container, 110);

const addDie = (type: DieType) => {
  roller.addDie(type);
};

const rollAll = async () => {
  const rollButton = document.getElementById('roll-all') as HTMLButtonElement;
  if (rollButton) rollButton.disabled = true;

  const results = await roller.rollAll();
  const sum = results.reduce((a, b) => a + b, 0);
  updateResult(sum);

  if (rollButton) rollButton.disabled = false;
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

// ─── UI Control Wiring ─────────────────────────────────────────

// Theme Selection
document.getElementById('theme-select')?.addEventListener('change', (e) => {
  const theme = (e.target as HTMLSelectElement).value;
  roller.updateSettings({ theme });
});

// Color Picker
document.getElementById('color-picker')?.addEventListener('input', (e) => {
  const baseColor = (e.target as HTMLInputElement).value;
  roller.updateSettings({ baseColor });
});

// Scale Slider
const scaleSlider = document.getElementById('scale-slider') as HTMLInputElement;
const scaleValue = document.getElementById('scale-value');
scaleSlider?.addEventListener('input', (e) => {
  const scale = parseInt((e.target as HTMLInputElement).value);
  if (scaleValue) scaleValue.textContent = scale.toString();
  roller.updateSettings({ scale });
});

// Animation Selection
document.getElementById('animation-select')?.addEventListener('change', (e) => {
  const animation = (e.target as HTMLSelectElement).value as AnimationType;
  roller.updateSettings({ animation });
});

// Random Animation Toggle
document.getElementById('random-animation')?.addEventListener('change', (e) => {
  const randomizeAnimation = (e.target as HTMLInputElement).checked;
  roller.updateSettings({ randomizeAnimation });
});

// Speed Slider
const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
const speedValue = document.getElementById('speed-value');
speedSlider?.addEventListener('input', (e) => {
  const speed = parseFloat((e.target as HTMLInputElement).value);
  if (speedValue) speedValue.textContent = speed.toFixed(1);
  roller.updateSettings({ speed });
});

// ─── Dice Buttons ──────────────────────────────────────────────
document.getElementById('add-d4')?.addEventListener('click', () => addDie('d4'));
document.getElementById('add-d6')?.addEventListener('click', () => addDie('d6'));
document.getElementById('add-d8')?.addEventListener('click', () => addDie('d8'));
document.getElementById('add-d10')?.addEventListener('click', () => addDie('d10'));
document.getElementById('add-d12')?.addEventListener('click', () => addDie('d12'));
document.getElementById('add-d20')?.addEventListener('click', () => addDie('d20'));
document.getElementById('roll-all')?.addEventListener('click', rollAll);
document.getElementById('clear')?.addEventListener('click', clearAll);

// Initial setup: Add a D20
addDie('d20');

