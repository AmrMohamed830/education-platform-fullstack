import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 1 minute
        staleTime: 60 * 1000,
        // Cached data is garbage collected after 5 minutes of inactivity
        gcTime: 5 * 60 * 1000,
        // Retry failed requests once before showing error
        retry: 1,
        // Prevent aggressive refetching when window regains focus
        refetchOnWindowFocus: false,
        // Prevent refetch on component remount if data is not stale
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
      dehydrate: {
        // Include pending queries in dehydration for SSR streaming
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always create a new query client
    return makeQueryClient();
  } else {
    // Browser: create client once and reuse singleton across renders
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

