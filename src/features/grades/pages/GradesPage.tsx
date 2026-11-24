import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { useDisciplines } from '@/features/disciplines/hooks/useDisciplines';
import { GradeEntry } from '@/features/grades/components/GradeEntry';
import { MyGrades } from '@/features/grades/components/MyGrades';
import { EmptyState } from '@/shared/components/EmptyState';
import { QueryState } from '@/shared/components/QueryState';
import { cn } from '@/shared/lib/cn';

const MAX_DISCIPLINES = 100;

/** Notas: lançamento para o professor e consulta para o aluno. */
export function GradesPage() {
  const { t } = useTranslation(['grades', 'disciplines']);
  const isProfessor = useAuthUser().role === 'PROFESSOR';
  const [params, setParams] = useSearchParams();
  const query = useDisciplines({ perPage: MAX_DISCIPLINES });
  return (
    <>
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-[32px] leading-10 font-bold">
          {isProfessor ? t('entryTitle') : t('mineTitle')}
        </h1>
        {isProfessor && <p className="text-sm text-muted">{t('tableHint')}</p>}
      </header>
      <QueryState query={query}>
        {({ data }) => {
          const selected = data.find(({ id }) => id === params.get('discipline')) ?? data[0];
          if (selected === undefined) {
            return (
              <EmptyState
                icon="disciplines"
                title={t('disciplines:emptyTitle')}
                text={t('disciplines:empty')}
              />
            );
          }
          return (
            <>
              <div role="group" aria-label={t('discipline')} className="flex flex-wrap gap-2">
                {data.map(({ id, name }) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={id === selected.id}
                    onClick={() => setParams({ discipline: id })}
                    className={cn(
                      'min-h-10 rounded-full border border-field bg-surface px-4 py-1 text-sm font-semibold wrap-anywhere',
                      id === selected.id && 'border-inverse bg-inverse text-white',
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {isProfessor ? (
                <GradeEntry key={selected.id} disciplineId={selected.id} />
              ) : (
                <MyGrades key={selected.id} discipline={selected} />
              )}
            </>
          );
        }}
      </QueryState>
    </>
  );
}
