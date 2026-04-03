import { DiceRoller } from './lib/dice-roller';
import { DieType } from './lib/types';
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
  // don't reset sum when a die is added
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

// Event Listeners
document.getElementById('add-d4')?.addEventListener('click', () => addDie('d4'));
document.getElementById('add-d6')?.addEventListener('click', () => addDie('d6'));
document.getElementById('add-d8')?.addEventListener('click', () => addDie('d8'));
document.getElementById('add-d10')?.addEventListener('click', () => addDie('d10'));
document.getElementById('add-d12')?.addEventListener('click', () => addDie('d12'));
document.getElementById('add-d20')?.addEventListener('click', () => addDie('d20'));
document.getElementById('roll-all')?.addEventListener('click', rollAll);
document.getElementById('clear')?.addEventListener('click', clearAll);

// Initial setup: Add a D4 and D6
addDie('d4');
addDie('d6');

