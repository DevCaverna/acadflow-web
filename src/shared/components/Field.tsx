import { type ComponentProps, type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/shared/components/Icon';
import { cn } from '@/shared/lib/cn';

/** Props de {@link Field}. */
type FieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  /** Rótulo do campo. */
  label: string;
  /** Chave de tradução do erro. */
  error?: string;
  /**
   * Indica campo opcional no rótulo.
   * @default false
   */
  optional?: boolean;
  /**
   * Usa um campo de várias linhas.
   * @default false
   */
  multiline?: boolean;
  /** Ação exibida dentro do campo, à direita. */
  action?: ReactNode;
};

/** Campo de formulário com rótulo e mensagem de erro acessíveis. */
export function Field({
  label,
  error,
  optional = false,
  multiline = false,
  action,
  className,
  ref,
  ...props
}: FieldProps) {
  const { t } = useTranslation();
  const id = useId();
  const errorId = `${id}-error`;
  const shared = {
    id,
    'aria-invalid': error !== undefined,
    'aria-describedby': error ? errorId : undefined,
    className: cn(
      'w-full rounded-field border border-field bg-surface px-3.5 text-[15px] text-ink read-only:bg-canvas',
      'focus:border-primary focus:ring-3 focus:ring-primary-muted focus:outline-none',
      multiline ? 'min-h-24 py-3' : 'h-11',
      action && 'pr-12',
      error && 'border-danger ring-3 ring-danger-soft',
      className,
    ),
  };
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {optional && <span className="font-normal text-muted"> {t('optional')}</span>}
      </label>
      <div className="relative">
        {multiline ? (
          <textarea {...(props as ComponentProps<'textarea'>)} {...shared} ref={ref as never} />
        ) : (
          <input {...props} {...shared} ref={ref} />
        )}
        {action && <div className="absolute inset-y-0 right-0 flex items-center">{action}</div>}
      </div>
      {error && (
        <span
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-[13px] text-danger"
        >
          <Icon name="alert" className="size-3.5" />
          {t(error)}
        </span>
      )}
    </div>
  );
}
