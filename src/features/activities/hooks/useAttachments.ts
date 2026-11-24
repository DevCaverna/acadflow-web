import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activityKeys } from '@/features/activities/api/activities.keys';
import { attachmentsService } from '@/features/activities/api/attachments.service';

export function useAttachments(activityId: string) {
  return useQuery({
    queryKey: activityKeys.attachments(activityId),
    queryFn: () => attachmentsService.list({ activityId }),
  });
}

export function useUploadAttachment(activityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => attachmentsService.upload({ activityId, file }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: activityKeys.attachments(activityId) }),
  });
}

export function useRemoveAttachment(activityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attachmentsService.remove({ id }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: activityKeys.attachments(activityId) }),
  });
}

export function useDownloadAttachment() {
  return useMutation({
    mutationFn: (id: string) => attachmentsService.getUrl({ id }),
    onSuccess: (url) => {
      const link = document.createElement('a');
      link.href = url;
      link.rel = 'noreferrer';
      link.click();
    },
  });
}
