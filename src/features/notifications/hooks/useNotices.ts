import { useQueries, useQuery } from '@tanstack/react-query';
import { activityKeys } from '@/features/activities/api/activities.keys';
import { activitiesService } from '@/features/activities/api/activities.service';
import { disciplineKeys } from '@/features/disciplines/api/disciplines.keys';
import { disciplinesService } from '@/features/disciplines/api/disciplines.service';
import { gradeKeys } from '@/features/grades/api/grades.keys';
import { gradesService } from '@/features/grades/api/grades.service';
import { createNotices, sortNotices } from '@/features/notifications/lib/notices';

const OPTIONS = { perPage: 100 };

export function useNotices({ isStudent, now }: { isStudent: boolean; now: number }) {
  const disciplines = useQuery({
    queryKey: disciplineKeys.list(OPTIONS),
    queryFn: () => disciplinesService.list(OPTIONS),
    refetchOnMount: 'always',
  });
  const list = disciplines.data?.data ?? [];
  const activities = useQueries({
    queries: list.map(({ id }) => ({
      queryKey: activityKeys.list(id),
      queryFn: () => activitiesService.list({ disciplineId: id }),
      refetchOnMount: 'always' as const,
    })),
  });
  const grades = useQueries({
    queries: isStudent
      ? list.map(({ id }) => ({
          queryKey: gradeKeys.mine(id),
          queryFn: () => gradesService.mine({ disciplineId: id }),
          refetchOnMount: 'always' as const,
        }))
      : [],
  });

  const queries = [disciplines, ...activities, ...grades];
  return {
    isPending: queries.some((query) => query.isPending),
    error: queries.find((query) => query.error)?.error ?? null,
    refetch: () => Promise.all(queries.map((query) => query.refetch())),
    notices: sortNotices(
      list.flatMap((discipline, index) =>
        createNotices({
          discipline,
          activities: activities[index]?.data ?? [],
          grades: grades[index]?.data?.grades ?? [],
          now,
        }),
      ),
    ),
  };
}
