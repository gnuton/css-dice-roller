import { Engine, Runner, Bodies, Composite, Body, Events, Vector, Sleeping, Mouse, MouseConstraint } from 'matter-js';

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
    Events.on(this.engine, 'afterUpdate', () => {
      this.emitUpdates();
    });
  }

  private updatesCallbacks: ((data: PhysicsUpdateData[]) => void)[] = [];

  public onUpdates(callback: (data: PhysicsUpdateData[]) => void) {
    this.updatesCallbacks.push(callback);
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
    Composite.add(this.engine.world, body);
    return body;
  }

  public removeBody(id: string) {
    const body = this.bodies.get(id);
    if (body) {
      Composite.remove(this.engine.world, body);
      this.bodies.delete(id);
    }
  }

  public setWalls(width: number, height: number, thickness: number = 60) {
    // Remove old walls
    if (this.walls.length > 0) {
      Composite.remove(this.engine.world, this.walls);
    }

    this.walls = [
      // Bottom (High friction to kill horizontal slide on settle)
      Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, { isStatic: true, restitution: 0.7, friction: 0.8 }),
      // Left (Lower restitution to contain energy)
      Bodies.rectangle(-thickness / 2, height / 2, thickness, height, { isStatic: true, restitution: 0.5, friction: 0.1 }),
      // Right
      Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, { isStatic: true, restitution: 0.5, friction: 0.1 })
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

  public getWalls() {
    return this.walls.map(wall => ({
        position: { x: wall.position.x, y: wall.position.y },
        vertices: wall.vertices.map(v => ({ x: v.x, y: v.y }))
    }));
  }
}
