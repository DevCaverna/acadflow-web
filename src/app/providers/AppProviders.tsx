import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { TIME } from '@/shared/config/time.constants';
import '@/i18n';

/** Props de {@link AppProviders}. */
interface AppProvidersProps {
  /** Conteúdo da aplicação. */
  children: ReactNode;
}

/** Disponibiliza i18n e TanStack Query para a aplicação. */
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: TIME.QUERY_STALE_MS } } }),
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
