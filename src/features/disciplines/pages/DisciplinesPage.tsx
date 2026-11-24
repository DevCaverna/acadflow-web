import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { DisciplineFormModal } from '@/features/disciplines/components/DisciplineFormModal';
import { DisciplineList } from '@/features/disciplines/components/DisciplineList';
import { Button } from '@/shared/components/Button';
import { Icon } from '@/shared/components/Icon';

/** Página de disciplinas; só o professor cria. */
export function DisciplinesPage() {
  const { t } = useTranslation('disciplines');
  const { role } = useAuthUser();
  const [filters, setFilters] = useState({ search: '', page: 1 });
  const [creating, setCreating] = useState(false);
  const createButton = role === 'PROFESSOR' && (
    <Button icon="plus" onClick={() => setCreating(true)}>
      {t('new')}
    </Button>
  );

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-[32px] leading-10 font-bold">{t('title')}</h1>
        {createButton}
      </header>
      <div className="relative max-w-105">
        <Icon name="search" className="absolute top-3 left-3.5 size-4.5 text-muted" />
        <input
          type="search"
          aria-label={t('search')}
          placeholder={t('search')}
          maxLength={120}
          value={filters.search}
          onChange={(event) => setFilters({ search: event.target.value, page: 1 })}
          className="h-11 w-full rounded-button border border-field bg-surface pr-3.5 pl-10.5 text-[15px]"
        />
      </div>
      <DisciplineList
        search={filters.search.trim()}
        page={filters.page}
        emptyAction={createButton}
        onPageChange={(page) => setFilters({ ...filters, page })}
        onClearSearch={() => setFilters({ search: '', page: 1 })}
      />
      {creating && <DisciplineFormModal onClose={() => setCreating(false)} />}
    </>
  );
}
