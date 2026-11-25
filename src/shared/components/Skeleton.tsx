import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';

const ITEMS = [1, 2, 3];

/** Props de {@link SkeletonLine}. */
type SkeletonLineProps = {
  /** Tamanho da linha. */
  className: string;
};

/** Linha com brilho. */
function SkeletonLine({ className }: SkeletonLineProps) {
  return <div className={cn('skeleton-shimmer rounded-field', className)} />;
}

/** Props de {@link Skeleton}. */
type SkeletonProps = {
  /**
   * Formato do conteúdo que vai aparecer.
   * @default 'card'
   */
  variant?: 'card' | 'cards' | 'list' | 'table';
};

/** Espaço reservado enquanto os dados carregam; visível após 300 ms. */
export function Skeleton({ variant = 'card' }: SkeletonProps) {
  const { t } = useTranslation();
  const box = 'rounded-card border border-line bg-surface';
  return (
    <div role="status">
      <span className="sr-only">{t('loading')}</span>
      <div aria-hidden="true" className="skeleton-delay">
        {variant === 'card' && (
          <div className={cn(box, 'flex flex-col gap-3 p-6')}>
            <SkeletonLine className="h-4 w-3/5" />
            <SkeletonLine className="h-3 w-11/12" />
            <SkeletonLine className="h-3 w-2/5" />
          </div>
        )}
        {variant === 'cards' && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-5">
            {ITEMS.map((item) => (
              <div key={item} className={cn(box, 'flex flex-col gap-4 p-5.5')}>
                <SkeletonLine className="h-5 w-1/4" />
                <SkeletonLine className="h-4 w-3/5" />
                <SkeletonLine className="h-3 w-11/12" />
                <SkeletonLine className="h-11 w-full" />
              </div>
            ))}
          </div>
        )}
        {variant === 'list' &&
          ITEMS.map((item) => (
            <div key={item} className="flex items-center gap-3 p-4">
              <SkeletonLine className="size-10 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <SkeletonLine className="h-3.5 w-3/5" />
                <SkeletonLine className="h-3 w-2/5" />
              </div>
            </div>
          ))}
        {variant === 'table' && (
          <div className={cn(box, 'overflow-hidden')}>
            <div className="h-11 bg-canvas" />
            {ITEMS.map((item) => (
              <div key={item} className="flex gap-6 border-t border-subtle p-4">
                <SkeletonLine className="h-4 flex-2" />
                <SkeletonLine className="h-4 flex-1" />
                <SkeletonLine className="h-4 flex-1" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
