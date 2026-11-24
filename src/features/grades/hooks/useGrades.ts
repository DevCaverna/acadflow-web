import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gradeKeys } from '@/features/grades/api/grades.keys';
import { gradesService } from '@/features/grades/api/grades.service';
import type { SaveGradeInput } from '@/features/grades/schemas/grade.schema';

export function useGrades(disciplineId: string) {
  return useQuery({
    queryKey: gradeKeys.list(disciplineId),
    queryFn: () => gradesService.list({ disciplineId }),
  });
}

export function useMyGrades(disciplineId: string) {
  return useQuery({
    queryKey: gradeKeys.mine(disciplineId),
    queryFn: () => gradesService.mine({ disciplineId }),
  });
}

export function useSaveGrades(disciplineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inputs: SaveGradeInput[]): Promise<SaveGradeInput[]> => {
      const results = await Promise.allSettled(inputs.map((input) => gradesService.save(input)));
      return inputs.filter((_input, index) => results[index]?.status === 'rejected');
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: gradeKeys.discipline(disciplineId) }),
  });
}
