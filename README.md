# Polyhedral 3D CSS Dice Roller

A lightweight, purely CSS-based 3D dice rolling library for web applications. Optimized for performance and visual fidelity, it uses CSS 3D transforms for all animations, ensuring smooth 60fps movement even on mobile devices.

## Features

- **Geometrically Accurate**: Faces are positioned using precise polyhedral coordinate mappings.
- **Pure CSS Animations**: Smooth spinning and tumbling effects powered by hardware-accelerated CSS.
- **Modular Design**: Easy to integrate and extend with new polyhedra.
- **Typescript Ready**: Full type definitions for die geometries and roller logic.

## Supported Dice

- **D4 (Tetrahedron)**: Precise tilt and offset calibration for perfect closure.
- **D6 (Cube)**: Standard cubic layout.
- *More coming soon (D8, D10, D12, D20)*

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
git clone https://github.com/gnuton/css-dice-roller.git
cd css-dice-roller
npm install
```

### Running the Demo

To start the development server and view the interactive demo:

```bash
npm run dev
```

The demo will be available at `http://localhost:3000`.

### Running Tests

We use [Vitest](https://vitest.dev/) for unit testing. To run the test suite:

```bash
npm test
```

## Library Usage

### Initializing the Roller

```typescript
import { DiceRoller } from './src/lib/dice-roller';

const container = document.getElementById('dice-container');
const roller = new DiceRoller(container, 100); // 100px default size
```

### Adding Dice

```typescript
// Add one D6
roller.addDie('d6');

// Add three D4s
roller.addDie('d4', 3);
```

### Rolling and Results

```typescript
const results = await roller.rollAll();
console.log('Results:', results);
// Output: [4, 6, 1, 2] (sum of all dice)
```

### Clearing the Board

```typescript
roller.clear();
```

## Architecture

The library is divided into:
- `DiceRoller`: High-level manager for adding, clearing, and rolling groups of dice.
- `Die`: Individual die component handling DOM creation and CSS transform updates.
- `GEOMETRIES`: Data registry for polyhedral faces, vertex rotations, and animation offsets.

## License

MIT
