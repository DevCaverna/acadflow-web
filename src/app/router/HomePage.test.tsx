import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { HomePage } from '@/app/router/HomePage';
import i18n from '@/i18n';

describe('HomePage', () => {
  afterEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it.each([
    ['pt-BR', 'Organize disciplinas, atividades e notas.'],
    ['en', 'Organize courses, activities and grades.'],
  ])('renders the tagline in %s', async (language, tagline) => {
    await i18n.changeLanguage(language);
    render(
      <AppProviders>
        <HomePage />
      </AppProviders>,
    );
    expect(screen.getByRole('heading', { name: 'AcadFlow' })).toBeInTheDocument();
    expect(screen.getByText(tagline)).toBeInTheDocument();
  });
});
