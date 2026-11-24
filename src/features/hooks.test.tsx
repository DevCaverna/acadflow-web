import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { activityKeys } from '@/features/activities/api/activities.keys';
import { useCreateActivity } from '@/features/activities/hooks/useActivities';
import { authKeys } from '@/features/auth/api/auth.keys';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { disciplineKeys } from '@/features/disciplines/api/disciplines.keys';
import { useCreateDiscipline } from '@/features/disciplines/hooks/useDisciplines';
import { gradeKeys } from '@/features/grades/api/grades.keys';
import { gradesService } from '@/features/grades/api/grades.service';
import { useMyGrades, useSaveGrades } from '@/features/grades/hooks/useGrades';
import i18n from '@/i18n';
import { accessToken } from '@/shared/api/access-token';
import { toastStore } from '@/shared/lib/toast';
import { mockApi } from '@/test/mock-api';
import { createQueryWrapper } from '@/test/query-wrapper';

const ID = '019ac3a0-0000-7000-8000-000000000001';
const OTHER_ID = '019ac3a0-0000-7000-8000-000000000002';

describe('feature hooks', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
    accessToken.clear();
    toastStore.clear();
  });

  it('stores the session on login and clears it on logout', async () => {
    const user = {
      id: ID,
      name: 'Ana',
      email: 'ana@example.com',
      role: 'PROFESSOR',
      avatarUrl: null,
    };
    mockApi(() => ({ data: { accessToken: 'token', user } }));
    const { queryClient, wrapper } = createQueryWrapper();
    const login = renderHook(() => useLogin(), { wrapper });
    await act(() => login.result.current.mutateAsync({ email: user.email, password: 'x' }));
    expect(accessToken.get()).toBe('token');
    expect(queryClient.getQueryData(authKeys.me)).toEqual(user);

    const logout = renderHook(() => useLogout(), { wrapper });
    toastStore.show('Saved');
    void act(() => logout.result.current());
    expect(toastStore.get()).toHaveLength(0);
    expect(accessToken.get()).toBeNull();
    expect(queryClient.getQueryData(authKeys.me)).toBeUndefined();
  });

  it('sends the language and the token', async () => {
    accessToken.set('token');
    const requests = mockApi(() => ({ data: { grades: [], average: null, status: 'NO_GRADES' } }));
    const { result } = renderHook(() => useMyGrades(ID), {
      wrapper: createQueryWrapper().wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requests[0]?.headers.get('Accept-Language')).toBe('en');
    expect(requests[0]?.headers.get('Authorization')).toBe('Bearer token');
  });

  it('invalidates the disciplines after creating one', async () => {
    mockApi(() => ({
      data: {
        id: ID,
        code: 'ES101',
        name: 'Software',
        description: null,
        semester: '2026/2',
        professor: { id: OTHER_ID, name: 'Ana' },
      },
    }));
    const { queryClient, wrapper } = createQueryWrapper();
    queryClient.setQueryData(disciplineKeys.list(), []);
    const { result } = renderHook(() => useCreateDiscipline(), { wrapper });
    await act(() =>
      result.current.mutateAsync({ code: 'ES101', name: 'Software', semester: '2026/2' }),
    );
    expect(queryClient.getQueryState(disciplineKeys.list())?.isInvalidated).toBe(true);
  });

  it('invalidates only the activities of the changed discipline', async () => {
    mockApi(() => ({
      data: { id: ID, disciplineId: ID, title: 'Test', description: null, dueAt: null },
    }));
    const { queryClient, wrapper } = createQueryWrapper();
    queryClient.setQueryData(activityKeys.list(ID), []);
    queryClient.setQueryData(activityKeys.list(OTHER_ID), []);
    const { result } = renderHook(() => useCreateActivity(ID), { wrapper });
    await act(() => result.current.mutateAsync({ title: 'Test', description: null, dueAt: null }));
    expect(queryClient.getQueryState(activityKeys.list(ID))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(activityKeys.list(OTHER_ID))?.isInvalidated).toBe(false);
  });

  it('invalidates both grade views after saving a grade', async () => {
    mockApi(() => ({ data: { activityId: ID, studentId: OTHER_ID, value: 7.5 } }));
    const { queryClient, wrapper } = createQueryWrapper();
    queryClient.setQueryData(gradeKeys.list(ID), []);
    queryClient.setQueryData(gradeKeys.mine(ID), {});
    const { result } = renderHook(() => useSaveGrades(ID), { wrapper });
    await act(() =>
      result.current.mutateAsync([{ activityId: ID, studentId: OTHER_ID, value: 7.5 }]),
    );
    expect(queryClient.getQueryState(gradeKeys.list(ID))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(gradeKeys.mine(ID))?.isInvalidated).toBe(true);
  });

  it('calls DELETE /activities/:id/grades/:studentId when removing a grade', async () => {
    const requests = mockApi(() => ({ status: 204, data: '' }));
    await gradesService.remove({ activityId: ID, studentId: OTHER_ID });
    expect(requests[0]?.method).toBe('delete');
    expect(requests[0]?.url).toBe(`/activities/${ID}/grades/${OTHER_ID}`);
  });
});
