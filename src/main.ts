import { DiceRoller } from './lib/dice-roller';
import { DieType, AnimationType, DiceSettings } from './lib/types';
import { THEMES } from './lib/themes';
import { SettingsManager } from './lib/settings-manager';
import { UIController } from './lib/ui-controller';
import './styles/index.css';
import './styles/dice.css';
import './styles/theme.css';

const ui = new UIController();
let currentSettings = SettingsManager.load();
const roller = new DiceRoller(document.getElementById('dice-container')!, currentSettings.scale);

// ─── Core Logic ────────────────────────────────────────────────
const syncUI = () => {
  const faceLabels = currentSettings.customSymbols ? {
    1: '💀',
    2: '⚔️',
    3: '🛡️',
    4: '✨',
    5: '🔥',
    6: '<span style="font-size: 1.5em; filter: drop-shadow(0 0 5px gold)">👑</span>'
  } : undefined;

  roller.updateSettings({ ...currentSettings, faceLabels });
  ui.syncUI(currentSettings, roller.getTrayActiveCount?.() || 0, roller.getDiceCount());
  ui.syncActiveDiceState(roller.getTrayActiveCount?.() || 0, roller.getDiceCount(), currentSettings.layoutMode);
};

const rollAll = async () => {
  const rollButton = document.getElementById('roll-all') as HTMLButtonElement;
  if (rollButton) {
    rollButton.disabled = true;
    rollButton.textContent = 'Rolling...';
  }

  const results = await roller.rollAll();
  ui.showResultsPopup(results);
  ui.updateResult(results.reduce((a, b) => a + b, 0));

  if (rollButton) {
    rollButton.disabled = false;
    rollButton.textContent = 'Roll All';
  }
};

// ─── UI Event Wiring ───────────────────────────────────────────

// Theme Selection
document.getElementById('theme-select')?.addEventListener('change', (e) => {
  const themeId = (e.target as HTMLSelectElement).value;
  currentSettings.theme = themeId;
  const themeDef = THEMES.find(t => t.id === themeId);
  if (themeDef && themeDef.colors) {
    currentSettings.baseColor = themeDef.colors.primary;
    currentSettings.secondaryColor = themeDef.colors.secondary;
    currentSettings.textColor = themeDef.colors.text;
  }
  syncUI();
  SettingsManager.save(currentSettings);
});

// Settings Sliders & Toggles
const bindSetting = (id: string, key: keyof typeof currentSettings, isCheckbox = false, isFloat = false) => {
  document.getElementById(id)?.addEventListener(isCheckbox ? 'change' : 'input', (e) => {
    const target = e.target as HTMLInputElement;
    const val = isCheckbox ? target.checked : (isFloat ? parseFloat(target.value) : parseInt(target.value));
    (currentSettings as any)[key] = val;
    roller.updateSettings({ [key]: val });
    syncUI();
    SettingsManager.save(currentSettings);
  });
};

bindSetting('secondary-color-picker', 'secondaryColor');
bindSetting('text-color-picker', 'textColor');
bindSetting('scale-slider', 'scale');
bindSetting('text-scale-slider', 'textScale', false, true);
bindSetting('speed-slider', 'speed', false, true);
bindSetting('bounciness-slider', 'bounciness', false, true);
bindSetting('gravity-slider', 'gravity', false, true);
bindSetting('constant-spin', 'constantSpin', true);
bindSetting('random-animation', 'randomizeAnimation', true);
bindSetting('drag-mode', 'dragEnabled', true);
bindSetting('custom-symbols', 'customSymbols', true);
bindSetting('show-instructions', 'showInstructions', true);

// Layout & Animation
document.getElementById('layout-select')?.addEventListener('change', (e) => {
  currentSettings.layoutMode = (e.target as HTMLSelectElement).value as any;
  syncUI();
  SettingsManager.save(currentSettings);
});

document.getElementById('animation-select')?.addEventListener('change', (e) => {
  currentSettings.animation = (e.target as HTMLSelectElement).value as AnimationType;
  roller.updateSettings({ animation: currentSettings.animation });
  SettingsManager.save(currentSettings);
});

// Debug
const bindDebug = (id: string, key: keyof Required<DiceSettings>['debugOptions']) => {
  document.getElementById(id)?.addEventListener('change', (e) => {
    if (!currentSettings.debugOptions) {
        currentSettings.debugOptions = {
            showHitboxes: false,
            showVectors: false,
            showBoundaries: false,
            showTraces: false
        };
    }
    currentSettings.debugOptions[key] = (e.target as HTMLInputElement).checked;
    roller.updateSettings({ debugOptions: currentSettings.debugOptions });
    SettingsManager.save(currentSettings);
  });
};

bindDebug('debug-hitboxes', 'showHitboxes');
bindDebug('debug-vectors', 'showVectors');
bindDebug('debug-boundaries', 'showBoundaries');
bindDebug('debug-traces', 'showTraces');

document.getElementById('reset-settings')?.addEventListener('click', () => {
  currentSettings = SettingsManager.load(); // Or reset to defaults
  syncUI();
  SettingsManager.save(currentSettings);
});

// Dice Controls
const addDie = (type: DieType) => roller.addDie(type);
document.getElementById('add-d4')?.addEventListener('click', () => addDie('d4'));
document.getElementById('add-d6')?.addEventListener('click', () => addDie('d6'));
document.getElementById('add-d8')?.addEventListener('click', () => addDie('d8'));
document.getElementById('add-d10')?.addEventListener('click', () => addDie('d10'));
document.getElementById('add-d12')?.addEventListener('click', () => addDie('d12'));
document.getElementById('add-d20')?.addEventListener('click', () => addDie('d20'));
document.getElementById('roll-all')?.addEventListener('click', rollAll);
document.getElementById('test-roll')?.addEventListener('click', rollAll);
document.getElementById('clear')?.addEventListener('click', () => { roller.clear(); ui.updateResult(0); });

// Sidebar Toggle Logic
const sidebar = document.querySelector('.sidebar');
document.getElementById('sidebar-toggle')?.addEventListener('click', (e) => { e.stopPropagation(); sidebar?.classList.toggle('sidebar-active'); });
document.getElementById('sidebar-close')?.addEventListener('click', () => sidebar?.classList.remove('sidebar-active'));
document.querySelector('.main-content')?.addEventListener('click', () => sidebar?.classList.remove('sidebar-active'));

// Initialize
ui.populateThemeSelect(currentSettings.theme);
syncUI();
if (roller.getDiceCount() === 0) addDie('d20');

// Tray Events
roller.onTrayStateChange((active, total) => {
  ui.syncActiveDiceState(active, total, currentSettings.layoutMode);
});

roller.onTrayRollComplete((results) => {
  ui.showResultsPopup(results);
  ui.updateResult(results.reduce((a, b) => a + b, 0));
});

roller.onTrayInteractionStart(() => {
  ui.hideResultsPopup();
  // Reset the sidebar sum display to clear state
  const totalSumDisplay = document.getElementById('total-sum');
  if (totalSumDisplay) totalSumDisplay.textContent = '-';
});

roller.onTrayShake(() => {
  rollAll();
});

// Resize Observer
const wrapper = document.getElementById('dice-container-wrapper');
if (wrapper) {
  new ResizeObserver(() => roller.rearrange()).observe(wrapper);
}
