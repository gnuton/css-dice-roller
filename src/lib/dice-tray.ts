import { PhysicsEngine, PhysicsUpdateData } from './physics-engine';
import { Die } from './dice';
import { DiceSettings } from './types';
import { GEOMETRIES } from './geometries';

export interface TrayEntry {
    id: string;
    die: Die;
    onShelf: boolean;
}

export class DiceTray {
    private engine: PhysicsEngine;
    private shelfElement: HTMLElement;
    private rollingElement: HTMLElement;
    private debugCanvas: HTMLCanvasElement | null = null;
    private debugCtx: CanvasRenderingContext2D | null = null;
    private entries: Map<string, TrayEntry> = new Map();
    private traces: Map<string, {x: number, y: number}[]> = new Map();
    private settings: DiceSettings;
    private idCounter = 0;
    private resizeObserver: ResizeObserver | null = null;
    private onStateChangeCallback: ((active: number, total: number) => void) | null = null;

    constructor(container: HTMLElement, settings: DiceSettings) {
        this.settings = settings;

        container.classList.add('dice-tray-container');

        this.shelfElement = document.createElement('div');
        this.shelfElement.className = 'dice-tray-shelf';

        this.rollingElement = document.createElement('div');
        this.rollingElement.className = 'dice-tray-rolling-area';
        this.rollingElement.style.touchAction = 'none';

        container.appendChild(this.shelfElement);
        container.appendChild(this.rollingElement);

        this.setupDebugCanvas();

        this.engine = new PhysicsEngine(this.rollingElement);
        this.engine.onUpdates(this.handlePhysicsUpdates.bind(this));

        this.setupResizeObserver();
        this.setupClickHandlers();
        this.engine.start();
    }

    private setupClickHandlers() {
        this.shelfElement.addEventListener('pointerdown', (e) => {
            const dieEl = (e.target as HTMLElement).closest('.dice-wrapper');
            if (!dieEl) return;

            // Find which entry this belongs to
            for (const [id, entry] of this.entries.entries()) {
                if (entry.die.domElement === dieEl && entry.onShelf) {
                    this.moveToRollingArea(id);
                    break;
                }
            }
        });
    }

    public onStateChange(callback: (active: number, total: number) => void) {
        this.onStateChangeCallback = callback;
    }

