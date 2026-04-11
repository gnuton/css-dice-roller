# Interaction Design Specification: Physics Dice Tray

This document specifies the gestures, mouse mappings, and interaction lifecycle for the **Physics Dice Tray** layout in the CSS Dice Roller. This system is designed to provide a tactile, board-game-like experience where players "grab and throw" dice.

---

## 1. Interaction Hierarchy

The interface is divided into two primary logical zones:

### 1.1 Inactive Area (The Shelf)
*   **CSS Class**: `.dice-tray-shelf`
*   **Purpose**: A staging area for dice that are not yet in play.
*   **Behavior**: Dice are displayed in a clean grid or row. They are visually static and do not participate in physics simulations.

### 1.2 Active Area (The Rolling Pit)
*   **CSS Class**: `.dice-tray-rolling-area`
*   **Purpose**: The main gameplay area where physics simulation occurs.
*   **Behavior**: A bounded rectangle with "walls" where dice collide, tumble, and settle.

---

## 2. Input Mapping & Gestures

### 2.1 Mouse Button Mapping (Desktop)

| Input | Target | Action | Result |
| :--- | :--- | :--- | :--- |
| **LMB (Click)** | Die on Shelf | Activation | Die moves to Tray (at cursor position). |
| **LMB (Hold/Drag)** | Empty Tray | **Scoop** | All active dice converge and follow the cursor. |
| **LMB (Release)** | Empty Tray | **Throw** | Dice are launched with a physics impulse. |
| **LMB (Click)** | Tray (Settled) | Reset | All active dice return to the Shelf. |
| **RMB (Click)** | Die in Tray | Deactivation | Specific die returns to the Shelf. |

### 2.2 Touch Gestures (Mobile/Tablet)

| Gesture | Target | Result |
| :--- | :--- | :--- |
| **Tap** | Die on Shelf | Activation (Move to Tray). |
| **Drag** | Empty Tray | Scoop & Throw (Group dice and launch on release). |
| **Long Press** | Die in Tray | Deactivation (Return to Shelf) — *Equivalent to RMB*. |
| **Shake Device** | Global | Triggers a randomized roll on all active dice. |

---

## 3. Core Mechanics

### 3.1 The "Scoop" Gesture
When the user holds **LMB** in the rolling area, a `Matter.Constraint` is dynamically created for every active die, connecting them to the mouse cursor position.
- **Visual Cue**: Dice receive the `.is-scooped` class, which typically adds a glow or slight scaling effect.
- **Physics**: Dice are pulled toward the cursor with a "springy" stiffness, allowing them to clump together naturally without overlapping hitboxes.

### 3.2 The "Throw" (Release)
Upon `pointerup`, the constraints are destroyed, and an **Impulse Matrix** is applied:
1.  **Velocity**: A vector based on the cursor's movement speed at the moment of release.
2.  **Torque**: A randomized angular velocity to ensure the dice tumble realistically.
3.  **Randomization**: A small ±5% variation is added to every die to prevent "stacking" or identical landing patterns.

### 3.3 Settlement & Results view
The system monitors the "Sleeping" state of all physics bodies. 
1.  **Settling Phase**: Dice lose energy through friction and restitution.
2.  **Lock-in**: Once all bodies are `isSleeping`, a 600ms "soft-landing" visual transition begins.
3.  **Top View**: The tray enters `is-top-view` mode. Dice fade out slightly, and a high-contrast **Sum Overlay** appears showing the total result.

### 3.4 "Roll All" Logic
The "Roll All" functionality (triggered by the sidebar button, "Test Roll" button, or Device Shake) adapts its behavior based on the current layout mode:

1. **Standard Layouts (Grid, Circle, Pool)**: 
   - All dice in the container are rolled simultaneously.
   - Synchronized CSS animations (`is-rolling` class) are applied.
   - The UI button is disabled during the animation duration (governed by the `speed` setting).

2. **Physics Tray Mode**:
   - Only **Active Dice** (those currently in the rolling pit) are rolled.
   - Dice remaining on the **Shelf** are ignored.
   - In addition to CSS animations, each die receives a randomized physics impulse and torque to ensure a unique tumble.

3. **Edge Cases**:
   - **Empty Tray**: If no dice exist, the roll completes immediately with an empty result set.
   - **Settlement Safety**: The "Roll All" button is automatically disabled when the tray is in "Results View" (Top View) to prevent overlapping roll states.

---

## 4. Architectural Requirements (Board Game Context)

To ensure a premium "Board Game" feel, the implementation must adhere to these requirements:

### 4.1 Zero-Flicker Activation (Atomic Handoff)
When a die moves from the Shelf (DOM Layout) to the Tray (Absolute Physics), it must not "flash" at coordinates (0,0).
- **Requirement**: The die's style must be updated to `visibility: hidden` and `transition: none` *before* moving DOM nodes, and only revealed once the physics engine has confirmed the first frame of the new position.

### 4.2 Progressive Instruction System
The UI must dynamically update instructions based on the tray's state:
- If Shelf is full: *"Click shelf to roll"*
- If Tray has dice: *"Scoop to throw all • RMB to return"*
- If Results are visible: *"Click tray to return all"*

---

## 5. Known Design Limitations & Recommendations

> [!CAUTION]
> **Mobile Shake Limitations**: Browser security policies (iOS Safari) prevent `DeviceMotionEvent` from starting without an explicit user "Handshake" (e.g., clicking an 'Enable Sensors' button).

> [!TIP]
> **Settlement Safety**: In "Board Game" mode, use a **Velocity Clamp** instead of relying purely on Matter.js sleep. If dice are moving slower than 0.1px/frame, they should be "forced" to stop to prevent waiting for micro-jitters.
