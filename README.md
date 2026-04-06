# 🎲 Polyhedral 3D CSS Dice Roller

A performance-optimized, **pure CSS-based 3D dice rolling library** for modern web applications. No WebGL, no heavy physics engines—just pure CSS 3D transforms for buttery-smooth animations at 60fps.

**[🚀 View Live Demo](https://gnuton.github.io/css-dice-roller/)**

---

## ✨ Features

- **🎯 Geometrically Accurate**: Each die (D4, D6, D8, D12, D20) is mapped using precise polyhedral vertex coordinates.
- **⚡ Hardware Accelerated**: Animations are powered by the browser's 3D transform engine, ensuring zero CPU overhead during rolls.
- **🛠️ Zero Dependencies**: Ultra-lightweight footprint (~15kB gzipped).
- **🎨 Dynamic Theming**: Real-time styling support with CSS variables and built-in themes (Glass, Solid, Neon).
- **🕹️ Interactive Controls**: Built-in pointer dragging for manual die inspection and rotation.
- **📐 Fully Typed**: Written in TypeScript for first-class developer experience.

## 📦 Installation

Add the library to your project via the official npm registry:

```bash
npm install @gnuton/css-dice-roller
```

> [!NOTE]
> For organizations using GitHub Packages, the library remains available at `npm.pkg.github.com` via the `@gnuton` scope.

## 🚀 Quick Start

```typescript
import { DiceRoller } from '@gnuton/css-dice-roller';
import '@gnuton/css-dice-roller/style.css';

// Initialize the roller on a container element
const container = document.getElementById('dice-container');
const roller = new DiceRoller(container);

// Add dice to the board
roller.addDie('d20');
roller.addDie('d6', 2); // Add two d6s

// Roll and get results
const results = await roller.rollAll();
console.log('Final results:', results);
```

## ⚙️ Configuration & Theming

The `DiceRoller` supports deep customization through the `updateSettings` method:

```typescript
roller.updateSettings({
  theme: 'theme-glass',     // 'theme-glass', 'theme-solid', 'theme-neon'
  baseColor: '#00ccff',     // Any CSS color string
  animation: 'standard',    // 'standard', 'chaotic', 'float', 'none'
  scale: 120,               // Pixel size
  speed: 2.5,               // Roll duration in seconds
  dragEnabled: true         // Allow manual rotation
});
```

### Supported Dice Set

- **D4**: Tetrahedron
- **D6**: Hexahedron (Standard Cube)
- **D8**: Octahedron
- **D10/D100**: Pentagonal Trapezohedron
- **D12**: Dodecahedron
- **D20**: Icosahedron

## 🤖 AI & Agentic Integration

This library is designed to be highly predictable and "agent-friendly". If you are integrating this using an AI assistant, please refer to our [**AI Integration Guide**](./AI_INTEGRATION.md) for optimized patterns and API mapping.

## 🛠️ Local Development

Clone the repo and run the interactive playground:

```bash
# Start dev server
npm run dev

# Run unit tests
npm test
```

## 📜 License

MIT © [Antonio Aloisio](https://github.com/gnuton)
