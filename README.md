# Polyhedral 3D CSS Dice Roller

A lightweight, purely CSS-based 3D dice rolling library for web applications. Optimized for performance and visual fidelity, it uses CSS 3D transforms for all animations, ensuring smooth 60fps movement even on mobile devices.

**[🚀 View Live Demo](https://gnuton.github.io/css-dice-roller/)**


## Features

- **Geometrically Accurate**: Faces are positioned using precise polyhedral coordinate mappings.
- **Pure CSS Animations**: Smooth spinning and tumbling effects powered by hardware-accelerated CSS.
- **Interactive Dragging**: Manually rotate and inspect dice with pointer controls.
- **Dynamic Theming**: Support for multiple visual styles (Glass, Solid, Neon) and custom colors.
- **Typescript Ready**: Full type definitions for die geometries and roller logic.

## Supported Dice

- **D4, D6, D8, D12, D20**: Full set of standard polyhedral dice with precise calibration.

### Installation

Add the library to your project via npm:

```bash
npm install css-dice-roller
```

### Quick Start

```typescript
import { DiceRoller } from 'css-dice-roller';
import 'css-dice-roller/style.css';

const container = document.getElementById('dice-container');
const roller = new DiceRoller(container);

// Add some dice
roller.addDie('d20');
roller.addDie('d6', 2);

// Roll all dice
const results = await roller.rollAll();
console.log('Results:', results);
```

## Configuration & Theming

The `DiceRoller` supports deep customization through the `updateSettings` method.

```typescript
roller.updateSettings({
  theme: 'theme-neon',
  baseColor: '#ff00ff',
  animation: 'chaotic',
  speed: 3.5,
  dragEnabled: true
});
```

### Visual Themes

| Theme ID | Description |
| :--- | :--- |
| `theme-glass` | Semi-transparent frosted glass effect (Default). |
| `theme-solid` | Solid, opaque faces with crisp borders. |
| `theme-neon` | Glowing edges and high-contrast numerals. |

### Animation Types

| Animation | Description |
| :--- | :--- |
| `standard` | High-energy tumbling and spinning. |
| `chaotic` | Rapid, multi-axis rotation for high variance feel. |
| `float` | Slow, graceful drifting rotation. |
| `none` | Immediate result display without animation. |

## Interactive Dragging

Enable the `dragEnabled` setting to allow users to manually rotate dice. This is perfect for inspection or "fidgeting" with the dice between rolls.

- **Desktop**: Left-click and drag.
- **Mobile**: Touch and drag.
- **Reset**: Rolling the dice automatically resets them to their home orientation before the animation starts.

## API Reference

### `DiceRoller` Methods

- `addDie(type: DieType, count?: number): Die[]`: Adds dice to the container.
- `clear()`: Removes all dice from the board.
- `rollAll(): Promise<number[]>`: Rolls all active dice and returns an array of results.
- `updateSettings(settings: Partial<DiceSettings>)`: Updates configuration globally for all dice.
- `getSettings(): DiceSettings`: Returns current active settings.

### `DiceSettings` Interface

```typescript
interface DiceSettings {
  theme: string;              // 'theme-glass' | 'theme-solid' | 'theme-neon'
  baseColor: string;          // Hex, HSL, or RGB color string
  scale: number;              // Size in pixels (default: 110)
  animation: AnimationType;   // 'standard' | 'chaotic' | 'float' | 'none'
  randomizeAnimation: boolean;// Picks a random animation type per roll
  speed: number;              // Animation duration in seconds (default: 2.5)
  dragEnabled: boolean;       // Enable pointer-based manual rotation
}
```

## Development

### Running the Demo

To start the development server and view the interactive demo:

```bash
npm run dev
```

### Running Tests

We use [Vitest](https://vitest.dev/) for unit testing. To run the test suite:

```bash
npm test
```

## Publishing

This project uses GitHub Actions for automated publishing. Update the version in `package.json` and push a new tag to trigger the workflow.

## License

MIT

