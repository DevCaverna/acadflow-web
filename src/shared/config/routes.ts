const AREAS = { PROFESSOR: '/professor', ALUNO: '/student' } as const;

export type AreaRole = keyof typeof AREAS;

export const ROUTES = {
  root: '/',
  home: '/home',
  login: '/login',
  register: '/register',
  profile: '/profile',
} as const;

export function getAreaRoutes(role: AreaRole) {
  const home = AREAS[role];
  const disciplines = `${home}/disciplines`;
  const grades = `${home}/grades`;
  return {
    home,
    disciplines,
    newDiscipline: `${disciplines}?new=1`,
    discipline: (id: string) => `${disciplines}/${id}`,
    grades,
    disciplineGrades: (id: string) => `${grades}?discipline=${id}`,
  };
}
