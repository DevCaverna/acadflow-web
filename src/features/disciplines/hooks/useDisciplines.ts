import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { disciplineKeys } from '@/features/disciplines/api/disciplines.keys';
import { disciplinesService } from '@/features/disciplines/api/disciplines.service';
import type {
  CreateDisciplineInput,
  DisciplineListOptions,
} from '@/features/disciplines/schemas/discipline.schema';

export function useDisciplines(options: DisciplineListOptions = {}) {
  return useQuery({
    queryKey: disciplineKeys.list(options),
    queryFn: () => disciplinesService.list(options),
    placeholderData: keepPreviousData,
  });
}

export function useDiscipline(id: string) {
  return useQuery({
    queryKey: disciplineKeys.detail(id),
    queryFn: () => disciplinesService.get(id),
  });
}

export function useDisciplineStudents(id: string) {
  return useQuery({
    queryKey: disciplineKeys.students(id),
    queryFn: () => disciplinesService.listStudents(id),
  });
}

export function useCreateDiscipline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDisciplineInput) => disciplinesService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disciplineKeys.all }),
  });
}
