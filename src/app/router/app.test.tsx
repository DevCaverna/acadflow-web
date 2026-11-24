import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { InternalAxiosRequestConfig } from 'axios';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteErrorBoundary } from '@/app/router/RouteErrorBoundary';
import i18n from '@/i18n';
import { accessToken } from '@/shared/api/access-token';
import { toastStore } from '@/shared/lib/toast';
import { mockApi } from '@/test/mock-api';
import { renderApp } from '@/test/render-app';

const id = (n: number) => `019ac3a0-0000-7000-8000-00000000000${n}`;
const professor = {
  id: id(1),
  name: 'Marina',
  email: 'm@example.com',
  role: 'PROFESSOR',
  avatarUrl: null,
};
const student = { id: id(2), name: 'Ana', email: 'a@example.com', role: 'ALUNO', avatarUrl: null };
const discipline = {
  id: id(3),
  code: 'BD-204',
  name: 'Banco de Dados',
  description: null,
  semester: '2026.2',
  professor: { id: id(1), name: 'Marina' },
};
const activities = [
  { id: id(4), disciplineId: id(3), title: 'Lista 1', description: 'Ler', dueAt: null },
  { id: id(5), disciplineId: id(3), title: 'Lista 2', description: null, dueAt: null },
];

type Reply = { status?: number; data: unknown };
type Handlers = Record<string, unknown>;

function error(status: number, code: string, message: string): Reply {
  return { status, data: { statusCode: status, code, message } };
}

function setup(user: object, overrides: Handlers = {}) {
  const handlers: Handlers = {
    'get /auth/me': { data: user },
    'get /disciplines': { data: { page: 1, perPage: 20, total: 1, data: [discipline] } },
    [`get /disciplines/${id(3)}`]: { data: discipline },
    [`get /disciplines/${id(3)}/activities`]: { data: activities },
    [`get /disciplines/${id(3)}/grades`]: {
      data: [
        {
          student: { id: id(2), name: 'Ana', email: 'a@example.com' },
          grades: [],
          average: null,
          status: 'NO_GRADES',
        },
      ],
    },
    ...overrides,
  };
  return mockApi((config: InternalAxiosRequestConfig) => {
    const handler = handlers[`${config.method} ${config.url}`];
    if (typeof handler === 'function') {
      return (handler as (c: InternalAxiosRequestConfig) => Reply)(config);
    }
    return (handler as Reply | undefined) ?? error(404, 'NOT_FOUND', 'Não encontrado');
  });
}

