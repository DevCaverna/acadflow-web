import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activityKeys } from '@/features/activities/api/activities.keys';
import { activitiesService } from '@/features/activities/api/activities.service';
import type {
  ActivityInput,
  UpdateActivityInput,
} from '@/features/activities/schemas/activity.schema';

export function useActivities(disciplineId: string) {
  return useQuery({
    queryKey: activityKeys.list(disciplineId),
    queryFn: () => activitiesService.list({ disciplineId }),
  });
}

export function useCreateActivity(disciplineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ActivityInput) => activitiesService.create({ disciplineId, ...input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: activityKeys.list(disciplineId) }),
  });
}

export function useUpdateActivity(disciplineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateActivityInput) => activitiesService.update(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: activityKeys.list(disciplineId) }),
  });
}

export function useRemoveActivity(disciplineId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesService.remove({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: activityKeys.list(disciplineId) }),
  });
}
