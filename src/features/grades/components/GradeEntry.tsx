import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router';
import { useActivities } from '@/features/activities/hooks/useActivities';
import type { Activity } from '@/features/activities/schemas/activity.schema';
import { GradeStatusBadge } from '@/features/grades/components/GradeStatusBadge';
import { useGrades, useSaveGrades } from '@/features/grades/hooks/useGrades';
import { parseGrade } from '@/features/grades/lib/parse-grade';
import type { SaveGradeInput, StudentGrades } from '@/features/grades/schemas/grade.schema';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { EmptyState } from '@/shared/components/EmptyState';
import { Modal } from '@/shared/components/Modal';
import { QueryState } from '@/shared/components/QueryState';
import { cn } from '@/shared/lib/cn';
import { formatGrade } from '@/shared/lib/format';
import { toastStore } from '@/shared/lib/toast';

const FILTERS = ['all', 'RECOVERY', 'NO_GRADES'] as const;

type Filter = (typeof FILTERS)[number];

function getKey({ studentId, activityId }: Pick<SaveGradeInput, 'studentId' | 'activityId'>) {
  return `${studentId}:${activityId}`;
}

/** Props de {@link GradeTable}. */
type GradeTableProps = {
  /** Disciplina das notas. */
  disciplineId: string;
  /** Atividades da disciplina. */
  activities: Activity[];
  /** Alunos com notas, média e situação. */
  students: StudentGrades[];
};

