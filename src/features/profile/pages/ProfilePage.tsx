import { useTranslation } from 'react-i18next';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { PasswordForm } from '@/features/profile/components/PasswordForm';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { Avatar } from '@/shared/components/Avatar';

/** Perfil do usuário autenticado. */
export function ProfilePage() {
  const { t } = useTranslation(['profile', 'common']);
  const user = useAuthUser();
  return (
    <div className="flex max-w-190 flex-col gap-6">
      <h1 className="font-display text-[32px] leading-10 font-bold">{t('title')}</h1>
      <section className="rounded-panel border border-line bg-white">
        <div className="flex items-center gap-5 border-b border-line p-6">
          <Avatar name={user.name} />
          <div className="flex min-w-0 flex-col items-start gap-1.5">
            <p className="text-xl font-semibold wrap-anywhere">{user.name}</p>
            <span className="rounded-field bg-primary-muted px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-primary-active uppercase">
              {t(`common:roles.${user.role}`)}
            </span>
          </div>
        </div>
        <ProfileForm user={user} />
      </section>
      <PasswordForm />
    </div>
  );
}
