# Polyhedral 3D CSS Dice Roller

A lightweight, purely CSS-based 3D dice rolling library for web applications. Optimized for performance and visual fidelity, it uses CSS 3D transforms for all animations, ensuring smooth 60fps movement even on mobile devices.

## Features

- **Geometrically Accurate**: Faces are positioned using precise polyhedral coordinate mappings.
- **Pure CSS Animations**: Smooth spinning and tumbling effects powered by hardware-accelerated CSS.
- **Modular Design**: Easy to integrate and extend with new polyhedra.
- **Typescript Ready**: Full type definitions for die geometries and roller logic.

## Supported Dice

- **D4, D6, D8, D10, D12, D20**: Full set of standard polyhedral dice with precise calibration.


### Installation

Add the library to your project via npm:

```bash
npm install css-dice-roller
```

### Importing the Styles

The 3D transforms require the library's CSS to function correctly. Import it in your entry point:

```typescript
import 'css-dice-roller/style.css';
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

### Initializing the Roller

```typescript
import { DiceRoller } from 'css-dice-roller';

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

## Publishing New Versions

This project uses GitHub Actions for automated publishing to npm. To publish a new version:

1. Update the version in `package.json`:
   ```bash
   npm version patch # or minor/major
   ```
2. Push the tags to GitHub:
   ```bash
   git push origin main --tags
   ```

The workflow will automatically run tests, build the library, and publish it to the npm registry.

## License

MIT

