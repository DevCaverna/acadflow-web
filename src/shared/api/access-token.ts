const STORAGE_KEY = 'acadflow.accessToken';

export const accessToken = {
  get: (): string | null => sessionStorage.getItem(STORAGE_KEY),
  set: (token: string): void => sessionStorage.setItem(STORAGE_KEY, token),
  clear: (): void => sessionStorage.removeItem(STORAGE_KEY),
};
