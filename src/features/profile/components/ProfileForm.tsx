import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { User } from '@/features/auth/schemas/auth.schema';
import { useUpdateProfile } from '@/features/profile/hooks/useProfile';
import {
  type ProfileForm as ProfileFormValues,
  profileFormSchema,
} from '@/features/profile/schemas/profile.schema';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { toastStore } from '@/shared/lib/toast';

/** Props de {@link ProfileForm}. */
type ProfileFormProps = {
  /** Usuário autenticado. */
  user: User;
};

/** Edição de nome e e-mail; o papel não é editável. */
export function ProfileForm({ user }: ProfileFormProps) {
  const { t } = useTranslation(['profile', 'common', 'auth']);
  const update = useUpdateProfile();
  const { register, handleSubmit, formState } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user.name, email: user.email },
  });

  function submit(input: ProfileFormValues) {
    update.mutate(input, { onSuccess: () => toastStore.show(t('saved')) });
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-4.5 p-6"
      onSubmit={(event) => void handleSubmit(submit)(event)}
    >
      <h2 className="text-lg font-semibold">{t('personalData')}</h2>
      {update.error && <Alert>{getErrorMessage(update.error)}</Alert>}
      <Field
        label={t('name')}
        autoComplete="name"
        error={formState.errors.name?.message}
        {...register('name')}
      />
      <Field
        label={t('auth:email')}
        type="email"
        autoComplete="email"
        error={formState.errors.email?.message}
        {...register('email')}
      />
      <p className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold">{t('role')}</span>
        <span className="text-muted">
          {t('roleHint', { role: t(`common:roles.${user.role}`) })}
        </span>
      </p>
      <Button type="submit" loading={update.isPending} className="self-end">
        {t('save')}
      </Button>
    </form>
  );
}