    private setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            const rect = this.rollingElement.getBoundingClientRect();
            this.engine.setWalls(rect.width, rect.height);
            this.syncDebugCanvasSize();
        });
        this.resizeObserver.observe(this.rollingElement);

        // Initial wall set
        const rect = this.rollingElement.getBoundingClientRect();
        this.engine.setWalls(rect.width || 800, rect.height || 600);
        this.syncDebugCanvasSize();
    }

    private setupDebugCanvas() {
        this.debugCanvas = document.createElement('canvas');
        this.debugCanvas.className = 'dice-tray-debug-canvas';
        this.debugCanvas.style.position = 'absolute';
        this.debugCanvas.style.top = '0';
        this.debugCanvas.style.left = '0';
        this.debugCanvas.style.width = '100%';
        this.debugCanvas.style.height = '100%';
        this.debugCanvas.style.pointerEvents = 'none';
        this.debugCanvas.style.zIndex = '100';
        this.rollingElement.appendChild(this.debugCanvas);
        this.debugCtx = this.debugCanvas.getContext('2d');
    }

    private syncDebugCanvasSize() {
        if (!this.debugCanvas) return;
        const rect = this.rollingElement.getBoundingClientRect();
        this.debugCanvas.width = rect.width;
        this.debugCanvas.height = rect.height;
    }

    private handlePhysicsUpdates(updates: PhysicsUpdateData[]) {
        updates.forEach(data => {
            const entry = this.entries.get(data.id);
            if (entry && !entry.onShelf) {
                entry.die.applyPhysicsUpdate(
                    data.position,
                    data.angle,
                    data.velocity,
                    data.angularVelocity,
                    data.isSleeping
                );

                // Update traces
                if (this.settings.debugOptions?.showTraces) {
                    let trace = this.traces.get(data.id);
                    if (!trace) {
                        trace = [];
                        this.traces.set(data.id, trace);
                    }
                    trace.push({ x: data.position.x, y: data.position.y });
                    if (trace.length > 50) trace.shift();
                }
            }
        });

        this.renderDebug(updates);
    }

    private renderDebug(updates: PhysicsUpdateData[]) {
        if (!this.debugCtx || !this.debugCanvas) return;
        const ctx = this.debugCtx;
        const opts = this.settings.debugOptions;

        ctx.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);

        if (!opts) return;

        // 1. Boundaries
        if (opts.showBoundaries) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            this.engine.getWalls().forEach(wall => {
                ctx.beginPath();
                wall.vertices.forEach((v, i) => {
                    if (i === 0) ctx.moveTo(v.x, v.y);
                    else ctx.lineTo(v.x, v.y);
                });
                ctx.closePath();
                ctx.stroke();
            });
        }

        // 2. Traces
        if (opts.showTraces) {
            ctx.lineWidth = 2;
            this.traces.forEach((points) => {
                if (points.length < 2) return;
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                points.forEach((p, i) => {
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                });
                ctx.stroke();
            });
        }

        // 3. Hitboxes and Vectors
        updates.forEach(data => {
            const entry = this.entries.get(data.id);
            if (!entry || entry.onShelf) return;

            if (opts.showHitboxes) {
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                data.vertices.forEach((v, i) => {
                    if (i === 0) ctx.moveTo(v.x, v.y);
                    else ctx.lineTo(v.x, v.y);
                });
                ctx.closePath();
                ctx.stroke();
                
                // Center point
                ctx.fillStyle = '#10b981';
                ctx.beginPath();
                ctx.arc(data.position.x, data.position.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            if (opts.showVectors) {
                const vel = data.velocity;
                const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
                if (speed > 0.1) {
                    ctx.strokeStyle = '#3b82f6';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(data.position.x, data.position.y);
                    // Scale vector for visibility
                    const scale = 20;
                    ctx.lineTo(
                        data.position.x + vel.x * scale,
                        data.position.y + vel.y * scale
                    );
                    ctx.stroke();
                    
                    // Arrow head
                    const angle = Math.atan2(vel.y, vel.x);
                    ctx.beginPath();
                    ctx.moveTo(
                        data.position.x + vel.x * scale,
                        data.position.y + vel.y * scale
                    );
                    ctx.lineTo(
                        data.position.x + vel.x * scale - 8 * Math.cos(angle - Math.PI / 6),
                        data.position.y + vel.y * scale - 8 * Math.sin(angle - Math.PI / 6)
                    );
                    ctx.moveTo(
                        data.position.x + vel.x * scale,
                        data.position.y + vel.y * scale
                    );
                    ctx.lineTo(
                        data.position.x + vel.x * scale - 8 * Math.cos(angle + Math.PI / 6),
                        data.position.y + vel.y * scale - 8 * Math.sin(angle + Math.PI / 6)
                    );
                    ctx.stroke();
                }
            }
        });
    }

    public addDie(die: Die) {
        const id = `die-${this.idCounter++}`;
        const entry: TrayEntry = { id, die, onShelf: true };
        this.entries.set(id, entry);

        // Initial placement on shelf
        this.moveToShelf(id);
        this.notifyStateChange();
        return id;
    }

    private moveToShelf(id: string) {
        const entry = this.entries.get(id);
        if (!entry) return;

        entry.onShelf = true;
        this.engine.removeBody(id);
        this.traces.delete(id);

        // DOM move
        this.shelfElement.appendChild(entry.die.domElement);
        entry.die.resetPosition();
    }

    private moveToRollingArea(id: string) {
        const entry = this.entries.get(id);
        if (!entry) return;

        // 1. Capture current precise position on shelf
        const dieRect = entry.die.domElement.getBoundingClientRect();
        const pitRect = this.rollingElement.getBoundingClientRect();

        // 2. Setup initial relative coordinates (starting from shelf position)
        const x = (dieRect.left - pitRect.left) + (dieRect.width / 2);
        const y = (dieRect.top - pitRect.top) + (dieRect.height / 2);

        // 3. Perform DOM move and 'Atomic Style' handoff
        entry.onShelf = false;

        const el = entry.die.domElement;

        // --- BULLETPROOF VISIBILITY GUARD START ---
        // 1. Hide the die and aggressively suppress transitions 
        el.style.visibility = 'hidden';
        el.style.setProperty('transition', 'none', 'important');

        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.margin = '0';

        this.rollingElement.appendChild(el);

        // 2. Set visual position immediately (synchronous)
        entry.die.applyPhysicsUpdate({ x, y }, 0, { x: 0, y: 0 }, 0, false);

        // 3. Register with Physics Engine and add initial downward force
        const geometry = GEOMETRIES[entry.die.typeName];
        const calibrationFactor = 1.68; // Recalibrated for Circumradius
        const physicsSize = (geometry.effectiveRadius * calibrationFactor) * (this.settings.scale / 200);

        this.engine.addBox(id, x, y, physicsSize);
        this.engine.launch(id, { x: 0, y: 0.02 }, 0); // Decisive starting fall force

        // 4. Double-Buffered Reveal
        // We wait TWO frames to guarantee the browser has processed the layout change
        // AND the physics engine has processed the first tick of the fall.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.visibility = 'visible';
                // Note: rolling area children still have CSS transition:none !important
            });
        });
        // --- BULLETPROOF VISIBILITY GUARD END ---

        this.notifyStateChange();
    }

    private notifyStateChange() {
        if (this.onStateChangeCallback) {
            const activeCount = Array.from(this.entries.values()).filter(e => !e.onShelf).length;
            const totalCount = this.entries.size;
            this.onStateChangeCallback(activeCount, totalCount);
        }
    }

    public async rollAll(): Promise<number[]> {
        const promises: Promise<number>[] = [];

        this.entries.forEach((entry, id) => {
            if (entry.onShelf) return; // Only roll active dice

            // Promise for the roll result
            promises.push(entry.die.rollPhysics());

            // Physics launch
            const force = {
                x: (Math.random() - 0.5) * 0.05,
                y: (Math.random() - 0.5) * 0.05
            };
            const torque = (Math.random() - 0.5) * 0.1;

            this.engine.launch(id, force, torque);
        });

        return Promise.all(promises);
    }

    public clear() {
        this.entries.forEach(entry => {
            entry.die.remove();
            this.engine.removeBody(entry.id);
        });
        this.entries.clear();
        this.traces.clear();
        this.shelfElement.innerHTML = '';
        this.notifyStateChange();
    }

    public updateSettings(settings: Partial<DiceSettings>) {
        this.settings = { ...this.settings, ...settings };
        this.entries.forEach(entry => entry.die.updateSettings(settings));
    }

    public destroy() {
        this.engine.stop();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}
