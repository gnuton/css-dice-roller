# 📐 3D Polyhedral Geometry Reference

This document outlines the mathematical constants and transformation parameters used by the **Emerald & Gold Forge** 3D engine to assemble and render polyhedral dice.

## 🏗️ The Unit Coordinate System (0–200)
The engine uses a **normalized 200-unit workspace**.
- **Face Width ($L$):** Fixed at **100 units**.
- **Container Size:** 200 units (base for all calculations).
- **Pixel Scaling:** A `scaleFactor` ($size / 200$) is applied at runtime to map these units to the user-defined pixel size.

---

## 🎲 D6 (Hexahedron) Reference
The D6 is a regular hexahedron where each face is a $100 \times 100$ square.

- **Inradius ($r$):** The distance from the geometric center to each face.
  - **Formula:** $L / 2$
  - **Value:** **50 units**.
- **Face Arrangement:**
  - Standard XYZ planes rotated at $90^\circ$ increments.

---

## 🎲 D4 (Tetrahedron) Reference
The D4 is a regular tetrahedron where each face is an equilateral triangle.

### Properties
- **Face Width ($L$):** 100 units.
- **Face Height ($H$):** $100 \times \sin(60^\circ) \approx \mathbf{86.60}$ units.
- **Dihedral Angle:** The angle between any two faces is $\arccos(1/3) \approx \mathbf{70.53^\circ}$.

### Assembly Parameters
- **Inradius ($r_{in}$):** Distance from the face centroid to the tetrahedron center.
  - **Formula:** $L / (2 \sqrt{6})$
  - **Value:** **20.412 units**.
- **Tilt Angle:** Side faces tilt inward to meet at the top apex.
  - **Formula:** $90^\circ - 70.53^\circ$
  - **Value:** **-19.471° inwards** (Negative X-rotation in CSS relative to front plane).
- **Centroid Pivot ($ty$):**
  - A regular triangle's centroid is $1/3$ of its height from the base ($28.87$ units).
  - To align this with the rotation origin $(0,0,0)$, we apply a vertical offset.
  - **Value:** **-14.43 units (UP)**.

---

## 🔄 Transformation Pipeline (Orient First, Push Second)
To ensure the die rotates on its **Center of Mass**, the engine applies transforms in this specific architectural order:

1.  **Midpoint Alignment**: Faces are placed at `top: 50%; left: 50%`.
2.  **`translateY(ty)`**: Centers the specific shape's centroid onto the rotation origin.
3.  **`rotateY(y_angle)`**: Positions the face on the correct horizontal quadrant.
4.  **`rotateX(tilt)`**: Applies the inward tilt (dihedral angle correction). This orients the local Z-axis to point correctly from the center to the face center.
5.  **`translateZ(radius)`**: Pushes the face out exactly along the tilted normal.

> [!IMPORTANT]
> **Why this order?** If `translateZ` is applied *before* `rotateX`, the face pivots around a point that is already away from the origin, resulting in an eccentric orbit. **Orienting the normal before pushing** ensures the center of mass remains perfectly at $(0,0,0)$.
