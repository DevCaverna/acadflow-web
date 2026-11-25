import type { Activity } from '@/features/activities/schemas/activity.schema';
import type { Discipline } from '@/features/disciplines/schemas/discipline.schema';
import type { GradeSummary, StudentGrades } from '@/features/grades/schemas/grade.schema';
import { TIME } from '@/shared/config/time.constants';

const DAY_MS = 24 * TIME.HOUR_MS;

type Entry = { discipline: Discipline; activities: readonly Activity[] };
export type ProfessorEntry = Entry & { students: readonly StudentGrades[] };
export type StudentEntry = Entry & { summary: GradeSummary };
export type Deadline = { activity: Activity; discipline: Discipline; time: number };

export function getDeadlines({
  entries,
  now,
  days,
}: {
  entries: readonly Entry[];
  now: number;
  days: number;
}): Deadline[] {
  return entries
    .flatMap(({ discipline, activities }) =>
      activities.map((activity) => ({
        activity,
        discipline,
        time: activity.dueAt === null ? 0 : new Date(activity.dueAt).getTime(),
      })),
    )
    .filter(({ time }) => time > now && time <= now + days * DAY_MS)
    .sort((a, b) => a.time - b.time);
}

export function getPendingGrades(entries: readonly ProfessorEntry[], now: number) {
  return entries
    .flatMap(({ discipline, activities, students }) =>
      activities.flatMap((activity) => {
        const time = activity.dueAt === null ? null : new Date(activity.dueAt).getTime();
        if (time === null || time > now) return [];
        const graded = students.filter(({ grades }) =>
          grades.some(({ activityId }) => activityId === activity.id),
        ).length;
        const missing = students.length - graded;
        return missing > 0
          ? [{ activity, discipline, time, graded, missing, total: students.length }]
          : [];
      }),
    )
    .sort((a, b) => b.time - a.time);
}

export function getRecentGrades(entries: readonly StudentEntry[], now: number, days: number) {
  return entries
    .flatMap(({ discipline, activities, summary }) =>
      summary.grades.flatMap(({ activityId, value, updatedAt }) => {
        const activity = activities.find(({ id }) => id === activityId);
        const time = new Date(updatedAt).getTime();
        return activity && now - time <= days * DAY_MS
          ? [{ activity, discipline, summary, value, updatedAt, time }]
          : [];
      }),
    )
    .sort((a, b) => b.time - a.time);
}

export function getGreeting(now: number): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date(now).getHours();
  if (hour < 12) return 'morning';
  return hour < 18 ? 'afternoon' : 'evening';
}
