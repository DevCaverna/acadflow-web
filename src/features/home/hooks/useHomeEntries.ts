import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import { activityKeys } from '@/features/activities/api/activities.keys';
import { activitiesService } from '@/features/activities/api/activities.service';
import type { Discipline } from '@/features/disciplines/schemas/discipline.schema';
import { gradeKeys } from '@/features/grades/api/grades.keys';
import { gradesService } from '@/features/grades/api/grades.service';
import type { ProfessorEntry, StudentEntry } from '@/features/home/lib/home';
import { TIME } from '@/shared/config/time.constants';

function useActivityLists(disciplines: readonly Discipline[]) {
  return useQueries({
    queries: disciplines.map(({ id }) => ({
      queryKey: activityKeys.list(id),
      queryFn: () => activitiesService.list({ disciplineId: id }),
      staleTime: TIME.QUERY_STALE_MS,
    })),
  });
}

function getStatus(queries: readonly UseQueryResult[]) {
  return {
    paused: queries.some((query) => query.isPending && query.fetchStatus === 'paused'),
    error: queries.find((query) => query.isLoadingError)?.error ?? null,
    isPending: queries.some((query) => query.isPending),
    refetch: () => Promise.all(queries.map((query) => query.refetch())),
  };
}

export function useProfessorEntries(disciplines: readonly Discipline[]) {
  const activities = useActivityLists(disciplines);
  const grades = useQueries({
    queries: disciplines.map(({ id }) => ({
      queryKey: gradeKeys.list(id),
      queryFn: () => gradesService.list({ disciplineId: id }),
      staleTime: TIME.QUERY_STALE_MS,
    })),
  });
  const entries = disciplines.flatMap((discipline, index): ProfessorEntry[] => {
    const list = activities[index]?.data;
    const students = grades[index]?.data;
    return list && students ? [{ discipline, activities: list, students }] : [];
  });
  return { entries, ...getStatus([...activities, ...grades]) };
}

export function useStudentEntries(disciplines: readonly Discipline[]) {
  const activities = useActivityLists(disciplines);
  const grades = useQueries({
    queries: disciplines.map(({ id }) => ({
      queryKey: gradeKeys.mine(id),
      queryFn: () => gradesService.mine({ disciplineId: id }),
      staleTime: TIME.QUERY_STALE_MS,
    })),
  });
  const entries = disciplines.flatMap((discipline, index): StudentEntry[] => {
    const list = activities[index]?.data;
    const summary = grades[index]?.data;
    return list && summary ? [{ discipline, activities: list, summary }] : [];
  });
  return { entries, ...getStatus([...activities, ...grades]) };
}
