import { Engine, Runner, Bodies, Composite, Body, Events, Vector, Sleeping, Mouse, MouseConstraint, Constraint } from 'matter-js';

export interface PhysicsUpdateData {
  id: string;
  position: { x: number; y: number };
  angle: number;
  velocity: { x: number; y: number };
  angularVelocity: number;
  isSleeping: boolean;
  vertices: { x: number; y: number }[];
}

export class PhysicsEngine {
  private engine: Engine;
  private runner: Runner;
  private bodies: Map<string, Body> = new Map();
  private walls: Body[] = [];
  private mouseConstraint: MouseConstraint;
  private bounds = { width: 800, height: 600, topOffset: 0 };
  private bulkConstraints: { constraint: Constraint; offset: Vector }[] = [];
  private onSettledCallback: (() => void) | null = null;
  private wasActive = false;
  private bodySizes: Map<string, number> = new Map();

  constructor(container: HTMLElement) {
    this.engine = Engine.create({
        enableSleeping: true
    });
    
    // Moderate gravity for the "drop" from shelf to pit feel
    this.engine.gravity.y = 1; 
    
    this.runner = Runner.create();

    // Mouse interaction
    const mouse = Mouse.create(container);
    this.mouseConstraint = MouseConstraint.create(this.engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.15,
        render: { visible: false }
      }
    });

    Composite.add(this.engine.world, this.mouseConstraint);
    
    // Sync loop
    Events.on(this.engine, 'beforeUpdate', () => {
      this.clampMouse();
    });

    Events.on(this.engine, 'afterUpdate', () => {
      this.emitUpdates();
      this.checkSettlement();
    });
  }

  private checkSettlement() {
      if (this.bodies.size === 0) return;

      const allSleeping = Array.from(this.bodies.values()).every(b => b.isSleeping);
      
      if (!allSleeping) {
          this.wasActive = true;
      } else if (this.wasActive && allSleeping) {
          this.wasActive = false;
          this.onSettledCallback?.();
      }
  }

  private clampMouse() {
    // Only clamp if the mouse is actively interacting
    if (this.mouseConstraint.mouse.button !== -1) {
      const pos = this.mouseConstraint.mouse.position;
      const padding = 5; // Minimal padding to keep body centers clearly inside
      
      pos.x = Math.max(padding, Math.min(pos.x, this.bounds.width - padding));
      pos.y = Math.max(this.bounds.topOffset + padding, Math.min(pos.y, this.bounds.height - padding));
    }
  }

  private updatesCallbacks: ((data: PhysicsUpdateData[]) => void)[] = [];

  public onUpdates(callback: (data: PhysicsUpdateData[]) => void) {
    this.updatesCallbacks.push(callback);
  }

  public onSettled(callback: () => void) {
      this.onSettledCallback = callback;
  }

  private emitUpdates() {
    const updates: PhysicsUpdateData[] = [];
    this.bodies.forEach((body, id) => {
      updates.push({
        id,
        position: { x: body.position.x, y: body.position.y },
        angle: body.angle,
        velocity: { x: body.velocity.x, y: body.velocity.y },
        angularVelocity: body.angularVelocity,
        isSleeping: body.isSleeping,
        vertices: body.vertices.map(v => ({ x: v.x, y: v.y }))
      });
    });
    
    this.updatesCallbacks.forEach(cb => cb(updates));
  }

  public start() {
    Runner.run(this.runner, this.engine);
  }

  public stop() {
    Runner.stop(this.runner);
  }

  public addBox(id: string, x: number, y: number, size: number) {
    // Dice are essentially squares in 2D physics
    const body = Bodies.rectangle(x, y, size, size, {
      restitution: 0.6, // Tactile bounciness
      friction: 0.1,   // Reduced friction for more active rolling
      frictionAir: 0.03, // Low air resistance
      label: id,
      sleepThreshold: 40 // Higher threshold to force a resting state faster
    });
    
    this.bodies.set(id, body);
    this.bodySizes.set(id, size);
    Composite.add(this.engine.world, body);
    return body;
  }

  public updateBodyScale(id: string, newSize: number) {
    const body = this.bodies.get(id);
    const oldSize = this.bodySizes.get(id);
    if (!body || !oldSize) return;

    const scaleFactor = newSize / oldSize;
    Body.scale(body, scaleFactor, scaleFactor);
    this.bodySizes.set(id, newSize);
  }

  public removeBody(id: string) {
    const body = this.bodies.get(id);
    if (body) {
      Composite.remove(this.engine.world, body);
      this.bodies.delete(id);
      this.bodySizes.delete(id);
    }
  }

  public setWalls(width: number, height: number, topOffset: number = 0, thickness: number = 100) {
    this.bounds = { width, height, topOffset };
    
    // Remove old walls
    if (this.walls.length > 0) {
      Composite.remove(this.engine.world, this.walls);
    }

    // Walls are positioned such that their inner edges align with the requested boundaries
    this.walls = [
      // Bottom
      Bodies.rectangle(width / 2, height + thickness / 2, width + thickness * 2, thickness, { 
        isStatic: true, restitution: 0.7, friction: 0.8, label: 'wall-bottom' 
      }),
      // Top
      Bodies.rectangle(width / 2, topOffset - thickness / 2, width + thickness * 2, thickness, { 
        isStatic: true, restitution: 0.7, friction: 0.1, label: 'wall-top' 
      }),
      // Left
      Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 2, { 
        isStatic: true, restitution: 0.5, friction: 0.1, label: 'wall-left' 
      }),
      // Right
      Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 2, { 
        isStatic: true, restitution: 0.5, friction: 0.1, label: 'wall-right' 
      })
    ];

    Composite.add(this.engine.world, this.walls);
  }

  public launch(id: string, force: Vector, torrent: number = 0) {
    const body = this.bodies.get(id);
    if (body) {
        Sleeping.set(body, false);
        Body.applyForce(body, body.position, force);
        if (torrent !== 0) {
            Body.setAngularVelocity(body, torrent);
        }
    }
  }

  public setPosition(id: string, x: number, y: number) {
    const body = this.bodies.get(id);
    if (body) {
        Body.setPosition(body, { x, y });
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
    }
  }

  public bulkGrabStart() {
    this.bulkGrabEnd(); // Cleanup
    this.mouseConstraint.enabled = false;
    
    const mousePos = this.mouseConstraint.mouse.position;
    
    this.bodies.forEach(body => {
      // Force all bodies to converge on the cursor (grouped feel)
      const offset = { x: 0, y: 0 }; 

      const constraint = Constraint.create({
        pointA: { x: mousePos.x, y: mousePos.y },
        bodyB: body,
        stiffness: 0.2, //Decisive pull but allow some physical 'give' during cluster collision
        damping: 0.1,
        length: 0,
        render: { visible: false }
      });

      this.bulkConstraints.push({ constraint, offset });
      Composite.add(this.engine.world, constraint);
      Sleeping.set(body, false);
    });
  }

  public bulkGrabMove() {
      if (this.bulkConstraints.length === 0) return;
      
      const mousePos = this.mouseConstraint.mouse.position;
      
      this.bulkConstraints.forEach(({ constraint, offset }) => {
          constraint.pointA.x = mousePos.x + offset.x;
          constraint.pointA.y = mousePos.y + offset.y;
      });
  }

  public bulkGrabEnd() {
    this.bulkConstraints.forEach(({ constraint }) => {
      Composite.remove(this.engine.world, constraint);
    });
    this.bulkConstraints = [];
    this.mouseConstraint.enabled = true;
  }

  public getWalls() {
    return this.walls.map(wall => ({
        position: { x: wall.position.x, y: wall.position.y },
        vertices: wall.vertices.map(v => ({ x: v.x, y: v.y }))
    }));
  }
}
