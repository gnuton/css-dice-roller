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
    private onStateChangeCallback: ((active: number, total: number, isResultsView: boolean) => void) | null = null;
    private isBulkGrabbing = false;
    private isTopViewActive = false;
    private isPendingSummary = false;
    private summarySafetyTimeout: number | null = null;
    private longPressTimeout: number | null = null;
    private onRollCompleteCallback: ((results: number[]) => void) | null = null;
    private onInteractionStartCallback: (() => void) | null = null;
    private onShakeCallback: (() => void) | null = null;

    private lastMousePose = { x: 0, y: 0, time: 0 };
    private shakeThreshold = 2500; // Total distance over time
    private mouseShakeAccumulator = 0;

    constructor(container: HTMLElement, settings: DiceSettings) {
        this.settings = settings;

        container.classList.add('dice-tray-container');

        this.shelfElement = document.createElement('div');
        this.shelfElement.className = 'dice-tray-shelf';

        this.rollingElement = document.createElement('div');
        this.rollingElement.className = 'dice-tray-rolling-area';
        this.rollingElement.style.touchAction = 'none';

        container.appendChild(this.rollingElement);
        container.appendChild(this.shelfElement);

        this.setupDebugCanvas();

        this.engine = new PhysicsEngine(this.rollingElement);
        this.engine.onUpdates(this.handlePhysicsUpdates.bind(this));

        this.setupResizeObserver();
        this.setupShakeDetection();
        
        this.engine.onSettled(() => {
            if (this.isTopViewActive || !this.isPendingSummary) return;

            // Wait for visual soft-landing (600ms in Die class)
            setTimeout(() => {
                // Re-verify that no new action started during the timeout
                if (this.isTopViewActive || !this.isPendingSummary) return;

                const activeEntries = Array.from(this.entries.values()).filter(e => !e.onShelf);
                const results = activeEntries.map(entry => entry.die.result);
                
                if (results.length > 0) {
                    this.showTopViewSummary(results);
                    this.isPendingSummary = false;
                    
                    if (this.onRollCompleteCallback) {
                        this.onRollCompleteCallback(results);
                    }
                }

                // Restore inactive shelf if there are dice left on it
                const inactiveCount = Array.from(this.entries.values()).filter(e => e.onShelf).length;
                if (inactiveCount > 0) {
                    this.shelfElement.classList.remove('is-hidden');
                }
            }, 700); // 600ms transition + 100ms buffer
        });


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

        this.rollingElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const dieEl = (e.target as HTMLElement).closest('.dice-wrapper');
            const id = dieEl?.getAttribute('data-id');
            if (id) {
                this.moveToShelf(id);
            }
        });

        this.rollingElement.addEventListener('click', (e) => {
            if (this.isTopViewActive) {
                this.returnAllToShelf();
                e.preventDefault();
                e.stopPropagation();
            }
        });

        this.rollingElement.addEventListener('pointerdown', (e) => {
            const dieEl = (e.target as HTMLElement).closest('.dice-wrapper');
            const id = dieEl?.getAttribute('data-id');
            
            // 0. RESET PRIORITY
            // If the sum is visible, the very FIRST click/touch should reset the tray 
            // and ignore any grab or scoop logic.
            if (this.isTopViewActive) {
                this.returnAllToShelf();
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            // 1. Right Click (button 2) is handled by contextmenu for return
            // But we cancel any potential long-press here
            if (e.button === 2 && id) {
                this.cancelLongPress();
                return;
            }

            // 2. Long Press Detection for Mobile (return to shelf)
            if (id) {
                this.longPressTimeout = window.setTimeout(() => {
                    this.moveToShelf(id);
                    this.cancelLongPress();
                    this.isBulkGrabbing = false; // Prevent bulk grab from continuing
                    this.engine.bulkGrabEnd();
                }, 500);
            }

            // 3. Start bulk grab (Scoop)
            // Works ONLY for LMB (0)
            if (e.button !== 0) return;
            if (id) return; // Ensure grabbing works only if first click was outside dice

            const hasActiveDice = Array.from(this.entries.values()).some(entry => !entry.onShelf);
            if (!hasActiveDice) {
                this.cancelLongPress();
                return;
            }

            this.isBulkGrabbing = true;
            this.engine.bulkGrabStart();
            this.hideSummary();
            this.isPendingSummary = false;
            
            // Hide inactive shelf during action
            this.shelfElement.classList.add('is-hidden');

            if (this.onInteractionStartCallback) {
                this.onInteractionStartCallback();
            }
            
            // Add visual cue
            this.entries.forEach(entry => {
                if (!entry.onShelf) entry.die.domElement.classList.add('is-scooped');
            });
            
            window.addEventListener('pointermove', this.handleBulkMove);
            window.addEventListener('pointerup', this.handleBulkUp);
            
            e.stopPropagation();
        });
    }

    private cancelLongPress() {
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
            this.longPressTimeout = null;
        }
    }



    private handleBulkMove = (e: PointerEvent) => {
        if (this.isBulkGrabbing) {
            // Cancel long press if user moves significantly
            this.cancelLongPress();

            // Detect Mouse Shake
            const now = Date.now();
            const dt = now - this.lastMousePose.time;
            if (dt > 0) {
                const dx = e.clientX - this.lastMousePose.x;
                const dy = e.clientY - this.lastMousePose.y;
                const speed = Math.sqrt(dx*dx + dy*dy) / dt;
                
                if (speed > 1.5) { // Threshold for "fast" movement
                    this.mouseShakeAccumulator += speed * dt;
                    if (this.mouseShakeAccumulator > this.shakeThreshold) {
                        this.triggerShake();
                    }
                } else {
                    this.mouseShakeAccumulator *= 0.9; // Decay
                }
            }
            this.lastMousePose = { x: e.clientX, y: e.clientY, time: now };

            // Auto-release if mouse leaves the rolling area
            const rect = this.rollingElement.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || 
                e.clientY < rect.top || e.clientY > rect.bottom) {
                this.handleBulkUp();
                return;
            }

            this.engine.bulkGrabMove();
        }
    };

    private handleBulkUp = () => {
        this.cancelLongPress();
        if (this.isBulkGrabbing) {
            this.isBulkGrabbing = false;
            this.engine.bulkGrabEnd();
            
            this.isPendingSummary = true;
            this.startSummarySafetyTimer();
            // When throwing (scooping), we must randomize the active dice 
            // so they have a fresh result when they land.
            this.entries.forEach(entry => {
                if (!entry.onShelf) {
                    entry.die.rollPhysics(); // Prepare the result
                    
                    // Add a randomized impulse for a better "roll" feel
                    const impulse = {
                        x: (Math.random() - 0.5) * 0.02,
                        y: (Math.random() - 0.5) * 0.02
                    };
                    const torque = (Math.random() - 0.5) * 0.05;
                    this.engine.launch(entry.id, impulse, torque);
                }
            });
            
            // Remove visual cue
            this.entries.forEach(entry => {
                entry.die.domElement.classList.remove('is-scooped');
            });

            window.removeEventListener('pointermove', this.handleBulkMove);
            window.removeEventListener('pointerup', this.handleBulkUp);
        }
    };

    public onStateChange(callback: (active: number, total: number, isResultsView: boolean) => void) {
        this.onStateChangeCallback = callback;
    }

    public onRollComplete(callback: (results: number[]) => void) {
        this.onRollCompleteCallback = callback;
    }

    public onInteractionStart(callback: () => void) {
        this.onInteractionStartCallback = callback;
    }

    public onShake(callback: () => void) {
        this.onShakeCallback = callback;
    }

    private setupShakeDetection() {
        if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
            // iOS 13+ requires explicit permission
            const DeviceMotion = window.DeviceMotionEvent as any;
            if (typeof DeviceMotion.requestPermission === 'function') {
                // We'll wait for user gesture to call requestPermission
                return;
            }

            this.startShakeDetection();
        }
    }

    private startShakeDetection() {
        let lastX: number | null = null, lastY: number | null = null, lastZ: number | null = null;
        let threshold = 15;

        window.addEventListener('devicemotion', (e) => {
            if (!e.accelerationIncludingGravity) return;
            const { x, y, z } = e.accelerationIncludingGravity;
            
            if (lastX !== null && x !== null && y !== null && z !== null) {
                const delta = Math.abs(x - lastX!) + Math.abs(y! - lastY!) + Math.abs(z! - lastZ!);
                if (delta > threshold) {
                    this.triggerShake();
                }
            }
            lastX = x; lastY = y; lastZ = z;
        });
    }

    public async requestSensorPermission(): Promise<boolean> {
        const DeviceMotion = (window as any).DeviceMotionEvent;
        if (DeviceMotion && typeof DeviceMotion.requestPermission === 'function') {
            try {
                const response = await DeviceMotion.requestPermission();
                if (response === 'granted') {
                    this.startShakeDetection();
                    return true;
                }
                return false;
            } catch (e) {
                console.error('Sensor permission error:', e);
                return false;
            }
        }
        return true; // Already granted or not needed
    }

    private triggerShake() {
        const now = Date.now();
        if (now - this.lastMousePose.time < 1000) { // Limit frequency (re-using pose time as last shake time)
             // already triggered recently
        }
        
        if (this.onShakeCallback) {
            this.onShakeCallback();
            this.mouseShakeAccumulator = 0;
        }
    }

    private setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            const pitRect = this.rollingElement.getBoundingClientRect();
            
            // Allow dice to roll under the shelf by setting the top wall at the very top (0)
            this.engine.setWalls(pitRect.width, pitRect.height, 0);
            this.syncDebugCanvasSize();
        });
        this.resizeObserver.observe(this.rollingElement);
        this.resizeObserver.observe(this.shelfElement);

        // Initial wall set
        const pitRect = this.rollingElement.getBoundingClientRect();
        this.engine.setWalls(pitRect.width || 800, pitRect.height || 600, 0);
        this.syncDebugCanvasSize();
    }


    private showTopViewSummary(_results: number[]) {
        this.isTopViewActive = true;
        this.notifyStateChange();
    }

    private hideSummary() {
        this.isTopViewActive = false;
        this.rollingElement.classList.remove('is-top-view');
    }

    public returnAllToShelf() {
        this.hideSummary();
        this.isPendingSummary = false;
        
        const activeIds = Array.from(this.entries.entries())
            .filter(([_, entry]) => !entry.onShelf)
            .map(([id]) => id);
        
        activeIds.forEach(id => this.moveToShelf(id));
        
        // Ensure shelf is visible
        this.shelfElement.classList.remove('is-hidden');
        this.notifyStateChange();
    }

    private startSummarySafetyTimer() {
        if (this.summarySafetyTimeout) clearTimeout(this.summarySafetyTimeout);
        this.summarySafetyTimeout = window.setTimeout(() => {
            if (this.isPendingSummary) {
                console.warn('Dice tray: Settlement safety timeout reached. Forcing summary.');
                const activeEntries = Array.from(this.entries.values()).filter(e => !e.onShelf);
                const results = activeEntries.map(entry => entry.die.result);
                if (results.length > 0) this.showTopViewSummary(results);
                this.isPendingSummary = false;
            }
        }, 8000); // 8 second safety net
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

        // --- ATOMIC STYLE HANDOFF START ---
        // 1. Configure the die element state BEFORE it hits the rolling area DOM
        // This prevents the "top-left" jump caused by default positioning resets.
        el.style.visibility = 'hidden';
        el.style.setProperty('transition', 'none', 'important');
        el.style.setProperty('animation', 'none', 'important'); // Kill "die-appear" animation conflict
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.margin = '0';

        // 2. Apply initial position synchronously while still outside the pit DOM
        entry.die.applyPhysicsUpdate({ x, y }, 0, { x: 0, y: 0 }, 0, false);

        // 3. Perform the move
        this.rollingElement.appendChild(el);

        // 4. Register with Physics Engine and add initial downward force
        const physicsSize = this.calculatePhysicsSize(entry.die);

        const body = this.engine.addBox(id, x, y, physicsSize);
        body.restitution = this.settings.bounciness; // Apply current bounciness
        this.engine.launch(id, { x: 0, y: 0.1 }, 0); // Increased force for better drop
        
        this.isPendingSummary = false; // Picking a die should not trigger summary

        // 5. Double-Buffered Reveal
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.visibility = 'visible';
            });
        });
        // --- ATOMIC STYLE HANDOFF END ---

        this.notifyStateChange();
    }

    private calculatePhysicsSize(die: Die): number {
        const geometry = GEOMETRIES[die.typeName];
        const scaleFactor = this.settings.scale / 200;
        
        // Base physics size on the distance between opposite faces (rollingRadius * 2)
        // We add a shape-specific multiplier to account for 2D square hitboxes 
        // covering 3D complex shapes.
        let multiplier = 1.45; // Default for most polyhedra
        
        if (die.typeName === 'd6') multiplier = 1.6; // Cubes need more space in 2D to roll
        if (die.typeName === 'd4') multiplier = 1.35; // Tetrahedrons are pointy
        
        return (geometry.rollingRadius * 2) * scaleFactor * multiplier;
    }

    public getActiveCount(): number {
        return Array.from(this.entries.values()).filter(e => !e.onShelf).length;
    }

    private notifyStateChange() {
        const activeCount = this.getActiveCount();
        const totalCount = this.entries.size;

        if (this.onStateChangeCallback) {
            this.onStateChangeCallback(activeCount, totalCount, this.isTopViewActive);
        }
    }

    public async rollAll(): Promise<number[]> {
        const promises: Promise<number>[] = [];

        this.entries.forEach((entry, id) => {
            if (entry.onShelf) return; // Only roll active dice

            this.isPendingSummary = true;
            this.startSummarySafetyTimer();

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
        this.hideSummary();
        this.isPendingSummary = false;
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
        const oldScale = this.settings.scale;
        this.settings = { ...this.settings, ...settings };
        this.entries.forEach(entry => entry.die.updateSettings(settings));

        // Propagate scale changes to physics hitboxes immediately
        if (settings.scale !== undefined && settings.scale !== oldScale) {
            const calibrationFactor = 1.68;
            this.entries.forEach((entry, id) => {
                if (!entry.onShelf) {
                    const geometry = GEOMETRIES[entry.die.typeName];
                    const physicsSize = (geometry.effectiveRadius * calibrationFactor) * (this.settings.scale / 200);
                    this.engine.updateBodyScale(id, physicsSize);
                }
            });
        }

        if (settings.bounciness !== undefined || settings.gravity !== undefined) {
            this.engine.updatePhysicsParams({
                bounciness: settings.bounciness,
                gravity: settings.gravity
            });
        }
    }

    public destroy() {
        this.engine.stop();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        window.removeEventListener('pointermove', this.handleBulkMove);
        window.removeEventListener('pointerup', this.handleBulkUp);
    }
}
