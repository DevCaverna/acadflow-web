import { describe, expect, it } from 'vitest';
import { getAreaRoutes } from '@/shared/config/routes';

describe('getAreaRoutes', () => {
  it.each([
    ['PROFESSOR', '/professor'],
    ['ALUNO', '/student'],
  ] as const)('builds the paths of %s', (role, home) => {
    const routes = getAreaRoutes(role);
    expect(routes.home).toBe(home);
    expect(routes.discipline('1')).toBe(`${home}/disciplines/1`);
    expect(routes.disciplineGrades('1')).toBe(`${home}/grades?discipline=1`);
  });
});
