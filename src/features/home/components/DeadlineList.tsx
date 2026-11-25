import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAreaRoutes } from '@/features/auth/hooks/useAreaRoutes';
import type { Deadline } from '@/features/home/lib/home';
import { formatDate } from '@/shared/lib/format';

/** Props de {@link DeadlineList}. */
type DeadlineListProps = {
  /** Título da lista. */
  title: string;
  /** Prazos, do mais próximo ao mais distante. */
  deadlines: readonly Deadline[];
};

/** Próximos prazos, com link para a disciplina. */
export function DeadlineList({ title, deadlines }: DeadlineListProps) {
  const { t, i18n } = useTranslation('home');
  const area = useAreaRoutes();
  return (
    <section className="min-w-0 flex-1 basis-95 overflow-hidden rounded-panel border border-line bg-surface">
      <h2 className="border-b border-line px-6 py-5 font-display text-xl font-semibold">{title}</h2>
      {deadlines.length === 0 ? (
        <p className="px-6 py-5 text-sm text-muted">{t('noDeadlines')}</p>
      ) : (
        <ul>
          {deadlines.map(({ activity, discipline, time }) => (
            <li key={activity.id} className="border-b border-subtle last:border-0">
              <Link
                to={area.discipline(discipline.id)}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-canvas"
              >
                <span className="w-16 shrink-0 text-[13px] font-semibold text-warning">
                  {formatDate(time, i18n.language, { day: '2-digit', month: 'short' })}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold wrap-anywhere">{activity.title}</span>
                  <span className="text-[13px] text-muted wrap-anywhere">{discipline.name}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
