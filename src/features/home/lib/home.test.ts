import { describe, expect, it } from 'vitest';
import { getDeadlines, getPendingGrades, getRecentGrades } from '@/features/home/lib/home';

const NOW = new Date('2026-11-25T12:00:00.000Z').getTime();
const discipline = {
  id: 'd',
  code: 'BD',
  name: 'Banco',
  description: null,
  semester: '2026.2',
  professor: { id: 'p', name: 'Marina' },
};
const activity = (id: string, dueAt: string | null) => ({
  id,
  disciplineId: 'd',
  title: id,
  description: null,
  dueAt,
});
const closed = activity('closed', '2026-11-20T12:00:00.000Z');
const soon = activity('soon', '2026-11-28T12:00:00.000Z');
const later = activity('later', '2026-12-30T12:00:00.000Z');
const open = activity('open', null);
const activities = [later, soon, open, closed];
const summary = (updatedAt: string) => ({
  grades: [{ activityId: 'closed', value: 6, updatedAt }],
  average: 6,
  status: 'RECOVERY' as const,
});
const student = (id: string) => ({ id, name: id, email: `${id}@example.com` });

describe('home', () => {
  it('lists only deadlines inside the period', () => {
    const result = getDeadlines({ entries: [{ discipline, activities }], now: NOW, days: 7 });
    expect(result.map((item) => item.activity.id)).toEqual(['soon']);
  });

  it('counts missing grades only in closed activities', () => {
    const students = [
      { student: student('a'), ...summary('2026-11-24T12:00:00.000Z') },
      { student: student('b'), grades: [], average: null, status: 'NO_GRADES' as const },
    ];
    const result = getPendingGrades([{ discipline, activities, students }], NOW);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ graded: 1, missing: 1, total: 2 });
  });

  it('keeps only recent grades', () => {
    const entry = (updatedAt: string) => ({ discipline, activities, summary: summary(updatedAt) });
    expect(getRecentGrades([entry('2026-11-24T12:00:00.000Z')], NOW, 7)).toHaveLength(1);
    expect(getRecentGrades([entry('2026-10-01T12:00:00.000Z')], NOW, 7)).toHaveLength(0);
  });
});
