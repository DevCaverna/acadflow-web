import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { HomePage } from '@/app/router/HomePage';
import i18n from '@/i18n';
import { LANGUAGE_STORAGE_KEY } from '@/i18n/languages';

describe('LanguageSelector', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  afterEach(() => localStorage.clear());

  it('switches the page language without reloading and stores the choice', async () => {
    render(
      <AppProviders>
        <HomePage />
      </AppProviders>,
    );
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'en');
    expect(await screen.findByText('Organize courses, activities and grades.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveValue('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });
});
