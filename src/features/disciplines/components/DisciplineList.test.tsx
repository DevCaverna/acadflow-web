import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { DisciplineList } from '@/features/disciplines/components/DisciplineList';
import i18n from '@/i18n';
import { mockApi } from '@/test/mock-api';
import { createQueryWrapper } from '@/test/query-wrapper';

const discipline = {
  id: '019ac3a0-0000-7000-8000-000000000001',
  code: 'ES101',
  name: 'Engenharia de Software',
  description: null,
  semester: '2026/2',
  professor: { id: '019ac3a0-0000-7000-8000-000000000002', name: 'Ana' },
};

function listing(data: unknown[], page = 1, total = data.length) {
  return { page, perPage: 20, total, data };
}

describe('DisciplineList', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
  });

  it('shows loading and then the disciplines', async () => {
    mockApi(() => ({ data: listing([discipline]) }));
    render(<DisciplineList />, { wrapper: createQueryWrapper().wrapper });
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(
      await screen.findByRole('heading', { name: 'Engenharia de Software' }),
    ).toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    mockApi(() => ({ data: listing([]) }));
    render(<DisciplineList />, { wrapper: createQueryWrapper().wrapper });
    expect(await screen.findByText('Nenhuma disciplina encontrada.')).toBeInTheDocument();
  });

  it('shows the API error and retries', async () => {
    let failed = false;
    mockApi(() => {
      if (failed) return { data: listing([discipline]) };
      failed = true;
      return {
        status: 403,
        data: { statusCode: 403, code: 'FORBIDDEN', message: 'Acesso negado' },
      };
    });
    render(<DisciplineList />, { wrapper: createQueryWrapper().wrapper });
    expect(await screen.findByRole('alert')).toHaveTextContent('Acesso negado');
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('list', { name: 'Disciplinas' })).toBeInTheDocument();
  });

  it('moves to the next page', async () => {
    const requests = mockApi(({ params }) => {
      const { page } = params as { page: number };
      return { data: listing([{ ...discipline, name: `Disciplina ${page}` }], page, 21) };
    });
    render(<DisciplineList />, { wrapper: createQueryWrapper().wrapper });
    await userEvent.click(await screen.findByRole('button', { name: 'Próxima' }));
    expect(await screen.findByRole('heading', { name: 'Disciplina 2' })).toBeInTheDocument();
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeDisabled();
    expect(requests).toHaveLength(2);
  });

  it('rejects responses that break the contract', async () => {
    mockApi(() => ({ data: listing([{ ...discipline, professor: null }]) }));
    render(<DisciplineList />, { wrapper: createQueryWrapper().wrapper });
    expect(await screen.findByRole('alert')).toHaveTextContent('Ocorreu um erro inesperado.');
  });
});
