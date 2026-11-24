import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import i18n from '@/i18n';
import { LANGUAGE_STORAGE_KEY } from '@/i18n/languages';
import { renderApp } from '@/test/render-app';

describe('LanguageSelector', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  afterEach(() => localStorage.clear());

  it('switches the page language without reloading and stores the choice', async () => {
    renderApp('/login');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'en');
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveValue('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });
});
