import { QueryClient } from '@tanstack/react-query';
import { apiCall } from './api';

export { getApiUrl } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => apiCall(String(queryKey[0])),
      staleTime: 1000 * 60,
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status === 401 || status === 403 || status === 404) return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export { apiCall as apiRequest } from './api';
