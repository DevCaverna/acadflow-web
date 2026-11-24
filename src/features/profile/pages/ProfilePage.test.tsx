import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import i18n from '@/i18n';
import { accessToken } from '@/shared/api/access-token';
import { toastStore } from '@/shared/lib/toast';
import { mockApi } from '@/test/mock-api';
import { renderApp } from '@/test/render-app';

const user = {
  id: '019ac3a0-0000-7000-8000-000000000001',
  name: 'Ana Souza',
  email: 'ana@example.com',
  role: 'ALUNO',
  avatarUrl: null,
};

type Reply = { status?: number; data: unknown };

function setup(reply: Reply) {
  return mockApi(({ method }) => (method === 'patch' ? reply : { data: user }));
}

describe('ProfilePage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('pt-BR');
    accessToken.set('token');
  });

  afterEach(() => {
    accessToken.clear();
    toastStore.clear();
  });

  it('updates the name everywhere without allowing role changes', async () => {
    const requests = setup({ data: { ...user, name: 'Ana Maria' } });
    renderApp('/profile');
    const name = await screen.findByLabelText('Nome');
    await userEvent.clear(name);
    await userEvent.type(name, 'Ana Maria');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar dados' }));
    expect(await screen.findByText('Dados salvos')).toBeInTheDocument();
    expect(within(screen.getByRole('complementary')).getByText('Ana Maria')).toBeInTheDocument();
    const body = requests.find(({ method }) => method === 'patch')?.data as string;
    expect(JSON.parse(body)).toEqual({ name: 'Ana Maria', email: 'ana@example.com' });
  });

  it('shows the API error when the email is in use', async () => {
    setup({ status: 409, data: { statusCode: 409, code: 'CONFLICT', message: 'Em uso' } });
    renderApp('/profile');
    await userEvent.click(await screen.findByRole('button', { name: 'Salvar dados' }));
    expect(await screen.findByText('Em uso')).toBeInTheDocument();
  });

  it('previews, uploads and shows the photo', async () => {
    URL.createObjectURL = () => 'blob:preview';
    URL.revokeObjectURL = () => undefined;
    const requests = mockApi(({ method }) =>
      method === 'post'
        ? { data: { ...user, avatarUrl: 'https://storage.test/a.webp' } }
        : { data: user },
    );
    renderApp('/profile');
    await screen.findByRole('button', { name: 'Escolher foto' });
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    if (!input) return;
    const actor = userEvent.setup({ applyAccept: false });
    await actor.upload(input, new File(['x'], 'a.gif', { type: 'image/gif' }));
    expect(await screen.findByText(/Escolha uma imagem/)).toBeInTheDocument();
    await actor.upload(input, new File(['x'], 'a.png', { type: 'image/png' }));
    expect(document.querySelector('img[src="blob:preview"]')).not.toBeNull();
    await actor.click(screen.getByRole('button', { name: 'Enviar foto' }));
    expect(await screen.findByText('Foto atualizada')).toBeInTheDocument();
    expect(requests.find(({ method }) => method === 'post')?.data).toBeInstanceOf(FormData);
    expect(document.querySelectorAll('img[src="https://storage.test/a.webp"]')).toHaveLength(2);
  });

  async function fillPassword(current: string, next: string, confirmation: string) {
    await userEvent.type(await screen.findByLabelText('Senha atual'), current);
    await userEvent.type(screen.getByLabelText('Nova senha'), next);
    await userEvent.type(screen.getByLabelText('Confirmar nova senha'), confirmation);
    await userEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));
  }

  it('validates the new password before calling the API', async () => {
    const requests = setup({ status: 204, data: '' });
    renderApp('/profile');
    await fillPassword('secret', 'short', 'other');
    expect(await screen.findByText('Use pelo menos 8 caracteres.')).toBeInTheDocument();
    expect(requests.some(({ method }) => method === 'patch')).toBe(false);
  });

  it('requires the confirmation to match', async () => {
    setup({ status: 204, data: '' });
    renderApp('/profile');
    await fillPassword('secret', 'new-password', 'new-passwore');
    expect(await screen.findByText('As senhas não são iguais.')).toBeInTheDocument();
  });

  it('changes the password and clears the form', async () => {
    const requests = setup({ status: 204, data: '' });
    renderApp('/profile');
    await fillPassword('secret', 'new-password', 'new-password');
    expect(await screen.findByText('Senha alterada')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha atual')).toHaveValue('');
    const body = requests.find(({ method }) => method === 'patch')?.data as string;
    expect(JSON.parse(body)).toEqual({ currentPassword: 'secret', newPassword: 'new-password' });
  });

  it('keeps the session when the current password is wrong', async () => {
    setup({
      status: 400,
      data: { statusCode: 400, code: 'INVALID_CURRENT_PASSWORD', message: 'Senha incorreta' },
    });
    renderApp('/profile');
    await fillPassword('wrong', 'new-password', 'new-password');
    expect(await screen.findByText('Senha incorreta')).toBeInTheDocument();
    expect(accessToken.get()).toBe('token');
  });
});