describe('app', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    accessToken.clear();
  });

  afterEach(() => {
    cleanup();
    accessToken.clear();
    toastStore.clear();
  });

  describe('session', () => {
    it('redirects to login without a token', async () => {
      setup(professor);
      const router = renderApp('/disciplines');
      expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/login');
    });

    it('validates the form before calling the API', async () => {
      const requests = setup(professor);
      renderApp('/login');
      await userEvent.type(screen.getByLabelText('E-mail'), 'invalid');
      await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
      expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument();
      expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
      expect(requests).toHaveLength(0);
    });

    it('shows invalid credentials without breaking the page', async () => {
      setup(professor, {
        'post /auth/login': error(401, 'INVALID_CREDENTIALS', 'Credenciais inválidas'),
      });
      renderApp('/login');
      await userEvent.type(screen.getByLabelText('E-mail'), 'm@example.com');
      await userEvent.type(screen.getByLabelText('Senha'), 'wrong');
      await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
      expect(await screen.findByText('Credenciais inválidas')).toBeInTheDocument();
      expect(screen.queryByText(/sessão expirou/)).not.toBeInTheDocument();
    });

    it.each([
      [professor, 'Lançar notas'],
      [student, 'Notas e média'],
    ])('signs in, shows the menu of the role and signs out', async (user, menu) => {
      setup(user, { 'post /auth/login': { data: { accessToken: 'token', user } } });
      renderApp('/login');
      await userEvent.type(screen.getByLabelText('E-mail'), user.email);
      await userEvent.type(screen.getByLabelText('Senha'), 'secret');
      await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
      const nav = await screen.findByRole('navigation', { name: 'Menu principal' });
      expect(within(nav).getByRole('link', { name: menu })).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Sair' }));
      expect(await screen.findByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
      expect(accessToken.get()).toBeNull();
    });

    it('returns to login when the session expires', async () => {
      accessToken.set('token');
      setup(professor, { 'get /disciplines': error(401, 'UNAUTHORIZED', 'Não autorizado') });
      renderApp('/disciplines');
      const dialog = await screen.findByRole('alertdialog', { name: 'Sua sessão expirou' });
      await userEvent.click(within(dialog).getByRole('button', { name: 'Entrar novamente' }));
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('shows a page for unknown addresses', () => {
      renderApp('/unknown');
      expect(screen.getByText('Página não encontrada')).toBeInTheDocument();
    });

    it('renders the route error boundary when a route crashes', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      try {
        function Crash(): never {
          throw new Error('Falha simulada de renderização');
        }
        const router = createMemoryRouter(
          [{ path: '/boom', element: <Crash />, errorElement: <RouteErrorBoundary /> }],
          { initialEntries: ['/boom'] },
        );
        render(<RouterProvider router={router} />);
        expect(
          screen.getByRole('heading', { name: 'Algo deu errado nesta página' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Falha simulada de renderização')).toBeInTheDocument();
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe('disciplines', () => {
    beforeEach(() => accessToken.set('token'));

    it('shows loading, empty and error with retry', async () => {
      let replies = [
        error(500, 'INTERNAL_ERROR', 'Ocorreu um erro'),
        { data: { page: 1, perPage: 20, total: 0, data: [] } },
      ];
      setup(professor, {
        'get /disciplines': () => {
          const [reply, ...rest] = replies;
          replies = rest;
          return reply;
        },
      });
      renderApp('/disciplines');
      expect(await screen.findByText('Ocorreu um erro')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
      expect(await screen.findByText('Nenhuma disciplina ainda')).toBeInTheDocument();
    });

    it('searches and moves between pages', async () => {
      const requests = setup(professor, {
        'get /disciplines': ({ params }: InternalAxiosRequestConfig) => ({
          data: {
            page: (params as { page: number }).page,
            perPage: 20,
            total: 21,
            data: [discipline],
          },
        }),
      });
      renderApp('/disciplines');
      await userEvent.click(await screen.findByRole('button', { name: 'Próxima' }));
      expect(await screen.findByText('Página 2 de 2')).toBeInTheDocument();
      await userEvent.type(screen.getByRole('searchbox'), 'b');
      await waitFor(() =>
        expect(requests.at(-1)?.params).toMatchObject({ page: 1, filter: '{"search":"b"}' }),
      );
    });

    it('creates a discipline and shows it without reloading', async () => {
      const list = [discipline];
      setup(professor, {
        'get /disciplines': () => ({
          data: { page: 1, perPage: 20, total: list.length, data: [...list] },
        }),
        'post /disciplines': ({ data }: InternalAxiosRequestConfig) => {
          const input = JSON.parse(data as string) as { code: string; name: string };
          const created = { ...discipline, ...input, id: id(9) };
          list.push(created);
          return { status: 201, data: created };
        },
      });
      renderApp('/disciplines');
      await userEvent.click(await screen.findByRole('button', { name: 'Nova disciplina' }));
      await userEvent.type(screen.getByLabelText('Código'), 'ES-1');
      await userEvent.type(screen.getByLabelText('Semestre'), '2026/2');
      await userEvent.type(screen.getByLabelText('Nome da disciplina'), 'Engenharia');
      await userEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Nova disciplina' }),
      );
      expect(await screen.findByText('Use o formato 2026.1 ou 2026.2')).toBeInTheDocument();
      await userEvent.clear(screen.getByLabelText('Semestre'));
      await userEvent.type(screen.getByLabelText('Semestre'), '2026.2');
      await userEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Nova disciplina' }),
      );
      expect(await screen.findByRole('heading', { name: 'Engenharia' })).toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('keeps the form open with the API error', async () => {
      setup(professor, { 'post /disciplines': error(409, 'CONFLICT', 'Já existe') });
      renderApp('/disciplines');
      await userEvent.click(await screen.findByRole('button', { name: 'Nova disciplina' }));
      await userEvent.type(screen.getByLabelText('Código'), 'ES-1');
      await userEvent.type(screen.getByLabelText('Semestre'), '2026.2');
      await userEvent.type(screen.getByLabelText('Nome da disciplina'), 'Engenharia');
      await userEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Nova disciplina' }),
      );
      expect(await screen.findByText('Já existe')).toBeInTheDocument();
      expect(screen.getByLabelText('Código')).toHaveValue('ES-1');
    });

    it('asks for confirmation and explains a blocked removal', async () => {
      setup(professor, {
        [`delete /disciplines/${id(3)}`]: error(409, 'CONFLICT', 'Há dependências'),
      });
      renderApp(`/disciplines/${id(3)}`);
      await userEvent.click(await screen.findByRole('button', { name: 'Excluir: Banco de Dados' }));
      const dialog = screen.getByRole('dialog');
      await userEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }));
      expect(await screen.findByText('Há dependências')).toBeInTheDocument();
    });

    it('hides writing actions from students', async () => {
      const requests = setup(student);
      renderApp('/disciplines');
      await userEvent.click(await screen.findByRole('link', { name: /Abrir disciplina/ }));
      expect(await screen.findByText('Lista 1')).toBeInTheDocument();
      expect(screen.getByText('Ler')).toBeInTheDocument();
      for (const name of [/Nova/, /Editar/, /Excluir/]) {
        expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
      }
      expect(requests.some(({ url }) => url?.endsWith('/grades'))).toBe(false);
    });
  });

  describe('enrollments', () => {
    beforeEach(() => accessToken.set('token'));

    const studentsPath = `/disciplines/${id(3)}/students`;

    it('searches and enrolls a student', async () => {
      const requests = setup(professor, {
        [`get ${studentsPath}/candidates`]: {
          data: [{ id: id(8), name: 'Bruno', email: 'b@example.com' }],
        },
        [`post ${studentsPath}/${id(8)}`]: {
          status: 201,
          data: { id: id(8), name: 'Bruno', email: 'b@example.com' },
        },
      });
      renderApp(`/disciplines/${id(3)}`);
      await userEvent.click(await screen.findByRole('button', { name: 'Adicionar aluno' }));
      const search = screen.getByLabelText('Buscar aluno por nome ou e-mail');
      await userEvent.type(search, 'br');
      expect(screen.getByText('Digite pelo menos 3 letras.')).toBeInTheDocument();
      expect(requests.some(({ url }) => url?.endsWith('/candidates'))).toBe(false);
      await userEvent.type(search, 'u');
      await userEvent.click(await screen.findByRole('button', { name: 'Matricular: Bruno' }));
      expect(await screen.findByText('Aluno matriculado')).toBeInTheDocument();
    });

    it('explains why a student with grades cannot be removed', async () => {
      setup(professor, {
        [`delete ${studentsPath}/${id(2)}`]: error(409, 'CONFLICT', 'Há notas lançadas'),
      });
      renderApp(`/disciplines/${id(3)}`);
      await userEvent.click(await screen.findByRole('button', { name: 'Remover matrícula: Ana' }));
      const dialog = screen.getByRole('dialog');
      await userEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }));
      expect(await screen.findByText('Há notas lançadas')).toBeInTheDocument();
    });
  });

  describe('activities', () => {
    beforeEach(() => accessToken.set('token'));

    it('rejects a past due date', async () => {
      const requests = setup(professor);
      renderApp(`/disciplines/${id(3)}`);
      await userEvent.click(await screen.findByRole('button', { name: 'Nova atividade' }));
      await userEvent.type(screen.getByLabelText('Título'), 'Prova');
      await userEvent.type(screen.getByLabelText(/Data limite/), '2020-01-01T10:00');
      await userEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Nova atividade' }),
      );
      expect(await screen.findByText('Escolha uma data a partir de agora.')).toBeInTheDocument();
      expect(requests.some(({ method }) => method === 'post')).toBe(false);
    });

    it('creates, edits and removes an activity', async () => {
      const requests = setup(professor, {
        [`post /disciplines/${id(3)}/activities`]: { status: 201, data: activities[0] },
        [`patch /activities/${id(4)}`]: { data: activities[0] },
        [`delete /activities/${id(4)}`]: { status: 204, data: '' },
      });
      renderApp(`/disciplines/${id(3)}`);
      await userEvent.click(await screen.findByRole('button', { name: 'Nova atividade' }));
      await userEvent.type(screen.getByLabelText('Título'), 'Prova');
      await userEvent.type(screen.getByLabelText(/Data limite/), '2099-12-01T10:00');
      await userEvent.click(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Nova atividade' }),
      );
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      const post = requests.find(({ method }) => method === 'post');
      expect(JSON.parse(post?.data as string)).toEqual({
        title: 'Prova',
        description: null,
        dueAt: new Date('2099-12-01T10:00').toISOString(),
      });

      await userEvent.click(screen.getByRole('button', { name: 'Editar: Lista 1' }));
      expect(screen.getByLabelText('Título')).toHaveValue('Lista 1');
      await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      await userEvent.click(screen.getByRole('button', { name: 'Excluir: Lista 1' }));
      const dialog = screen.getByRole('dialog');
      await userEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(requests.map(({ method }) => method)).toEqual(
        expect.arrayContaining(['post', 'patch', 'delete']),
      );
    });
  });

  describe('attachments', () => {
    beforeEach(() => accessToken.set('token'));

    const attachmentsPath = `/activities/${id(4)}/attachments`;
    const attachment = {
      id: id(7),
      name: 'lista.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2048,
      uploadedAt: '2026-11-24T10:00:00.000Z',
    };

    it('uploads only allowed files', async () => {
      const requests = setup(professor, {
        [`get ${attachmentsPath}`]: { data: [] },
        [`post ${attachmentsPath}`]: { status: 201, data: attachment },
      });
      renderApp(`/disciplines/${id(3)}`);
      await userEvent.click(await screen.findByRole('button', { name: 'Anexos: Lista 1' }));
      expect(await screen.findByText('Nenhum anexo.')).toBeInTheDocument();
      const input = document.querySelector<HTMLInputElement>('input[type="file"]');
      expect(input).not.toBeNull();
      if (!input) return;
      const user = userEvent.setup({ applyAccept: false });
      await user.upload(input, new File(['x'], 'a.html', { type: 'text/html' }));
      expect(await screen.findByText(/Escolha um PDF/)).toBeInTheDocument();
      expect(requests.some(({ method }) => method === 'post')).toBe(false);
      await user.upload(input, new File(['%PDF-'], 'lista.pdf', { type: 'application/pdf' }));
      expect(await screen.findByText('Arquivo anexado')).toBeInTheDocument();
      expect(requests.find(({ method }) => method === 'post')?.data).toBeInstanceOf(FormData);
    });

    it('lets students download but not change attachments', async () => {
      const requests = setup(student, {
        [`get ${attachmentsPath}`]: { data: [attachment] },
        [`get /attachments/${id(7)}/url`]: error(503, 'STORAGE_UNAVAILABLE', 'Indisponível'),
      });
      renderApp(`/disciplines/${id(3)}`);
      await userEvent.click(await screen.findByRole('button', { name: 'Anexos: Lista 1' }));
      await userEvent.click(await screen.findByRole('button', { name: 'Baixar: lista.pdf' }));
      expect(await screen.findByText('Indisponível')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Remover/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Adicionar arquivo' })).not.toBeInTheDocument();
      expect(requests.some(({ url }) => url === `/attachments/${id(7)}/url`)).toBe(true);
    });
  });

  describe('notifications', () => {
    beforeEach(() => accessToken.set('token'));

    it('shows deadlines and recent grades only when opened', async () => {
      const now = Date.now();
      const requests = setup(student, {
        [`get /disciplines/${id(3)}/activities`]: {
          data: [
            { ...activities[0], dueAt: new Date(now + 2 * 86_400_000).toISOString() },
            activities[1],
          ],
        },
        [`get /disciplines/${id(3)}/grades/me`]: {
          data: {
            grades: [{ activityId: id(5), value: 8, updatedAt: new Date(now).toISOString() }],
            average: 8,
            status: 'APPROVED',
          },
        },
      });
      renderApp('/profile');
      const bell = await screen.findByRole('button', { name: 'Abrir avisos' });
      expect(requests.some(({ url }) => url?.endsWith('/grades/me'))).toBe(false);
      await userEvent.click(bell);
      expect(await screen.findByText('Lista 1 vence em 2 dias')).toBeInTheDocument();
      expect(screen.getByText('Sua nota de Lista 2 foi lançada')).toBeInTheDocument();
      expect(screen.getByText('2 avisos')).toBeInTheDocument();
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByText('2 avisos')).not.toBeInTheDocument();

      const countAfterFirstOpen = requests.length;
      await userEvent.click(bell);
      expect(await screen.findByText('2 avisos')).toBeInTheDocument();
      expect(requests).toHaveLength(countAfterFirstOpen);
    });

    it('shows the empty state to professors without reading grades', async () => {
      const requests = setup(professor);
      renderApp('/profile');
      await userEvent.click(await screen.findByRole('button', { name: 'Abrir avisos' }));
      expect(await screen.findByText('Nenhum aviso agora')).toBeInTheDocument();
      expect(requests.some(({ url }) => url?.includes('/grades'))).toBe(false);
    });
  });

  describe('grades', () => {
    beforeEach(() => accessToken.set('token'));

    const gradesPath = `get /disciplines/${id(3)}/grades`;
    const person = { id: id(2), name: 'Ana', email: 'a@example.com' };

    it('saves only the changed grades', async () => {
      let grades = [{ activityId: id(4), value: 6, updatedAt: '2026-11-24T10:00:00.000Z' }];
      const requests = setup(professor, {
        [gradesPath]: () => ({
          data: [{ student: person, grades, average: 6, status: 'RECOVERY' }],
        }),
        [`put /activities/${id(5)}/grades/${id(2)}`]: () => {
          grades = [
            ...grades,
            { activityId: id(5), value: 8.5, updatedAt: '2026-11-24T10:00:00.000Z' },
          ];
          return { data: { activityId: id(5), studentId: id(2), value: 8.5 } };
        },
      });
      renderApp(`/grades?discipline=${id(3)}`);
      const first = await screen.findByLabelText('Nota de Ana em Lista 1');
      const second = screen.getByLabelText('Nota de Ana em Lista 2');
      expect(first).toHaveValue('6,0');
      await userEvent.type(second, '12');
      expect(screen.getByText('De 0 a 10, uma casa decimal')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Salvar notas' })).toBeDisabled();
      await userEvent.clear(second);
      await userEvent.type(second, '8,5');
      await userEvent.click(screen.getByRole('button', { name: 'Salvar notas' }));
      expect(await screen.findByText('Notas salvas.')).toBeInTheDocument();
      const puts = requests.filter(({ method }) => method === 'put');
      expect(puts).toHaveLength(1);
      expect(JSON.parse(puts[0]?.data as string)).toEqual({ value: 8.5 });
    });

    it('keeps the grades that failed to save', async () => {
      setup(professor, {
        [gradesPath]: {
          data: [{ student: person, grades: [], average: null, status: 'NO_GRADES' }],
        },
        [`put /activities/${id(4)}/grades/${id(2)}`]: error(500, 'INTERNAL_ERROR', 'Erro'),
      });
      renderApp(`/grades?discipline=${id(3)}`);
      const input = await screen.findByLabelText('Nota de Ana em Lista 1');
      await userEvent.type(input, '7');
      await userEvent.click(screen.getByRole('button', { name: 'Salvar notas' }));
      expect(await screen.findByText('1 nota não foi salva. Tente novamente.')).toBeInTheDocument();
      expect(input).toHaveValue('7');
    });

    it('filters students but keeps the ones being edited', async () => {
      setup(professor, {
        [gradesPath]: {
          data: [{ student: person, grades: [], average: null, status: 'NO_GRADES' }],
        },
      });
      renderApp(`/grades?discipline=${id(3)}`);
      const filter = await screen.findByRole('combobox', { name: 'Mostrar' });
      await userEvent.selectOptions(filter, 'RECOVERY');
      expect(screen.getByText('Nenhum aluno nesta situação.')).toBeInTheDocument();
      await userEvent.selectOptions(filter, 'NO_GRADES');
      await userEvent.type(screen.getByLabelText('Nota de Ana em Lista 1'), '7');
      await userEvent.selectOptions(filter, 'RECOVERY');
      expect(screen.getByLabelText('Nota de Ana em Lista 1')).toHaveValue('7');
    });

    it('does not allow clearing a saved grade', async () => {
      setup(professor, {
        [gradesPath]: {
          data: [
            {
              student: person,
              grades: [{ activityId: id(4), value: 6, updatedAt: '2026-11-24T10:00:00.000Z' }],
              average: 6,
              status: 'RECOVERY',
            },
          ],
        },
      });
      renderApp(`/grades?discipline=${id(3)}`);
      await userEvent.clear(await screen.findByLabelText('Nota de Ana em Lista 1'));
      expect(screen.getByText('Nota lançada não pode ser apagada')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Salvar notas' })).toBeDisabled();
    });

    it('ignores retyping the same saved grade and warns before leaving unsaved edits', async () => {
      setup(professor, {
        [gradesPath]: {
          data: [
            {
              student: person,
              grades: [{ activityId: id(4), value: 6, updatedAt: '2026-11-24T10:00:00.000Z' }],
              average: 6,
              status: 'RECOVERY',
            },
          ],
        },
      });
      const router = renderApp(`/grades?discipline=${id(3)}`);
      const first = await screen.findByLabelText('Nota de Ana em Lista 1');
      await userEvent.clear(first);
      await userEvent.type(first, '6');
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(first).not.toHaveClass('bg-warning-soft');

      const second = screen.getByLabelText('Nota de Ana em Lista 2');
      await userEvent.type(second, '9');
      expect(screen.getByText('1 alteração não salva')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('link', { name: 'Disciplinas' }));
      const modal = await screen.findByRole('dialog', { name: 'Sair sem salvar notas?' });
      await userEvent.click(within(modal).getByRole('button', { name: 'Continuar editando' }));
      expect(router.state.location.pathname).toBe('/grades');
      expect(second).toHaveValue('9');

      await userEvent.click(screen.getByRole('link', { name: 'Disciplinas' }));
      const confirmModal = await screen.findByRole('dialog', { name: 'Sair sem salvar notas?' });
      await userEvent.click(within(confirmModal).getByRole('button', { name: 'Sair sem salvar' }));
      await waitFor(() => expect(router.state.location.pathname).toBe('/disciplines'));
    });

    it('shows partial average and missing grades to the student', async () => {
      setup(student, {
        [`${gradesPath}/me`]: {
          data: {
            grades: [{ activityId: id(4), value: 6, updatedAt: '2026-11-24T10:00:00.000Z' }],
            average: 6,
            status: 'RECOVERY',
          },
        },
      });
      renderApp('/grades');
      expect(await screen.findByText('Média parcial')).toBeInTheDocument();
      expect(screen.getByText('Recuperação (parcial)')).toBeInTheDocument();
      expect(screen.getByText('Sem nota')).toBeInTheDocument();
      expect(screen.getAllByText('6,0')).toHaveLength(2);
      await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'en');
      expect(await screen.findByText('Partial average')).toBeInTheDocument();
      expect(screen.getByText('Recovery (partial)')).toBeInTheDocument();
      expect(screen.getAllByText('6.0')).toHaveLength(2);
    });

    it('never shows zero or failure without grades', async () => {
      setup(student, {
        [`${gradesPath}/me`]: { data: { grades: [], average: null, status: 'NO_GRADES' } },
      });
      renderApp('/grades');
      expect(await screen.findByText('Sem notas')).toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();
      expect(screen.queryByText('0,0')).not.toBeInTheDocument();
    });
  });
});
