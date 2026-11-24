export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'acadflow.theme';

const listeners = new Set<() => void>();

export const themeStore = {
  get: (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'),
  set: (theme: Theme): void => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    listeners.forEach((listener) => listener());
  },
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
