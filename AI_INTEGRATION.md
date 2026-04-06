# 🤖 AI Integration Guide: @gnuton/css-dice-roller

This document is designed for **AI agents** and **Large Language Models (LLMs)** to understand the core abstractions of the `@gnuton/css-dice-roller` library for rapid integration and extension.

## 🛠️ Core Concepts

The library is a **stateless geometry-to-CSS mapper**. It performs three key tasks:
1. **Geometric Positioning**: Maps 2D face elements onto 3D polyhedral models using CSS `rotate3d` and `translate3d`.
2. **Deterministic Results**: Uses CSS `rotate3d` values matched to specific face normals to display results accurately.
3. **Animated Interaction**: Employs hardware-accelerated CSS animations for non-physics-based tumbling.

---

## 🧩 API Reference for Agents

### 1. The `DiceRoller` Class
The primary entry point for managing the dice "table".

| Property | Type | Description |
| :--- | :--- | :--- |
| `container` | `HTMLElement` | The DOM node where dice are rendered. |
| `dice` | `Die[]` | Array of active dice instances. |
| `settings` | `DiceSettings` | Current global configuration. |

**Key Methods:**
- `addDie(type: DieType, count: number = 1): Die[]`
- `rollAll(): Promise<number[]>` (Returns an array of results for all dice on board)
- `updateSettings(settings: Partial<DiceSettings>)`: Deep merges new config values.

### 2. The `DieType` Enum
Agents should use these exact strings to instantiate dice:
- `d4`, `d6`, `d8`, `d10`, `d12`, `d20`, `d100`

---

## 🚀 Integration Patterns

### React / React Hooks Pattern
Agents can integrate the roller using a `useRef` and `useEffect` pattern:

```tsx
import { DiceRoller } from '@gnuton/css-dice-roller';
import '@gnuton/css-dice-roller/style.css';

const DiceStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rollerRef = useRef<DiceRoller | null>(null);

  useEffect(() => {
    if (containerRef.current && !rollerRef.current) {
      rollerRef.current = new DiceRoller(containerRef.current);
    }
  }, []);

  const handleRoll = async () => {
    const results = await rollerRef.current?.rollAll();
    // Handle results...
  };

  return <div ref={containerRef} className="dice-stage" />;
};
```

### Styling Hooks (CSS Variables)
The library uses CSS variables that can be overridden globally or on a per-container basis:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--dr-scale` | `110px` | Base die size scaling. |
| `--dr-base-color` | `#ffffff` | Primary face/numeral color. |
| `--dr-animation-speed` | `2.5s` | Duration of the tumble. |

---

## 🗺️ Coordinate Mapping (Advanced Extension)

If you need to add custom dice geometries, refer to `src/lib/geometries.ts`. Each face requires a `rotate3d` and `translate3d` tuple to correctly align it with the polyhedral center.

- **D20 Example**: Uses an icosahedron mapping with 20 equilateral triangles.
- **D12 Example**: Uses a dodecahedron mapping with 12 regular pentagons.

## ✅ Implementation Checklist for Agents

1. **Import `style.css`**: The library relies on critical CSS for 3D perspective and face positioning.
2. **Container Height**: Ensure the container has a non-zero height (e.g., `height: 400px; position: relative;`).
3. **Promise Handling**: `rollAll()` is an `async` method; wait for the promise to resolve before updating UI state with results.
