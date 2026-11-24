const STORAGE_KEY = 'acadflow.accessToken';

const listeners = new Set<() => void>();
let expired = false;

function update(token: string | null, isExpired: boolean): void {
  if (token === null) sessionStorage.removeItem(STORAGE_KEY);
  else sessionStorage.setItem(STORAGE_KEY, token);
  expired = isExpired;
  listeners.forEach((listener) => listener());
}

export const accessToken = {
  get: (): string | null => sessionStorage.getItem(STORAGE_KEY),
  isExpired: (): boolean => expired,
  set: (token: string): void => update(token, false),
  clear: (): void => update(null, false),
  expire: (): void => update(null, true),
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
