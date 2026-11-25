import { useNavigation } from 'react-router';

/** Barra no topo durante a troca de página. */
export function TopProgress() {
  const { state } = useNavigation();
  if (state !== 'loading') return null;
  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-40 h-1 overflow-hidden bg-primary-soft"
    >
      <div className="top-progress h-1 w-2/5 bg-primary" />
    </div>
  );
}
