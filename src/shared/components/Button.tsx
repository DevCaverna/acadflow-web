import type { ComponentProps } from 'react';
import { Icon, type IconName } from '@/shared/components/Icon';
import { cn } from '@/shared/lib/cn';

const VARIANTS = {
  primary: 'bg-primary text-white enabled:hover:bg-primary-hover enabled:active:bg-primary-active',
  secondary: 'border border-field bg-surface text-ink enabled:hover:bg-canvas',
  danger: 'bg-danger-fill text-white enabled:hover:bg-danger-hover',
};

/** Props de {@link Button}. */
type ButtonProps = ComponentProps<'button'> & {
  /**
   * Aparência do botão.
   * @default 'primary'
   */
  variant?: keyof typeof VARIANTS;
  /** Ícone antes do texto. */
  icon?: IconName;
  /**
   * Indica ação em andamento e desabilita o botão.
   * @default false
   */
  loading?: boolean;
};

/** Botão padrão, com variantes, ícone e estado de carregamento. */
export function Button({
  variant = 'primary',
  icon,
  loading = false,
  type = 'button',
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const iconName = loading ? 'spinner' : icon;
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-button px-4.5 text-[15px] font-semibold',
        VARIANTS[variant],
        disabled && 'bg-line text-muted',
        loading && 'opacity-85',
        className,
      )}
    >
      {iconName && <Icon name={iconName} className="size-4.5" />}
      {children}
    </button>
  );
}
