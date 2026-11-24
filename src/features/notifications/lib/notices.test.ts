import { describe, expect, it } from 'vitest';
import { createNotices, sortNotices } from '@/features/notifications/lib/notices';

const NOW = Date.parse('2026-11-24T12:00:00Z');
const discipline = {
  id: 'd',
  code: 'BD',
  name: 'Banco',
  description: null,
  semester: '2026.2',
  professor: { id: 'p', name: 'P' },
};
const activity = (id: string, dueAt: string | null) => ({
  id,
  disciplineId: 'd',
  title: id,
  description: null,
  dueAt,
});

describe('notices', () => {
  it('includes only close deadlines and recent grades of known activities', () => {
    const notices = createNotices({
      discipline,
      activities: [
        activity('late', '2026-12-01T12:00:00Z'),
        activity('soon', '2026-11-25T12:00:00Z'),
        activity('past', '2026-11-23T12:00:00Z'),
        activity('far', '2026-12-02T12:00:00Z'),
        activity('open', null),
      ],
      grades: [
        { activityId: 'past', value: 8, updatedAt: '2026-11-24T10:00:00Z' },
        { activityId: 'open', value: 8, updatedAt: '2026-11-10T10:00:00Z' },
        { activityId: 'unknown', value: 8, updatedAt: '2026-11-24T10:00:00Z' },
      ],
      now: NOW,
    });
    expect(sortNotices(notices).map(({ id }) => id)).toEqual([
      'due:soon',
      'due:late',
      'grade:past',
    ]);
  });
});
