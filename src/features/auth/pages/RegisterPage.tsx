import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { useSession } from '@/features/auth/hooks/useSession';
import { type RegistrationForm, registrationFormSchema } from '@/features/auth/schemas/auth.schema';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { LanguageSelector } from '@/shared/components/LanguageSelector';
import { ROUTES } from '@/shared/config/routes';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

const ROLES = ['ALUNO', 'PROFESSOR'] as const;

export function RegisterPage() {
  const { t } = useTranslation('auth');
  const { token } = useSession();
  const registration = useRegister();
  const roleErrorId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  if (token !== null) return <Navigate to={ROUTES.root} replace />;

  return (
    <AuthLayout>
      <form
        noValidate
        aria-busy={registration.isPending}
        className="flex w-full max-w-100 flex-col gap-5"
        onSubmit={(event) =>
          void handleSubmit(({ name, email, password, role }) => {
            registration.mutate({ name, email, password, role });
          })(event)
        }
      >
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[32px] font-bold">{t('register.title')}</h1>
          <p className="text-[15px] text-muted">{t('register.description')}</p>
        </div>
        {registration.error && <Alert>{getErrorMessage(registration.error)}</Alert>}
        <fieldset
          aria-describedby={errors.role ? roleErrorId : undefined}
          className="flex flex-wrap gap-3"
        >
          <legend className="mb-2 text-sm font-semibold">{t('register.role')}</legend>
          {ROLES.map((role) => (
            <label
              key={role}
              className="inline-flex min-h-11 items-center gap-2 rounded-field border border-field px-3"
            >
              <input
                type="radio"
                value={role}
                aria-invalid={Boolean(errors.role)}
                {...register('role')}
              />
              {t(`register.roles.${role}`)}
            </label>
          ))}
          {errors.role?.message && (
            <p id={roleErrorId} role="alert" className="w-full text-sm text-danger">
              {t(errors.role.message)}
            </p>
          )}
        </fieldset>
        <Field
          label={t('register.name')}
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Field
          label={t('email')}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Field
          label={t('password')}
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Field
          label={t('register.confirmPassword')}
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" loading={registration.isPending} className="h-12 text-base">
          {t('register.title')}
        </Button>
        <Link to={ROUTES.login} className="self-center font-semibold text-primary underline">
          {t('register.backToLogin')}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector className="min-w-0 flex-1" />
          <ThemeToggle />
        </div>
      </form>
    </AuthLayout>
  );
}