/** Tabela editável de notas; envia só as alteradas. */
function GradeTable({ disciplineId, activities, students }: GradeTableProps) {
  const { t, i18n } = useTranslation('grades');
  const unsavedId = useId();
  const save = useSaveGrades(disciplineId);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<Filter>('all');

  const saved = new Map(
    students.flatMap(({ student, grades }) =>
      grades.map(({ activityId, value }) => [getKey({ studentId: student.id, activityId }), value]),
    ),
  );

  function getError(key: string): string | undefined {
    const text = edits[key];
    if (text === undefined) return undefined;
    if (text.trim() === '') return saved.has(key) ? t('cannotClear') : undefined;
    return parseGrade(text) === undefined ? t('invalid') : undefined;
  }

  function hasChange(key: string): boolean {
    const text = edits[key];
    if (text === undefined) return false;
    if (text.trim() === '') return saved.has(key);
    const value = parseGrade(text);
    return value === undefined || value !== saved.get(key);
  }

  const changes = Object.entries(edits).filter(([key]) => hasChange(key));
  const hasUnsaved = changes.length > 0 && !save.isPending;
  const blocker = useBlocker(hasUnsaved);

  useEffect(() => {
    if (!hasUnsaved) return undefined;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsaved]);
  const invalidKeys = changes.map(([key]) => key).filter((key) => getError(key) !== undefined);
  const hasErrors = invalidKeys.length > 0;
  const visible = students.filter(
    ({ student, status }) =>
      filter === 'all' ||
      status === filter ||
      changes.some(([key]) => key.startsWith(`${student.id}:`)),
  );

  function submit() {
    const inputs = changes.flatMap(([key, text]): SaveGradeInput[] => {
      const [studentId = '', activityId = ''] = key.split(':');
      const value = parseGrade(text);
      return value === undefined ? [] : [{ studentId, activityId, value }];
    });
    save.mutate(inputs, {
      onSuccess: (failed) => {
        if (failed.length === 0) toastStore.show(t('saved'), t('savedHint'));
        else toastStore.show(t('saveFailed'), t('saveFailedHint'), 'error');
        const keys = new Set(failed.map(getKey));
        setEdits((current) =>
          Object.fromEntries(Object.entries(current).filter(([key]) => keys.has(key))),
        );
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {save.data && save.data.length > 0 && (
        <Alert>{t('failed', { count: save.data.length })}</Alert>
      )}
      {invalidKeys.length > 0 && (
        <Alert>
          <span className="flex flex-wrap items-center justify-between gap-3">
            <b>{t('invalidCount', { count: invalidKeys.length })}</b>
            <a href={`#${invalidKeys[0]}`} className="font-semibold underline">
              {t('goToField')}
            </a>
          </span>
        </Alert>
      )}
      <label className="flex items-center gap-3 self-end text-sm text-muted">
        {t('filter')}
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as Filter)}
          className="h-11 rounded-button border border-field bg-surface px-3 text-[15px] text-ink"
        >
          {FILTERS.map((option) => (
            <option key={option} value={option}>
              {t(`filters.${option}`)}
            </option>
          ))}
        </select>
      </label>
      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-canvas text-left text-xs text-muted">
            <tr>
              <th scope="col" className="p-4">
                {t('student')}
              </th>
              {activities.map(({ id, title }) => (
                <th key={id} scope="col" className="max-w-40 p-3 text-center wrap-anywhere">
                  {title}
                </th>
              ))}
              <th scope="col" className="p-3 text-center">
                {t('partialAverage')}
              </th>
              <th scope="col" className="p-4">
                {t('partialStatus')}
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={activities.length + 3} className="p-5 text-muted">
                  {t('noMatch')}
                </td>
              </tr>
            )}
            {visible.map(({ student, average, status }) => (
              <tr key={student.id} className="border-t border-line">
                <th scope="row" className="p-4 text-left font-semibold">
                  {student.name}
                </th>
                {activities.map((activity) => {
                  const key = getKey({ studentId: student.id, activityId: activity.id });
                  const value = saved.get(key);
                  const error = getError(key);
                  return (
                    <td key={activity.id} className="p-3 text-center align-top">
                      <input
                        id={key}
                        inputMode="decimal"
                        placeholder="—"
                        disabled={save.isPending}
                        aria-label={t('gradeOf', {
                          student: student.name,
                          activity: activity.title,
                        })}
                        aria-invalid={error !== undefined}
                        aria-describedby={error ? `${key}-error` : undefined}
                        value={
                          edits[key] ??
                          (value === undefined ? '' : formatGrade(value, i18n.language))
                        }
                        onChange={(event) => setEdits({ ...edits, [key]: event.target.value })}
                        className={cn(
                          'h-10 w-18 rounded-field border border-field text-center font-semibold',
                          hasChange(key) && 'border-2 border-accent bg-warning-soft',
                          error && 'border-danger bg-danger-soft',
                        )}
                      />
                      {error && (
                        <span id={`${key}-error`} className="mt-1 block text-xs text-danger">
                          {error}
                        </span>
                      )}
                    </td>
                  );
                })}
                <td className="p-3 text-center font-display text-lg font-bold">
                  {average === null ? '—' : formatGrade(average, i18n.language)}
                </td>
                <td className="p-4">
                  <GradeStatusBadge status={status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted">{t('rule')}</p>
      {changes.length > 0 && (
        <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-card bg-inverse px-5 py-3 text-white">
          <span role="status">{t('pending', { count: changes.length })}</span>
          <div className="flex gap-3">
            <Button variant="secondary" disabled={save.isPending} onClick={() => setEdits({})}>
              {t('discard')}
            </Button>
            <Button disabled={hasErrors} loading={save.isPending} onClick={submit}>
              {t('save')}
            </Button>
          </div>
        </div>
      )}
      {blocker.state === 'blocked' && (
        <Modal
          role="alertdialog"
          describedBy={unsavedId}
          title={t('unsavedTitle')}
          onClose={() => blocker.reset()}
        >
          <div id={unsavedId} className="p-6">
            <Alert variant="warning">{t('unsavedText')}</Alert>
          </div>
          <footer className="flex justify-end gap-3 border-t border-line px-6 py-4">
            <Button variant="secondary" onClick={() => blocker.reset()}>
              {t('stay')}
            </Button>
            <Button variant="danger" onClick={() => blocker.proceed()}>
              {t('leaveWithoutSaving')}
            </Button>
          </footer>
        </Modal>
      )}
    </div>
  );
}

/** Props de {@link GradeEntry}. */
type GradeEntryProps = {
  /** Disciplina das notas. */
  disciplineId: string;
};

/** Lançamento de notas pelo professor. */
export function GradeEntry({ disciplineId }: GradeEntryProps) {
  const { t } = useTranslation(['disciplines', 'activities']);
  const activities = useActivities(disciplineId);
  const grades = useGrades(disciplineId);
  return (
    <QueryState query={activities} skeleton="table">
      {(activityData) => (
        <QueryState query={grades} skeleton="table">
          {(students) => {
            if (activityData.length === 0) {
              return (
                <EmptyState
                  icon="activities"
                  title={t('activities:emptyTitle')}
                  text={t('activities:emptyHint')}
                />
              );
            }
            if (students.length === 0) {
              return <EmptyState icon="grades" title={t('noStudents')} />;
            }
            return (
              <GradeTable
                disciplineId={disciplineId}
                activities={activityData}
                students={students}
              />
            );
          }}
        </QueryState>
      )}
    </QueryState>
  );
}
