import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import i18n from '@/i18n';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('switches the theme and stores the choice', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: 'Usar tema escuro' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('acadflow.theme')).toBe('dark');
    await userEvent.click(screen.getByRole('button', { name: 'Usar tema claro' }));
    expect(localStorage.getItem('acadflow.theme')).toBe('light');
  });
});
