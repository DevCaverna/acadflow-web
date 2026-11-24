import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { disciplineKeys } from '@/features/disciplines/api/disciplines.keys';
import { enrollmentKeys } from '@/features/enrollments/api/enrollments.keys';
import { enrollmentsService } from '@/features/enrollments/api/enrollments.service';
import { gradeKeys } from '@/features/grades/api/grades.keys';

export const MIN_SEARCH_LENGTH = 3;

async function invalidate(queryClient: QueryClient, disciplineId: string): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: enrollmentKeys.all }),
    queryClient.invalidateQueries({ queryKey: gradeKeys.discipline(disciplineId) }),
    queryClient.invalidateQueries({ queryKey: disciplineKeys.students(disciplineId) }),
  ]);
}

export function useCandidates(disciplineId: string, search: string) {
  return useQuery({
    queryKey: enrollmentKeys.candidates(disciplineId, search),
    queryFn: () => enrollmentsService.findCandidates({ disciplineId, search }),
    enabled: search.length >= MIN_SEARCH_LENGTH,
  });
}

export function useEnroll(disciplineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => enrollmentsService.enroll({ disciplineId, studentId }),
    onSuccess: () => invalidate(queryClient, disciplineId),
  });
}

export function useRemoveEnrollment(disciplineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => enrollmentsService.remove({ disciplineId, studentId }),
    onSuccess: () => invalidate(queryClient, disciplineId),
  });
}
