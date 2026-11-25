import { useAuthUser } from '@/features/auth/hooks/useAuthUser';
import { useDisciplines } from '@/features/disciplines/hooks/useDisciplines';
import { ProfessorHome } from '@/features/home/components/ProfessorHome';
import { StudentHome } from '@/features/home/components/StudentHome';
import { QueryState } from '@/shared/components/QueryState';

const MAX_DISCIPLINES = 100;

/** Página inicial, conforme o papel. */
export function HomePage() {
  const isProfessor = useAuthUser().role === 'PROFESSOR';
  const query = useDisciplines({ perPage: MAX_DISCIPLINES });
  return (
    <QueryState query={query} errorView="page" skeleton="cards">
      {({ data }) =>
        isProfessor ? <ProfessorHome disciplines={data} /> : <StudentHome disciplines={data} />
      }
    </QueryState>
  );
}
