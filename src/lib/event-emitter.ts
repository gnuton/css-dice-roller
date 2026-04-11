export type EventCallback = (...args: any[]) => void;

export class EventEmitter<T extends Record<string, any>> {
    private events: Map<keyof T, Set<EventCallback>> = new Map();

    public on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event)!.add(callback);
    }

    public off<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.events.delete(event);
            }
        }
    }

    public emit<K extends keyof T>(event: K, data: T[K]): void {
        const callbacks = this.events.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    public clear(): void {
        this.events.clear();
    }
}
