import { getDueStatus } from '@/features/activities/lib/due-date';
import type { Activity } from '@/features/activities/schemas/activity.schema';
import type { Discipline } from '@/features/disciplines/schemas/discipline.schema';
import type { GradeSummary } from '@/features/grades/schemas/grade.schema';
import { TIME } from '@/shared/config/time.constants';

const RECENT_MS = 7 * 24 * TIME.HOUR_MS;

export type Notice = {
  id: string;
  disciplineId: string;
  disciplineName: string;
  activityTitle: string;
  date: string;
} & ({ type: 'due'; days: number } | { type: 'grade' });

export function createNotices({
  discipline,
  activities,
  grades,
  now,
}: {
  discipline: Discipline;
  activities: readonly Activity[];
  grades: GradeSummary['grades'];
  now: number;
}): Notice[] {
  const base = { disciplineId: discipline.id, disciplineName: discipline.name };
  const due = activities.flatMap((activity): Notice[] => {
    const status = getDueStatus(activity.dueAt, now);
    if (status.status !== 'dueSoon' || activity.dueAt === null) return [];
    return [
      {
        ...base,
        id: `due:${activity.id}`,
        type: 'due',
        days: status.days,
        activityTitle: activity.title,
        date: activity.dueAt,
      },
    ];
  });
  const recent = grades.flatMap(({ activityId, updatedAt }): Notice[] => {
    const activity = activities.find(({ id }) => id === activityId);
    if (!activity || now - new Date(updatedAt).getTime() > RECENT_MS) return [];
    return [
      {
        ...base,
        id: `grade:${activityId}`,
        type: 'grade',
        activityTitle: activity.title,
        date: updatedAt,
      },
    ];
  });
  return [...due, ...recent];
}

export function sortNotices(notices: readonly Notice[]): Notice[] {
  const time = ({ date }: Notice) => new Date(date).getTime();
  const due = notices.filter(({ type }) => type === 'due').sort((a, b) => time(a) - time(b));
  const grades = notices.filter(({ type }) => type === 'grade').sort((a, b) => time(b) - time(a));
  return [...due, ...grades];
}
