import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { User } from '@/features/auth/schemas/auth.schema';
import { useRemoveAvatar, useUploadAvatar } from '@/features/profile/hooks/useProfile';
import { getErrorMessage } from '@/shared/api/api-error';
import { Alert } from '@/shared/components/Alert';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/components/Button';
import { AVATAR_RULES, isValidFile } from '@/shared/lib/file';
import { toastStore } from '@/shared/lib/toast';

/** Props de {@link AvatarForm}. */
type AvatarFormProps = {
  /** Usuário autenticado. */
  user: User;
};

/** Escolha, prévia, envio e remoção da foto de perfil. */
export function AvatarForm({ user }: AvatarFormProps) {
  const { t } = useTranslation(['profile', 'common']);
  const input = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<{ file: File; url: string } | null>(null);
  const [invalid, setInvalid] = useState(false);
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const error = upload.error ?? remove.error;

  useEffect(() => {
    if (!selected) return undefined;
    return () => URL.revokeObjectURL(selected.url);
  }, [selected]);

  function choose(file: File | undefined) {
    upload.reset();
    remove.reset();
    const valid = file !== undefined && isValidFile(file, AVATAR_RULES);
    setInvalid(file !== undefined && !valid);
    setSelected(valid ? { file, url: URL.createObjectURL(file) } : null);
    if (input.current) input.current.value = '';
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <Avatar name={user.name} src={selected?.url ?? user.avatarUrl} className="size-18 text-2xl" />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <div className="flex flex-wrap gap-2">
          <input
            ref={input}
            type="file"
            aria-label={t('photo')}
            accept={AVATAR_RULES.types.join(',')}
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => choose(event.target.files?.[0])}
          />
          <Button
            variant="secondary"
            disabled={upload.isPending}
            onClick={() => input.current?.click()}
          >
            {t('choosePhoto')}
          </Button>
          {selected && (
            <>
              <Button
                loading={upload.isPending}
                onClick={() =>
                  upload.mutate(selected.file, {
                    onSuccess: () => {
                      setSelected(null);
                      toastStore.show(t('photoSaved'));
                    },
                  })
                }
              >
                {t('sendPhoto')}
              </Button>
              <Button
                variant="secondary"
                disabled={upload.isPending}
                onClick={() => choose(undefined)}
              >
                {t('common:cancel')}
              </Button>
            </>
          )}
          {!selected && user.avatarUrl && (
            <Button
              variant="secondary"
              loading={remove.isPending}
              onClick={() =>
                remove.mutate(undefined, { onSuccess: () => toastStore.show(t('photoRemoved')) })
              }
            >
              {t('removePhoto')}
            </Button>
          )}
        </div>
        <p className="text-[13px] text-muted">{t('photoHint')}</p>
        {invalid && <Alert>{t('photoInvalid')}</Alert>}
        {error && <Alert>{getErrorMessage(error)}</Alert>}
      </div>
    </div>
  );
}
