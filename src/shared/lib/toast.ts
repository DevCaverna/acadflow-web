import { TIME } from '@/shared/config/time.constants';

export type Toast = { id: number; title: string; text?: string };

const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();
let toasts: readonly Toast[] = [];
let nextId = 1;

function update(next: readonly Toast[]): void {
  toasts = next;
  listeners.forEach((listener) => listener());
}

export const toastStore = {
  get: (): readonly Toast[] => toasts,
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  dismiss: (id: number): void => {
    const timer = timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.delete(id);
    }
    update(toasts.filter((toast) => toast.id !== id));
  },
  clear: (): void => {
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    if (toasts.length > 0) update([]);
  },
  show: (title: string, text?: string): void => {
    const id = nextId++;
    update([...toasts, { id, title, text }]);
    timers.set(
      id,
      setTimeout(() => toastStore.dismiss(id), TIME.DEFAULT_TOAST_MS),
    );
  },
};
