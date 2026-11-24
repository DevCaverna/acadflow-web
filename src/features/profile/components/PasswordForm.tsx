import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useChangePassword } from '@/features/profile/hooks/useProfile';
import {
  type PasswordForm as PasswordFormValues,
  passwordFormSchema,
} from '@/features/profile/schemas/profile.schema';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { toastStore } from '@/shared/lib/toast';

/** Troca da própria senha, com confirmação. */
export function PasswordForm() {
  const { t } = useTranslation('profile');
  const change = useChangePassword();
  const { register, handleSubmit, formState, reset } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmation: '' },
  });

  function submit({ currentPassword, newPassword }: PasswordFormValues) {
    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          reset();
          toastStore.show(t('passwordChanged'));
        },
      },
    );
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-4.5 rounded-panel border border-line bg-surface p-6"
      onSubmit={(event) => void handleSubmit(submit)(event)}
    >
      <h2 className="text-lg font-semibold">{t('changePassword')}</h2>
      {change.error && <Alert>{getErrorMessage(change.error)}</Alert>}
      <Field
        label={t('currentPassword')}
        type="password"
        autoComplete="current-password"
        error={formState.errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label={t('newPassword')}
          type="password"
          autoComplete="new-password"
          placeholder={t('passwordPlaceholder')}
          error={formState.errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Field
          label={t('confirmation')}
          type="password"
          autoComplete="new-password"
          error={formState.errors.confirmation?.message}
          {...register('confirmation')}
        />
      </div>
      <Button type="submit" variant="secondary" loading={change.isPending} className="self-end">
        {t('changePassword')}
      </Button>
    </form>
  );
}
