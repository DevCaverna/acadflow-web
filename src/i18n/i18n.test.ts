import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LANGUAGE_STORAGE_KEY } from '@/i18n/languages';
import { resources } from '@/i18n/resources';

function keys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, item]: [string, unknown]) =>
    typeof item === 'object' && item !== null
      ? keys(item, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

async function loadI18n() {
  vi.resetModules();
  return (await import('@/i18n')).default;
}

describe('i18n', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('has the same keys in both languages', () => {
    expect(keys(resources.en).sort()).toEqual(keys(resources['pt-BR']).sort());
  });

  it('keeps the chosen language after a reload', async () => {
    const i18n = await loadI18n();
    await i18n.changeLanguage('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    const reloaded = await loadI18n();
    expect(reloaded.resolvedLanguage).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it.each([
    ['en-US', 'en'],
    ['pt-PT', 'pt-BR'],
    ['es', 'pt-BR'],
  ])('resolves browser language %s to %s', async (browser, expected) => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([browser]);
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(browser);
    expect((await loadI18n()).resolvedLanguage).toBe(expected);
  });

  it('falls back to pt-BR when a text is missing', async () => {
    const i18n = await loadI18n();
    await i18n.changeLanguage('en');
    i18n.addResource('pt-BR', 'common', 'onlyPortuguese', 'Somente português');
    expect(i18n.t('onlyPortuguese' as never)).toBe('Somente português');
  });
});
