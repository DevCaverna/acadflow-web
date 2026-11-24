import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { SessionExpiredDialog } from '@/features/auth/components/SessionExpiredDialog';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useSession } from '@/features/auth/hooks/useSession';
import { type LoginInput, loginFormSchema } from '@/features/auth/schemas/auth.schema';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { Icon } from '@/shared/components/Icon';
import { LanguageSelector } from '@/shared/components/LanguageSelector';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

const FEATURES = ['disciplines', 'grades', 'access'] as const;

/** Tela de login. */
export function LoginPage() {
  const { t } = useTranslation(['auth', 'common']);
  const { token, expired } = useSession();
  const login = useLogin();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { register, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  if (token !== null) return <Navigate to="/" replace />;

  const passwordLabel = passwordVisible ? t('hidePassword') : t('showPassword');
  return (
    <div className="flex min-h-screen flex-col bg-surface md:flex-row">
      <section className="flex flex-1 flex-col justify-between gap-8 bg-primary p-6 text-white md:gap-12 md:p-14">
        <span className="flex items-center gap-3 font-display text-2xl font-bold tracking-tight">
          <img src="/icons/icon-light.svg" alt="" width={48} height={48} />
          {t('common:appName')}
        </span>
        <div className="flex max-w-130 flex-col gap-5">
          <p className="font-display text-3xl leading-[1.08] font-bold tracking-tight md:text-5xl">
            {t('headline')}
          </p>
          <p className="text-white/85 md:text-[17px]">{t('intro')}</p>
        </div>
        <ul className="flex flex-col gap-3.5 max-md:hidden">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-[15px]">
              <Icon name="check" className="text-accent" />
              {t(`features.${feature}`)}
            </li>
          ))}
        </ul>
      </section>
      <main className="flex flex-1 items-center justify-center px-6 py-10 md:py-14">
        <form
          noValidate
          aria-busy={login.isPending}
          className="flex w-full max-w-100 flex-col gap-6"
          onSubmit={(event) => void handleSubmit((input) => login.mutate(input))(event)}
        >
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-[32px] font-bold">{t('signIn')}</h1>
            <p className="text-[15px] text-muted">{t('hint')}</p>
          </div>
          {login.error && <Alert>{getErrorMessage(login.error)}</Alert>}
          <Field
            label={t('email')}
            type="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            className="h-12"
            error={formState.errors.email?.message}
            {...register('email')}
          />
          <Field
            label={t('password')}
            type={passwordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('passwordPlaceholder')}
            className="h-12"
            error={formState.errors.password?.message}
            action={
              <button
                type="button"
                aria-label={passwordLabel}
                className="inline-flex size-11 items-center justify-center text-muted"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                <Icon name={passwordVisible ? 'eyeOff' : 'eye'} />
              </button>
            }
            {...register('password')}
          />
          <Button type="submit" loading={login.isPending} className="h-12 text-base">
            {t('signIn')}
          </Button>
          <div className="flex items-center gap-2">
            <LanguageSelector className="min-w-0 flex-1" />
            <ThemeToggle />
          </div>
        </form>
      </main>
      {expired && <SessionExpiredDialog />}
    </div>
  );
}
