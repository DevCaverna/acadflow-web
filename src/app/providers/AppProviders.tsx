import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { TIME } from '@/shared/config/time.constants';
import { isAxiosError } from 'axios';
import '@/i18n';

const MAX_NETWORK_RETRIES = 2;

function shouldRetry(failures: number, error: Error): boolean {
  return isAxiosError(error) && !error.response && failures < MAX_NETWORK_RETRIES;
}

/** Props de {@link AppProviders}. */
interface AppProvidersProps {
  /** Conteúdo da aplicação. */
  children: ReactNode;
}

/** Disponibiliza i18n e TanStack Query para a aplicação. */
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: TIME.QUERY_STALE_MS, retry: shouldRetry } },
      }),
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
