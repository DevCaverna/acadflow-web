import type { ComponentProps } from 'react';
import { Icon, type IconName } from '@/shared/components/Icon';
import { cn } from '@/shared/lib/cn';

/** Props de {@link IconButton}. */
type IconButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  /** Ícone exibido. */
  icon: IconName;
  /** Nome acessível do botão. */
  label: string;
};

/** Botão só com ícone. */
export function IconButton({ icon, label, className, ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-button border border-line bg-white text-muted hover:bg-canvas',
        className,
      )}
    >
      <Icon name={icon} className="size-4.5" />
    </button>
  );
}
